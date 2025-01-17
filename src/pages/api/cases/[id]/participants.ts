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

    // Verify case ownership
    const { data: caseData } = await supabase
      .from('cases')
      .select('user_id')
      .eq('id', caseId)
      .single();

    if (!caseData || caseData.user_id !== user.id) {
      return res.status(403).json({ error: 'Only case owner can manage participants' });
    }

    switch (req.method) {
      case 'GET':
        const { data: participants, error: getError } = await supabase
          .from('case_participants')
          .select(`
            id,
            role,
            added_at,
            users (id, email, full_name)
          `)
          .eq('case_id', caseId);

        if (getError) {
          throw getError;
        }

        return res.status(200).json(participants);

      case 'POST':
        const { email, role } = req.body;

        // Find user by email
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (userError || !userData) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Check if user is already a participant
        const { data: existingParticipant } = await supabase
          .from('case_participants')
          .select('id')
          .eq('case_id', caseId)
          .eq('user_id', userData.id)
          .single();

        if (existingParticipant) {
          return res.status(400).json({ error: 'User is already a participant' });
        }

        // Add participant
        const { data: newParticipant, error: createError } = await supabase
          .from('case_participants')
          .insert({
            case_id: caseId,
            user_id: userData.id,
            role: role
          })
          .single();

        if (createError) {
          throw createError;
        }

        return res.status(201).json(newParticipant);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
