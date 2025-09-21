import React from 'react';
import { useLine } from '@/contexts/LineContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, User, ExternalLink, Menu } from 'lucide-react';
import logo from '/logo.svg';

export const LineMobileHeader: React.FC = () => {
  const { isLineMiniApp, lineUser, environmentInfo } = useLine();

  if (!isLineMiniApp) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 mb-4 rounded-lg mx-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src={logo} 
              alt="S.P.A.R.K. Logo" 
              className="w-6 h-6 object-contain"
            />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <h2 className="font-semibold text-sm text-white">S.P.A.R.K.</h2>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs px-1 py-0">
                LINE
              </Badge>
            </div>
            {lineUser && (
              <p className="text-xs text-white">
                Hi, {lineUser.displayName}!
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {lineUser?.pictureUrl && (
            <img 
              src={lineUser.pictureUrl} 
              alt={lineUser.displayName}
              className="w-6 h-6 rounded-full border border-white/30"
            />
          )}
          <Button
            size="sm"
            variant="outline"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-6 px-2"
            onClick={() => window.open('https://line.me', '_blank')}
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
