import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ArrowLeft, Construction } from "lucide-react";
import Button from "../../../components/Button"; // Ensure this path is correct

const ReportsAndAnalytics = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  const phrase = "WORK IN PROGRESS";
  const words = phrase.split(" ");

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // 1. CINEMATIC REVEAL (Entrance)
      // We use autoAlpha to ensure it becomes visible reliably
      gsap.fromTo(".anim-letter", 
        { 
          y: 100, 
          autoAlpha: 0, // autoAlpha = opacity + visibility
          rotateX: -90 
        },
        { 
          y: 0, 
          autoAlpha: 1, 
          rotateX: 0,
          stagger: 0.05, 
          duration: 1.2, 
          ease: "power4.out",
          delay: 0.2
        }
      );

      // Fade in sub-elements
      gsap.fromTo(".fade-up",
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1, ease: "power3.out", delay: 0.8, stagger: 0.1 }
      );

      // 2. PARALLAX EFFECT (Mouse Hover)
      const xTo = gsap.quickTo(textContainerRef.current, "x", { duration: 0.8, ease: "power3" });
      const yTo = gsap.quickTo(textContainerRef.current, "y", { duration: 0.8, ease: "power3" });

      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY, innerWidth, innerHeight } = e;
        const xFactor = (clientX / innerWidth - 0.5) * 30; 
        const yFactor = (clientY / innerHeight - 0.5) * 30;
        xTo(xFactor);
        yTo(yFactor);
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-[calc(100vh-80px)] w-full relative overflow-hidden flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: "#f3f4f6" }}
    >
      
      <div ref={textContainerRef} className="relative z-10 flex flex-col items-center will-change-transform">
        
        {/* Icon Badge */}
        <div className="fade-up mb-10 p-4 bg-white rounded-2xl shadow-sm border border-slate-200 snvisible">
            <Construction className="text-indigo-500 w-8 h-8" />
        </div>

        {/* MASKED TEXT CONTAINER */}
        <div className="relative font-black text-center select-none overflow-hidden leading-tight p-4">
            {/* FIX: Removed 'text-slate-900' which conflicts with the transparent text needed for the gradient.
               Added 'pb-2' to prevent the bottom of letters from getting clipped.
            */}
            <h1 className="text-5xl md:text-8xl tracking-tighter flex flex-wrap gap-x-4 md:gap-x-8 justify-center perspective-text gradient-flow-text pb-2">
                {words.map((word, i) => (
                    <span key={i} className="inline-flex overflow-hidden py-2">
                        {word.split("").map((char, j) => (
                            <span key={j} className="anim-letter inline-block origin-bottom transform-style-3d snvisible">
                                {char}
                            </span>
                        ))}
                    </span>
                ))}
            </h1>
        </div>

        {/* Subtext */}
        <div className="fade-up mt-8 flex items-center gap-3 bg-white/50 backdrop-blur-sm px-5 py-2 rounded-full border border-slate-200/50 snvisible">
            <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <p className="text-slate-500 font-mono text-xs md:text-sm tracking-widest uppercase">
                Analytics Module V2.0
            </p>
        </div>

        {/* Navigation */}
        <div className="fade-up mt-12 snvisible">
            <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors hover:bg-white/60"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Return to Kitchen
            </Button>
        </div>

      </div>

      {/* Subtle Texture Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ 
            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
            backgroundSize: '32px 32px' 
        }} 
      />

      {/* CUSTOM CSS FOR THE GRADIENT ANIMATION */}
      <style>{`  90deg,
            #1e293b 0%,    /* Slate 800 */
            #4f46e5 25%,   /* Indigo 600 */
            #9333ea 50%,   /* Purple 600 */
            #4f46e5 75%,   /* Indigo 600 */
            #1e293b 100%   /* Slate 800 */
          );
          
          background-size: 200% auto;
          
          /* Standard and Webkit clipping */
          background-clip: text;
          -webkit-background-clip: text;
          
          /* Crucial: Make text transparent so background shows */
          color: transparent;
          
          /* Animate */
          animation: textFlow 5s linear infinite;
        }

        @keyframes textFlow {
          0% {
            background-position: 0% center;
          }
          100% {
            background-position: 200% center;
          }
        }
      `}</style>

    </div>
  );
};

export default ReportsAndAnalytics;