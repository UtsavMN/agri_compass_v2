<<<<<<< HEAD
import { useState } from 'react'
=======
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
>>>>>>> 5b11f30 (Agri Compass - v2 Full-Stack Release (Decision Support System))
import { Avatar, AvatarImage, AvatarFallback } from './avatar'
import { Button } from './button'
import { Card } from './card'
import { Textarea } from './textarea'
import { format } from 'date-fns'
<<<<<<< HEAD
import { Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react'
=======
import { Heart, MessageCircle, Share2, MoreVertical, Loader2 } from 'lucide-react'
>>>>>>> 5b11f30 (Agri Compass - v2 Full-Stack Release (Decision Support System))
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'
<<<<<<< HEAD
=======
import { PostsAPI, Comment } from '@/lib/api/posts'
>>>>>>> 5b11f30 (Agri Compass - v2 Full-Stack Release (Decision Support System))

interface PostCardProps {
  post: {
    id: string
    content: string
    kn_caption?: string | null
    images?: string[]
    video_url?: string
    created_at: string
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
  onLike?: (postId: string) => void
  onComment?: (postId: string, content: string) => void
  onShare?: (postId: string) => void
  onDelete?: (postId: string) => void
  currentUserId?: string
}

export function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onDelete,
  currentUserId,
}: PostCardProps) {
  const [isCommenting, setIsCommenting] = useState(false)
  const [commentContent, setCommentContent] = useState('')
<<<<<<< HEAD
  const { toast } = useToast()

=======
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isCommenting) {
      setIsLoadingComments(true)
      PostsAPI.getComments(post.id)
        .then(setComments)
        .catch(console.error)
        .finally(() => setIsLoadingComments(false))
    }
  }, [isCommenting, post.id])

>>>>>>> 5b11f30 (Agri Compass - v2 Full-Stack Release (Decision Support System))
  const handleLike = () => {
    onLike?.(post.id)
  }

<<<<<<< HEAD
  const handleComment = () => {
    if (!commentContent.trim()) return
    onComment?.(post.id, commentContent)
    setCommentContent('')
    setIsCommenting(false)
=======
  const handleComment = async () => {
    if (!commentContent.trim()) return
    setIsSubmitting(true)
    const tempContent = commentContent
    try {
      await onComment?.(post.id, tempContent)
      setCommentContent('')
      // Re-fetch comments to display the newly posted one
      const updatedComments = await PostsAPI.getComments(post.id)
      setComments(updatedComments)
    } finally {
      setIsSubmitting(false)
    }
>>>>>>> 5b11f30 (Agri Compass - v2 Full-Stack Release (Decision Support System))
  }

  const handleShare = () => {
    onShare?.(post.id)
    toast({
      title: 'Link copied to clipboard',
      description: 'You can now share this post with others',
    })
  }

  return (
    <Card className="mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={post.user.avatar_url} />
              <AvatarFallback>{post.user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.user.full_name || post.user.username}</p>
              <p className="text-sm text-gray-500">
                {format(new Date(post.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          {currentUserId === post.user.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onDelete?.(post.id)} className="text-red-600">
                  Delete post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="mb-4 whitespace-pre-wrap">
          <p className="font-medium">{post.content}</p>
          {post.kn_caption && (
            <p className="text-sm text-gray-600 mt-2">{post.kn_caption}</p>
          )}
        </div>

        {post.images && post.images.length > 0 && (
          <div className="grid gap-2 mb-4">
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Post image ${index + 1}`}
                className="rounded-lg max-h-96 w-full object-cover"
              />
            ))}
          </div>
        )}

        {post.video_url && (
          <video
            src={post.video_url}
            controls
            className="rounded-lg max-h-96 w-full object-cover mb-4"
          />
        )}

        <div className="flex items-center gap-4 text-gray-500">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={post.isLiked ? 'text-red-500' : ''}
          >
            <Heart className="h-4 w-4 mr-1" />
            {post._count?.likes || 0}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsCommenting(!isCommenting)}>
            <MessageCircle className="h-4 w-4 mr-1" />
            {post._count?.comments || 0}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-1" />
          </Button>
        </div>

<<<<<<< HEAD
        {isCommenting && (
          <div className="mt-4">
            <Textarea
              placeholder="Write a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="mb-2"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCommenting(false)}>
                Cancel
              </Button>
              <Button onClick={handleComment}>Comment</Button>
            </div>
          </div>
        )}
=======
        <AnimatePresence>
          {isCommenting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 border-t pt-4"
            >
              
              <div className="mb-6 space-y-4">
                {isLoadingComments ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <motion.div 
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 bg-gray-50/50 p-3 rounded-lg"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user.avatar_url} />
                        <AvatarFallback>{comment.user.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm">{comment.user.full_name || comment.user.username}</span>
                          <span className="text-xs text-gray-500">{format(new Date(comment.created_at), 'MMM d')}</span>
                        </div>
                        <p className="text-sm mt-1 text-gray-800">{comment.content}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center italic">No comments yet. Be the first to share your thoughts!</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="min-h-[80px] resize-none focus-visible:ring-green-500"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsCommenting(false)}>
                    Close
                  </Button>
                  <Button size="sm" onClick={handleComment} disabled={isSubmitting || !commentContent.trim()}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post Comment'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
>>>>>>> 5b11f30 (Agri Compass - v2 Full-Stack Release (Decision Support System))
      </div>
    </Card>
  )
}
