import React from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import type { AppContext } from '@/components/layout/MainLayout';

const LoginPage: React.FC = () => {
  const { isLoggedIn, connectWallet } = useOutletContext<AppContext>();

  if (isLoggedIn) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="bg-gray-900/50 card-border-glow rounded-lg p-10 md:p-12 text-center animation-none">
        <h1 className="font-tech text-3xl md:text-4xl font-bold text-white text-glow">Login to S.P.A.R.K.</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Connect your wallet to access your profile and start your journey in the neural commerce matrix.</p>
        <div className="mt-8">
            <button onClick={connectWallet} className="glow-button font-semibold text-white px-8 py-3 rounded-lg w-full sm:w-auto">
                Connect Wallet to Login
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
