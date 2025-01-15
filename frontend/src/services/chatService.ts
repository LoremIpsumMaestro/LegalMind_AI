import { Message } from '../components/Dashboard/ChatInterface';

class ChatService {
  private baseUrl: string;
  private webSocket: WebSocket | null = null;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  }

  private getHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async sendMessage(content: string): Promise<Message> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/send`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return {
        id: data.id,
        content: data.content,
        sender: 'ai',
        timestamp: new Date(data.timestamp),
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  connectWebSocket(onMessage: (message: Message) => void) {
    const token = localStorage.getItem('accessToken');
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
    
    this.webSocket = new WebSocket(`${wsUrl}/ws?token=${token}`);

    this.webSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      onMessage({
        id: message.id,
        content: message.content,
        sender: message.sender,
        timestamp: new Date(message.timestamp),
      });
    };

    this.webSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.webSocket.onclose = () => {
      console.log('WebSocket connection closed');
      // Implement reconnection logic here
      setTimeout(() => this.connectWebSocket(onMessage), 5000);
    };
  }

  disconnectWebSocket() {
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }
  }

  async getChatHistory(): Promise<Message[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/history`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }

      const data = await response.json();
      return data.messages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  async clearChatHistory(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/clear`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to clear chat history');
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();