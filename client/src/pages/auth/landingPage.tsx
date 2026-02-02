import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/authContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Button from "../../components/Button";
import {
  Bot, Sparkles, ChefHat, ArrowRight,
  Cake, ClipboardList, Wheat, Cookie, Package, BarChart3
} from "lucide-react"; // Added new icons

gsap.registerPlugin(ScrollTrigger, SplitText);

const Landing = () => {
  const navigate = useNavigate();
  const { theme } = useAuth();
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    /* HERO TEXT ANIMATION */
    if (headingRef.current) {
      const split = new SplitText(headingRef.current, { type: "words" });
      gsap.from(split.words, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.08,
      });
    }

    /* --- HERO BACKGROUND FLOATING ANIMATION --- */
    // 1. Constant Bobbing
    gsap.to(".hero-float-icon", {
      y: "random(-20, 20)",
      rotation: "random(-10, 10)",
      duration: "random(2, 4)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: {
        amount: 1.5,
        from: "random"
      }
    });

    // 2. Mouse Parallax Effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 20; // range -10 to 10
      const yPos = (clientY / window.innerHeight - 0.5) * 20;

      gsap.to(".hero-float-icon", {
        x: xPos,
        y: yPos,
        duration: 1,
        ease: "power1.out"
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    /* FADE-UP SECTIONS */
    gsap.utils.toArray<HTMLElement>(".fade-up").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        }
      );
    });

    /* HORIZONTAL WORKFLOW SCROLL */
    setTimeout(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".workflow-panel");
      const wrapper = document.querySelector(".workflow-wrapper") as HTMLElement;

      if (wrapper && panels.length > 0) {
        gsap.to(panels, {
          xPercent: -100 * (panels.length - 1),
          ease: "none",
          scrollTrigger: {
            trigger: ".workflow-section",
            pin: true,
            scrub: 1,
            snap: {
              snapTo: 1 / (panels.length - 1),
              duration: { min: 0.2, max: 0.3 },
              delay: 0.1,
              ease: "power1.inOut"
            },
            end: () => "+=" + wrapper.offsetWidth,
          },
        });
      }
    }, 100);

    /* --- SOUS CHEF ANIMATIONS --- */
    gsap.to(".sous-chef-float", {
      y: -15,
      rotation: 5,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    const chatTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".ai-section",
        start: "top 60%",
      },
    });

    chatTl
      .from(".chat-interface", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      })
      .from(".chat-bubble", {
        x: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.3,
        ease: "power2.out",
      }, "-=0.5")
      .from(".typing-indicator", {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
      });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-indigo-200 shadow-lg">
              <ChefHat size={20} />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg tracking-tight">PantryPilot</div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="ghost" className="hidden sm:block text-gray-500 hover:text-gray-900" onClick={() => navigate("/login")}>
              Log in
            </Button>
            <Button variant="primary" onClick={() => navigate("/login")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section ref={heroRef} className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 overflow-hidden">

          {/* ✨ FLOATING BACKGROUND ICONS ✨ */}
          <div className="absolute inset-0 pointer-events-none select-none z-0">
            {/* Top Left - Cake */}
            <div className="hero-float-icon absolute top-10 left-[5%] text-indigo-200 opacity-60">
              <Cake size={64} strokeWidth={1.5} />
            </div>
            {/* Top Right - Inventory List */}
            <div className="hero-float-icon absolute top-20 right-[10%] text-fuchsia-200 opacity-60">
              <ClipboardList size={56} strokeWidth={1.5} />
            </div>
            {/* Middle Left - Wheat/Ingredients */}
            <div className="hero-float-icon absolute top-[40%] left-[2%] text-amber-200 opacity-50">
              <Wheat size={48} strokeWidth={1.5} />
            </div>
            {/* Middle Right - Cookie */}
            <div className="hero-float-icon absolute top-[50%] right-[5%] text-rose-200 opacity-50">
              <Cookie size={60} strokeWidth={1.5} />
            </div>
            {/* Bottom Left - Box */}
            <div className="hero-float-icon absolute bottom-20 left-[15%] text-blue-200 opacity-40">
              <Package size={52} strokeWidth={1.5} />
            </div>
            {/* Bottom Right - Chart */}
            <div className="hero-float-icon absolute bottom-32 right-[20%] text-emerald-200 opacity-40">
              <BarChart3 size={48} strokeWidth={1.5} />
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center gap-10">
            <div className="fade-up max-w-3xl space-y-8">
              <div className="relative inline-flex overflow-hidden rounded-full p-[2px]">

                {/* The Moving Gradient (Spinning "Waterflow" Effect) */}
                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E0E7FF_0%,#6366F1_50%,#E0E7FF_100%)]" />

                {/* The Content (Sitting on top to create the border look) */}
                <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-indigo-700 backdrop-blur-3xl transition-all hover:bg-white">
                  <Sparkles size={14} className="mr-2 text-indigo-500" />
                  <span>New: AI-Powered Kitchen Assistant</span>
                </div>

              </div>

              <h1
                ref={headingRef}
                className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl text-gray-900"
              >
                The smart way to manage your <span className="text-indigo-600">kitchen inventory.</span>
              </h1>

              <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Stop guessing what's in your pantry. Track ingredients, manage recipes, and
                predict orders with an AI assistant that knows your kitchen better than you do.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button
                  variant="primary"
                  className="px-8 py-4 text-lg w-full sm:w-auto shadow-xl shadow-indigo-200 transition-transform hover:scale-105"
                  onClick={() => navigate("/login")}
                >
                  Start for free
                </Button>
                <button
                  className="px-8 py-4 text-lg font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2 group"
                  onClick={() => {
                    document.querySelector('.ai-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  See how it works <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Hero Image / Dashboard Preview */}
            <div className="fade-up w-full max-w-5xl mt-8">
              <div className="relative rounded-2xl border border-gray-200 bg-gray-50/50 p-2 shadow-2xl backdrop-blur-sm">

                {/* Updated Image */}
                <img
                  src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2400&auto=format&fit=crop"
                  alt="PantryPilot Dashboard Interface"
                  className="rounded-xl w-full h-auto object-cover max-h-[600px] bg-gray-200 min-h-[300px]"
                />

                {/* Floating Badge */}
                <div className="absolute -right-4 -bottom-4 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce-slow hidden sm:flex">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Bot size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Status</p>
                    <p className="text-sm font-bold text-gray-900">Inventory Optimized</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- AI SECTION --- */}
        <section className="ai-section relative py-32 pb-48 bg-slate-900 z-10">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="fade-up space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium">
                  <Bot size={16} />
                  <span>Meet Sous Chef AI</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  Your intelligent <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">
                    kitchen partner.
                  </span>
                </h2>

                <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Don't just track numbers. Ask questions. Sous Chef analyzes your
                  inventory and recipes to give you actionable insights, predict shortages,
                  and help you plan production in seconds.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button variant="primary" className="bg-white text-slate-900 hover:bg-slate-100 border-none px-8">
                    Try AI Demo
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="sous-chef-float absolute -top-12 -right-8 z-20 hidden md:flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 shadow-2xl shadow-indigo-500/40">
                  <Bot size={48} className="text-white" />
                  <Sparkles size={24} className="absolute -top-3 -left-3 text-amber-300 animate-pulse" />
                </div>

                <div className="chat-interface w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4 mb-6">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="ml-auto text-xs text-slate-500 font-mono">SousChef.ai</span>
                  </div>

                  <div className="space-y-6 font-sans">
                    <div className="chat-bubble flex gap-4 items-end justify-end">
                      <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-lg max-w-[85%]">
                        <p className="text-sm">We have a large order for 50 Red Velvet cakes. Do we have enough stock?</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-slate-600 flex-shrink-0 flex items-center justify-center text-xs text-white">You</div>
                    </div>

                    <div className="chat-bubble flex gap-4 items-end">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex-shrink-0 flex items-center justify-center">
                        <Bot size={14} className="text-white" />
                      </div>
                      <div className="bg-slate-700/80 text-slate-200 px-5 py-3 rounded-2xl rounded-tl-none shadow-lg max-w-[90%] border border-slate-600">
                        <p className="text-sm mb-2">Analyzing recipes and inventory...</p>
                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-600/50 text-xs mb-2">
                          <div className="flex justify-between mb-1">
                            <span>Flour</span>
                            <span className="text-green-400">OK (20kg)</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Cocoa Powder</span>
                            <span className="text-green-400">OK (5kg)</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span className="text-red-300">Red Food Coloring</span>
                            <span className="text-red-400">Low (Need 2 bottles)</span>
                          </div>
                        </div>
                        <p className="text-sm">You are short on <strong>Food Coloring</strong>. Should I add it to the shopping list?</p>
                      </div>
                    </div>

                    <div className="typing-indicator flex gap-4 items-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 opacity-50 flex items-center justify-center">
                        <Bot size={14} className="text-white" />
                      </div>
                      <div className="flex gap-1 bg-slate-700/50 px-3 py-2 rounded-xl">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW — HORIZONTAL SCROLL */}
        <section className="workflow-section relative h-screen overflow-hidden bg-white z-20 -mt-24 rounded-t-[3rem] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.3)]">
          <div className="workflow-wrapper flex h-full pt-20 w-[300%]">

            {/* PANEL 1 */}
            <div className="workflow-panel flex w-[100vw] flex-col justify-center px-6 md:px-24">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                A workflow that <br /> <span className="text-indigo-600">actually flows.</span>
              </h2>
              <p className="max-w-xl text-xl text-gray-500 leading-relaxed">
                Most inventory tools are glorified spreadsheets. PantryPilot is built
                for the physical reality of a kitchen, matching your movement from prep to plate.
              </p>
            </div>

            {/* PANEL 2 */}
            <div className="workflow-panel flex w-[100vw] flex-col justify-center px-6 md:px-24 bg-gray-50">
              <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-indigo-500 rounded-2xl opacity-20 blur-lg group-hover:opacity-30 transition-opacity" />
                  <img
                    src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
                    alt="Ingredients"
                    className="relative rounded-2xl shadow-2xl h-80 w-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Step 01</span>
                  <h3 className="text-3xl font-bold mt-2 mb-4">Log Ingredients</h3>
                  <p className="text-lg text-gray-600">Input your raw materials. Set thresholds for low stock alerts so you never run out mid-bake.</p>
                </div>
              </div>
            </div>

            {/* PANEL 3 */}
            <div className="workflow-panel flex w-[100vw] flex-col justify-center px-6 md:px-24 bg-white">
              <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                <div className="order-2 md:order-1">
                  <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Step 02</span>
                  <h3 className="text-3xl font-bold mt-2 mb-4">Connect Recipes</h3>
                  <p className="text-lg text-gray-600">Link ingredients to products. When you bake a cake, PantryPilot automatically deducts the flour, sugar, and eggs.</p>
                </div>
                <div className="relative group order-1 md:order-2">
                  <div className="absolute -inset-2 bg-fuchsia-500 rounded-2xl opacity-20 blur-lg group-hover:opacity-30 transition-opacity" />
                  <img
                    src="https://images.pexels.com/photos/616404/pexels-photo-616404.jpeg"
                    alt="Recipe Math"
                    className="relative rounded-2xl shadow-2xl h-80 w-full object-cover"
                  />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* INSIGHTS SECTION */}
        <section className="fade-up py-32 bg-gray-50 border-t border-gray-200">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-16 md:grid-cols-2 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Data that helps you grow.
                </h2>
                <p className="text-lg text-gray-600">
                  PantryPilot turns raw stock data into clear signals, so you always
                  know what needs attention — before it becomes a problem.
                </p>

                <ul className="space-y-4 pt-4">
                  {["Instant visibility into low-stock ingredients", "Cost analysis per recipe", "Automatic shopping list generation"].map((item, i) => (
                    <li key={i} className="flex gap-3 items-center text-gray-700">
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative">
                <div className="absolute top-10 left-10 w-full h-full bg-indigo-600 rounded-2xl opacity-10 transform translate-x-4 translate-y-4"></div>
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1400&auto=format&fit=crop"
                  alt="Insights"
                  className="relative rounded-2xl shadow-2xl border border-gray-200"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                  <ChefHat size={16} />
                </div>
                <span className="font-bold text-lg text-gray-900">PantryPilot</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Inventory management built for the modern kitchen.
                Less counting, more creating.
              </p>
            </div>
            {/* Footer Columns */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Features</li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">About</li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Blog</li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Careers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Privacy</li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Terms</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} PantryPilot. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <span className="cursor-pointer hover:text-gray-900 transition-colors">Twitter</span>
              <span className="cursor-pointer hover:text-gray-900 transition-colors">Instagram</span>
              <span className="cursor-pointer hover:text-gray-900 transition-colors">LinkedIn</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;