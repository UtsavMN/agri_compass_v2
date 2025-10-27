import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, MapPin, Calendar, Search } from 'lucide-react';

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

export default function MarketPrices() {
  const { toast } = useToast();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    loadPrices();
  }, []);

  useEffect(() => {
    filterPrices();
  }, [searchTerm, locationFilter, prices]);

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

      const uniqueLocations = [...new Set(data?.map(p => p.location) || [])];
      setLocations(uniqueLocations);
    } catch (error: any) {
      toast({
        title: 'Error loading market prices',
        description: error.message,
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

    setFilteredPrices(filtered);
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
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Market Prices
          </h1>
          <p className="text-gray-600 mt-2">Live crop prices across different markets</p>
        </div>

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
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading market prices...</p>
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
            {filteredPrices.map((price) => (
              <Card
                key={price.id}
                className="hover:shadow-lg transition-shadow duration-300 border-green-100"
              >
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
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-green-600" />
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
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
