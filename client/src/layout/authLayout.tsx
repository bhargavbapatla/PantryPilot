import { Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';
import { useState, useEffect } from 'react';

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1920&auto=format&fit=crop", // Ingredients
  "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=1920&auto=format&fit=crop", // Dough/Flour
  "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1920&auto=format&fit=crop", // Pastries
];

const AuthLayout = () => {
  const { token, theme } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  useEffect(() => {
    if (paused) return;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [paused]);

  if (token) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* ================= LEFT IMAGE ================= */}
      <div className="hidden lg:block relative w-full h-full overflow-hidden">
        {BACKGROUND_IMAGES.map((img, index) => (
          <img
            key={img}
            src={img}
            alt={`Bakery background ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out scale-[1.02] ${index === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
              }`}
          />
        ))}
        {/* <div className="absolute inset-0 bg-black/10"></div> */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />


        {/* Logo Overlay */}
        {/* <div className="absolute top-8 left-8 z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm">
            <span className="text-xl">🧁</span>
          </div>
          <span className="text-2xl font-bold text-white drop-shadow-md tracking-tight">
            PantryPilot
          </span>
        </div> */}
      </div>

      {/* ================= RIGHT CONTENT ================= */}
      <div
        className="flex items-center justify-center px-6"
        style={{ backgroundColor: theme.background }}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
