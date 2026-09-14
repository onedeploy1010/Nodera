import { useState } from "react";

const MARKET_TASKS = [
  { id: "20261780765884", name: "英雄联盟", duration: 412, price: 98880, refund: "5%", status: "未接单", completed: 0, pending: 0, remaining: 412 },
  { id: "20261780765796", name: "CF(自配单)", duration: 500, price: 115000, refund: "0%", status: "未接单", completed: 0, pending: 0, remaining: 500 },
  { id: "20261780765707", name: "DNF(平台补贴)", duration: 480, price: 105600, refund: "0%", status: "未接单", completed: 0, pending: 0, remaining: 480 },
  { id: "20261780766009", name: "DNF(自配单)", duration: 500, price: 110000, refund: "0%", status: "未接单", completed: 0, pending: 0, remaining: 500 },
  { id: "20261780765823", name: "Temu(自配单)", duration: 500, price: 115000, refund: "0%", status: "未接单", completed: 0, pending: 0, remaining: 500 },
  { id: "20261780765731", name: "Temu(自配单)", duration: 500, price: 110000, refund: "0%", status: "未接单", completed: 0, pending: 0, remaining: 500 },
  { id: "20261780765768", name: "CF(自配单)", duration: 500, price: 110000, refund: "0%", status: "未接单", completed: 0, pending: 0, remaining: 500 },
  { id: "20261780765725", name: "剑网3", duration: 490, price: 117600, refund: "15%", status: "未接单", completed: 0, pending: 0, remaining: 490 },
  { id: "20261780765932", name: "梦幻西游", duration: 459, price: 110160, refund: "4%", status: "未接单", completed: 0, pending: 0, remaining: 459 },
  { id: "20261780765753", name: "逆水寒", duration: 289, price: 63580, refund: "11%", status: "未接单", completed: 0, pending: 0, remaining: 289 },
  { id: "20261780765655", name: "剑灵", duration: 288, price: 60480, refund: "12%", status: "未接单", completed: 0, pending: 0, remaining: 288 },
];

export default function TaskMarket() {
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null);

  const perPage = 11;
  const totalPages = Math.ceil(MARKET_TASKS.length / perPage);
  const visible = MARKET_TASKS.slice((page - 1) * perPage, page * perPage);

  const handleAccept = (id: string) => {
    setAccepted(prev => new Set([...prev, id]));
    setContextMenu(null);
  };

  return (
    <div
      className="p-4"
      onClick={() => setContextMenu(null)}
    >
      {/* Tab headers */}
      <div className="flex items-center gap-2 mb-3">
        <button className="win-btn text-sm text-white font-medium" style={{ background: "var(--cyan)", border: "1px solid var(--cyan-dark)" }}>
          已接订单
        </button>
        <button className="win-btn text-sm text-white font-medium" style={{ background: "var(--cyan)", border: "1px solid var(--cyan-dark)" }}>
          订单市场
        </button>
        <button className="win-btn text-sm text-white font-medium" style={{ background: "var(--cyan)", border: "1px solid var(--cyan-dark)" }}>
          过期订单
        </button>
        <span className="ml-auto text-sm font-medium" style={{ color: "var(--red-accent)" }}>订单市场</span>
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
                <td style={{ color: accepted.has(t.id) ? "#007ACC" : "#666" }}>
                  {accepted.has(t.id) ? "已接单" : t.status}
                </td>
                <td>{t.completed}</td>
                <td>{t.pending}</td>
                <td>{t.remaining}</td>
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
        <button className="win-btn text-sm text-white" style={{ background: "var(--cyan)", border: "1px solid var(--cyan-dark)" }}
          onClick={() => setPage(1)}>
          刷新
        </button>
        <button className="win-btn text-sm text-white" style={{ background: "var(--orange)", border: "1px solid var(--orange-dark)" }}
          onClick={() => setPage(p => Math.max(1, p - 1))}>
          上一页
        </button>
        <span className="text-sm px-2" style={{ background: "var(--orange)", color: "white", padding: "2px 8px" }}>{page}</span>
        <button className="win-btn text-sm text-white" style={{ background: "var(--orange)", border: "1px solid var(--orange-dark)" }}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
          下一页
        </button>
        <span className="text-sm text-gray-600 ml-2">跳转到页面</span>
        <select className="win-select" style={{ width: 60 }} onChange={e => setPage(Number(e.target.value))} value={page}>
          {Array.from({ length: totalPages }, (_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
        <button className="win-btn text-sm" style={{ background: "#E8E8E8" }}>确定</button>
        <span className="ml-4 text-xs" style={{ color: "var(--red-accent)" }}>*选中列表右键可弹出菜单</span>
      </div>

      {/* Notice */}
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
          <button
            className="block w-full text-left px-4 py-1.5 text-sm hover:bg-blue-100"
            onClick={() => handleAccept(contextMenu.id)}
          >
            接受订单
          </button>
          <button
            className="block w-full text-left px-4 py-1.5 text-sm hover:bg-blue-100"
            onClick={() => setContextMenu(null)}
          >
            查看详情
          </button>
          <div className="border-t border-gray-200" />
          <button
            className="block w-full text-left px-4 py-1.5 text-sm hover:bg-blue-100"
            onClick={() => setContextMenu(null)}
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}
