import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddParticipantForm } from './AddParticipantForm';

export interface Participant {
  id: string;
  role: string;
  added_at: string;
  users: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

interface ParticipantListProps {
  participants: Participant[];
  onAdd: (data: { email: string; role: string }) => Promise<void>;
  onRemove: (participantId: string) => Promise<void>;
  isOwner: boolean;
}

export function ParticipantList({ 
  participants, 
  onAdd, 
  onRemove, 
  isOwner 
}: ParticipantListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (data: { email: string; role: string }) => {
    try {
      setError(null);
      await onAdd(data);
      setIsAdding(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRemove = async (participantId: string) => {
    if (window.confirm('Are you sure you want to remove this participant?')) {
      try {
        setError(null);
        await onRemove(participantId);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Case Participants</h2>
        {isOwner && (
          <Button onClick={() => setIsAdding(true)}>
            Add Participant
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isAdding && (
        <AddParticipantForm
          onSubmit={handleAdd}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {participants.length === 0 ? (
        <Card>
          <Card.Content>
            <p className="text-center text-gray-500 py-8">
              No additional participants. Add team members to collaborate.
            </p>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {participants.map((participant) => (
            <Card key={participant.id} className="hover:shadow-md transition-shadow">
              <Card.Content className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {participant.users.full_name || participant.users.email}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {participant.users.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Role: {participant.role}
                    </p>
                    <p className="text-xs text-gray-400">
                      Added: {new Date(participant.added_at).toLocaleDateString()}
                    </p>
                  </div>
                  {isOwner && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleRemove(participant.id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
