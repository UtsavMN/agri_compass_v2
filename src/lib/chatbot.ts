export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export interface ChatbotProvider {
  sendMessage(messages: ChatMessage[]): Promise<string>;
  name: string;
}

class MockChatbotProvider implements ChatbotProvider {
  name = 'mock';
  async sendMessage(messages: ChatMessage[]): Promise<string> {
    const last = messages[messages.length - 1];
    const prompt = last?.content ?? '';
    return (
      'I am your farming assistant. Ask about crop practices, pest control, irrigation, fertilizer schedules, or how to use the app.\n' +
      (prompt ? `You asked: "${prompt}"` : '')
    );
  }
}

let provider: ChatbotProvider | null = null;

export function getChatbotProvider(): ChatbotProvider {
  if (!provider) {
    // TODO: Switch by env flag when backend integration is added
    provider = new MockChatbotProvider();
  }
  return provider;
}


