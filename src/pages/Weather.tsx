import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, Search } from 'lucide-react';

export default function Weather() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useState(profile?.location || '');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    toast({
      title: 'Weather feature coming soon',
      description: 'Weather integration with real-time forecasts will be available soon.',
    });

    setLoading(false);
  };

  const mockWeatherData = {
    location: 'Punjab, India',
    current: {
      temp: 28,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12,
      visibility: 10,
      pressure: 1013,
    },
    forecast: [
      { day: 'Today', high: 32, low: 24, condition: 'Sunny', icon: Sun },
      { day: 'Tomorrow', high: 30, low: 23, condition: 'Partly Cloudy', icon: Cloud },
      { day: 'Wednesday', high: 28, low: 22, condition: 'Rainy', icon: CloudRain },
      { day: 'Thursday', high: 29, low: 23, condition: 'Cloudy', icon: Cloud },
      { day: 'Friday', high: 31, low: 24, condition: 'Sunny', icon: Sun },
    ],
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Weather Forecast
          </h1>
          <p className="text-gray-600 mt-2">Stay updated with weather conditions for better farming decisions</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Enter your location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
            Search
          </Button>
        </form>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Current Weather</CardTitle>
            <CardDescription className="text-blue-100">{mockWeatherData.location}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-6xl font-bold">{mockWeatherData.current.temp}°C</div>
                <div className="text-xl mt-2">{mockWeatherData.current.condition}</div>
              </div>
              <Cloud className="h-24 w-24 text-blue-100" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-400">
              <div className="flex items-center space-x-2">
                <Droplets className="h-5 w-5 text-blue-100" />
                <div>
                  <div className="text-sm text-blue-100">Humidity</div>
                  <div className="font-semibold">{mockWeatherData.current.humidity}%</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Wind className="h-5 w-5 text-blue-100" />
                <div>
                  <div className="text-sm text-blue-100">Wind</div>
                  <div className="font-semibold">{mockWeatherData.current.windSpeed} km/h</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-100" />
                <div>
                  <div className="text-sm text-blue-100">Visibility</div>
                  <div className="font-semibold">{mockWeatherData.current.visibility} km</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Gauge className="h-5 w-5 text-blue-100" />
                <div>
                  <div className="text-sm text-blue-100">Pressure</div>
                  <div className="font-semibold">{mockWeatherData.current.pressure} mb</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-bold mb-4">5-Day Forecast</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {mockWeatherData.forecast.map((day, index) => {
              const Icon = day.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg">{day.day}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Icon className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                    <div className="space-y-1">
                      <div className="text-2xl font-bold">{day.high}°</div>
                      <div className="text-gray-500 text-sm">{day.low}°</div>
                      <div className="text-sm text-gray-600 mt-2">{day.condition}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <Sun className="h-5 w-5 mr-2" />
              Farming Advisory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700">
            <p>• Good weather conditions for field activities today</p>
            <p>• Light rain expected on Wednesday - plan irrigation accordingly</p>
            <p>• Moderate wind speeds suitable for pesticide application</p>
            <p>• UV index is high - use proper sun protection when working outdoors</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
