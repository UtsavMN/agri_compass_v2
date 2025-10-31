import { NextApiRequest, NextApiResponse } from 'next'
import { WeatherAdvisor } from '@/lib/ai/weatherAdvisor'

const weatherAdvisor = new WeatherAdvisor()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { district } = req.query

    if (!district || typeof district !== 'string') {
      return res.status(400).json({ error: 'District parameter is required' })
    }

    // Get current weather data
    const weatherData = await weatherAdvisor.getWeatherData(district)

    if (!weatherData) {
      return res.status(404).json({
        error: 'Weather data not available for this district',
        district
      })
    }

    // Get farming advice based on weather
    const farmingAdvice = await weatherAdvisor.getFarmingAdvice(weatherData, district)

    return res.status(200).json({
      district,
      weather: weatherData,
      advisory: farmingAdvice,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Weather API error:', error)

    return res.status(500).json({
      error: 'Failed to fetch weather data',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
