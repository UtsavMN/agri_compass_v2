import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { translateToKannada } from '@/lib/translator'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { PostCard } from '@/components/ui/post-card'
import { useToast } from '@/hooks/use-toast'
import { Plus, ImagePlus, Video } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

export default function Community() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [posts, setPosts] = useState<Record<string, unknown>[]>([])
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
      const { data, error } = await supabase
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

      if (error) throw error
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


      // Translate caption to Kannada (non-blocking if translator fails)
      let knCaption = ''
      try {
        knCaption = await translateToKannada(newPostContent)
      } catch (e) {
        console.warn('Translation failed', e)
      }

      // Create post (includes Kannada caption). If the database doesn't
      // have the `kn_caption` column yet, try again without it.
      let insertError: any = null
      try {
        const { error } = await supabase.from('posts').insert({
          user_id: user?.id,
          content: newPostContent,
          kn_caption: knCaption || null,
          images: mediaUrls,
        });
        if (error) throw error;
      } catch (err: any) {
        insertError = err;
        // Detect missing-column error (Postgres) and retry without kn_caption
        const msg = String(err?.message || err?.toString() || '').toLowerCase();
        if (msg.includes('kn_caption') || msg.includes('column') || msg.includes('does not exist')) {
          try {
            const { error: retryError } = await supabase.from('posts').insert({
              user_id: user?.id,
              content: newPostContent,
              images: mediaUrls,
            });
            if (retryError) throw retryError;
            insertError = null;
          } catch (retryErr) {
            insertError = retryErr;
          }
        }
      }

      if (insertError) throw insertError;

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
      const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', user?.id)
        .single()

      if (existingLike) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user?.id)
      } else {
        await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user?.id
          })
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
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

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

        <div className="grid gap-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              onLike={handleLike}
              onComment={handleComment}
              onDelete={handleDeletePost}
              onShare={(postId: string) => {
                navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`)
              }}
            />
          ))}
        </div>

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
