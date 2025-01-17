import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentUpload } from './DocumentUpload';

interface Document {
  id: string;
  title: string;
  document_type: string;
  status: string;
  created_at: string;
  file_path: string;
}

interface DocumentListProps {
  documents: Document[];
  onUpload: (data: any) => Promise<void>;
  onView: (document: Document) => void;
}

export function DocumentList({ documents, onUpload, onView }: DocumentListProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (data: any) => {
    try {
      await onUpload(data);
      setIsUploading(false);
    } catch (error) {
      console.error('Upload error:', error);
      // Handle error
    }
  };

  if (isUploading) {
    return (
      <DocumentUpload
        onUpload={handleUpload}
        onCancel={() => setIsUploading(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Documents</h2>
        <Button onClick={() => setIsUploading(true)}>
          Upload Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card>
          <Card.Content>
            <p className="text-center text-gray-500 py-8">
              No documents uploaded yet. Upload your first document to get started.
            </p>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(doc)}
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
