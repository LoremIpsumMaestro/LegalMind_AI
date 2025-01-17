import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/TextField';
import { UserProfile } from '@/hooks/useProfile';

interface ProfileFormProps {
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => Promise<void>;
}

export function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    title: profile.title || '',
    phone_number: profile.phone_number || '',
    bar_number: profile.bar_number || '',
    organization: profile.organization || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await onUpdate(formData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>Profile Information</Card.Title>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <TextField
            label="Full Name"
            value={formData.full_name}
            onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            required
          />

          <TextField
            label="Title"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />

          <TextField
            label="Phone Number"
            type="tel"
            value={formData.phone_number}
            onChange={e => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
          />

          <TextField
            label="Bar Number"
            value={formData.bar_number}
            onChange={e => setFormData(prev => ({ ...prev, bar_number: e.target.value }))}
          />

          <TextField
            label="Organization"
            value={formData.organization}
            onChange={e => setFormData(prev => ({ ...prev, organization: e.target.value }))}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  );
}
