import React from 'react';

export const NftCard = ({ nft }: { nft: any }) => {
  return (
    <div className="card-border-glow p-4 rounded-lg animation-none">
      <img src={nft.image} alt={nft.name} className="w-full h-48 object-cover rounded-lg" />
      <div className="mt-4">
        <h3 className="font-tech text-lg font-bold text-white">{nft.name}</h3>
        <p className="text-sm text-gray-400">{nft.description}</p>
      </div>
    </div>
  );
};
