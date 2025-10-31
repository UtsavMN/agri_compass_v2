// API endpoints for farms management
import { supabase } from '@/lib/supabase'

export interface Farm {
  id: string
  user_id: string
  name: string
  location: string
  area_acres: number
  soil_type: string | null
  irrigation_type: string | null
  created_at: string
  duration_days?: number
  images?: string[]
}

export interface WeatherLog {
  id: string
  farm_id: string
  user_id: string
  notes: string
  temperature?: number
  humidity?: number
  conditions: string
  created_at: string
}

export interface FarmImage {
  id: string
  farm_id: string
  user_id: string
  image_url: string
  caption?: string
  created_at: string
}

export class FarmsAPI {
  // GET /api/farms - Get user's farms with enhanced data
  static async getFarms(userId: string): Promise<Farm[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('farms')
        .select(`
          *,
          farm_images(image_url),
          farm_weather_logs(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculate duration and format data
      const farms = data?.map((farm: any) => ({
        ...farm,
        duration_days: Math.floor((Date.now() - new Date(farm.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        images: farm.farm_images?.map((img: any) => img.image_url) || []
      })) || []

      return farms
    } catch (error) {
      console.error('Error fetching farms:', error)
      throw error
    }
  }

  // POST /api/farms - Create a new farm
  static async createFarm(farmData: {
    user_id: string
    name: string
    location: string
    area_acres: number
    soil_type?: string
    irrigation_type?: string
  }): Promise<Farm> {
    try {
      const { data, error } = await (supabase as any)
        .from('farms')
        .insert([farmData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating farm:', error)
      throw error
    }
  }

  // POST /api/farms/:id/weather - Add weather log
  static async addWeatherLog(farmId: string, userId: string, logData: {
    notes: string
    temperature?: number
    humidity?: number
    conditions: string
  }): Promise<WeatherLog> {
    try {
      const { data, error } = await (supabase as any)
        .from('farm_weather_logs')
        .insert({
          farm_id: farmId,
          user_id: userId,
          ...logData
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding weather log:', error)
      throw error
    }
  }

  // GET /api/farms/:id/weather - Get weather logs for a farm
  static async getWeatherLogs(farmId: string): Promise<WeatherLog[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('farm_weather_logs')
        .select('*')
        .eq('farm_id', farmId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching weather logs:', error)
      throw error
    }
  }

  // POST /api/farms/:id/images - Upload farm image
  static async uploadFarmImage(farmId: string, userId: string, file: File, caption?: string): Promise<FarmImage> {
    try {
      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${farmId}/${Date.now()}.${fileExt}`
      const filePath = `farm-images/${fileName}`

      const { error: uploadError } = await (supabase as any).storage
        .from('farm-media')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = (supabase as any).storage
        .from('farm-media')
        .getPublicUrl(filePath)

      // Save image record to database
      const { data, error } = await (supabase as any)
        .from('farm_images')
        .insert({
          farm_id: farmId,
          user_id: userId,
          image_url: publicUrl,
          caption: caption || null
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error uploading farm image:', error)
      throw error
    }
  }

  // GET /api/farms/:id/images - Get farm images
  static async getFarmImages(farmId: string): Promise<FarmImage[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('farm_images')
        .select('*')
        .eq('farm_id', farmId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching farm images:', error)
      throw error
    }
  }

  // POST /api/farms/:id/share - Share farm update to community
  static async shareToCommunity(farmId: string, userId: string, content: string): Promise<any> {
    try {
      // Get farm details
      const { data: farm, error: farmError } = await (supabase as any)
        .from('farms')
        .select('*')
        .eq('id', farmId)
        .eq('user_id', userId)
        .single()

      if (farmError) throw farmError

      // Create post in community feed
      const { data, error } = await (supabase as any)
        .from('posts')
        .insert({
          user_id: userId,
          title: `Farm Update: ${farm.name}`,
          body: content,
          location: farm.location,
          farm_id: farmId
        })
        .select(`
          *,
          user:user_id (
            id,
            username,
            avatar_url,
            full_name
          )
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error sharing to community:', error)
      throw error
    }
  }

  // DELETE /api/farms/:id - Delete a farm
  static async deleteFarm(farmId: string): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('farms')
        .delete()
        .eq('id', farmId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting farm:', error)
      throw error
    }
  }
}
