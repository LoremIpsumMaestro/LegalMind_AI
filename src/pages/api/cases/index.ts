import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify authentication
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(authorization.replace('Bearer ', ''));
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    switch (req.method) {
      case 'GET':
        const { data: cases, error: getCasesError } = await supabase
          .from('cases')
          .select(`
            *,
            documents (count),
            case_participants (count)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (getCasesError) {
          throw getCasesError;
        }

        return res.status(200).json(cases);

      case 'POST':
        const { title, description, case_number } = req.body;
        
        const { data: newCase, error: createError } = await supabase
          .from('cases')
          .insert({
            title,
            description,
            case_number,
            user_id: user.id,
            status: 'active'
          })
          .single();

        if (createError) {
          throw createError;
        }

        return res.status(201).json(newCase);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
