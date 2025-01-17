import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={handleSignOut} variant="outline">
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Recent Cases</Card.Title>
          </Card.Header>
          <Card.Content>
            <p className="text-gray-600">No recent cases found.</p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Active Documents</Card.Title>
          </Card.Header>
          <Card.Content>
            <p className="text-gray-600">No active documents found.</p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Recent Activity</Card.Title>
          </Card.Header>
          <Card.Content>
            <p className="text-gray-600">No recent activity found.</p>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
