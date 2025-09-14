
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface LearnMoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LearnMoreDialog: React.FC<LearnMoreDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invest in Local Businesses with Kaia</DialogTitle>
          <DialogDescription>
            <p className="mt-4 text-gray-400">
              The SPARK ecosystem empowers you to invest directly in local businesses through the Kaia network. By converting your fiat currency into KAIA, you can participate in community investment pools, purchase NFT-based coupons, and earn rewards.
            </p>
            <p className="mt-4 text-gray-400">
              This model fosters a direct connection between you and the businesses you support, creating a more resilient and transparent local economy. Your investment helps businesses grow, while you earn a return and contribute to your community's success.
            </p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
