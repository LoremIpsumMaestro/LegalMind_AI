import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useCase } from '@/hooks/useCase';
import { useDocuments } from '@/hooks/useDocuments';
import { useParticipants } from '@/hooks/useParticipants';
import { Button } from '@/components/ui/button';
import { CaseDetails } from '@/components/cases/CaseDetails';
import { CaseNotes } from '@/components/cases/CaseNotes';
import { DocumentList } from '@/components/documents/DocumentList';
import { ParticipantList } from '@/components/cases/ParticipantList';

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
  const { 
    uploadDocument, 
    viewDocument 
  } = useDocuments(id as string);
  const {
    addParticipant,
    removeParticipant
  } = useParticipants(id as string);

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

  const handleDocumentUpload = async (data: any) => {
    try {
      await uploadDocument(data);
      await fetchCase();
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const handleAddParticipant = async (data: { email: string; role: string }) => {
    try {
      await addParticipant(data);
      await fetchCase();
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      await removeParticipant(participantId);
      await fetchCase();
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  };

  const isOwner = caseData.user_id === user.id;

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
            <DocumentList
              documents={caseData.documents || []}
              onUpload={handleDocumentUpload}
              onView={viewDocument}
            />
          </div>

          <div className="space-y-6">
            <CaseNotes
              caseId={caseData.id}
              notes={caseData.case_notes || []}
              onNoteAdded={fetchCase}
            />
          </div>
        </div>

        <ParticipantList
          participants={caseData.case_participants || []}
          onAdd={handleAddParticipant}
          onRemove={handleRemoveParticipant}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
}
