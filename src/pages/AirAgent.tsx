import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { airAgent, ChatMessage } from '@/lib/ai/airAgent';
import { Mic } from 'lucide-react';

type LocalChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

function generateId(): string {
  return Math.random().toString(36).slice(2);
}

export default function AirAgent() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<LocalChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem('airagent_chat_messages');
      return raw ? (JSON.parse(raw) as LocalChatMessage[]) : [];
    } catch {
      return [];
    }
  });
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem('airagent_chat_messages', JSON.stringify(messages));
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
    const userMsg: LocalChatMessage = {
      id: generateId(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      const history: ChatMessage[] = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const answer = await airAgent.sendMessage(history, profile?.location || 'Karnataka');
      const assistantMsg: LocalChatMessage = {
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">AirAgent</h1>
          <p className="text-gray-600 mt-2">Your AI-powered agricultural assistant for Karnataka farmers</p>
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
                placeholder="Ask about crops, weather, or farming advice..."
                disabled={sending}
              />
              <Button variant="outline" size="icon" disabled={sending}>
                <Mic className="h-4 w-4" />
              </Button>
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


