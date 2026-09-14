import { useState } from "react";

type Tab = "accepted" | "market" | "expired";

const ACCEPTED = [
  { id: "20261781764642", name: "Temu(自配单)", duration: 233, price: 55920, refund: "0%", status: "已接单", completed: 114, pending: 27360, remaining: 119 },
  { id: "20261781228650", name: "剑网3(自配单)", duration: 259, price: 59570, refund: "0%", status: "已接单", completed: 247, pending: 56810, remaining: 12 },
  { id: "20261780602930", name: "三角洲行动", duration: 74, price: 19240, refund: "0%", status: "已接单", completed: 51, pending: 13260, remaining: 23 },
  { id: "20261780756874", name: "TikTok(自配单)", duration: 34, price: 8840, refund: "0%", status: "已接单", completed: 15, pending: 3900, remaining: 19 },
];

const EXPIRED = [
  { id: "20261770123456", name: "王者荣耀", duration: 100, price: 22000, refund: "2%", status: "已过期", completed: 100, pending: 0, remaining: 0 },
  { id: "20261770234567", name: "和平精英", duration: 60, price: 13200, refund: "0%", status: "已过期", completed: 60, pending: 0, remaining: 0 },
];

export default function MyTasks() {
  const [tab, setTab] = useState<Tab>("accepted");
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  const perPage = 11;

  const data = tab === "accepted" ? ACCEPTED : tab === "expired" ? EXPIRED : [];
  const totalPages = Math.ceil(data.length / perPage);
  const visible = data.slice((page - 1) * perPage, page * perPage);

  const tabLabel = tab === "accepted" ? "已接订单" : tab === "expired" ? "过期订单" : "订单市场";

  return (
    <div className="p-4" onClick={() => setContextMenu(null)}>
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-3">
        {(["accepted", "market", "expired"] as Tab[]).map(t => {
          const labels: Record<Tab, string> = { accepted: "已接订单", market: "订单市场", expired: "过期订单" };
          const active = t === tab;
          return (
            <button
              key={t}
              className="win-btn text-sm text-white font-medium"
              style={{
                background: active ? "var(--cyan-dark)" : "var(--cyan)",
                border: "1px solid var(--cyan-dark)",
                outline: active ? "2px solid var(--orange)" : "none",
              }}
              onClick={() => { setTab(t); setPage(1); }}
            >
              {labels[t]}
            </button>
          );
        })}
        <span className="ml-auto text-sm font-medium" style={{ color: "var(--red-accent)" }}>{tabLabel}</span>
        <span className="text-xs ml-4" style={{ color: "var(--red-accent)" }}>每页显示 {perPage} 行</span>
      </div>

      {/* Table */}
      <div className="border border-gray-400 overflow-x-auto">
        <table className="win-table">
          <thead>
            <tr>
              <th>订单编号</th>
              <th>用途</th>
              <th>租赁时长(时)</th>
              <th>客户出价(积分)</th>
              <th>退款率</th>
              <th>订单状态</th>
              <th>已完成时长</th>
              <th>待结算金额</th>
              <th>合同剩余时长</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(t => (
              <tr
                key={t.id}
                className={selected === t.id ? "selected" : ""}
                onClick={() => setSelected(t.id)}
                onContextMenu={e => {
                  e.preventDefault();
                  setSelected(t.id);
                  setContextMenu({ x: e.clientX, y: e.clientY, id: t.id });
                }}
                style={{ cursor: "default" }}
              >
                <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>{t.id}</td>
                <td>{t.name}</td>
                <td>{t.duration}</td>
                <td>{t.price.toLocaleString()}</td>
                <td style={{ color: parseFloat(t.refund) > 5 ? "var(--red-accent)" : undefined }}>{t.refund}</td>
                <td style={{ color: t.status === "已过期" ? "#999" : "#007ACC", fontWeight: 500 }}>{t.status}</td>
                <td>{t.completed}</td>
                <td>{t.pending > 0 ? t.pending.toLocaleString() : 0}</td>
                <td>{t.remaining > 0 ? t.remaining : "—"}</td>
              </tr>
            ))}
            {visible.length < perPage && Array.from({ length: perPage - visible.length }).map((_, i) => (
              <tr key={"empty-" + i}>
                {Array.from({ length: 9 }).map((__, j) => <td key={j}>&nbsp;</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-2 mt-3">
        <button className="win-btn text-sm text-white" style={{ background: "var(--cyan)", border: "1px solid var(--cyan-dark)" }}>
          刷新
        </button>
        <button className="win-btn text-sm text-white" style={{ background: "var(--orange)", border: "1px solid var(--orange-dark)" }}
          onClick={() => setPage(p => Math.max(1, p - 1))}>
          上一页
        </button>
        <span className="text-sm px-2" style={{ background: "var(--orange)", color: "white", padding: "2px 8px" }}>{page}</span>
        <button className="win-btn text-sm text-white" style={{ background: "var(--orange)", border: "1px solid var(--orange-dark)" }}
          onClick={() => setPage(p => Math.min(Math.max(totalPages, 1), p + 1))}>
          下一页
        </button>
        <span className="text-sm text-gray-600 ml-2">跳转到页面</span>
        <select className="win-select" style={{ width: 60 }} value={page} onChange={e => setPage(Number(e.target.value))}>
          {Array.from({ length: Math.max(totalPages, 1) }, (_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
        <button className="win-btn text-sm" style={{ background: "#E8E8E8" }}>确定</button>
        <span className="ml-4 text-xs" style={{ color: "var(--red-accent)" }}>*选中列表右键可弹出菜单</span>
      </div>

      {/* Restriction checkboxes */}
      <div className="flex items-center gap-8 mt-3">
        {["禁止用户远程下载", "禁止用户使用QQ、微信、飞机等聊天工具", "禁止用户占用计算机算力"].map(label => (
          <label key={label} className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-3 h-3" />
            {label}
          </label>
        ))}
      </div>

      {/* Notices */}
      <div className="mt-4 space-y-1.5 text-center text-sm" style={{ color: "var(--red-accent)" }}>
        <p>温馨提示：客户退款率是根据历史订单客户退款率所统计</p>
        <p>接单成功后合同立即生效，无论客户是否使用，都不影响计费。</p>
        <p>如果您主动取消订单，将无法获得该订单产生的收益</p>
        <p>如果客户主动申请退款，仍需支付该订单产生的收益（您如果长时间不在线、违约除外）</p>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed border border-gray-400 bg-white shadow-md z-50"
          style={{ top: contextMenu.y, left: contextMenu.x, minWidth: 120 }}
          onClick={e => e.stopPropagation()}
        >
          <button className="block w-full text-left px-4 py-1.5 text-sm hover:bg-blue-100">查看详情</button>
          <button className="block w-full text-left px-4 py-1.5 text-sm hover:bg-blue-100 text-red-600">取消订单</button>
          <div className="border-t border-gray-200" />
          <button className="block w-full text-left px-4 py-1.5 text-sm hover:bg-blue-100" onClick={() => setContextMenu(null)}>关闭</button>
        </div>
      )}
    </div>
  );
}
