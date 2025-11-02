import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { PostsAPI, Post } from '@/lib/api/posts'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { PostCard } from '@/components/ui/post-card'
import { useToast } from '@/hooks/use-toast'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/animations'
import { LottieEmptyState } from '@/components/ui/lottie-loading'
import { Plus, ImagePlus, Video } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

export default function Community() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostContent, setNewPostContent] = useState('')
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.webm']
    },
    onDrop: (acceptedFiles: File[]) => {
      setMediaFiles([...mediaFiles, ...acceptedFiles])
    }
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const data = await PostsAPI.getPosts()
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
      const msg = (error as Record<string, unknown>)?.message as string ?? String(error)
      toast({
        title: 'Error fetching posts',
        description: msg || 'Please try again later',
        variant: 'destructive'
      })
    }
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && mediaFiles.length === 0) return

    setIsLoading(true)
    try {
      // Upload media files if any
      const mediaUrls = []
      for (const file of mediaFiles) {
        const fileExt = (file.name || '').split('.').pop()
        const fileName = `${Math.random()}${Date.now()}.${fileExt}`
        const filePath = `${user?.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('post-media')
          .getPublicUrl(filePath)

        mediaUrls.push(data.publicUrl)
      }

      // Create post
      await PostsAPI.createPost({
        user_id: user?.id || '',
        body: newPostContent,
        images: mediaUrls,
      })

      setNewPostContent('')
      setMediaFiles([])
      setIsCreatingPost(false)
      fetchPosts()
      toast({
        title: 'Post created successfully',
        description: 'Your post is now visible to the community'
      })
    } catch (error) {
      console.error('Error creating post:', error)
      const msg = (error as Record<string, unknown>)?.message as string ?? String(error)
      toast({
        title: 'Error creating post',
        description: msg || 'Please try again later',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      // Check if user already liked this post
      const { data: existingLike, error: fetchError } = await supabase
        .from('likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', user?.id)
        .single()

      if (fetchError && !fetchError.message?.includes('No rows')) throw fetchError

      if (existingLike) {
        // Unlike the post
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user?.id)
        if (error) throw error
      } else {
        // Like the post
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user?.id
          })
        if (error) throw error
      }

      fetchPosts()
    } catch (error) {
      console.error('Error toggling like:', error)
      const msg = (error as Record<string, unknown>)?.message as string ?? String(error)
      toast({
        title: 'Error',
        description: msg || 'Could not like/unlike the post',
        variant: 'destructive'
      })
    }
  }

  const handleComment = async (postId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user?.id,
          content
        })
      if (error) throw error

      fetchPosts()
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted'
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      const msg = (error as Record<string, unknown>)?.message as string ?? String(error)
      toast({
        title: 'Error',
        description: msg || 'Could not add your comment',
        variant: 'destructive'
      })
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      await PostsAPI.deletePost(postId)
      fetchPosts()
      toast({
        title: 'Post deleted',
        description: 'Your post has been removed'
      })
    } catch (error) {
      console.error('Error deleting post:', error)
      const msg = (error as Record<string, unknown>)?.message as string ?? String(error)
      toast({
        title: 'Error',
        description: msg || 'Could not delete the post',
        variant: 'destructive'
      })
    }
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 relative">
        <Card className="mb-8">
          <div className="p-4">
            <Button
              onClick={() => setIsCreatingPost(true)}
              className="w-full flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create a new post
            </Button>
          </div>
        </Card>

        <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create a new post</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div
                {...getRootProps()}
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-2">
                    <ImagePlus className="h-6 w-6" />
                    <Video className="h-6 w-6" />
                  </div>
                  <p>Drop files here or click to upload</p>
                </div>
              </div>
              {mediaFiles.length > 0 && (
                <div className="grid gap-2">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="text-sm text-gray-500">
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
              <Button onClick={handleCreatePost} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Post'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <ScrollReveal direction="up" delay={0.1}>
          {posts.length > 0 ? (
            <StaggerContainer staggerDelay={0.05}>
              <div className="grid gap-4">
                {posts.map((post) => (
                  <StaggerItem key={post.id}>
                    <div className="card-mobile">
                      <PostCard
                            post={{
                              id: post.id,
                              content: post.body || post.content || '',
                              kn_caption: post.kn_caption || undefined,
                              images: post.images,
                              video_url: post.video_url ?? undefined,
                              created_at: post.created_at,
                              user: post.user,
                              _count: {
                                likes: post._count?.likes || 0,
                                comments: post._count?.comments || 0,
                              },
                              isLiked: post.isLiked,
                            }}
                        currentUserId={user?.id}
                        onLike={handleLike}
                        onComment={handleComment}
                        onDelete={handleDeletePost}
                        onShare={(postId: string) => {
                          navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`)
                        }}
                      />
                    </div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          ) : (
            <LottieEmptyState message="No posts yet. Be the first to share something!" />
          )}
        </ScrollReveal>

        {/* Floating create post button */}
        <button
          onClick={() => setIsCreatingPost(true)}
          className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-xl"
          aria-label="Create Post"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </Layout>
  )
}
