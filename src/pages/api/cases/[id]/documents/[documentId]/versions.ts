import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { authorization } = req.headers;
  const { id: caseId, documentId } = req.query;

  if (!authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    );

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify document access
    const { data: document } = await supabase
      .from('documents')
      .select(`
        *,
        cases!inner (
          user_id,
          case_participants (user_id)
        )
      `)
      .eq('id', documentId)
      .single();

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const hasAccess = 
      document.user_id === user.id || 
      document.cases.user_id === user.id || 
      document.cases.case_participants.some((p: any) => p.user_id === user.id);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    switch (req.method) {
      case 'GET':
        const { data: versions, error: getError } = await supabase
          .from('document_versions')
          .select(`
            *,
            users (email, full_name)
          `)
          .eq('document_id', documentId)
          .order('version_number', { ascending: false });

        if (getError) {
          throw getError;
        }

        return res.status(200).json(versions);

      case 'POST':
        const { content, file_type, comment } = req.body;

        // Get latest version number
        const { data: latestVersion } = await supabase
          .from('document_versions')
          .select('version_number')
          .eq('document_id', documentId)
          .order('version_number', { ascending: false })
          .limit(1)
          .single();

        const nextVersion = latestVersion ? latestVersion.version_number + 1 : 1;

        // Upload new version to storage
        const fileName = `${caseId}/${documentId}/v${nextVersion}-${Date.now()}`;
        const { data: fileData, error: uploadError } = await supabase
          .storage
          .from('legal-documents')
          .upload(fileName, Buffer.from(content, 'base64'), {
            contentType: file_type,
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        // Create version record
        const { data: newVersion, error: createError } = await supabase
          .from('document_versions')
          .insert({
            document_id: documentId,
            version_number: nextVersion,
            file_path: fileData.path,
            created_by: user.id,
            comment: comment || null
          })
          .single();

        if (createError) {
          throw createError;
        }

        return res.status(201).json(newVersion);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
