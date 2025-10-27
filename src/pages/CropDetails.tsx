import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, DollarSign, MapPin, Droplets, Sprout, Leaf, Truck, TrendingUp } from 'lucide-react';

export default function CropDetails() {
  const { cropName } = useParams<{ cropName: string }>();
  const navigate = useNavigate();

  const cropData: {[key: string]: any} = {
    rice: {
      name: 'Rice',
      image: 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg',
      description: 'Rice is a staple food crop grown extensively in flooded fields across India.',
      season: 'Kharif (June-October)',
      duration: '120-150 days',
      finance: {
        investment: '₹40,000-50,000 per acre',
        returns: '₹60,000-80,000 per acre',
        breakeven: '4-5 months',
      },
      land: {
        type: 'Alluvial, Clay, Loamy',
        preparation: 'Deep ploughing, leveling, and puddling required',
        spacing: '20cm x 15cm',
      },
      water: {
        requirement: 'High (1200-1500mm annually)',
        irrigation: 'Flood irrigation or drip system',
        critical: 'Transplanting, tillering, and flowering stages',
      },
      nursery: {
        seeds: '10-12 kg per acre',
        treatment: 'Treat with fungicide before sowing',
        source: 'Government seed corporations, certified dealers',
      },
      fertilizers: {
        basal: 'DAP 50kg, Urea 25kg per acre',
        top: 'Urea 50kg at tillering and panicle stages',
        organic: 'FYM 5-6 tonnes per acre',
      },
      transport: {
        harvest: 'Combine harvester or manual harvesting',
        storage: 'Store in dry, ventilated godowns',
        market: 'Sell at MSP or open market',
      },
      market: {
        msp: '₹2,183 per quintal (2024)',
        demand: 'High year-round',
        buyers: 'FCI, private traders, rice mills',
      },
    },
    wheat: {
      name: 'Wheat',
      image: 'https://images.pexels.com/photos/326082/pexels-photo-326082.jpeg',
      description: 'Wheat is a major Rabi crop and an essential cereal grain.',
      season: 'Rabi (November-April)',
      duration: '120-130 days',
      finance: {
        investment: '₹35,000-45,000 per acre',
        returns: '₹55,000-70,000 per acre',
        breakeven: '4 months',
      },
      land: {
        type: 'Loamy, Clay loam',
        preparation: 'Ploughing, harrowing, and leveling',
        spacing: 'Line sowing with 20cm row spacing',
      },
      water: {
        requirement: 'Moderate (450-650mm)',
        irrigation: '4-6 irrigations during growing period',
        critical: 'Crown root, tillering, flowering stages',
      },
      nursery: {
        seeds: '40-50 kg per acre',
        treatment: 'Seed treatment with Vitavax or Thiram',
        source: 'NSC, state seed corporations',
      },
      fertilizers: {
        basal: 'DAP 60kg per acre',
        top: 'Urea 40kg at CRI and flowering',
        organic: 'Compost 3-4 tonnes per acre',
      },
      transport: {
        harvest: 'Combine harvester',
        storage: 'Dry storage with moisture below 12%',
        market: 'Government procurement centers',
      },
      market: {
        msp: '₹2,275 per quintal (2024)',
        demand: 'Very high',
        buyers: 'FCI, flour mills, exporters',
      },
    },
    tomato: {
      name: 'Tomato',
      image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg',
      description: 'Tomato is a popular vegetable crop suitable for fresh market and processing.',
      season: 'All seasons (with irrigation)',
      duration: '90-120 days',
      finance: {
        investment: '₹50,000-70,000 per acre',
        returns: '₹1,00,000-1,50,000 per acre',
        breakeven: '3-4 months',
      },
      land: {
        type: 'Well-drained loamy soil',
        preparation: 'Deep ploughing with FYM incorporation',
        spacing: '60cm x 45cm',
      },
      water: {
        requirement: 'Moderate to high',
        irrigation: 'Drip irrigation recommended',
        critical: 'Flowering and fruit development',
      },
      nursery: {
        seeds: '150-200g per acre',
        treatment: 'Treat with Trichoderma',
        source: 'Hybrid seeds from reputed companies',
      },
      fertilizers: {
        basal: 'NPK 100kg per acre',
        top: 'Weekly fertigation through drip',
        organic: 'Vermicompost 2 tonnes per acre',
      },
      transport: {
        harvest: 'Manual picking at red ripe stage',
        storage: 'Cool storage at 10-12°C',
        market: 'Fresh market, processing units',
      },
      market: {
        msp: 'No MSP (market-driven)',
        demand: 'High throughout year',
        buyers: 'Vegetable markets, processors, hotels',
      },
    },
  };

  const crop = cropData[cropName?.toLowerCase() || ''];

  if (!crop) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Crop not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <img src={crop.image} alt={crop.name} className="w-full h-64 object-cover" />
              <CardHeader>
                <CardTitle className="text-3xl">{crop.name}</CardTitle>
                <CardDescription className="text-base">{crop.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Season:</span> {crop.season}
                  </div>
                  <div>
                    <span className="font-semibold">Duration:</span> {crop.duration}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardHeader>
              <CardTitle className="text-white">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm opacity-90">Investment</div>
                <div className="text-2xl font-bold">{crop.finance.investment}</div>
              </div>
              <div>
                <div className="text-sm opacity-90">Expected Returns</div>
                <div className="text-2xl font-bold">{crop.finance.returns}</div>
              </div>
              <div>
                <div className="text-sm opacity-90">Break-even</div>
                <div className="text-xl font-semibold">{crop.finance.breakeven}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="finance" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="finance">
              <DollarSign className="h-4 w-4 mr-2" />
              Finance
            </TabsTrigger>
            <TabsTrigger value="land">
              <MapPin className="h-4 w-4 mr-2" />
              Land
            </TabsTrigger>
            <TabsTrigger value="water">
              <Droplets className="h-4 w-4 mr-2" />
              Water
            </TabsTrigger>
            <TabsTrigger value="nursery">
              <Sprout className="h-4 w-4 mr-2" />
              Nursery
            </TabsTrigger>
            <TabsTrigger value="fertilizers">
              <Leaf className="h-4 w-4 mr-2" />
              Fertilizers
            </TabsTrigger>
            <TabsTrigger value="transport">
              <Truck className="h-4 w-4 mr-2" />
              Transport
            </TabsTrigger>
            <TabsTrigger value="market">
              <TrendingUp className="h-4 w-4 mr-2" />
              Market
            </TabsTrigger>
          </TabsList>

          <TabsContent value="finance">
            <Card>
              <CardHeader>
                <CardTitle>Financial Planning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-semibold">Investment Required</div>
                  <p className="text-gray-600">{crop.finance.investment}</p>
                </div>
                <div>
                  <div className="font-semibold">Expected Returns</div>
                  <p className="text-gray-600">{crop.finance.returns}</p>
                </div>
                <div>
                  <div className="font-semibold">Break-even Period</div>
                  <p className="text-gray-600">{crop.finance.breakeven}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="land">
            <Card>
              <CardHeader>
                <CardTitle>Land Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-semibold">Soil Type</div>
                  <p className="text-gray-600">{crop.land.type}</p>
                </div>
                <div>
                  <div className="font-semibold">Land Preparation</div>
                  <p className="text-gray-600">{crop.land.preparation}</p>
                </div>
                <div>
                  <div className="font-semibold">Plant Spacing</div>
                  <p className="text-gray-600">{crop.land.spacing}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="water">
            <Card>
              <CardHeader>
                <CardTitle>Water Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-semibold">Water Requirement</div>
                  <p className="text-gray-600">{crop.water.requirement}</p>
                </div>
                <div>
                  <div className="font-semibold">Irrigation Method</div>
                  <p className="text-gray-600">{crop.water.irrigation}</p>
                </div>
                <div>
                  <div className="font-semibold">Critical Stages</div>
                  <p className="text-gray-600">{crop.water.critical}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nursery">
            <Card>
              <CardHeader>
                <CardTitle>Seeds & Nursery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-semibold">Seed Requirement</div>
                  <p className="text-gray-600">{crop.nursery.seeds}</p>
                </div>
                <div>
                  <div className="font-semibold">Seed Treatment</div>
                  <p className="text-gray-600">{crop.nursery.treatment}</p>
                </div>
                <div>
                  <div className="font-semibold">Source</div>
                  <p className="text-gray-600">{crop.nursery.source}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fertilizers">
            <Card>
              <CardHeader>
                <CardTitle>Fertilizer Application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-semibold">Basal Application</div>
                  <p className="text-gray-600">{crop.fertilizers.basal}</p>
                </div>
                <div>
                  <div className="font-semibold">Top Dressing</div>
                  <p className="text-gray-600">{crop.fertilizers.top}</p>
                </div>
                <div>
                  <div className="font-semibold">Organic Manure</div>
                  <p className="text-gray-600">{crop.fertilizers.organic}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transport">
            <Card>
              <CardHeader>
                <CardTitle>Harvest & Transport</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-semibold">Harvesting Method</div>
                  <p className="text-gray-600">{crop.transport.harvest}</p>
                </div>
                <div>
                  <div className="font-semibold">Storage</div>
                  <p className="text-gray-600">{crop.transport.storage}</p>
                </div>
                <div>
                  <div className="font-semibold">Market Access</div>
                  <p className="text-gray-600">{crop.transport.market}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="market">
            <Card>
              <CardHeader>
                <CardTitle>Market Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-semibold">MSP / Market Price</div>
                  <p className="text-gray-600">{crop.market.msp}</p>
                </div>
                <div>
                  <div className="font-semibold">Demand</div>
                  <p className="text-gray-600">{crop.market.demand}</p>
                </div>
                <div>
                  <div className="font-semibold">Buyers</div>
                  <p className="text-gray-600">{crop.market.buyers}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
