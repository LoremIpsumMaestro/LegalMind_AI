import React, { useState } from 'react';
import { MessageSquare, FileText, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatInterface from './ChatInterface';
import DocumentDashboard from './DocumentDashboard';

const AppLayout = () => {
  const [activeView, setActiveView] = useState('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-secondary h-full flex flex-col transition-all duration-300 border-r`}
        data-testid="sidebar"
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && <h1 className="text-xl font-bold">LegalMind AI</h1>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            data-testid="toggle-sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="flex-1 p-2">
          <div className="space-y-2">
            <Button
              variant={activeView === 'chat' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('chat')}
              data-testid="chat-button"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              {isSidebarOpen && 'Chat'}
            </Button>
            <Button
              variant={activeView === 'documents' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('documents')}
              data-testid="documents-button"
            >
              <FileText className="h-5 w-5 mr-2" />
              {isSidebarOpen && 'Documents'}
            </Button>
          </div>
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start"
            data-testid="settings-button"
          >
            <Settings className="h-5 w-5 mr-2" />
            {isSidebarOpen && 'Settings'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden" data-testid="main-content">
        {activeView === 'chat' ? (
          <ChatInterface />
        ) : (
          <DocumentDashboard />
        )}
      </div>
    </div>
  );
};

export default AppLayout;