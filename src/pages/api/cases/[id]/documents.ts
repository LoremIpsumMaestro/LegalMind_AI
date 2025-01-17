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
  const { id: caseId } = req.query;

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

    // Verify case access
    const { data: caseAccess } = await supabase
      .from('cases')
      .select(`
        user_id,
        case_participants!inner (user_id)
      `)
      .eq('id', caseId)
      .single();

    if (!caseAccess || (caseAccess.user_id !== user.id && 
        !caseAccess.case_participants.some(p => p.user_id === user.id))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    switch (req.method) {
      case 'GET':
        const { data: documents, error: getDocsError } = await supabase
          .from('documents')
          .select('*')
          .eq('case_id', caseId)
          .order('created_at', { ascending: false });

        if (getDocsError) {
          throw getDocsError;
        }

        return res.status(200).json(documents);

      case 'POST':
        const { title, document_type, content, file_type } = req.body;

        // Upload file to Supabase Storage
        const fileName = `${caseId}/${Date.now()}-${title.replace(/\s+/g, '-')}`;
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

        // Create document record
        const { data: newDoc, error: createError } = await supabase
          .from('documents')
          .insert({
            case_id: caseId,
            user_id: user.id,
            title,
            document_type,
            status: 'draft',
            file_path: fileData.path
          })
          .single();

        if (createError) {
          throw createError;
        }

        return res.status(201).json(newDoc);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
