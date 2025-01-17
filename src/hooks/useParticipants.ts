import { useState } from 'react';
import { useAuth } from './useAuth';
import { Participant } from '@/components/cases/ParticipantList';

export function useParticipants(caseId: string) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const addParticipant = async (data: { email: string; role: string }) => {
    if (!user || !caseId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/cases/${caseId}/participants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add participant');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeParticipant = async (participantId: string) => {
    if (!user || !caseId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/cases/${caseId}/participants/${participantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove participant');
      }

      return true;
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    addParticipant,
    removeParticipant
  };
}
