import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { authorization } = req.headers;

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
        const { data: profile, error: getError } = await supabase
          .from('users')
          .select(`
            *,
            cases (count),
            case_participants (count)
          `)
          .eq('id', user.id)
          .single();

        if (getError) {
          throw getError;
        }

        return res.status(200).json(profile);

      case 'PATCH':
        const {
          full_name,
          title,
          phone_number,
          bar_number,
          organization,
          preferences
        } = req.body;

        const { data: updatedProfile, error: updateError } = await supabase
          .from('users')
          .update({
            full_name,
            title,
            phone_number,
            bar_number,
            organization,
            preferences,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .single();

        if (updateError) {
          throw updateError;
        }

        return res.status(200).json(updatedProfile);

      default:
        res.setHeader('Allow', ['GET', 'PATCH']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
