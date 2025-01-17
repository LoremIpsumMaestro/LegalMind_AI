import 'next-auth';
import { User as SupabaseUser } from '@supabase/supabase-js';

declare module 'next-auth' {
  interface Session {
    user: SupabaseUser;
  }
}
