import { useState } from "react";

export default function MemberCenter() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [confirm, setConfirm] = useState("");
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [oldPay, setOldPay] = useState("");
  const [newPay, setNewPay] = useState("");
  const [cardQuery, setCardQuery] = useState("");
  const [cardQueryResult, setCardQueryResult] = useState("");
  const [name, setName] = useState("");
  const [idCard, setIdCard] = useState("");
  const [cardSecret, setCardSecret] = useState("");

  return (
    <div className="p-4 space-y-4">
      {/* Real-name verification */}
      <div className="group-box">
        <span className="group-box-title">实名认证（身份二要素备案）</span>
        <div className="mt-3 text-xs leading-relaxed text-gray-700 mb-3 max-w-lg">
          《国家网络身份认证公共服务管理办法》：由公安部、国家网信办等六部门于2025年7月15日正式施行，建立以"网号+网证"为核心的国家网络身份认证体系，需对所有账号进行实名认证。
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <label className="w-16 text-right">姓名</label>
              <input className="win-input flex-1" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <label className="w-16 text-right">身份证</label>
              <input className="win-input flex-1" value={idCard} onChange={e => setIdCard(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <label className="w-16 text-right">卡密</label>
              <input className="win-input flex-1" value={cardSecret} onChange={e => setCardSecret(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <label className="w-16 text-right">手续费</label>
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1">
                  <input type="radio" name="fee" defaultChecked /> 使用卡密13（公司补贴5元）
                </label>
              </div>
            </div>
            <div className="flex gap-2 ml-18">
              <button className="win-btn text-sm text-white" style={{ background: "var(--orange)", border: "1px solid var(--orange-dark)", minWidth: 64 }}>认证</button>
              <button className="win-btn text-sm text-white" style={{ background: "var(--cyan)", border: "1px solid var(--cyan-dark)" }}>购买跳转</button>
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--red-accent)" }}>
              *声明：实名认证由第三方公司进行API接入，平台只收集和代付
            </div>
            <div className="flex items-center gap-2 text-xs mt-1">
              <span>本号溯源标识：</span>
              <span style={{ color: "var(--red-accent)" }}>该账号暂未认证</span>
              <button className="win-btn text-xs" style={{ background: "var(--orange)", color: "white", border: "1px solid var(--orange-dark)" }}>刷新</button>
            </div>
          </div>

          {/* Account info panel */}
          <div className="border border-gray-300 p-3 text-sm space-y-2">
            <div className="font-medium text-gray-700 mb-2 pb-1 border-b border-gray-200">账号信息</div>
            <div className="flex justify-between">
              <span className="text-gray-600">账号ID：</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>user8851fg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">VIP等级：</span>
              <span style={{ color: "var(--orange)", fontWeight: 700 }}>VIP · 商家版</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">设备ID：</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>WIN-A8K2B91F</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">授权到期：</span>
              <span className="font-medium" style={{ color: "#008000" }}>2027-08-30（365天）</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">当前积分：</span>
              <span className="font-bold" style={{ color: "var(--red-accent)" }}>218,120</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">当前讯币：</span>
              <span className="font-medium">0</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Transfer */}
        <div className="group-box">
          <span className="group-box-title">给APP手机号转账（手续费5元/笔）</span>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <label className="w-24 text-right">收款人手机号</label>
              <input className="win-input flex-1" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right">金额(讯币)</label>
              <input className="win-input" style={{ width: 100 }} value={amount} onChange={e => setAmount(e.target.value)} />
              <button className="win-btn text-sm text-white" style={{ background: "var(--orange)", border: "1px solid var(--orange-dark)" }}>确定</button>
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right">确认金额(讯币)</label>
              <input className="win-input" style={{ width: 100 }} value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="group-box">
          <span className="group-box-title">修改密码和支付密码</span>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <label className="w-20 text-right">原密码</label>
              <input type="password" className="win-input flex-1" value={oldPwd} onChange={e => setOldPwd(e.target.value)} />
              <label className="w-20 text-right">新密码</label>
              <input type="password" className="win-input flex-1" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-20 text-right">原支付密码</label>
              <input type="password" className="win-input flex-1" value={oldPay} onChange={e => setOldPay(e.target.value)} />
              <label className="w-20 text-right">新支付密码</label>
              <input type="password" className="win-input flex-1" value={newPay} onChange={e => setNewPay(e.target.value)} />
            </div>
            <div className="flex justify-center">
              <button className="win-btn text-sm" style={{ background: "#E8E8E8", minWidth: 64 }}>确定</button>
            </div>
          </div>
        </div>
      </div>

      {/* Card query */}
      <div className="group-box">
        <span className="group-box-title">查询服务（只支持本国）</span>
        <div className="mt-2 space-y-2">
          <div className="text-xs text-center mb-2" style={{ color: "var(--red-accent)" }}>暂无信息</div>
          <div className="flex items-center gap-2 text-sm">
            <label className="w-28 text-right" style={{ color: "var(--red-accent)" }}>卡密查询(查卡密正确性)</label>
            <input className="win-input flex-1" value={cardQuery} onChange={e => setCardQuery(e.target.value)} />
            <button className="win-btn text-sm" style={{ background: "#E8E8E8" }}>查询(免费)</button>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button className="win-btn text-xs text-white" style={{ background: "var(--orange)", border: "1px solid var(--orange-dark)" }}>查卡密使用者账号(1讯币)</button>
            <button className="win-btn text-xs text-white" style={{ background: "var(--orange)", border: "1px solid var(--orange-dark)" }}>查卡密使用者姓名(1讯币)</button>
          </div>
          {cardQueryResult && (
            <p className="text-sm mt-1" style={{ color: "var(--red-accent)" }}>{cardQueryResult}</p>
          )}
        </div>
      </div>
    </div>
  );
}
