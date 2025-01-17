import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/TextField';

interface AddParticipantFormProps {
  onSubmit: (data: { email: string; role: string }) => Promise<void>;
  onCancel: () => void;
}

export function AddParticipantForm({ onSubmit, onCancel }: AddParticipantFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'associate_attorney'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit(formData);
      setFormData({ email: '', role: 'associate_attorney' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>Add Participant</Card.Title>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <select
              value={formData.role}
              onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full p-2 border rounded"
              required
            >
              <option value="lead_attorney">Lead Attorney</option>
              <option value="associate_attorney">Associate Attorney</option>
              <option value="paralegal">Paralegal</option>
              <option value="expert">Expert</option>
              <option value="client">Client</option>
            </select>
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
              {loading ? 'Adding...' : 'Add Participant'}
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  );
}
