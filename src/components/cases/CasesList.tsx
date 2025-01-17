import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/TextField';
import { useCases } from '@/hooks/useCases';
import { Case } from '@/types/database.types';

export function CasesList() {
  const { cases, loading, error, createCase } = useCases();
  const [isCreating, setIsCreating] = useState(false);
  const [newCaseData, setNewCaseData] = useState({
    title: '',
    case_number: '',
    description: ''
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createCase(newCaseData);
    if (result) {
      setIsCreating(false);
      setNewCaseData({ title: '', case_number: '', description: '' });
    }
  };

  if (loading) {
    return <div>Loading cases...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cases</h2>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Cancel' : 'New Case'}
        </Button>
      </div>

      {isCreating && (
        <Card className="mb-6">
          <Card.Header>
            <Card.Title>Create New Case</Card.Title>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleCreate} className="space-y-4">
              <TextField
                label="Case Title"
                value={newCaseData.title}
                onChange={e => setNewCaseData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              <TextField
                label="Case Number"
                value={newCaseData.case_number}
                onChange={e => setNewCaseData(prev => ({ ...prev, case_number: e.target.value }))}
                required
              />
              <TextField
                label="Description"
                value={newCaseData.description}
                onChange={e => setNewCaseData(prev => ({ ...prev, description: e.target.value }))}
                as="textarea"
              />
              <Button type="submit">Create Case</Button>
            </form>
          </Card.Content>
        </Card>
      )}

      {cases.length === 0 ? (
        <Card>
          <Card.Content>
            <p className="text-center text-gray-500 py-8">
              No cases found. Create your first case to get started.
            </p>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((case_: Case) => (
            <Card key={case_.id} className="hover:shadow-lg transition-shadow">
              <Card.Header>
                <Card.Title>{case_.title}</Card.Title>
                <p className="text-sm text-gray-500">#{case_.case_number}</p>
              </Card.Header>
              <Card.Content>
                <p className="text-gray-600 mb-4">
                  {case_.description || 'No description provided'}
                </p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Status: {case_.status}</span>
                  <span>{new Date(case_.created_at).toLocaleDateString()}</span>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
