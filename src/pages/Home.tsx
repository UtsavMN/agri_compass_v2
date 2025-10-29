import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { translateToKannada, containsKannada } from '@/lib/ai/translator';
import { cropRecommender, DetailedCropData } from '@/lib/ai/cropRecommender';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PostCard } from '@/components/ui/post-card';
import { CropCard } from '@/components/ui/crop-card';
import { useToast } from '@/hooks/use-toast';
import { Sprout, Search, Plus, MessageCircle, Heart, Globe, MapPin, Leaf, TrendingUp, FileText, Users, HelpCircle, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';

interface Post {
  id: string;
  content: string;
  kn_caption?: string | null;
  images?: string[];
  video_url?: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
    full_name?: string;
  };
  _count?: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
}

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [language, setLanguage] = useState<'en' | 'kn'>('en');
  const [translating, setTranslating] = useState(false);
  const [detailedCrops, setDetailedCrops] = useState<DetailedCropData[]>([]);
  const [cropsLoading, setCropsLoading] = useState(true);
  useEffect(() => {
    loadPosts();
    loadDetailedCrops();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [searchTerm, categoryFilter]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          user:profiles!community_posts_user_id_fkey (
            id,
            username,
            avatar_url,
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Add like/comment counts and user's like status
      const postsWithCounts = await Promise.all(
        (data || []).map(async (post) => {
          const [likesData, commentsData, userLikeData] = await Promise.all([
            supabase
              .from('post_likes')
              .select('id', { count: 'exact' })
              .eq('post_id', post.id),
            supabase
              .from('post_comments')
              .select('id', { count: 'exact' })
              .eq('post_id', post.id),
            user ? supabase
              .from('post_likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .single() : Promise.resolve({ data: null })
          ]);

          return {
            ...post,
            _count: {
              likes: likesData.count || 0,
              comments: commentsData.count || 0,
            },
            isLiked: !!userLikeData.data,
          };
        })
      );

      setPosts(postsWithCounts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: 'Error loading posts',
        description: 'Failed to load community posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDetailedCrops = async () => {
    try {
      const crops = await cropRecommender.getAllCrops();
      // Show first 6 crops for the home page
      setDetailedCrops(crops.slice(0, 6));
    } catch (error) {
      console.error('Error loading detailed crops:', error);
    } finally {
      setCropsLoading(false);
    }
  };

  const filterPosts = () => {
    // For now, just return all posts. In future, implement search and category filtering
    // This would require adding search functionality to the database
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
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.isLiked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, isLiked: false, _count: { ...p._count!, likes: p._count!.likes - 1 } }
            : p
        ));
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, isLiked: true, _count: { ...p._count!, likes: p._count!.likes + 1 } }
            : p
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (postId: string, content: string) => {
    if (!user) return;

    try {
      await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
        });

      // Update comment count
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, _count: { ...p._count!, comments: p._count!.comments + 1 } }
          : p
      ));

      toast({
        title: 'Comment added!',
        description: 'Your comment has been posted.',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleShare = async (postId: string) => {
    const url = `${window.location.origin}/post/${postId}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: 'Link copied!',
      description: 'Post link has been copied to clipboard.',
    });
  };

  const handleDelete = async (postId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({
        title: 'Post deleted',
        description: 'Your post has been removed.',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const toggleLanguage = async () => {
    setTranslating(true);
    try {
      const newLanguage = language === 'en' ? 'kn' : 'en';
      setLanguage(newLanguage);

      // Translate posts if switching to Kannada
      if (newLanguage === 'kn') {
        const translatedPosts = await Promise.all(
          posts.map(async (post) => {
            if (!post.kn_caption && !containsKannada(post.content)) {
              const translated = await translateToKannada(post.content);
              return { ...post, kn_caption: translated };
            }
            return post;
          })
        );
        setPosts(translatedPosts);
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
        <nav className="bg-white/80 backdrop-blur-sm border-b border-green-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Sprout className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Agri Compass
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => window.location.href = '/auth'}>Sign In</Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => window.location.href = '/auth'}>Get Started</Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
              Welcome to Agri Compass
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Karnataka's AI-powered agricultural platform connecting farmers, experts, and communities
            </p>
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6"
              onClick={() => window.location.href = '/auth'}
            >
              Join Our Community
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {language === 'kn' ? 'ಕೃಷಿ ಸಮುದಾಯ' : 'Farmer Community'}
            </h1>
            <p className="text-gray-600 mt-2">
              {language === 'kn' ? 'ಕೃಷಿಕರೊಂದಿಗೆ ಜ್ಞಾನ ಹಂಚಿಕೊಳ್ಳಿ ಮತ್ತು ಸಂಪರ್ಕಿಸಿ' : 'Share knowledge and connect with fellow farmers'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={toggleLanguage}
              disabled={translating}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              {translating ? 'Translating...' : (language === 'en' ? 'ಕನ್ನಡ' : 'English')}
            </Button>

            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              {language === 'kn' ? 'ಪೋಸ್ಟ್ ಮಾಡಿ' : 'New Post'}
            </Button>
          </div>
        </div>

        {/* Detailed Crop Information Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Leaf className="h-6 w-6 mr-2 text-green-600" />
              {language === 'kn' ? 'ವಿವರವಾದ ಬೆಳೆ ಮಾಹಿತಿ' : 'Detailed Crop Information'}
            </CardTitle>
            <CardDescription>
              {language === 'kn' ? 'ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಬೆಳೆಗಳ ಬಗ್ಗೆ ವಿವರವಾದ ಮಾಹಿತಿ ಪಡೆಯಿರಿ' : 'Get detailed information about major crops in Karnataka'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cropsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">{language === 'kn' ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading crops...'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {detailedCrops.map((crop) => (
                  <CropCard
                    key={crop.crop}
                    crop={crop}
                    onViewDetails={(crop) => {
                      // Handle view details - could open modal or navigate
                      console.log('View details for:', crop.crop);
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">{language === 'kn' ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading posts...'}</p>
                </div>
              ) : posts.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {language === 'kn' ? 'ಇನ್ನೂ ಪೋಸ್ಟ್ ಇಲ್ಲ' : 'No posts yet'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {language === 'kn' ? 'ಮೊದಲ ಪೋಸ್ಟ್ ಮಾಡಿ!' : 'Be the first to share something!'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PostCard
                      post={post}
                      onLike={handleLike}
                      onComment={handleComment}
                      onShare={handleShare}
                      onDelete={handleDelete}
                      currentUserId={user.id}
                    />
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'kn' ? 'ಶೋಧನೆ' : 'Search & Filter'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={language === 'kn' ? 'ಪೋಸ್ಟ್ ಹುಡುಕಿ...' : 'Search posts...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'kn' ? 'ವರ್ಗವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ' : 'Select category'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'kn' ? 'ಎಲ್ಲಾ' : 'All'}</SelectItem>
                    <SelectItem value="crops">{language === 'kn' ? 'ಬೆಳೆಗಳು' : 'Crops'}</SelectItem>
                    <SelectItem value="weather">{language === 'kn' ? 'ಹವಾಮಾನ' : 'Weather'}</SelectItem>
                    <SelectItem value="market">{language === 'kn' ? 'ಮಾರುಕಟ್ಟೆ' : 'Market'}</SelectItem>
                    <SelectItem value="advice">{language === 'kn' ? 'ಸಲಹೆ' : 'Advice'}</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'kn' ? 'ನಮ್ಮ ಸಮುದಾಯದಲ್ಲಿ' : 'Trending in Community'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>{language === 'kn' ? 'ಅತ್ಯಂತ ಲೈಕ್ ಆದ ಪೋಸ್ಟ್' : 'Most liked post'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    <span>{language === 'kn' ? 'ಅತ್ಯಂತ ಚರ್ಚಿತ ಪೋಸ್ಟ್' : 'Most discussed post'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sprout className="h-4 w-4 text-green-500" />
                    <span>{language === 'kn' ? 'ಈ ವಾರದ ಟಿಪ್' : 'Tip of the week'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
