import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { cropRecommender } from '@/lib/ai/cropRecommender';
import { weatherAdvisor } from '@/lib/ai/weatherAdvisor';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { CardShimmer, CropCardShimmer } from '@/components/ui/loading-shimmer';
import { Sprout, TrendingUp, Users, FileText, Cloud, Leaf, MapPin, Zap, Droplets, Thermometer } from 'lucide-react';
import { motion } from 'framer-motion';

interface Crop {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
}

interface CropRecommendation {
  cropName: string;
  reason: string;
  season: string;
  expectedYield: string;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  forecast: Array<{
    date: string;
    temp_max: number;
    temp_min: number;
    description: string;
    precipitation: number;
  }>;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [districtData, setDistrictData] = useState<any[]>([]);
  const [cropRecommendations, setCropRecommendations] = useState<CropRecommendation[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [newsItems, setNewsItems] = useState<string[]>([]);


  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    initializeDashboard();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedDistrict) {
      loadDistrictData();
    }
  }, [selectedDistrict]);

  const loadDistrictDataFromCSV = async () => {
    try {
      const response = await fetch('/districts.csv');
      const csvText = await response.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index]?.trim();
        });
        return obj;
      });
      setDistrictData(data);
      setDistricts(data.map(d => d.district));
    } catch (error) {
      console.error('Error loading district data:', error);
    }
  };

  const initializeDashboard = async () => {
    try {
      // Load districts from CSV
      await loadDistrictDataFromCSV();

      // Set default district from profile or first available
      const defaultDistrict = profile?.location || districts[0] || '';
      setSelectedDistrict(defaultDistrict);

      // Load crops
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .order('name', { ascending: true })
        .limit(6);

      if (error) throw error;
      setCrops(data || []);



      // Load news items (mock for now)
      setNewsItems([
        'New subsidy scheme announced for organic farming',
        'Weather alert: Heavy rainfall expected in coastal districts',
        'New pest-resistant rice variety released',
        'Farmers training program starting next month'
      ]);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDistrictData = async () => {
    if (!selectedDistrict) return;

    try {
      // Load crop recommendations
      const recommendations = await cropRecommender.getRecommendations(selectedDistrict);
      setCropRecommendations(recommendations);

      // Load weather data
      const weather = await weatherAdvisor.getWeatherData(selectedDistrict);
      setWeatherData(weather);
    } catch (error) {
      console.error('Error loading district data:', error);
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
      title: 'My Farm',
      description: 'Manage your farms',
      icon: Sprout,
      color: 'bg-green-500',
      path: '/my-farm',
    },
    {
      title: 'Community',
      description: 'Connect with farmers',
      icon: Users,
      color: 'bg-purple-500',
      path: '/',
    },
    {
      title: 'Gov Schemes',
      description: 'Explore subsidies',
      icon: FileText,
      color: 'bg-orange-500',
      path: '/schemes',
    },
    {
      title: 'AI Agent',
      description: 'AI farming assistant',
      icon: Zap,
      color: 'bg-cyan-500',
      path: '/air-agent',
    },
  ];

  if (!user) return null;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
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

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {districts.sort().map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
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
              </motion.div>
            );
          })}
        </div>

        {selectedDistrict && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weather Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cloud className="h-5 w-5 mr-2 text-blue-600" />
                  Weather in {selectedDistrict}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weatherData ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span className="text-2xl font-bold">{weatherData.temperature}°C</span>
                      </div>
                      <Badge variant="secondary">{weatherData.description}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span>Humidity: {weatherData.humidity}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Cloud className="h-4 w-4 text-gray-500" />
                        <span>Wind: {weatherData.windSpeed} km/h</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">5-Day Forecast</h4>
                      <div className="space-y-2">
                        {weatherData.forecast.slice(0, 3).map((day, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                            <span>{day.temp_min}° - {day.temp_max}°</span>
                            <span>{day.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <CardShimmer />
                )}
              </CardContent>
            </Card>

            {/* Crop Recommendations Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-green-600" />
                  Recommended Crops for {selectedDistrict}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cropRecommendations.length > 0 ? (
                  <div className="space-y-4">
                    {cropRecommendations.slice(0, 4).map((rec, index) => {
                      const districtInfo = districtData.find(d => d.district === selectedDistrict);
                      const recommendedCrops = districtInfo?.recommended_crops?.split(', ') || [];
                      const isRecommended = recommendedCrops.includes(rec.cropName);

                      return (
                        <div key={index} className="border rounded-lg p-4 bg-green-50/50">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-green-800 text-lg">{rec.cropName}</h4>
                            <div className="flex gap-2">
                              {isRecommended && <Badge variant="default" className="bg-green-600">Recommended</Badge>}
                              <Badge variant="outline">{rec.season}</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                          <p className="text-sm text-green-600 font-medium mb-3">Expected: {rec.expectedYield}</p>

                          {/* District-specific information from CSV */}
                          {districtInfo && (
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Soil Type:</span>
                                <p className="text-gray-600 mt-1">{districtInfo.soil_type}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Average Rainfall:</span>
                                <p className="text-gray-600 mt-1">{districtInfo.avg_rainfall}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Weather Pattern:</span>
                                <p className="text-gray-600 mt-1">{districtInfo.weather_pattern}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <CardShimmer />
                )}
              </CardContent>
            </Card>
          </div>
        )}



        <div>
          <h2 className="text-2xl font-bold mb-4">Popular Crops</h2>
          {loading ? (
            <CropCardShimmer count={6} />
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
                        loading="lazy"
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

        {/* District-wise Crop Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Crops by District</CardTitle>
            <CardDescription>
              Overview of recommended crops for all districts in Karnataka
            </CardDescription>
          </CardHeader>
          <CardContent>
            {districtData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {districtData.map((district, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-green-50/50 hover:bg-green-100/50 transition-colors">
                    <h4 className="font-semibold text-green-800 mb-2">{district.district}</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Recommended Crops:</span>
                        <p className="text-gray-600">{district.recommended_crops}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Soil Type:</span>
                        <p className="text-gray-600">{district.soil_type}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Avg Rainfall:</span>
                        <p className="text-gray-600">{district.avg_rainfall}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Weather:</span>
                        <p className="text-gray-600">{district.weather_pattern}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <CardShimmer />
            )}
          </CardContent>
        </Card>

        {/* News Section */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Agricultural News</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {newsItems.map((news, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">{news}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none">
          <CardHeader>
            <CardTitle className="text-white">Need Help?</CardTitle>
            <CardDescription className="text-white/90">
              Our AI assistant and agricultural experts are here to assist you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/air-agent')}
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                Ask AI Assistant
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
