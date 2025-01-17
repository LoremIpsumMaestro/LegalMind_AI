import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

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
        const { data: notes, error: getNotesError } = await supabase
          .from('case_notes')
          .select('*')
          .eq('case_id', caseId)
          .order('created_at', { ascending: false });

        if (getNotesError) {
          throw getNotesError;
        }

        return res.status(200).json(notes);

      case 'POST':
        const { content, is_private = false } = req.body;

        const { data: newNote, error: createError } = await supabase
          .from('case_notes')
          .insert({
            case_id: caseId,
            user_id: user.id,
            content,
            is_private
          })
          .single();

        if (createError) {
          throw createError;
        }

        return res.status(201).json(newNote);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
