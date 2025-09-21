import React, { useState } from 'react';
import { useLine } from '@/contexts/LineContext';
import { Button } from '@/components/ui/button';
import { Share2, Check } from 'lucide-react';

interface LineShareButtonProps {
  deal?: any;
  business?: any;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export const LineShareButton: React.FC<LineShareButtonProps> = ({ 
  deal, 
  business, 
  className = '',
  size = 'default'
}) => {
  const { isLineMiniApp, shareDeal, shareBusiness } = useLine();
  const [isSharing, setIsSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    if (isSharing) return;
    
    setIsSharing(true);
    try {
      let success = false;
      
      if (deal) {
        success = await shareDeal(deal);
      } else if (business) {
        success = await shareBusiness(business);
      }
      
      if (success) {
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  if (!isLineMiniApp) {
    return null;
  }

  return (
    <Button
      onClick={handleShare}
      disabled={isSharing}
      size={size}
      className={`bg-green-500 hover:bg-green-600 text-white ${className}`}
    >
      {shared ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Shared!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          {isSharing ? 'Sharing...' : 'Share to LINE'}
        </>
      )}
    </Button>
  );
};
