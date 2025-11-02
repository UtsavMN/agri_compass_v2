import { supabase } from '../supabase'

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
  kn_caption?: string | null
  video_url?: string | null
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
  // GET /api/posts - Retrieve all posts in reverse chronological order with filters and caching
  static async getPosts(filters?: {
    crop?: string
    location?: string
    user?: string
    q?: string
  }): Promise<Post[]> {
    try {
      let query = supabase
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

      // Apply filters
      if (filters?.crop) {
        query = query.ilike('category', `%${filters.crop}%`)
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }
      if (filters?.user) {
        query = query.ilike('user.username', `%${filters.user}%`)
      }
      if (filters?.q) {
        query = query.or(`content.ilike.%${filters.q}%,title.ilike.%${filters.q}%`)
      }

      const { data, error } = await query

      if (error) throw error

      const posts = data || []

      return posts
    } catch (error) {
      console.error('Error fetching posts:', error)
      return []
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
    farm_id?: string
  }): Promise<Post> {
    try {
      const { data, error } = await supabase
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

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    }
  }

  // DELETE /api/posts/:id - Delete a post
  static async deletePost(postId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)

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
        .from('post_likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      if (fetchError && !fetchError.message?.includes('No rows')) throw fetchError

      if (existingLike) {
        // Unlike the post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)
        if (error) throw error

        // Get updated count
        const { count: likesCount } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId)

        return { liked: false, likesCount: likesCount || 0 }
      } else {
        // Like the post
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: userId })
        if (error) throw error

        // Get updated count
        const { count: likesCount } = await supabase
          .from('post_likes')
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
        .from('post_comments')
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
        .from('post_comments')
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
      // For now, return empty array since notifications table might not be set up
      // This can be implemented later when notifications are properly configured
      return []
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }
  }

  // POST /api/notifications/:id/read - Mark notification as read
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      // For now, do nothing since notifications table might not be set up
      // This can be implemented later when notifications are properly configured
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }
}

export async function getPosts() {
  return PostsAPI.getPosts()
}
