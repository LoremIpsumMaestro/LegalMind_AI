import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Case } from '@/types/database.types';

export function useCase(caseId: string) {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCase = async () => {
    if (!user || !caseId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/cases/${caseId}`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch case');
      }

      const data = await response.json();
      setCaseData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCase = async (updates: Partial<Case>) => {
    if (!user || !caseId) return null;

    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update case');
      }

      const updatedCase = await response.json();
      setCaseData(updatedCase);
      return updatedCase;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const deleteCase = async () => {
    if (!user || !caseId) return false;

    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete case');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    if (user && caseId) {
      fetchCase();
    }
  }, [user, caseId]);

  return {
    caseData,
    loading,
    error,
    fetchCase,
    updateCase,
    deleteCase
  };
}
