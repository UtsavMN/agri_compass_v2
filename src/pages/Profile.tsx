import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, MapPin, Phone, Globe, Save } from 'lucide-react';

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    phone: '',
    location: '',
    language_preference: 'en',
  });
  const [posts, setPosts] = useState<Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
  }>>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        language_preference: profile.language_preference || 'en',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user?.id) {
      void loadUserPosts(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadUserPosts = async (nextPage: number) => {
    if (!user?.id) return;
    setLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((nextPage - 1) * PAGE_SIZE, nextPage * PAGE_SIZE - 1);
      if (error) throw error;
      if (nextPage === 1) setPosts(data || []);
      else setPosts((prev) => [...prev, ...(data || [])]);
      setPage(nextPage);
    } catch (error) {
      const err = error as { message?: string };
      toast({ title: 'Error loading posts', description: err.message ?? 'Failed to load', variant: 'destructive' });
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      toast({
        title: 'Profile updated!',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Error updating profile',
        description: err.message ?? 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

      <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  Email
                </Label>
                <Input id="email" type="email" value={user.email} disabled className="bg-gray-50" />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="Punjab, India"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-gray-500" />
                  Language Preference
                </Label>
                <Select
                  value={formData.language_preference}
                  onValueChange={(value) =>
                    setFormData({ ...formData, language_preference: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="pa">Punjabi</SelectItem>
                    <SelectItem value="bn">Bengali</SelectItem>
                    <SelectItem value="mr">Marathi</SelectItem>
                    <SelectItem value="ta">Tamil</SelectItem>
                    <SelectItem value="te">Telugu</SelectItem>
                    <SelectItem value="gu">Gujarati</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Posts</CardTitle>
          <CardDescription>Your recent community posts</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPosts && posts.length === 0 ? (
            <div className="text-sm text-gray-500">Loading posts…</div>
          ) : posts.length === 0 ? (
            <div className="text-sm text-gray-500">You have not posted yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {posts.map((p) => (
                <Card key={p.id} className="border-green-100">
                  <CardHeader>
                    <CardTitle className="text-base">{p.title}</CardTitle>
                    <CardDescription>{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 line-clamp-3 whitespace-pre-wrap">{p.content}</p>
                    <div className="text-xs text-gray-500 mt-2">{p.category} • {p.likes_count} likes • {p.comments_count} comments</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="flex justify-center pt-4">
            <Button variant="outline" onClick={() => loadUserPosts(page + 1)} disabled={loadingPosts}>
              {loadingPosts ? 'Loading…' : 'Load more'}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
}
