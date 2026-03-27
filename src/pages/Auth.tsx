import { Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Auth() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <Sprout className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Agri Compass
          </h1>
          <p className="text-gray-600">Your Complete Farming Assistant</p>
        </div>

        <div className="bg-white p-6 rounded-lg text-center shadow-sm">
          <p className="mb-4">Authentication is bypassed for local development.</p>
          <Link to="/" className="text-leaf-600 font-medium hover:text-leaf-700">Go back to the application</Link>
        </div>
      </div>
    </div>
  );
}
