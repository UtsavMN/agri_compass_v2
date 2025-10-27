import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Heart, MessageCircle, User, Search } from 'lucide-react';

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    username: string | null;
    full_name: string | null;
  };
}

export default function Community() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
  });

  const categories = [
    'General Discussion',
    'Crop Tips',
    'Pest Management',
    'Market Updates',
    'Success Stories',
    'Questions',
    'Technology',
    'Weather & Climate',
  ];

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [searchTerm, categoryFilter, posts]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles (
            username,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading posts',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = posts;

    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((post) => post.category === categoryFilter);
    }

    setFilteredPosts(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to create a post',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('community_posts').insert([
        {
          user_id: user.id,
          title: formData.title,
          content: formData.content,
          category: formData.category,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Post created!',
        description: 'Your post has been shared with the community.',
      });

      setDialogOpen(false);
      setFormData({ title: '', content: '', category: '' });
      loadPosts();
    } catch (error: any) {
      toast({
        title: 'Error creating post',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to like posts',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error: likeError } = await supabase
        .from('post_likes')
        .insert([{ post_id: postId, user_id: user.id }]);

      if (likeError) {
        if (likeError.code === '23505') {
          const { error: unlikeError } = await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);

          if (unlikeError) throw unlikeError;
        } else {
          throw likeError;
        }
      }

      loadPosts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'General Discussion': 'bg-gray-100 text-gray-800',
      'Crop Tips': 'bg-green-100 text-green-800',
      'Pest Management': 'bg-red-100 text-red-800',
      'Market Updates': 'bg-blue-100 text-blue-800',
      'Success Stories': 'bg-yellow-100 text-yellow-800',
      'Questions': 'bg-purple-100 text-purple-800',
      'Technology': 'bg-indigo-100 text-indigo-800',
      'Weather & Climate': 'bg-cyan-100 text-cyan-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Community
            </h1>
            <p className="text-gray-600 mt-2">Connect with fellow farmers and share knowledge</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create a Post</DialogTitle>
                <DialogDescription>Share your thoughts with the community</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="What's on your mind?"
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
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Share your thoughts, tips, or questions..."
                    rows={6}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Post
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading community posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-4">Be the first to share with the community</p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {(post.profiles.full_name || post.profiles.username || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {post.profiles.full_name || post.profiles.username || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
                      </div>
                    </div>
                    <Badge className={getCategoryColor(post.category)}>{post.category}</Badge>
                  </div>
                  <CardTitle className="text-xl mt-4">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
                  <div className="flex items-center space-x-4 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className="text-gray-600 hover:text-red-500"
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes_count}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments_count}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
