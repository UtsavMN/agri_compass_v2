
import { useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from './avatar'
import { Button } from './button'
import { Card } from './card'
import { Textarea } from './textarea'
import { format } from 'date-fns'
import { Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'

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
  const { toast } = useToast()

  const handleLike = () => {
    onLike?.(post.id)
  }

  const handleComment = () => {
    if (!commentContent.trim()) return
    onComment?.(post.id, commentContent)
    setCommentContent('')
    setIsCommenting(false)
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
              {/* Avatar component exposes AvatarImage and AvatarFallback from our ui/avatar.tsx */}
              {/* Use those named exports to avoid TypeScript errors */}
              {/* @ts-ignore-next-line */}
              <AvatarImage src={post.user.avatar_url} />
              {/* @ts-ignore-next-line */}
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
      </div>
    </Card>
  )
}