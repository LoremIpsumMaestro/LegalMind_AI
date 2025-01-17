import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Case } from '@/types/database.types';

export function useCases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCases = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/cases', {
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cases');
      }

      const data = await response.json();
      setCases(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCase = async (caseData: Partial<Case>) => {
    if (!user) return null;

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(caseData)
      });

      if (!response.ok) {
        throw new Error('Failed to create case');
      }

      const newCase = await response.json();
      setCases(prev => [newCase, ...prev]);
      return newCase;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchCases();
    }
  }, [user]);

  return {
    cases,
    loading,
    error,
    fetchCases,
    createCase
  };
}
