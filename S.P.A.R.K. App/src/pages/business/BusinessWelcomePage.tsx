import { Link } from "react-router-dom";

const BusinessWelcomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md border-b border-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start h-16">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <img src="/logo.svg" alt="S.P.A.R.K. Logo" width="40" />
                <span className="font-tech text-2xl font-bold tracking-wider text-white text-glow">S.P.A.R.K.</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-tech text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tighter mt-4 text-glow">
            The Neural Network of Commerce
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-gray-400">
            Welcome to the S.P.A.R.K. Business Portal. Join us to unlock the future of social and financial intelligence.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/business/register" className="glow-button font-semibold text-white px-8 py-3 rounded-lg w-full sm:w-auto no-underline">
              Register Business
            </Link>
            <Link to="/business/login" className="bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-300 text-gray-300 font-semibold px-8 py-3 rounded-lg w-full sm:w-auto no-underline">
              Business Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BusinessWelcomePage;
