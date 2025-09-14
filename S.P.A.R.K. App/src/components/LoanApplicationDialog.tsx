
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from 'lucide-react';

interface LoanApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: string; purpose: string; repaymentPercentage: string }) => void;
}

export const LoanApplicationDialog = ({ isOpen, onClose, onSubmit }: LoanApplicationDialogProps) => {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [repaymentPercentage, setRepaymentPercentage] = useState('');

  const handleSubmit = () => {
    onSubmit({ amount, purpose, repaymentPercentage });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-gray-200 border-purple-500/30 max-w-2xl p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-3xl font-bold text-white text-glow mb-2">Apply for a New Loan</DialogTitle>
          <DialogDescription className="text-lg text-purple-400 font-semibold">Fill out the form below to submit your loan application.</DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="loan-amount" className="text-right">
                Amount (USDT)
              </Label>
              <Input id="loan-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3 bg-black/20 border-purple-500/20" placeholder="e.g., 5000"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="loan-purpose" className="text-right">
                Purpose
              </Label>
              <Input id="loan-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="col-span-3 bg-black/20 border-purple-500/20" placeholder="e.g., For business expansion"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="repayment-percentage" className="text-right">
                Daily Repayment
              </Label>
              <Input id="repayment-percentage" type="number" value={repaymentPercentage} onChange={(e) => setRepaymentPercentage(e.target.value)} className="col-span-3 bg-black/20 border-purple-500/20" placeholder="e.g., 5 for 5%"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4 mt-2">
                <div className="col-start-2 col-span-3">
                    <p className="text-xs text-gray-400">
                        This is the percentage of your daily revenue that will be automatically repaid towards your loan.
                    </p>
                </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-black/20 mt-6 flex flex-row gap-4">
            <Button className="glow-button font-semibold text-white px-8 py-3 rounded-lg w-full" onClick={handleSubmit}>Submit Application</Button>
        </DialogFooter>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
};
