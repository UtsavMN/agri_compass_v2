export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export interface ChatbotProvider {
  name: string;
  sendMessage(messages: ChatMessage[]): Promise<string>;
}

// Default local provider (fallback) — kept for offline/dev usage
class DefaultChatbotProvider implements ChatbotProvider {
  name = 'default';

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate API delay

    const last = messages[messages.length - 1];
    const message = last?.content ?? '';

    if (!message) return 'Please provide a question or prompt.';

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

// Provider that calls the external Gemini-like API configured via Vite env vars.
class RemoteChatbotProvider implements ChatbotProvider {
  name = 'remote';

  apiUrl = (import.meta.env.VITE_GEMINI_API_URL as string) || '';
  apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.apiUrl || !this.apiKey) {
      throw new Error('Remote chatbot provider not configured (VITE_GEMINI_API_URL/KEY)');
    }

    const payload = {
      // Attempt a compatible shape for common completions endpoints.
      model: 'gpt-like',
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: 800,
      temperature: 0.6,
    };

    const res = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Chat API error: ${res.status} ${txt}`);
    }

    const data = await res.json();

    // Try to extract text from common response shapes
    // OpenAI-compatible: data.choices[0].message.content
    if (data?.choices && Array.isArray(data.choices) && data.choices.length) {
      const ch = data.choices[0];
      const content = ch?.message?.content ?? ch?.text ?? null;
      if (content) return String(content);
    }

    // Some services return { result: '...' } or { output_text: '...' }
    if (typeof data?.result === 'string') return data.result;
    if (typeof data?.output_text === 'string') return data.output_text;

    // As a last resort, stringify the body
    return JSON.stringify(data);
  }
}

// Choose provider: remote when configured, otherwise default
let provider: ChatbotProvider;
if (import.meta.env.VITE_GEMINI_API_URL && import.meta.env.VITE_GEMINI_API_KEY) {
  provider = new RemoteChatbotProvider();
} else {
  provider = new DefaultChatbotProvider();
}

/**
 * Send a message to the AI chatbot and get a response
 */
export async function chatWithAI(message: string): Promise<string> {
  return provider.sendMessage([{ role: 'user', content: message }]);
}

export function getChatbotProvider(): ChatbotProvider {
  return provider;
}


