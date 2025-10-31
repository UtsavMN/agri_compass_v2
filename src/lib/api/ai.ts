import { supabase } from '@/lib/supabase'

export interface AIChatRequest {
  user_id: string
  message: string
  farm_id?: string
}

export interface AIChatResponse {
  response: string
  success: boolean
  error?: string
}

export class AIAPI {
  // POST /api/ai/chat - Send message to AI with farm context
  static async sendChatMessage(request: AIChatRequest): Promise<AIChatResponse> {
    try {
      // Fetch farm details if farm_id is provided
      let farmContext = ''
      if (request.farm_id) {
        const { data: farm, error: farmError } = await supabase
          .from('farms')
          .select('*')
          .eq('id', request.farm_id)
          .eq('user_id', request.user_id)
          .single()

        if (farmError) {
          console.warn('Could not fetch farm details:', farmError)
        } else if (farm) {
          farmContext = `
Farm Context:
- Name: ${farm.name}
- Location: ${farm.location}
- Area: ${farm.area_acres} acres
- Soil Type: ${farm.soil_type || 'Not specified'}
- Irrigation: ${farm.irrigation_type || 'Not specified'}
- Farm Age: ${Math.floor((Date.now() - new Date(farm.created_at).getTime()) / (1000 * 60 * 60 * 24))} days
          `.trim()
        }
      }

      // Prepare the enhanced prompt
      const systemPrompt = `You are KrishiMitra — an agriculture expert for Karnataka farmers.
Respond in simple English mixed with Kannada when appropriate. Keep responses under 6 lines and focus on practical advice.
You have knowledge about Karnataka's districts, crops, weather patterns, and farming practices.
Always provide actionable, farmer-friendly advice. Use district-specific information when available.

${farmContext}

Current user question: ${request.message}

Provide a helpful, concise response in English or Kannada as appropriate.`

      // Call external AI service with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: systemPrompt,
            user_id: request.user_id,
            farm_id: request.farm_id
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`AI service error: ${response.status}`)
        }

        const data = await response.json()

        return {
          response: data.response || data.text || 'AI temporarily unavailable',
          success: true
        }

      } catch (fetchError) {
        clearTimeout(timeoutId)

        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.warn('AI request timed out')
          return {
            response: 'ಕ್ಷಮಿಸಿ, AI ಸೇವೆ ಸ್ಥಗಿತಗೊಂಡಿದೆ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.',
            success: false,
            error: 'Timeout'
          }
        }

        throw fetchError
      }

    } catch (error) {
      console.error('AI chat error:', error)

      // Fallback responses based on language detection
      const isKannada = /[\u0C80-\u0CFF]/.test(request.message)

      return {
        response: isKannada
          ? 'ಕ್ಷಮಿಸಿ, ಸದ್ಯಕ್ಕೆ ಸೇವೆ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.'
          : 'Sorry, the AI service is temporarily unavailable. Please try again later.',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Helper method to detect language
  static detectLanguage(text: string): 'english' | 'kannada' | 'mixed' {
    const kannadaChars = (text.match(/[\u0C80-\u0CFF]/g) || []).length
    const totalChars = text.replace(/\s/g, '').length

    if (kannadaChars === 0) return 'english'
    if (kannadaChars / totalChars > 0.3) return 'kannada'
    return 'mixed'
  }
}
