import { useEffect, useRef, useState } from 'react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage as ProviderMessage, getChatbotProvider } from '@/lib/chatbot';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

function generateId(): string {
  return Math.random().toString(36).slice(2);
}

export default function Chat() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem('agri_chat_messages');
      return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    } catch {
      return [];
    }
  });
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem('agri_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setSending(true);
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      const provider = getChatbotProvider();
      const history: ProviderMessage[] = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const answer = await provider.sendMessage(history);
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: answer,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Chat error',
        description: err.message ?? 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Chartboard</h1>
          <p className="text-gray-600 mt-2">Ask crop advice or platform help</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={listRef}
              className="h-[50vh] overflow-y-auto space-y-3 border rounded-md p-3 bg-white"
            >
              {messages.length === 0 ? (
                <div className="text-sm text-gray-500">No messages yet. Say hello!</div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={
                      m.role === 'user'
                        ? 'flex justify-end'
                        : 'flex justify-start'
                    }
                  >
                    <div
                      className={
                        'max-w-[80%] rounded-lg px-3 py-2 text-sm shadow '
                        + (m.role === 'user'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-800')
                      }
                    >
                      {m.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={sending}
              />
              <Button onClick={sendMessage} disabled={sending} className="bg-green-600 hover:bg-green-700">
                {sending ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}


