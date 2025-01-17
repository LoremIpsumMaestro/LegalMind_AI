import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { authorization } = req.headers;
  const { id: caseId, noteId } = req.query;

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

    // Verify note ownership or case access
    const { data: note } = await supabase
      .from('case_notes')
      .select(`
        *,
        cases!inner (user_id, case_participants (user_id))
      `)
      .eq('id', noteId)
      .single();

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const hasAccess = 
      note.user_id === user.id || 
      note.cases.user_id === user.id || 
      note.cases.case_participants.some((p: any) => p.user_id === user.id);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    switch (req.method) {
      case 'PATCH':
        // Only note creator can update
        if (note.user_id !== user.id) {
          return res.status(403).json({ error: 'Only note creator can update' });
        }

        const { content, is_private } = req.body;
        const { data: updatedNote, error: updateError } = await supabase
          .from('case_notes')
          .update({ content, is_private })
          .eq('id', noteId)
          .single();

        if (updateError) {
          throw updateError;
        }

        return res.status(200).json(updatedNote);

      case 'DELETE':
        // Only note creator or case owner can delete
        if (note.user_id !== user.id && note.cases.user_id !== user.id) {
          return res.status(403).json({ error: 'Insufficient permissions to delete' });
        }

        const { error: deleteError } = await supabase
          .from('case_notes')
          .delete()
          .eq('id', noteId);

        if (deleteError) {
          throw deleteError;
        }

        return res.status(204).end();

      default:
        res.setHeader('Allow', ['PATCH', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
