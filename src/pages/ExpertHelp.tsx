import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Plus, HelpCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react';

interface Question {
  id: string;
  user_id: string;
  title: string;
  question: string;
  category: string;
  status: string;
  created_at: string;
  profiles: {
    username: string | null;
    full_name: string | null;
  };
  expert_answers: Answer[];
}

interface Answer {
  id: string;
  answer: string;
  helpful_count: number;
  created_at: string;
  profiles: {
    username: string | null;
    full_name: string | null;
  };
}

export default function ExpertHelp() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    question: '',
    category: '',
  });
  const [answerText, setAnswerText] = useState('');

  const categories = [
    'Crop Selection',
    'Pest & Disease',
    'Soil Health',
    'Irrigation',
    'Fertilizers',
    'Weather',
    'Market & Sales',
    'Equipment',
    'Government Schemes',
    'Other',
  ];

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_questions')
        .select(`
          *,
          profiles (
            username,
            full_name
          ),
          expert_answers (
            id,
            answer,
            helpful_count,
            created_at,
            profiles:expert_id (
              username,
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Error loading questions',
        description: err.message ?? 'Failed to load questions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to ask a question',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('expert_questions').insert([
        {
          user_id: user.id,
          title: formData.title,
          question: formData.question,
          category: formData.category,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Question posted!',
        description: 'Experts will answer your question soon.',
      });

      setDialogOpen(false);
      setFormData({ title: '', question: '', category: '' });
      loadQuestions();
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Error posting question',
        description: err.message ?? 'Failed to post question',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedQuestion) return;

    try {
      const { error } = await supabase.from('expert_answers').insert([
        {
          question_id: selectedQuestion,
          expert_id: user.id,
          answer: answerText,
        },
      ]);

      if (error) throw error;

      const { error: statusError } = await supabase
        .from('expert_questions')
        .update({ status: 'answered' })
        .eq('id', selectedQuestion);

      if (statusError) throw statusError;

      toast({
        title: 'Answer posted!',
        description: 'Your answer has been shared.',
      });

      setAnswerDialogOpen(false);
      setAnswerText('');
      setSelectedQuestion(null);
      loadQuestions();
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Error posting answer',
        description: err.message ?? 'Failed to post answer',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      open: 'bg-yellow-100 text-yellow-800',
      answered: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Crop Selection': 'bg-green-100 text-green-800',
      'Pest & Disease': 'bg-red-100 text-red-800',
      'Soil Health': 'bg-amber-100 text-amber-800',
      'Irrigation': 'bg-blue-100 text-blue-800',
      'Fertilizers': 'bg-emerald-100 text-emerald-800',
      'Weather': 'bg-cyan-100 text-cyan-800',
      'Market & Sales': 'bg-purple-100 text-purple-800',
      'Equipment': 'bg-gray-100 text-gray-800',
      'Government Schemes': 'bg-orange-100 text-orange-800',
      'Other': 'bg-slate-100 text-slate-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Expert Help
            </h1>
            <p className="text-gray-600 mt-2">Get answers from agricultural experts</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Ask Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Ask an Expert</DialogTitle>
                <DialogDescription>
                  Get professional advice for your farming questions
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Question Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief summary of your question"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question">Your Question</Label>
                  <Textarea
                    id="question"
                    placeholder="Describe your question in detail..."
                    rows={6}
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Submit Question
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No questions yet</h3>
              <p className="text-gray-600 mb-4">Be the first to ask a question</p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ask Question
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <Card key={question.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {(question.profiles.full_name || question.profiles.username || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {question.profiles.full_name || question.profiles.username || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(question.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getCategoryColor(question.category)}>
                        {question.category}
                      </Badge>
                      <Badge className={getStatusColor(question.status)}>
                        {question.status === 'open' ? <Clock className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                        {question.status}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{question.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{question.question}</p>

                  {question.expert_answers && question.expert_answers.length > 0 ? (
                    <Accordion type="single" collapsible className="border-t pt-4">
                      <AccordionItem value="answers">
                        <AccordionTrigger className="text-sm font-semibold">
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                            {question.expert_answers.length} Answer{question.expert_answers.length !== 1 ? 's' : ''}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            {question.expert_answers.map((answer) => (
                              <div key={answer.id} className="bg-green-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="bg-green-200 text-green-800 text-xs">
                                      {(answer.profiles.full_name || answer.profiles.username || 'E')[0].toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {answer.profiles.full_name || answer.profiles.username || 'Expert'}
                                    </p>
                                    <p className="text-xs text-gray-500">{formatDate(answer.created_at)}</p>
                                  </div>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap">{answer.answer}</p>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <div className="border-t pt-4">
                      <p className="text-gray-500 text-sm mb-3">No answers yet</p>
                      {user && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedQuestion(question.id);
                            setAnswerDialogOpen(true);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Answer This Question
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={answerDialogOpen} onOpenChange={setAnswerDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Answer Question</DialogTitle>
              <DialogDescription>Share your expertise to help other farmers</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="answer">Your Answer</Label>
                <Textarea
                  id="answer"
                  placeholder="Provide a detailed and helpful answer..."
                  rows={8}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAnswerDialogOpen(false);
                    setAnswerText('');
                    setSelectedQuestion(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Submit Answer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
