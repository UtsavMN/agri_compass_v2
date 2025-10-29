import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cropRecommender } from '@/lib/ai/cropRecommender';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, MapPin, Calendar, Search, BarChart3, Filter, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

interface MarketPrice {
  id: string;
  crop_id: string;
  location: string;
  price_per_unit: number;
  unit: string;
  market_name: string | null;
  date: string;
  crops: {
    name: string;
    category: string;
  };
}

interface ChartData {
  date: string;
  price: number;
  location: string;
}

export default function MarketPrices() {
  const { toast } = useToast();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [cropFilter, setCropFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [locations, setLocations] = useState<string[]>([]);
  const [crops, setCrops] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'charts'>('cards');

  useEffect(() => {
    initializePage();
  }, []);

  useEffect(() => {
    filterPrices();
    updateChartData();
  }, [searchTerm, locationFilter, cropFilter, districtFilter, prices]);

  const initializePage = async () => {
    try {
      // Load districts
      const districtList = await cropRecommender.getDistricts();
      setDistricts(districtList);

      // Load market prices
      await loadPrices();
    } catch (error) {
      console.error('Error initializing page:', error);
    }
  };

  const loadPrices = async () => {
    try {
      const { data, error } = await supabase
        .from('market_prices')
        .select(`
          *,
          crops (
            name,
            category
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      setPrices(data || []);

      // Extract unique values for filters
      const uniqueLocations = Array.from(new Set(((data || []) as any[]).map((p: any) => p.location)));
      const uniqueCrops = Array.from(new Set(((data || []) as any[]).map((p: any) => p.crops.name)));

      setLocations(uniqueLocations as string[]);
      setCrops(uniqueCrops as string[]);
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Error loading market prices',
        description: err.message ?? 'Failed to load market prices',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPrices = () => {
    let filtered = prices;

    if (searchTerm) {
      filtered = filtered.filter((price) =>
        price.crops.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter((price) => price.location === locationFilter);
    }

    if (cropFilter !== 'all') {
      filtered = filtered.filter((price) => price.crops.name === cropFilter);
    }

    if (districtFilter !== 'all') {
      filtered = filtered.filter((price) => price.location.toLowerCase().includes(districtFilter.toLowerCase()));
    }

    setFilteredPrices(filtered);
  };

  const updateChartData = () => {
    const chartPoints: ChartData[] = filteredPrices
      .slice(0, 20) // Limit to recent 20 entries for chart
      .map((price) => ({
        date: new Date(price.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        price: price.price_per_unit,
        location: price.location,
      }))
      .reverse(); // Show chronological order

    setChartData(chartPoints);
  };

  const getPriceTrend = (currentPrice: number, previousPrices: number[]) => {
    if (previousPrices.length === 0) return 0;
    const avgPrevious = previousPrices.reduce((a, b) => a + b, 0) / previousPrices.length;
    return ((currentPrice - avgPrevious) / avgPrevious) * 100;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Market Prices
            </h1>
            <p className="text-gray-600 mt-2">Live crop prices across Karnataka markets</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg ${viewMode === 'cards' ? 'bg-green-100 text-green-700' : 'text-gray-500'}`}
            >
              <Filter className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('charts')}
              className={`p-2 rounded-lg ${viewMode === 'charts' ? 'bg-green-100 text-green-700' : 'text-gray-500'}`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search crops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by district" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={cropFilter} onValueChange={setCropFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by crop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Crops</SelectItem>
              {crops.map((crop) => (
                <SelectItem key={crop} value={crop}>
                  {crop}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading market prices...</p>
          </div>
        ) : viewMode === 'charts' ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Trends</CardTitle>
                <CardDescription>Price movements over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [formatPrice(value), 'Price']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#16a34a"
                        strokeWidth={2}
                        dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Distribution by Location</CardTitle>
                <CardDescription>Average prices across different markets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.slice(-10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="location" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [formatPrice(value), 'Price']}
                      />
                      <Bar dataKey="price" fill="#16a34a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : filteredPrices.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No prices found</h3>
              <p className="text-gray-600">Try adjusting your search filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrices.map((price, index) => {
              const trend = getPriceTrend(price.price_per_unit, filteredPrices.slice(index + 1, index + 4).map(p => p.price_per_unit));
              return (
                <motion.div
                  key={price.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-300 border-green-100">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-green-700">
                            {price.crops.name}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {price.crops.category}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {formatPrice(price.price_per_unit)}
                          </div>
                          <div className="text-xs text-gray-500">per {price.unit}</div>
                          {trend !== 0 && (
                            <Badge
                              variant={trend > 0 ? "default" : "secondary"}
                              className={`text-xs mt-1 ${trend > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                            >
                              {trend > 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="h-4 w-4 mr-2 text-green-600" />
                        <span>{price.location}</span>
                      </div>
                      {price.market_name && (
                        <div className="flex items-center text-sm text-gray-600">
                          <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                          <span>{price.market_name}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(price.date)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
