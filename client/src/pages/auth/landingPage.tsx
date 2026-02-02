import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/authContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Button from "../../components/Button";
import { 
  Bot, Sparkles, ChefHat, ArrowRight, 
  Cake, ClipboardList, Wheat, Cookie, Package, BarChart3,
  MoveRight, CheckCircle2, Utensils, AlertTriangle, TrendingUp, ArrowUpRight
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger, SplitText);

const Landing = () => {
  const navigate = useNavigate();
  const { theme } = useAuth();
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const workflowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
        /* HERO ANIMATIONS */
        if (headingRef.current) {
          const split = new SplitText(headingRef.current, { type: "words" });
          gsap.from(split.words, { y: 40, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08 });
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (!heroRef.current) return;
            const xPos = (e.clientX / window.innerWidth - 0.5) * 20;
            const yPos = (e.clientY / window.innerHeight - 0.5) * 20;
            gsap.to(".hero-float-icon", { x: xPos, y: yPos, duration: 1, ease: "power1.out" });
        };
        window.addEventListener("mousemove", handleMouseMove);

        gsap.utils.toArray<HTMLElement>(".fade-up").forEach((el) => {
          gsap.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } });
        });

        /* AI CHAT ANIMATION */
        const chatTl = gsap.timeline({ scrollTrigger: { trigger: ".ai-section", start: "top 70%" } });
        chatTl
          .fromTo(".chat-interface", { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "back.out(1.7)" })
          .fromTo(".chat-bubble", { x: -20, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, stagger: 0.3, ease: "power2.out" }, "-=0.4")
          .fromTo(".typing-indicator", { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3 });

        /* HORIZONTAL SCROLL */
        const sections = gsap.utils.toArray(".workflow-panel");
        gsap.to(sections, {
          xPercent: -100 * (sections.length - 1),
          ease: "none",
          scrollTrigger: {
            trigger: workflowRef.current,
            pin: true,
            scrub: 1,
            end: () => "+=" + (workflowRef.current?.offsetWidth || window.innerWidth) * (sections.length - 1),
          }
        });

        gsap.to(".sous-chef-float", { y: -15, rotation: 5, duration: 3, repeat: -1, yoyo: true, ease: "power1.inOut" });

        return () => window.removeEventListener("mousemove", handleMouseMove);
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 font-sans">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-indigo-200 shadow-lg">
              <ChefHat size={20} />
            </div>
            <div className="font-bold text-gray-900 text-lg tracking-tight">PantryPilot</div>
          </div>
          <div className="flex gap-4">
             <Button variant="ghost" className="hidden sm:block text-gray-500 hover:text-gray-900" onClick={() => navigate("/login")}>Log in</Button>
             <Button variant="primary" onClick={() => navigate("/login")}>Get Started</Button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section ref={heroRef} className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none z-0">
             <div className="hero-float-icon absolute top-10 left-[5%] text-indigo-200 opacity-60"><Cake size={64} strokeWidth={1.5} /></div>
             <div className="hero-float-icon absolute top-20 right-[10%] text-fuchsia-200 opacity-60"><ClipboardList size={56} strokeWidth={1.5} /></div>
             <div className="hero-float-icon absolute top-[40%] left-[2%] text-amber-200 opacity-50"><Wheat size={48} strokeWidth={1.5} /></div>
             <div className="hero-float-icon absolute top-[50%] right-[5%] text-rose-200 opacity-50"><Cookie size={60} strokeWidth={1.5} /></div>
             <div className="hero-float-icon absolute bottom-20 left-[15%] text-blue-200 opacity-40"><Package size={52} strokeWidth={1.5} /></div>
             <div className="hero-float-icon absolute bottom-32 right-[20%] text-emerald-200 opacity-40"><BarChart3 size={48} strokeWidth={1.5} /></div>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center gap-10">
            <div className="fade-up max-w-3xl space-y-8">
              <div className="relative inline-flex overflow-hidden rounded-full p-[2px]">
                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E0E7FF_0%,#6366F1_50%,#E0E7FF_100%)]" />
                <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-indigo-700 backdrop-blur-3xl transition-all hover:bg-white">
                  <Sparkles size={14} className="mr-2 text-indigo-500" />
                  <span>New: AI-Powered Kitchen Assistant</span>
                </div>
              </div>
              
              <h1 ref={headingRef} className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl text-gray-900">
                The smart way to manage your <span className="text-indigo-600">kitchen inventory.</span>
              </h1>
              
              <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Stop guessing what's in your pantry. Track ingredients, manage recipes, and predict orders with an AI assistant.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button variant="primary" className="px-8 py-4 text-lg w-full sm:w-auto shadow-xl shadow-indigo-200 transition-transform hover:scale-105" onClick={() => navigate("/login")}>
                  Start for free
                </Button>
                <button className="px-8 py-4 text-lg font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2 group" onClick={() => document.querySelector('.ai-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  See how it works <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="fade-up w-full max-w-5xl mt-8">
              <div className="relative rounded-2xl border border-gray-200 bg-gray-50/50 p-2 shadow-2xl backdrop-blur-sm">
                <img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2400&auto=format&fit=crop" alt="Dashboard" className="rounded-xl w-full h-auto object-cover max-h-[600px] bg-gray-200 min-h-[300px]" />
                <div className="absolute -right-4 -bottom-4 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce-slow hidden sm:flex">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Bot size={20} /></div>
                  <div><p className="text-xs text-gray-500 font-semibold uppercase">Status</p><p className="text-sm font-bold text-gray-900">Inventory Optimized</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- AI SECTION --- */}
        <section className="ai-section relative py-32 pb-48 bg-slate-900 z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
             <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
             <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="fade-up space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium"><Bot size={16} /><span>Meet Sous Chef AI</span></div>
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">Your intelligent <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">kitchen partner.</span></h2>
                <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">Don't just track numbers. Ask questions. Sous Chef analyzes your inventory and recipes to give you actionable insights.</p>
                <div className="flex justify-center lg:justify-start"><Button variant="primary" className="bg-white text-slate-900 hover:bg-slate-100 border-none px-8">Try AI Demo</Button></div>
              </div>

              <div className="relative">
                 <div className="sous-chef-float absolute -top-12 -right-8 z-20 hidden md:flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 shadow-2xl shadow-indigo-500/40">
                    <Bot size={48} className="text-white" />
                    <Sparkles size={24} className="absolute -top-3 -left-3 text-amber-300 animate-pulse" />
                 </div>
                 
                 <div className="chat-interface w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl relative opacity-0 invisible"> 
                    <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4 mb-6">
                       <div className="h-3 w-3 rounded-full bg-red-500" />
                       <div className="h-3 w-3 rounded-full bg-amber-500" />
                       <div className="h-3 w-3 rounded-full bg-green-500" />
                       <span className="ml-auto text-xs text-slate-500 font-mono">SousChef.ai</span>
                    </div>
                    <div className="space-y-6 font-sans">
                       <div className="chat-bubble flex gap-4 items-end justify-end opacity-0 invisible">
                          <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-lg max-w-[85%]"><p className="text-sm">We have a large order for 50 Red Velvet cakes. Do we have enough stock?</p></div>
                          <div className="h-8 w-8 rounded-full bg-slate-600 flex-shrink-0 flex items-center justify-center text-xs text-white">You</div>
                       </div>
                       <div className="chat-bubble flex gap-4 items-end opacity-0 invisible">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex-shrink-0 flex items-center justify-center"><Bot size={14} className="text-white" /></div>
                          <div className="bg-slate-700/80 text-slate-200 px-5 py-3 rounded-2xl rounded-tl-none shadow-lg max-w-[90%] border border-slate-600">
                             <p className="text-sm mb-2">Analyzing recipes...</p>
                             <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-600/50 text-xs mb-2">
                                <div className="flex justify-between font-bold"><span className="text-red-300">Red Food Coloring</span><span className="text-red-400">Low (Need 2 bottles)</span></div>
                             </div>
                             <p className="text-sm">You are short on Food Coloring. Add to shopping list?</p>
                          </div>
                       </div>
                       <div className="typing-indicator flex gap-4 items-center opacity-0 invisible">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 opacity-50 flex items-center justify-center"><Bot size={14} className="text-white" /></div>
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

        {/* --- HORIZONTAL WORKFLOW SECTION --- */}
        <section ref={workflowRef} className="workflow-section relative h-screen bg-white z-20 overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
          <div className="absolute top-0 left-0 w-full h-24 -mt-12 bg-gradient-to-b from-white to-transparent z-30 pointer-events-none" />
          
          <div className="workflow-wrapper flex h-full w-[400vw]">
            
            {/* PANEL 1: INTRO */}
            <div className="workflow-panel w-screen h-full flex items-center justify-center px-6 md:px-24">
               <div className="grid md:grid-cols-2 gap-16 items-center max-w-7xl w-full">
                  <div className="space-y-6">
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold tracking-wide uppercase">How it works</div>
                     <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">A workflow that <br/> <span className="text-indigo-600">actually flows.</span></h2>
                     <p className="text-xl text-gray-500 leading-relaxed max-w-lg">Most tools are static spreadsheets. PantryPilot is a dynamic engine that connects your prep work directly to your inventory levels.</p>
                     <div className="flex items-center gap-3 text-indigo-600 font-medium pt-4 animate-pulse"><span>Scroll to explore</span><MoveRight size={20} /></div>
                  </div>
                  <div className="relative hidden md:flex flex-col gap-8 items-center justify-center p-8">
                     <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-fuchsia-50 rounded-full blur-3xl opacity-50" />
                     <div className="relative z-10 flex gap-4 items-center">
                        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 w-48"><div className="bg-amber-100 p-2 rounded-lg text-amber-600"><Wheat size={20} /></div><div className="text-sm font-bold">Ingredients</div></div>
                        <div className="h-[2px] w-12 bg-gray-300 dashed" />
                        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 w-48"><div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Utensils size={20} /></div><div className="text-sm font-bold">Recipes</div></div>
                        <div className="h-[2px] w-12 bg-gray-300 dashed" />
                        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 w-48"><div className="bg-green-100 p-2 rounded-lg text-green-600"><Package size={20} /></div><div className="text-sm font-bold">Orders</div></div>
                     </div>
                  </div>
               </div>
            </div>

            {/* PANEL 2: STEP 1 (Inventory) */}
            <div className="workflow-panel w-screen h-full flex flex-col justify-center px-6 md:px-24 bg-gray-50/50 backdrop-blur-sm border-l border-gray-100">
               <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto w-full">
                  <div className="relative order-2 md:order-1">
                     <div className="absolute -inset-4 bg-indigo-500/10 rounded-3xl blur-2xl" />
                     {/* MOCK UI: Inventory List */}
                     <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-md w-full mx-auto">
                        <div className="flex justify-between items-center mb-6">
                           <h3 className="font-bold text-gray-800">Pantry Status</h3>
                           <span className="text-xs font-semibold bg-red-50 text-red-600 px-2 py-1 rounded-full flex items-center gap-1"><AlertTriangle size={12} /> Action Needed</span>
                        </div>
                        <div className="space-y-4">
                           <div>
                              <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Premium Cocoa</span><span className="font-medium text-gray-900">4.2 kg</span></div>
                              <div className="h-2 w-full bg-gray-100 rounded-full"><div className="h-2 w-[70%] bg-indigo-500 rounded-full" /></div>
                           </div>
                           <div>
                              <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Salted Butter</span><span className="font-bold text-red-500">Low (0.5 kg)</span></div>
                              <div className="h-2 w-full bg-red-50 rounded-full"><div className="h-2 w-[10%] bg-red-500 rounded-full animate-pulse" /></div>
                           </div>
                           <div>
                              <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Cake Flour</span><span className="font-medium text-gray-900">12.0 kg</span></div>
                              <div className="h-2 w-full bg-gray-100 rounded-full"><div className="h-2 w-[90%] bg-green-500 rounded-full" /></div>
                           </div>
                        </div>
                        <Button variant="secondary" className="w-full mt-6 text-sm py-2">Restock Selected</Button>
                     </div>
                  </div>
                  <div className="order-1 md:order-2">
                     <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Step 01</span>
                     <h3 className="text-3xl font-bold mt-2 mb-4">Smart Inventory Tracking</h3>
                     <p className="text-lg text-gray-600">Stop manually counting tins. Set threshold alerts for critical ingredients and get notified before you run out mid-bake.</p>
                  </div>
               </div>
            </div>

            {/* PANEL 3: STEP 2 (Recipes) */}
            <div className="workflow-panel w-screen h-full flex flex-col justify-center px-6 md:px-24 bg-white border-l border-gray-100">
               <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto w-full">
                  <div>
                     <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Step 02</span>
                     <h3 className="text-3xl font-bold mt-2 mb-4">Dynamic Recipe Costing</h3>
                     <p className="text-lg text-gray-600">Link ingredients to products. See exactly how much that chocolate cake costs to make, down to the gram, so you can price for profit.</p>
                  </div>
                  <div className="relative">
                     <div className="absolute -inset-4 bg-fuchsia-500/10 rounded-3xl blur-2xl" />
                     {/* MOCK UI: Recipe Costing */}
                     <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-md w-full mx-auto">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="h-10 w-10 bg-fuchsia-100 rounded-lg flex items-center justify-center text-fuchsia-600"><Cake size={20} /></div>
                           <div><h3 className="font-bold text-gray-800">Red Velvet Cake</h3><p className="text-xs text-gray-500">Standard 1kg Round</p></div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                           <div className="flex justify-between text-sm"><span className="text-gray-500">Ingredient Cost</span><span className="font-mono">₹320.50</span></div>
                           <div className="flex justify-between text-sm"><span className="text-gray-500">Labor & Overhead</span><span className="font-mono">₹100.00</span></div>
                           <div className="h-[1px] w-full bg-gray-200 my-1" />
                           <div className="flex justify-between font-bold text-gray-800"><span>Total Cost</span><span>₹420.50</span></div>
                        </div>
                        <div className="flex justify-between items-center mt-6 p-4 bg-green-50 rounded-xl border border-green-100">
                           <div className="flex items-center gap-2 text-green-700 font-bold"><TrendingUp size={18} /> <span>Margin</span></div>
                           <span className="text-2xl font-bold text-green-700">45%</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* PANEL 4: STEP 3 (Analytics - REPLACED WHATSAPP) */}
            <div className="workflow-panel w-screen h-full flex flex-col justify-center px-6 md:px-24 bg-gray-50 border-l border-gray-100">
               <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto w-full">
                  <div className="relative group">
                     <div className="absolute -inset-4 bg-blue-500/10 rounded-3xl blur-2xl" />
                     {/* MOCK UI: Analytics Dashboard */}
                     <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-md w-full mx-auto overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                           <div><h3 className="font-bold text-gray-800">Weekly Performance</h3><p className="text-xs text-gray-500">Last 7 Days</p></div>
                           <div className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><ArrowUpRight size={12} /> +12%</div>
                        </div>
                        {/* Fake Chart */}
                        <div className="flex items-end justify-between h-32 gap-2 mb-6 px-2">
                           <div className="w-full bg-blue-50 rounded-t-sm h-[40%] group-hover:h-[50%] transition-all duration-500 relative"><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Mon</div></div>
                           <div className="w-full bg-blue-100 rounded-t-sm h-[60%] group-hover:h-[70%] transition-all duration-500 delay-75"></div>
                           <div className="w-full bg-indigo-200 rounded-t-sm h-[45%] group-hover:h-[55%] transition-all duration-500 delay-100"></div>
                           <div className="w-full bg-indigo-400 rounded-t-sm h-[80%] group-hover:h-[90%] transition-all duration-500 delay-150"></div>
                           <div className="w-full bg-indigo-600 rounded-t-sm h-[65%] group-hover:h-[75%] transition-all duration-500 delay-200 relative"><div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">₹4k</div></div>
                        </div>
                        {/* Top Products */}
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top Sellers</p>
                           <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /><span className="text-gray-600">Choco Truffle</span></div>
                              <span className="font-mono font-medium">42 sold</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-fuchsia-500" /><span className="text-gray-600">Butterscotch</span></div>
                              <span className="font-mono font-medium">28 sold</span>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div>
                     <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Step 03</span>
                     <h3 className="text-3xl font-bold mt-2 mb-4">Real-Time Insights</h3>
                     <p className="text-lg text-gray-600">No more guessing what sold best this week. Visualize your sales trends, track top products, and understand your profit margins at a glance.</p>
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
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Data that helps you grow.</h2>
                <p className="text-lg text-gray-600">PantryPilot turns raw stock data into clear signals, so you always know what needs attention.</p>
                <ul className="space-y-4 pt-4">
                  {["Instant visibility into low-stock ingredients", "Cost analysis per recipe", "Automatic shopping list generation"].map((item, i) => (
                    <li key={i} className="flex gap-3 items-center text-gray-700">
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0"><CheckCircle2 size={16} /></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute top-10 left-10 w-full h-full bg-indigo-600 rounded-2xl opacity-10 transform translate-x-4 translate-y-4"></div>
                <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1400&auto=format&fit=crop" alt="Insights" className="relative rounded-2xl shadow-2xl border border-gray-200" />
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
              <div className="flex items-center gap-2"><div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><ChefHat size={16} /></div><span className="font-bold text-lg text-gray-900">PantryPilot</span></div>
              <p className="text-sm text-gray-500 leading-relaxed">Inventory management built for the modern kitchen.</p>
            </div>
            {/* Footer Links */}
            <div><h4 className="font-semibold text-gray-900 mb-4">Product</h4><ul className="space-y-2 text-sm text-gray-500"><li>Features</li><li>Pricing</li></ul></div>
            <div><h4 className="font-semibold text-gray-900 mb-4">Company</h4><ul className="space-y-2 text-sm text-gray-500"><li>About</li><li>Blog</li></ul></div>
            <div><h4 className="font-semibold text-gray-900 mb-4">Legal</h4><ul className="space-y-2 text-sm text-gray-500"><li>Privacy</li><li>Terms</li></ul></div>
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500"><p>© {new Date().getFullYear()} PantryPilot.</p></div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;