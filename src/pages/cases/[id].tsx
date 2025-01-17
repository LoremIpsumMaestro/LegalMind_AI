import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useCase } from '@/hooks/useCase';
import { Button } from '@/components/ui/button';
import { CaseDetails } from '@/components/cases/CaseDetails';
import { CaseNotes } from '@/components/cases/CaseNotes';

export default function CaseViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const { 
    caseData, 
    loading, 
    error, 
    updateCase, 
    deleteCase, 
    fetchCase 
  } = useCase(id as string);

  if (authLoading || loading) {
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

  if (!user || !caseData) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          ← Back to Dashboard
        </Button>
      </div>

      <div className="space-y-8">
        <CaseDetails
          caseData={caseData}
          onUpdate={updateCase}
          onDelete={deleteCase}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Documents</h2>
              <Button>
                Upload Document
              </Button>
            </div>
            {caseData.documents && caseData.documents.length > 0 ? (
              <div className="grid gap-4">
                {caseData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{doc.title}</h3>
                        <p className="text-sm text-gray-500">
                          Type: {doc.document_type} | Status: {doc.status}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border rounded-lg p-8 text-center text-gray-500">
                No documents uploaded yet
              </div>
            )}
          </div>

          <div className="space-y-6">
            <CaseNotes
              caseId={caseData.id}
              notes={caseData.case_notes || []}
              onNoteAdded={fetchCase}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Case Participants</h2>
            <Button>
              Add Participant
            </Button>
          </div>
          {caseData.case_participants && caseData.case_participants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {caseData.case_participants.map((participant) => (
                <div
                  key={participant.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{participant.user_id}</p>
                      <p className="text-sm text-gray-500">
                        Role: {participant.role}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center text-gray-500">
              No additional participants
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
