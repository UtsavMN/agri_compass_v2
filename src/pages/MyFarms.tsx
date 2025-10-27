import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Sprout, MapPin, Ruler, Droplet, Edit, Trash2 } from 'lucide-react';

interface Farm {
  id: string;
  name: string;
  location: string;
  area_acres: number;
  soil_type: string | null;
  irrigation_type: string | null;
  created_at: string;
}

export default function MyFarms() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area_acres: '',
    soil_type: '',
    irrigation_type: '',
  });

  useEffect(() => {
    if (user) {
      loadFarms();
    }
  }, [user]);

  const loadFarms = async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFarms(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading farms',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
    } catch (error: any) {
      toast({
        title: 'Error adding farm',
        description: error.message,
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
    } catch (error: any) {
      toast({
        title: 'Error deleting farm',
        description: error.message,
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              My Farms
            </h1>
            <p className="text-gray-600 mt-2">Manage your farms and track your crops</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm) => (
              <Card
                key={farm.id}
                className="hover:shadow-lg transition-shadow duration-300 border-green-100"
              >
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
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
