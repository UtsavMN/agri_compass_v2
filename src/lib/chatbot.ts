import { apiPost } from './httpClient';

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export interface ChatbotProvider {
  name: string;
  sendMessage(messages: ChatMessage[]): Promise<string>;
}

// Spring Boot Backend API Provider
class BackendChatbotProvider implements ChatbotProvider {
  name = 'spring-boot-backend';

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    const last = messages[messages.length - 1];
    const message = last?.content ?? '';

    if (!message) return 'Please provide a question or prompt.';

    try {
      const response = await apiPost('/api/ai/chat', { message });
      return response.response || 'I am sorry, but I failed to generate a response.';
    } catch (error) {
      console.error('Backend AI API error:', error);
      return 'I am currently offline. Please ensure the backend server is running.';
    }
  }
}

// Chatbot service to manage the provider
class ChatbotService {
  private provider: ChatbotProvider;

  constructor() {
    this.provider = new BackendChatbotProvider();
  }

  async chatWithAI(message: string): Promise<string> {
    return this.provider.sendMessage([{ role: 'user', content: message }]);
  }

  getChatbotProvider(): ChatbotProvider {
    return this.provider;
  }
}

// Create and export the service
const chatbotService = new ChatbotService();
export const chatWithAI = chatbotService.chatWithAI.bind(chatbotService);
export const getChatbotProvider = chatbotService.getChatbotProvider.bind(chatbotService);


