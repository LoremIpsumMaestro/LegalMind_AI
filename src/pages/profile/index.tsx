import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ProfilePreferences } from '@/components/profile/ProfilePreferences';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    profile,
    loading: profileLoading,
    error,
    fetchProfile,
    updateProfile,
    updatePreferences
  } = useProfile();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (user) {
      fetchProfile();
    }
  }, [user, authLoading, router]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          ← Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <ProfileForm
            profile={profile}
            onUpdate={updateProfile}
          />

          <ProfilePreferences
            profile={profile}
            onUpdatePreferences={updatePreferences}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>Account Overview</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{profile.email}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Role</label>
                  <p className="font-medium capitalize">{profile.role}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Member Since</label>
                  <p className="font-medium">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Cases</span>
                    <span className="font-medium">{profile.cases_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Participating Cases</span>
                    <span className="font-medium">{profile.case_participants_count}</span>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Quick Actions</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/settings/security')}
                >
                  Security Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/settings/notifications')}
                >
                  Notification Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600"
                  onClick={() => router.push('/settings/account')}
                >
                  Account Settings
                </Button>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}
