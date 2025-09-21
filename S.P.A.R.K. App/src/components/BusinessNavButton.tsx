import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBusiness } from '@/contexts/BusinessContext';
import { Building2, Store, Briefcase } from 'lucide-react';

export const BusinessNavButton: React.FC = () => {
  const { isLoggedIn, currentBusiness, logoutBusiness } = useBusiness();

  if (isLoggedIn && currentBusiness) {
    return (
      <div className="flex items-center space-x-2">
        <Link to="/business/dashboard">
          <Button
            variant="outline"
            size="sm"
            className="bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Business Dashboard
          </Button>
        </Link>
        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
          {currentBusiness.name}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={logoutBusiness}
          className="text-gray-400 hover:text-white"
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Link to="/business">
        <Button
          variant="outline"
          size="sm"
          className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
        >
          <Store className="w-4 h-4 mr-2" />
          For Businesses
        </Button>
      </Link>
    </div>
  );
};
