import React, { useState } from 'react';
import { Upload, X, FileText, Download, Eye } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  content: string;
  lastModified: Date;
}

interface DocumentViewerProps {
  document: Document | null;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      // Here we would normally upload to server
      console.log('Processing file:', file.name);

      // Example of reading file content
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        console.log('File content loaded', content.substring(0, 100));
        // Here we would send the content to the server
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error processing file:', error);
    }
  };

  if (!document) {
    return (
      <div
        className={`h-full flex flex-col items-center justify-center p-8 ${isDragging ? 'bg-blue-50' : 'bg-gray-50'} transition-colors duration-200`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload
            size={48}
            className={`mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
          />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isDragging ? 'Drop your document here' : 'No Document Selected'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop a document here, or click to select a file
          </p>
          <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            Select File
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Document Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <FileText className="text-gray-500 mr-2" size={20} />
          <div>
            <h2 className="text-lg font-medium text-gray-900">{document.name}</h2>
            <p className="text-sm text-gray-500">
              Last modified: {document.lastModified.toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            title="Preview"
          >
            <Eye size={20} />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            title="Download"
          >
            <Download size={20} />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-red-500 rounded-lg hover:bg-gray-100"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="prose max-w-none">
          {document.content}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;