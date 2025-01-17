import { useState } from 'react';
import { useAuth } from './useAuth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Document {
  id: string;
  title: string;
  document_type: string;
  status: string;
  created_at: string;
  file_path: string;
}

export function useDocuments(caseId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const uploadDocument = async (data: {
    title: string;
    document_type: string;
    content: string;
    file_type: string;
  }) => {
    if (!user || !caseId) return;

    try {
      setIsUploading(true);
      const response = await fetch(`/api/cases/${caseId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const viewDocument = async (document: Document) => {
    if (!user || !caseId) return;

    try {
      const { data, error } = await supabase
        .storage
        .from('legal-documents')
        .createSignedUrl(document.file_path, 60); // 60 seconds signed URL

      if (error) {
        throw error;
      }

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      throw error;
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!user || !caseId) return;

    try {
      const response = await fetch(`/api/cases/${caseId}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  return {
    isUploading,
    uploadDocument,
    viewDocument,
    deleteDocument
  };
}
