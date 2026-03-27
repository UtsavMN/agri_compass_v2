<<<<<<< HEAD
=======
import { apiPost } from './httpClient';

>>>>>>> 5b11f30 (Agri Compass - v2 Full-Stack Release (Decision Support System))
export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export interface ChatbotProvider {
  name: string;
  sendMessage(messages: ChatMessage[]): Promise<string>;
}

<<<<<<< HEAD
// Default local provider (fallback) — kept for offline/dev usage
class DefaultChatbotProvider implements ChatbotProvider {
  name = 'default';

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate API delay

=======
// Spring Boot Backend API Provider
class BackendChatbotProvider implements ChatbotProvider {
  name = 'spring-boot-backend';

  async sendMessage(messages: ChatMessage[]): Promise<string> {
>>>>>>> 5b11f30 (Agri Compass - v2 Full-Stack Release (Decision Support System))
    const last = messages[messages.length - 1];
    const message = last?.content ?? '';

    if (!message) return 'Please provide a question or prompt.';

<<<<<<< HEAD
    // Simple rule-based responses for common topics
    if (message.toLowerCase().includes('pest') || message.toLowerCase().includes('disease')) {
      return `Here are some tips for pest and disease control:\n1. Regularly inspect your crops.\n2. Use targeted pesticides when necessary.\n3. Maintain field hygiene.\n4. Consider biological controls.\n5. Implement crop rotation.`;
    }

    if (message.toLowerCase().includes('weather') || message.toLowerCase().includes('rain')) {
      return `Weather tips:\n1. Check forecasts often.\n2. Plan activities around predicted rain.\n3. Use weather-driven irrigation scheduling.`;
    }

    if (message.toLowerCase().includes('market') || message.toLowerCase().includes('price')) {
      return `Market advice:\n1. Compare prices across nearby markets.\n2. Consider storage if prices are low.\n3. Build relationships with buyers.`;
    }

    return `Thanks — please provide more details so I can help (crop name, location, or problem).`;
  }
}

// Remote chatbot provider implementation
class RemoteChatbotProvider implements ChatbotProvider {
  name = 'remote';

  apiUrl: string = '';
  apiKey: string = '';

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.apiUrl) {
      console.warn('Gemini API URL not configured - falling back to default provider');
      return new DefaultChatbotProvider().sendMessage(messages);
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey || ''
        },
        body: JSON.stringify({
          message: messages[messages.length - 1].content,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('API Response:', error);
        throw new Error(`Chat API error: ${response.status} ${error}`);
      }

      const data = await response.json();
      const responseText = data.response || data.text || data.message || JSON.stringify(data);

      // Add fallback for empty or invalid responses
      if (!responseText || responseText.trim().length === 0) {
        console.warn('Empty response from API, using fallback');
        return new DefaultChatbotProvider().sendMessage(messages);
      }

      return responseText;
    } catch (error) {
      console.error('Failed to communicate with API:', error);
      // Fallback to default provider on any error
      return new DefaultChatbotProvider().sendMessage(messages);
=======
    try {
      const response = await apiPost('/api/ai/chat', { message });
      return response.response || 'I am sorry, but I failed to generate a response.';
    } catch (error) {
      console.error('Backend AI API error:', error);
      return 'I am currently offline. Please ensure the backend server is running.';
>>>>>>> 5b11f30 (Agri Compass - v2 Full-Stack Release (Decision Support System))
    }
  }
}

// Chatbot service to manage the provider
class ChatbotService {
  private provider: ChatbotProvider;

  constructor() {
<<<<<<< HEAD
    // Initialize the provider
    if (import.meta.env.VITE_GEMINI_API_URL) {
      const remote = new RemoteChatbotProvider();
      remote.apiUrl = import.meta.env.VITE_GEMINI_API_URL;
      remote.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      this.provider = remote;
    } else {
      this.provider = new DefaultChatbotProvider();
    }
=======
    this.provider = new BackendChatbotProvider();
>>>>>>> 5b11f30 (Agri Compass - v2 Full-Stack Release (Decision Support System))
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


