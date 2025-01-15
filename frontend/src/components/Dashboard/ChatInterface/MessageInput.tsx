import React, { KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  isLoading
}) => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex items-end space-x-2">
      <div className="flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          disabled={isLoading}
        />
      </div>
      <button
        onClick={onSend}
        disabled={isLoading || !value.trim()}
        className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={20} />
      </button>
    </div>
  );
};

export default MessageInput;