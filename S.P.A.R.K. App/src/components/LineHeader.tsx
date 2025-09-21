import React from 'react';
import { useLine } from '@/contexts/LineContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, User, ExternalLink } from 'lucide-react';
import logo from '/logo.svg';

export const LineHeader: React.FC = () => {
  const { isLineMiniApp, lineUser, environmentInfo } = useLine();

  if (!isLineMiniApp) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 mb-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src={logo} 
              alt="S.P.A.R.K. Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-semibold text-lg text-white">S.P.A.R.K.</h2>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                LINE Mini App
              </Badge>
            </div>
            {lineUser && (
              <p className="text-sm text-white">
                Welcome, {lineUser.displayName}!
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {lineUser?.pictureUrl && (
            <img 
              src={lineUser.pictureUrl} 
              alt={lineUser.displayName}
              className="w-8 h-8 rounded-full border-2 border-white/30"
            />
          )}
          <Button
            size="sm"
            variant="outline"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            onClick={() => window.open('https://line.me', '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {environmentInfo && (
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="flex items-center justify-between text-xs text-white">
            <span>DApp ID: {environmentInfo.dappId}</span>
            <span>Environment: LINE Mini App</span>
          </div>
        </div>
      )}
    </div>
  );
};
