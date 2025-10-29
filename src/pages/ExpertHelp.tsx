import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Send } from 'lucide-react'
import { chatWithAI } from '@/lib/chatbot'

interface Message {
  id: string
  content: string
  is_bot: boolean
  created_at: string
}

export default function ExpertHelp() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
      toast({
        title: 'Error loading chat history',
        description: 'Please try again later',
        variant: 'destructive',
      })
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    try {
      // Save user message
      const { data: userMessage, error: userMessageError } = await supabase
        .from('chat_messages')
        .insert({
          content: newMessage,
          user_id: user?.id,
          is_bot: false,
        })
        .select()
        .single()

      if (userMessageError) throw userMessageError

      setMessages((prev) => [...prev, userMessage])
      setNewMessage('')

      // Get AI response
      const aiResponse = await chatWithAI(newMessage)

      // Save AI response
      const { data: botMessage, error: botMessageError } = await supabase
        .from('chat_messages')
        .insert({
          content: aiResponse,
          user_id: user?.id,
          is_bot: true,
        })
        .select()
        .single()

      if (botMessageError) throw botMessageError

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error sending message',
        description: 'Please try again later',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 max-w-4xl">
        <Card>
          <div className="h-[calc(100vh-12rem)] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 mb-4 ${
                    message.is_bot ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {message.is_bot && (
                    <Avatar>
                      {/* @ts-ignore-next-line */}
                      <AvatarImage src="/bot-avatar.png" alt="Agri Assistant" />
                      {/* @ts-ignore-next-line */}
                      <AvatarFallback>AA</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`p-3 rounded-lg max-w-[80%] ${
                      message.is_bot
                        ? 'bg-gray-100'
                        : 'bg-green-600 text-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {!message.is_bot && (
                    <Avatar>
                      {/* @ts-ignore-next-line */}
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt="User" />
                      {/* @ts-ignore-next-line */}
                      <AvatarFallback>
                        {user?.email?.[0].toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything about farming..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
