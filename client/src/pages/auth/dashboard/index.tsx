import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import EChart from "../../../components/charts/EChart";
import { useAuth } from "../../../features/auth/authContext";
import { motion, useSpring, useTransform } from "framer-motion";
// Icons
import { 
  AutoAwesome,      
  MicNone,          
  AttachFile,       
  ArrowUpward,      
  OpenInFull,
  // New Icons for Cards
  Inventory2Outlined, 
  WarningAmberRounded,
  AttachMoneyRounded,
  ScheduleRounded,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';

// --- COMPONENTS ---

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

const AIOrb = () => {
  return (
    <div className="relative flex items-center justify-center h-40 w-full my-4">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-32 h-32 rounded-full bg-blue-400 blur-3xl opacity-40"
      />
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_40px_rgba(59,130,246,0.6)] flex items-center justify-center"
      >
         <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white opacity-20 blur-sm" />
      </motion.div>
    </div>
  );
};

// --- MAIN DASHBOARD ---

const Dashboard = () => {
  const { theme } = useAuth();
  const [aiQuery, setAiQuery] = useState("");

  // 1. Updated Stats Data structure to match the new design
  const stats = [
    { 
      title: "Total Items", 
      value: 1234, 
      icon: <Inventory2Outlined />, 
      color: "blue", // Used for icon & bg
      trend: "+12.5%", 
      isPositive: true 
    },
    { 
      title: "Low Stock", 
      value: 12, 
      icon: <WarningAmberRounded />, 
      color: "red", 
      trend: "+2.4%", 
      isPositive: false // Red trend (warning)
    },
    { 
      title: "Total Value", 
      value: 45678, 
      prefix: "$", 
      icon: <AttachMoneyRounded />, 
      color: "green", 
      trend: "+8.2%", 
      isPositive: true 
    },
    { 
      title: "Pending Orders", 
      value: 5, 
      icon: <ScheduleRounded />, 
      color: "orange", 
      trend: "-1.2%", 
      isPositive: false 
    },
  ];

  const recentActivity = [
    { id: 1, action: 'Added new item "Wireless Mouse"', time: "2 hours ago" },
    { id: 2, action: 'Updated stock for "Mechanical Keyboard"', time: "4 hours ago" },
    { id: 3, action: 'Low stock alert: "USB-C Cable"', time: "5 hours ago" },
    { id: 4, action: 'Removed item "Old Monitor"', time: "1 day ago" },
  ];

  // Helper to map color names to Tailwind classes
  const getColorClasses = (color: string) => {
    switch(color) {
        case 'blue': return 'bg-blue-50 text-blue-600';
        case 'red': return 'bg-red-50 text-red-600';
        case 'green': return 'bg-green-50 text-green-600';
        case 'orange': return 'bg-orange-50 text-orange-600';
        default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        // backgroundColor: "#f8fafc", // Slightly greyer bg to make white cards pop
        color: theme.text,
        fontFamily: theme.fontFamily,
      }}
    >
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back to your inventory overview.</p>
          </div>
        </header>

        {/* 2. ✨ NEW STATS GRID DESIGN ✨ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 transition-all hover:shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">
                    {stat.title}
                  </h4>
                  <h2 className="text-2xl font-bold text-gray-900">
                    <Counter value={stat.value} prefix={stat.prefix} />
                  </h2>
                </div>
                {/* Icon with Soft Background */}
                <div className={`p-3 rounded-xl ${getColorClasses(stat.color)}`}>
                   {stat.icon}
                </div>
              </div>

              {/* Trend Footer */}
              <div className="flex items-center gap-2 text-sm">
                <span className={`
                    flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-xs
                    ${stat.isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
                `}>
                    {stat.isPositive ? <TrendingUp fontSize="inherit" /> : <TrendingDown fontSize="inherit" />}
                    {stat.trend}
                </span>
                <span className="text-gray-400 text-xs">vs last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section (Updated Borders/Shadows) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Weekly Sales Trend</h3>
            </div>
            <div className="p-4">
              <EChart
                option={{
                  grid: { top: 32, left: 40, right: 16, bottom: 32 },
                  textStyle: { fontFamily: theme.fontFamily, color: theme.text },
                  tooltip: { trigger: "axis", backgroundColor: "#fff", borderColor: "#e2e8f0", textStyle: { color: "#1e293b" } },
                  xAxis: { type: "category", boundaryGap: false, data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], axisLine: { lineStyle: { color: "#e2e8f0" } }, axisLabel: { color: "#64748b" }, axisTick: { lineStyle: { color: "#e2e8f0" } } },
                  yAxis: { type: "value", axisLine: { lineStyle: { color: "#e2e8f0" } }, axisLabel: { color: "#64748b" }, splitLine: { lineStyle: { color: "#f1f5f9" } } },
                  series: [{ name: "Sales", type: "line", smooth: true, showSymbol: false, itemStyle: { color: "#4f46e5" }, areaStyle: { color: "rgba(79, 70, 229, 0.1)" }, data: [120, 200, 150, 80, 70, 110, 130] }],
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Stock Levels</h3>
            </div>
            <div className="p-4">
              <EChart
                option={{
                  grid: { top: 32, left: 40, right: 16, bottom: 32 },
                  textStyle: { fontFamily: theme.fontFamily, color: theme.text },
                  tooltip: { trigger: "item", backgroundColor: "#fff", borderColor: "#e2e8f0", textStyle: { color: "#1e293b" } },
                  xAxis: { type: "category", data: ["Peripherals", "Cables", "Accessories", "Monitors", "Keyboards"], axisLine: { lineStyle: { color: "#e2e8f0" } }, axisLabel: { color: "#64748b" }, axisTick: { lineStyle: { color: "#e2e8f0" } } },
                  yAxis: { type: "value", axisLine: { lineStyle: { color: "#e2e8f0" } }, axisLabel: { color: "#64748b" }, splitLine: { lineStyle: { color: "#f1f5f9" } } },
                  series: [{ name: "In Stock", type: "bar", barWidth: '40%', data: [320, 180, 260, 140, 220], itemStyle: { borderRadius: [4, 4, 0, 0], color: "#3b82f6" } }],
                }}
              />
            </div>
          </div>
        </div>

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
              <Link to="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                View all activity &rarr;
              </Link>
            </div>
          </div>

          {/* AI Assistant Card */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 flex flex-col justify-between overflow-hidden">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AutoAwesome className="text-indigo-500" fontSize="small" />
                <h3 className="text-lg font-bold text-gray-800">AI Assistant</h3>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                 <OpenInFull fontSize="small" />
              </button>
            </div>

            <div className="px-6 flex-1 flex flex-col items-center justify-center min-h-[180px]">
               <AIOrb />
               <p className="text-sm text-center text-gray-500 mt-2 font-medium">
                 Ready to help. Ask me anything about your inventory.
               </p>
            </div>

            <div className="p-4 mt-2 bg-white">
              <div className="relative flex items-center bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <button className="text-gray-400 hover:text-gray-600 transition-colors mr-2">
                  <AttachFile fontSize="small" className="rotate-45" />
                </button>
                <input 
                  type="text" 
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask me anything..." 
                  className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                />
                <div className="flex items-center gap-2 ml-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MicNone fontSize="small" />
                  </button>
                  <button 
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
                    onClick={() => console.log("AI Query:", aiQuery)}
                  >
                    <ArrowUpward fontSize="small" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;