import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCases } from '@/hooks/useCases';
import { Case } from '@/types/database.types';
import { Loader2, Calendar, Hash, AlertCircle } from "lucide-react";

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
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-destructive flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Cases</h2>
        <Button 
          onClick={() => setIsCreating(!isCreating)}
          variant={isCreating ? "secondary" : "default"}
        >
          {isCreating ? 'Cancel' : 'New Case'}
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Case</CardTitle>
            <CardDescription>
              Enter the details for your new case
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4" id="create-case-form">
              <div className="space-y-2">
                <Label htmlFor="title">Case Title</Label>
                <Input
                  id="title"
                  value={newCaseData.title}
                  onChange={e => setNewCaseData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter case title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="case_number">Case Number</Label>
                <Input
                  id="case_number"
                  value={newCaseData.case_number}
                  onChange={e => setNewCaseData(prev => ({ ...prev, case_number: e.target.value }))}
                  placeholder="Enter case number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCaseData.description}
                  onChange={e => setNewCaseData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter case description"
                  className="min-h-[100px]"
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button type="submit" form="create-case-form">
              Create Case
            </Button>
          </CardFooter>
        </Card>
      )}

      {cases.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="rounded-full bg-background p-3">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-xl font-semibold">No cases found</p>
              <p className="text-muted-foreground text-center">
                Create your first case to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((case_: Case) => (
            <Card key={case_.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{case_.title}</CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <Hash className="h-4 w-4" />
                  <span>{case_.case_number}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {case_.description || 'No description provided'}
                </p>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      case_.status === 'active' ? 'bg-green-500' : 
                      case_.status === 'pending' ? 'bg-yellow-500' : 
                      'bg-gray-500'
                    }`} />
                    <span>{case_.status}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(case_.created_at).toLocaleDateString()}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}