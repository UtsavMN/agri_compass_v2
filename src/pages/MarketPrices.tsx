import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { supabase } from '@/lib/supabase';
import { cropRecommender } from '@/lib/ai/cropRecommender';
=======
import { apiGet } from '@/lib/httpClient';
>>>>>>> 5b11f30 (Agri Compass - v2 Full-Stack Release (Decision Support System))
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
<<<<<<< HEAD
import { ScrollReveal, FadeIn } from '@/components/ui/animations';
import { TrendingUp, Calendar, Search, BarChart3, Filter, Globe, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
// Removed unused `motion` and `MiniSparkline` imports (not used in this file)

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
=======
import { ScrollReveal, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/animations';
import { TrendingUp, Search, BarChart3, Filter, IndianRupee, Sprout, Leaf, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CropEconomic {
  id: number;
  name: string;
  season: string;
  durationDays: number;
  investmentPerAcre: number;
  yieldQuintal: number;
  marketPrice: number;
  expectedReturn: number;
  profitMargin: number;
}

interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
>>>>>>> 5b11f30 (Agri Compass - v2 Full-Stack Release (Decision Support System))
}

export default function MarketPrices() {
  const { toast } = useToast();
<<<<<<< HEAD
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
      const { data, error } = await (supabase as any)
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
=======
  const [economics, setEconomics] = useState<CropEconomic[]>([]);
  const [mandiPrices, setMandiPrices] = useState<MandiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [mandiLoading, setMandiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [selectedCommodity, setSelectedCommodity] = useState('Tomato');
  const [viewMode, setViewMode] = useState<'economics' | 'live'>('economics');

  const commodities = [
    'Tomato', 'Onion', 'Potato', 'Rice', 'Wheat', 'Maize', 'Cotton',
    'Groundnut', 'Soyabean', 'Ragi', 'Jowar', 'Chilli', 'Turmeric',
    'Coconut', 'Arecanut', 'Banana', 'Mango', 'Grapes', 'Pomegranate'
  ];

  useEffect(() => {
    loadEconomics();
  }, []);

  useEffect(() => {
    if (viewMode === 'live') {
      loadMandiPrices();
    }
  }, [selectedCommodity, viewMode]);

  const loadEconomics = async () => {
    try {
      const data = await apiGet('/api/economics/all');
      setEconomics(data || []);
    } catch (error) {
      toast({ title: 'Error loading crop economics', variant: 'destructive' });
>>>>>>> 5b11f30 (Agri Compass - v2 Full-Stack Release (Decision Support System))
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
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
=======
  const loadMandiPrices = async () => {
    setMandiLoading(true);
    try {
      const data = await apiGet(`/api/market-prices/live?commodity=${selectedCommodity}&state=Karnataka&limit=15`);
      setMandiPrices(data?.records || []);
    } catch (error) {
      toast({ title: 'Error loading live prices', variant: 'destructive' });
    } finally {
      setMandiLoading(false);
    }
  };

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const filtered = economics
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(c => seasonFilter === 'all' || c.season?.toLowerCase().includes(seasonFilter.toLowerCase()));

  const chartData = filtered.slice(0, 12).map(c => ({
    name: c.name.length > 8 ? c.name.slice(0, 8) + '…' : c.name,
    profit: c.profitMargin,
    investment: c.investmentPerAcre,
  }));
>>>>>>> 5b11f30 (Agri Compass - v2 Full-Stack Release (Decision Support System))

  return (
    <Layout>
      <div className="space-y-6">
        <ScrollReveal>
<<<<<<< HEAD
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-gradient">
                Market Prices
              </h1>
              <p className="text-gray-600 mt-2">Live crop prices across Karnataka markets</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-all duration-200 card-interactive ${viewMode === 'cards' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Filter className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('charts')}
                className={`p-2 rounded-lg transition-all duration-200 card-interactive ${viewMode === 'charts' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <BarChart3 className="h-4 w-4" />
=======
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Crop Economics & Market Prices
              </h1>
              <p className="text-gray-600 mt-2">
                Strategic data for smarter farming decisions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('economics')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === 'economics' ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Sprout className="h-4 w-4 inline mr-1" /> Crop Economics
              </button>
              <button
                onClick={() => setViewMode('live')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === 'live' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <TrendingUp className="h-4 w-4 inline mr-1" /> Live Mandi Prices
>>>>>>> 5b11f30 (Agri Compass - v2 Full-Stack Release (Decision Support System))
              </button>
            </div>
          </div>
        </ScrollReveal>

<<<<<<< HEAD
        <ScrollReveal delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search crops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>

            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger className="input-field">
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
              <SelectTrigger className="input-field">
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
              <SelectTrigger className="input-field">
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
        </ScrollReveal>

        {loading ? (
          <ScrollReveal delay={0.4}>
            <div className="text-center py-12">
              <div className="loading-shimmer h-6 w-48 rounded mb-4 mx-auto"></div>
              <p className="text-gray-600">Loading market prices...</p>
            </div>
          </ScrollReveal>
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
          <ScrollReveal delay={0.4}>
            <Card className="text-center py-12 card-hover">
              <CardContent>
                <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-bounce-gentle" />
                <h3 className="text-xl font-semibold mb-2">No prices found</h3>
                <p className="text-gray-600">Try adjusting your search filters</p>
              </CardContent>
            </Card>
          </ScrollReveal>
        ) : (
          <ScrollReveal delay={0.4}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrices.map((price, index) => {
                const trend = getPriceTrend(price.price_per_unit, filteredPrices.slice(index + 1, index + 4).map(p => p.price_per_unit));
                return (
                  <FadeIn key={price.id} delay={index * 0.1}>
                    <Card className="card-hover border-green-100">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl text-green-700 flex items-center gap-2">
                              <DollarSign className="h-5 w-5" />
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
                                className={`text-xs mt-1 transition-all duration-200 ${trend > 0 ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
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
                  </FadeIn>
                );
              })}
            </div>
          </ScrollReveal>
=======
        {viewMode === 'economics' ? (
          <>
            {/* Filters */}
            <ScrollReveal delay={0.1}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search crops..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                  <SelectTrigger><SelectValue placeholder="Filter by season" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Seasons</SelectItem>
                    <SelectItem value="kharif">Kharif</SelectItem>
                    <SelectItem value="rabi">Rabi</SelectItem>
                    <SelectItem value="zaid">Zaid</SelectItem>
                    <SelectItem value="year-round">Year-Round</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </ScrollReveal>

            {/* Profit Chart */}
            <ScrollReveal delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    Profit vs Investment Per Acre (₹)
                  </CardTitle>
                  <CardDescription>Compare investment required against potential profit for each crop</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => [formatINR(value)]} />
                        <Bar dataKey="investment" name="Investment" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="profit" name="Profit" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, i) => (
                            <Cell key={i} fill={entry.profit > 0 ? '#16a34a' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Crop Cards */}
            {loading ? (
              <div className="text-center py-12"><p className="text-gray-600">Loading crop economics...</p></div>
            ) : (
              <ScrollReveal delay={0.3}>
                <StaggerContainer staggerDelay={0.05}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((crop) => (
                      <StaggerItem key={crop.id}>
                        <Card className="card-hover border-green-50 overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg text-green-700 flex items-center gap-2">
                                  <Leaf className="h-4 w-4" />
                                  {crop.name}
                                </CardTitle>
                                <CardDescription className="text-xs mt-1">
                                  {crop.season} • {crop.durationDays > 0 ? `${crop.durationDays} days` : 'Perennial'}
                                </CardDescription>
                              </div>
                              <Badge
                                className={`text-xs ${crop.profitMargin > 50000 ? 'bg-green-100 text-green-800' : crop.profitMargin > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                              >
                                {crop.profitMargin > 50000 ? 'High Profit' : crop.profitMargin > 0 ? 'Moderate' : 'Low'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 pt-2">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-amber-50 rounded-lg p-3 text-center">
                                <p className="text-xs text-amber-600 font-medium">Investment</p>
                                <p className="text-sm font-bold text-amber-800">{formatINR(crop.investmentPerAcre)}</p>
                                <p className="text-[10px] text-amber-500">per acre</p>
                              </div>
                              <div className="bg-green-50 rounded-lg p-3 text-center">
                                <p className="text-xs text-green-600 font-medium">Expected Return</p>
                                <p className="text-sm font-bold text-green-800">{formatINR(crop.expectedReturn)}</p>
                                <p className="text-[10px] text-green-500">per acre</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                              <div className="text-center flex-1">
                                <p className="text-[10px] text-gray-500">Yield</p>
                                <p className="text-xs font-bold">{crop.yieldQuintal} q/acre</p>
                              </div>
                              <div className="h-8 w-px bg-gray-200"></div>
                              <div className="text-center flex-1">
                                <p className="text-[10px] text-gray-500">Market Price</p>
                                <p className="text-xs font-bold">{formatINR(crop.marketPrice)}/q</p>
                              </div>
                              <div className="h-8 w-px bg-gray-200"></div>
                              <div className="text-center flex-1">
                                <p className="text-[10px] text-gray-500">Net Profit</p>
                                <p className={`text-xs font-bold ${crop.profitMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {crop.profitMargin > 0 ? <ArrowUpRight className="h-3 w-3 inline" /> : <ArrowDownRight className="h-3 w-3 inline" />}
                                  {formatINR(Math.abs(crop.profitMargin))}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </StaggerItem>
                    ))}
                  </div>
                </StaggerContainer>
              </ScrollReveal>
            )}
          </>
        ) : (
          /* Live Mandi Prices */
          <>
            <ScrollReveal delay={0.1}>
              <div className="flex items-center gap-4 flex-wrap">
                <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Select commodity" /></SelectTrigger>
                  <SelectContent>
                    {commodities.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="text-xs py-1">
                  Source: data.gov.in (Official Mandi Data)
                </Badge>
              </div>
            </ScrollReveal>

            {mandiLoading ? (
              <div className="text-center py-12"><p className="text-gray-600">Fetching live prices from Government of India API...</p></div>
            ) : mandiPrices.length === 0 ? (
              <ScrollReveal delay={0.2}>
                <Card className="text-center py-12">
                  <CardContent>
                    <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No live prices available</h3>
                    <p className="text-gray-600">Try selecting a different commodity or check back later</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ) : (
              <ScrollReveal delay={0.2}>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                        <th className="text-left p-3 font-semibold text-green-800">Market</th>
                        <th className="text-left p-3 font-semibold text-green-800">District</th>
                        <th className="text-left p-3 font-semibold text-green-800">Variety</th>
                        <th className="text-right p-3 font-semibold text-green-800">Min ₹</th>
                        <th className="text-right p-3 font-semibold text-green-800">Max ₹</th>
                        <th className="text-right p-3 font-semibold text-green-800">Modal ₹</th>
                        <th className="text-left p-3 font-semibold text-green-800">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mandiPrices.map((rec, i) => (
                        <tr key={i} className="border-b hover:bg-green-50/50 transition-colors">
                          <td className="p-3 font-medium">{rec.market}</td>
                          <td className="p-3 text-gray-600">{rec.district}</td>
                          <td className="p-3 text-gray-600">{rec.variety || '-'}</td>
                          <td className="p-3 text-right font-mono">{formatINR(Number(rec.min_price))}</td>
                          <td className="p-3 text-right font-mono">{formatINR(Number(rec.max_price))}</td>
                          <td className="p-3 text-right font-mono font-bold text-green-700">{formatINR(Number(rec.modal_price))}</td>
                          <td className="p-3 text-gray-500 text-xs">{rec.arrival_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollReveal>
            )}
          </>
>>>>>>> 5b11f30 (Agri Compass - v2 Full-Stack Release (Decision Support System))
        )}
      </div>
    </Layout>
  );
}
