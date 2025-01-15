import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, FileText, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, userName }) => {
  const { logout } = useAuth();

  return (
    <div
      className={`${isOpen ? 'w-64' : 'w-16'} 
        h-screen bg-gray-800 text-white transition-width duration-200 ease-in-out
        flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        {isOpen && <h1 className="text-xl font-bold">LegalMind AI</h1>}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-700 rounded-lg"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* User Info */}
      {isOpen && (
        <div className="p-4 border-b border-gray-700">
          <p className="text-sm text-gray-400">Signed in as</p>
          <p className="font-medium truncate">{userName}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-2">
          <li>
            <button className="w-full p-2 flex items-center rounded-lg hover:bg-gray-700">
              <FileText size={20} />
              {isOpen && <span className="ml-3">Documents</span>}
            </button>
          </li>
          <li>
            <button className="w-full p-2 flex items-center rounded-lg hover:bg-gray-700">
              <Settings size={20} />
              {isOpen && <span className="ml-3">Settings</span>}
            </button>
          </li>
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full p-2 flex items-center rounded-lg hover:bg-gray-700"
        >
          <LogOut size={20} />
          {isOpen && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;