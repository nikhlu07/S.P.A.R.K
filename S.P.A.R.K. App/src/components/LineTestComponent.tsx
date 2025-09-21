import React from 'react';
import { useLine } from '@/contexts/LineContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const LineTestComponent: React.FC = () => {
  const { isLineMiniApp, lineUser, isInitialized, environmentInfo } = useLine();

  if (!isInitialized) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <p className="text-white">Initializing LINE integration...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg space-y-4">
      <h3 className="text-white font-semibold">LINE Mini App Status</h3>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-gray-300">Environment:</span>
          <Badge variant={isLineMiniApp ? "default" : "secondary"}>
            {isLineMiniApp ? "LINE Mini App" : "Web Browser"}
          </Badge>
        </div>
        
        {lineUser && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-300">User:</span>
            <span className="text-white">{lineUser.displayName}</span>
          </div>
        )}
        
        {environmentInfo && (
          <div className="space-y-1">
            <div className="text-xs text-gray-400">
              DApp ID: {environmentInfo.dappId}
            </div>
            <div className="text-xs text-gray-400">
              User Agent: {environmentInfo.userAgent.substring(0, 50)}...
            </div>
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-300">
        {isLineMiniApp 
          ? "✅ Running in LINE Mini App environment" 
          : "ℹ️ Running in regular web browser"
        }
      </div>
    </div>
  );
};
