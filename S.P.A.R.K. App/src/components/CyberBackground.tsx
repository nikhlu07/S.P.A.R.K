import { useEffect, useState } from "react";

interface ShootingStar {
  id: number;
  left: number;
  animationDelay: number;
  animationDuration: number;
}

export function CyberBackground() {
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);

  useEffect(() => {
    // Generate shooting stars
    const stars: ShootingStar[] = [];
    for (let i = 0; i < 5; i++) {
      stars.push({
        id: i,
        left: Math.random() * 100,
        animationDelay: Math.random() * 5,
        animationDuration: 3 + Math.random() * 2,
      });
    }
    setShootingStars(stars);
  }, []);

  return (
    <>
      {/* Shooting Stars */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {shootingStars.map((star) => (
          <div
            key={star.id}
            className="absolute w-1 h-1 bg-primary rounded-full shadow-neural"
            style={{
              left: `${star.left}%`,
              animation: `shooting-star ${star.animationDuration}s linear infinite`,
              animationDelay: `${star.animationDelay}s`,
            }}
          >
            {/* Trail effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent w-20 h-0.5 -translate-y-0.5" />
          </div>
        ))}
      </div>

      {/* Neural Network Nodes */}
      <div className="fixed inset-0 pointer-events-none z-5">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-neural-pulse" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-primary/40 rounded-full animate-neural-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-primary/20 rounded-full animate-neural-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-primary/30 rounded-full animate-neural-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Floating Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none z-5">
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-glow rounded-full opacity-20 animate-float-glow" />
        <div className="absolute bottom-32 left-32 w-24 h-24 bg-gradient-glow rounded-full opacity-15 animate-float-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-gradient-glow rounded-full opacity-10 animate-float-glow" style={{ animationDelay: '4s' }} />
      </div>
    </>
  );
}