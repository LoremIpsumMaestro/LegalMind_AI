import { useState } from 'react';
import { useAuth } from './useAuth';
import { createClient } from '@supabase/supabase-js';
import { DocumentVersion } from '@/components/documents/DocumentVersions';

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
  versions?: DocumentVersion[];
}

export function useDocuments(caseId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
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
        .createSignedUrl(document.file_path, 60);

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

  const fetchVersions = async (documentId: string) => {
    if (!user || !caseId) return;

    try {
      const response = await fetch(`/api/cases/${caseId}/documents/${documentId}/versions`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch versions');
      }

      const data = await response.json();
      setVersions(data);
      return data;
    } catch (error) {
      console.error('Error fetching versions:', error);
      throw error;
    }
  };

  const uploadVersion = async (documentId: string, data: {
    content: string;
    file_type: string;
    comment?: string;
  }) => {
    if (!user || !caseId) return;

    try {
      const response = await fetch(`/api/cases/${caseId}/documents/${documentId}/versions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to upload version');
      }

      const newVersion = await response.json();
      setVersions(prev => [newVersion, ...prev]);
      return newVersion;
    } catch (error) {
      console.error('Error uploading version:', error);
      throw error;
    }
  };

  const viewVersion = async (version: DocumentVersion) => {
    if (!user || !caseId) return;

    try {
      const { data, error } = await supabase
        .storage
        .from('legal-documents')
        .createSignedUrl(version.file_path, 60);

      if (error) {
        throw error;
      }

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing version:', error);
      throw error;
    }
  };

  return {
    isUploading,
    versions,
    uploadDocument,
    viewDocument,
    fetchVersions,
    uploadVersion,
    viewVersion
  };
}
