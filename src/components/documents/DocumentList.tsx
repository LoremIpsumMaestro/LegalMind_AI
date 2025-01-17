import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentUpload } from './DocumentUpload';
import { DocumentVersions } from './DocumentVersions';
import { DocumentSearch, DocumentFilters } from './DocumentSearch';
import { DocumentStats } from './DocumentStats';
import { SortControls } from './SortControls';
import { Document } from '@/hooks/useDocuments';
import { sortDocuments, filterDocuments, SortField, SortOrder } from '@/utils/documentUtils';

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
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const filteredDocuments = useMemo(() => {
    const filtered = filterDocuments(documents, filters);
    return sortDocuments(filtered, sortField, sortOrder);
  }, [documents, filters, sortField, sortOrder]);

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
    setSelectedDocumentId(null); // Close any open version panels
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
    setSelectedDocumentId(null);
  };

  const handleSort = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Documents</h2>
        <Button onClick={() => setIsUploading(true)}>
          Upload Document
        </Button>
      </div>

      <DocumentStats documents={documents} />

      <DocumentSearch
        onSearch={handleSearch}
        onReset={resetSearch}
      />

      <div className="flex justify-end">
        <SortControls
          field={sortField}
          order={sortOrder}
          onSort={handleSort}
        />
      </div>

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
        <div className="space-y-4">
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
      )}
    </div>
  );
}
