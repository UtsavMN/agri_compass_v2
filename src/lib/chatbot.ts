/**
 * System prompt for initializing the AI assistant
 */
const SYSTEM_PROMPT = `You are an expert agricultural assistant helping farmers. 
You have deep knowledge of:
- Crop management and best practices
- Pest and disease control
- Weather patterns and climate adaptation
- Market trends and pricing
- Government schemes and policies
- Sustainable farming methods
- Modern farming technologies
- Local agricultural conditions

Keep responses:
- Clear and simple
- Practical and actionable 
- Relevant to the farmer's context
- Evidence-based when possible
`;

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};
export interface ChatbotProvider {
  name: string;
  sendMessage(messages: ChatMessage[]): Promise<string>;
}

class DefaultChatbotProvider implements ChatbotProvider {
  name = 'default';

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API delay

    const last = messages[messages.length - 1];
    const message = last?.content ?? '';

    // Simple response generation based on keywords
    if (message.toLowerCase().includes('pest') || message.toLowerCase().includes('disease')) {
      return `Here are some tips for pest and disease control:
1. Regular monitoring of your crops
2. Use of appropriate pesticides when necessary
3. Maintain field hygiene
4. Consider biological control methods
5. Implement crop rotation

Would you like more specific information about any particular pest or disease?`;
    }

    if (message.toLowerCase().includes('weather') || message.toLowerCase().includes('rain')) {
      return `Weather considerations for farming:
1. Check local weather forecasts regularly
2. Plan activities around weather patterns
3. Have contingency plans for extreme weather
4. Use weather-based irrigation scheduling
5. Consider climate-resilient crop varieties

Would you like specific weather-related farming advice?`;
    }

    if (message.toLowerCase().includes('market') || message.toLowerCase().includes('price')) {
      return `Market and pricing advice:
1. Research current market trends
2. Compare prices across different markets
3. Consider storage options if prices are low
4. Build relationships with reliable buyers
5. Consider value addition opportunities

Would you like more detailed market analysis for specific crops?`;
    }

    return `Thank you for your question. I'm here to help with any farming-related queries. Could you please provide more specific details about your question? \n\nI can assist with:\n- Crop management\n- Pest control\n- Disease management\n- Weather adaptation\n- Market information\n- Government schemes\n- Farming best practices`;
  }
}

// Initialize the default provider
const provider = new DefaultChatbotProvider();

/**
 * Send a message to the AI chatbot and get a response
 */
export async function chatWithAI(message: string): Promise<string> {
  return provider.sendMessage([{ role: 'user', content: message }]);
}

export function getChatbotProvider(): ChatbotProvider {
  return provider;
}


