import { PostgrestError } from '@supabase/supabase-js'

export type UserRole = 'admin' | 'attorney' | 'paralegal' | 'client'
export type CaseStatus = 'active' | 'pending' | 'closed' | 'archived'
export type DocumentStatus = 'draft' | 'review' | 'final' | 'archived'
export type ParticipantRole = 'lead_attorney' | 'associate_attorney' | 'paralegal' | 'client' | 'expert'

export interface User {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  last_login: string | null
  preferences: Record<string, any>
}

[...rest of the types file...]