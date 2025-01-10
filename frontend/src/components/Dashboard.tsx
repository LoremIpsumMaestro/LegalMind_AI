import React, { useState } from 'react';

interface DashboardProps {
  theme: 'light' | 'dark';
  layout: 'split' | 'stacked';
}

const Dashboard: React.FC<DashboardProps> = ({ theme, layout }) => {
  const [activeDocument, setActiveDocument] = useState<any | null>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  return (
    <div className={`dashboard ${theme} ${layout}`}>
      <div className="chat-panel">
        {/* Chat interface will go here */}
      </div>
      <div className="document-viewer">
        {/* Document viewer will go here */}
      </div>
    </div>
  );
};

export default Dashboard;