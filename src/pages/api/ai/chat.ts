import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  timeout: 15000, // 15 second timeout
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt, user_id, farm_id } = req.body

    if (!prompt || !user_id) {
      return res.status(400).json({ error: 'Missing required fields: prompt and user_id' })
    }

    // Call OpenAI API with timeout
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are KrishiMitra, an agriculture expert for Karnataka farmers. Respond in simple English mixed with Kannada when appropriate. Keep responses under 6 lines and focus on practical advice.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || 'AI temporarily unavailable'

    return res.status(200).json({
      response,
      success: true,
      user_id,
      farm_id
    })

  } catch (error) {
    console.error('AI API error:', error)

    // Handle different error types
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('aborted')) {
        return res.status(408).json({
          error: 'Request timeout',
          response: 'ಕ್ಷಮಿಸಿ, AI ಸೇವೆ ಸ್ಥಗಿತಗೊಂಡಿದೆ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.',
          success: false
        })
      }

      if (error.message.includes('API key')) {
        return res.status(500).json({
          error: 'AI service configuration error',
          response: 'AI service is not properly configured.',
          success: false
        })
      }
    }

    return res.status(500).json({
      error: 'Internal server error',
      response: 'Sorry, the AI service is temporarily unavailable. Please try again later.',
      success: false
    })
  }
}
