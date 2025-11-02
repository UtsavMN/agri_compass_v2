import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { weatherAdvisor } from '@/lib/ai/weatherAdvisor';
import { cropRecommender } from '@/lib/ai/cropRecommender';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CardShimmer } from '@/components/ui/loading-shimmer';
import { useToast } from '@/hooks/use-toast';
import { Plus, Sprout, MapPin, Ruler, Droplet, Trash2, Cloud, Thermometer, Wind, CloudRain } from 'lucide-react';
import { motion } from 'framer-motion';

interface Farm {
  id: string;
  name: string;
  location: string;
  area_acres: number;
  soil_type: string | null;
  irrigation_type: string | null;
  created_at: string;
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

interface CropRecommendation {
  cropName: string;
  reason: string;
  season: string;
  expectedYield: string;
}

export default function MyFarm() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [districtData, setDistrictData] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [cropRecommendations, setCropRecommendations] = useState<CropRecommendation[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area_acres: '',
    soil_type: '',
    irrigation_type: '',
  });

  useEffect(() => {
    if (user) {
      initializePage();
    }
  }, [user]);

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

  const initializePage = async () => {
    try {
      // Load districts from CSV
      await loadDistrictDataFromCSV();

      // Set default district from profile or first available
      const defaultDistrict = profile?.location || districts[0] || '';
      setSelectedDistrict(defaultDistrict);

      // Load farms
      await loadFarms();
    } catch (error) {
      console.error('Error initializing page:', error);
    }
  };

  const loadFarms = async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFarms(data || []);
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Error loading farms',
        description: err.message ?? 'Failed to load farms',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDistrictData = async () => {
    if (!selectedDistrict) return;

    try {
      // Load weather data
      const weather = await weatherAdvisor.getWeatherData(selectedDistrict);
      setWeatherData(weather);

      // Load crop recommendations
      const recommendations = await cropRecommender.getRecommendations(selectedDistrict);
      setCropRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading district data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('farms').insert([
        {
          user_id: user?.id,
          name: formData.name,
          location: formData.location,
          area_acres: parseFloat(formData.area_acres),
          soil_type: formData.soil_type || null,
          irrigation_type: formData.irrigation_type || null,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Farm added!',
        description: 'Your farm has been successfully added.',
      });

      setDialogOpen(false);
      setFormData({
        name: '',
        location: '',
        area_acres: '',
        soil_type: '',
        irrigation_type: '',
      });
      loadFarms();
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Error adding farm',
        description: err.message ?? 'Failed to add farm',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (farmId: string) => {
    if (!confirm('Are you sure you want to delete this farm?')) return;

    try {
      const { error } = await supabase.from('farms').delete().eq('id', farmId);

      if (error) throw error;

      toast({
        title: 'Farm deleted',
        description: 'Your farm has been removed.',
      });
      loadFarms();
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Error deleting farm',
        description: err.message ?? 'Failed to delete farm',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Please sign in to manage your farms.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              My Farm
            </h1>
            <p className="text-gray-600 mt-2">Manage your farms, weather insights, and AI recommendations</p>
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

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Farm
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Farm</DialogTitle>
                  <DialogDescription>
                    Enter your farm details to start tracking crops and yields
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Farm Name</Label>
                    <Input
                      id="name"
                      placeholder="Green Valley Farm"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Punjab, India"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area (Acres)</Label>
                    <Input
                      id="area"
                      type="number"
                      step="0.01"
                      placeholder="10"
                      value={formData.area_acres}
                      onChange={(e) => setFormData({ ...formData, area_acres: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="soil">Soil Type</Label>
                    <Select
                      value={formData.soil_type}
                      onValueChange={(value) => setFormData({ ...formData, soil_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alluvial">Alluvial</SelectItem>
                        <SelectItem value="Black">Black</SelectItem>
                        <SelectItem value="Red">Red</SelectItem>
                        <SelectItem value="Laterite">Laterite</SelectItem>
                        <SelectItem value="Desert">Desert</SelectItem>
                        <SelectItem value="Mountain">Mountain</SelectItem>
                        <SelectItem value="Clay">Clay</SelectItem>
                        <SelectItem value="Sandy">Sandy</SelectItem>
                        <SelectItem value="Loamy">Loamy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="irrigation">Irrigation Type</Label>
                    <Select
                      value={formData.irrigation_type}
                      onValueChange={(value) => setFormData({ ...formData, irrigation_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select irrigation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Drip">Drip Irrigation</SelectItem>
                        <SelectItem value="Sprinkler">Sprinkler</SelectItem>
                        <SelectItem value="Canal">Canal</SelectItem>
                        <SelectItem value="Tube Well">Tube Well</SelectItem>
                        <SelectItem value="Rain Fed">Rain Fed</SelectItem>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      Add Farm
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your farms...</p>
          </div>
        ) : farms.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Sprout className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No farms yet</h3>
              <p className="text-gray-600 mb-4">Add your first farm to start managing crops and tracking yields</p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Farm
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div>
            {/* Weather and AI Recommendations Section */}
            {selectedDistrict && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Weather Card */}
                {weatherData ? (
                  <Card className="border-blue-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cloud className="h-5 w-5 text-blue-600" />
                        Weather in {selectedDistrict}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-red-500" />
                          <span className="text-2xl font-bold">{weatherData.temperature}°C</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 capitalize">{weatherData.description}</p>
                          <p className="text-xs text-gray-500">Humidity: {weatherData.humidity}%</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{weatherData.windSpeed} km/h</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CloudRain className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Precipitation</span>
                        </div>
                      </div>

                      {/* 5-day forecast */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">5-Day Forecast</h4>
                        <div className="space-y-1">
                          {weatherData.forecast.slice(0, 5).map((day, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span>{new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                              <span>{day.temp_min}° - {day.temp_max}°</span>
                              <span className="text-gray-500">{day.precipitation > 0 ? `${day.precipitation}mm` : '0mm'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <CardShimmer />
                )}

                {/* Crop Recommendations with Details */}
                {cropRecommendations.length > 0 ? (
                  <Card className="border-green-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-green-600" />
                        Recommended Crops for {selectedDistrict}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {cropRecommendations.slice(0, 3).map((rec, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border rounded-lg p-4 bg-green-50/50"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-green-800 text-lg">{rec.cropName}</h4>
                                <p className="text-sm text-gray-600">{rec.reason}</p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {rec.season}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 font-medium mb-2">Expected: {rec.expectedYield}</p>

                            {/* District-specific information from CSV */}
                            {(() => {
                              const districtInfo = districtData.find(d => d.district === selectedDistrict);
                              return districtInfo ? (
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
                              ) : null;
                            })()}
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <CardShimmer />
                )}
              </div>
            )}

            {/* Farms Grid */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Farms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {farms.map((farm, index) => (
                  <motion.div
                    key={farm.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow duration-300 border-green-100">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl text-green-700">{farm.name}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {farm.location}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(farm.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Ruler className="h-4 w-4 mr-2 text-green-600" />
                          <span className="font-medium">{farm.area_acres} acres</span>
                        </div>
                        {farm.soil_type && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Sprout className="h-4 w-4 mr-2 text-green-600" />
                            <span>{farm.soil_type} soil</span>
                          </div>
                        )}
                        {farm.irrigation_type && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Droplet className="h-4 w-4 mr-2 text-blue-600" />
                            <span>{farm.irrigation_type}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
