import { useState } from "react";

interface Props {
  onActivate: () => void;
}

const DEVICE_ID = "WIN-" + Math.random().toString(36).slice(2, 10).toUpperCase();

export default function ActivationScreen({ onActivate }: Props) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleActivate = () => {
    if (!key.trim()) {
      setError("请输入激活码");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (key.trim().length >= 16) {
        onActivate();
      } else {
        setError("激活码无效或已过期，请检查后重试");
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="size-full flex flex-col" style={{ background: "#F0F0F0" }}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-1" style={{ background: "var(--yellow)", minHeight: 36 }}>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded" style={{ background: "#CC0000" }}>
            <span className="text-white font-black text-sm">X</span>
          </div>
          <span className="font-bold text-base text-black" style={{ fontFamily: "'Microsoft YaHei', sans-serif" }}>
            云任务接单平台
          </span>
          <span className="text-xs text-gray-600 ml-1">FastTask Pro</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-700">未激活</span>
          <button className="w-6 h-5 text-xs border border-gray-400 bg-gray-200 hover:bg-gray-300 flex items-center justify-center">—</button>
          <button className="w-6 h-5 text-xs border border-gray-400 bg-gray-200 hover:bg-gray-300 flex items-center justify-center">□</button>
          <button className="w-6 h-5 text-xs border border-gray-400 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center">✕</button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white border border-gray-400 shadow-lg" style={{ width: 480 }}>
          {/* Dialog title */}
          <div className="px-4 py-3 border-b border-gray-300" style={{ background: "var(--yellow)" }}>
            <h2 className="font-bold text-base text-black">软件激活 — 设备绑定授权</h2>
          </div>

          <div className="p-6 space-y-5">
            {/* Device info */}
            <div className="group-box">
              <span className="group-box-title">当前设备信息</span>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-24">设备ID：</span>
                  <span className="font-mono text-xs bg-gray-100 border border-gray-300 px-2 py-1 flex-1" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    {DEVICE_ID}
                  </span>
                  <button
                    className="win-btn text-xs"
                    style={{ background: "#E8E8E8" }}
                    onClick={() => navigator.clipboard?.writeText(DEVICE_ID)}
                  >
                    复制
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-24">绑定状态：</span>
                  <span className="text-red-600 font-medium">未激活</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-24">有效期：</span>
                  <span className="text-gray-500">激活后 1 年</span>
                </div>
              </div>
            </div>

            {/* Activation key input */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700 w-20 shrink-0">激活码：</label>
                <input
                  className="win-input flex-1 font-mono text-sm"
                  style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em" }}
                  placeholder="请输入16位或以上激活码"
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleActivate()}
                  maxLength={64}
                />
              </div>
              {error && (
                <p className="text-xs ml-20" style={{ color: "var(--red-accent)" }}>{error}</p>
              )}
            </div>

            {/* Notice */}
            <div className="text-xs space-y-1 leading-relaxed" style={{ color: "var(--red-accent)" }}>
              <p>※ 激活码与设备硬件绑定，激活后无法更换设备</p>
              <p>※ 每个激活码有效期为 1 年，到期后需重新购买</p>
              <p>※ 如需购买激活码，请联系官方客服或授权经销商</p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button className="win-btn text-sm" style={{ background: "#E8E8E8" }}>
                联系客服
              </button>
              <div className="flex gap-3">
                <button className="win-btn text-sm" style={{ background: "#E8E8E8" }}>
                  取消
                </button>
                <button
                  className="win-btn text-sm text-white font-medium"
                  style={{ background: loading ? "#999" : "var(--orange)", border: "1px solid #CC7000", minWidth: 80 }}
                  onClick={handleActivate}
                  disabled={loading}
                >
                  {loading ? "验证中..." : "立即激活"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center px-3 py-0.5 text-xs border-t border-gray-400" style={{ background: "#E8E8E8" }}>
        <span className="text-gray-600">版本 v2.1.0 · 请联系官方获取激活码</span>
      </div>
    </div>
  );
}
