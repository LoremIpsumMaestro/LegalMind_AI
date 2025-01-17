import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { authorization } = req.headers;
  const { id } = req.query;

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

    switch (req.method) {
      case 'GET':
        // Fetch case with related data
        const { data: caseData, error: getCaseError } = await supabase
          .from('cases')
          .select(`
            *,
            documents (id, title, document_type, status, created_at),
            case_participants (id, user_id, role),
            case_notes (id, content, created_at, is_private)
          `)
          .eq('id', id)
          .single();

        if (getCaseError) {
          throw getCaseError;
        }

        // Verify user has access to this case
        if (caseData.user_id !== user.id && 
            !caseData.case_participants.some(p => p.user_id === user.id)) {
          return res.status(403).json({ error: 'Access denied' });
        }

        return res.status(200).json(caseData);

      case 'PATCH':
        // Verify user is case owner
        const { data: existingCase } = await supabase
          .from('cases')
          .select('user_id')
          .eq('id', id)
          .single();

        if (existingCase?.user_id !== user.id) {
          return res.status(403).json({ error: 'Only case owner can update case' });
        }

        const { title, description, status } = req.body;
        const { data: updatedCase, error: updateError } = await supabase
          .from('cases')
          .update({
            title,
            description,
            status,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .single();

        if (updateError) {
          throw updateError;
        }

        return res.status(200).json(updatedCase);

      case 'DELETE':
        // Verify user is case owner
        const { data: caseToDelete } = await supabase
          .from('cases')
          .select('user_id')
          .eq('id', id)
          .single();

        if (caseToDelete?.user_id !== user.id) {
          return res.status(403).json({ error: 'Only case owner can delete case' });
        }

        const { error: deleteError } = await supabase
          .from('cases')
          .delete()
          .eq('id', id);

        if (deleteError) {
          throw deleteError;
        }

        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
