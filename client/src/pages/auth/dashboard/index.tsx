import { Link } from "react-router-dom";
import React, { useEffect, useState, useMemo, memo } from "react"; // Added useMemo and memo
import * as echarts from "echarts";
import EChart from "../../../components/charts/EChart";
import { useAuth } from "../../../features/auth/authContext";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { 
  AutoAwesome,      
  MicNone,          
  AttachFile,       
  ArrowUpward,      
  OpenInFull,
  CloseFullscreen,
  Inventory2Outlined, 
  WarningAmberRounded,
  AttachMoneyRounded,
  ScheduleRounded,
  TrendingUp,
  TrendingDown,
  Close,
  Visibility 
} from '@mui/icons-material';
import { askSousChefAi } from "../../../api/ai";
import toast from "react-hot-toast";

// --- HELPERS ---

const FormatAIResponse = ({ text, isExpanded = false }: { text: string, isExpanded?: boolean }) => {
  if (!text) return null;
  
  return (
    <div className={`text-gray-700 space-y-3 overflow-y-auto pr-2 custom-scrollbar ${isExpanded ? 'text-base max-h-[60vh]' : 'text-sm max-h-[160px]'}`}>
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={i} className="leading-relaxed">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="text-indigo-700 font-semibold">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
};

function Counter({ value, prefix = "" }: { value: number; prefix?: string }) {
  const spring = useSpring(0, { bounce: 0, duration: 2000 });
  const display = useTransform(spring, (current) => 
    prefix + Math.round(current).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

const AIOrb = ({ large = false }: { large?: boolean }) => {
  return (
    <div className={`relative flex items-center justify-center w-full ${large ? 'h-64' : 'h-32'}`}>
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute rounded-full bg-blue-400 blur-3xl opacity-40 ${large ? 'w-48 h-48' : 'w-32 h-32'}`}
      />
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={`relative rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_40px_rgba(59,130,246,0.6)] flex items-center justify-center ${large ? 'w-32 h-32' : 'w-24 h-24'}`}
      >
         <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white opacity-20 blur-sm" />
      </motion.div>
    </div>
  );
};

interface ChatInputProps {
  query: string;
  setQuery: (val: string) => void;
  onSend: () => void;
  loading: boolean;
  isExpanded?: boolean;
}

const ChatInput = ({ query, setQuery, onSend, loading, isExpanded = false }: ChatInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSend();
  }

  return (
    <div className={`relative flex items-center bg-gray-100 rounded-full border transition-all ${loading ? 'opacity-50 pointer-events-none' : 'focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100'} ${isExpanded ? 'py-4 px-6 shadow-inner' : 'py-2 px-4'}`}>
      <button className="text-gray-400 hover:text-gray-600 transition-colors mr-2">
        <AttachFile fontSize="small" className="rotate-45" />
      </button>
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={loading ? "Cooking up an answer..." : "Ask Sous Chef..."} 
        className={`bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 w-full ${isExpanded ? 'text-base' : 'text-sm'}`}
        disabled={loading}
        autoFocus={isExpanded}
      />
      <div className="flex items-center gap-2 ml-2">
        <button className="text-gray-400 hover:text-gray-600">
          <MicNone fontSize="small" />
        </button>
        <button 
          className={`flex items-center justify-center rounded-full text-white shadow-md transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95'} ${isExpanded ? 'w-10 h-10' : 'w-8 h-8'}`}
          onClick={onSend}
          disabled={loading}
        >
          <ArrowUpward fontSize={isExpanded ? "medium" : "small"} />
        </button>
      </div>
    </div>
  );
};

// --- ✅ NEW: Memoized Charts Component ---
// This isolates the charts so they don't re-render when you type in the input box
const DashboardCharts = memo(({ theme }: { theme: any }) => {
  
  // Use useMemo to prevent object recreation
  const salesChartOption: echarts.EChartsOption = useMemo(() => ({
    grid: { top: 32, left: 40, right: 16, bottom: 32 },
    textStyle: { fontFamily: theme.fontFamily, color: theme.text },
    tooltip: { trigger: "axis", backgroundColor: "#fff", borderColor: "#e2e8f0", textStyle: { color: "#1e293b" } },
    xAxis: { type: "category", boundaryGap: false, data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], axisLine: { lineStyle: { color: "#e2e8f0" } }, axisLabel: { color: "#64748b" }, axisTick: { lineStyle: { color: "#e2e8f0" } } },
    yAxis: { type: "value", axisLine: { lineStyle: { color: "#e2e8f0" } }, axisLabel: { color: "#64748b" }, splitLine: { lineStyle: { color: "#f1f5f9" } } },
    series: [{ name: "Sales", type: "line", smooth: true, showSymbol: false, itemStyle: { color: "#4f46e5" }, areaStyle: { color: "rgba(79, 70, 229, 0.1)" }, data: [120, 200, 150, 80, 70, 110, 130] }],
  }) as echarts.EChartsOption, [theme]);

  const stockChartOption: echarts.EChartsOption = useMemo(() => ({
    grid: { top: 32, left: 40, right: 16, bottom: 32 },
    textStyle: { fontFamily: theme.fontFamily, color: theme.text },
    tooltip: { trigger: "item", backgroundColor: "#fff", borderColor: "#e2e8f0", textStyle: { color: "#1e293b" } },
    xAxis: { type: "category", data: ["Peripherals", "Cables", "Accessories", "Monitors", "Keyboards"], axisLine: { lineStyle: { color: "#e2e8f0" } }, axisLabel: { color: "#64748b" }, axisTick: { lineStyle: { color: "#e2e8f0" } } },
    yAxis: { type: "value", axisLine: { lineStyle: { color: "#e2e8f0" } }, axisLabel: { color: "#64748b" }, splitLine: { lineStyle: { color: "#f1f5f9" } } },
    series: [{ name: "In Stock", type: "bar", barWidth: '40%', data: [320, 180, 260, 140, 220], itemStyle: { borderRadius: [4, 4, 0, 0], color: "#3b82f6" } }],
  }) as echarts.EChartsOption, [theme]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Weekly Sales Trend</h3>
        </div>
        <div className="p-4">
          <EChart option={salesChartOption} />
        </div>
      </div>
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Stock Levels</h3>
        </div>
        <div className="p-4">
          <EChart option={stockChartOption} />
        </div>
      </div>
    </div>
  );
});

// --- MAIN DASHBOARD ---

const Dashboard = () => {
  const { theme } = useAuth();
  
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = [
    { title: "Total Items", value: 1234, icon: <Inventory2Outlined />, color: "blue", trend: "+12.5%", isPositive: true },
    { title: "Low Stock", value: 12, icon: <WarningAmberRounded />, color: "red", trend: "+2.4%", isPositive: false },
    { title: "Total Value", value: 45678, prefix: "$", icon: <AttachMoneyRounded />, color: "green", trend: "+8.2%", isPositive: true },
    { title: "Pending Orders", value: 5, icon: <ScheduleRounded />, color: "orange", trend: "-1.2%", isPositive: false },
  ];

  const recentActivity = [
    { id: 1, action: 'Added new item "Wireless Mouse"', time: "2 hours ago" },
    { id: 2, action: 'Updated stock for "Mechanical Keyboard"', time: "4 hours ago" },
    { id: 3, action: 'Low stock alert: "USB-C Cable"', time: "5 hours ago" },
    { id: 4, action: 'Removed item "Old Monitor"', time: "1 day ago" },
  ];

  const getColorClasses = (color: string) => {
    switch(color) {
        case 'blue': return 'bg-blue-50 text-blue-600';
        case 'red': return 'bg-red-50 text-red-600';
        case 'green': return 'bg-green-50 text-green-600';
        case 'orange': return 'bg-orange-50 text-orange-600';
        default: return 'bg-gray-50 text-gray-600';
    }
  };

  const handleAskSousChefAi = async () => {
    if(!aiQuery.trim()) return;
    setLoading(true);
    try {
        const {status, message, data} = await askSousChefAi(aiQuery);
        if (status === 200) {
          setAiResponse(data);
          setAiQuery(""); 
        } else {
          toast.error(message || "Error: " + status);
        }
    } catch (err) {
        toast.error("Something went wrong");
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen p-6 relative ${isModalOpen ? 'overflow-hidden h-screen' : ''}`} style={{ color: theme.text, fontFamily: theme.fontFamily }}>
      
      {/* --- MODAL OVERLAY --- */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[85vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <AutoAwesome className="text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Sous Chef AI</h2>
                        <p className="text-sm text-gray-500">Expanded Conversation</p>
                    </div>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                    <CloseFullscreen />
                 </button>
              </div>

              {/* Body */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-50/50">
                 
                 {/* ✅ FIX: Modal now shows Loading Orb */}
                 {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <AIOrb large={true} />
                        <p className="mt-6 text-xl font-medium text-gray-600 animate-pulse">Thinking...</p>
                    </div>
                 ) : aiResponse ? (
                    <div className="bg-white p-6 md:p-8 rounded-xl border border-indigo-100 shadow-sm mx-auto max-w-3xl">
                        <FormatAIResponse text={aiResponse} isExpanded={true} />
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <AIOrb large={true} />
                        <p className="mt-6 text-xl font-medium text-gray-600">How can I help you today?</p>
                    </div>
                 )}

              </div>

              {/* Footer */}
              <div className="p-6 bg-white border-t border-gray-100 shrink-0">
                 <div className="max-w-3xl mx-auto">
                    <ChatInput 
                        query={aiQuery}
                        setQuery={setAiQuery}
                        onSend={handleAskSousChefAi}
                        loading={loading}
                        isExpanded={true} 
                    />
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back to your inventory overview.</p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">{stat.title}</h4>
                  <h2 className="text-2xl font-bold text-gray-900">
                    <Counter value={stat.value} prefix={stat.prefix} />
                  </h2>
                </div>
                <div className={`p-3 rounded-xl ${getColorClasses(stat.color)}`}>{stat.icon}</div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-xs ${stat.isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {stat.isPositive ? <TrendingUp fontSize="inherit" /> : <TrendingDown fontSize="inherit" />}
                    {stat.trend}
                </span>
                <span className="text-gray-400 text-xs">vs last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ FIX: Used the Memoized Chart Component */}
        <DashboardCharts theme={theme} />

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Activity */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 lg:col-span-2">
            <div className="p-6 border-b border-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
            </div>
            <ul className="divide-y divide-gray-50">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">{activity.action}</p>
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-4 border-t border-gray-50 rounded-b-2xl bg-gray-50/30">
              <Link to="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all activity &rarr;</Link>
            </div>
          </div>

          {/* AI Assistant Card - Small Widget */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 flex flex-col justify-between overflow-hidden h-[400px]">
            
            <div className="p-6 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-2">
                <AutoAwesome className="text-indigo-500" fontSize="small" />
                <h3 className="text-lg font-bold text-gray-800">Sous Chef AI</h3>
              </div>
              <div className="flex items-center gap-1">
                  {aiResponse && (
                      <button onClick={() => setAiResponse(null)} className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors" title="Clear Chat">
                          <Close fontSize="small" />
                      </button>
                  )}
                  <button onClick={() => setIsModalOpen(true)} className="p-1 hover:bg-gray-100 text-gray-400 hover:text-indigo-600 rounded-full transition-colors">
                    <OpenInFull fontSize="small" />
                  </button>
              </div>
            </div>

            <div className="px-6 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {/* ✅ FIX: Small card also shows Loading Orb */}
                    {loading ? (
                         <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center w-full h-full"
                        >
                            <div className="h-32 w-full flex items-center justify-center">
                                <AIOrb />
                            </div>
                            <p className="text-sm text-center text-gray-500 mt-4 font-medium px-4 animate-pulse">
                                Thinking...
                            </p>
                        </motion.div>
                    ) : aiResponse ? (
                        <motion.div 
                            key="response"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="w-full h-full bg-indigo-50/50 rounded-xl p-4 text-left border border-indigo-100 relative flex flex-col"
                        >
                             <div className="flex-1 overflow-hidden">
                                <FormatAIResponse text={aiResponse} />
                             </div>
                             
                             <button 
                                onClick={() => setIsModalOpen(true)}
                                className="mt-2 w-full py-1.5 text-xs font-semibold text-indigo-700 bg-white/80 hover:bg-white rounded-lg border border-indigo-200 shadow-sm flex items-center justify-center gap-1 transition-all"
                             >
                                <Visibility fontSize="inherit" />
                                View Full Response
                             </button>

                        </motion.div>
                    ) : (
                        <motion.div 
                            key="orb"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center w-full h-full"
                        >
                            <div className="h-32 w-full flex items-center justify-center">
                                <AIOrb />
                            </div>
                            <p className="text-sm text-center text-gray-500 mt-4 font-medium px-4">
                                Ready to help.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-4 bg-white border-t border-gray-50">
               <ChatInput 
                  query={aiQuery}
                  setQuery={setAiQuery}
                  onSend={handleAskSousChefAi}
                  loading={loading}
               />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
