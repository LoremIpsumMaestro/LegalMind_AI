import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { authorization } = req.headers;
  const { id: caseId, participantId } = req.query;

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
      case 'DELETE':
        // Verify participant exists
        const { data: participant } = await supabase
          .from('case_participants')
          .select('id')
          .eq('id', participantId)
          .eq('case_id', caseId)
          .single();

        if (!participant) {
          return res.status(404).json({ error: 'Participant not found' });
        }

        // Remove participant
        const { error: deleteError } = await supabase
          .from('case_participants')
          .delete()
          .eq('id', participantId);

        if (deleteError) {
          throw deleteError;
        }

        return res.status(204).end();

      case 'PATCH':
        const { role } = req.body;

        // Verify participant exists
        const { data: existingParticipant } = await supabase
          .from('case_participants')
          .select('id')
          .eq('id', participantId)
          .eq('case_id', caseId)
          .single();

        if (!existingParticipant) {
          return res.status(404).json({ error: 'Participant not found' });
        }

        // Update participant role
        const { data: updatedParticipant, error: updateError } = await supabase
          .from('case_participants')
          .update({ role })
          .eq('id', participantId)
          .single();

        if (updateError) {
          throw updateError;
        }

        return res.status(200).json(updatedParticipant);

      default:
        res.setHeader('Allow', ['DELETE', 'PATCH']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
