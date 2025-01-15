import React from 'react';
import { Message } from '.';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[70%] rounded-lg p-4 ${
              message.sender === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <p className="text-sm">{message.content}</p>
            <p className="text-xs mt-1 opacity-70">
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;