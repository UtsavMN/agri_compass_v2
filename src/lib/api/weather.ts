import { supabase } from '@/lib/supabase'
import { WeatherAdvisor, WeatherData, WeatherAdvice } from '@/lib/ai/weatherAdvisor'

export interface WeatherResponse {
  district: string
  weather: WeatherData
  advisory: WeatherAdvice
  timestamp: string
}

export interface WeatherLog {
  id?: string
  farm_id: string
  district: string
  temperature: number
  humidity: number
  wind_speed: number
  description: string
  precipitation: number
  recorded_at: string
}

export class WeatherAPI {
  private static weatherAdvisor = new WeatherAdvisor()

  // GET /api/weather/:district - Get current weather and advisory
  static async getWeatherForDistrict(district: string): Promise<WeatherResponse | null> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(`/api/weather/${encodeURIComponent(district)}`, {
        method: 'GET',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      const data = await response.json()
      return data

    } catch (error) {
      console.error('Weather API fetch error:', error)

      // Fallback to direct weather advisor call
      try {
        const weatherData = await this.weatherAdvisor.getWeatherData(district)
        if (weatherData) {
          const advisory = await this.weatherAdvisor.getFarmingAdvice(weatherData, district)
          return {
            district,
            weather: weatherData,
            advisory,
            timestamp: new Date().toISOString()
          }
        }
      } catch (fallbackError) {
        console.error('Weather fallback error:', fallbackError)
      }

      return null
    }
  }

  // Store weather log for farm
  static async logWeatherForFarm(farmId: string, district: string, weatherData: WeatherData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('weather_logs')
        .insert({
          farm_id: farmId,
          district: district,
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          wind_speed: weatherData.windSpeed,
          description: weatherData.description,
          precipitation: weatherData.forecast[0]?.precipitation || 0,
          recorded_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error logging weather:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Weather logging error:', error)
      return false
    }
  }

  // Get last 7 days weather logs for farm
  static async getWeatherHistoryForFarm(farmId: string): Promise<WeatherLog[]> {
    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data, error } = await supabase
        .from('weather_logs')
        .select('*')
        .eq('farm_id', farmId)
        .gte('recorded_at', sevenDaysAgo.toISOString())
        .order('recorded_at', { ascending: false })

      if (error) {
        console.error('Error fetching weather history:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Weather history fetch error:', error)
      return []
    }
  }

  // Get current weather directly (bypass API route)
  static async getCurrentWeather(district: string): Promise<WeatherData | null> {
    return await this.weatherAdvisor.getWeatherData(district)
  }

  // Get farming advice for weather conditions
  static async getFarmingAdvice(weatherData: WeatherData, district: string): Promise<WeatherAdvice> {
    return await this.weatherAdvisor.getFarmingAdvice(weatherData, district)
  }
}
