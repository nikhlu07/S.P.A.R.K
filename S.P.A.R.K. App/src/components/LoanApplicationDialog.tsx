import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LoanApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: string; purpose: string; repaymentPercentage: string }) => void;
}

function LoanApplicationDialog({ isOpen, onClose, onSubmit }: LoanApplicationDialogProps) {
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    repaymentPercentage: '5'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ amount: '', purpose: '', repaymentPercentage: '5' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/80 backdrop-blur-md border border-purple-500/50 text-white">
        <DialogHeader>
          <DialogTitle className="font-tech text-2xl text-glow">Apply for Business Loan</DialogTitle>
          <DialogDescription className="text-gray-400">
            Get funding from the Quantum Lending Pool for your business growth.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-gray-400">Loan Amount (USDT)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount needed"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="bg-black/50 border-gray-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose" className="text-gray-400">Business Purpose</Label>
            <Textarea
              id="purpose"
              placeholder="Describe how you'll use the funds..."
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              className="bg-black/50 border-gray-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repayment" className="text-gray-400">Daily Repayment Percentage</Label>
            <Input
              id="repayment"
              type="number"
              step="0.1"
              min="1"
              max="10"
              placeholder="5"
              value={formData.repaymentPercentage}
              onChange={(e) => handleInputChange('repaymentPercentage', e.target.value)}
              className="bg-black/50 border-gray-700 text-white"
              required
            />
            <p className="text-xs text-gray-500">
              Recommended: 3-7% daily repayment based on your business cash flow
            </p>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-3">
            <h4 className="text-blue-400 font-medium mb-2">Loan Terms</h4>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• AI-powered credit assessment</li>
              <li>• Flexible repayment schedule</li>
              <li>• Community-funded pool</li>
              <li>• No traditional credit check required</li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="text-gray-300 border-gray-600 hover:bg-gray-700/50 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Submit Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { LoanApplicationDialog };
