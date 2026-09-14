import { useState } from "react";

const stats = [
  { label: "当前积分", value: "218,120", color: "#CC0000" },
  { label: "今日收益", value: "3,240", color: "#FF8C00" },
  { label: "本月收益", value: "47,800", color: "#007ACC" },
  { label: "完成任务", value: "156", color: "#008000" },
];

const notices = [
  "【公告】平台已完成系统升级，接单速度提升30%",
  "【提醒】每日签到可获得积分奖励，请勿忘记签到",
  "【活动】本月完成20单以上享受额外5%积分加成",
  "【规则】接单后合同立即生效，无论客户是否使用均计费",
  "【重要】如主动取消订单，将无法获得该订单产生的收益",
];

const recentTasks = [
  { id: "20261781764642", name: "Temu(自配单)", duration: 233, price: 55920, refund: "0%", status: "已接单", completed: 114, pending: 27360, remaining: 119 },
  { id: "20261781228650", name: "剑网3(自配单)", duration: 259, price: 59570, refund: "0%", status: "已接单", completed: 247, pending: 56810, remaining: 12 },
  { id: "20261780602930", name: "三角洲行动", duration: 74, price: 19240, refund: "0%", status: "已完成", completed: 51, pending: 13260, remaining: 0 },
];

export default function HomePage() {
  const [signed, setSigned] = useState(false);

  return (
    <div className="p-4 space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="border border-gray-300 bg-gray-50 p-3">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className="text-xl font-bold" style={{ color: s.color, fontFamily: "JetBrains Mono, monospace" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Recent tasks */}
        <div className="col-span-2 border border-gray-300">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-300" style={{ background: "#F0F0F0" }}>
            <span className="text-sm font-medium">最近任务</span>
            <span className="text-xs" style={{ color: "var(--red-accent)" }}>共 {recentTasks.length} 条</span>
          </div>
          <table className="win-table">
            <thead>
              <tr>
                <th>任务编号</th>
                <th>任务名称</th>
                <th>时长(时)</th>
                <th>积分</th>
                <th>状态</th>
                <th>剩余时长</th>
              </tr>
            </thead>
            <tbody>
              {recentTasks.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>{t.id}</td>
                  <td>{t.name}</td>
                  <td>{t.duration}</td>
                  <td style={{ color: "var(--orange)", fontWeight: 500 }}>{t.price.toLocaleString()}</td>
                  <td>
                    <span style={{
                      color: t.status === "已完成" ? "#008000" : "#007ACC",
                      fontWeight: 500
                    }}>
                      {t.status}
                    </span>
                  </td>
                  <td>{t.remaining > 0 ? t.remaining : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Daily check-in + quick info */}
        <div className="space-y-3">
          {/* Sign in */}
          <div className="group-box">
            <span className="group-box-title">每日签到</span>
            <div className="mt-3 space-y-2 text-sm">
              <p className="text-xs text-gray-600">每日签到奖励积分总额的 <strong>0.3%–1%</strong></p>
              <div className="flex justify-between text-xs">
                <span>当前积分总数：</span>
                <span className="font-medium">218,120</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>当前签到奖励：</span>
                <span className="font-medium" style={{ color: "var(--orange)" }}>+654 积分</span>
              </div>
              <button
                className="win-btn w-full text-sm text-white font-medium mt-2"
                style={{
                  background: signed ? "#999" : "var(--orange)",
                  border: "1px solid " + (signed ? "#777" : "#CC7000"),
                }}
                onClick={() => setSigned(true)}
                disabled={signed}
              >
                {signed ? "今日已签到 ✓" : "签到"}
              </button>
            </div>
          </div>

          {/* License info */}
          <div className="group-box">
            <span className="group-box-title">授权信息</span>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">设备ID：</span>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10 }}>WIN-A8K2B91F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">授权类型：</span>
                <span style={{ color: "var(--orange)", fontWeight: 700 }}>VIP 商家版</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">到期时间：</span>
                <span className="font-medium">2027-08-30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">剩余天数：</span>
                <span className="font-medium" style={{ color: "#008000" }}>365 天</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notices */}
      <div className="border border-gray-300 p-3">
        <div className="text-sm font-medium mb-2 text-gray-700 border-b border-gray-200 pb-1">平台公告</div>
        <div className="space-y-1.5">
          {notices.map((n, i) => (
            <div key={i} className="text-xs flex items-start gap-2">
              <span style={{ color: "var(--red-accent)", fontWeight: 700, minWidth: 12 }}>·</span>
              <span style={{ color: i < 2 ? "var(--red-accent)" : "#333" }}>{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
