import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

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

    // Get document with case info
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

    // Verify access
    const hasAccess = 
      document.user_id === user.id || 
      document.cases.user_id === user.id || 
      document.cases.case_participants.some((p: any) => p.user_id === user.id);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    switch (req.method) {
      case 'GET':
        // Get signed URL for document
        const { data: urlData, error: urlError } = await supabase
          .storage
          .from('legal-documents')
          .createSignedUrl(document.file_path, 60);

        if (urlError) {
          throw urlError;
        }

        return res.status(200).json({ url: urlData.signedUrl });

      case 'DELETE':
        // Only document creator or case owner can delete
        if (document.user_id !== user.id && document.cases.user_id !== user.id) {
          return res.status(403).json({ error: 'Insufficient permissions to delete' });
        }

        // Delete file from storage
        const { error: storageError } = await supabase
          .storage
          .from('legal-documents')
          .remove([document.file_path]);

        if (storageError) {
          throw storageError;
        }

        // Delete document record
        const { error: deleteError } = await supabase
          .from('documents')
          .delete()
          .eq('id', documentId);

        if (deleteError) {
          throw deleteError;
        }

        return res.status(204).end();

      case 'PATCH':
        // Only document creator can update
        if (document.user_id !== user.id) {
          return res.status(403).json({ error: 'Only document creator can update' });
        }

        const { title, document_type, status } = req.body;
        const { data: updatedDoc, error: updateError } = await supabase
          .from('documents')
          .update({
            title,
            document_type,
            status,
            updated_at: new Date().toISOString()
          })
          .eq('id', documentId)
          .single();

        if (updateError) {
          throw updateError;
        }

        return res.status(200).json(updatedDoc);

      default:
        res.setHeader('Allow', ['GET', 'DELETE', 'PATCH']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
