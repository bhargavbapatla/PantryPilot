import { Link } from "react-router-dom";
import { useEffect } from "react";
import EChart from "../../../components/charts/EChart";
import { useAuth } from "../../../features/auth/authContext";
// 1. Import Framer Motion hooks
import { motion, useSpring, useTransform } from "framer-motion";

// 2. Create the Reusable Counter Component
function Counter({ value, prefix = "" }: { value: number; prefix?: string }) {
  const spring = useSpring(0, { bounce: 0, duration: 2000 });
  const display = useTransform(spring, (current) => 
    prefix + Math.round(current).toLocaleString() // Adds commas (e.g., 1,234)
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

const Dashboard = () => {
  const { theme } = useAuth();

  // 3. Update stats to use Numbers (int) instead of Strings
  const stats = [
    { title: "Total Items", value: 1234, color: theme.primary },
    { title: "Low Stock", value: 12, color: theme.secondary },
    { title: "Total Value", value: 45678, prefix: "$", color: theme.neutral },
    { title: "Pending Orders", value: 5, color: theme.secondary },
  ];

  const recentActivity = [
    { id: 1, action: 'Added new item "Wireless Mouse"', time: "2 hours ago" },
    { id: 2, action: 'Updated stock for "Mechanical Keyboard"', time: "4 hours ago" },
    { id: 3, action: 'Low stock alert: "USB-C Cable"', time: "5 hours ago" },
    { id: 4, action: 'Removed item "Old Monitor"', time: "1 day ago" },
  ];

  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundColor: theme.surface,
        color: theme.text,
        fontFamily: theme.fontFamily,
      }}
    >
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: theme.text }}
            >
              Dashboard
            </h1>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Welcome back to your inventory overview.
            </p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-lg shadow p-6 border-l-4 transition-all"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium uppercase tracking-wider"
                    style={{ color: theme.textMuted }}
                  >
                    {stat.title}
                  </p>
                  
                  {/* 4. Use the Counter Component here */}
                  <p
                    className="mt-1 text-2xl font-semibold"
                    style={{ color: theme.text }}
                  >
                    <Counter value={stat.value} prefix={stat.prefix} />
                  </p>
                  
                </div>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: stat.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div
            className="rounded-lg shadow"
            style={{ backgroundColor: theme.surface }}
          >
            <div
              className="p-6 border-b flex items-center justify-between"
              style={{ borderColor: theme.border }}
            >
              <h3
                className="text-lg font-medium"
                style={{ color: theme.text }}
              >
                Weekly Sales Trend
              </h3>
            </div>
            <div className="p-4">
              <EChart
                option={{
                  grid: { top: 32, left: 40, right: 16, bottom: 32 },
                  textStyle: {
                    fontFamily: theme.fontFamily,
                    color: theme.text,
                  },
                  tooltip: {
                    trigger: "axis",
                    backgroundColor: theme.surfaceAlt,
                    borderColor: theme.border,
                    textStyle: {
                      color: theme.text,
                      fontFamily: theme.fontFamily,
                    },
                  },
                  xAxis: {
                    type: "category",
                    boundaryGap: false,
                    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    axisLine: {
                      lineStyle: { color: theme.border },
                    },
                    axisLabel: {
                      color: theme.textMuted,
                    },
                    axisTick: {
                      lineStyle: { color: theme.border },
                    },
                  },
                  yAxis: {
                    type: "value",
                    axisLine: {
                      lineStyle: { color: theme.border },
                    },
                    axisLabel: {
                      color: theme.textMuted,
                    },
                    splitLine: {
                      lineStyle: { color: theme.chartLine },
                    },
                  },
                  series: [
                    {
                      name: "Sales",
                      type: "line",
                      smooth: true,
                      itemStyle: {
                        color: theme.chartLine,
                      },
                      areaStyle: {
                        color: `${theme.primary}26`,
                      },
                      data: [120, 200, 150, 80, 70, 110, 130],
                    },
                  ],
                }}
              />
            </div>
          </div>

          <div
            className="rounded-lg shadow"
            style={{ backgroundColor: theme.surface }}
          >
            <div
              className="p-6 border-b flex items-center justify-between"
              style={{ borderColor: theme.border }}
            >
              <h3
                className="text-lg font-medium"
                style={{ color: theme.text }}
              >
                Stock Levels by Category
              </h3>
            </div>
            <div className="p-4">
              <EChart
                option={{
                  grid: { top: 32, left: 40, right: 16, bottom: 32 },
                  textStyle: {
                    fontFamily: theme.fontFamily,
                    color: theme.text,
                  },
                  tooltip: {
                    trigger: "item",
                    backgroundColor: theme.surfaceAlt,
                    borderColor: theme.border,
                    textStyle: {
                      color: theme.text,
                      fontFamily: theme.fontFamily,
                    },
                  },
                  xAxis: {
                    type: "category",
                    data: [
                      "Peripherals",
                      "Cables",
                      "Accessories",
                      "Monitors",
                      "Keyboards",
                    ],
                    axisLine: {
                      lineStyle: { color: theme.border },
                    },
                    axisLabel: {
                      color: theme.textMuted,
                    },
                    axisTick: {
                      lineStyle: { color: theme.border },
                    },
                  },
                  yAxis: {
                    type: "value",
                    axisLine: {
                      lineStyle: { color: theme.border },
                    },
                    axisLabel: {
                      color: theme.textMuted,
                    },
                    splitLine: {
                      lineStyle: { color: theme.chartLine },
                    },
                  },
                  series: [
                    {
                      name: "In Stock",
                      type: "bar",
                      data: [320, 180, 260, 140, 220],
                      itemStyle: { color: theme.chartLine },
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div
            className="rounded-lg shadow lg:col-span-2"
            style={{ backgroundColor: theme.surface }}
          >
            <div
              className="p-6 border-b"
              style={{ borderColor: theme.border }}
            >
              <h3
                className="text-lg font-medium"
                style={{ color: theme.text }}
              >
                Recent Activity
              </h3>
            </div>
            <ul className="divide-y" style={{ borderColor: theme.border }}>
              {recentActivity.map((activity) => (
                <li
                  key={activity.id}
                  className="p-6 transition"
                  style={{ color: theme.text }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{activity.action}</p>
                    <span
                      className="text-sm"
                      style={{ color: theme.textMuted }}
                    >
                      {activity.time}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <div
              className="p-4 border-t rounded-b-lg"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceAlt,
              }}
            >
              <Link
                to="#"
                className="text-sm font-medium"
                style={{ color: theme.primary }}
              >
                View all activity &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;