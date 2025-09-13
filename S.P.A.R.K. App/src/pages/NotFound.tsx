import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans relative antialiased">
      <div className="stars-container">
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
      </div>
      <div id="mouse-glow"></div>
      <div className="scanline-overlay"></div>

      <div className="relative z-10 flex min-h-screen items-center justify-center text-center">
        <div className="flex flex-col items-center p-4">
          <AlertTriangle className="w-24 h-24 text-purple-400 mb-8 animate-pulse" />
          <h1 className="font-tech text-7xl md:text-9xl font-extrabold text-white tracking-tighter text-glow">
            404
          </h1>
          <h2 className="font-tech text-2xl md:text-3xl font-bold text-white mt-4">
            Connection Lost
          </h2>
          <p className="mt-4 max-w-md mx-auto text-md md:text-lg text-gray-400">
            You've strayed from the designated matrix pathways. The requested
            node could not be found. Let's get you back on the grid.
          </p>
          <div className="mt-8">
            <Link
              to="/"
              className="glow-button font-semibold text-white px-8 py-3 rounded-lg"
            >
              Return to S.P.A.R.K. Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
