// API endpoints for posts management
import { supabase } from '@/lib/supabase'

export interface Post {
  id: string
  user_id: string
  title?: string
  body?: string
  content?: string
  crop_tags?: string[]
  location?: string
  images?: string[]
  created_at: string
  updated_at?: string
  user: {
    id: string
    username: string
    avatar_url?: string
    full_name?: string
  }
  _count?: {
    likes: number
    comments: number
  }
  isLiked?: boolean
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  user: {
    id: string
    username: string
    avatar_url?: string
    full_name?: string
  }
}

export interface Notification {
  id: string
  user_id: string
  type: 'like' | 'comment' | 'follow' | 'mention'
  ref_id: string // post_id or comment_id
  read: boolean
  created_at: string
}

export class PostsAPI {
  // GET /api/posts - Retrieve all posts in reverse chronological order with filters
  static async getPosts(filters?: {
    crop?: string
    location?: string
    user?: string
    q?: string
  }): Promise<Post[]> {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          user:user_id (
            id,
            username,
            avatar_url,
            full_name
          ),
          likes:likes(count),
          comments:comments(count)
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.crop) {
        query = query.contains('crop_tags', [filters.crop])
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }
      if (filters?.user) {
        query = query.ilike('user.username', `%${filters.user}%`)
      }
      if (filters?.q) {
        query = query.or(`body.ilike.%${filters.q}%,title.ilike.%${filters.q}%`)
      }

      let { data, error } = await query

      // If posts table doesn't exist, try community_posts
      if (error && error.message?.includes('relation "public.posts" does not exist')) {
        let fallbackQuery = supabase
          .from('community_posts')
          .select(`
            *,
            user:user_id (
              id,
              username,
              avatar_url,
              full_name
            ),
            likes:post_likes(count),
            comments:post_comments(count)
          `)
          .order('created_at', { ascending: false })

        // Apply same filters to fallback
        if (filters?.crop) {
          fallbackQuery = fallbackQuery.ilike('category', `%${filters.crop}%`)
        }
        if (filters?.location) {
          fallbackQuery = fallbackQuery.ilike('location', `%${filters.location}%`)
        }
        if (filters?.user) {
          fallbackQuery = fallbackQuery.ilike('user.username', `%${filters.user}%`)
        }
        if (filters?.q) {
          fallbackQuery = fallbackQuery.or(`content.ilike.%${filters.q}%,title.ilike.%${filters.q}%`)
        }

        const { data: fallbackData, error: fallbackError } = await fallbackQuery

        if (fallbackError) throw fallbackError
        data = fallbackData
      } else if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching posts:', error)
      throw error
    }
  }

  // POST /api/posts - Create a new post
  static async createPost(postData: {
    user_id: string
    title?: string
    body: string
    crop_tags?: string[]
    location?: string
    images?: string[]
  }): Promise<Post> {
    try {
      // Try posts table first
      let { data, error } = await supabase
        .from('posts')
        .insert([postData])
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

      // If posts table doesn't exist, try community_posts
      if (error && error.message?.includes('relation "public.posts" does not exist')) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('community_posts')
          .insert([{
            user_id: postData.user_id,
            title: postData.title || '',
            content: postData.body,
            images: postData.images || [],
            category: 'general'
          }])
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

        if (fallbackError) throw fallbackError
        data = fallbackData
      } else if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    }
  }

  // DELETE /api/posts/:id - Delete a post
  static async deletePost(postId: string): Promise<void> {
    try {
      // Try posts table first, fallback to community_posts
      let error: any = null
      try {
        const { error: deleteError } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId)
        if (deleteError) throw deleteError
      } catch (err: any) {
        error = err
        // Try community_posts table
        if (err.message?.includes('relation "public.posts" does not exist')) {
          const { error: retryError } = await supabase
            .from('community_posts')
            .delete()
            .eq('id', postId)
          if (retryError) throw retryError
          error = null
        }
      }

      if (error) throw error
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  }

  // POST /api/posts/:id/like - Like/unlike a post
  static async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    try {
      // Check if user already liked this post
      const { data: existingLike, error: fetchError } = await supabase
        .from('likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      if (fetchError && !fetchError.message?.includes('No rows')) throw fetchError

      if (existingLike) {
        // Unlike the post
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)
        if (error) throw error

        // Get updated count
        const { count: likesCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId)

        return { liked: false, likesCount: likesCount || 0 }
      } else {
        // Like the post
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: userId })
        if (error) throw error

        // Get updated count
        const { count: likesCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId)

        return { liked: true, likesCount: likesCount || 0 }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      throw error
    }
  }

  // POST /api/posts/:id/comments - Add a comment to a post
  static async addComment(postId: string, userId: string, content: string): Promise<Comment> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content
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
      console.error('Error adding comment:', error)
      throw error
    }
  }

  // GET /api/posts/:id/comments - Get comments for a post
  static async getComments(postId: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_id (
            id,
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching comments:', error)
      throw error
    }
  }

  // GET /api/notifications - Get user notifications
  static async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }
  }

  // POST /api/notifications/:id/read - Mark notification as read
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }
}
