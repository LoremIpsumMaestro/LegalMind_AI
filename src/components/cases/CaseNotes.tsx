import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddNoteForm } from './AddNoteForm';
import { useCaseNotes, CaseNote } from '@/hooks/useCaseNotes';

interface CaseNotesProps {
  caseId: string;
  notes: CaseNote[];
  onNoteAdded: () => void;
}

export function CaseNotes({ caseId, notes, onNoteAdded }: CaseNotesProps) {
  const { isAddingNote, setIsAddingNote, addNote } = useCaseNotes(caseId);

  const handleAddNote = async (data: { content: string; is_private: boolean }) => {
    try {
      await addNote(data);
      setIsAddingNote(false);
      onNoteAdded();
    } catch (error) {
      console.error('Error adding note:', error);
      // TODO: Add error handling UI
    }
  };

  if (isAddingNote) {
    return (
      <AddNoteForm
        onSubmit={handleAddNote}
        onCancel={() => setIsAddingNote(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Case Notes</h2>
        <Button onClick={() => setIsAddingNote(true)}>
          Add Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <Card>
          <Card.Content>
            <p className="text-center text-gray-500 py-8">
              No notes added yet. Add your first note to get started.
            </p>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <Card key={note.id}>
              <Card.Content className="p-4">
                <p className="text-gray-600 mb-2">{note.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{new Date(note.created_at).toLocaleString()}</span>
                  {note.is_private && (
                    <span className="text-yellow-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      Private
                    </span>
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
