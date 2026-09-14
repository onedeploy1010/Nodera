import { useState } from "react";

const MARKET_ITEMS = [
  { id: "JF173432403351", uid: "1724894679", item: "积分", qty: 10000, price: 1000 },
  { id: "XB175065689820", uid: "1744177095", item: "讯币", qty: 100, price: 110000 },
  { id: "XB175306873532", uid: "1717181737", item: "讯币", qty: 50, price: 55000 },
  { id: "XB175438781432", uid: "1811183485", item: "讯币", qty: 30, price: 33000 },
  { id: "XB175440665527", uid: "1743222903", item: "讯币", qty: 35, price: 37000 },
  { id: "XB175440666312", uid: "1743222903", item: "讯币", qty: 35, price: 37000 },
  { id: "XB175440690146", uid: "1743223012", item: "讯币", qty: 35, price: 37000 },
  { id: "XB175440885465", uid: "1743222772", item: "讯币", qty: 20, price: 21500 },
  { id: "XB175473364949", uid: "1805303063", item: "讯币", qty: 100, price: 110000 },
  { id: "XB175504962082", uid: "1743222484", item: "讯币", qty: 35, price: 37000 },
];

export default function PointsCenter() {
  const [consignPoints, setConsignPoints] = useState("");
  const [consignPrice, setConsignPrice] = useState("");
  const [consignCoins, setConsignCoins] = useState("");
  const [consignCoinPrice, setConsignCoinPrice] = useState("");
  const [exchangeQty, setExchangeQty] = useState("");
  const [totalCoins] = useState(0);
  const [signCoins] = useState(0);
  const [tier] = useState(1);

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <button className="win-btn text-sm text-white font-medium" style={{ background: "var(--cyan)", border: "1px solid var(--cyan-dark)" }}>
          积分讯币市场
        </button>
        <button className="win-btn text-sm text-white font-medium" style={{ background: "var(--cyan)", border: "1px solid var(--cyan-dark)" }}>
          讯币提现
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Market table */}
        <div>
          <div className="text-xs text-center mb-1" style={{ color: "var(--red-accent)" }}>购买手续费为100积分/笔</div>
          <div className="border border-gray-400 overflow-x-auto">
            <table className="win-table">
              <thead>
                <tr>
                  <th>订单编号</th>
                  <th>用户ID</th>
                  <th>商品名称</th>
                  <th>出售数量</th>
                  <th>价格</th>
                </tr>
              </thead>
              <tbody>
                {MARKET_ITEMS.map(item => (
                  <tr key={item.id} style={{ cursor: "default" }}>
                    <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10 }}>{item.id}</td>
                    <td style={{ fontSize: 11 }}>{item.uid}</td>
                    <td>{item.item}</td>
                    <td>{item.qty.toLocaleString()}</td>
                    <td style={{ color: "var(--orange)", fontWeight: 500 }}>{item.price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button className="win-btn text-sm text-white" style={{ background: "var(--cyan)", border: "1px solid var(--cyan-dark)" }}>刷新</button>
            <button className="win-btn text-sm text-white" style={{ background: "var(--orange)", border: "1px solid var(--orange-dark)" }}>上一页</button>
            <span className="text-sm" style={{ background: "var(--orange)", color: "white", padding: "2px 8px" }}>1</span>
            <button className="win-btn text-sm text-white" style={{ background: "var(--orange)", border: "1px solid var(--orange-dark)" }}>下一页</button>
            <span className="text-sm text-gray-600">页数</span>
            <input className="win-input" style={{ width: 50 }} />
            <button className="win-btn text-sm" style={{ background: "#E8E8E8" }}>跳转</button>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--red-accent)" }}>*选中列表右键可弹出菜单 &nbsp; *购买技巧：出售价格比例大于寄售价格比例，购买为赚</p>
        </div>

        {/* Right: Consign forms + daily check-in */}
        <div className="space-y-3">
          {/* Consign points */}
          <div className="group-box">
            <span className="group-box-title">寄售积分</span>
            <div className="text-xs mb-2" style={{ color: "var(--red-accent)" }}>寄售手续费为寄售价格的3%，不足100积分按100积分/笔计算</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-24 text-right">寄售积分数量</span>
                <input className="win-input flex-1" value={consignPoints} onChange={e => setConsignPoints(e.target.value)} />
                <span>积分</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-24 text-right">寄售价格(元)</span>
                <input className="win-input flex-1" value={consignPrice} onChange={e => setConsignPrice(e.target.value)} />
                <span>讯币</span>
              </div>
              <div className="flex justify-end">
                <button className="win-btn text-sm text-white" style={{ background: "var(--orange)", border: "1px solid var(--orange-dark)", minWidth: 80 }}>
                  发布订单
                </button>
              </div>
            </div>
          </div>

          {/* Consign coins */}
          <div className="group-box">
            <span className="group-box-title" style={{ color: "#007ACC" }}>寄售讯币</span>
            <div className="space-y-2 mt-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-24 text-right">寄售讯币数量</span>
                <input className="win-input flex-1" value={consignCoins} onChange={e => setConsignCoins(e.target.value)} />
                <span>讯币</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-24 text-right">寄售价格(积分)</span>
                <input className="win-input flex-1" value={consignCoinPrice} onChange={e => setConsignCoinPrice(e.target.value)} />
                <span>积分</span>
              </div>
              <div className="flex justify-end">
                <button className="win-btn text-sm text-white" style={{ background: "var(--orange)", border: "1px solid var(--orange-dark)", minWidth: 80 }}>
                  发布订单
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-600">每日最多寄售5笔</span>
              <div className="flex gap-2">
                <button className="win-btn text-xs text-white" style={{ background: "var(--orange)", border: "1px solid var(--orange-dark)" }}>寄售记录</button>
                <button className="win-btn text-xs text-white" style={{ background: "var(--orange)", border: "1px solid var(--orange-dark)" }}>购买记录</button>
              </div>
            </div>
          </div>

          {/* Exchange */}
          <div className="group-box">
            <span className="group-box-title" style={{ color: "#007ACC" }}>积分换讯币(官方直换)</span>
            <div className="mt-1 text-xs space-y-0.5" style={{ color: "var(--orange)" }}>
              <p>每月可以免费兑换300元讯币的额度</p>
              <p>每日最多可以免费兑换100讯币</p>
              <p>建议通过寄售或购买获得讯币</p>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <span>兑换讯币数量</span>
              <input className="win-input" style={{ width: 80 }} value={exchangeQty} onChange={e => setExchangeQty(e.target.value)} />
              <button className="win-btn text-sm text-white" style={{ background: "var(--orange)", border: "1px solid var(--orange-dark)" }}>确定</button>
            </div>
            <p className="text-xs mt-1 text-gray-600">1000积分换1讯币 &nbsp; 1讯币=1RMB购买力</p>
          </div>

          {/* Daily sign-in summary */}
          <div className="group-box">
            <span className="group-box-title" style={{ color: "#007ACC" }}>每日签到</span>
            <div className="text-xs mb-2" style={{ color: "var(--orange)" }}>每日签到奖励讯币总额的0.3%-1%！</div>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span>当前讯币总数：</span>
                <div className="flex items-center gap-3">
                  <strong>{totalCoins}</strong>
                  <button className="win-btn text-xs text-white" style={{ background: "var(--orange)", border: "1px solid var(--orange-dark)" }}>签到</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>当前签到奖励讯币总数：</span>
                <div className="flex items-center gap-3">
                  <strong>{signCoins}</strong>
                  <button className="win-btn text-xs text-white" style={{ background: "var(--orange)", border: "1px solid var(--orange-dark)" }}>转为讯币</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>当前档位级别：</span>
                <div className="flex items-center gap-3">
                  <strong>{tier}</strong>
                  <button className="win-btn text-xs" style={{ background: "#E8E8E8" }}>刷新信息</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
