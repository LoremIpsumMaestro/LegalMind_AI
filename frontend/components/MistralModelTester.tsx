import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Send, Sparkles } from 'lucide-react';

// Interface for model response
interface ModelResponse {
  type: 'text-generation' | 'document-analysis' | 'legal-query';
  prompt: string;
  response: string;
  timestamp: Date;
}

const MistralModelTester: React.FC = () => {
  // State management
  const [prompt, setPrompt] = useState<string>('');
  const [responses, setResponses] = useState<ModelResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Simulated API call (replace with actual backend integration)
  const testModelGeneration = async (type: ModelResponse['type']) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulated backend call - replace with actual API endpoint
      const response = await fetch('/api/mistral-model/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt, 
          type 
        }),
      });

      if (!response.ok) {
        throw new Error('Model generation failed');
      }

      const data = await response.json();

      const newResponse: ModelResponse = {
        type,
        prompt,
        response: data.generated_text,
        timestamp: new Date()
      };

      setResponses([newResponse, ...responses]);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="mr-2 text-purple-600" />
          Mistral AI Model Tester
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea 
            placeholder="Enter your prompt for the Mistral AI model..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px]"
          />

          {error && (
            <div className="flex items-center text-red-500">
              <AlertCircle className="mr-2" />
              {error}
            </div>
          )}

          <div className="flex space-x-2">
            <Button 
              onClick={() => testModelGeneration('text-generation')}
              disabled={!prompt || isLoading}
            >
              <Send className="mr-2" /> Generate Text
            </Button>
            <Button 
              variant="secondary"
              onClick={() => testModelGeneration('legal-query')}
              disabled={!prompt || isLoading}
            >
              <Sparkles className="mr-2" /> Legal Query
            </Button>
            <Button 
              variant="outline"
              onClick={() => testModelGeneration('document-analysis')}
              disabled={!prompt || isLoading}
            >
              <Sparkles className="mr-2" /> Document Analysis
            </Button>
          </div>
        </div>

        {/* Response History */}
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Response History</h3>
          {responses.map((response, index) => (
            <Card key={index} className="bg-gray-50 p-4">
              <div className="font-medium mb-2">{response.type.replace('-', ' ').toUpperCase()}</div>
              <div className="text-sm text-gray-600 mb-2">
                <strong>Prompt:</strong> {response.prompt}
              </div>
              <div className="text-sm">
                <strong>Response:</strong> {response.response}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {response.timestamp.toLocaleString()}
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MistralModelTester;
