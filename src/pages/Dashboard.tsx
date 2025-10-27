import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sprout, TrendingUp, Users, FileText, Cloud, HelpCircle, Leaf } from 'lucide-react';

interface Crop {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadCrops();
  }, [user, navigate]);

  const loadCrops = async () => {
    try {
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .order('name', { ascending: true })
        .limit(6);

      if (error) throw error;
      setCrops(data || []);
    } catch (error) {
      console.error('Error loading crops:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Market Prices',
      description: 'Check latest crop prices',
      icon: TrendingUp,
      color: 'bg-blue-500',
      path: '/market-prices',
    },
    {
      title: 'My Farms',
      description: 'Manage your farms',
      icon: Sprout,
      color: 'bg-green-500',
      path: '/my-farms',
    },
    {
      title: 'Community',
      description: 'Connect with farmers',
      icon: Users,
      color: 'bg-purple-500',
      path: '/community',
    },
    {
      title: 'Gov Schemes',
      description: 'Explore subsidies',
      icon: FileText,
      color: 'bg-orange-500',
      path: '/schemes',
    },
    {
      title: 'Weather',
      description: 'Check forecast',
      icon: Cloud,
      color: 'bg-cyan-500',
      path: '/weather',
    },
    {
      title: 'Expert Help',
      description: 'Ask questions',
      icon: HelpCircle,
      color: 'bg-pink-500',
      path: '/expert-help',
    },
  ];

  if (!user) return null;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Welcome back, {profile?.full_name || profile?.username || 'Farmer'}!
          </h1>
          <p className="text-gray-600 mt-2">
            {profile?.location
              ? `Farming from ${profile.location}`
              : 'Manage your farming activities and stay updated'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
                onClick={() => navigate(action.path)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`${action.color} p-3 rounded-full w-fit mx-auto mb-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Popular Crops</h2>
          {loading ? (
            <p className="text-gray-600">Loading crops...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {crops.map((crop) => (
                <Card
                  key={crop.id}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group"
                  onClick={() => navigate(`/crop/${crop.name.toLowerCase()}`)}
                >
                  {crop.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={crop.image_url}
                        alt={crop.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Leaf className="h-5 w-5 mr-2 text-green-600" />
                      {crop.name}
                    </CardTitle>
                    <CardDescription>{crop.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none">
          <CardHeader>
            <CardTitle className="text-white">Need Help?</CardTitle>
            <CardDescription className="text-white/90">
              Our agricultural experts are here to assist you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="secondary"
              onClick={() => navigate('/expert-help')}
              className="bg-white text-green-600 hover:bg-gray-100"
            >
              Ask an Expert
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
