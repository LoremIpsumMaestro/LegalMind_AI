import React from 'react';
import { FileText, MessageSquare, Upload, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold">LegalMind AI</h1>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;