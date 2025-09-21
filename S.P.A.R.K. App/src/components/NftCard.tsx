import React from 'react';

export const NftCard = ({ nft }: { nft: any }) => {
  return (
    <div className="card-border-glow p-4 rounded-lg animation-none">
      <img 
        src={nft.image || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop"} 
        alt={nft.name} 
        className="w-full h-48 object-cover rounded-lg"
        onError={(e) => {
          e.currentTarget.src = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop";
        }}
      />
      <div className="mt-4">
        <h3 className="font-tech text-lg font-bold text-white">{nft.name}</h3>
        <p className="text-sm text-gray-400">{nft.description}</p>
      </div>
    </div>
  );
};
