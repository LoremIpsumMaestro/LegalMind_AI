import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, MessageSquare, Upload, Search } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  date: string;
  documents: {
    id: number;
    name: string;
    type: string;
    date: string;
  }[];
  messages: {
    role: 'assistant' | 'user';
    content: string;
    timestamp: string;
  }[];
}

interface ChatInterfaceProps {
  onSend?: (message: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSend }) => {
  const [currentChat, setCurrentChat] = useState('1');
  const [conversations, setConversations] = useState<Conversation[]>([
    { 
      id: '1',
      title: 'Contract Law Basics',
      date: '2025-01-31',
      documents: [
        { id: 1, name: 'Contract_v1.pdf', type: 'PDF', date: '2025-01-28' },
        { id: 2, name: 'Terms_and_Conditions.pdf', type: 'PDF', date: '2025-01-28' }
      ],
      messages: [
        { role: 'assistant', content: 'Hello! How can I assist you with your legal queries today?', timestamp: '09:30' },
        { role: 'user', content: 'Can you help me understand contract law basics?', timestamp: '09:31' },
        { role: 'assistant', content: 'Of course! Contract law is based on several key elements: offer, acceptance, consideration, and intention to create legal relations.', timestamp: '09:31' }
      ]
    },
    {
      id: '2',
      title: 'Property Dispute Query',
      date: '2025-01-30',
      documents: [
        { id: 3, name: 'Property_Deed.pdf', type: 'PDF', date: '2025-01-30' },
        { id: 4, name: 'Survey_Report.docx', type: 'DOCX', date: '2025-01-30' }
      ],
      messages: [
        { role: 'assistant', content: 'Hello! How can I help you today?', timestamp: '14:15' },
        { role: 'user', content: 'I have questions about property boundary disputes', timestamp: '14:16' }
      ]
    }
  ]);

  const currentConversation = conversations.find(c => c.id === currentChat) || {
    id: 'new',
    title: 'New Chat',
    date: new Date().toLocaleDateString(),
    documents: [],
    messages: [
      { role: 'assistant', content: 'Hello! How can I assist you with your legal queries today?', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b p-4 flex items-center">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold">LegalMind AI</h1>
        </div>
      </div>

      <div className="container mx-auto p-4 flex gap-4">
        <div className="w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chat History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => setCurrentChat('new')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
                {conversations.map((chat) => (
                  <Button
                    key={chat.id}
                    variant={currentChat === chat.id ? "default" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => setCurrentChat(chat.id)}
                  >
                    <div className="truncate">
                      <div className="font-medium">{chat.title}</div>
                      <div className="text-xs text-gray-500">{chat.date}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="chat" className="space-y-4 flex-1">
          <TabsList>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>{currentConversation.title}</CardTitle>
                <div className="text-sm text-gray-500">{currentConversation.date}</div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full rounded-md border p-4">
                  <div className="space-y-4">
                    {currentConversation.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`rounded-lg p-3 max-w-md ${
                            message.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div>{message.content}</div>
                          <div className="text-xs mt-1 opacity-70">{message.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2 mt-4">
                  <Input placeholder="Type your legal question..." className="flex-1" />
                  <Button>Send</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Documents for: {currentConversation.title}</CardTitle>
                <Button className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Add Document
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search documents..."
                      className="flex-1"
                      prefix={<Search className="w-4 h-4" />}
                    />
                  </div>
                  <div className="space-y-2">
                    {currentConversation.documents.length > 0 ? (
                      currentConversation.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span>{doc.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{doc.type}</span>
                            <span>•</span>
                            <span>{doc.date}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4 text-gray-500">
                        No documents attached to this conversation yet.
                        Click "Add Document" to upload files.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChatInterface;