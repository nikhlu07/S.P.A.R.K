import { useState, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface LoanApplicationFormProps {
  onSubmit: (data: { amount: number; purpose: string; dailyRepaymentPercentage: number }) => void;
}

export const LoanApplicationForm = ({ onSubmit }: LoanApplicationFormProps) => {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [repaymentPercentage, setRepaymentPercentage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount: parseFloat(amount),
      purpose,
      dailyRepaymentPercentage: parseFloat(repaymentPercentage),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="amount" className="text-right">
          Amount
        </Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="col-span-3 bg-black/50 border-gray-700 text-white"
          placeholder="e.g., 5000"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="purpose" className="text-right">
          Purpose
        </Label>
        <Textarea
          id="purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="col-span-3 bg-black/50 border-gray-700 text-white"
          placeholder="e.g., Inventory expansion"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="repaymentPercentage" className="text-right">
          Daily Repayment (%)
        </Label>
        <Input
          id="repaymentPercentage"
          type="number"
          value={repaymentPercentage}
          onChange={(e) => setRepaymentPercentage(e.target.value)}
          className="col-span-3 bg-black/50 border-gray-700 text-white"
          placeholder="e.g., 1"
        />
      </div>
      <div className="flex justify-end mt-4">
        <Button type="submit" className="glow-button font-semibold text-white px-4 py-2 rounded-lg">
          Submit Application
        </Button>
      </div>
    </form>
  );
};