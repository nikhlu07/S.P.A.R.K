import React from 'react';

export const CouponCard = ({ coupon }: { coupon: any }) => {
  return (
    <div className="card-border-glow p-4 rounded-lg animation-none">
      <div className="flex justify-between items-center">
        <h3 className="font-tech text-lg font-bold text-white">{coupon.title}</h3>
        <div className="text-sm text-purple-400 font-tech">{coupon.discount}</div>
      </div>
      <p className="text-sm text-gray-400 mt-2">{coupon.business}</p>
      <p className="text-xs text-gray-500 mt-4">Expires: {coupon.expiry}</p>
    </div>
  );
};
