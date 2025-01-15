import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatInterface from './ChatInterface';
import DocumentViewer from './DocumentViewer';
import { useAuth } from '../../context/AuthContext';

interface DashboardProps {
  theme: 'light' | 'dark';
  layout: 'split' | 'stacked';
}

const Dashboard: React.FC<DashboardProps> = ({ theme, layout }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<null | any>(null);

  return (
    <div className={`h-screen flex ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        userName={user?.name || ''}
      />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat Section */}
        <div className={`${layout === 'split' ? 'w-1/2' : 'w-full'} h-screen flex flex-col`}>
          <ChatInterface />
        </div>

        {/* Document Section */}
        {layout === 'split' && (
          <div className="w-1/2 h-screen border-l border-gray-200">
            <DocumentViewer document={selectedDocument} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;