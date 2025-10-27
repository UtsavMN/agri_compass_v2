import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import CropDetails from '@/pages/CropDetails';
import MyFarms from '@/pages/MyFarms';
import MarketPrices from '@/pages/MarketPrices';
import GovSchemes from '@/pages/GovSchemes';
import Community from '@/pages/Community';
import ExpertHelp from '@/pages/ExpertHelp';
import Weather from '@/pages/Weather';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crop/:cropName" element={<CropDetails />} />
          <Route path="/my-farms" element={<MyFarms />} />
          <Route path="/market-prices" element={<MarketPrices />} />
          <Route path="/schemes" element={<GovSchemes />} />
          <Route path="/community" element={<Community />} />
          <Route path="/expert-help" element={<ExpertHelp />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
