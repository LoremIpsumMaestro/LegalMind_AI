import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/TextField';

interface DocumentVersionUploadProps {
  onSubmit: (data: {
    content: string;
    file_type: string;
    comment?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export function DocumentVersionUpload({ onSubmit, onCancel }: DocumentVersionUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    file: null as File | null,
    comment: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      return;
    }

    try {
      setLoading(true);

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Content = (e.target?.result as string).split(',')[1];
        await onSubmit({
          content: base64Content,
          file_type: formData.file!.type,
          comment: formData.comment || undefined
        });
      };
      reader.readAsDataURL(formData.file);
    } catch (err) {
      console.error('Error uploading version:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>Upload New Version</Card.Title>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <TextField
            label="Version Comment (Optional)"
            value={formData.comment}
            onChange={e => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="Describe the changes in this version"
            as="textarea"
            rows={2}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.file}>
              {loading ? 'Uploading...' : 'Upload Version'}
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  );
}
