
import React from 'react';
import { Button } from '@/components/ui/button';

export const BusinessCard = ({ business, onViewDetails }) => {
  return (
    <div className="card-border-glow p-4 rounded-lg">
      <h3 className="font-bold text-lg">{business.name}</h3>
      <p className="text-sm text-gray-400">{business.sector}</p>
      <p className="mt-2 text-sm">{business.description}</p>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => onViewDetails(business)}>View Details</Button>
      </div>
    </div>
  );
};
