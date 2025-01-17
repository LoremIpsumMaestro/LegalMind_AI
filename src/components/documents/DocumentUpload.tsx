import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/TextField';

interface DocumentUploadProps {
  onUpload: (data: {
    title: string;
    document_type: string;
    content: string;
    file_type: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export function DocumentUpload({ onUpload, onCancel }: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    document_type: 'legal_brief',
    file: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file,
        title: prev.title || file.name.split('.')[0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Content = (e.target?.result as string).split(',')[1];
        await onUpload({
          title: formData.title,
          document_type: formData.document_type,
          content: base64Content,
          file_type: formData.file!.type
        });
      };
      reader.readAsDataURL(formData.file);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>Upload Document</Card.Title>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <TextField
            label="Document Title"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Document Type</label>
            <select
              value={formData.document_type}
              onChange={e => setFormData(prev => ({ ...prev, document_type: e.target.value }))}
              className="w-full p-2 border rounded"
            >
              <option value="legal_brief">Legal Brief</option>
              <option value="motion">Motion</option>
              <option value="pleading">Pleading</option>
              <option value="contract">Contract</option>
              <option value="correspondence">Correspondence</option>
              <option value="evidence">Evidence</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">File</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Select File
              </Button>
              {formData.file && (
                <span className="text-sm text-gray-600">
                  {formData.file.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  );
}
