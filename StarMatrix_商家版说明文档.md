# StarMatrix 商家版后台 — 完整页面与功能说明文档

> 版本：v3.2.1 | 更新日期：2026-09-03
> 适用对象：产品经理、开发工程师、测试人员、运营人员

---

## 目录

1. [系统总览](#1-系统总览)
2. [登录认证模块](#2-登录认证模块)
3. [首页（MerchantHome）](#3-首页merchanthome)
4. [订单中心（MerchantOrders）](#4-订单中心merchantorders)
5. [积分提现（MerchantPoints）](#5-积分提现merchantpoints)
6. [积分抽奖（MerchantLottery）](#6-积分抽奖merchantlottery)
7. [会员中心（MerchantMember）](#7-会员中心merchantmember)
8. [服务商节点（MerchantAccounts）](#8-服务商节点merchantaccounts)
9. [全局组件](#9-全局组件)
10. [参数速查表](#10-参数速查表)

---

## 1. 系统总览

### 1.1 技术架构

| 项目 | 值 |
|---|---|
| 框架 | React 19 + TypeScript 5.7 |
| 构建工具 | Vite 8 |
| 样式 | 内联 style 对象（无 Tailwind 组件类） |
| 字体 | Noto Sans SC（中文 UI）、JetBrains Mono（数字/代码） |
| 路由 | 无 URL 路由，单页面状态切换（`useState<MerchantPage>`） |

### 1.2 页面类型定义

```typescript
type MerchantPage = "home" | "orders" | "points" | "member" | "accounts" | "lottery"
```

### 1.3 全局色彩令牌（C 对象）

```typescript
const C = {
  yellow:  "#FFD700",   // 主色调，金色
  orange:  "#FF8C00",   // 警告/次级高亮
  red:     "#E53935",   // 错误/危险
  green:   "#43A047",   // 成功/在线
  blue:    "#1976D2",   // 信息
  dark:    "#1C1C2E",   // 深色背景/主色
  border:  "#E0E0E0",   // 边框
  bg:      "#F4F5F7",   // 页面背景
  card:    "#FFFFFF",   // 卡片背景
  text:    "#1C1C2E",   // 主文字
  muted:   "#757575",   // 次级文字
}
```

### 1.4 顶部状态栏

| 元素 | 内容 |
|---|---|
| Logo | StarMatrix 水平 Logo（logoHorizImg） |
| 标签 | "商家版" |
| 在线状态 | 绿色圆点 |
| 账号ID | sb1920mg |
| 等级徽章 | 黄金（Badge） |
| 窗口控制按钮 | 最小化 / 还原 / 关闭（纯视觉） |

### 1.5 左侧导航栏

宽度：72px，图标 + 文字纵向排列，选中状态显示左侧金色边框线。

| key | 图标 | 标签 |
|---|---|---|
| home | 房屋 SVG | 首页 |
| orders | 表格 SVG | 订单中心 |
| points | 硬币圆 SVG | 积分提现 |
| lottery | 骰子圆 SVG | 积分抽奖 |
| member | 人物 SVG | 会员中心 |
| accounts | 闪电 SVG | 服务商节点 |

底部：退出登录按钮（弹 confirm 确认框）

### 1.6 底部状态栏

```
● 已连接  |  积分 218,120  |  云币 0  |  v3.2.1  |  到期 2027-08-30
```

---

## 2. 登录认证模块

### 2.1 页面布局

左半部分：品牌广告区（深色背景）
右半部分：登录/注册/忘记密码表单

### 2.2 广告区内容

- Logo 图（logoHorizImg，height 40px）
- 眉题：Global Node Infrastructure（黄色，字间距 4）
- 主标题：让闲置资源**连接世界**（30px，黄色高亮）
- 英文副标题
- 分隔线（金色渐变）
- 特性描述文字（IPFS + P2P）
- 3 张特性卡（IPFS · Content Addressing / P2P · Distributed Transfer / Edge · Low Latency）

### 2.3 认证 Tab

```typescript
type AuthTab = "login" | "register" | "forgot"
```

### 2.4 登录表单

| 字段 | 类型 | 验证规则 |
|---|---|---|
| 邮箱 | text | 非空 |
| 密码 | password | 非空，≥6 位 |
| 记住登录（7天） | checkbox | — |

状态：`loginLoading`, `loginError`
成功后：`setState("merchant")` 进入商家版

### 2.5 注册表单

| 字段 | 类型 | 验证规则 |
|---|---|---|
| 邮箱 | text | 非空 |
| 密码 | password | ≥6 位 |
| 确认密码 | password | 必须与密码一致 |
| 邀请码 | text | 可选 |

状态：`regLoading`, `regError`

### 2.6 忘记密码

| 字段 | 类型 |
|---|---|
| 注册邮箱 | text |

流程：输入邮箱 → 发送验证码（模拟 1.5s）→ 提示"邮件已发送"

---

## 3. 首页（MerchantHome）

### 3.1 状态变量

| 变量 | 类型 | 初始值 | 说明 |
|---|---|---|---|
| slots | DeviceSlot\[\] | INIT_SLOTS | 4 个终端槽位数据 |
| extraUnlocked | boolean | false | 第 4 槽位是否解锁 |
| activateSlotIdx | number\|null | null | 当前打开激活弹窗的槽位 |
| cardCode | string | "" | 激活码输入内容 |
| hwid | string | "HWID-F9KX-3QMP-D1W7-NEW3" | 当前设备机器码（只读） |
| activating | "idle"\|"checking"\|"ok"\|"error" | "idle" | 激活流程状态 |
| activateMsg | string | "" | 激活校验提示信息 |
| checkedIn | boolean | false | 当天是否已签到 |
| checkinAccum | number | 0 | 待转入的签到积累奖励 |
| checkinConverted | number | 0 | 已转入余额的签到奖励 |
| rulesModal | boolean | false | 签到规则弹窗 |
| isVip | boolean | false | VIP 状态 |
| vipModal | boolean | false | VIP 购买弹窗 |
| selectedPlan | string | "quarter" | 选中的 VIP 套餐 |
| payStep | "select"\|"pay"\|"done" | "select" | VIP 购买步骤 |
| payMethod | "alipay"\|"wechat" | "alipay" | 支付方式 |

### 3.2 计算参数

| 参数 | 算法 |
|---|---|
| yunbiBalance | 128.40（固定演示值） |
| checkinLevel | yunbi ≥ 500 → 4；≥ 200 → 3；≥ 50 → 2；else 1 |
| checkinRate | Lv4=1.0%；Lv3=0.7%；Lv2=0.5%；Lv1=0.3% |
| checkinReward | yunbiBalance × checkinRate（示例：128.40 × 0.3% = 0.39 云币） |
| SLOT_MAX_ORDERS | 30（每槽位最大接单数） |

### 3.3 账号英雄卡

内容区域（深色渐变背景）：

| 字段 | 值/来源 |
|---|---|
| 账号邮箱 | us\*\*\*\*@example.com（脱敏） |
| 账号 ID | sb1920mg |
| 等级 | 黄金 |
| 已激活终端 | usedSlots / 3 |
| 当前接单 | 2 单 |
| 云币余额 | 128.40 |
| 积分余额 | 218,120 |
| 待结算积分 | 36,480 |
| 已结算积分 | 432,680 |
| 已转云币 | checkinConverted（动态） |

### 3.4 签到卡

签到规则（点击"规则"按钮弹出）：

| 连续天数 | 乘数 |
|---|---|
| 第 1 天 | ×1 |
| 第 2–3 天 | ×1.5 |
| 第 4–6 天 | ×2 |
| 第 7 天起 | ×3（持续保持） |

**签到前提：**
- 必须先将积分兑换为云币
- 云币未全部提现（提现后乘数归 ×0）
- 断签一天：乘数归零，重新从 ×1 累积

**签到奖励：** 签到专属积分（前缀 S-），**仅用于抵扣提现手续费**，不可兑换云币

操作按钮：
- **签到领奖**：`checkedIn=false` 时可点，点击后 checkinAccum += checkinReward；
- **转入云币**：checkinAccum > 0 时可点，yunbi += checkinAccum，checkinConverted += checkinAccum

### 3.5 VIP 套餐

```typescript
VIP_PLANS = [
  { key: "monthly",   label: "月度会员", price: 68,  period: "月", desc: "解锁全部任务类型 · 优先接单通道" },
  { key: "quarterly", label: "季度会员", price: 168, period: "季", desc: "省 ¥36 · 含自动接单功能", popular: true },
  { key: "yearly",    label: "年度会员", price: 588, period: "年", desc: "省 ¥228 · 含全部高级权益" },
]
```

VIP 权益列表：
1. 自动接单（多终端）
2. 任务优先分配
3. 解锁全部任务类型
4. 积分加成 +5%

支付方式：支付宝 / 微信支付

### 3.6 终端槽位管理

初始数据（INIT_SLOTS，4 条）：

| Slot | OS | HWID | 状态 | 积分/结算 | 到期 |
|---|---|---|---|---|---|
| 1 | Win11 Home | HWID-A7F3-2K9X | online | 36,480 / 432,680 | 2027-08-30 |
| 2 | Win10 Pro | HWID-B9K1-4RMP | online | 12,100 / 98,400 | 2027-07-15 |
| 3 | Win11 Pro | HWID-C2X7-8NQS | offline | 0 / 0 | 2027-06-20 |
| 4 | — | — | 未激活（锁定） | — | — |

**已激活槽位显示：**
- OS 名称 + HWID（后 8 位）
- 在线/离线状态徽章
- 接单进度条（接单数 / 30）
- 待结算积分
- 到期日期
- **续费** 按钮

**未激活槽位：**
- "激活绑定" 按钮 → 打开激活弹窗

**第 4 槽位解锁条件：**
- 前 3 槽位全部激活
- 消耗 80,000 积分

### 3.7 激活弹窗

| 字段 | 类型 | 说明 |
|---|---|---|
| 激活卡密 | text input | monospace 字体，placeholder 示例码 |
| 当前设备机器码 | readonly | HWID（自动读取） |

验证逻辑：
- 卡密长度 ≥ 8 字符
- 无效卡密返回提示："卡密无效或已被使用"
- 成功：到期日 = 激活日 + 365 天；状态设为 online

### 3.8 品牌条幅（Brand Strip Banner）

高度：48px；深色背景（#060d1f）+ 点阵 SVG + 金色径向渐变

右侧内容：
- "在线节点 8,420" 绿色徽章
- "星矩阵" 几何图标
- "1ms" 延迟标签
- "24/7" 在线标签

### 3.9 结算滚动栏

显示字段（每行）：
- 时间（YYYY-MM-DD HH:mm）
- 绿色圆点
- 终端名称 · 任务名称
- 每小时收益：**N 积分/h**（黄色）
- 本次结算积分（黄色，右对齐）

滚动动画：`ticker-slide`，22s 线性无限循环，悬停暂停

### 3.10 通知公告栏

显示最新 5 条，类型标签：活动（橙）/ 公告（蓝）/ 系统（灰）/ 规则（绿）

---

## 4. 订单中心（MerchantOrders）

### 4.1 状态变量

| 变量 | 类型 | 初始值 | 说明 |
|---|---|---|---|
| termIdx | number | 0 | 当前选中终端序号 |
| tab | OrderTab | "grab" | 当前 tab |
| allGrabbed | Set\<string\>[] | [Set,Set,Set] | 每个终端已抢订单 ID 集合 |
| search | string | "" | 搜索关键词 |
| acceptPage | number | 1 | 已接任务分页 |
| withdrawTask | AcceptedTask\|null | null | 当前提现任务 |
| withdrawStep | "confirm"\|"processing"\|"done" | "confirm" | 提现步骤 |
| pointsBalance | number | 218120 | 积分余额 |

### 4.2 终端数据（TERMINALS，3 条）

| 字段 | Terminal 1 | Terminal 2 | Terminal 3 |
|---|---|---|---|
| id | T001 | T002 | T003 |
| OS | Windows 11 Home | Windows 10 Pro | Windows 11 Pro |
| level | 老用户 | 中级 | 新手 |
| status | running | stopped | error |
| cpu | 34% | 0% | — |
| mem | 58% | 0% | — |
| uptime | 12天4小时 | — | — |

### 4.3 接单限制参数

| 等级 | 每日最大接单数 |
|---|---|
| LV1（新手） | 2 |
| LV2（中级） | 4 |
| LV3 | 6 |
| LV4 | 8 |
| … | +2/级 |
| 上限 | 30 |

### 4.4 Tab：抢单任务（grab）

**提现窗口判断（isWithdrawDay）：**
```typescript
const todayDay  = new Date().getDate()
const todayHour = new Date().getHours()
const isWithdrawDay = (todayDay === 1 || todayDay === 15) && todayHour >= 10 && todayHour < 15
```

**任务池字段（GRAB_POOL，~30 条）：**

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 17位数字订单号 |
| domain | string | 海外商家域名（接单后脱敏显示） |
| purpose | string | 英文专业术语（见下） |
| type | string | 自配单 / 高价单 / 限时单 / 平台补贴 |
| hours | number | 租赁时长（小时） |
| pts | number | 积分报酬 |
| refund | string | 延迟率（百分比） |
| slots | number | 可接槽位数 |
| tags | string[] | 热门 / 零延迟 / 高价 / 补贴 / 新手 |
| minLevel | number | 最低用户等级 |

**用途（purpose）枚举值：**

| 英文术语 | 说明 |
|---|---|
| IP Traffic Relay | IP 分流加速 |
| IPFS Storage Node | 分布式存储节点 |
| Traffic Forwarding Proxy | 流量转发代理 |
| P2P Relay Node | P2P 中继节点 |
| Bandwidth CDN Relay | 带宽共享中继 |
| Anonymous Proxy Node | 隐私代理节点 |
| Streaming Media Relay | 流媒体中继 |
| Ad Network Delivery | 广告投放 |

**表格列：**
订单编号 | 发布公司（脱敏域名）| 用途（含 Tags）| 租赁时长 | 积分报酬 | 延迟率 | 状态 | 操作

**操作按钮逻辑：**
- 未抢：显示"抢单"（绿色）
- 已抢：显示"已抢 ✓"（灰色不可点）
- 达到每日上限：提示已满

### 4.5 Tab：已接任务（accepted）

**结算窗口提示横幅（始终显示）：**
- 窗口内（绿色）：当前为结算窗口期，可点击【提现】申请积分结算。
- 窗口外（黄色）：**积分提现窗口：每月 1 日和 15 日 上午10:00 – 下午3:00**，其他时间提现按钮不可用。

**表格列：**

| 列 | 说明 |
|---|---|
| # | 行号（两位补零） |
| 订单编号 | 后 8 位 |
| 海外商家 | 脱敏域名 |
| 类型 | 自配单 / 高价单等 |
| 总时长 | 小时 |
| 已完成 | 小时 |
| 剩余 | 小时，完成显示"✓" |
| 待结算积分 | 数字，黄色 |
| 已结算积分 | 数字 + 提现按钮 |
| 延迟率 | % |
| 进度 | 进度条 + % |

**"提现"按钮启用条件：**
- `settled >= 100`（MIN_WITHDRAW）
- `isWithdrawDay === true`

分页：每页 10 条（ACCEPT_PAGE_SIZE = 10），支持首页/上页/数字/下页/末页

### 4.6 Tab：已完成任务（done）

**表格列：**
订单编号 | 海外商家 | 类型 | 时长 | 积分报酬 | 实际结算 | 延迟率 | 完成时间 | 状态（已结算）

### 4.7 积分提现弹窗（已接任务）

三步流程：confirm → processing → done

| 字段 | 内容 |
|---|---|
| 订单商家 | 脱敏域名 |
| 结算积分 | 任务 settled 值 |
| 当前余额 | pointsBalance |
| 结算后余额 | pointsBalance - settled |

- 最低提现：100 积分（MIN_WITHDRAW）
- 确认后：pointsBalance 减少，任务状态标记为已结算

---

## 5. 积分提现（MerchantPoints）

### 5.1 状态变量

| 变量 | 类型 | 初始值 | 说明 |
|---|---|---|---|
| pts | number | 218120 | 积分余额 |
| yunbi | number | 128.40 | 云币余额 |
| cards | ActivationCard[] | MY_CARDS（3条） | 激活卡列表 |
| history | HistoryEntry[] | 6条 | 操作历史 |
| exchModal | boolean | false | 积分兑云币弹窗 |
| ptsInput | string | "" | 兑换积分输入 |
| exchStep | "idle"\|"loading"\|"ok" | "idle" | 兑换状态 |
| buyModal | boolean | false | 购买激活卡弹窗 |
| buyMethod | "pts"\|"yunbi" | "pts" | 购卡支付方式 |
| buyQty | number | 1 | 购卡数量 |
| buyStep | "idle"\|"loading"\|"ok" | "idle" | 购卡状态 |
| walletNet | "BSC"\|"Tron" | "BSC" | 当前选中网络 |
| walletAddrBSC | string | "" | BSC 收款地址 |
| walletAddrTron | string | "" | Tron 收款地址 |
| walletModal | boolean | false | 绑定地址弹窗 |
| walletInput | string | "" | 地址输入内容 |
| walletStep | "form"\|"loading"\|"done" | "form" | 绑定步骤 |
| wdModal | boolean | false | 提现弹窗 |
| wdAmt | string | "" | 提现云币数量 |
| wdPayPwd | string | "" | 交易密码 |
| wdPayErr | boolean | false | 密码验证错误标志 |
| wdStep | "idle"\|"loading"\|"ok" | "idle" | 提现步骤 |
| listings | Listing[] | 1条 | 挂卖列表 |
| listModal | boolean | false | 挂卖弹窗 |
| listQty | string | "" | 挂卖云币数量 |
| listPrice | string | "0.95" | 挂卖单价（USDT） |
| listStep | "idle"\|"loading"\|"ok" | "idle" | 挂卖步骤 |
| ptsTxModal | boolean | false | 积分转账弹窗 |
| ptsTxTo | string | "" | 转账对象邮箱/ID |
| ptsTxAmt | string | "" | 转账积分数量 |
| ptsTxStep | "idle"\|"loading"\|"ok" | "idle" | 转账步骤 |
| revealId | string\|null | null | 当前展开卡密的卡 orderId |
| useCard | ActivationCard\|null | null | 当前使用弹窗的卡 |
| useStep | "form"\|"loading"\|"ok" | "form" | 使用步骤 |
| tab | "cards"\|"market"\|"history" | "cards" | 当前 tab |

### 5.2 关键参数

| 参数 | 值 | 说明 |
|---|---|---|
| CARD_PTS | 50,000 | 积分购激活卡单价 |
| CARD_YUNBI | 500 | 云币购激活卡单价 |
| FEE | 0.05（5%） | 平台提现手续费 |
| RATE | 1.0 | 云币兑 USDT 汇率（1:1） |
| chainFee（Tron） | 0.01（+1%） | Tron 链附加手续费 |
| chainFee（BSC） | 0（+0%） | BSC 链无附加 |
| 积分兑云币汇率 | 1,000 积分 = 1 云币 | |
| 最大购卡数量 | 10 张/次 | |
| 市场撮合费 | 3% | 挂卖成交收取 |
| 提现审核时效 | 24 小时内（节假日顺延） | 人工审核，非实时到账 |

### 5.3 英雄资产卡（3 列）

**第 1 列：积分**
- 余额数字（大字，JetBrains Mono）
- 按钮："转账" → ptsTxModal；"→ 兑云币" → exchModal

**第 2 列：云币**
- 余额数字
- 按钮："挂卖" → listModal；"提现" → wdModal（未绑定地址时跳转 walletModal）

**第 3 列：激活卡库存**
- 显示未使用卡数量
- 按钮："购买激活卡" → buyModal

### 5.4 积分兑换云币弹窗（exchModal）

| 字段 | 说明 |
|---|---|
| 余额展示 | 当前积分余额 |
| 数量输入 | number input，最低 1,000 |
| MAX 按钮 | 填入 `floor(pts / 1000) * 1000` |
| 预计获得 | `Number(ptsInput) / 1000`（保留 2 位） |
| 确认按钮 | 禁用条件：非 idle 状态 / 未输入 / < 1,000 |
| 成功后 | pts -= n；yunbi += n/1000；自动关闭弹窗（1800ms） |

### 5.5 购买激活卡弹窗（buyModal）

| 字段 | 说明 |
|---|---|
| 支付方式 | 积分支付（50,000/张）/ 云币支付（500/张） |
| 数量选择 | 步进器 1–10 |
| 合计费用 | qty × 单价 实时展示 |
| 余额检查 | pts >= qty×50000 或 yunbi >= qty×500 |
| 成功后 | 扣除对应余额，cards 列表新增对应数量未使用卡 |

### 5.6 绑定收款地址弹窗（walletModal）

支持同时绑定 BSC 和 Tron 两条链，各自独立：

| 网络 | 地址格式 | 手续费附加 |
|---|---|---|
| BSC (BEP-20) | 0x 开头 | 无（推荐） |
| Tron (TRC-20) | T 开头 | +1%（提现时额外收取） |

**绑定规则：**
- 绑定后**不可自行修改**，需联系客服
- 两条链地址相互独立，可各自绑定
- 页面同时展示两链绑定状态

### 5.7 申请提现弹窗（wdModal）

提现流程（非实时到账，人工审核）：

| 步骤 | 内容 |
|---|---|
| 1. 选择网络 | BSC（推荐）/ Tron（+1%手续费） |
| 2. 检查地址 | 当前网络已绑定才可继续，否则提示绑定 |
| 3. 输入金额 | 提现云币数量 + MAX 按钮 |
| 4. 费用明细 | 平台手续费 5% + Tron 附加 1% |
| 5. 预计到账 | `yunbi × (1 - totalFee) USDT` |
| 6. 人工审核提示 | "通常 24 小时内处理完成，节假日可能顺延" |
| 7. 交易密码 | 二次验证 |
| 8. 提交 | status 记录为"审核中" |

**费用计算：**
```
totalFee = 0.05（平台）+ chainFee（Tron=0.01，BSC=0）
到账 USDT = 提现云币数量 × RATE × (1 - totalFee)
```

### 5.8 云币挂卖弹窗（listModal）

| 字段 | 说明 |
|---|---|
| 前提 | 必须绑定至少一个收款地址 |
| 挂卖数量 | 云币数量 |
| 挂卖单价 | USDT/云币，默认 0.95 |
| 总额预览 | qty × price（USDT） |
| 撮合费 | 3%（成交后扣除） |

### 5.9 积分转账弹窗（ptsTxModal）

| 字段 | 说明 |
|---|---|
| 收款方 | 对方注册邮箱 / 账户 ID |
| 积分数量 | number input |
| 警告 | "转账不可撤回" |

> 注：按产品设计，转账仅允许向直属上级（邀请人账号）转账

### 5.10 激活卡（Tab：我的激活卡）

**ActivationCard 类型定义：**
```typescript
type CardStatus = "未使用" | "已绑定" | "已转让"
type ActivationCard = {
  orderId:      string       // 订单号
  code:         string       // 卡密（格式如 XXXXXX-XXXX-XXXX-XXXX）
  status:       CardStatus
  purchaseDate: string       // 购买日期 YYYY-MM-DD
  device?:      string       // 绑定设备 HWID（已绑定时）
  transferTo?:  string       // 转让对象（已转让时）
  expiry:       string       // 到期日期
}
```

**初始数据（MY_CARDS）：**

| orderId | 状态 | expiry |
|---|---|---|
| ORD-20260828-001 | 未使用 | 激活后1年 |
| ORD-20260715-002 | 已绑定 | 2027-07-15 |
| ORD-20260610-003 | 已转让 | — |

**操作逻辑：**

| 卡状态 | 显示操作 |
|---|---|
| 未使用 | "使用" 按钮（深色/金色）→ 获取卡密弹窗 |
| 已绑定 | "卡密" 按钮 → 展开显示卡密 + 复制按钮 + 已激活设备 HWID |
| 已转让 | "已转让" 徽章 + 转让对象邮箱（无操作按钮） |

**获取卡密弹窗（useCard modal）：**
- 步骤 1（form）：显示警告，"确认获取卡密" 按钮
- 步骤 2（ok）：显示卡密（居中大字，绿色背景），复制按钮，关闭按钮
- 获取后 card.status 变为 "已绑定"

### 5.11 历史记录（Tab：历史记录）

HistoryEntry 类型：
```typescript
{ date: string; type: string; detail: string; status: "完成"|"审核中"|"已取消" }
```

初始记录类型（6 条）：兑换 / 购买 / 提现 / 挂卖 / 转账

---

## 6. 积分抽奖（MerchantLottery）

### 6.1 状态变量

| 变量 | 类型 | 初始值 | 说明 |
|---|---|---|---|
| pool | number | 34820 | 当前奖池积分 |
| myEntry | number | 0 | 本用户已投入积分 |
| inputPts | string | "" | 自定义投入输入 |
| pts | number | 218120 | 用户积分余额 |
| entryStep | "idle"\|"loading"\|"ok" | "idle" | 投入状态 |
| drawn | boolean | false | 是否已开奖 |
| spinning | boolean | false | 是否正在转动动画 |

### 6.2 关键参数

| 参数 | 值 | 说明 |
|---|---|---|
| POOL_TARGET | 50,000 积分 | 奖池上限，满了自动开奖 |
| 奖品 | 1 张激活卡 | 价值 5,000 积分 / 50 云币 |
| 中奖率（实际） | 9% | 后台调整，对外显示 10% |
| 未中奖 | 积分不退回 | |
| 开奖方式 | 自动（满池触发） | 下一轮自动开始 |

### 6.3 投入方式

快速选择金额：500 / 1,000 / 2,000 / 5,000 / 10,000 / 20,000 积分

自定义金额：number input

**中奖概率预览：**
```
(myEntry + 新投入) / POOL_TARGET × 100%
```

### 6.4 最近参与记录（5 条静态数据）

| 用户（脱敏） | 积分 | 时间 |
|---|---|---|
| us\*\*\*\*@gmail.com | +12,000 | 13 分钟前 |
| to\*\*\*\*@yahoo.com | +5,000 | 27 分钟前 |
| sa\*\*\*\*@outlook.com | +8,800 | 41 分钟前 |
| li\*\*\*\*@gmail.com | +3,500 | 1 小时前 |
| ch\*\*\*\*@163.com | +6,200 | 2 小时前 |

### 6.5 活动规则（5 条）

1. 每轮奖池上限 50,000 积分，到达上限自动开奖，奖励 1 张激活卡
2. 用户可多次投入，中奖概率 = 个人投入 / 总奖池
3. 奖品直接发放至中奖账户，无需领取
4. 开奖后下一轮自动开始，落选积分不退回
5. 平台保留最终解释权

---

## 7. 会员中心（MerchantMember）

### 7.1 状态变量

| 变量 | 类型 | 初始值 | 说明 |
|---|---|---|---|
| queryCode | string | "" | 卡密查询输入 |
| queryResult | string\|null | null | 查询结果 |
| queryLoading | boolean | false | 查询加载中 |
| xfPhone | string | "" | 转账收款方 |
| xfAmt | string | "" | 转账金额 |
| xfAmt2 | string | "" | 确认金额（验证） |
| xfStep | "idle"\|"loading"\|"ok"\|"err" | "idle" | 转账状态 |
| oldPwd | string | "" | 旧登录密码 |
| newPwd | string | "" | 新登录密码 |
| oldPay | string | "" | 旧支付密码 |
| newPay | string | "" | 新支付密码 |
| pwdStep | "idle"\|"loading"\|"ok" | "idle" | 密码修改状态 |
| cardType | string | 标准终端授权卡 | 当前提卡类型 |
| cardQty | string | "1" | 提卡数量 |
| inventory | number | 3 | 卡密库存量 |
| pullLog | string[] | [] | 已提卡密日志 |
| pulling | boolean | false | 提卡中 |
| totalPulled | number | 0 | 累计已提卡数 |

### 7.2 卡密类型与价格

| 类型 | 价格（云币） |
|---|---|
| 标准终端授权卡 | 0（免费） |
| 高速节点授权卡 | 80 |
| 专业版授权卡 | 150 |

提卡数量选项：1 / 2 / 3 / 5 / 10

### 7.3 功能区块

**区块 1：卡密查询**

| 操作 | 费用 |
|---|---|
| 查卡密状态 | 免费 |
| 查卡密使用者账号 | 1 云币 |
| 查卡密使用者姓名 | 1 云币 |

> 仅支持本国查询（境内账号体系）

**区块 2：云币转账**

| 字段 | 说明 |
|---|---|
| 收款方邮箱/ID | 对方账户标识 |
| 金额（云币） | 数字输入 |
| 确认金额（云币） | 必须与上方一致 |
| 手续费 | 5 云币/笔 |

验证规则：两次金额必须完全一致，否则显示错误提示。

**区块 3：修改密码**

| 字段 | 类型 |
|---|---|
| 原登录密码 | password |
| 新登录密码 | password |
| 原支付密码 | password |
| 新支付密码 | password |

**区块 4：提卡服务（卡密全球通用）**

左侧：
- 库存显示（Inventory）
- 刷新库存按钮
- VIP 提卡细则按钮
- 卡类型下拉选择
- 数量下拉选择
- 确认提卡按钮
- VIP 等级 / 累计提卡数 / 更新按钮

右侧日志区：
- 已提卡密列表（时间戳 + 脱敏卡密）
- "卡密另存为"（复制到剪贴板）
- "打开提卡记录"

### 7.4 设备授权管理（MemberSettings 子组件）

**状态变量：**

| 变量 | 类型 | 初始值 |
|---|---|---|
| devices | BoundDevice[] | INIT_DEVICES（2条） |
| bindModal | boolean | false |
| newCode | string | "" |
| bindStep | "idle"\|"checking"\|"ok"\|"error" | "idle" |
| notifications | object | {order:true, complete:true, points:true, notice:false} |

**MAX_DEVICES = 3**（最多绑定 3 台设备）

**BoundDevice 类型：**
```typescript
{
  slot:    number         // 槽位序号
  code:    string         // 授权码
  device:  string         // 设备名称
  os:      string         // 操作系统
  boundAt: string         // 绑定日期
  expiry:  string         // 到期日期
  status:  "在线"|"离线"
}
```

**初始设备数据：**

| slot | device | OS | status | expiry |
|---|---|---|---|---|
| 1 | PC-WIN11-HOME | Windows 11 Home | 在线 | 2027-08-30 |
| 2 | PC-WIN10-PRO | Windows 10 Pro | 离线 | 2027-07-15 |

**操作规则：**
- 无解绑功能，设备绑定后按到期时间自动失效
- 未满 3 台可绑定新设备（输入授权码）
- 达到上限显示警告提示

**消息通知设置（4 项 Toggle）：**

| 设置项 | 默认值 |
|---|---|
| 接单成功通知 | 开 |
| 任务完成通知 | 开 |
| 积分到账通知 | 开 |
| 系统公告通知 | 关 |

### 7.5 账户安全（MemberSecurity 子组件）

**状态变量：**

| 变量 | 类型 | 初始值 |
|---|---|---|
| payPwdSet | boolean | false |
| ppModal | boolean | false |
| ppOld/ppNew/ppNew2 | string | "" |
| ppStep | "idle"\|"loading"\|"ok" | "idle" |

**安全信息展示行（4 行）：**

| 项目 | 状态 |
|---|---|
| 邮箱地址 | us\*\*\*\*@example.com（已验证） |
| 登录密码 | 已设置，最后修改：2026-08-01 |
| 交易密码 | 已设置/未设置 |
| 二步验证 | 未开启 |

---

## 8. 服务商节点（MerchantAccounts）

### 8.1 状态变量

| 变量 | 类型 | 初始值 | 说明 |
|---|---|---|---|
| isNode | boolean | true | 是否已激活服务商节点 |
| copied | "code"\|"url"\|null | null | 复制状态（2s 后重置） |
| applyModal | boolean | false | 申请弹窗 |
| applyStep | "form"\|"loading"\|"done" | "form" | 申请步骤 |
| detailUser | NodeReferral\|null | null | 查看详情的推荐用户 |

### 8.2 关键常量

| 常量 | 值 |
|---|---|
| MY_INVITE_CODE | NODE-SB1920 |
| MY_EMAIL | sb1920mg@example.com |
| INVITE_URL | https://app.example.com/register?ref=NODE-SB1920 |
| myTerminals | 3 |
| rewardRate | 10%（伞下消费积分奖励） |

### 8.3 未激活状态（isNode = false）

显示 3 张特性卡：
1. 专属邀请码（生成个人专属推广链接）
2. 推荐奖励（每推荐 1 人激活终端 → +500 积分）
3. 推广数据（实时查看推荐人数和收益）

"申请激活服务商节点" 按钮 → applyModal

**申请弹窗字段：**

| 字段 | 说明 |
|---|---|
| 联系方式（邮箱/电话） | 必填 |
| 推广渠道说明 | 选填 |

审核时效：1–3 个工作日

### 8.4 已激活状态（isNode = true）

**顶部数据磁贴（4 个）：**

| 磁贴 | 值/来源 |
|---|---|
| 当前账户激活终端 | 3 |
| 已推荐激活终端数 | sum(referral.activatedTerminals) |
| 节点收益率 | 10% |
| 已奖励积分 | sum(referral.rewardPts) |

**邀请码卡：**
- 邀请码展示（大字，JetBrains Mono）+ 复制按钮
- 邀请链接展示 + 复制按钮

### 8.5 推荐用户数据（NODE_REFERRALS，4 条）

**NodeReferral 类型：**
```typescript
{
  user:               string    // 脱敏邮箱
  joinDate:           string    // 加入日期
  activatedTerminals: number    // 已激活终端数
  cardsBought:        number    // 购买激活卡数
  spentYunbi:         number    // 花费云币
  spentPts:           number    // 花费积分
  rewardPts:          number    // 本节点已获奖励积分
  status:             "已激活"|"注册中"
  txHistory:          TxEntry[] // 交易历史
}
```

**推荐列表表格列：**
账户 | 已激活终端 | 已购买卡密 | 花费云币 | 花费积分 | 已奖励积分 | 状态 | 操作（详情）

**详情弹窗（per user）：**
- 顶部：用户邮箱 + 加入日期
- 摘要 5 项：已激活终端 / 已购卡密 / 花费云币 / 花费积分 / 已奖励积分
- 交易历史表格：时间 | 类型 | 详情 | 数量/金额 | 状态

---

## 9. 全局组件

### 9.1 在线客服（SupportChat）

**状态变量：**

| 变量 | 类型 | 初始值 |
|---|---|---|
| open | boolean | false |
| msgs | Message[] | 1条欢迎消息 |
| input | string | "" |
| ticketId | string | "TK-" + 随机6位 |

**位置：** fixed，bottom-right，zIndex 9000

**外观：**
- 关闭时：48px 圆形按钮（深色背景 + 金色图标），右上角绿色在线点
- 打开时：320px 宽面板，maxHeight 300px 消息区

**消息气泡：**
- 客服消息：左侧头像 + 浅色气泡
- 用户消息：右侧深色气泡

**自动回复（900ms 延迟）：**
"感谢您的反馈，客服人员将在工作时间内尽快回复您。工单编号：{ticketId}"

发送方式：Enter 键 / 发送按钮

### 9.2 通用组件

| 组件 | 说明 |
|---|---|
| ModalShell | 全屏遮罩（rgba 0,0,0,.55）+ 白色圆角内容区 |
| Card | 白色卡片，带 border-radius 和 border |
| Badge | 圆角颜色标签 |
| SectionTitle | 带左侧金色边框的标题行 |
| PrimaryBtn / Btn | 主按钮 / 次级按钮 |
| Field | 表单标签 + 输入组合 |

---

## 10. 参数速查表

### 10.1 积分相关参数

| 参数 | 数值 | 说明 |
|---|---|---|
| 积分兑云币汇率 | 1,000 积分 = 1 云币 | 固定比率 |
| 积分最低兑换 | 1,000 积分 | 单次最低 |
| 积分购激活卡单价 | 50,000 积分/张 | |
| 积分最低提现门槛 | 100 积分 | 每笔结算 |
| 抽奖奖池上限 | 50,000 积分 | 满额自动开奖 |
| 中奖率（实际） | 9% | 对外显示 10% |

### 10.2 云币相关参数

| 参数 | 数值 | 说明 |
|---|---|---|
| 云币购激活卡单价 | 500 云币/张 | |
| 云币兑 USDT 汇率 | 1:1 | |
| 平台提现手续费 | 5% | 所有链通用 |
| Tron 链附加手续费 | +1% | 鼓励用户使用 BSC |
| 挂卖撮合费 | 3% | 成交后扣除 |
| 云币转账手续费 | 5 云币/笔 | |
| 提现审核时效 | 24 小时内 | 人工审核，节假日顺延 |

### 10.3 终端设备参数

| 参数 | 数值 | 说明 |
|---|---|---|
| 默认最大终端数 | 3 台/账号 | |
| 第 4 槽位解锁费用 | 80,000 积分 | 前 3 台全激活后可解锁 |
| 每槽位最大接单数 | 30 单 | SLOT_MAX_ORDERS |
| 激活卡有效期 | 1 年 | 激活日起计 |
| 设备绑定后 | 不可解绑 | 按到期时间自动失效 |

### 10.4 签到参数

| 参数 | 数值 | 说明 |
|---|---|---|
| 基础签到比率 Lv1 | 0.3% | yunbi < 50 |
| 基础签到比率 Lv2 | 0.5% | 50 ≤ yunbi < 200 |
| 基础签到比率 Lv3 | 0.7% | 200 ≤ yunbi < 500 |
| 基础签到比率 Lv4 | 1.0% | yunbi ≥ 500 |
| 连续签到 Day 1 乘数 | ×1 | |
| 连续签到 Day 2-3 乘数 | ×1.5 | |
| 连续签到 Day 4-6 乘数 | ×2 | |
| 连续签到 Day 7+ 乘数 | ×3 | 满 7 天后持续保持 |
| 断签惩罚 | 乘数归 ×1 | 重新累积 |
| 全部提现后 | 乘数 ×0 | 无效签到 |
| 签到奖励积分类型 | S- 前缀专属积分 | 仅用于抵扣提现手续费 |

### 10.5 提现时间窗口

| 参数 | 值 |
|---|---|
| 提现日期 | 每月 1 日、15 日 |
| 提现时间段 | 上午 10:00 – 下午 15:00 |
| 其他时间 | 提现按钮不可用 |

### 10.6 接单限制

| 等级 | 每日接单上限 |
|---|---|
| LV1 新手 | 2 |
| LV2 中级 | 4 |
| LV3 | 6 |
| LV4 | 8 |
| LV5+ | 每级 +2，最大 30 |

### 10.7 服务商节点参数

| 参数 | 数值 | 说明 |
|---|---|---|
| 节点佣金率 | 10% | 伞下用户消费积分奖励 |
| 单个推荐激活奖励 | 500 积分 | 每推荐 1 人激活终端 |
| 申请审核时效 | 1–3 个工作日 | |

### 10.8 VIP 套餐

| 套餐 | 价格 | 周期 |
|---|---|---|
| 月度 | ¥68 | 月 |
| 季度（推荐） | ¥168 | 季（省 ¥36） |
| 年度 | ¥588 | 年（省 ¥228） |

VIP 权益：自动接单 / 任务优先分配 / 解锁全部任务类型 / 积分加成 +5%

---

*文档结束 — StarMatrix 商家版 v3.2.1*
