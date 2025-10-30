import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import CropDetails from '@/pages/CropDetails';
import MyFarm from '@/pages/MyFarm';
import MarketPrices from '@/pages/MarketPrices';
import GovSchemes from '@/pages/GovSchemes';
import AirAgent from '@/pages/AirAgent';
import Community from '@/pages/Community';
import Profile from '@/pages/Profile';
import Weather from '@/pages/Weather';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crop/:cropName" element={<CropDetails />} />
          <Route path="/my-farm" element={<MyFarm />} />
          <Route path="/market-prices" element={<MarketPrices />} />
          <Route path="/schemes" element={<GovSchemes />} />
          <Route path="/air-agent" element={<AirAgent />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
