
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BusinessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  business: any; // Replace with a proper business type
}

export const BusinessDialog: React.FC<BusinessDialogProps> = ({ isOpen, onClose, business }) => {
  if (!business) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{business.name}</DialogTitle>
          <DialogDescription>{business.sector}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          <div>
            <h3 className="font-bold text-lg mb-2">Business History</h3>
            <p className="text-gray-400">{business.history}</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Financials</h3>
            <ul className="space-y-2">
              <li><strong>Valuation:</strong> {business.valuation}</li>
              <li><strong>Revenue (YoY):</strong> {business.revenue}</li>
              <li><strong>Tokens Issued:</strong> {business.tokens}</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Button>Invest Now</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
