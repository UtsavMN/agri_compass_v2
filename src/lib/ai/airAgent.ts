import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AirAgent {
  private systemPrompt = `You are KrishiMitra — an agriculture expert for Karnataka farmers.
Respond in simple English mixed with Kannada when needed. Keep responses under 6 lines and focus on practical advice.
You have knowledge about Karnataka's districts, crops, weather patterns, and farming practices.
Always provide actionable, farmer-friendly advice.`;

  async sendMessage(messages: ChatMessage[], district?: string): Promise<string> {
    try {
      const contextMessages: ChatMessage[] = [
        { role: 'system', content: this.systemPrompt + (district ? ` Current district context: ${district}` : '') },
        ...messages
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: contextMessages,
        max_tokens: 300,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      return 'ಕ್ಷಮಿಸಿ, ಸದ್ಯಕ್ಕೆ ಸೇವೆ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.';
    }
  }

  async getCropAdvice(cropName: string, district: string): Promise<string> {
    const prompt = `Give practical farming advice for ${cropName} in ${district}, Karnataka. Include watering, pest control, and harvesting tips.`;
    return this.sendMessage([{ role: 'user', content: prompt }], district);
  }

  async getWeatherAdvice(weatherData: any, district: string): Promise<string> {
    const prompt = `Based on this weather: ${JSON.stringify(weatherData)}, give farming advice for ${district}.`;
    return this.sendMessage([{ role: 'user', content: prompt }], district);
  }
}

export const airAgent = new AirAgent();
