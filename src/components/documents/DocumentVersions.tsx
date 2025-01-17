import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentVersionUpload } from './DocumentVersionUpload';

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_path: string;
  created_at: string;
  created_by: string;
  comment: string | null;
  users: {
    email: string;
    full_name: string | null;
  };
}

interface DocumentVersionsProps {
  documentId: string;
  versions: DocumentVersion[];
  onUploadVersion: (data: {
    content: string;
    file_type: string;
    comment?: string;
  }) => Promise<void>;
  onViewVersion: (version: DocumentVersion) => void;
}

export function DocumentVersions({
  documentId,
  versions,
  onUploadVersion,
  onViewVersion
}: DocumentVersionsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (data: any) => {
    try {
      setError(null);
      await onUploadVersion(data);
      setIsUploading(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Document Versions</h3>
        <Button onClick={() => setIsUploading(true)}>
          Upload New Version
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isUploading && (
        <DocumentVersionUpload
          onSubmit={handleUpload}
          onCancel={() => setIsUploading(false)}
        />
      )}

      {versions.length === 0 ? (
        <Card>
          <Card.Content>
            <p className="text-center text-gray-500 py-4">
              No versions available
            </p>
          </Card.Content>
        </Card>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
            <Card key={version.id}>
              <Card.Content className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Version {version.version_number}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(version.created_at).toLocaleString()}
                      </span>
                    </div>
                    {version.comment && (
                      <p className="text-sm text-gray-600 mt-1">{version.comment}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      By: {version.users.full_name || version.users.email}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewVersion(version)}
                  >
                    View
                  </Button>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
