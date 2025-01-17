import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentUpload } from './DocumentUpload';
import { DocumentVersions } from './DocumentVersions';
import { DocumentSearch, DocumentFilters } from './DocumentSearch';
import { Document } from '@/hooks/useDocuments';

interface DocumentListProps {
  documents: Document[];
  onUpload: (data: any) => Promise<void>;
  onView: (document: Document) => void;
  onFetchVersions: (documentId: string) => Promise<void>;
  onUploadVersion: (documentId: string, data: any) => Promise<void>;
  onViewVersion: (version: any) => void;
  versions: any[];
}

export function DocumentList({
  documents,
  onUpload,
  onView,
  onFetchVersions,
  onUploadVersion,
  onViewVersion,
  versions
}: DocumentListProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DocumentFilters>({
    searchTerm: '',
    documentType: '',
    status: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Search term filter
      const searchMatch = !filters.searchTerm || 
        doc.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        doc.document_type.toLowerCase().includes(filters.searchTerm.toLowerCase());

      // Document type filter
      const typeMatch = !filters.documentType || 
        doc.document_type === filters.documentType;

      // Status filter
      const statusMatch = !filters.status || 
        doc.status === filters.status;

      // Date range filter
      const docDate = new Date(doc.created_at);
      const startMatch = !filters.dateRange.start || 
        docDate >= new Date(filters.dateRange.start);
      const endMatch = !filters.dateRange.end || 
        docDate <= new Date(filters.dateRange.end);

      return searchMatch && typeMatch && statusMatch && startMatch && endMatch;
    });
  }, [documents, filters]);

  const handleUpload = async (data: any) => {
    try {
      setError(null);
      await onUpload(data);
      setIsUploading(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleShowVersions = async (documentId: string) => {
    try {
      setError(null);
      await onFetchVersions(documentId);
      setSelectedDocumentId(documentId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSearch = (newFilters: DocumentFilters) => {
    setFilters(newFilters);
  };

  const resetSearch = () => {
    setFilters({
      searchTerm: '',
      documentType: '',
      status: '',
      dateRange: {
        start: '',
        end: ''
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Documents</h2>
        <Button onClick={() => setIsUploading(true)}>
          Upload Document
        </Button>
      </div>

      <DocumentSearch
        onSearch={handleSearch}
        onReset={resetSearch}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isUploading && (
        <DocumentUpload
          onUpload={handleUpload}
          onCancel={() => setIsUploading(false)}
        />
      )}

      {filteredDocuments.length === 0 ? (
        <Card>
          <Card.Content>
            <p className="text-center text-gray-500 py-8">
              {documents.length === 0
                ? 'No documents uploaded yet. Upload your first document to get started.'
                : 'No documents match your search criteria.'}
            </p>
          </Card.Content>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <Card.Content className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{doc.title}</h3>
                      <p className="text-sm text-gray-500">
                        Type: {doc.document_type} | Status: {doc.status}
                      </p>
                      <p className="text-sm text-gray-500">
                        Uploaded: {new Date(doc.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShowVersions(doc.id)}
                      >
                        Versions
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(doc)}
                      >
                        View
                      </Button>
                    </div>
                  </div>

                  {selectedDocumentId === doc.id && (
                    <div className="mt-4 border-t pt-4">
                      <DocumentVersions
                        documentId={doc.id}
                        versions={versions}
                        onUploadVersion={(data) => onUploadVersion(doc.id, data)}
                        onViewVersion={onViewVersion}
                      />
                    </div>
                  )}
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
