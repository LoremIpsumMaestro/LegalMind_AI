import { useState, useEffect, useCallback } from 'react';
import { Message } from '../components/Dashboard/ChatInterface';
import { chatService } from '../services/chatService';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChatHistory();
    chatService.connectWebSocket(handleNewMessage);

    return () => {
      chatService.disconnectWebSocket();
    };
  }, []);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const history = await chatService.getChatHistory();
      setMessages(history);
    } catch (error) {
      setError('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const sendMessage = async (content: string) => {
    try {
      setLoading(true);
      setError(null);

      // Add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Send to backend and get AI response
      const aiResponse = await chatService.sendMessage(content);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      setLoading(true);
      await chatService.clearChatHistory();
      setMessages([]);
    } catch (error) {
      setError('Failed to clear chat history');
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearChat,
  };
}