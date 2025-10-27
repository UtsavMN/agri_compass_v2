import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, TrendingUp, Users, Cloud, FileText, HelpCircle, MapPin, Leaf } from 'lucide-react';

export default function Index() {
  const features = [
    {
      icon: MapPin,
      title: 'Location-Based Insights',
      description: 'Get personalized farming recommendations based on your location and soil type',
    },
    {
      icon: Leaf,
      title: 'Crop Management',
      description: 'Track your crops, manage expenses, and monitor yields efficiently',
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Market Prices',
      description: 'Stay updated with latest crop prices across different markets',
    },
    {
      icon: FileText,
      title: 'Government Schemes',
      description: 'Access information about subsidies, loans, and government programs',
    },
    {
      icon: Users,
      title: 'Farmer Community',
      description: 'Connect with fellow farmers, share knowledge and experiences',
    },
    {
      icon: HelpCircle,
      title: 'Expert Consultation',
      description: 'Get answers from agricultural experts for your farming questions',
    },
    {
      icon: Cloud,
      title: 'Weather Forecasts',
      description: 'Plan your farming activities with accurate weather predictions',
    },
    {
      icon: Sprout,
      title: 'Best Practices',
      description: 'Learn modern farming techniques and sustainable practices',
    },
  ];

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
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-green-600 hover:bg-green-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div
        className="relative h-[600px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Your Complete Farming Assistant
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto drop-shadow-md">
            Empowering farmers with technology, knowledge, and community support for better yields and sustainable farming
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6">
                Start Your Journey
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/90">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600">
            Comprehensive tools and resources for modern farming
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-green-100"
              >
                <CardHeader>
                  <div className="mb-3 p-3 bg-green-100 rounded-full w-fit">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-600 to-emerald-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join Thousands of Farmers
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Be part of a growing community that's transforming Indian agriculture with technology and knowledge
          </p>
          <Link to="/auth">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-6"
            >
              Get Started for Free
            </Button>
          </Link>
        </div>
      </div>

      <footer className="bg-white border-t border-green-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2025 Agri Compass. Empowering farmers across India.</p>
        </div>
      </footer>
    </div>
  );
}
