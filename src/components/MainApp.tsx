import { useState } from "react";
import HomePage from "./pages/HomePage";
import TaskMarket from "./pages/TaskMarket";
import MyTasks from "./pages/MyTasks";
import PointsCenter from "./pages/PointsCenter";
import MemberCenter from "./pages/MemberCenter";

const NAV_ITEMS = [
  { key: "home", label: "首页" },
  { key: "market", label: "任务市场" },
  { key: "mytasks", label: "我的任务" },
  { key: "points", label: "积分兑换" },
  { key: "member", label: "会员中心" },
];

export default function MainApp() {
  const [page, setPage] = useState("home");
  const [points] = useState(218120);
  const [coins] = useState(0);

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage />;
      case "market": return <TaskMarket />;
      case "mytasks": return <MyTasks />;
      case "points": return <PointsCenter />;
      case "member": return <MemberCenter />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="size-full flex flex-col" style={{ background: "#F0F0F0", minHeight: 0 }}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-1 shrink-0" style={{ background: "var(--yellow)", minHeight: 38 }}>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded" style={{ background: "#CC0000" }}>
            <span className="text-white font-black text-sm">X</span>
          </div>
          <div>
            <div className="font-bold text-base text-black leading-tight">云任务接单平台</div>
            <div className="text-gray-600" style={{ fontSize: 10 }}>FastTask Pro — 商家版</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-gray-700">●</span>
              <span className="text-xs text-gray-700">已连接</span>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-800">user8851fg</span>
          <div className="flex gap-1">
            <button className="w-6 h-5 text-xs border border-gray-500 bg-gray-200 hover:bg-gray-300 flex items-center justify-center">—</button>
            <button className="w-6 h-5 text-xs border border-gray-500 bg-gray-200 hover:bg-gray-300 flex items-center justify-center">□</button>
            <button className="w-6 h-5 text-xs border border-gray-500 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center">✕</button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center px-4 shrink-0" style={{ background: "var(--yellow-dark)", borderBottom: "1px solid #CCA000" }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            onClick={() => setPage(item.key)}
            className="px-5 py-2 text-sm font-medium transition-colors"
            style={{
              background: page === item.key ? "white" : "transparent",
              color: page === item.key ? "#000" : "#333",
              borderLeft: "1px solid transparent",
              borderRight: "1px solid transparent",
              borderTop: "1px solid transparent",
              borderBottom: page === item.key ? "1px solid white" : "1px solid transparent",
              marginBottom: page === item.key ? -1 : 0,
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto bg-white" style={{ minHeight: 0 }}>
        {renderPage()}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-0.5 shrink-0 text-xs border-t border-gray-400" style={{ background: "#E8E8E8" }}>
        <div className="flex items-center gap-6">
          <span className="text-gray-600">设备ID: WIN-A8K2B91F</span>
          <span className="text-gray-600">授权到期: 2027-08-30</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-gray-700">
            <span className="font-medium" style={{ color: "var(--orange)" }}>VIP</span>
          </span>
          <span className="text-gray-700">当前积分：<strong>{points.toLocaleString()}</strong></span>
          <span className="text-gray-700">当前讯币：<strong>{coins}</strong></span>
        </div>
      </div>
    </div>
  );
}
