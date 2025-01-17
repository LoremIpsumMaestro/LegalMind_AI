import { useState } from 'react';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  title: string | null;
  phone_number: string | null;
  bar_number: string | null;
  organization: string | null;
  role: string;
  preferences: Record<string, any>;
  cases_count: number;
  case_participants_count: number;
  created_at: string;
  updated_at: string | null;
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      setError(null);

      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updatePreferences = async (preferences: Record<string, any>) => {
    if (!profile) return;

    const updatedPreferences = {
      ...profile.preferences,
      ...preferences
    };

    return updateProfile({ preferences: updatedPreferences });
  };

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updatePreferences
  };
}
