import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/hooks/useProfile';

interface ProfilePreferencesProps {
  profile: UserProfile;
  onUpdatePreferences: (preferences: Record<string, any>) => Promise<void>;
}

export function ProfilePreferences({ profile, onUpdatePreferences }: ProfilePreferencesProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTogglePreference = async (key: string, value: boolean) => {
    try {
      setLoading(true);
      setError(null);
      await onUpdatePreferences({ [key]: value });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>Preferences</Card.Title>
      </Card.Header>
      <Card.Content>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={profile.preferences?.emailNotifications ?? true}
                onChange={e => handleTogglePreference('emailNotifications', e.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Dark Mode</h4>
              <p className="text-sm text-gray-500">Use dark theme for the interface</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={profile.preferences?.darkMode ?? false}
                onChange={e => handleTogglePreference('darkMode', e.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Document Versions</h4>
              <p className="text-sm text-gray-500">Show all document versions by default</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={profile.preferences?.showAllVersions ?? false}
                onChange={e => handleTogglePreference('showAllVersions', e.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}
