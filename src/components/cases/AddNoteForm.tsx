import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/TextField';

interface AddNoteFormProps {
  onSubmit: (data: { content: string; is_private: boolean }) => Promise<void>;
  onCancel: () => void;
}

export function AddNoteForm({ onSubmit, onCancel }: AddNoteFormProps) {
  const [formData, setFormData] = useState({
    content: '',
    is_private: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({ content: '', is_private: false });
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>Add Case Note</Card.Title>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Note Content"
            value={formData.content}
            onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
            required
            as="textarea"
            rows={4}
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_private"
              checked={formData.is_private}
              onChange={e => setFormData(prev => ({ ...prev, is_private: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <label htmlFor="is_private" className="text-sm text-gray-600">
              Mark as private
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Add Note
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  );
}
