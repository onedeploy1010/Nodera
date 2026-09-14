import { useState, useRef, useEffect, Fragment } from "react";
import Frame3 from "@/imports/Frame3/index";

/* ── Brand logo — pure SVG mark + wordmark ── */
function Logo({ size = "md", dark = true }: { size?: "sm" | "md" | "lg"; dark?: boolean }) {
  const scales = { sm: 0.92, md: 1.28, lg: 1.65 };
  const s = scales[size];
  const markH = Math.round(22 * s);
  const wordColor = dark ? "#ffffff" : "#0a0f1e";
  const subColor = dark ? "rgba(255,255,255,0.38)" : "rgba(10,15,30,0.45)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: Math.round(9 * s) }}>
      {/* Geometric mark: two interlocked hexagonal arcs suggesting a node mesh */}
      <svg width={markH} height={markH} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* outer ring */}
        <circle cx="11" cy="11" r="9.5" stroke="#6C8EFF" strokeWidth="1.4" strokeOpacity="0.55"/>
        {/* inner hex */}
        <polygon points="11,3.5 17.5,7.25 17.5,14.75 11,18.5 4.5,14.75 4.5,7.25" stroke="#6C8EFF" strokeWidth="1.1" fill="none" strokeOpacity="0.8"/>
        {/* center node */}
        <circle cx="11" cy="11" r="2.2" fill="#6C8EFF"/>
        {/* accent dot top-right */}
        <circle cx="17.5" cy="7.25" r="1.1" fill="#A5BFFF"/>
        {/* accent dot bottom */}
        <circle cx="11" cy="18.5" r="1.1" fill="#A5BFFF"/>
        {/* accent dot left */}
        <circle cx="4.5" cy="14.75" r="1.1" fill="#A5BFFF"/>
      </svg>
      {/* Wordmark */}
      <div style={{ lineHeight: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        <span style={{
          fontFamily: F.en,
          fontWeight: 700,
          fontSize: Math.round(13 * s),
          letterSpacing: 0.2,
          color: wordColor,
        }}>StarMatrix</span>
        {size !== "sm" && (
          <span style={{
            fontFamily: F.en,
            fontWeight: 400,
            fontSize: Math.round(8.5 * s),
            letterSpacing: 1.8,
            textTransform: "uppercase" as const,
            color: subColor,
          }}>Node Network</span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TYPES & DATA
══════════════════════════════════════════════════════════════ */

type MerchantPage = "home" | "orders" | "member" | "accounts" | "cards" | "node";
type OrderTab = "grab" | "accepted" | "done";
type MemberTab = "settings" | "support" | "docs";

/* ── domain masking helper — strips TLD, masks middle chars ── */
function maskDomain(domain: string) {
  // Already masked (no TLD dot) — return as-is
  if (!domain.includes(".")) return domain;
  const name = domain.slice(0, domain.lastIndexOf("."));
  if (name.length <= 3) return name[0] + "**";
  return name.slice(0, 2) + "*".repeat(name.length - 3) + name.slice(-1);
}

type GrabTask = { id: string; domain: string; purpose: string; type: string; hours: number; pts: number; refund: string; slots: number; tags: string[]; minLevel: number };
type PowerStatus = "online" | "offline" | "poweroff";
type AcceptedTask = { id: string; domain: string; type: string; hours: number; pts: number; refund: string; done: number; pending: number; remaining: number; progress: number; settled: number; withdrawnPts: number; powerStatus: PowerStatus; deductPts: number };
type DoneTask = { id: string; domain: string; type: string; hours: number; pts: number; done: number; settled: number; completedAt: string; refund: string; withdrawn: boolean; powerStatus: PowerStatus; deductPts: number };

/* 200-task pool from imported data */
const TASK_POOL: GrabTask[] = [
  { id: "20261780765001", domain: "cl***a", purpose: "边缘缓存节点", type: "平台补贴", hours: 72, pts: 1462, refund: "1%", slots: 8, tags: ["补贴"], minLevel: 1 },
  { id: "20261780765002", domain: "fa**h", purpose: "P2P Relay Node", type: "平台补贴", hours: 48, pts: 1215, refund: "2%", slots: 8, tags: ["补贴"], minLevel: 1 },
  { id: "20261780765003", domain: "ak******o", purpose: "P2P Relay Node", type: "平台补贴", hours: 48, pts: 1436, refund: "1%", slots: 8, tags: ["补贴"], minLevel: 1 },
  { id: "20261780765004", domain: "am*******v", purpose: "内容分发(CDN)", type: "高价单", hours: 72, pts: 1474, refund: "1%", slots: 3, tags: ["高价"], minLevel: 1 },
  { id: "20261780765005", domain: "te*****c", purpose: "IP Traffic Relay", type: "自配单", hours: 48, pts: 1255, refund: "0%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765006", domain: "sh*******j", purpose: "Streaming Media Relay", type: "高价单", hours: 48, pts: 1062, refund: "2%", slots: 3, tags: ["高价"], minLevel: 1 },
  { id: "20261780765007", domain: "al******q", purpose: "边缘缓存节点", type: "平台补贴", hours: 72, pts: 1159, refund: "3%", slots: 8, tags: ["补贴"], minLevel: 1 },
  { id: "20261780765008", domain: "eb******x", purpose: "IPFS Storage Node", type: "自配单", hours: 48, pts: 1444, refund: "1%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765009", domain: "ra*******e", purpose: "边缘计算节点", type: "自配单", hours: 60, pts: 1299, refund: "0%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765010", domain: "la*****l", purpose: "Traffic Forwarding Proxy", type: "限时单", hours: 96, pts: 1178, refund: "5%", slots: 5, tags: ["限时"], minLevel: 1 },
  { id: "20261780765011", domain: "ne***s", purpose: "Streaming Media Relay", type: "高价单", hours: 48, pts: 1023, refund: "7%", slots: 3, tags: ["高价"], minLevel: 1 },
  { id: "20261780765012", domain: "be*****z", purpose: "Traffic Forwarding Proxy", type: "限时单", hours: 96, pts: 1454, refund: "0%", slots: 5, tags: ["限时"], minLevel: 1 },
  { id: "20261780765013", domain: "ch*******g", purpose: "Streaming Media Relay", type: "高价单", hours: 24, pts: 1173, refund: "0%", slots: 3, tags: ["高价"], minLevel: 1 },
  { id: "20261780765014", domain: "ma*******n", purpose: "Anonymous Proxy Node", type: "限时单", hours: 36, pts: 1179, refund: "0%", slots: 5, tags: ["限时"], minLevel: 1 },
  { id: "20261780765015", domain: "wi****u", purpose: "IP Traffic Relay", type: "自配单", hours: 72, pts: 1065, refund: "2%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765016", domain: "za**b", purpose: "内容分发(CDN)", type: "高价单", hours: 60, pts: 1461, refund: "3%", slots: 3, tags: ["高价"], minLevel: 1 },
  { id: "20261780765017", domain: "g******i", purpose: "Traffic Forwarding Proxy", type: "限时单", hours: 96, pts: 1375, refund: "2%", slots: 5, tags: ["限时"], minLevel: 1 },
  { id: "20261780765018", domain: "h**p", purpose: "边缘计算节点", type: "自配单", hours: 24, pts: 1369, refund: "9%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765019", domain: "or**w", purpose: "边缘计算节点", type: "自配单", hours: 36, pts: 1051, refund: "8%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765020", domain: "px******d", purpose: "Bandwidth CDN Relay", type: "自配单", hours: 48, pts: 1289, refund: "10%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765021", domain: "cl**k", purpose: "边缘缓存节点", type: "平台补贴", hours: 72, pts: 1067, refund: "0%", slots: 8, tags: ["补贴"], minLevel: 1 },
  { id: "20261780765022", domain: "fa**r", purpose: "Bandwidth CDN Relay", type: "自配单", hours: 96, pts: 1192, refund: "5%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765023", domain: "ak****y", purpose: "IPFS Storage Node", type: "自配单", hours: 72, pts: 1248, refund: "0%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765024", domain: "am**f", purpose: "Traffic Forwarding Proxy", type: "限时单", hours: 24, pts: 1138, refund: "0%", slots: 5, tags: ["限时"], minLevel: 1 },
  { id: "20261780765025", domain: "te*******m", purpose: "边缘计算节点", type: "自配单", hours: 36, pts: 1302, refund: "0%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765026", domain: "sh**t", purpose: "边缘计算节点", type: "自配单", hours: 36, pts: 1094, refund: "0%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765027", domain: "al*****a", purpose: "Anonymous Proxy Node", type: "限时单", hours: 24, pts: 1231, refund: "9%", slots: 5, tags: ["限时"], minLevel: 1 },
  { id: "20261780765028", domain: "eb******h", purpose: "IPFS Storage Node", type: "自配单", hours: 60, pts: 1472, refund: "0%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765029", domain: "ra******o", purpose: "内容分发(CDN)", type: "高价单", hours: 72, pts: 1388, refund: "5%", slots: 3, tags: ["高价"], minLevel: 1 },
  { id: "20261780765030", domain: "la*******v", purpose: "IP Traffic Relay", type: "自配单", hours: 48, pts: 1493, refund: "8%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765031", domain: "ne******c", purpose: "边缘计算节点", type: "自配单", hours: 48, pts: 1282, refund: "8%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765032", domain: "be******j", purpose: "Bandwidth CDN Relay", type: "自配单", hours: 24, pts: 1354, refund: "1%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765033", domain: "ch***q", purpose: "IPFS Storage Node", type: "自配单", hours: 24, pts: 1311, refund: "6%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765034", domain: "ma*****x", purpose: "边缘计算节点", type: "自配单", hours: 48, pts: 1429, refund: "5%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765035", domain: "wi****e", purpose: "Anonymous Proxy Node", type: "限时单", hours: 48, pts: 1080, refund: "0%", slots: 5, tags: ["限时"], minLevel: 1 },
  { id: "20261780765036", domain: "za******l", purpose: "P2P Relay Node", type: "平台补贴", hours: 72, pts: 1281, refund: "3%", slots: 8, tags: ["补贴"], minLevel: 1 },
  { id: "20261780765037", domain: "g***s", purpose: "内容分发(CDN)", type: "高价单", hours: 72, pts: 1490, refund: "0%", slots: 3, tags: ["高价"], minLevel: 1 },
  { id: "20261780765038", domain: "h**z", purpose: "IP Traffic Relay", type: "自配单", hours: 48, pts: 1220, refund: "0%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765039", domain: "or****g", purpose: "Bandwidth CDN Relay", type: "自配单", hours: 60, pts: 1082, refund: "10%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765040", domain: "px*****n", purpose: "IP Traffic Relay", type: "自配单", hours: 96, pts: 1130, refund: "8%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765041", domain: "cl****u", purpose: "内容分发(CDN)", type: "高价单", hours: 48, pts: 1356, refund: "1%", slots: 3, tags: ["高价"], minLevel: 1 },
  { id: "20261780765042", domain: "fa****b", purpose: "边缘计算节点", type: "自配单", hours: 48, pts: 1294, refund: "3%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765043", domain: "ak***i", purpose: "IP Traffic Relay", type: "自配单", hours: 96, pts: 1461, refund: "1%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765044", domain: "am****p", purpose: "Streaming Media Relay", type: "高价单", hours: 72, pts: 1220, refund: "1%", slots: 3, tags: ["高价"], minLevel: 1 },
  { id: "20261780765045", domain: "te******w", purpose: "边缘计算节点", type: "自配单", hours: 36, pts: 1341, refund: "10%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765046", domain: "sh******d", purpose: "内容分发(CDN)", type: "高价单", hours: 72, pts: 1477, refund: "9%", slots: 3, tags: ["高价"], minLevel: 1 },
  { id: "20261780765047", domain: "al******k", purpose: "Streaming Media Relay", type: "高价单", hours: 72, pts: 1073, refund: "0%", slots: 3, tags: ["高价"], minLevel: 1 },
  { id: "20261780765048", domain: "eb*****r", purpose: "Traffic Forwarding Proxy", type: "限时单", hours: 48, pts: 1228, refund: "2%", slots: 5, tags: ["限时"], minLevel: 1 },
  { id: "20261780765049", domain: "ra*****y", purpose: "边缘计算节点", type: "自配单", hours: 24, pts: 1194, refund: "5%", slots: 6, tags: [], minLevel: 1 },
  { id: "20261780765050", domain: "la****f", purpose: "边缘计算节点", type: "自配单", hours: 36, pts: 1234, refund: "0%", slots: 6, tags: [], minLevel: 1 },
];


/* Accepted tasks from imported data */
const ALL_ACCEPTED: AcceptedTask[] = [
  { id: "81764000", domain: "ne*******m", type: "高价单", hours: 36, pts: 1022, refund: "1%", done: 30, pending: 19.75, remaining: 6, progress: 84, settled: 19.75, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764003", domain: "be****t", type: "限时单", hours: 72, pts: 1439, refund: "4%", done: 57, pending: 47.09, remaining: 15, progress: 80, settled: 47.09, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764008", domain: "ch*****a", type: "平台补贴", hours: 36, pts: 1474, refund: "0%", done: 33, pending: 32.07, remaining: 3, progress: 92, settled: 32.07, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764009", domain: "ma**h", type: "平台补贴", hours: 36, pts: 1133, refund: "3%", done: 23, pending: 11.9, remaining: 13, progress: 66, settled: 11.9, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764014", domain: "wi****o", type: "自配单", hours: 48, pts: 1206, refund: "7%", done: 38, pending: 33.06, remaining: 10, progress: 81, settled: 33.06, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764016", domain: "za*******v", type: "平台补贴", hours: 96, pts: 1053, refund: "3%", done: 36, pending: 32.69, remaining: 60, progress: 38, settled: 32.69, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764018", domain: "g***c", type: "限时单", hours: 60, pts: 1449, refund: "2%", done: 40, pending: 39.28, remaining: 20, progress: 67, settled: 39.28, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764021", domain: "h**j", type: "自配单", hours: 48, pts: 1033, refund: "0%", done: 20, pending: 18.44, remaining: 28, progress: 43, settled: 18.44, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764024", domain: "or**q", type: "自配单", hours: 36, pts: 1120, refund: "0%", done: 14, pending: 21.77, remaining: 22, progress: 41, settled: 21.77, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764027", domain: "px*****x", type: "自配单", hours: 24, pts: 1025, refund: "5%", done: 20, pending: 17.14, remaining: 4, progress: 84, settled: 17.14, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764031", domain: "cl****e", type: "限时单", hours: 36, pts: 1115, refund: "4%", done: 30, pending: 26.57, remaining: 6, progress: 85, settled: 26.57, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764034", domain: "fa*******l", type: "平台补贴", hours: 72, pts: 1457, refund: "3%", done: 25, pending: 19.5, remaining: 47, progress: 35, settled: 19.5, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764036", domain: "ak******s", type: "自配单", hours: 72, pts: 1279, refund: "3%", done: 12, pending: 15.58, remaining: 60, progress: 17, settled: 15.58, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764041", domain: "am****z", type: "自配单", hours: 36, pts: 1191, refund: "0%", done: 27, pending: 18.81, remaining: 9, progress: 78, settled: 18.81, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764042", domain: "te*****g", type: "限时单", hours: 96, pts: 1010, refund: "0%", done: 58, pending: 35, remaining: 38, progress: 61, settled: 35, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764046", domain: "sh**n", type: "自配单", hours: 48, pts: 1063, refund: "1%", done: 29, pending: 28.46, remaining: 19, progress: 61, settled: 28.46, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764049", domain: "al****u", type: "限时单", hours: 96, pts: 1058, refund: "3%", done: 46, pending: 34.96, remaining: 50, progress: 48, settled: 34.96, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764051", domain: "eb*****b", type: "自配单", hours: 60, pts: 1309, refund: "3%", done: 32, pending: 17.84, remaining: 28, progress: 54, settled: 17.84, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764054", domain: "ra***i", type: "自配单", hours: 72, pts: 1331, refund: "2%", done: 19, pending: 18.06, remaining: 53, progress: 26, settled: 18.06, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764059", domain: "la*****p", type: "高价单", hours: 36, pts: 1419, refund: "0%", done: 10, pending: 22.64, remaining: 26, progress: 28, settled: 22.64, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764060", domain: "ne***w", type: "自配单", hours: 24, pts: 1356, refund: "1%", done: 21, pending: 16.23, remaining: 3, progress: 88, settled: 16.23, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764065", domain: "be*****d", type: "限时单", hours: 36, pts: 1005, refund: "0%", done: 12, pending: 13.66, remaining: 24, progress: 35, settled: 13.66, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764066", domain: "ch***k", type: "自配单", hours: 24, pts: 1398, refund: "5%", done: 19, pending: 16.62, remaining: 5, progress: 82, settled: 16.62, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764070", domain: "ma**r", type: "自配单", hours: 36, pts: 1360, refund: "9%", done: 26, pending: 18.53, remaining: 10, progress: 73, settled: 18.53, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764074", domain: "wi******y", type: "自配单", hours: 96, pts: 1364, refund: "6%", done: 32, pending: 16.24, remaining: 64, progress: 34, settled: 16.24, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764075", domain: "za*****f", type: "高价单", hours: 48, pts: 1272, refund: "0%", done: 39, pending: 31.79, remaining: 9, progress: 82, settled: 31.79, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764079", domain: "g******m", type: "限时单", hours: 72, pts: 1087, refund: "0%", done: 45, pending: 44.77, remaining: 27, progress: 63, settled: 44.77, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764083", domain: "h*******t", type: "自配单", hours: 48, pts: 1327, refund: "2%", done: 20, pending: 23.91, remaining: 28, progress: 42, settled: 23.91, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764084", domain: "or*****a", type: "平台补贴", hours: 72, pts: 1444, refund: "9%", done: 61, pending: 38.55, remaining: 11, progress: 85, settled: 38.55, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
  { id: "81764088", domain: "px******h", type: "自配单", hours: 24, pts: 1052, refund: "0%", done: 6, pending: 20.17, remaining: 18, progress: 27, settled: 20.17, withdrawnPts: 0, powerStatus: "online", deductPts: 0 },
];

const TERMINAL_ACCEPTED: AcceptedTask[][] = [
  ALL_ACCEPTED,
  ALL_ACCEPTED.slice(0, 15),
  ALL_ACCEPTED.slice(0, 8),
];

const TERMINAL_DONE: DoneTask[][] = [
  [
    { id: "70765000", domain: "ne******g", type: "平台补贴", hours: 60, done: 60, pts: 1032, settled: 58.78, completedAt: "2026-09-07", refund: "0%", withdrawn: false, powerStatus: "online", deductPts: 0 },
    { id: "70765007", domain: "be*******n", type: "自配单", hours: 96, done: 96, pts: 1470, settled: 68.78, completedAt: "2026-09-12", refund: "0%", withdrawn: false, powerStatus: "online", deductPts: 0 },
    { id: "70765017", domain: "ch**u", type: "高价单", hours: 60, done: 60, pts: 1143, settled: 52.16, completedAt: "2026-09-11", refund: "9%", withdrawn: false, powerStatus: "online", deductPts: 0 },
    { id: "70765022", domain: "ma*****b", type: "高价单", hours: 60, done: 60, pts: 1193, settled: 50.91, completedAt: "2026-09-05", refund: "7%", withdrawn: false, powerStatus: "online", deductPts: 0 },
    { id: "70765029", domain: "wi******i", type: "自配单", hours: 24, done: 24, pts: 1213, settled: 24.16, completedAt: "2026-09-05", refund: "4%", withdrawn: false, powerStatus: "online", deductPts: 0 },
    { id: "70765039", domain: "za*****p", type: "平台补贴", hours: 96, done: 96, pts: 1346, settled: 89.69, completedAt: "2026-09-06", refund: "10%", withdrawn: false, powerStatus: "online", deductPts: 0 },
    { id: "70765042", domain: "g*****w", type: "限时单", hours: 36, done: 36, pts: 1394, settled: 23.74, completedAt: "2026-09-06", refund: "1%", withdrawn: false, powerStatus: "online", deductPts: 0 },
    { id: "70765049", domain: "h*******d", type: "限时单", hours: 36, done: 36, pts: 1291, settled: 28.97, completedAt: "2026-09-09", refund: "3%", withdrawn: false, powerStatus: "online", deductPts: 0 },
  ],
  [],
  [],
];

const REDEEM_HISTORY = [
  { date: "2026-08-20", pts: 50000, amount: "¥500.00", method: "支付宝", status: "已到账" },
  { date: "2026-08-15", pts: 30000, amount: "¥300.00", method: "微信", status: "已到账" },
  { date: "2026-08-08", pts: 80000, amount: "¥800.00", method: "支付宝", status: "已到账" },
  { date: "2026-07-28", pts: 20000, amount: "¥200.00", method: "银行卡", status: "审核中" },
];

const BOUND_ACCOUNTS = [
  { id: "A001", name: "sb1920mg", device: "PC-WIN11-HOME", status: "在线", tasks: 2, pts: 218120, progress: 72, expiry: "2027-08-30", vip: "黄金" },
  { id: "A002", name: "sb3851fg", device: "PC-WIN10-PRO", status: "在线", tasks: 2, pts: 84230, progress: 49, expiry: "2027-06-15", vip: "白银" },
  { id: "A003", name: "trader_007", device: "PC-WIN11-PRO2", status: "离线", tasks: 0, pts: 12400, progress: 0, expiry: "2026-12-01", vip: "普通" },
];

/* ═══════════════════════════════════════════════════════════
   SHARED PRIMITIVES
══════════════════════════════════════════════════════════════ */

const C = {
  yellow: "#FFD700", darkYellow: "#E6BC00", orange: "#FF8C00",
  red: "#E53935", green: "#43A047", blue: "#1976D2",
  dark: "#1C1C2E", darkMid: "#252540", border: "#E0E0E0",
  bg: "#F4F5F7", card: "#FFFFFF", text: "#1C1C2E", muted: "#757575",
  adminBg: "#0F172A", adminSidebar: "#1E293B", adminCard: "#1E293B",
};

/* Font stacks — use these everywhere for consistency */
const F = {
  cn: "'Noto Sans SC','Microsoft YaHei',sans-serif",
  en: "'Inter','Segoe UI',system-ui,sans-serif",
  mono: "'JetBrains Mono','Fira Mono',monospace",
};

function Badge({ children, color = C.blue }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ background: color + "22", color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, border: `1px solid ${color}44`, fontFamily: F.en, letterSpacing: 0.2 }}>
      {children}
    </span>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: C.card, borderRadius: 10, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,.08)", border: `1px solid ${C.border}`, ...style }}>{children}</div>;
}

function StatCard({ label, value, sub, accent, icon }: { label: string; value: string; sub?: string; accent: string; icon: string }) {
  return (
    <Card style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 5, fontFamily: F.cn, letterSpacing: 0.2 }}>{label}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: accent, fontFamily: F.mono, letterSpacing: -0.5, fontVariantNumeric: "tabular-nums" }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontFamily: F.cn }}>{sub}</div>}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: accent + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
      </div>
    </Card>
  );
}

function PrimaryBtn({ children, onClick, style, small }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties; small?: boolean }) {
  return (
    <button onClick={onClick} style={{ background: C.yellow, border: "none", borderRadius: 6, padding: small ? "5px 14px" : "9px 20px", fontWeight: 700, fontSize: small ? 12 : 14, color: C.dark, cursor: "pointer", fontFamily: F.cn, letterSpacing: 0.3, ...style }}>
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, small }: { children: React.ReactNode; onClick?: () => void; small?: boolean }) {
  return (
    <button onClick={onClick} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: small ? "4px 12px" : "8px 18px", fontWeight: 600, fontSize: small ? 12 : 13, color: C.text, cursor: "pointer", fontFamily: F.cn, letterSpacing: 0.2 }}>
      {children}
    </button>
  );
}

function ProgressBar({ value, color = C.yellow }: { value: number; color?: string }) {
  return (
    <div style={{ height: 6, borderRadius: 99, background: "#E0E0E0", overflow: "hidden", flex: 1 }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 99, transition: "width .3s" }} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${C.yellow}`, display: "inline-block", fontFamily: F.cn, letterSpacing: 0.3 }}>
      {children}
    </div>
  );
}

/* Inline number span — JetBrains Mono, tabular */
function Num({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span style={{ fontFamily: F.mono, fontVariantNumeric: "tabular-nums", letterSpacing: -0.3, ...style }}>
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOGIN  (email + password, with register tab)
══════════════════════════════════════════════════════════════ */

type AuthTab = "login" | "register";

function LoginScreen({ onEnter }: { onEnter: () => void }) {
  const [tab, setTab] = useState<AuthTab>("login");
  const [step, setStep] = useState<"idle" | "loading" | "ok">("idle");

  /* login fields */
  const [email, setEmail] = useState("user@example.com");
  const [pwd, setPwd] = useState("••••••••");
  const [remember, setRemember] = useState(true);

  /* register fields */
  const [regEmail, setRegEmail] = useState("");
  const [regPwd, setRegPwd] = useState("");
  const [regPwd2, setRegPwd2] = useState("");
  const [regCode, setRegCode] = useState("");
  const [regCodeSent, setRegCodeSent] = useState(false);
  const [regCountdown, setRegCountdown] = useState(0);
  const [regRef, setRegRef]   = useState("");
  const [refErr, setRefErr]   = useState(false);

  const sendRegCode = () => {
    if (!regEmail) return;
    setRegCodeSent(true);
    setRegCountdown(60);
    const t = setInterval(() => setRegCountdown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
  };

  /* forgot-password modal */
  const [fpModal,   setFpModal]   = useState(false);
  const [fpEmail,   setFpEmail]   = useState("");
  const [fpCode,    setFpCode]    = useState("");
  const [fpNewPwd,  setFpNewPwd]  = useState("");
  const [fpNewPwd2, setFpNewPwd2] = useState("");
  const [fpStep,    setFpStep]    = useState<"email"|"otp"|"reset"|"done">("email");
  const [fpCd,      setFpCd]      = useState(0);

  const fpSendOtp = () => {
    if (!fpEmail) return;
    setFpCd(60);
    const t = setInterval(() => setFpCd(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
    setTimeout(() => setFpStep("otp"), 400);
  };
  const fpVerifyOtp = () => { if (fpCode.length === 6) setFpStep("reset"); };
  const fpReset = () => {
    if (!fpNewPwd || fpNewPwd !== fpNewPwd2) return;
    setFpStep("done");
    setTimeout(() => { setFpModal(false); setFpStep("email"); setFpEmail(""); setFpCode(""); setFpNewPwd(""); setFpNewPwd2(""); }, 2000);
  };

  const submit = () => {
    if (tab === "register" && !regRef.trim()) { setRefErr(true); return; }
    if (tab === "register" && !regCodeSent) return;
    setRefErr(false);
    setStep("loading");
    setTimeout(() => { setStep("ok"); setTimeout(() => onEnter(), 800); }, 1300);
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", fontFamily: F.cn }}>

      {/* ── Left branding panel ── */}
      <div style={{ width: "46%", background: "#0a0f1e", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

        {/* ── Silver dot-grid background ── */}
        <svg viewBox="0 0 460 700" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="panelFade" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#0a0f1e" stopOpacity="0"/>
              <stop offset="100%" stopColor="#0a0f1e" stopOpacity="0.82"/>
            </radialGradient>
            <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0.12"/>
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* dot grid — 24px spacing, silver */}
          {Array.from({ length: 20 }, (_, col) =>
            Array.from({ length: 30 }, (_, row) => {
              const x = col * 24 + 8;
              const y = row * 24 + 8;
              const cx = 230, cy = 350;
              const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
              const op = Math.max(0.06, 0.32 - dist / 820);
              const r = dist < 60 ? 1.8 : dist < 140 ? 1.4 : 1.0;
              return <circle key={`${col}-${row}`} cx={x} cy={y} r={r} fill="#C0C8D8" fillOpacity={op}/>;
            })
          )}

          {/* soft gold ambient glow in center */}
          <ellipse cx="230" cy="340" rx="160" ry="160" fill="url(#goldGlow)"/>

          {/* vignette to darken edges so text stays readable */}
          <rect x="0" y="0" width="460" height="700" fill="url(#panelFade)"/>
          {/* extra top fade */}
          <rect x="0" y="0" width="460" height="120" fill="#0a0f1e" fillOpacity="0.55"/>
          {/* extra bottom fade */}
          <rect x="0" y="580" width="460" height="120" fill="#0a0f1e" fillOpacity="0.6"/>
        </svg>

        {/* content over dot grid */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", padding: "32px 38px 36px" }}>

          {/* ── Logo row ── */}
          <div style={{ flexShrink: 0 }}>
            <Logo size="md" dark={true} />
          </div>

          {/* ── Hero copy — centred vertically ── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 4px" }}>
            {/* eyebrow */}
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4.5, color: C.yellow, textTransform: "uppercase", marginBottom: 16, opacity: 0.9, fontFamily: F.en }}>
              Global Node Infrastructure
            </div>

            {/* headline */}
            <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1.22, marginBottom: 16, textShadow: "0 0 48px rgba(255,215,0,.18)" }}>
              让闲置资源<br/>
              <span style={{ color: C.yellow }}>连接世界</span>
            </div>

            {/* EN sub */}
            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,.45)", fontStyle: "italic", letterSpacing: 0.3, lineHeight: 1.75, marginBottom: 24, fontFamily: F.en }}>
              Turn Idle Resources into<br/>Infrastructure for the World.
            </div>

            {/* divider */}
            <div style={{ width: 56, height: 1, background: `linear-gradient(90deg,transparent,${C.yellow}88,transparent)`, marginBottom: 22 }} />

            {/* body copy */}
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.38)", lineHeight: 2, maxWidth: 290 }}>
              通过 IPFS 内容寻址与 P2P 传输协议<br/>
              将全球家庭节点的闲置带宽与存储资源<br/>
              聚合为高可用的分布式基础设施网络
            </div>
          </div>

          {/* ── Feature cards ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              {
                accent: "#60A5FA",
                tag: "IPFS · Content Addressing",
                title: "全球分布式内容网络",
                desc: "基于 IPFS 内容寻址协议，家庭节点共同构成去中心化 CDN，实现数据就近分发与多源冗余。",
              },
              {
                accent: "#34D399",
                tag: "Idle Resource Monetisation",
                title: "闲置资源按贡献变现",
                desc: "节点贡献带宽与存储即可获得积分奖励，链上结算透明可验证，随时兑换或提现。",
              },
              {
                accent: "#A78BFA",
                tag: "P2P · Fault Tolerant",
                title: "无单点失效架构",
                desc: "P2P 协议保障节点动态加入与退出，多路径路由与副本策略确保网络弹性与持续可用性。",
              },
            ].map(f => (
              <div key={f.tag} style={{ display: "flex", gap: 14, padding: "13px 15px", background: "rgba(255,255,255,.04)", backdropFilter: "blur(4px)", borderRadius: 11, border: `1px solid rgba(255,255,255,.07)`, position: "relative", overflow: "hidden" }}>
                {/* left accent bar */}
                <div style={{ width: 3, borderRadius: 99, background: f.accent, flexShrink: 0, alignSelf: "stretch", opacity: 0.85 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.8, color: f.accent, textTransform: "uppercase", opacity: 0.8, marginBottom: 4 }}>{f.tag}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9", marginBottom: 4, letterSpacing: 0.2 }}>{f.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.38)", lineHeight: 1.65 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Right form ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F8FA", padding: 40 }}>
        <div style={{ width: 400 }}>

          {/* Form header */}
          <div style={{ marginBottom: 28, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.dark, marginBottom: 4 }}>
              {tab === "login" ? "欢迎回来" : "加入星矩阵"}
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>
              {tab === "login" ? "登录您的 StarMatrix 商家账号" : "成为全球节点网络的一部分"}
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", background: "#EEEEF2", borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {([["login", "登录"] as const, ["register", "注册"] as const]).map(([v, l]) => (
              <button key={v} onClick={() => { setTab(v); setStep("idle"); }} style={{
                flex: 1, padding: "8px 0", border: "none", borderRadius: 7, cursor: "pointer",
                fontSize: 14, fontWeight: 700, fontFamily: F.cn,
                background: tab === v ? "#fff" : "transparent",
                color: tab === v ? C.dark : C.muted,
                boxShadow: tab === v ? "0 1px 4px rgba(0,0,0,.1)" : "none",
                transition: "all .15s",
              }}>{l}</button>
            ))}
          </div>

          {/* ── LOGIN FORM ── */}
          {tab === "login" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: "block", marginBottom: 5 }}>邮箱地址</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="your@email.com"
                  style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: "none", boxSizing: "border-box", transition: "border .15s" }}
                  onFocus={(e) => (e.target.style.borderColor = C.yellow)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>登录密码</label>
                  <span style={{ fontSize: 11, color: C.blue, cursor: "pointer" }} onClick={() => { setFpModal(true); setFpStep("email"); setFpEmail(""); setFpCode(""); setFpNewPwd(""); setFpNewPwd2(""); }}>忘记密码？</span>
                </div>
                <input value={pwd} onChange={(e) => setPwd(e.target.value)} type="password" placeholder="请输入密码"
                  style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = C.yellow)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: C.muted, cursor: "pointer" }}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ accentColor: C.yellow, width: 14, height: 14 }} />
                记住登录状态（7天内免登录）
              </label>

              {step === "loading" && <div style={{ padding: "8px 12px", background: "#E3F2FD", borderRadius: 6, fontSize: 12, color: C.blue }}>正在验证账号...</div>}
              {step === "ok" && <div style={{ padding: "8px 12px", background: "#E8F5E9", borderRadius: 6, fontSize: 12, color: C.green }}>✓ 登录成功，正在进入...</div>}

              <button onClick={submit} disabled={step !== "idle"} style={{
                width: "100%", padding: "13px", background: step === "ok" ? "#16A34A" : "#0F172A", border: "none", borderRadius: 9,
                fontWeight: 800, fontSize: 14, color: "#fff", letterSpacing: .4,
                cursor: step === "idle" ? "pointer" : "default", fontFamily: F.cn, marginTop: 4,
                boxShadow: step === "idle" ? "0 2px 12px rgba(15,23,42,.18)" : "none",
              }}>
                {step === "idle" ? "登录账号" : step === "loading" ? "验证中…" : "✓ 正在进入…"}
              </button>

              <div style={{ textAlign: "center", fontSize: 12, color: C.muted }}>
                还没有账号？<span style={{ color: C.blue, fontWeight: 700, cursor: "pointer" }} onClick={() => setTab("register")}>立即注册</span>
              </div>
            </div>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === "register" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: "block", marginBottom: 5 }}>邮箱地址</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={regEmail} onChange={(e) => setRegEmail(e.target.value)} type="email" placeholder="your@email.com"
                    style={{ flex: 1, padding: "10px 12px", border: `1.5px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: "none" }}
                    onFocus={(e) => (e.target.style.borderColor = C.yellow)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  />
                  <button onClick={sendRegCode} disabled={regCountdown > 0} style={{
                    padding: "0 14px", borderRadius: 7, border: `1.5px solid ${C.yellow}`, background: regCountdown > 0 ? "#f5f5f5" : C.yellow,
                    fontWeight: 700, fontSize: 12, color: regCountdown > 0 ? C.muted : C.dark, cursor: regCountdown > 0 ? "default" : "pointer",
                    whiteSpace: "nowrap", fontFamily: F.cn,
                  }}>{regCountdown > 0 ? `${regCountdown}s` : "发送验证码"}</button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: "block", marginBottom: 5 }}>邮箱验证码 (OTP)</label>
                <input value={regCode} onChange={(e) => setRegCode(e.target.value)} placeholder="发送验证码后输入 6 位 OTP" maxLength={6}
                  style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${regCode.length === 6 ? C.green : C.border}`, borderRadius: 7, fontSize: 13, outline: "none", boxSizing: "border-box", letterSpacing: 4, fontFamily: F.mono }}
                  onFocus={(e) => (e.target.style.borderColor = C.yellow)}
                  onBlur={(e) => (e.target.style.borderColor = regCode.length === 6 ? C.green : C.border)}
                />
                {regCodeSent && <div style={{ fontSize: 11, color: C.green, marginTop: 3 }}>✓ 验证码已发送至 {regEmail}</div>}
                {!regCodeSent && <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>请先填写邮箱并点击"发送验证码"</div>}
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: "block", marginBottom: 5 }}>设置密码</label>
                <input value={regPwd} onChange={(e) => setRegPwd(e.target.value)} type="password" placeholder="至少8位，包含字母和数字"
                  style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = C.yellow)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                />
                {regPwd.length > 0 && (
                  <div style={{ display: "flex", gap: 3, marginTop: 5 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: regPwd.length >= i * 2 ? (regPwd.length >= 8 ? C.green : C.yellow) : "#E0E0E0" }} />
                    ))}
                    <span style={{ fontSize: 10, color: C.muted, marginLeft: 4 }}>{regPwd.length < 4 ? "弱" : regPwd.length < 8 ? "中" : "强"}</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: "block", marginBottom: 5 }}>确认密码</label>
                <input value={regPwd2} onChange={(e) => setRegPwd2(e.target.value)} type="password" placeholder="再次输入密码"
                  style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${regPwd2 && regPwd !== regPwd2 ? C.red : C.border}`, borderRadius: 7, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = C.yellow)}
                  onBlur={(e) => (e.target.style.borderColor = regPwd2 && regPwd !== regPwd2 ? C.red : C.border)}
                />
                {regPwd2 && regPwd !== regPwd2 && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>两次密码不一致</div>}
                {regPwd2 && regPwd === regPwd2 && <div style={{ fontSize: 11, color: C.green, marginTop: 3 }}>✓ 密码一致</div>}
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: refErr ? C.red : C.muted }}>
                    推荐码 <span style={{ color: C.red, fontSize: 12 }}>*</span>
                  </label>
                  <span style={{ fontSize: 10, color: C.muted }}>必填 · 无推荐码无法注册</span>
                </div>
                <input
                  value={regRef}
                  onChange={(e) => { setRegRef(e.target.value.toUpperCase()); setRefErr(false); }}
                  placeholder="请输入邀请人的推荐码"
                  maxLength={12}
                  style={{
                    width: "100%", padding: "10px 12px", boxSizing: "border-box",
                    border: `1.5px solid ${refErr ? C.red : regRef.length >= 4 ? C.green : C.border}`,
                    borderRadius: 7, fontSize: 13, outline: "none",
                    fontFamily: F.mono, letterSpacing: 1.5, textTransform: "uppercase",
                    background: refErr ? "#FFF5F5" : "#fff",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = refErr ? C.red : C.yellow)}
                  onBlur={(e) => (e.target.style.borderColor = refErr ? C.red : regRef.length >= 4 ? C.green : C.border)}
                />
                {refErr && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>✗ 请填写推荐码，注册须由已有用户邀请</div>}
                {!refErr && regRef.length >= 4 && <div style={{ fontSize: 11, color: C.green, marginTop: 3 }}>✓ 推荐码格式正确</div>}
              </div>

              <div style={{ padding: "10px 12px", background: "#FFFDE7", borderRadius: 7, border: "1px solid #FFE082", fontSize: 11, color: C.muted, lineHeight: 1.7 }}>
                <span style={{ display: "flex", alignItems: "flex-start", gap: 6 }}><span style={{ color: "#D97706", flexShrink: 0, marginTop: 1 }}>{Ic.monitor}</span><span>注册后可在 <strong style={{ color: C.text }}>会员中心 → 设备管理</strong> 中绑定最多 <strong style={{ color: C.orange }}>3 台</strong> Windows 设备的授权码，每台设备有效期 1 年。</span></span>
              </div>

              {step === "loading" && <div style={{ padding: "8px 12px", background: "#E3F2FD", borderRadius: 6, fontSize: 12, color: C.blue }}>正在创建账号...</div>}
              {step === "ok" && <div style={{ padding: "8px 12px", background: "#E8F5E9", borderRadius: 6, fontSize: 12, color: C.green }}>✓ 注册成功！正在进入...</div>}

              <button onClick={submit} disabled={step !== "idle"} style={{
                width: "100%", padding: "13px", background: step === "ok" ? "#16A34A" : "#0F172A", border: "none", borderRadius: 9,
                fontWeight: 800, fontSize: 14, color: "#fff", letterSpacing: .4,
                cursor: step === "idle" ? "pointer" : "default", fontFamily: F.cn,
                boxShadow: step === "idle" ? "0 2px 12px rgba(15,23,42,.18)" : "none",
              }}>
                {step === "idle" ? "创建账号" : step === "loading" ? "注册中…" : "✓ 正在进入…"}
              </button>

              <div style={{ textAlign: "center", fontSize: 12, color: C.muted }}>
                已有账号？<span style={{ color: C.blue, fontWeight: 700, cursor: "pointer" }} onClick={() => setTab("login")}>立即登录</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Forgot-password modal ── */}
      {fpModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => { if (fpStep !== "done") setFpModal(false); }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 420, borderRadius: 12, background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,.2)", overflow: "hidden", fontFamily: F.cn }}>
            <div style={{ background: C.dark, padding: "14px 20px", display: "flex", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "#fff", fontSize: 15, flex: 1 }}>重置密码</span>
              <button onClick={() => setFpModal(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.4)", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            {/* step indicator */}
            <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
              {["填写邮箱", "验证 OTP", "设置密码"].map((s, i) => {
                const done = (fpStep === "otp" && i < 1) || (fpStep === "reset" && i < 2) || fpStep === "done";
                const active = (fpStep === "email" && i === 0) || (fpStep === "otp" && i === 1) || (fpStep === "reset" && i === 2);
                return (
                  <div key={s} style={{ flex: 1, padding: "10px 0", textAlign: "center", fontSize: 12, fontWeight: active ? 700 : 500, color: active ? C.dark : done ? C.green : C.muted, borderBottom: `2px solid ${active ? C.yellow : "transparent"}` }}>
                    {done && !active ? "✓ " : ""}{s}
                  </div>
                );
              })}
            </div>

            <div style={{ padding: "22px 24px" }}>
              {fpStep === "email" && (<>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6 }}>注册邮箱地址</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  <input value={fpEmail} onChange={e => setFpEmail(e.target.value)} type="email" placeholder="your@email.com"
                    style={{ flex: 1, padding: "10px 12px", border: `1.5px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: "none" }}
                    onFocus={e => (e.target.style.borderColor = C.yellow)} onBlur={e => (e.target.style.borderColor = C.border)}
                  />
                  <button onClick={fpSendOtp} disabled={!fpEmail || fpCd > 0}
                    style={{ padding: "0 14px", borderRadius: 7, border: `1.5px solid ${C.yellow}`, background: fpEmail && !fpCd ? C.yellow : "#f5f5f5", fontWeight: 700, fontSize: 12, color: fpEmail && !fpCd ? C.dark : C.muted, cursor: fpEmail && !fpCd ? "pointer" : "default", whiteSpace: "nowrap", fontFamily: F.cn }}>
                    {fpCd > 0 ? `${fpCd}s` : "发送 OTP"}
                  </button>
                </div>
                <button onClick={fpSendOtp} disabled={!fpEmail}
                  style={{ width: "100%", padding: "11px", background: fpEmail ? C.yellow : "#D1D5DB", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 14, color: C.dark, cursor: fpEmail ? "pointer" : "not-allowed", fontFamily: F.cn }}>
                  发送验证码并继续
                </button>
              </>)}

              {fpStep === "otp" && (<>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>验证码已发送至 <strong style={{ color: C.text }}>{fpEmail}</strong></div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6 }}>输入 6 位 OTP 验证码</label>
                <input value={fpCode} onChange={e => setFpCode(e.target.value)} placeholder="6 位数字验证码" maxLength={6}
                  style={{ width: "100%", padding: "12px", border: `1.5px solid ${fpCode.length === 6 ? C.green : C.border}`, borderRadius: 7, fontSize: 20, outline: "none", boxSizing: "border-box", letterSpacing: 8, fontFamily: F.mono, textAlign: "center", marginBottom: 16 }}
                  onFocus={e => (e.target.style.borderColor = C.yellow)} onBlur={e => (e.target.style.borderColor = fpCode.length === 6 ? C.green : C.border)}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={fpSendOtp} disabled={fpCd > 0}
                    style={{ flex: 1, padding: "10px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, fontWeight: 600, fontSize: 13, color: C.muted, cursor: fpCd > 0 ? "default" : "pointer", fontFamily: F.cn }}>
                    {fpCd > 0 ? `重新发送 (${fpCd}s)` : "重新发送"}
                  </button>
                  <button onClick={fpVerifyOtp} disabled={fpCode.length !== 6}
                    style={{ flex: 2, padding: "10px", background: fpCode.length === 6 ? C.yellow : "#D1D5DB", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 13, color: C.dark, cursor: fpCode.length === 6 ? "pointer" : "not-allowed", fontFamily: F.cn }}>
                    验证并继续
                  </button>
                </div>
              </>)}

              {fpStep === "reset" && (<>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6 }}>新密码</label>
                <input value={fpNewPwd} onChange={e => setFpNewPwd(e.target.value)} type="password" placeholder="至少 8 位，包含字母和数字"
                  style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 12 }}
                  onFocus={e => (e.target.style.borderColor = C.yellow)} onBlur={e => (e.target.style.borderColor = C.border)}
                />
                <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6 }}>确认新密码</label>
                <input value={fpNewPwd2} onChange={e => setFpNewPwd2(e.target.value)} type="password" placeholder="再次输入新密码"
                  style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${fpNewPwd2 && fpNewPwd !== fpNewPwd2 ? C.red : C.border}`, borderRadius: 7, fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 4 }}
                  onFocus={e => (e.target.style.borderColor = C.yellow)} onBlur={e => (e.target.style.borderColor = C.border)}
                />
                {fpNewPwd2 && fpNewPwd !== fpNewPwd2 && <div style={{ fontSize: 11, color: C.red, marginBottom: 12 }}>两次密码不一致</div>}
                {fpNewPwd2 && fpNewPwd === fpNewPwd2 && <div style={{ fontSize: 11, color: C.green, marginBottom: 12 }}>✓ 密码一致</div>}
                <button onClick={fpReset} disabled={!fpNewPwd || fpNewPwd !== fpNewPwd2}
                  style={{ width: "100%", padding: "11px", background: (fpNewPwd && fpNewPwd === fpNewPwd2) ? C.yellow : "#D1D5DB", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 14, color: C.dark, cursor: (fpNewPwd && fpNewPwd === fpNewPwd2) ? "pointer" : "not-allowed", fontFamily: F.cn }}>
                  确认更新密码
                </button>
              </>)}

              {fpStep === "done" && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 48, color: C.green, marginBottom: 10 }}>✓</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: C.green }}>密码重置成功</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>请使用新密码登录</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED LIST UTILITIES
══════════════════════════════════════════════════════════════ */

const LIST_PAGE_SIZE = 10;

function filterAndPage<T>(
  list: T[],
  search: string,
  dateFrom: string,
  dateTo: string,
  page: number,
  matchFn: (item: T, q: string) => boolean,
  dateFn: (item: T) => string,
  pageSize = LIST_PAGE_SIZE
): { rows: T[]; total: number; pages: number } {
  const q = search.trim().toLowerCase();
  const filtered = list.filter(item => {
    if (q && !matchFn(item, q)) return false;
    const d = dateFn(item);
    if (dateFrom && d < dateFrom) return false;
    if (dateTo && d > dateTo) return false;
    return true;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  return { rows: filtered.slice((safePage - 1) * pageSize, safePage * pageSize), total: filtered.length, pages };
}

function ListBar({
  search, onSearch, dateFrom, onDateFrom, dateTo, onDateTo, total, label,
}: {
  search: string; onSearch: (v: string) => void;
  dateFrom: string; onDateFrom: (v: string) => void;
  dateTo: string; onDateTo: (v: string) => void;
  total: number; label?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#F8FAFC", borderBottom: "1px solid #E5E7EB", flexWrap: "wrap" as const }}>
      <div style={{ position: "relative" as const, flex: "1 1 160px", minWidth: 140 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input value={search} onChange={e => onSearch(e.target.value)} placeholder="搜索…"
          style={{ width: "100%", padding: "7px 10px 7px 28px", border: "1px solid #E5E7EB", borderRadius: 7, fontSize: 12, outline: "none", boxSizing: "border-box" as const, fontFamily: "system-ui,sans-serif" }} />
      </div>
      <input type="date" value={dateFrom} onChange={e => onDateFrom(e.target.value)}
        style={{ padding: "6px 8px", border: "1px solid #E5E7EB", borderRadius: 7, fontSize: 12, outline: "none", color: dateFrom ? "#1C1C2E" : "#9CA3AF", fontFamily: "system-ui,sans-serif" }} />
      <span style={{ fontSize: 12, color: "#9CA3AF" }}>—</span>
      <input type="date" value={dateTo} onChange={e => onDateTo(e.target.value)}
        style={{ padding: "6px 8px", border: "1px solid #E5E7EB", borderRadius: 7, fontSize: 12, outline: "none", color: dateTo ? "#1C1C2E" : "#9CA3AF", fontFamily: "system-ui,sans-serif" }} />
      {(search || dateFrom || dateTo) && (
        <button onClick={() => { onSearch(""); onDateFrom(""); onDateTo(""); }}
          style={{ padding: "5px 10px", border: "1px solid #E5E7EB", borderRadius: 7, background: "#fff", fontSize: 11, color: "#6B7280", cursor: "pointer", fontFamily: "system-ui,sans-serif" }}>
          清除
        </button>
      )}
      <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: "auto", whiteSpace: "nowrap" as const }}>共 <strong style={{ color: "#374151" }}>{total}</strong> {label ?? "条"}</span>
    </div>
  );
}

function ListPager({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const btns: (number | "…")[] = [];
  if (pages <= 7) {
    for (let i = 1; i <= pages; i++) btns.push(i);
  } else {
    btns.push(1);
    if (page > 3) btns.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) btns.push(i);
    if (page < pages - 2) btns.push("…");
    btns.push(pages);
  }
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "10px 16px", borderTop: "1px solid #E5E7EB", background: "#F8FAFC" }}>
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #E5E7EB", background: page === 1 ? "#F5F5F5" : "#fff", color: page === 1 ? "#CCC" : "#374151", fontSize: 13, cursor: page === 1 ? "default" : "pointer" }}>‹</button>
      {btns.map((b, i) => b === "…" ? (
        <span key={`e${i}`} style={{ width: 28, textAlign: "center" as const, fontSize: 13, color: "#9CA3AF" }}>…</span>
      ) : (
        <button key={b} onClick={() => onChange(b as number)}
          style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${b === page ? "#1C1C2E" : "#E5E7EB"}`, background: b === page ? "#1C1C2E" : "#fff", color: b === page ? "#FFD700" : "#374151", fontSize: 12, fontWeight: b === page ? 700 : 400, cursor: "pointer" }}>{b}</button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === pages}
        style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #E5E7EB", background: page === pages ? "#F5F5F5" : "#fff", color: page === pages ? "#CCC" : "#374151", fontSize: 13, cursor: page === pages ? "default" : "pointer" }}>›</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MERCHANT — PAGE 1: HOME
══════════════════════════════════════════════════════════════ */

/* scrolling ticker CSS injected once */
const TICKER_STYLE = `
@keyframes slotReel {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-200%); }
}
@keyframes slotFast {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-300%); }
}
@keyframes winPop {
  0%   { transform: scale(.6); opacity: 0; }
  60%  { transform: scale(1.25); opacity: 1; }
  100% { transform: scale(1); }
}
@keyframes winGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,215,0,0); }
  50%       { box-shadow: 0 0 32px 8px rgba(255,215,0,.35); }
}
@keyframes wheelWin {
  0%   { transform: scale(1); }
  30%  { transform: scale(1.05); }
  60%  { transform: scale(.97); }
  100% { transform: scale(1); }
}
.slot-spinning { animation: slotReel .12s linear infinite; }
.slot-result-win { animation: winPop .45s cubic-bezier(.22,1,.36,1) forwards, winGlow 1.2s ease .4s infinite; }
@keyframes ticker-slide {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
.ticker-track { animation: ticker-slide 22s linear infinite; }
.ticker-track:hover { animation-play-state: paused; }
@keyframes pop-in {
  0%   { opacity:0; transform:scale(.92) translateY(4px); }
  100% { opacity:1; transform:scale(1)   translateY(0); }
}
@keyframes settle-in {
  0%   { opacity:0; transform: translateY(16px); }
  15%  { opacity:1; transform: translateY(0); }
  80%  { opacity:1; transform: translateY(0); }
  100% { opacity:0; transform: translateY(-10px); }
}
.settle-toast { animation: settle-in 4s ease forwards; }
@keyframes settle-scroll {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
.settle-track { animation: settle-scroll 18s linear infinite; }
`;

/* ── initial device slots (3 regular + 1 extra-locked) ── */
type DeviceSlot = { slot: number; code: string; hwid: string; os: string; activatedAt: string; expiry: string; online: boolean; orders: number; settled: number; pending: number } | null;
const INIT_SLOTS: DeviceSlot[] = [
  { slot: 1, code: "C3J8Z9FH0K9G6", hwid: "HWID-A7F3-2K9X-B4M1", os: "Windows 11 Home",  activatedAt: "2026-08-30", expiry: "2027-08-30", online: true,  orders: 2,  settled: 9600,  pending: 36480 },
  { slot: 2, code: "A9K2M5PQ7RNT1", hwid: "HWID-B2R9-5ZPQ-C7N3", os: "Windows 10 Pro",   activatedAt: "2026-07-15", expiry: "2027-07-15", online: false, orders: 0,  settled: 43200, pending: 0     },
  null,
  /* slot 4 = null means empty; the 4th card always renders as "extra locked" */
];

/* VIP plan data */
const VIP_PLANS = [
  { id: "monthly", label: "月度VIP", price: "¥68", period: "/月", desc: "解锁全部任务类型 · 优先接单通道", color: C.blue,   badge: "基础" },
  { id: "quarter", label: "季度VIP", price: "¥168", period: "/季", desc: "省 ¥36 · 含自动接单功能",           color: C.orange, badge: "推荐", popular: true },
  { id: "yearly",  label: "年度VIP", price: "¥588", period: "/年", desc: "省 ¥228 · 含全部高级权益",          color: "#1C1C2E", badge: "最优惠" },
];

function MerchantHome() {
  /* ── slots state ── */
  const [slots, setSlots] = useState<DeviceSlot[]>(INIT_SLOTS);
  const [extraUnlocked, setExtraUnlocked] = useState(false);

  /* ── activation modal ── */
  const [activateSlotIdx, setActivateSlotIdx] = useState<number | null>(null);
  const [cardCode, setCardCode]   = useState("");
  const [renewSlotIdx, setRenewSlotIdx] = useState<number | null>(null);
  const [renewCode, setRenewCode] = useState("");
  const [renewStep, setRenewStep] = useState<"idle"|"checking"|"ok"|"error">("idle");
  const doRenew = () => {
    if (!renewCode.trim()) return;
    setRenewStep("checking");
    setTimeout(() => {
      if (renewCode.trim().length >= 8) {
        setSlots(prev => prev.map((s, i) => {
          if (i !== renewSlotIdx || !s) return s;
          const current = new Date(s.expiry);
          current.setFullYear(current.getFullYear() + 1);
          return { ...s, expiry: current.toISOString().slice(0, 10) };
        }));
        setRenewStep("ok");
        setTimeout(() => { setRenewSlotIdx(null); setRenewCode(""); setRenewStep("idle"); }, 2000);
      } else {
        setRenewStep("error");
      }
    }, 1400);
  };
  const [hwid]                    = useState("HWID-F9KX-3QMP-D1W7-NEW3");
  const [activating, setActivating] = useState<"idle"|"checking"|"ok"|"error">("idle");
  const [activateMsg, setActivateMsg] = useState("");

  /* ── daily check-in ── */
  const [yunbi, setYunbi] = useState(128.40);
  const [depositedYunbi, setDepositedYunbi] = useState(0);
  const [checkedIn,  setCheckedIn]  = useState(false);
  const [feePool,    setFeePool]    = useState(0);
  const [rulesModal, setRulesModal] = useState(false);
  const [depositModal, setDepositModal] = useState(false);
  const [depositInput, setDepositInput] = useState("");
  const [withdrawInput, setWithdrawInput] = useState("");
  // streak-based check-in model (same as MerchantMember)
  const DAY_RATES   = [0.003, 0.004, 0.005, 0.007, 0.008, 0.009, 0.01];
  const STREAK_MULT = [1, 1, 2, 2, 2, 2, 3];
  const [dayIndex, setDayIndex] = useState(3);
  const [streak,   setStreak]   = useState(3);
  const dayRate     = DAY_RATES[Math.min(dayIndex - 1, 6)];
  const streakMult  = STREAK_MULT[Math.min(streak - 1, 6)];
  const checkinReward = 10; // fixed: +10 签到云币 per check-in
  // keep legacy vars that other UI references
  const checkinLevel = 0;
  const checkinRate  = dayRate;
  const doCheckin = () => {
    if (checkedIn) return;
    setCheckedIn(true);
    setStreak(s => Math.min(s + 1, 7));
    setDayIndex(d => d < 7 ? d + 1 : 1);
    setFeePool(prev => parseFloat((prev + checkinReward).toFixed(4)));
  };
  const doDeposit = () => {
    const n = parseFloat(depositInput);
    if (!n || n <= 0 || n > yunbi) return;
    setDepositedYunbi(prev => parseFloat((prev + n).toFixed(2)));
    setYunbi(prev => parseFloat((prev - n).toFixed(2)));
    setDepositInput("");
  };
  const doWithdrawDeposit = () => {
    const n = parseFloat(withdrawInput);
    if (!n || n <= 0 || n > depositedYunbi) return;
    setDepositedYunbi(prev => parseFloat((prev - n).toFixed(2)));
    setYunbi(prev => parseFloat((prev + n).toFixed(2)));
    setWithdrawInput("");
  };

  /* ── VIP ── */
  const [isVip, setIsVip]             = useState(false);
  const [vipModal, setVipModal]       = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("quarter");
  const [payStep, setPayStep]         = useState<"select"|"pay"|"done">("select");
  const [payMethod, setPayMethod]     = useState<"alipay"|"wechat">("alipay");
  const openVip = () => { setVipModal(true); setPayStep("select"); };
  const doPay   = () => {
    setPayStep("pay");
    setTimeout(() => { setPayStep("done"); setIsVip(true); setTimeout(() => setVipModal(false), 1600); }, 2000);
  };

  const usedSlots = slots.slice(0, 3).filter(Boolean).length;

  const openActivateModal = (idx: number) => {
    setActivateSlotIdx(idx);
    setCardCode("");
    setActivating("idle");
    setActivateMsg("");
  };

  // HMAC-SHA256 card integrity verification using Web Crypto API
  const verifyCardHmac = async (key: string): Promise<{ valid: boolean; reason?: string }> => {
    const normalized = key.toUpperCase().trim();
    // Card format: groups of alphanumeric chars separated by hyphens, total 13+ chars
    if (!/^[A-Z0-9]{4,}(-[A-Z0-9]{4,})*$/.test(normalized) && !/^[A-Z0-9]{8,}$/.test(normalized)) {
      return { valid: false, reason: "卡密格式不正确，请检查后重试" };
    }
    // Derive HMAC key from shared secret (in production this would be server-side)
    const secret = "FIGMA_MAKE_CARD_SECRET_2026";
    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    // Compute expected signature from card number prefix (first segment)
    const prefix = normalized.split("-")[0] ?? normalized.slice(0, 6);
    const sigBuf = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(prefix));
    const sigHex = Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, "0")).join("");
    // Cards already bound to a device slot are considered used
    const alreadyUsed = slots.some(s => s && s.code.toUpperCase() === normalized);
    if (alreadyUsed) return { valid: false, reason: "该卡密已绑定至其他设备槽位，不可重复使用" };
    // Simulate tamper check: cards whose first char hex signature byte is 0x00 are flagged as tampered
    // (In production the server returns a signed token; here we use a deterministic local check)
    const firstByte = parseInt(sigHex.slice(0, 2), 16);
    if (firstByte === 0) return { valid: false, reason: "卡密校验失败，疑似已被篡改，请联系客服" };
    return { valid: true };
  };

  const doActivate = () => {
    if (!cardCode.trim()) return;
    setActivating("checking");
    setActivateMsg("");
    (async () => {
      // Step 1: crypto integrity & format verification
      const { valid, reason } = await verifyCardHmac(cardCode);
      if (!valid) {
        setActivating("error");
        setActivateMsg(reason ?? "卡密验证失败");
        return;
      }
      // Step 2: simulate network round-trip for server-side used/tamper check
      await new Promise(r => setTimeout(r, 1200));
      // Step 3: bind device machine code to card
      const idx = activateSlotIdx!;
      const newSlot: DeviceSlot = {
        slot: idx + 1,
        code: cardCode.toUpperCase().trim(),
        hwid,                        // machine code bound at activation
        os: "Windows 11 Pro",
        activatedAt: new Date().toISOString().slice(0, 10),
        expiry: new Date(Date.now() + 365 * 86400_000).toISOString().slice(0, 10),
        online: false, orders: 0, settled: 0, pending: 0,
      };
      const next = [...slots];
      next[idx] = newSlot;
      setSlots(next);
      setActivating("ok");
      setActivateMsg(`激活成功！卡密已通过安全验证，设备 ${hwid} 已绑定，重启客户端后生效。`);
      setTimeout(() => { setActivateSlotIdx(null); setActivating("idle"); }, 2500);
    })();
  };


  /* ── settlement ticker data ── */
  const lotteryTickers = [
    { time: "2026-09-09 10:12", user: "wa****@gmail.com",    event: "抽奖中奖 🎉",    extra: "获得积分 × 5000" },
    { time: "2026-09-09 09:44", user: "li****@gmail.com",    event: "积分兑换激活卡", extra: "获得抽奖卡 × 2" },
    { time: "2026-09-09 08:30", user: "ch****@163.com",      event: "抽奖中奖 🎉",    extra: "获得激活卡 × 1" },
    { time: "2026-09-08 22:15", user: "sa****@outlook.com",  event: "1分夺卡中奖 🏆", extra: "激活卡已发放" },
    { time: "2026-09-08 20:50", user: "to****@yahoo.com",    event: "云币购买激活卡", extra: "获得抽奖卡" },
    { time: "2026-09-08 19:33", user: "mn****@hotmail.com",  event: "抽奖中奖 🎉",    extra: "获得云币 × 50" },
    { time: "2026-09-08 18:08", user: "us****@gmail.com",    event: "积分兑换激活卡", extra: "获得抽奖卡 × 3" },
    { time: "2026-09-08 15:40", user: "jk****@126.com",      event: "1分夺卡中奖 🏆", extra: "激活卡已发放" },
  ];

  const settleItems = [
    { time: "2026-08-31 14:52", terminal: "终端1", task: "cloudflare · IP Traffic Relay",    pts: 480,  pph: 100, order: "20261780765001" },
    { time: "2026-08-31 14:51", terminal: "终端2", task: "fastly · Bandwidth CDN Relay",      pts: 474,  pph: 99,  order: "20261780765002" },
    { time: "2026-08-31 13:52", terminal: "终端1", task: "cloudflare · IP Traffic Relay",    pts: 480,  pph: 100, order: "20261780765001" },
    { time: "2026-08-31 13:51", terminal: "终端2", task: "fastly · Bandwidth CDN Relay",      pts: 474,  pph: 99,  order: "20261780765002" },
    { time: "2026-08-31 12:52", terminal: "终端1", task: "cloudflare · IP Traffic Relay",    pts: 480,  pph: 100, order: "20261780765001" },
    { time: "2026-08-31 12:51", terminal: "终端2", task: "akamai · IPFS Storage Node",        pts: 720,  pph: 144, order: "20261780765003" },
    { time: "2026-08-31 11:52", terminal: "终端1", task: "cloudflare · IP Traffic Relay",    pts: 480,  pph: 100, order: "20261780765001" },
    { time: "2026-08-31 11:51", terminal: "终端2", task: "amazon · P2P Relay Node",           pts: 512,  pph: 115, order: "20261780765004" },
    { time: "2026-08-31 10:52", terminal: "终端1", task: "cloudflare · IP Traffic Relay",    pts: 480,  pph: 100, order: "20261780765001" },
    { time: "2026-08-31 10:51", terminal: "终端2", task: "fastly · Bandwidth CDN Relay",      pts: 474,  pph: 99,  order: "20261780765002" },
  ];
  type AllTickerItem = { kind: "settle"; time: string; terminal: string; task: string; pts: number; pph: number; order: string } | { kind: "lottery"; time: string; user: string; event: string; extra: string };
  const allTickerItems: AllTickerItem[] = settleItems.flatMap((s, i) => {
    const arr: AllTickerItem[] = [{ kind: "settle", ...s }];
    if (i % 2 === 0 && lotteryTickers[Math.floor(i / 2)]) arr.push({ kind: "lottery", ...lotteryTickers[Math.floor(i / 2)] });
    return arr;
  });
  const settleDoubled = [...allTickerItems, ...allTickerItems];

  const announcements = [
    { time: "2026-08-30", type: "活动", title: "IPFS存储节点任务上线：高价单，积分翻倍奖励活动同步开启！", hot: true },
    { time: "2026-08-25", type: "公告", title: "实名认证功能正式上线，请未认证用户尽快完成，认证后可解锁更多任务类型", hot: false },
    { time: "2026-08-20", type: "系统", title: "服务器维护窗口调整为每周三凌晨 02:00–04:00，请提前做好任务安排", hot: false },
    { time: "2026-08-15", type: "规则", title: "积分兑换云币汇率：1000积分 = 1云币，详情见文档中心", hot: false },
    { time: "2026-08-10", type: "活动", title: "激活节点奖励：成功激活三个终端可额外获得5000积分奖励", hot: false },
    { time: "2026-08-05", type: "公告", title: "分布式IPFS节点新增IP分流线路，接单效率提升约30%", hot: false },
  ];
  const typeColor = (t: string) =>
    t === "活动" ? C.orange : t === "公告" ? C.red : t === "系统" ? C.blue : C.muted;

  /* ── 4-slot render helpers ── */
  const SLOT_MAX_ORDERS = 30;
  const renderSlot = (idx: number) => {
    const slot = slots[idx];
    const isExtra = idx === 3;

    if (isExtra) {
      /* ── extra locked slot ── */
      if (!extraUnlocked) {
        return (
          <div key={idx} style={{ flex: 1, borderRadius: 12, border: `2px dashed #BDBDBD`, background: "#F5F5F5", padding: "12px 12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 5, minHeight: 136 }}>
            <div style={{ opacity: .3, color: "#9E9E9E" }}>{Ic.lock}</div>
            <div style={{ fontWeight: 800, fontSize: 12, color: "#BDBDBD" }}>额外卡槽 · 已锁定</div>
            <div style={{ fontSize: 10, color: "#BDBDBD", lineHeight: 1.6 }}>需先激活前3个槽位<br />然后使用积分解锁</div>
            <button
              onClick={() => usedSlots >= 3 ? setExtraUnlocked(true) : alert("请先激活前3个终端槽位")}
              style={{ marginTop: 4, padding: "6px 16px", borderRadius: 6, border: "none", background: usedSlots >= 3 ? C.yellow : "#E0E0E0", color: usedSlots >= 3 ? C.dark : "#BDBDBD", fontWeight: 800, fontSize: 11, cursor: usedSlots >= 3 ? "pointer" : "not-allowed", fontFamily: F.cn }}>
              {usedSlots >= 3 ? "花费 80,000 积分解锁" : `还需激活 ${3 - usedSlots} 个终端`}
            </button>
          </div>
        );
      }
      /* unlocked extra slot — falls through to normal empty slot below */
    }

    if (slot) {
      /* ── active slot ── */
      return (
        <div key={idx} style={{ flex: 1, borderRadius: 12, border: `2px solid ${slot.online ? C.green + "99" : C.border}`, background: slot.online ? "#F0FFF4" : "#FAFAFA", padding: "12px 12px", position: "relative", minHeight: 136 }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 26, height: 26, borderRadius: "12px 0 10px 0", background: slot.online ? C.green : "#BDBDBD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff" }}>{idx + 1}</div>

          {/* status + OS */}
          <div style={{ paddingLeft: 16, marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: slot.online ? C.green : C.muted }}>{slot.online ? "● 在线运行" : "○ 离线"}</span>
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{slot.os}</div>
          <div style={{ fontSize: 9, fontFamily: F.mono, color: "#BDBDBD", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{slot.hwid}</div>

          {/* ── orders progress ── */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 3 }}>
              <span style={{ color: C.muted }}>已接订单</span>
              <span style={{ fontWeight: 800, color: slot.orders >= SLOT_MAX_ORDERS ? C.green : C.orange, fontFamily: F.mono }}>{slot.orders} / {SLOT_MAX_ORDERS}</span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: "#E0E0E0", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 99, width: `${(slot.orders / SLOT_MAX_ORDERS) * 100}%`, background: slot.orders >= SLOT_MAX_ORDERS ? C.green : C.yellow }} />
            </div>
          </div>

          {/* ── settled + pending points ── */}
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            <div style={{ flex: 1, background: "#F0FDF4", borderRadius: 6, padding: "4px 7px", border: "1px solid #BBF7D0" }}>
              <div style={{ fontSize: 9, color: "#166534", marginBottom: 1 }}>已结算</div>
              <div style={{ fontWeight: 900, fontSize: 12, color: C.green, fontFamily: F.mono }}>{slot.settled.toLocaleString()}</div>
            </div>
            <div style={{ flex: 1, background: "#FFF7ED", borderRadius: 6, padding: "4px 7px", border: "1px solid #FED7AA" }}>
              <div style={{ fontSize: 9, color: "#92400E", marginBottom: 1 }}>待结算</div>
              <div style={{ fontWeight: 900, fontSize: 12, color: C.orange, fontFamily: F.mono }}>{slot.pending.toLocaleString()}</div>
            </div>
          </div>

          {/* expiry + actions */}
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 8 }}>到期：<span style={{ fontWeight: 700, color: slot.expiry < "2027-01-01" ? C.orange : C.green }}>{slot.expiry}</span></div>
          <div>
            <button onClick={() => { setRenewSlotIdx(idx); setRenewCode(""); setRenewStep("idle"); }} style={{ width: "100%", padding: "4px 0", fontSize: 9, borderRadius: 4, border: `1px solid ${C.yellow}`, background: "#FFFBEA", color: C.dark, cursor: "pointer", fontWeight: 700 }}>续期</button>
          </div>
        </div>
      );
    }

    /* ── empty (unactivated) slot ── */
    return (
      <div key={idx} style={{ flex: 1, borderRadius: 12, border: `2px dashed ${C.yellow}88`, background: "#FFFDF5", padding: "12px 12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 136 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#FFF3CC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💻</div>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.muted }}>槽位 {idx + 1} · 未激活</div>
        <div style={{ fontSize: 10, color: "#BDBDBD", textAlign: "center", lineHeight: 1.5 }}>绑定激活卡密<br />开启该终端</div>
        <button onClick={() => openActivateModal(idx)}
          style={{ padding: "7px 20px", borderRadius: 6, border: "none", background: C.yellow, color: C.dark, fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: F.cn }}>
          激活绑定
        </button>
      </div>
    );
  };

  return (
    <div style={{ padding: "10px 16px", fontFamily: F.cn, fontSize: 14, color: "#111827" }}>
      <style>{TICKER_STYLE}</style>

      {/* ══ Account hero card ══ */}
      <div style={{ marginBottom: 8, background: `linear-gradient(135deg,#0f1729 0%,#1a2a50 60%,#251a45 100%)`, borderRadius: 12, padding: "12px 18px", boxShadow: "0 4px 20px rgba(0,0,0,.3)", position: "relative", overflow: "hidden" }}>
        {/* decorative glow blobs */}
        <div style={{ position: "absolute", top: -40, right: 80, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,215,0,.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, right: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(156,39,176,.07)", pointerEvents: "none" }} />

        {/* ── Row 1: identity + badges + check-in ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg,${C.yellow},${C.orange})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20, color: C.dark, border: isVip ? "2px solid #CE93D8" : "2px solid rgba(255,215,0,.4)", boxShadow: "0 2px 10px rgba(255,215,0,.22)" }}>S</div>
            {isVip && <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg,#1C1C2E,#2d3a5c)", borderRadius: 99, padding: "2px 7px", fontSize: 9, fontWeight: 800, color: "#fff", whiteSpace: "nowrap" }}>VIP</div>}
          </div>

          {/* name + email + badges */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: 0.3, fontFamily: F.en }}>sb1920mg</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.38)", fontFamily: F.mono }}>us****@example.com</span>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button onClick={openVip} style={{ background: isVip ? "linear-gradient(90deg,#1C1C2E,#2d3a5c)" : "rgba(255,215,0,.12)", border: isVip ? "none" : "1px solid rgba(255,215,0,.35)", borderRadius: 99, padding: "4px 12px", cursor: "pointer" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: isVip ? "#fff" : C.yellow }}>{isVip ? "👑 VIP会员" : "👑 开通VIP"}</span>
              </button>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.green, background: "rgba(67,160,71,.15)", borderRadius: 99, padding: "3px 10px" }}>● 在线</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.35)", background: "rgba(255,255,255,.06)", borderRadius: 99, padding: "3px 10px" }}>签到 Lv.{checkinLevel}</span>
            </div>
          </div>

          {/* ── Daily check-in card ── */}
          <div style={{ flexShrink: 0, width: 280 }}>
            {/* 7-day dots + rule link */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8, justifyContent: "flex-end" }}>
              {DAY_RATES.map((_, i) => {
                const day = i + 1; const isCurrent = day === dayIndex; const done = streak >= day && !isCurrent;
                return (
                  <div key={day} style={{ width: isCurrent ? 22 : 8, height: 8, borderRadius: 99, transition: "width .25s", background: isCurrent ? C.yellow : done ? "rgba(255,215,0,.55)" : "rgba(255,255,255,.1)" }} />
                );
              })}
              <span style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginLeft: 4 }}>第 {dayIndex} 天</span>
              <button onClick={() => setRulesModal(true)}
                style={{ background: "none", border: "none", padding: "0 0 0 6px", cursor: "pointer", fontSize: 10, color: "rgba(255,215,0,.5)", fontFamily: F.cn, textDecoration: "underline", textDecorationStyle: "dashed" as const, textUnderlineOffset: 2 }}>
                规则
              </button>
            </div>
            {/* Sign-in button */}
            <button onClick={doCheckin} disabled={checkedIn}
              style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", cursor: checkedIn ? "default" : "pointer", fontFamily: F.cn, position: "relative" as const, overflow: "hidden",
                background: checkedIn ? "rgba(255,255,255,.06)" : "linear-gradient(90deg,#D97706 0%,#FFD700 50%,#D97706 100%)",
                backgroundSize: checkedIn ? undefined : "200% 100%",
                color: checkedIn ? "rgba(255,255,255,.35)" : "#07101f", fontWeight: 900, fontSize: 14, letterSpacing: 0.5 }}>
              {checkedIn
                ? `✓ 已签到  ·  连续 ${streak} 天  ·  +10 签到云币`
                : `签 到 领 奖  ·  +10 签到云币`}
            </button>
            {!checkedIn && (
              <div style={{ textAlign: "center", marginTop: 4, fontSize: 10, color: "rgba(255,255,255,.28)" }}>
                今日签到 +10 云币 → 签到云币池
              </div>
            )}
          </div>
        </div>

        {/* ── Row 2: stats strip ── */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 0, borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: 12 }}>
          {[
            { label: "已激活终端",  value: `${usedSlots} / 3`,       color: C.yellow,  dim: false },
            { label: "当前接单",    value: "2 单",                    color: "#fff",    dim: false },
            { label: "云币余额",    value: "128.40",                  color: "#93C5FD", dim: false },
            { label: "积分余额",    value: "218,120",                 color: C.yellow,  dim: false },
            { label: "待结算积分",  value: "36,480",                  color: "rgba(255,255,255,.65)", dim: true },
            { label: "已结算积分",  value: "432,680",                 color: "#4ADE80", dim: true },
            { label: "签到云币池",  value: feePool.toFixed(2),        color: "#4ADE80", dim: true },
          ].map((item, i) => (
            <div key={item.label} style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 5,
              padding: "0 14px",
              borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,.08)",
            }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.38)", fontFamily: F.cn, letterSpacing: 0.2, whiteSpace: "nowrap" }}>{item.label}</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: item.color, fontFamily: F.mono, letterSpacing: -0.5, lineHeight: 1, fontVariantNumeric: "tabular-nums", opacity: item.dim ? 0.8 : 1 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Deposit modal ── */}
      {depositModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setDepositModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 360, borderRadius: 14, background: "#fff", boxShadow: "0 24px 64px rgba(0,0,0,.2)", overflow: "hidden" }}>
            <div style={{ background: `linear-gradient(120deg,${C.dark},#162040)`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 800, color: "#fff", fontSize: 15 }}>云币存入 / 取出</div>
              <button onClick={() => setDepositModal(false)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "rgba(255,255,255,.4)", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "20px" }}>
              {/* Balance overview */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
                {[
                  { label: "云币余额", value: yunbi.toFixed(2), color: C.dark },
                  { label: "已存云币", value: depositedYunbi.toFixed(2), color: "#7C3AED" },
                  { label: "签到云币池", value: feePool.toFixed(2), color: C.green },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center", background: "#F8F9FB", borderRadius: 8, padding: "10px 0" }}>
                    <div style={{ fontSize: 9, color: C.muted, marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 900, fontFamily: F.mono, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Deposit */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>存入云币</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="number" value={depositInput} onChange={e => setDepositInput(e.target.value)} placeholder={`最多 ${yunbi.toFixed(2)}`}
                    style={{ flex: 1, padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: F.mono, outline: "none" }}
                    onFocus={e => e.target.style.borderColor = C.yellow} onBlur={e => e.target.style.borderColor = C.border} />
                  <button onClick={() => setDepositInput(yunbi.toFixed(2))}
                    style={{ padding: "0 12px", border: `1.5px solid ${C.yellow}`, borderRadius: 8, background: "#FFFDE7", color: "#92400E", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>全部</button>
                </div>
                <button onClick={doDeposit} disabled={!depositInput || parseFloat(depositInput) <= 0 || parseFloat(depositInput) > yunbi}
                  style={{ marginTop: 8, width: "100%", padding: "9px 0", borderRadius: 8, border: "none", background: depositInput && parseFloat(depositInput) > 0 && parseFloat(depositInput) <= yunbi ? C.dark : "#E5E7EB", color: depositInput && parseFloat(depositInput) > 0 && parseFloat(depositInput) <= yunbi ? C.yellow : C.muted, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>
                  确认存入
                </button>
              </div>

              <div style={{ height: 1, background: C.border, margin: "0 0 16px" }} />

              {/* Withdraw from deposit */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>取出云币</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="number" value={withdrawInput} onChange={e => setWithdrawInput(e.target.value)} placeholder={`已存 ${depositedYunbi.toFixed(2)}`}
                    style={{ flex: 1, padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: F.mono, outline: "none" }}
                    onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
                  <button onClick={() => setWithdrawInput(depositedYunbi.toFixed(2))}
                    style={{ padding: "0 12px", border: `1.5px solid ${C.blue}`, borderRadius: 8, background: "#EFF6FF", color: C.blue, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>全部</button>
                </div>
                <button onClick={doWithdrawDeposit} disabled={!withdrawInput || parseFloat(withdrawInput) <= 0 || parseFloat(withdrawInput) > depositedYunbi}
                  style={{ marginTop: 8, width: "100%", padding: "9px 0", borderRadius: 8, border: `1.5px solid ${withdrawInput && parseFloat(withdrawInput) > 0 && parseFloat(withdrawInput) <= depositedYunbi ? C.blue : C.border}`, background: "#fff", color: withdrawInput && parseFloat(withdrawInput) > 0 && parseFloat(withdrawInput) <= depositedYunbi ? C.blue : C.muted, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>
                  确认取出
                </button>
              </div>

              <div style={{ marginTop: 14, padding: "8px 12px", background: "#FFFDE7", borderRadius: 7, fontSize: 11, color: "#92400E", lineHeight: 1.6 }}>
                每日签到固定获得 +10 签到云币，自动进入签到云币池，提现时优先抵扣手续费。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Check-in rules modal ── */}
      {rulesModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setRulesModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 400, borderRadius: 14, background: "#fff", boxShadow: "0 24px 64px rgba(0,0,0,.2)", overflow: "hidden", animation: "pop-in .2s ease" }}>
            <div style={{ background: `linear-gradient(120deg,${C.dark},#162040)`, padding: "18px 22px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "rgba(255,255,255,.7)" }}>{Ic.list}</span>
              <div style={{ fontWeight: 800, color: "#fff", fontSize: 15 }}>每日签到规则 · +10 签到云币</div>
              <button onClick={() => setRulesModal(false)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "rgba(255,255,255,.4)", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              {/* Prerequisite */}
              <div style={{ padding: "8px 12px", background: "#FFFDE7", borderRadius: 7, fontSize: 12, color: "#92400E", marginBottom: 14, lineHeight: 1.7 }}>
                每日签到固定获得 <strong>+10 签到云币</strong>，无需存入，奖励自动进入<strong>签到云币池</strong>，提现时优先抵扣手续费，不可单独提取。
              </div>
              {/* Streak bonus */}
              <div style={{ fontSize: 13, color: C.text, fontWeight: 700, marginBottom: 8 }}>连续签到进度</div>
              <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}`, marginBottom: 14 }}>
                {[
                  { days: "第 1–6 天",  reward: "+10 云币/天",   color: C.muted  },
                  { days: "第 7 天",    reward: "+10+30 云币",   color: "#D97706", note: "额外奖励 30" },
                  { days: "第 14 天",   reward: "+10+30 云币",   color: "#D97706", note: "额外奖励 30" },
                  { days: "第 30 天",   reward: "+10+100 云币",  color: C.green,   note: "月签额外 100" },
                ].map((row, i, arr) => (
                  <div key={row.days} style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "9px 14px", background: i % 2 === 0 ? "#FAFAFA" : "#fff", borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : "none", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: C.text }}>{row.days}</span>
                    <span style={{ fontWeight: 900, fontSize: 12, color: row.color, fontFamily: F.mono }}>{row.reward}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px 14px", background: "#F0FDF4", borderRadius: 8, border: "1px solid #BBF7D0", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>🎁</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18, color: "#16A34A", fontFamily: F.mono }}>+10 签到云币 / 天</div>
                  <div style={{ fontSize: 11, color: "#166534", marginTop: 2 }}>固定奖励，每日签到即可获得</div>
                </div>
              </div>
              {/* Rules */}
              {[
                "每日签到固定奖励 10 云币，不与余额或乘数挂钩。",
                "连续签到满 7 天，额外奖励 30 签到云币（相当于 ×4 当天）。",
                "断签一天则连续签到计数归零，额外奖励资格重新累积。",
                "签到云币自动进入签到云币池，提现时优先抵扣手续费，不可单独提取或兑换。",
              ].map((txt, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 4 }}>
                  <span style={{ color: "#D97706", flexShrink: 0, marginTop: 2 }}>{Ic.warnSm}</span><span>{txt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ Brand Strip Banner ══ */}
      <div style={{ marginBottom: 8, borderRadius: 10, overflow: "hidden", position: "relative", height: 48 }}>
        <div style={{ position: "absolute", inset: 0, background: "#060d1f" }} />
        {/* dot grid - sparse, fast */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          {Array.from({length:60},(_,i)=>{
            const x=i*18+4, y=i%2===0?10:32;
            return <circle key={i} cx={x} cy={y} r=".9" fill="#B8C4D8" fillOpacity={.08+.04*(i%3)}/>;
          })}
          <radialGradient id="bsGold" cx="15%" cy="50%" r="40%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity=".08"/>
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0"/>
          </radialGradient>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#bsGold)"/>
        </svg>
        {/* right geometric accent */}
        <svg style={{ position: "absolute", right: 0, top: 0, height: "100%", width: 180, opacity: .6 }} viewBox="0 0 180 48" xmlns="http://www.w3.org/2000/svg">
          <circle cx="140" cy="24" r="36" fill="none" stroke="#FFD700" strokeWidth=".5" strokeOpacity=".08"/>
          <circle cx="140" cy="24" r="20" fill="none" stroke="#FFD700" strokeWidth=".5" strokeOpacity=".12"/>
          <polygon points="140,14 142,21 149,21 143.5,25.5 145.5,32.5 140,28.5 134.5,32.5 136.5,25.5 131,21 138,21" fill="#FFD700" fillOpacity=".5"/>
          {[[95,8],[165,6],[172,38],[108,44]].map(([x,y],i)=>(
            <circle key={i} cx={x} cy={y} r=".7" fill="#fff" fillOpacity=".18"/>
          ))}
        </svg>
        {/* content */}
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", alignItems: "center", padding: "0 20px", gap: 14 }}>
          <Logo size="sm" dark={true} />
          <div style={{ width: 1, height: 16, background: "rgba(255,215,0,.25)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>连接每个家庭&nbsp;<span style={{ color: C.yellow }}>·</span>&nbsp;共享全球资源</span>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,.1)" }} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)", letterSpacing: 1, fontStyle: "italic" as const }}>IPFS Distributed Network</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: C.green, background: "rgba(67,160,71,.15)", borderRadius: 99, padding: "2px 8px" }}>● 网络正常</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,.3)", background: "rgba(255,255,255,.05)", borderRadius: 99, padding: "2px 8px" }}>在线节点 8,420</span>
          </div>
        </div>
      </div>

      {/* ══ Settlement ticker + Announcements ══ */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>

        {/* Settlement ticker — reference bottom-left scrolling style */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <SectionTitle>收益结算通知</SectionTitle>
            <span style={{ fontSize: 9, color: C.green, fontWeight: 700 }}>● 每小时结算</span>
          </div>
          <div style={{ background: "#1C1C2E", borderRadius: 10, overflow: "hidden", height: 170, position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 30, background: "linear-gradient(to bottom,#1C1C2E,transparent)", zIndex: 2, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 30, background: "linear-gradient(to top,#1C1C2E,transparent)", zIndex: 2, pointerEvents: "none" }} />
            <div className="settle-track" style={{ padding: "8px 0" }}>
              {settleDoubled.map((item, i) => (
                item.kind === "settle" ? (
                  <div key={i} style={{ padding: "5px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", fontFamily: F.mono, marginBottom: 1 }}>{item.time}</div>
                      <div style={{ fontSize: 11, color: "#e2e8f0", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.terminal} · {item.task}
                      </div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,.35)", marginTop: 1 }}>每小时收益 <span style={{ color: C.yellow, fontFamily: F.mono, fontWeight: 700 }}>{item.pph} 积分/h</span></div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: "right" as const }}>
                      <div style={{ fontWeight: 900, fontSize: 12, color: C.yellow, fontFamily: F.mono }}>+{item.pts}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)" }}>积分</div>
                    </div>
                  </div>
                ) : (
                  <div key={i} style={{ padding: "5px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,.05)", background: "rgba(255,215,0,.03)" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFD700", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", fontFamily: F.mono, marginBottom: 1 }}>{item.time}</div>
                      <div style={{ fontSize: 11, color: "#FFD700", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.user} · {item.event}
                      </div>
                      <div style={{ fontSize: 9, color: "rgba(255,215,0,.6)", marginTop: 1 }}>{item.extra}</div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <span style={{ fontSize: 9, color: "#FFD700", fontWeight: 700, padding: "1px 6px", borderRadius: 4, border: "1px solid rgba(255,215,0,.3)" }}>活动</span>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 6 }}><SectionTitle>最新通知</SectionTitle></div>
          <Card style={{ height: 170, overflowY: "auto" }}>
            {announcements.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", paddingBottom: 9, marginBottom: 9, borderBottom: i < announcements.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <Badge color={typeColor(a.type)}>{a.type}</Badge>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5, marginBottom: 1 }}>{a.title}</div>
                  <div style={{ fontSize: 9, color: C.muted }}>{a.time}</div>
                </div>
                {a.hot && <span style={{ flexShrink: 0, fontSize: 9, background: C.red, color: "#fff", padding: "1px 6px", borderRadius: 99, fontWeight: 700 }}>热</span>}
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* ══ Device Slots (激活 / 到期 — 低频操作) ══ */}
      <div style={{ marginTop: 8, marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <SectionTitle>终端设备管理</SectionTitle>
          <span style={{ fontSize: 10, color: C.muted }}>（激活绑定 · 续期）</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[0, 1, 2, 3].map((idx) => renderSlot(idx))}
        </div>
      </div>

      {/* ══ VIP Modal ══ */}
      {vipModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => { if (payStep !== "pay") setVipModal(false); }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 520, borderRadius: 16, background: "#fff", boxShadow: "0 24px 64px rgba(0,0,0,.2)", overflow: "hidden", animation: "pop-in .22s ease" }}>
            <div style={{ background: "linear-gradient(120deg,#1C1C2E,#3a0a5e)", padding: "22px 28px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>👑</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>开通 VIP 会员</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 2 }}>解锁自动接单 · 优先通道 · 全部任务类型</div>
              </div>
              <button onClick={() => setVipModal(false)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "rgba(255,255,255,.4)", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "22px 28px" }}>
              {payStep === "select" && (<>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
                  {VIP_PLANS.map((p) => (
                    <div key={p.id} onClick={() => setSelectedPlan(p.id)}
                      style={{ borderRadius: 10, border: `2px solid ${selectedPlan === p.id ? p.color : C.border}`, padding: "14px 12px", cursor: "pointer", position: "relative", background: selectedPlan === p.id ? p.color + "08" : "#fff" }}>
                      {p.popular && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: C.orange, color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 10px", borderRadius: 99, whiteSpace: "nowrap" }}>最多人选</div>}
                      <div style={{ fontSize: 10, color: p.color, fontWeight: 700, marginBottom: 4 }}>{p.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: p.color, fontFamily: F.mono }}>{p.price}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginBottom: 6 }}>{p.period}</div>
                      <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.5 }}>{p.desc}</div>
                      {selectedPlan === p.id && <div style={{ position: "absolute", top: 8, right: 8, width: 16, height: 16, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 800 }}>✓</div>}
                    </div>
                  ))}
                </div>
                <div style={{ background: "#F8F8FF", borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 14px" }}>
                  {["自动接单（多终端）", "任务优先分配", "解锁全部任务类型", "积分加成 +5%"].map((b) => (
                    <div key={b} style={{ fontSize: 12, color: C.text, display: "flex", alignItems: "center", gap: 5 }}><span style={{ color: C.green }}>{Ic.check}</span>{b}</div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  {(["alipay", "wechat"] as const).map((m) => (
                    <button key={m} onClick={() => setPayMethod(m)}
                      style={{ flex: 1, padding: "9px", borderRadius: 8, border: `2px solid ${payMethod === m ? C.blue : C.border}`, background: payMethod === m ? "#E3F2FD" : "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, color: payMethod === m ? C.blue : C.muted }}>
                      {m === "alipay" ? "支付宝" : "微信支付"}
                    </button>
                  ))}
                </div>
                <button onClick={doPay} style={{ width: "100%", padding: "13px", borderRadius: 9, border: "none", background: "linear-gradient(90deg,#1C1C2E,#2d3a5c)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: F.cn }}>
                  立即支付 {VIP_PLANS.find(p => p.id === selectedPlan)?.price}
                </button>
              </>)}
              {payStep === "pay" && <div style={{ textAlign: "center", padding: "32px 0" }}><div style={{ color: C.muted, display: "flex", justifyContent: "center", marginBottom: 12 }}>{Ic.clock}</div><div style={{ fontWeight: 700, marginTop: 4 }}>正在拉起支付...</div></div>}
              {payStep === "done" && <div style={{ textAlign: "center", padding: "32px 0" }}><div style={{ color: C.green, display: "flex", justifyContent: "center", marginBottom: 12 }}>{Ic.party}</div><div style={{ fontWeight: 900, fontSize: 16, color: C.green, marginTop: 4 }}>VIP 开通成功！</div></div>}
            </div>
          </div>
        </div>
      )}

      {/* ══ Renew Modal ══ */}
      {renewSlotIdx !== null && (() => {
        const renewSlot = slots[renewSlotIdx];
        const currentExpiry = renewSlot?.expiry ?? "";
        const newExpiry = (() => {
          const d = new Date(currentExpiry);
          d.setFullYear(d.getFullYear() + 1);
          return d.toISOString().slice(0, 10);
        })();
        return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => { if (renewStep !== "checking") { setRenewSlotIdx(null); setRenewCode(""); setRenewStep("idle"); } }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 420, borderRadius: 14, background: "#fff", boxShadow: "0 24px 64px rgba(0,0,0,.2)", overflow: "hidden" }}>
            <div style={{ background: `linear-gradient(120deg,${C.dark},#162040)`, padding: "18px 22px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 800, color: "#fff", fontSize: 15 }}>终端续期</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginLeft: 4 }}>输入新卡密延长授权一年</div>
              <button onClick={() => { setRenewSlotIdx(null); setRenewCode(""); setRenewStep("idle"); }}
                style={{ marginLeft: "auto", background: "transparent", border: "none", color: "rgba(255,255,255,.4)", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "22px 24px" }}>
              {renewStep === "ok" ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>✓</div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: C.green, marginBottom: 6 }}>续期成功！</div>
                  <div style={{ fontSize: 13, color: C.muted }}>终端授权已延长至 <strong style={{ color: C.green }}>{newExpiry}</strong></div>
                </div>
              ) : (<>
                {/* Date range display */}
                <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 16, background: "#F8F9FB", borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}` }}>
                  <div style={{ flex: 1, padding: "12px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>当前到期日</div>
                    <div style={{ fontSize: 15, fontWeight: 900, fontFamily: F.mono, color: currentExpiry < new Date().toISOString().slice(0,10) ? C.red : C.orange }}>{currentExpiry || "—"}</div>
                  </div>
                  <div style={{ padding: "0 8px", color: C.muted, fontSize: 18, fontWeight: 300 }}>→</div>
                  <div style={{ flex: 1, padding: "12px 16px", textAlign: "center", background: "#F0FDF4" }}>
                    <div style={{ fontSize: 10, color: C.green, marginBottom: 4 }}>续期后到期日</div>
                    <div style={{ fontSize: 15, fontWeight: 900, fontFamily: F.mono, color: C.green }}>{newExpiry}</div>
                  </div>
                </div>
                <div style={{ padding: "8px 12px", background: "#FFFDE7", borderRadius: 8, fontSize: 12, color: "#92400E", marginBottom: 16, lineHeight: 1.7 }}>
                  续期卡密需与原终端机器码绑定，每张卡密激活后延长授权 <strong>1 年</strong>。请确保卡密未被使用过。
                </div>
                <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 8 }}>新激活卡密</label>
                <input value={renewCode} onChange={e => { setRenewCode(e.target.value); setRenewStep("idle"); }}
                  placeholder="输入卡密（如 XXXX-XXXX-XXXX-XXXX）"
                  style={{ width: "100%", boxSizing: "border-box" as const, padding: "11px 14px", border: `1.5px solid ${renewStep === "error" ? C.red : C.border}`, borderRadius: 8, fontSize: 13, fontFamily: F.mono, outline: "none", marginBottom: 6 }}
                  onFocus={e => e.target.style.borderColor = C.yellow} onBlur={e => e.target.style.borderColor = renewStep === "error" ? C.red : C.border} />
                {renewStep === "error" && <div style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>卡密无效或已被使用，请检查后重试</div>}
                {renewStep === "checking" && <div style={{ fontSize: 12, color: C.blue, marginBottom: 10 }}>正在联网验证卡密...</div>}
                <button onClick={doRenew} disabled={renewStep === "checking" || !renewCode.trim()}
                  style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: renewCode.trim() && renewStep !== "checking" ? C.yellow : "#E0E0E0", color: renewCode.trim() && renewStep !== "checking" ? C.dark : C.muted, fontWeight: 800, fontSize: 14, cursor: renewCode.trim() && renewStep !== "checking" ? "pointer" : "not-allowed", fontFamily: F.cn }}>
                  {renewStep === "checking" ? "验证中..." : "确认续期"}
                </button>
              </>)}
            </div>
          </div>
        </div>
        );
      })()}

      {/* ══ Activation Modal ══ */}
      {activateSlotIdx !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => { if (activating !== "checking") setActivateSlotIdx(null); }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 480, borderRadius: 14, background: "#fff", boxShadow: "0 24px 64px rgba(0,0,0,.22)", overflow: "hidden", animation: "pop-in .2s ease" }}>
            <div style={{ background: `linear-gradient(120deg,${C.dark},#162040)`, padding: "18px 22px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "rgba(255,255,255,.7)", display: "flex" }}>{Ic.key}</span>
              <div>
                <div style={{ fontWeight: 800, color: "#fff", fontSize: 15 }}>激活绑定 · 槽位 {activateSlotIdx + 1}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginTop: 2 }}>输入激活卡密，绑定本机设备号</div>
              </div>
              <button onClick={() => setActivateSlotIdx(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "rgba(255,255,255,.4)", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "22px 24px" }}>
              {activating !== "ok" && (<>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 5 }}>激活卡密</div>
                  <input value={cardCode} onChange={(e) => { setCardCode(e.target.value); setActivating("idle"); setActivateMsg(""); }}
                    placeholder="例：C3J8Z9-XMPL-K2Q7-NPFT"
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${activating === "error" ? C.red : C.yellow}`, borderRadius: 7, fontSize: 13, fontFamily: F.mono, outline: "none", boxSizing: "border-box", letterSpacing: 1 }}
                    onFocus={(e) => (e.target.style.borderColor = C.yellow)}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 5 }}>当前设备机器码（自动读取）</div>
                  <input value={hwid} readOnly style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, fontFamily: F.mono, outline: "none", background: "#F5F5F5", color: C.muted, boxSizing: "border-box", letterSpacing: .5 }} />
                </div>
                {activateMsg && (
                  <div style={{ padding: "8px 12px", borderRadius: 6, marginBottom: 12, fontSize: 12, background: activating === "error" ? "#FFEBEE" : "#E3F2FD", color: activating === "error" ? C.red : C.blue }}>
                    {activating === "error" ? "✗ " : "ℹ "}{activateMsg}
                  </div>
                )}
                <div style={{ background: "#FFFDE7", borderRadius: 7, padding: "8px 12px", fontSize: 13, color: "#8D4E00", lineHeight: 1.7, marginBottom: 16 }}>
                  <span style={{ display: "flex", alignItems: "flex-start", gap: 6 }}><span style={{ color: "#D97706", flexShrink: 0, marginTop: 1 }}>{Ic.warnSm}</span>卡密一旦绑定此设备号即生效，每张卡密激活1年·1台终端。若卡密无效将提示原因。</span>
                </div>
                <button onClick={doActivate} disabled={activating === "checking" || !cardCode.trim()}
                  style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: activating === "checking" ? "#E0E0E0" : cardCode.trim() ? C.yellow : "#E0E0E0", color: activating === "checking" || !cardCode.trim() ? C.muted : C.dark, fontWeight: 800, fontSize: 14, cursor: cardCode.trim() && activating !== "checking" ? "pointer" : "not-allowed", fontFamily: F.cn }}>
                  {activating === "checking" ? "正在联网验证卡密..." : "验证并绑定设备"}
                </button>
              </>)}

              {activating === "ok" && (
                <div style={{ textAlign: "center", padding: "28px 0" }}>
                  <div style={{ color: C.green, display: "flex", justifyContent: "center", marginBottom: 10 }}>{Ic.checkLg}</div>
                  <div style={{ fontWeight: 900, fontSize: 16, color: C.green, marginBottom: 6 }}>激活成功！</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{activateMsg}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MERCHANT — PAGE 2: ORDER CENTER
══════════════════════════════════════════════════════════════ */

type TerminalStatus = "running" | "stopped" | "offline" | "error";
/* ── terminal definitions (mirrors homepage device slots) ── */
const TERMINALS: { id: number; hwid: string; os: string; code: string; online: boolean; expiry: string; level: string; status: TerminalStatus; cpu: number; mem: number; uptime: string; lastSeen: string }[] = [
  { id: 1, hwid: "HWID-A7F3-2K9X-B4M1", os: "Windows 11 Home", code: "C3J8Z9...", online: true,  expiry: "2027-08-30", level: "老用户", status: "running", cpu: 34, mem: 58, uptime: "12天 4小时",   lastSeen: "刚刚"      },
  { id: 2, hwid: "HWID-B2R9-5ZPQ-C7N3", os: "Windows 10 Pro",  code: "A9K2M5...", online: false, expiry: "2027-07-15", level: "中级",   status: "stopped", cpu: 0,  mem: 0,  uptime: "—",           lastSeen: "3小时前"   },
  { id: 3, hwid: "HWID-F9KX-3QMP-D1W7", os: "Windows 11 Pro",  code: "C8R2Z7...", online: false, expiry: "2027-08-30", level: "新手",   status: "error",   cpu: 0,  mem: 0,  uptime: "—",           lastSeen: "昨天 14:32"},
];

function tagColor(tag: string) {
  if (tag === "热门") return C.orange;
  if (tag === "零延迟") return C.green;
  if (tag === "高价") return "#1C1C2E";
  if (tag === "补贴") return C.blue;
  if (tag === "新手") return C.blue;
  return C.muted;
}

const MAX_ORDERS = 30;

function MerchantOrders() {
  const [termIdx, setTermIdx] = useState(0);
  const [tab, setTab]         = useState<OrderTab>("grab");
  /* per-terminal grabbed sets */
  const [allGrabbed, setAllGrabbed] = useState<[Set<string>, Set<string>, Set<string>]>([new Set(), new Set(), new Set()]);
  const [search, setSearch]   = useState("");
  /* terminal controls */
  const [autoGrab, setAutoGrab] = useState<boolean[]>([true, true, true]);

  /* pagination */
  const [grabPage,   setGrabPage]   = useState(1);
  const [acceptPage, setAcceptPage] = useState(1);
  const [donePage, setDonePage]     = useState(1);
  const [pageSize, setPageSize]     = useState(20);
  /* withdrawal modal */
  const [withdrawTask, setWithdrawTask] = useState<AcceptedTask | null>(null);
  const [withdrawStep, setWithdrawStep] = useState<"confirm"|"processing"|"done">("confirm");
  const [pointsBalance, setPointsBalance] = useState(218120);
  const MIN_WITHDRAW = 1000;
  const now = new Date();
  const todayDay = now.getDate();
  const todayHour = now.getHours();
  // Simulated: treat current session as an open withdrawal window (1st/15th 10:00–15:00)
  const isWithdrawDay = true;

  const openWithdraw = (t: AcceptedTask) => { setWithdrawTask(t); setWithdrawStep("confirm"); };
  const doWithdraw   = () => {
    setWithdrawStep("processing");
    setTimeout(() => {
      if (withdrawTask) setPointsBalance((b) => Math.max(0, b - withdrawTask.settled));
      setWithdrawStep("done");
    }, 1800);
  };

  const term       = TERMINALS[termIdx];
  const grabbed    = allGrabbed[termIdx];
  const grabCount  = grabbed.size;

  const toggleGrab = (id: string) => {
    const next = allGrabbed.map((s, i) => {
      if (i !== termIdx) return s;
      const ns = new Set(s);
      if (ns.has(id)) ns.delete(id); else if (ns.size < MAX_ORDERS) ns.add(id);
      return ns;
    }) as [Set<string>, Set<string>, Set<string>];
    setAllGrabbed(next);
  };

  const acceptList = TERMINAL_ACCEPTED[termIdx];
  const [doneLists, setDoneLists] = useState<DoneTask[][]>(TERMINAL_DONE.map(arr => [...arr]));
  const doneList   = doneLists[termIdx];
  const markDoneWithdrawn = (id: string) => {
    setDoneLists(prev => prev.map((arr, i) => i !== termIdx ? arr : arr.map(t => t.id === id ? { ...t, withdrawn: true } : t)));
  };
  const [doneWithdrawTask, setDoneWithdrawTask] = useState<DoneTask | null>(null);
  const [doneWithdrawStep, setDoneWithdrawStep] = useState<"confirm"|"processing"|"done">("confirm");
  const openDoneWithdraw = (t: DoneTask) => { setDoneWithdrawTask(t); setDoneWithdrawStep("confirm"); };
  const doDoneWithdraw = () => {
    setDoneWithdrawStep("processing");
    setTimeout(() => {
      if (doneWithdrawTask) { setPointsBalance(b => Math.max(0, b - doneWithdrawTask.settled)); markDoneWithdrawn(doneWithdrawTask.id); }
      setDoneWithdrawStep("done");
    }, 1800);
  };

  const tabCfg: { key: OrderTab; label: string; count: number }[] = [
    { key: "grab",     label: "抢单任务",   count: TASK_POOL.length              },
    { key: "accepted", label: "已接任务",   count: TERMINAL_ACCEPTED[termIdx].length },
    { key: "done",     label: "已完成任务", count: TERMINAL_DONE[termIdx].length     },
  ];

  /* ring progress */
  const ringR = 18, ringC = 22, ringStroke = 4;
  const circumference = 2 * Math.PI * ringR;
  const ringPct = grabCount / MAX_ORDERS;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: F.cn, fontSize: 14, color: "#111827" }}>

      {/* ══ Terminal list — vertical cards, click to switch ══ */}
      <div style={{ padding: "10px 20px 0", background: C.bg }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {TERMINALS.map((t, i) => {
            const cnt           = allGrabbed[i].size;
            const pct           = cnt / MAX_ORDERS;
            const isActive      = i === termIdx;
            const acceptedTasks = TERMINAL_ACCEPTED[i];
            const doneTasks     = TERMINAL_DONE[i];
            const pendingPts    = acceptedTasks.reduce((s, r) => s + r.pending, 0);
            const settledPts    = doneTasks.reduce((s, r) => s + r.settled, 0);
            const stColor       = t.status === "running" ? C.green : t.status === "error" ? C.red : C.muted;
            const stLabel       = t.status === "running" ? "● 运行中" : t.status === "stopped" ? "○ 已停机" : "✕ 异常";
            return (
              <div key={t.id}
                onClick={() => { setTermIdx(i); setSearch(""); setGrabPage(1); setAcceptPage(1); setDonePage(1); }}
                style={{
                  flex: 1, padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                  border: `2px solid ${isActive ? C.yellow : t.status === "error" ? C.red + "55" : C.border}`,
                  background: isActive ? "#FFFBEA" : t.status === "error" ? "#FFF5F5" : "#fff",
                  boxShadow: isActive ? `0 2px 10px ${C.yellow}33` : "0 1px 3px rgba(0,0,0,.05)",
                  transition: "border-color .15s, background .15s",
                }}>

                {/* row 1: name + status */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: isActive ? C.dark : "#374151" }}>终端 {t.id}</span>
                  <Badge color={t.level === "老用户" ? C.orange : t.level === "中级" ? "#374151" : C.green}>{t.level}</Badge>
                  <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: stColor }}>{stLabel}</span>
                </div>

                {/* row 2: OS */}
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{t.os}</div>

                {/* row 3: CPU/MEM or error msg */}
                {t.status === "running" ? (
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    {[{ label: "CPU", val: t.cpu }, { label: "MEM", val: t.mem }].map(({ label, val }) => (
                      <div key={label} style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.muted, marginBottom: 2 }}>
                          <span>{label}</span>
                          <span style={{ fontFamily: F.mono, fontWeight: 700, color: val > 80 ? C.red : val > 60 ? C.orange : C.green }}>{val}%</span>
                        </div>
                        <div style={{ height: 3, borderRadius: 99, background: "#EBEBEB", overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 99, width: `${val}%`, background: val > 80 ? C.red : val > 60 ? C.orange : C.green }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 10, color: t.status === "error" ? C.red : C.muted, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                    {t.status === "error" && Ic.warnSm}
                    {t.status === "error" ? "客户端异常，请检查网络" : "终端已手动停机"}
                  </div>
                )}

                {/* row 4: orders progress */}
                <div style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.muted, marginBottom: 2 }}>
                    <span>已接订单</span>
                    <span style={{ fontFamily: F.mono, fontWeight: 800, color: pct >= 1 ? C.green : isActive ? C.orange : C.muted }}>{cnt} / {MAX_ORDERS}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: "#EBEBEB", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 99, width: `${pct * 100}%`, background: pct >= 1 ? C.green : isActive ? C.yellow : "#BDBDBD" }} />
                  </div>
                </div>

                {/* row 5: settled + pending */}
                <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                  <div style={{ flex: 1, background: "#F0FDF4", borderRadius: 5, padding: "3px 6px", border: "1px solid #BBF7D0" }}>
                    <div style={{ fontSize: 8, color: "#166534" }}>已结算</div>
                    <div style={{ fontSize: 11, fontWeight: 900, fontFamily: F.mono, color: C.green }}>{settledPts.toLocaleString()}</div>
                  </div>
                  <div style={{ flex: 1, background: "#FFF7ED", borderRadius: 5, padding: "3px 6px", border: "1px solid #FED7AA" }}>
                    <div style={{ fontSize: 8, color: "#92400E" }}>待结算</div>
                    <div style={{ fontSize: 11, fontWeight: 900, fontFamily: F.mono, color: C.orange }}>{pendingPts.toLocaleString()}</div>
                  </div>
                </div>

                {/* row 6: auto-grab toggle */}
                <div style={{ padding: "5px 8px", borderRadius: 6, background: autoGrab[i] ? "rgba(67,160,71,.07)" : "#F3F4F6", border: `1px solid ${autoGrab[i] ? "rgba(67,160,71,.2)" : "#E5E7EB"}`, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                  onClick={e => { e.stopPropagation(); setAutoGrab(prev => prev.map((v, j) => j === i ? !v : v)); }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: autoGrab[i] ? C.green : "#9CA3AF" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: autoGrab[i] ? "#1B5E20" : C.muted }}>自动抢单</span>
                  </div>
                  <div style={{ width: 34, height: 18, borderRadius: 9, background: autoGrab[i] ? C.green : "#D1D5DB", position: "relative", transition: "background .2s", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 2, left: autoGrab[i] ? 17 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left .2s cubic-bezier(.34,1.56,.64,1)" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Sub-tab bar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, borderBottom: `2px solid ${C.border}`, paddingBottom: 0 }}>
          {tabCfg.map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); setGrabPage(1); setAcceptPage(1); setDonePage(1); }} style={{
              padding: "8px 20px", border: "none", cursor: "pointer", background: "transparent",
              fontWeight: 700, fontSize: 13, fontFamily: F.cn,
              color: tab === t.key ? C.dark : C.muted,
              borderBottom: tab === t.key ? `2px solid ${C.yellow}` : "2px solid transparent",
              marginBottom: -2,
            }}>
              {t.label}
              <span style={{ marginLeft: 5, background: tab === t.key ? C.yellow + "44" : "#E8E8E8", borderRadius: 99, padding: "1px 6px", fontSize: 10, fontWeight: 700, color: tab === t.key ? C.dark : C.muted }}>
                {t.count}
              </span>
            </button>
          ))}
          {tab === "grab" && (
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, paddingBottom: 6 }}>
              <span style={{ fontSize: 13, color: C.muted }}>
                当前终端已接 <strong style={{ color: grabCount >= MAX_ORDERS ? C.green : C.orange }}>{grabCount}</strong> / {MAX_ORDERS}
              </span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索域名 / 类型..." style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, outline: "none", width: 160 }} />
            </div>
          )}
        </div>
      </div>

      {/* ══ Content area ══ */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>

        {/* GRAB TAB */}
        {tab === "grab" && (() => {
          const filteredPool = TASK_POOL.filter(
            (t) => maskDomain(t.domain).includes(search) || t.purpose.includes(search) || t.id.slice(-8).includes(search)
          );
          const grabTotalPages = Math.max(1, Math.ceil(filteredPool.length / pageSize));
          const grabPageData = filteredPool.slice((grabPage - 1) * pageSize, grabPage * pageSize);
          return (
            <div>

              {/* table */}
              <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#F7F8FA", borderBottom: `2px solid ${C.border}` }}>
                      {["订单编号", "发布公司", "用途", "租赁时长(时)", "客户出价(积分)", "延迟率", "订单状态", "操作"].map((h, hi) => (
                        <th key={h} style={{
                          padding: "10px 12px", fontWeight: 700, color: "#555", fontSize: 13,
                          textAlign: hi >= 3 && hi <= 6 ? "center" : "left",
                          whiteSpace: "nowrap", letterSpacing: .2,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPool.length === 0 && (
                      <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: C.muted }}>暂无匹配任务</td></tr>
                    )}
                    {grabPageData.map((t, i) => {
                      const isGrabbed = grabbed.has(t.id);
                      const refundNum = parseFloat(t.refund);
                      return (
                        <tr key={t.id} style={{ background: isGrabbed ? "#FFFEF2" : i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: `1px solid #E8E8E8` }}>
                          <td style={{ padding: "8px 12px", fontFamily: F.mono, fontSize: 13, color: "#888" }}>{t.id}</td>
                          <td style={{ padding: "8px 12px" }}>
                            <span style={{ fontWeight: 800, fontSize: 13, color: C.dark, fontFamily: F.mono, letterSpacing: .5 }}>{maskDomain(t.domain)}</span>
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 12, color: C.text }}>{t.purpose}</span>
                              {t.tags.length > 0 && t.tags.map((tag) => <Badge key={tag} color={tagColor(tag)}>{tag}</Badge>)}
                            </div>
                          </td>
                          <td style={{ padding: "8px 12px", textAlign: "center", fontFamily: F.mono, fontWeight: 700 }}>{t.hours}</td>
                          <td style={{ padding: "8px 12px", textAlign: "center" }}>
                            <span style={{ fontWeight: 900, color: C.orange, fontFamily: F.mono, fontSize: 13 }}>{t.pts.toLocaleString()}</span>
                          </td>
                          <td style={{ padding: "8px 12px", textAlign: "center" }}>
                            <span style={{ fontWeight: 700, color: refundNum === 0 ? C.green : refundNum > 5 ? C.red : C.orange }}>{t.refund}</span>
                          </td>
                          <td style={{ padding: "8px 12px", textAlign: "center" }}>
                            <span style={{ fontWeight: 600, color: isGrabbed ? C.green : "#555" }}>{isGrabbed ? "已接单" : "未接单"}</span>
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            <button onClick={() => toggleGrab(t.id)}
                              style={{
                                padding: "4px 18px", borderRadius: 4, border: "none", cursor: "pointer",
                                background: isGrabbed ? "#E8F5E9" : C.yellow,
                                color: isGrabbed ? C.green : C.dark,
                                fontWeight: 700, fontSize: 12, fontFamily: F.cn, whiteSpace: "nowrap",
                              }}>
                              {isGrabbed ? "取消接单" : "抢单"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* pagination footer */}
                <div style={{ padding: "9px 14px", background: "#F5F5F5", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: C.muted }}>共 {filteredPool.length} 条</span>
                  <span style={{ fontSize: 12, color: C.muted }}>每页</span>
                  <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setGrabPage(1); setAcceptPage(1); setDonePage(1); }}
                    style={{ padding: "2px 6px", border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 12, outline: "none" }}>
                    {[20, 50, 100].map(n => <option key={n} value={n}>{n} 条</option>)}
                  </select>
                  <span style={{ fontSize: 12, color: C.muted }}>第 {grabPage}/{grabTotalPages} 页</span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                    {([["«", 1], ["‹", grabPage - 1], ["›", grabPage + 1], ["»", grabTotalPages]] as [string, number][]).map(([lbl, pg]) => {
                      const disabled = (lbl === "«" || lbl === "‹") ? grabPage === 1 : grabPage === grabTotalPages;
                      return (
                        <button key={lbl} onClick={() => !disabled && setGrabPage(Math.max(1, Math.min(grabTotalPages, pg)))} disabled={disabled}
                          style={{ width: 28, height: 28, borderRadius: 5, border: `1px solid ${C.border}`, background: disabled ? "#F0F0F0" : "#fff", color: disabled ? "#CCC" : C.text, fontSize: 12, cursor: disabled ? "default" : "pointer", fontWeight: 600 }}>
                          {lbl}
                        </button>
                      );
                    })}
                  </div>
                  <span style={{ fontSize: 11, color: C.red, fontStyle: "italic" }}>*选中列表右键可弹出菜单</span>
                </div>
              </div>

              {/* restriction checkboxes — reference style */}
              <div style={{ display: "flex", gap: 32, marginTop: 14, padding: "6px 4px" }}>
                {["禁止用户远程下载", "禁止用户使用QQ、微信、飞机等聊天工具", "禁止用户占用计算机算力"].map((txt) => (
                  <label key={txt} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.text, cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: C.dark, width: 13, height: 13 }} />
                    {txt}
                  </label>
                ))}
              </div>

              {/* warning notices — reference red text, centered */}
              <div style={{ marginTop: 20, textAlign: "center", lineHeight: 2.4 }}>
                <div style={{ fontSize: 13, color: "#333" }}>温馨提示：客户延迟率是根据历史订单客户延迟率所统计</div>
                <div style={{ fontSize: 13, color: C.red, fontWeight: 500 }}>接单成功后合同立即生效，无论客户是否使用，都不影响计费。</div>
<div style={{ fontSize: 14, color: C.red, fontWeight: 700 }}>如果客户主动申请退款，仍需支付该订单产生的收益（您如果长时间不在线、违约除外）</div>
              </div>
            </div>
          );
        })()}

        {/* ACCEPTED TAB */}
        {tab === "accepted" && (() => {
          /* sort: unsettled (settled > 0, not yet withdrawn) first, then rest */
          const sortedList = [...acceptList].sort((a, b) => (b.settled > 0 ? 1 : 0) - (a.settled > 0 ? 1 : 0));
          const totalPages = Math.ceil(sortedList.length / pageSize);
          const pageData   = sortedList.slice((acceptPage - 1) * pageSize, acceptPage * pageSize);
          const progressColor = (p: number) => p === 100 ? C.green : p >= 80 ? C.blue : p >= 40 ? C.orange : C.muted;
          const totalUnwithdrawn = acceptList.reduce((s, t) => s + t.settled, 0);
          const unwithdrawnCount = acceptList.filter(t => t.settled > 0).length;

          const PowerBadge = ({ status }: { status: PowerStatus }) => {
            const cfg = status === "online"
              ? { label: "在线", bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0", dot: "#22C55E" }
              : status === "offline"
              ? { label: "断线", bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", dot: "#F59E0B" }
              : { label: "断电", bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", dot: "#EF4444" };
            return (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 99, background: cfg.bg, border: `1px solid ${cfg.border}`, fontSize: 10, fontWeight: 700, color: cfg.color, whiteSpace: "nowrap" as const }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }}/>
                {cfg.label}
              </span>
            );
          };

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Top info bar: settlement window + unwithdrawn balance */}
              <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                <div style={{ flex: 1, padding: "9px 14px", borderRadius: 8, background: isWithdrawDay ? "#F0FDF4" : "#FFFBEB", border: `1px solid ${isWithdrawDay ? "#BBF7D0" : "#FDE68A"}`, fontSize: 12, color: isWithdrawDay ? "#16A34A" : "#92400E", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{isWithdrawDay ? "✓" : "⏰"}</span>
                  <span>{isWithdrawDay ? `提现窗口开放中（10:00–15:00），满 ${MIN_WITHDRAW} 积分即可点击【提现】结算。` : "提现仅限每月 1 日和 15 日上午 10:00 至下午 15:00，窗口外按钮不可点击。"}</span>
                </div>
                {/* Unwithdrawn balance pill */}
                <div style={{ padding: "9px 16px", borderRadius: 8, background: totalUnwithdrawn > 0 ? "#FFF7ED" : "#F9FAFB", border: `1px solid ${totalUnwithdrawn > 0 ? "#FED7AA" : C.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <div>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 1 }}>未提现积分余额</div>
                    <div style={{ fontSize: 16, fontWeight: 900, fontFamily: F.mono, color: totalUnwithdrawn > 0 ? C.orange : C.muted, letterSpacing: -0.5 }}>{totalUnwithdrawn.toLocaleString()}</div>
                  </div>
                  {unwithdrawnCount > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "#FFEDD5", color: C.orange, border: "1px solid #FED7AA" }}>{unwithdrawnCount} 单</span>
                  )}
                </div>
              </div>

              {/* Table */}
              <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
                {sortedList.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: C.muted, fontSize: 13 }}>终端 {term.id} 暂无进行中任务</div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "#F7F8FA" }}>
                        {["#", "订单编号", "海外商家", "类型", "总时长", "已完成", "剩余", "待结算积分", "已结算积分", "已提现积分", "延迟率", "断线断电", "扣除积分", "进度"].map((h, hi) => (
                          <th key={h} style={{ padding: "9px 10px", fontWeight: 700, color: hi >= 9 && hi <= 11 ? C.red : "#9AA3B0", fontSize: 13, textAlign: hi >= 4 ? "center" : "left", borderBottom: `1.5px solid ${C.border}`, whiteSpace: "nowrap", letterSpacing: .3 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.map((t, i) => {
                        const refundNum = parseFloat(t.refund);
                        const sc = progressColor(t.progress);
                        const rowNum = (acceptPage - 1) * pageSize + i + 1;
                        const canWithdraw = isWithdrawDay && t.settled >= MIN_WITHDRAW;
                        const isUnwithdrawn = t.settled > 0;
                        return (
                          <tr key={t.id} style={{ background: isUnwithdrawn ? "#FFFEF7" : i % 2 === 0 ? "#fff" : "#FAFBFC", borderBottom: `1px solid ${C.border}`, borderLeft: isUnwithdrawn ? `3px solid ${C.orange}` : "3px solid transparent" }}>
                            <td style={{ padding: "7px 10px", color: "#BDBDBD", fontSize: 12, fontFamily: F.mono }}>{String(rowNum).padStart(2,"0")}</td>
                            <td style={{ padding: "7px 10px", fontFamily: F.mono, fontSize: 12, color: "#BDBDBD" }}>{t.id.slice(-8)}</td>
                            <td style={{ padding: "7px 10px" }}>
                              <span style={{ fontWeight: 800, fontSize: 12, color: C.dark, fontFamily: F.mono }}>{maskDomain(t.domain)}</span>
                            </td>
                            <td style={{ padding: "7px 10px" }}>
                              <span style={{ fontSize: 10, background: "#F0F0F5", borderRadius: 4, padding: "1px 5px", fontWeight: 700, color: C.muted }}>{t.type}</span>
                            </td>
                            <td style={{ padding: "7px 10px", textAlign: "center", fontFamily: F.mono, fontWeight: 700, color: C.text }}>{t.hours}</td>
                            <td style={{ padding: "7px 10px", textAlign: "center", fontFamily: F.mono, fontWeight: 700, color: C.green }}>{t.done}h</td>
                            <td style={{ padding: "7px 10px", textAlign: "center", fontFamily: F.mono, fontWeight: 700, color: t.remaining === 0 ? C.green : C.muted }}>{t.remaining === 0 ? "✓" : `${t.remaining}h`}</td>
                            <td style={{ padding: "7px 10px", textAlign: "center", fontFamily: F.mono, fontWeight: 800, color: C.orange }}>{t.pending.toLocaleString()}</td>
                            <td style={{ padding: "7px 10px", textAlign: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                                <span style={{ fontFamily: F.mono, fontWeight: 800, color: t.settled > 0 ? C.green : "#BDBDBD", fontSize: 12 }}>
                                  {t.settled > 0 ? t.settled.toLocaleString() : "—"}
                                </span>
                                {t.settled > 0 && (
                                  <button onClick={() => canWithdraw && openWithdraw(t)}
                                    title={!isWithdrawDay ? "提现仅限每月 1 日和 15 日 10:00–15:00" : t.settled < MIN_WITHDRAW ? `至少 ${MIN_WITHDRAW} 积分才可提现` : "申请积分结算"}
                                    style={{ padding: "2px 7px", borderRadius: 4, border: `1px solid ${canWithdraw ? C.green : C.border}`, background: canWithdraw ? C.green : "#F0F0F0", color: canWithdraw ? "#fff" : "#BDBDBD", fontWeight: 700, fontSize: 9, cursor: canWithdraw ? "pointer" : "not-allowed", whiteSpace: "nowrap", fontFamily: F.cn }}>
                                    提现
                                  </button>
                                )}
                              </div>
                            </td>
                            {/* 已提现积分 */}
                            <td style={{ padding: "7px 10px", textAlign: "center" }}>
                              {t.withdrawnPts > 0
                                ? <span style={{ fontFamily: F.mono, fontWeight: 800, color: C.muted, fontSize: 12 }}>{t.withdrawnPts.toLocaleString()}</span>
                                : <span style={{ color: "#C8CDD6", fontSize: 12 }}>—</span>
                              }
                            </td>
                            <td style={{ padding: "7px 10px", textAlign: "center", fontWeight: 700, color: refundNum === 0 ? C.green : refundNum > 5 ? C.red : C.orange }}>{t.refund}</td>
                            {/* 断线断电状态 */}
                            <td style={{ padding: "7px 10px", textAlign: "center" }}>
                              <PowerBadge status={t.powerStatus} />
                            </td>
                            {/* 扣除积分 */}
                            <td style={{ padding: "7px 10px", textAlign: "center" }}>
                              {t.deductPts > 0
                                ? <span style={{ fontFamily: F.mono, fontWeight: 800, color: C.red, fontSize: 12 }}>−{t.deductPts.toLocaleString()}</span>
                                : <span style={{ color: "#C8CDD6", fontSize: 12 }}>—</span>
                              }
                            </td>
                            <td style={{ padding: "7px 14px", minWidth: 110 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ flex: 1, height: 5, borderRadius: 99, background: "#EBEBEB", overflow: "hidden" }}>
                                  <div style={{ height: "100%", borderRadius: 99, width: `${t.progress}%`, background: sc }} />
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 800, color: sc, minWidth: 30, textAlign: "right", fontFamily: F.mono }}>{t.progress}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {/* Pagination footer */}
                <div style={{ padding: "9px 14px", borderTop: `1px solid ${C.border}`, background: "#F7F8FA", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: C.muted }}>共 {sortedList.length} 条</span>
                  <span style={{ fontSize: 12, color: C.muted }}>每页</span>
                  <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setAcceptPage(1); setDonePage(1); }}
                    style={{ padding: "2px 6px", border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 12, outline: "none" }}>
                    {[20, 50, 100].map(n => <option key={n} value={n}>{n} 条</option>)}
                  </select>
                  <span style={{ fontSize: 12, color: C.muted }}>第 {acceptPage}/{Math.max(1, totalPages)} 页</span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                    {([["«", 1], ["‹", acceptPage - 1], ["›", acceptPage + 1], ["»", totalPages]] as [string, number][]).map(([lbl, pg]) => {
                      const disabled = (lbl === "«" || lbl === "‹") ? acceptPage === 1 : acceptPage === totalPages || totalPages === 0;
                      return (
                        <button key={lbl} onClick={() => !disabled && setAcceptPage(Math.max(1, Math.min(totalPages, pg)))} disabled={disabled}
                          style={{ width: 28, height: 28, borderRadius: 5, border: `1px solid ${disabled ? C.border : C.border}`, background: disabled ? "#F5F5F5" : "#fff", color: disabled ? "#CCC" : C.text, fontSize: 12, cursor: disabled ? "default" : "pointer", fontWeight: 600 }}>
                          {lbl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Withdrawal modal ── */}
        {withdrawTask && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 998, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => { if (withdrawStep !== "processing") setWithdrawTask(null); }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: 420, borderRadius: 14, background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,.18)", overflow: "hidden", animation: "pop-in .2s ease" }}>
              {/* Header */}
              <div style={{ background: `linear-gradient(120deg,${C.dark},#0f3460)`, padding: "18px 22px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "rgba(255,255,255,.7)", display: "flex" }}>{Ic.money}</span>
                <div>
                  <div style={{ fontWeight: 800, color: "#fff", fontSize: 15 }}>积分结算</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginTop: 2 }}>已结算积分将从积分余额中扣除</div>
                </div>
                <button onClick={() => setWithdrawTask(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "rgba(255,255,255,.4)", fontSize: 18, cursor: "pointer" }}>✕</button>
              </div>

              <div style={{ padding: "20px 22px" }}>
                {withdrawStep === "confirm" && (<>
                  <div style={{ background: "#F7F8FA", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: C.muted }}>订单商家</span>
                      <span style={{ fontSize: 12, fontWeight: 800, fontFamily: F.mono, color: C.dark }}>{maskDomain(withdrawTask.domain)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: C.muted }}>结算积分</span>
                      <span style={{ fontSize: 16, fontWeight: 900, color: C.green, fontFamily: F.mono }}>{withdrawTask.settled.toLocaleString()} 积分</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 13, color: C.muted }}>当前积分余额</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.orange, fontFamily: F.mono }}>{pointsBalance.toLocaleString()} 积分</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <span style={{ fontSize: 13, color: C.muted }}>结算后余额</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.blue, fontFamily: F.mono }}>{Math.max(0, pointsBalance - withdrawTask.settled).toLocaleString()} 积分</span>
                    </div>
                  </div>
                  <div style={{ padding: "9px 12px", background: "#FFFDE7", border: "1px solid #FFE082", borderRadius: 7, fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
                    <span style={{ display: "flex", alignItems: "flex-start", gap: 6 }}><span style={{ color: "#D97706", flexShrink: 0, marginTop: 1 }}>{Ic.warnSm}</span><span>最低结算门槛 <strong style={{ color: C.orange }}>{MIN_WITHDRAW} 积分</strong>。结算后积分从余额扣除，进入后台审核流程。</span></span>
                  </div>
                  <button onClick={doWithdraw} style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: C.green, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>
                    确认结算 {withdrawTask.settled.toLocaleString()} 积分
                  </button>
                </>)}

                {withdrawStep === "processing" && (
                  <div style={{ textAlign: "center", padding: "28px 0" }}>
                    <div style={{ color: C.muted, display: "flex", justifyContent: "center", marginBottom: 10 }}>{Ic.clock}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>正在提交结算申请...</div>
                    <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>请勿关闭此窗口</div>
                  </div>
                )}

                {withdrawStep === "done" && (
                  <div style={{ textAlign: "center", padding: "28px 0" }}>
                    <div style={{ color: C.green, display: "flex", justifyContent: "center", marginBottom: 10 }}>{Ic.checkLg}</div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: C.green, marginBottom: 6 }}>结算成功！</div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>已从积分余额中扣除 <strong style={{ color: C.orange }}>{withdrawTask?.settled.toLocaleString()} 积分</strong></div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>当前余额 <strong style={{ color: C.blue, fontFamily: F.mono }}>{pointsBalance.toLocaleString()} 积分</strong></div>
                    <button onClick={() => setWithdrawTask(null)} style={{ padding: "9px 28px", borderRadius: 7, border: "none", background: C.yellow, color: C.dark, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>
                      关闭
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Done-tab withdraw modal */}
        {doneWithdrawTask && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 998, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => { if (doneWithdrawStep !== "processing") setDoneWithdrawTask(null); }}>
            <div onClick={e => e.stopPropagation()} style={{ width: 420, borderRadius: 14, background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,.18)", overflow: "hidden" }}>
              <div style={{ background: `linear-gradient(120deg,${C.dark},#0f3460)`, padding: "18px 22px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "rgba(255,255,255,.7)", display: "flex" }}>{Ic.money}</span>
                <div>
                  <div style={{ fontWeight: 800, color: "#fff", fontSize: 15 }}>积分结算（已完成订单）</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginTop: 2 }}>结算积分将从积分余额中扣除</div>
                </div>
                <button onClick={() => setDoneWithdrawTask(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "rgba(255,255,255,.4)", fontSize: 18, cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ padding: "20px 22px" }}>
                {doneWithdrawStep === "confirm" && (<>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14, background: "#F9FAFB", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: C.muted }}>海外商家</span>
                      <span style={{ fontSize: 12, fontWeight: 800, fontFamily: F.mono, color: C.dark }}>{maskDomain(doneWithdrawTask.domain)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: C.muted }}>结算积分</span>
                      <span style={{ fontSize: 16, fontWeight: 900, color: C.green, fontFamily: F.mono }}>{doneWithdrawTask.settled.toLocaleString()} 积分</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 13, color: C.muted }}>当前积分余额</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.orange, fontFamily: F.mono }}>{pointsBalance.toLocaleString()} 积分</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: C.muted }}>结算后余额</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.blue, fontFamily: F.mono }}>{Math.max(0, pointsBalance - doneWithdrawTask.settled).toLocaleString()} 积分</span>
                    </div>
                  </div>
                  <div style={{ padding: "9px 12px", background: "#FFFDE7", border: "1px solid #FFE082", borderRadius: 7, fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
                    <span style={{ display: "flex", alignItems: "flex-start", gap: 6 }}><span style={{ color: "#D97706", flexShrink: 0, marginTop: 1 }}>{Ic.warnSm}</span><span>最低结算门槛 <strong style={{ color: C.orange }}>{MIN_WITHDRAW} 积分</strong>。结算后积分从余额扣除，进入后台审核流程。</span></span>
                  </div>
                  <button onClick={doDoneWithdraw} style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: C.green, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>
                    确认结算 {doneWithdrawTask.settled.toLocaleString()} 积分
                  </button>
                </>)}
                {doneWithdrawStep === "processing" && (
                  <div style={{ textAlign: "center", padding: "28px 0" }}>
                    <div style={{ color: C.muted, display: "flex", justifyContent: "center", marginBottom: 10 }}>{Ic.clock}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>正在提交结算申请...</div>
                    <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>请勿关闭此窗口</div>
                  </div>
                )}
                {doneWithdrawStep === "done" && (
                  <div style={{ textAlign: "center", padding: "28px 0" }}>
                    <div style={{ color: C.green, display: "flex", justifyContent: "center", marginBottom: 10 }}>{Ic.checkLg}</div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: C.green, marginBottom: 6 }}>结算成功！</div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>已从积分余额中扣除 <strong style={{ color: C.orange }}>{doneWithdrawTask?.settled.toLocaleString()} 积分</strong></div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>当前余额 <strong style={{ color: C.blue, fontFamily: F.mono }}>{pointsBalance.toLocaleString()} 积分</strong></div>
                    <button onClick={() => setDoneWithdrawTask(null)} style={{ padding: "9px 28px", borderRadius: 7, border: "none", background: C.yellow, color: C.dark, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>关闭</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DONE TAB */}
        {tab === "done" && (() => {
          /* sort: unwithdrawn first */
          const sortedDone = [...doneList].sort((a, b) => (a.withdrawn ? 1 : 0) - (b.withdrawn ? 1 : 0));
          const doneTotalPages = Math.ceil(sortedDone.length / pageSize);
          const donePageData = sortedDone.slice((donePage - 1) * pageSize, donePage * pageSize);
          const totalUnwithdrawnDone = doneList.filter(t => !t.withdrawn).reduce((s, t) => s + t.settled, 0);
          const totalWithdrawnDone   = doneList.filter(t => t.withdrawn).reduce((s, t) => s + t.settled, 0);
          const unwithdrawnDoneCount = doneList.filter(t => !t.withdrawn).length;

          return (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Summary bar */}
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, padding: "10px 16px", borderRadius: 8, background: totalUnwithdrawnDone > 0 ? "#FFF7ED" : "#F9FAFB", border: `1px solid ${totalUnwithdrawnDone > 0 ? "#FED7AA" : C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>未提现积分余额</div>
                  <div style={{ fontSize: 18, fontWeight: 900, fontFamily: F.mono, color: totalUnwithdrawnDone > 0 ? C.orange : C.muted, letterSpacing: -0.5 }}>{totalUnwithdrawnDone.toLocaleString()}</div>
                </div>
                {unwithdrawnDoneCount > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#FFEDD5", color: C.orange, border: "1px solid #FED7AA" }}>{unwithdrawnDoneCount} 单待提现</span>
                )}
              </div>
              <div style={{ flex: 1, padding: "10px 16px", borderRadius: 8, background: "#F0FDF4", border: "1px solid #BBF7D0", display: "flex", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>已提现积分</div>
                  <div style={{ fontSize: 18, fontWeight: 900, fontFamily: F.mono, color: C.green, letterSpacing: -0.5 }}>{totalWithdrawnDone.toLocaleString()}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#DCFCE7", color: C.green, border: "1px solid #BBF7D0" }}>{doneList.filter(t => t.withdrawn).length} 单已到账</span>
              </div>
              {/* Settlement window pill */}
              <div style={{ padding: "10px 14px", borderRadius: 8, background: isWithdrawDay ? "#F0FDF4" : "#FFFBEB", border: `1px solid ${isWithdrawDay ? "#BBF7D0" : "#FDE68A"}`, fontSize: 11, color: isWithdrawDay ? "#16A34A" : "#92400E", display: "flex", alignItems: "center", gap: 6, flexShrink: 0, maxWidth: 240 }}>
                <span style={{ flexShrink: 0 }}>{isWithdrawDay ? "✓" : "⏰"}</span>
                <span>{isWithdrawDay ? `提现窗口开放中，满 ${MIN_WITHDRAW} 积分即可申请` : "提现仅限每月 1 日和 15 日 10:00–15:00"}</span>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#F7F8FA" }}>
                  {["#", "订单编号", "海外商家", "类型", "总时长", "已完成", "已结算积分", "延迟率", "断线断电", "扣除积分", "完成时间", "提现状态"].map((h, hi) => (
                    <th key={h} style={{ padding: "9px 10px", fontWeight: 700, color: hi === 8 || hi === 9 ? C.red : "#9AA3B0", fontSize: 13, textAlign: hi >= 4 ? "center" : "left", borderBottom: `1.5px solid ${C.border}`, whiteSpace: "nowrap", letterSpacing: .3 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedDone.length === 0 && (
                  <tr><td colSpan={12} style={{ padding: "40px", textAlign: "center", color: C.muted }}>终端 {term.id} 暂无完成记录</td></tr>
                )}
                {donePageData.map((r, i) => {
                  const refundNum = parseFloat(r.refund);
                  const canWd = isWithdrawDay && !r.withdrawn && r.settled >= MIN_WITHDRAW;
                  const rowNum = (donePage - 1) * pageSize + i + 1;
                  const pwrCfg = r.powerStatus === "online"
                    ? { label: "在线", bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0", dot: "#22C55E" }
                    : r.powerStatus === "offline"
                    ? { label: "断线", bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", dot: "#F59E0B" }
                    : { label: "断电", bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", dot: "#EF4444" };
                  return (
                  <tr key={r.id} style={{ background: !r.withdrawn ? "#FFFEF7" : i % 2 === 0 ? "#fff" : "#FAFBFC", borderBottom: `1px solid ${C.border}`, borderLeft: !r.withdrawn ? `3px solid ${C.orange}` : "3px solid transparent" }}>
                    <td style={{ padding: "7px 10px", color: "#BDBDBD", fontSize: 12, fontFamily: F.mono }}>{String(rowNum).padStart(2, "0")}</td>
                    <td style={{ padding: "7px 10px", fontFamily: F.mono, fontSize: 12, color: "#BDBDBD" }}>{r.id.slice(-8)}</td>
                    <td style={{ padding: "7px 10px" }}><span style={{ fontWeight: 800, fontSize: 12, color: C.dark, fontFamily: F.mono }}>{maskDomain(r.domain)}</span></td>
                    <td style={{ padding: "7px 10px" }}><span style={{ fontSize: 10, background: "#F0F0F5", borderRadius: 4, padding: "1px 5px", fontWeight: 700, color: C.muted }}>{r.type}</span></td>
                    <td style={{ padding: "7px 10px", textAlign: "center", fontFamily: F.mono, fontWeight: 700, color: C.text }}>{r.hours}</td>
                    <td style={{ padding: "7px 10px", textAlign: "center", fontFamily: F.mono, fontWeight: 700, color: C.green }}>{r.done}h</td>
                    {/* 已结算积分 + 提现按钮 */}
                    <td style={{ padding: "7px 10px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                        <span style={{ fontFamily: F.mono, fontWeight: 800, color: C.green, fontSize: 12 }}>{r.settled.toLocaleString()}</span>
                        <button onClick={() => canWd && openDoneWithdraw(r)} disabled={r.withdrawn}
                          title={r.withdrawn ? "已提现" : !isWithdrawDay ? "提现仅限每月 1 日和 15 日 10:00–15:00" : r.settled < MIN_WITHDRAW ? `至少 ${MIN_WITHDRAW} 积分才可提现` : "申请积分结算"}
                          style={{ padding: "2px 7px", borderRadius: 4, border: `1px solid ${canWd ? C.green : C.border}`, background: canWd ? C.green : "#F0F0F0", color: canWd ? "#fff" : "#BDBDBD", fontWeight: 700, fontSize: 9, cursor: canWd ? "pointer" : "not-allowed", whiteSpace: "nowrap" as const, fontFamily: F.cn }}>
                          {r.withdrawn ? "已结算" : "提现"}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: "7px 10px", textAlign: "center", fontWeight: 700, color: refundNum === 0 ? C.green : refundNum > 5 ? C.red : C.orange }}>{r.refund}</td>
                    {/* 断线断电 */}
                    <td style={{ padding: "7px 10px", textAlign: "center" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 99, background: pwrCfg.bg, border: `1px solid ${pwrCfg.border}`, fontSize: 10, fontWeight: 700, color: pwrCfg.color, whiteSpace: "nowrap" as const }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: pwrCfg.dot, flexShrink: 0 }}/>
                        {pwrCfg.label}
                      </span>
                    </td>
                    {/* 扣除积分 */}
                    <td style={{ padding: "7px 10px", textAlign: "center" }}>
                      {r.deductPts > 0
                        ? <span style={{ fontFamily: F.mono, fontWeight: 800, color: C.red, fontSize: 12 }}>−{r.deductPts.toLocaleString()}</span>
                        : <span style={{ color: "#C8CDD6", fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ padding: "7px 10px", textAlign: "center", color: C.muted, fontSize: 11, fontFamily: F.mono }}>{r.completedAt}</td>
                    {/* 提现状态 */}
                    <td style={{ padding: "7px 10px", textAlign: "center" }}>
                      {r.withdrawn
                        ? <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" }}>已提现</span>
                        : <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#FFF7ED", color: C.orange, border: "1px solid #FED7AA" }}>未提现</span>}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: "9px 14px", background: "#F7F8FA", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: C.muted }}>共 {sortedDone.length} 条</span>
              <span style={{ fontSize: 12, color: C.muted }}>每页</span>
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setDonePage(1); setAcceptPage(1); }}
                style={{ padding: "2px 6px", border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 12, outline: "none" }}>
                {[20, 50, 100].map(n => <option key={n} value={n}>{n} 条</option>)}
              </select>
              <span style={{ fontSize: 12, color: C.muted }}>第 {donePage}/{Math.max(1, doneTotalPages)} 页</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                {([["«", 1], ["‹", donePage - 1], ["›", donePage + 1], ["»", doneTotalPages]] as [string, number][]).map(([lbl, pg]) => {
                  const disabled = (lbl === "«" || lbl === "‹") ? donePage === 1 : donePage === doneTotalPages || doneTotalPages === 0;
                  return (
                    <button key={lbl} onClick={() => !disabled && setDonePage(Math.max(1, Math.min(doneTotalPages, pg)))} disabled={disabled}
                      style={{ width: 28, height: 28, borderRadius: 5, border: `1px solid ${C.border}`, background: disabled ? "#F5F5F5" : "#fff", color: disabled ? "#CCC" : C.text, fontSize: 12, cursor: disabled ? "default" : "pointer", fontWeight: 600 }}>
                      {lbl}
                    </button>
                  );
                })}
              </div>
              <span style={{ fontSize: 11, color: C.muted, display: "flex", alignItems: "center", gap: 4 }}>{Ic.warnSm} 海外商家域名已脱敏</span>
            </div>
          </div>
          </div>
          );
        })()}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MERCHANT — PAGE 3: POINTS & WITHDRAWAL
══════════════════════════════════════════════════════════════ */

/* ── Inline SVG icons (stroke-based, no emoji) ── */
const Ic = {
  coin:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M9 10h4.5a1.5 1.5 0 0 1 0 3H10a1.5 1.5 0 0 0 0 3H15"/></svg>,
  card:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  wallet:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/><path d="M16 12a2 2 0 0 0 0 4h5v-4h-5Z"/></svg>,
  key:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3"/></svg>,
  eye:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  send:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></svg>,
  chat:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  gift:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  monitor:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  list:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  star:     <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  clock:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  check:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  lock:     <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  lockSm:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  warn:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  warnSm:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  checkLg:  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  party:    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5.8 11.3-1.9 8.4 8.5-1.9 8-7.9-6.5-6.5-8.1 7.9Z"/><path d="m2 22 3.8-3.8M13.2 2.5l6.5 6.5M7.5 18.5l-1 1"/></svg>,
  pin:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  money:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  chart:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  creditcard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
};

type CardStatus = "未使用" | "已绑定" | "已转让";
type ActivationCard = { orderId: string; code: string; status: CardStatus; purchaseDate: string; device?: string; transferTo?: string; expiry: string };

const MY_CARDS: ActivationCard[] = [
  { orderId: "ORD-20260828-001", code: "C3J8Z9-XMPL-K2Q7-NPFT", status: "未使用",  purchaseDate: "2026-08-28", expiry: "激活后1年" },
  { orderId: "ORD-20260715-002", code: "A9K2M5-RLQP-H7W3-BCZD", status: "已绑定",  purchaseDate: "2026-07-15", device: "HWID-A7F3-2K9X-B4M1", expiry: "2027-07-15" },
  { orderId: "ORD-20260610-003", code: "F5V8N1-YQTK-J4R6-DMWS", status: "已转让",  purchaseDate: "2026-06-10", transferTo: "us****@gmail.com", expiry: "—" },
];

const EXCHANGE_LOG = [
  { date: "2026-08-28", type: "积分兑云币",    pts: 10000, yunbi: "10.00", cards: 0 },
  { date: "2026-08-20", type: "积分购激活卡",  pts: 5000,  yunbi: "0",     cards: 1 },
  { date: "2026-08-15", type: "云币购激活卡",  pts: 0,     yunbi: "50.00", cards: 1 },
  { date: "2026-07-28", type: "云币兑现",       pts: 0,     yunbi: "80.00", cards: 0 },
];

function MerchantPoints() {
  const [pts,     setPts]     = useState(218120);
  const [yunbi,   setYunbi]   = useState(128.40);
  const [feePool, setFeePool] = useState(0);
  const [cards, setCards] = useState<ActivationCard[]>(MY_CARDS);

  /* ── list filter/page state ── */
  const [cardsSearch,  setCardsSearch]  = useState(""); const [cardsFrom,  setCardsFrom]  = useState(""); const [cardsTo,  setCardsTo]  = useState(""); const [cardsPage,  setCardsPage]  = useState(1);
  const [exchHSearch,  setExchHSearch]  = useState(""); const [exchHFrom,  setExchHFrom]  = useState(""); const [exchHTo,  setExchHTo]  = useState(""); const [exchHPage,  setExchHPage]  = useState(1);
  const [lottHSearch,  setLottHSearch]  = useState(""); const [lottHFrom,  setLottHFrom]  = useState(""); const [lottHTo,  setLottHTo]  = useState(""); const [lottHPage,  setLottHPage]  = useState(1);
  const [listSearch,   setListSearch]   = useState(""); const [listFrom,   setListFrom]   = useState(""); const [listTo,   setListTo]   = useState(""); const [listPage,   setListPage]   = useState(1);
  const [histSearch,   setHistSearch]   = useState(""); const [histFrom,   setHistFrom]   = useState(""); const [histTo,   setHistTo]   = useState(""); const [histPage,   setHistPage]   = useState(1);

  /* ── history log ── */
  type HistoryEntry = { date: string; type: string; detail: string; status: "完成" | "审核中" | "已取消" };
  const [history, setHistory] = useState<HistoryEntry[]>([
    { date: "2026-08-28", type: "兑换",  detail: "10,000 积分 → 10.00 云币",          status: "完成"  },
    { date: "2026-08-20", type: "购买",  detail: "5,000 积分 → 1 张激活卡",           status: "完成"  },
    { date: "2026-08-15", type: "购买",  detail: "50.00 云币 → 1 张激活卡",           status: "完成"  },
    { date: "2026-08-10", type: "提现",  detail: "80.00 云币 → USDT（Tron）",         status: "完成"  },
    { date: "2026-08-05", type: "挂卖",  detail: "50.00 云币 @ 0.95 USDT/云币",      status: "完成"  },
    { date: "2026-07-28", type: "转账",  detail: "1,000 积分 → us****@gmail.com",    status: "完成"  },
  ]);

  /* ── lottery cards & histories ── */
  const [lotteryCards, setLotteryCards] = useState(2);
  const [lotteryHistory, setLotteryHistory] = useState<{date:string; result:string; reward:string}[]>([
    { date: "2026-08-20", result: "未中奖", reward: "—" },
    { date: "2026-08-15", result: "中奖！", reward: "激活卡 × 1" },
  ]);
  const [exchangeHistory, setExchangeHistory] = useState<{date:string; method:string; cost:string; reward:string}[]>([
    { date: "2026-08-20", method: "积分兑换", cost: "50,000 积分", reward: "激活卡 + 抽奖卡" },
    { date: "2026-08-15", method: "云币购买", cost: "500 云币",   reward: "激活卡 + 抽奖卡" },
  ]);

  /* ── pts redeem modal ── */
  const [ptsRedeemModal, setPtsRedeemModal] = useState(false);
  const [redeemQty, setRedeemQty] = useState(1);
  const [redeemStep, setRedeemStep] = useState<"idle"|"loading"|"ok">("idle");
  const maxRedeem = Math.max(1, Math.floor(pts / 50000));
  const doRedeem = () => {
    if (pts < redeemQty * 50000) return;
    setRedeemStep("loading");
    setTimeout(() => {
      setPts(p => p - redeemQty * 50000);
      const newCards: ActivationCard[] = Array.from({ length: redeemQty }, (_, i) => ({
        orderId: `ORD-R${Date.now()}-${String(i+1).padStart(3,"0")}`,
        code: Math.random().toString(36).slice(2,8).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase(),
        status: "未使用", purchaseDate: "2026-08-31", expiry: "激活后1年",
      }));
      setCards(prev => [...newCards, ...prev]);
      setLotteryCards(lc => lc + redeemQty);
      setExchangeHistory(h => [{ date: "2026-08-31", method: "积分兑换", cost: `${(redeemQty*50000).toLocaleString()} 积分`, reward: `激活卡 × ${redeemQty} + 抽奖卡 × ${redeemQty}` }, ...h]);
      setRedeemStep("ok");
      setTimeout(() => { setRedeemStep("idle"); setRedeemQty(1); }, 2000);
    }, 1500);
  };

  /* ── buy yunbi modal ── */
  const [buyYunbiModal, setBuyYunbiModal] = useState(false);
  const [yunbiStep, setYunbiStep] = useState<"summary"|"otp"|"ok">("summary");
  const [yunbiEmail, setYunbiEmail] = useState("");
  const [yunbiOtp, setYunbiOtp] = useState("");
  const [yunbiOtpSent, setYunbiOtpSent] = useState(false);
  const [yunbiLoading, setYunbiLoading] = useState(false);
  const sendYunbiOtp = () => {
    if (!yunbiEmail.includes("@")) return;
    setYunbiOtpSent(true);
  };
  const confirmYunbiBuy = () => {
    if (yunbiOtp.length !== 6) return;
    setYunbiLoading(true);
    setTimeout(() => {
      setYunbi(y => y + 500);
      const newCard: ActivationCard = {
        orderId: `ORD-Y${Date.now()}-001`,
        code: Math.random().toString(36).slice(2,8).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase(),
        status: "未使用", purchaseDate: "2026-08-31", expiry: "激活后1年",
      };
      setCards(prev => [newCard, ...prev]);
      setLotteryCards(lc => lc + 1);
      setExchangeHistory(h => [{ date: "2026-08-31", method: "云币购买", cost: "¥500 法币", reward: "500 云币 + 激活卡 + 抽奖卡" }, ...h]);
      setYunbiStep("ok");
      setYunbiLoading(false);
      setTimeout(() => { setBuyYunbiModal(false); setYunbiStep("summary"); setYunbiEmail(""); setYunbiOtp(""); setYunbiOtpSent(false); }, 2200);
    }, 1600);
  };

  /* ── lottery spin ── */
  const [lotterySpinning, setLotterySpinning] = useState(false);
  const [lotteryResult, setLotteryResult] = useState<null|"win"|"lose">(null);
  const doSpin = () => {
    if (lotteryCards < 1 || lotterySpinning) return;
    setLotterySpinning(true);
    setLotteryResult(null);
    setLotteryCards(lc => lc - 1);
    setTimeout(() => {
      const won = Math.random() < 0.1;
      const date = "2026-08-31";
      if (won) {
        const newCard: ActivationCard = {
          orderId: `ORD-L${Date.now()}-001`,
          code: Math.random().toString(36).slice(2,8).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase(),
          status: "未使用", purchaseDate: date, expiry: "激活后1年",
        };
        setCards(prev => [newCard, ...prev]);
        setLotteryHistory(h => [{ date, result: "中奖！", reward: "激活卡 × 1" }, ...h]);
      } else {
        setLotteryHistory(h => [{ date, result: "未中奖", reward: "—" }, ...h]);
      }
      setLotteryResult(won ? "win" : "lose");
      setLotterySpinning(false);
    }, 1800);
  };

  /* ── pts exchange → yunbi ── */
  const [exchModal, setExchModal] = useState(false);
  const [ptsInput, setPtsInput] = useState("");
  const [exchStep, setExchStep] = useState<"idle"|"loading"|"ok">("idle");
  const doExchange = () => {
    const n = Number(ptsInput);
    if (!n || n < 1000) return;
    setExchStep("loading");
    setTimeout(() => {
      setYunbi(y => y + n / 1000); setPts(p => p - n);
      setHistory(h => [{ date: "2026-08-31", type: "兑换", detail: `${n.toLocaleString()} 积分 → ${(n/1000).toFixed(2)} 云币`, status: "完成" }, ...h]);
      setExchStep("ok"); setTimeout(() => { setExchStep("idle"); setPtsInput(""); }, 1800);
    }, 1400);
  };

  /* ── buy card ── */
  const [buyModal, setBuyModal] = useState(false);
  const [buyMethod, setBuyMethod] = useState<"pts"|"yunbi">("pts");
  const [buyQty,    setBuyQty]    = useState(1);
  const [buyStep,   setBuyStep]   = useState<"idle"|"loading"|"ok">("idle");
  const CARD_PTS = 50000; const CARD_YUNBI = 500;
  const canBuy = buyMethod === "pts" ? pts >= buyQty * CARD_PTS : yunbi >= buyQty * CARD_YUNBI;
  const doBuy = () => {
    if (!canBuy) return; setBuyStep("loading");
    setTimeout(() => {
      if (buyMethod === "pts") setPts(p => p - buyQty * CARD_PTS);
      else setYunbi(y => y - buyQty * CARD_YUNBI);
      const newCards: ActivationCard[] = Array.from({ length: buyQty }, (_, i) => ({
        orderId: `ORD-${Date.now()}-${String(i+1).padStart(3,"0")}`,
        code: Math.random().toString(36).slice(2,8).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase(),
        status: "未使用", purchaseDate: "2026-08-31", expiry: "激活后1年",
      }));
      setCards(prev => [...newCards, ...prev]);
      setHistory(h => [{ date: "2026-08-31", type: "购买", detail: `${buyMethod === "pts" ? (buyQty*CARD_PTS).toLocaleString()+" 积分" : (buyQty*CARD_YUNBI)+" 云币"} → ${buyQty} 张激活卡`, status: "完成" }, ...h]);
      setBuyStep("ok"); setTimeout(() => { setBuyStep("idle"); setBuyQty(1); }, 2000);
    }, 1500);
  };

  /* ── wallet ── */
  const [walletNet,      setWalletNet]      = useState<"BSC"|"Tron">("BSC");
  const [walletAddrBSC,  setWalletAddrBSC]  = useState("");
  const [walletAddrTron, setWalletAddrTron] = useState("");
  const walletAddr = walletNet === "BSC" ? walletAddrBSC : walletAddrTron;
  const walletBound = walletAddrBSC !== "" || walletAddrTron !== "";
  const walletBoundNet = walletNet === "BSC" ? walletAddrBSC !== "" : walletAddrTron !== "";
  const [walletModal, setWalletModal] = useState(false);
  const [walletInput, setWalletInput] = useState("");
  const [walletStep,  setWalletStep]  = useState<"form"|"loading"|"done">("form");
  const doBindWallet = () => {
    if (!walletInput.trim()) return; setWalletStep("loading");
    setTimeout(() => {
      if (walletNet === "BSC") setWalletAddrBSC(walletInput.trim());
      else setWalletAddrTron(walletInput.trim());
      setWalletStep("done"); setTimeout(() => setWalletModal(false), 1200);
    }, 1600);
  };

  /* ── withdraw (提现) ── */
  const [wdModal,   setWdModal]   = useState(false);
  const [wdAmt,     setWdAmt]     = useState("");
  const [wdPayPwd,  setWdPayPwd]  = useState("");
  const [wdPayErr,  setWdPayErr]  = useState(false);
  const [wdStep,    setWdStep]    = useState<"idle"|"loading"|"ok">("idle");
  const [wdUsePool, setWdUsePool] = useState(false);
  const FEE = 0.05; const RATE = 1.0;
  const chainFee = walletNet === "Tron" ? 0.01 : 0;
  const totalFee = FEE + chainFee;
  const wdRawAmt  = wdAmt ? Number(wdAmt) : 0;
  const wdFeeFull = wdRawAmt * totalFee;
  const poolOffset = wdUsePool ? Math.min(feePool, wdFeeFull) : 0;
  const wdFeeNet  = wdFeeFull - poolOffset;
  const wdUsdt = wdRawAmt ? ((wdRawAmt - wdFeeNet) * RATE).toFixed(2) : "0.00";
  const doWithdraw = () => {
    const n = Number(wdAmt); if (!n || n > yunbi) return;
    if (!wdPayPwd.trim()) { setWdPayErr(true); return; }
    setWdPayErr(false); setWdStep("loading");
    setTimeout(() => {
      setYunbi(y => y - n);
      setFeePool(p => parseFloat((p - poolOffset).toFixed(4)));
      setHistory(h => [{ date: "2026-08-31", type: "提现", detail: `${n.toFixed(2)} 云币 → USDT（${walletNet}）`, status: "审核中" }, ...h]);
      setWdStep("ok"); setTimeout(() => { setWdStep("idle"); setWdAmt(""); setWdPayPwd(""); setWdUsePool(false); setWdModal(false); }, 2200);
    }, 1600);
  };

  /* ── 挂卖 ── */
  type Listing = { id: string; qty: number; price: number; date: string; status: "挂卖中"|"已成交"|"已取消" };
  const [listings, setListings] = useState<Listing[]>([
    { id: "LST-001", qty: 20, price: 0.95, date: "2026-08-28", status: "挂卖中" },
  ]);
  const [listModal,  setListModal]  = useState(false);
  const [listQty,    setListQty]    = useState("");
  const [listPrice,  setListPrice]  = useState("0.95");
  const [listStep,   setListStep]   = useState<"idle"|"loading"|"ok">("idle");
  const doList = () => {
    if (!walletBound) { setListModal(false); setWalletModal(true); setWalletStep("form"); setWalletInput(""); return; }
    const n = Number(listQty); if (!n || n > yunbi) return; setListStep("loading");
    setTimeout(() => {
      setYunbi(y => y - n);
      const newL: Listing = { id: `LST-${String(listings.length+1).padStart(3,"0")}`, qty: n, price: Number(listPrice)||0.95, date: "2026-08-31", status: "挂卖中" };
      setListings(prev => [newL, ...prev]);
      setHistory(h => [{ date: "2026-08-31", type: "挂卖", detail: `${n.toFixed(2)} 云币 @ ${listPrice} USDT/云币`, status: "完成" }, ...h]);
      setListStep("ok"); setTimeout(() => { setListStep("idle"); setListQty(""); setListModal(false); }, 2000);
    }, 1600);
  };

  /* ── pts transfer ── */
  const [ptsTxModal, setPtsTxModal] = useState(false);
  const [ptsTxTo,    setPtsTxTo]    = useState("");
  const [ptsTxAmt,   setPtsTxAmt]   = useState("");
  const [ptsTxStep,  setPtsTxStep]  = useState<"idle"|"loading"|"ok">("idle");
  const doPtsTx = () => {
    const n = Number(ptsTxAmt); if (!ptsTxTo.trim() || !n || n > pts) return; setPtsTxStep("loading");
    setTimeout(() => {
      setPts(p => p - n);
      setHistory(h => [{ date: "2026-08-31", type: "转账", detail: `${n.toLocaleString()} 积分 → ${ptsTxTo.includes("@") ? ptsTxTo.replace(/(.{2}).*(@.*)/, "$1****$2") : ptsTxTo.slice(0,4)+"****"}`, status: "完成" }, ...h]);
      setPtsTxStep("ok"); setTimeout(() => { setPtsTxStep("idle"); setPtsTxTo(""); setPtsTxAmt(""); setPtsTxModal(false); }, 2000);
    }, 1500);
  };

  /* ── card ops ── */
  const [revealId, setRevealId] = useState<string|null>(null);
  const [useCard,  setUseCard]  = useState<ActivationCard|null>(null);
  const [useStep,  setUseStep]  = useState<"form"|"loading"|"ok">("form");

  const statusColor = (s: CardStatus) => s === "未使用" ? "#16A34A" : s === "已绑定" ? "#2563EB" : "#9CA3AF";

  /* ── shared styles ── */
  const S = {
    card:   { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10 } as React.CSSProperties,
    hd:     { padding: "12px 18px", borderBottom: "1px solid #E5E7EB", fontWeight: 700, fontSize: 14, color: "#111827", background: "#FAFAFA" } as React.CSSProperties,
    body:   { padding: "18px" } as React.CSSProperties,
    label:  { fontSize: 13, color: "#6B7280", marginBottom: 5, display: "block" } as React.CSSProperties,
    input:  { width: "100%", padding: "9px 12px", border: "1.5px solid #D1D5DB", borderRadius: 7, fontSize: 14, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit" },
    inputM: { width: "100%", padding: "9px 12px", border: "1.5px solid #D1D5DB", borderRadius: 7, fontSize: 14, outline: "none", boxSizing: "border-box" as const, fontFamily: F.mono },
    btnPri: { padding: "10px 20px", border: "none", borderRadius: 7, background: "#1C1C2E", color: "#FFD700", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F.cn } as React.CSSProperties,
    btnSec: { padding: "9px 18px", border: "1px solid #D1D5DB", borderRadius: 7, background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: F.cn } as React.CSSProperties,
    btnSm:  { padding: "5px 12px", border: "1px solid #D1D5DB", borderRadius: 6, background: "#fff", color: "#374151", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: F.cn, whiteSpace: "nowrap" as const } as React.CSSProperties,
  };

  const focusGold  = (e: React.FocusEvent<HTMLInputElement|HTMLSelectElement>) => (e.target.style.borderColor = "#D97706");
  const blurGray   = (e: React.FocusEvent<HTMLInputElement|HTMLSelectElement>) => (e.target.style.borderColor = "#D1D5DB");

  const statusBadge = (s: HistoryEntry["status"]) => {
    const map: Record<HistoryEntry["status"], [string, string]> = { "完成": ["#16A34A", "#F0FDF4"], "审核中": ["#D97706", "#FFFBEB"], "已取消": ["#6B7280", "#F3F4F6"] };
    const [fg, bg] = map[s];
    return <span style={{ fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 4, padding: "2px 8px" }}>{s}</span>;
  };

  const ModalShell = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 420, borderRadius: 12, background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,.2)", overflow: "hidden", animation: "pop-in .2s ease" }}>
        <div style={{ background: "#1C1C2E", padding: "14px 18px", display: "flex", alignItems: "center" }}>
          <span style={{ fontWeight: 700, color: "#fff", fontSize: 15, flex: 1 }}>{title}</span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.4)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: "20px 22px" }}>{children}</div>
      </div>
    </div>
  );

  /* ── bottom tab state ── */
  const [tab, setTab] = useState<"cards"|"lottery"|"exchange_history"|"lottery_history"|"market"|"history">("cards");

  /* ── type badge colors ── */
  const typeBadgeColor: Record<string, [string,string]> = {
    "兑换": ["#374151","#F1F5F9"], "购买": ["#374151","#F1F5F9"],
    "提现": ["#374151","#F1F5F9"], "挂卖": ["#374151","#F1F5F9"],
    "转账": ["#6B7280","#F3F4F6"],
  };

  return (
    <div style={{ padding: "18px 20px", fontFamily: F.cn, fontSize: 14, color: "#111827" }}>

      {/* ══ Asset Hero ══ */}
      <div style={{ background: "linear-gradient(135deg,#0f1729 0%,#1e2d55 55%,#251a45 100%)", borderRadius: 14, padding: "22px 24px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
        {/* glow */}
        <div style={{ position: "absolute", top: -60, right: 40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,215,0,.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, right: -10, width: 160, height: 160, borderRadius: "50%", background: "rgba(156,39,176,.06)", pointerEvents: "none" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "stretch", gap: 0 }}>

          {/* 积分 */}
          <div style={{ paddingRight: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,215,0,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.coin}</div>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)", fontWeight: 600, letterSpacing: .5 }}>积分余额</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.yellow, fontFamily: F.mono, letterSpacing: -1, marginBottom: 12 }}>{pts.toLocaleString()}</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button onClick={() => { setPtsTxModal(true); setPtsTxTo(""); setPtsTxAmt(""); setPtsTxStep("idle"); }}
                style={{ flex: 1, padding: "7px 0", borderRadius: 7, border: "1px solid rgba(255,215,0,.35)", background: "rgba(255,215,0,.1)", color: C.yellow, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: F.cn }}>
                转 账
              </button>
              <button onClick={() => { setExchStep("idle"); setPtsInput(""); setExchModal(true); }}
                style={{ flex: 1, padding: "7px 0", borderRadius: 7, border: "none", background: C.yellow, color: "#0f1729", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: F.cn }}>
                → 兑云币
              </button>
            </div>
            <button onClick={() => { setRedeemStep("idle"); setRedeemQty(1); setPtsRedeemModal(true); }}
              style={{ width: "100%", padding: "7px 0", borderRadius: 7, border: "1px solid rgba(255,215,0,.5)", background: "rgba(255,215,0,.15)", color: "#FFD700", fontWeight: 800, fontSize: 11, cursor: "pointer", fontFamily: F.cn }}>
              🎁 兑换激活卡（50,000积分/张）
            </button>
          </div>

          {/* divider */}
          <div style={{ width: 1, background: "rgba(255,255,255,.08)", margin: "0 4px" }} />

          {/* 云币 */}
          <div style={{ padding: "0 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.wallet}</div>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)", fontWeight: 600, letterSpacing: .5 }}>云币余额</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#F8FAFC", fontFamily: F.mono, letterSpacing: -1, marginBottom: 12 }}>{yunbi.toFixed(2)}</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button onClick={() => { setListModal(true); setListQty(""); setListStep("idle"); }}
                style={{ flex: 1, padding: "7px 0", borderRadius: 7, border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.07)", color: "rgba(255,255,255,.8)", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: F.cn }}>
                挂 卖
              </button>
              <button onClick={() => { if (walletBound) { setWdModal(true); setWdAmt(""); setWdStep("idle"); } else { setWalletModal(true); setWalletStep("form"); setWalletInput(""); } }}
                style={{ flex: 1, padding: "7px 0", borderRadius: 7, border: "none", background: "#fff", color: "#0f1729", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: F.cn }}>
                提 现
              </button>
            </div>
            <button onClick={() => { setYunbiStep("summary"); setYunbiEmail(""); setYunbiOtp(""); setYunbiOtpSent(false); setBuyYunbiModal(true); }}
              style={{ width: "100%", padding: "7px 0", borderRadius: 7, border: "1px solid rgba(255,255,255,.25)", background: "rgba(255,255,255,.1)", color: "#fff", fontWeight: 800, fontSize: 11, cursor: "pointer", fontFamily: F.cn }}>
              💳 购买云币（500云币/次）
            </button>
          </div>

          {/* divider */}
          <div style={{ width: 1, background: "rgba(255,255,255,.08)", margin: "0 4px" }} />

          {/* 激活卡 */}
          <div style={{ paddingLeft: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.key}</div>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)", fontWeight: 600, letterSpacing: .5 }}>激活卡库存</span>
            </div>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#F8FAFC", fontFamily: F.mono, letterSpacing: -1 }}>{cards.filter(c=>c.status==="未使用").length}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginLeft: 6 }}>张可用 / 共 {cards.length} 张</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setBuyStep("idle"); setBuyQty(1); setBuyModal(true); }}
                style={{ flex: 1, padding: "7px 0", borderRadius: 7, border: "none", background: "#fff", color: "#0f1729", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: F.cn }}>
                购买激活卡
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 积分兑云币 modal */}
      {exchModal && (
        <ModalShell title="积分兑换云币" onClose={() => { if (exchStep !== "loading") setExchModal(false); }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6B7280", marginBottom: 16, padding: "8px 12px", background: "#FFFDE7", borderRadius: 7, borderLeft: `3px solid ${C.yellow}` }}>
            <span>兑换比率</span>
            <strong style={{ color: "#92400E", fontFamily: F.mono }}>1,000 积分 = 1 云币</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <label style={{ ...S.label, marginBottom: 0 }}>积分数量 <span style={{ color: "#9CA3AF" }}>（最低 1,000）</span></label>
            <span style={{ fontSize: 12, color: "#6B7280" }}>余额 <strong style={{ color: "#1C1C2E" }}>{pts.toLocaleString()}</strong> 积分</span>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input value={ptsInput} onChange={e => { setPtsInput(e.target.value); setExchStep("idle"); }} type="number" placeholder="输入积分数量"
              style={{ ...S.inputM, marginBottom: 0, flex: 1 }} onFocus={focusGold} onBlur={blurGray} autoFocus />
            <button onClick={() => { setPtsInput(String(Math.floor(pts / 1000) * 1000)); setExchStep("idle"); }}
              style={{ padding: "0 14px", border: `1.5px solid ${C.yellow}`, borderRadius: 8, background: "#FFFDE7", color: "#92400E", fontWeight: 800, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" as const }}>MAX</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#F9FAFB", borderRadius: 8, marginBottom: 18 }}>
            <span style={{ fontSize: 13, color: "#6B7280" }}>预计获得</span>
            <span style={{ fontFamily: F.mono, fontWeight: 800, fontSize: 16, color: "#1C1C2E" }}>
              {ptsInput ? (Number(ptsInput)/1000).toFixed(2) : "0.00"} <span style={{ fontSize: 12, fontWeight: 500 }}>云币</span>
            </span>
          </div>
          <button onClick={() => { doExchange(); setTimeout(() => setExchModal(false), 1800); }} disabled={exchStep !== "idle" || !ptsInput || Number(ptsInput) < 1000}
            style={{ width: "100%", padding: "11px", border: "none", borderRadius: 8, background: exchStep === "ok" ? "#16A34A" : (ptsInput && Number(ptsInput) >= 1000) ? "#1C1C2E" : "#E5E7EB", color: exchStep === "ok" ? "#fff" : (ptsInput && Number(ptsInput) >= 1000) ? C.yellow : "#9CA3AF", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: F.cn, transition: "background .2s" }}>
            {exchStep === "idle" ? "确认兑换" : exchStep === "loading" ? "处理中…" : "✓ 兑换成功"}
          </button>
        </ModalShell>
      )}

      {/* 购买激活卡 modal */}
      {buyModal && (
        <ModalShell title="购买激活卡" onClose={() => { if (buyStep !== "loading") setBuyModal(false); }}>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 16, padding: "8px 12px", background: "#F8FAFC", borderRadius: 7, borderLeft: "3px solid #CBD5E1" }}>
            每张激活卡授权 1 台终端 · 有效期 1 年
          </div>
          <label style={S.label}>支付方式</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["pts","yunbi"] as const).map(m => (
              <button key={m} onClick={() => setBuyMethod(m)}
                style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: `1.5px solid ${buyMethod===m?"#1C1C2E":"#E5E7EB"}`, background: buyMethod===m?"#1C1C2E":"#fff", fontWeight: 700, fontSize: 13, color: buyMethod===m?"#FFD700":"#6B7280", cursor: "pointer", lineHeight: 1.4, textAlign: "center" as const }}>
                {m==="pts"?<><div>积分支付</div><div style={{ fontSize: 11, fontFamily: F.mono }}>50,000 / 张</div></>:<><div>云币支付</div><div style={{ fontSize: 11, fontFamily: F.mono }}>500 / 张</div></>}
              </button>
            ))}
          </div>
          <label style={S.label}>购买数量</label>
          <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #D1D5DB", borderRadius: 8, overflow: "hidden", marginBottom: 18 }}>
            <button onClick={() => setBuyQty(q => Math.max(1,q-1))} style={{ padding: "10px 18px", border: "none", background: "#F9FAFB", cursor: "pointer", fontWeight: 800, fontSize: 18, color: "#374151" }}>−</button>
            <span style={{ flex: 1, textAlign: "center", fontWeight: 800, fontSize: 16, fontFamily: F.mono, borderLeft: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", padding: "10px" }}>{buyQty}</span>
            <button onClick={() => setBuyQty(q => Math.min(10,q+1))} style={{ padding: "10px 18px", border: "none", background: "#F9FAFB", cursor: "pointer", fontWeight: 800, fontSize: 18, color: "#374151" }}>+</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6B7280", marginBottom: 18, padding: "8px 12px", background: "#F9FAFB", borderRadius: 7 }}>
            <span>合计费用</span>
            <strong style={{ color: "#1C1C2E", fontFamily: F.mono }}>
              {buyMethod === "pts" ? `${(buyQty * CARD_PTS).toLocaleString()} 积分` : `${buyQty * CARD_YUNBI} 云币`}
            </strong>
          </div>
          <button onClick={() => { doBuy(); setTimeout(() => setBuyModal(false), 2000); }} disabled={!canBuy || buyStep !== "idle"}
            style={{ width: "100%", padding: "11px", border: "none", borderRadius: 8, background: buyStep === "ok" ? "#16A34A" : canBuy ? "#1C1C2E" : "#E5E7EB", color: buyStep === "ok" ? "#fff" : canBuy ? "#FFD700" : "#9CA3AF", fontWeight: 800, fontSize: 14, cursor: canBuy ? "pointer" : "not-allowed", fontFamily: F.cn }}>
            {buyStep === "idle" ? `确认购买 ${buyQty} 张` : buyStep === "loading" ? "处理中…" : "✓ 购买成功"}
          </button>
        </ModalShell>
      )}

      {/* 积分兑换激活卡 modal */}
      {ptsRedeemModal && (
        <ModalShell title="积分兑换激活卡" onClose={() => { if (redeemStep !== "loading") setPtsRedeemModal(false); }}>
          <div style={{ padding: "10px 14px", background: "#FFFDE7", borderRadius: 8, borderLeft: "3px solid #D97706", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#92400E", fontWeight: 700, marginBottom: 4 }}>🎉 兑换还赠抽奖卡，有机会再得激活卡！立即兑换，免手续费！</div>
            <div style={{ fontSize: 12, color: "#78350F" }}>每张 50,000 积分 · 免手续费 · 同赠 1 张抽奖卡</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <label style={S.label}>兑换数量</label>
            <span style={{ fontSize: 12, color: "#6B7280" }}>余额 <strong style={{ color: "#1C1C2E", fontFamily: F.mono }}>{pts.toLocaleString()}</strong> 积分</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #D1D5DB", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
            <button onClick={() => setRedeemQty(q => Math.max(1, q-1))} style={{ padding: "10px 18px", border: "none", background: "#F9FAFB", cursor: "pointer", fontWeight: 800, fontSize: 18, color: "#374151" }}>−</button>
            <span style={{ flex: 1, textAlign: "center" as const, fontWeight: 800, fontSize: 16, fontFamily: F.mono, borderLeft: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", padding: "10px" }}>{redeemQty}</span>
            <button onClick={() => setRedeemQty(q => Math.min(maxRedeem, q+1))} style={{ padding: "10px 18px", border: "none", background: "#F9FAFB", cursor: "pointer", fontWeight: 800, fontSize: 18, color: "#374151" }}>+</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6B7280", marginBottom: 6, padding: "10px 14px", background: "#F9FAFB", borderRadius: 8 }}>
            <span>花费积分</span>
            <strong style={{ color: "#D97706", fontFamily: F.mono }}>{(redeemQty * 50000).toLocaleString()} 积分</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6B7280", marginBottom: 18, padding: "10px 14px", background: "#F0FDF4", borderRadius: 8 }}>
            <span>获得</span>
            <strong style={{ color: "#16A34A" }}>激活卡 × {redeemQty} + 抽奖卡 × {redeemQty}（免手续费）</strong>
          </div>
          <button onClick={() => { doRedeem(); setTimeout(() => setPtsRedeemModal(false), 2000); }} disabled={redeemStep !== "idle" || pts < redeemQty * 50000}
            style={{ width: "100%", padding: "11px", border: "none", borderRadius: 8, background: redeemStep === "ok" ? "#16A34A" : pts >= redeemQty * 50000 ? "#1C1C2E" : "#E5E7EB", color: redeemStep === "ok" ? "#fff" : pts >= redeemQty * 50000 ? "#FFD700" : "#9CA3AF", fontWeight: 800, fontSize: 14, cursor: pts >= redeemQty * 50000 ? "pointer" : "not-allowed", fontFamily: F.cn }}>
            {redeemStep === "idle" ? `确认兑换 ${redeemQty} 张` : redeemStep === "loading" ? "处理中…" : "✓ 兑换成功"}
          </button>
        </ModalShell>
      )}

      {/* 购买云币 modal */}
      {buyYunbiModal && (
        <ModalShell title="购买云币" onClose={() => { if (!yunbiLoading) { setBuyYunbiModal(false); setYunbiStep("summary"); setYunbiEmail(""); setYunbiOtp(""); setYunbiOtpSent(false); } }}>
          {yunbiStep === "summary" && (<>
            <div style={{ padding: "12px 14px", background: "#F8FAFC", borderRadius: 8, borderLeft: "3px solid #CBD5E1", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#374151", fontWeight: 700, marginBottom: 4 }}>购买详情</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>当前云币余额：<strong style={{ fontFamily: F.mono, color: "#1C1C2E" }}>{yunbi.toFixed(2)}</strong> 云币</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "#F9FAFB", borderRadius: 8, marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: "#6B7280" }}>购买数量</span>
              <strong style={{ fontFamily: F.mono, color: "#1C1C2E" }}>500 云币</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "#F9FAFB", borderRadius: 8, marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: "#6B7280" }}>法币金额</span>
              <strong style={{ fontFamily: F.mono, color: "#D97706" }}>¥500.00</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "#F0FDF4", borderRadius: 8, marginBottom: 18, fontSize: 13 }}>
              <span style={{ color: "#15803D" }}>赠品</span>
              <strong style={{ color: "#16A34A" }}>激活卡 × 1 + 抽奖卡 × 1</strong>
            </div>
            <button onClick={() => setYunbiStep("otp")}
              style={{ width: "100%", padding: "11px", border: "none", borderRadius: 8, background: "#1C1C2E", color: "#FFD700", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>
              继续 → 邮箱验证
            </button>
          </>)}
          {yunbiStep === "otp" && (<>
            <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 16, padding: "8px 12px", background: "#EFF6FF", borderRadius: 7, borderLeft: "3px solid #3B82F6" }}>
              为保障账户安全，购买云币需要邮箱验证码验证
            </div>
            <label style={S.label}>邮箱地址</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input value={yunbiEmail} onChange={e => setYunbiEmail(e.target.value)} type="email" placeholder="输入您的邮箱"
                style={{ ...S.input, flex: 1, marginBottom: 0 }} onFocus={focusGold} onBlur={blurGray} />
              <button onClick={sendYunbiOtp} disabled={yunbiOtpSent || !yunbiEmail.includes("@")}
                style={{ padding: "9px 14px", borderRadius: 7, border: "none", background: yunbiOtpSent ? "#E5E7EB" : "#1C1C2E", color: yunbiOtpSent ? "#9CA3AF" : "#FFD700", fontWeight: 700, fontSize: 12, cursor: yunbiOtpSent ? "not-allowed" : "pointer", fontFamily: F.cn, whiteSpace: "nowrap" as const }}>
                {yunbiOtpSent ? "已发送" : "发送验证码"}
              </button>
            </div>
            {yunbiOtpSent && (
              <div style={{ fontSize: 11, color: "#16A34A", marginBottom: 10 }}>✓ 验证码已发送至 {yunbiEmail}（任意6位数字均可）</div>
            )}
            <label style={S.label}>6 位验证码</label>
            <input value={yunbiOtp} onChange={e => setYunbiOtp(e.target.value.replace(/\D/g,"").slice(0,6))} type="text" placeholder="输入验证码"
              style={{ ...S.inputM, marginBottom: 18 }} onFocus={focusGold} onBlur={blurGray} maxLength={6} />
            <button onClick={confirmYunbiBuy} disabled={yunbiOtp.length !== 6 || yunbiLoading}
              style={{ width: "100%", padding: "11px", border: "none", borderRadius: 8, background: yunbiOtp.length === 6 ? "#1C1C2E" : "#E5E7EB", color: yunbiOtp.length === 6 ? "#FFD700" : "#9CA3AF", fontWeight: 800, fontSize: 14, cursor: yunbiOtp.length === 6 ? "pointer" : "not-allowed", fontFamily: F.cn }}>
              {yunbiLoading ? "处理中…" : "确认购买"}
            </button>
          </>)}
          {yunbiStep === "ok" && (
            <div style={{ textAlign: "center" as const, padding: "32px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#16A34A", marginBottom: 8 }}>购买成功！</div>
              <div style={{ fontSize: 13, color: "#6B7280" }}>500 云币、1 张激活卡、1 张抽奖卡已发放至您的账户</div>
            </div>
          )}
        </ModalShell>
      )}

      {/* ══ Bottom tab panel ══ */}
      <div style={{ ...S.card, overflow: "hidden" }}>
        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: "1px solid #E5E7EB", background: "#FAFAFA", overflowX: "auto" as const }}>
          {([
            { key: "cards",            label: "我的激活卡",  badge: `${cards.filter(c=>c.status==="未使用").length} 可用` },
            { key: "lottery",          label: "抽 奖",       badge: lotteryCards > 0 ? `${lotteryCards} 张` : "" },
            { key: "exchange_history", label: "兑换记录",    badge: "" },
            { key: "lottery_history",  label: "抽奖记录",    badge: "" },
            { key: "market",           label: "挂卖市场",    badge: listings.length > 0 ? `${listings.filter(l=>l.status==="挂卖中").length} 挂卖中` : "" },
            { key: "history",          label: "云币历史",    badge: `${history.length}` },
          ] as { key: "cards"|"lottery"|"exchange_history"|"lottery_history"|"market"|"history"; label: string; badge: string }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: "12px 16px", border: "none", background: "transparent", fontWeight: tab===t.key ? 700 : 500, fontSize: 13, color: tab===t.key ? "#1C1C2E" : "#6B7280", cursor: "pointer", borderBottom: tab===t.key ? "2px solid #1C1C2E" : "2px solid transparent", fontFamily: F.cn, display: "flex", alignItems: "center", gap: 6, marginBottom: -1, whiteSpace: "nowrap" as const }}>
              {t.label}
              {t.badge && <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: tab===t.key ? "#1C1C2E" : "#E5E7EB", color: tab===t.key ? "#FFD700" : "#6B7280" }}>{t.badge}</span>}
            </button>
          ))}
        </div>

        {/* ── 我的激活卡 ── */}
        {tab === "cards" && (() => {
          const { rows: cardRows, total: cardTotal, pages: cardPages } = filterAndPage(
            cards, cardsSearch, cardsFrom, cardsTo, cardsPage,
            (c, q) => c.orderId.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.status.includes(q),
            c => c.purchaseDate
          );
          return (<>
          <ListBar search={cardsSearch} onSearch={v => { setCardsSearch(v); setCardsPage(1); }}
            dateFrom={cardsFrom} onDateFrom={v => { setCardsFrom(v); setCardsPage(1); }}
            dateTo={cardsTo} onDateTo={v => { setCardsTo(v); setCardsPage(1); }}
            total={cardTotal} label="张激活卡" />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["卡订单号","购买日期","授权类型","到期时间","状态","操作"].map((h,i) => (
                  <th key={h} style={{ padding: "11px 16px", fontWeight: 600, color: "#6B7280", fontSize: 14, textAlign: i>=4?"center":"left", borderBottom: "1px solid #E5E7EB" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cardRows.map((c, i) => (
                <tr key={c.orderId} style={{ background: i%2===0?"#fff":"#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "11px 16px", fontFamily: F.mono, fontSize: 12, color: "#374151", fontWeight: 600 }}>{c.orderId}</td>
                  <td style={{ padding: "11px 16px", color: "#6B7280", fontSize: 13 }}>{c.purchaseDate}</td>
                  <td style={{ padding: "11px 16px", color: "#374151", fontSize: 13 }}>终端授权 · 1 年</td>
                  <td style={{ padding: "11px 16px", color: "#374151", fontSize: 13, fontFamily: F.mono }}>{c.expiry}</td>
                  <td style={{ padding: "11px 16px", textAlign: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: statusColor(c.status), background: statusColor(c.status)+"18", borderRadius: 5, padding: "3px 10px" }}>{c.status}</span>
                  </td>
                  <td style={{ padding: "11px 16px", textAlign: "center" }}>
                    {c.status === "未使用" && (
                      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                        <button onClick={() => { setUseCard(c); setUseStep("form"); }}
                          style={{ ...S.btnSm, fontSize: 12, background: "#1C1C2E", color: "#FFD700", borderColor: "#1C1C2E" }}>使用</button>
                      </div>
                    )}
                    {c.status === "已绑定" && (
                      <div>
                        <button onClick={() => setRevealId(revealId === c.orderId ? null : c.orderId)}
                          style={{ ...S.btnSm, fontSize: 12 }}>卡密</button>
                        {revealId === c.orderId && (
                          <div style={{ marginTop: 6, textAlign: "left" as const }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                              <div style={{ fontFamily: F.mono, fontSize: 11, color: "#111827", letterSpacing: 1, padding: "6px 10px", background: "#F9FAFB", borderRadius: 5, border: "1px solid #E5E7EB", wordBreak: "break-all" as const, flex: 1 }}>{c.code}</div>
                              <button onClick={() => navigator.clipboard.writeText(c.code).catch(() => {})}
                                style={{ flexShrink: 0, padding: "5px 8px", border: "1px solid #E5E7EB", borderRadius: 5, background: "#fff", cursor: "pointer", color: "#6B7280", fontSize: 11 }}>复制</button>
                            </div>
                            <div style={{ fontSize: 11, color: "#16A34A", lineHeight: 1.4 }}>已激活 · {c.device?.slice(0,14)}…</div>
                          </div>
                        )}
                      </div>
                    )}
                    {c.status === "已转让" && (
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", background: "#F3F4F6", borderRadius: 5, padding: "3px 10px" }}>已转让</span>
                        {c.transferTo && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>{c.transferTo}</div>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {cardRows.length === 0 && <tr><td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>{cards.length === 0 ? "暂无激活卡 — 可在上方购买" : "无匹配记录"}</td></tr>}
            </tbody>
          </table>
          <ListPager page={Math.min(cardsPage, cardPages)} pages={cardPages} onChange={setCardsPage} />
          </>);
        })()}

        {/* ── 抽奖 ── */}
        {tab === "lottery" && (
          <div style={{ padding: "24px 22px" }}>
            {/* Card count hero */}
            <div style={{ background: "linear-gradient(135deg,#0f1729 0%,#1e2d55 100%)", borderRadius: 12, padding: "24px", marginBottom: 20, textAlign: "center" as const }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 8 }}>您拥有的抽奖卡</div>
              <div style={{ fontSize: 52, fontWeight: 900, color: "#FFD700", fontFamily: F.mono, lineHeight: 1 }}>{lotteryCards}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginTop: 6, marginBottom: 20 }}>张</div>
              {lotteryResult && (
                <div style={{ marginBottom: 16, padding: "10px 20px", borderRadius: 8, background: lotteryResult === "win" ? "rgba(22,163,74,.2)" : "rgba(156,163,175,.1)", color: lotteryResult === "win" ? "#86EFAC" : "rgba(255,255,255,.6)", fontWeight: 700, fontSize: 14 }}>
                  {lotteryResult === "win" ? "🎉 恭喜中奖！激活卡已发放至您的账户！" : "未中奖，再接再厉！"}
                </div>
              )}
              <button onClick={doSpin} disabled={lotteryCards < 1 || lotterySpinning}
                style={{ padding: "12px 40px", borderRadius: 9, border: "none", background: lotteryCards < 1 ? "#374151" : "#FFD700", color: lotteryCards < 1 ? "#6B7280" : "#0f1729", fontWeight: 900, fontSize: 16, cursor: lotteryCards < 1 ? "not-allowed" : "pointer", fontFamily: F.cn, transition: "transform .1s", transform: lotterySpinning ? "scale(.96)" : "scale(1)" }}>
                {lotterySpinning ? "抽奖中…" : lotteryCards < 1 ? "暂无抽奖卡" : "使用抽奖卡"}
              </button>
            </div>

            {/* Rules */}
            <div style={{ background: "#FFFDE7", borderRadius: 10, padding: "16px 18px", marginBottom: 20, borderLeft: "3px solid #D97706" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#92400E", marginBottom: 10 }}>📋 抽奖规则</div>
              {[
                "每张抽奖卡参与一次抽奖机会",
                "中奖率约 10%，奖品为一张激活卡",
                "积分 / 云币兑换激活卡可免费获得抽奖卡",
                "抽奖卡不可转让，不可兑换积分",
                "平台保留最终解释权",
              ].map((r, i) => (
                <div key={i} style={{ fontSize: 12, color: "#78350F", marginBottom: 5, display: "flex", gap: 8 }}>
                  <span style={{ color: "#D97706", fontWeight: 700, flexShrink: 0 }}>·</span>{r}
                </div>
              ))}
            </div>

            {/* Recent lottery results */}
            <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 10 }}>最近抽奖记录</div>
            {lotteryHistory.slice(0, 5).map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: i%2===0?"#F9FAFB":"#fff", borderRadius: 8, marginBottom: 6, border: "1px solid #F3F4F6" }}>
                <span style={{ fontSize: 20 }}>{r.result.includes("中奖") ? "🎉" : "😐"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: r.result.includes("中奖") ? "#16A34A" : "#6B7280" }}>{r.result}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>{r.date}</div>
                </div>
                <div style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{r.reward}</div>
              </div>
            ))}
            {lotteryHistory.length === 0 && <div style={{ textAlign: "center" as const, color: "#9CA3AF", padding: "24px", fontSize: 13 }}>暂无抽奖记录</div>}
          </div>
        )}

        {/* ── 兑换记录 ── */}
        {tab === "exchange_history" && (() => {
          const { rows: eRows, total: eTotal, pages: ePages } = filterAndPage(
            exchangeHistory, exchHSearch, exchHFrom, exchHTo, exchHPage,
            (r, q) => r.method.toLowerCase().includes(q) || r.cost.toLowerCase().includes(q) || r.reward.toLowerCase().includes(q),
            r => r.date
          );
          return (<>
          <ListBar search={exchHSearch} onSearch={v => { setExchHSearch(v); setExchHPage(1); }}
            dateFrom={exchHFrom} onDateFrom={v => { setExchHFrom(v); setExchHPage(1); }}
            dateTo={exchHTo} onDateTo={v => { setExchHTo(v); setExchHPage(1); }}
            total={eTotal} label="条记录" />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#F9FAFB" }}>
              {["日期","方式","花费","获得"].map((h, i) => (
                <th key={h} style={{ padding: "11px 16px", fontWeight: 600, color: "#6B7280", fontSize: 14, textAlign: i >= 2 ? "center" as const : "left" as const, borderBottom: "1px solid #E5E7EB" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {eRows.length === 0 && <tr><td colSpan={4} style={{ padding: "48px", textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>暂无兑换记录</td></tr>}
              {eRows.map((r, i) => (
                <tr key={i} style={{ background: i%2===0?"#fff":"#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "11px 16px", color: "#6B7280", fontSize: 12, fontFamily: F.mono }}>{r.date}</td>
                  <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 600, color: "#374151" }}>{r.method}</td>
                  <td style={{ padding: "11px 16px", textAlign: "center" as const, fontSize: 13, fontFamily: F.mono, color: "#D97706" }}>{r.cost}</td>
                  <td style={{ padding: "11px 16px", textAlign: "center" as const, fontSize: 13, color: "#16A34A", fontWeight: 700 }}>{r.reward}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ListPager page={Math.min(exchHPage, ePages)} pages={ePages} onChange={setExchHPage} />
          </>);
        })()}

        {/* ── 抽奖记录 ── */}
        {tab === "lottery_history" && (() => {
          const { rows: lRows, total: lTotal, pages: lPages } = filterAndPage(
            lotteryHistory, lottHSearch, lottHFrom, lottHTo, lottHPage,
            (r, q) => r.result.toLowerCase().includes(q) || r.reward.toLowerCase().includes(q),
            r => r.date
          );
          return (<>
          <ListBar search={lottHSearch} onSearch={v => { setLottHSearch(v); setLottHPage(1); }}
            dateFrom={lottHFrom} onDateFrom={v => { setLottHFrom(v); setLottHPage(1); }}
            dateTo={lottHTo} onDateTo={v => { setLottHTo(v); setLottHPage(1); }}
            total={lTotal} label="条记录" />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#F9FAFB" }}>
              {["日期","结果","奖励"].map((h, i) => (
                <th key={h} style={{ padding: "11px 16px", fontWeight: 600, color: "#6B7280", fontSize: 14, textAlign: i >= 1 ? "center" as const : "left" as const, borderBottom: "1px solid #E5E7EB" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {lRows.length === 0 && <tr><td colSpan={3} style={{ padding: "48px", textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>暂无抽奖记录</td></tr>}
              {lRows.map((r, i) => (
                <tr key={i} style={{ background: i%2===0?"#fff":"#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "11px 16px", color: "#6B7280", fontSize: 12, fontFamily: F.mono }}>{r.date}</td>
                  <td style={{ padding: "11px 16px", textAlign: "center" as const }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: r.result.includes("中奖") ? "#16A34A" : "#6B7280", background: r.result.includes("中奖") ? "#F0FDF4" : "#F3F4F6", borderRadius: 5, padding: "3px 10px" }}>{r.result}</span>
                  </td>
                  <td style={{ padding: "11px 16px", textAlign: "center" as const, fontSize: 13, fontWeight: 600, color: r.reward === "—" ? "#9CA3AF" : "#374151" }}>{r.reward}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ListPager page={Math.min(lottHPage, lPages)} pages={lPages} onChange={setLottHPage} />
          </>);
        })()}

        {/* ── 挂卖市场 ── */}
        {tab === "market" && (() => {
          const { rows: mRows, total: mTotal, pages: mPages } = filterAndPage(
            listings, listSearch, listFrom, listTo, listPage,
            (l, q) => l.id.toLowerCase().includes(q) || l.status.includes(q),
            l => l.date
          );
          return (<>
          <ListBar search={listSearch} onSearch={v => { setListSearch(v); setListPage(1); }}
            dateFrom={listFrom} onDateFrom={v => { setListFrom(v); setListPage(1); }}
            dateTo={listTo} onDateTo={v => { setListTo(v); setListPage(1); }}
            total={mTotal} label="条挂单" />
          {mRows.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
              <div style={{ opacity: .25, color: C.muted, display: "flex", justifyContent: "center", marginBottom: 10 }}>{Ic.list}</div>
              {listings.length === 0 ? "暂无挂卖记录 — 点击资产栏「挂卖」按钮发起挂单" : "无匹配记录"}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#F9FAFB" }}>
                {["挂单号","挂卖数量","单价 (USDT)","总额 (USDT)","挂单日期","状态"].map((h,i) => (
                  <th key={h} style={{ padding: "11px 16px", fontWeight: 600, color: "#6B7280", fontSize: 14, textAlign: i>=2?"center":"left", borderBottom: "1px solid #E5E7EB" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {mRows.map((l, i) => (
                  <tr key={l.id} style={{ background: i%2===0?"#fff":"#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "11px 16px", fontFamily: F.mono, fontSize: 13, color: "#374151", fontWeight: 600 }}>{l.id}</td>
                    <td style={{ padding: "11px 16px", fontFamily: F.mono, fontSize: 14, fontWeight: 700 }}>{l.qty.toFixed(2)} 云币</td>
                    <td style={{ padding: "11px 16px", textAlign: "center", fontFamily: F.mono, fontSize: 14 }}>{l.price.toFixed(2)}</td>
                    <td style={{ padding: "11px 16px", textAlign: "center", fontFamily: F.mono, fontSize: 14, fontWeight: 700 }}>{(l.qty*l.price).toFixed(2)}</td>
                    <td style={{ padding: "11px 16px", textAlign: "center", color: "#6B7280", fontSize: 13 }}>{l.date}</td>
                    <td style={{ padding: "11px 16px", textAlign: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: l.status==="挂卖中"?"#D97706":l.status==="已成交"?"#16A34A":"#9CA3AF", background: l.status==="挂卖中"?"#FFFBEB":l.status==="已成交"?"#F0FDF4":"#F3F4F6", borderRadius: 5, padding: "3px 10px" }}>{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <ListPager page={Math.min(listPage, mPages)} pages={mPages} onChange={setListPage} />
          </>);
        })()}

        {/* ── 历史记录 ── */}
        {tab === "history" && (() => {
          const { rows: hRows, total: hTotal, pages: hPages } = filterAndPage(
            history, histSearch, histFrom, histTo, histPage,
            (r, q) => r.type.includes(q) || r.detail.toLowerCase().includes(q) || r.status.includes(q),
            r => r.date
          );
          return (<>
          <ListBar search={histSearch} onSearch={v => { setHistSearch(v); setHistPage(1); }}
            dateFrom={histFrom} onDateFrom={v => { setHistFrom(v); setHistPage(1); }}
            dateTo={histTo} onDateTo={v => { setHistTo(v); setHistPage(1); }}
            total={hTotal} label="条记录" />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#F9FAFB" }}>
              {["时间","类型","详情","状态"].map((h,i) => (
                <th key={h} style={{ padding: "11px 16px", fontWeight: 600, color: "#6B7280", fontSize: 14, textAlign: i>=3?"center":"left", borderBottom: "1px solid #E5E7EB" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {hRows.length === 0 && <tr><td colSpan={4} style={{ padding: "48px", textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>暂无记录</td></tr>}
              {hRows.map((r, i) => {
                const [fg, bg] = typeBadgeColor[r.type] ?? ["#6B7280","#F3F4F6"];
                return (
                  <tr key={i} style={{ background: i%2===0?"#fff":"#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "11px 16px", color: "#6B7280", fontSize: 12, fontFamily: F.mono, whiteSpace: "nowrap" as const }}>{r.date}</td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 5, padding: "3px 9px" }}>{r.type}</span>
                    </td>
                    <td style={{ padding: "11px 16px", color: "#374151", fontSize: 13 }}>{r.detail}</td>
                    <td style={{ padding: "11px 16px", textAlign: "center" }}>{statusBadge(r.status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <ListPager page={Math.min(histPage, hPages)} pages={hPages} onChange={setHistPage} />
          </>);
        })()}
      </div>

      {/* ══ MODALS ══ */}

      {/* 绑定钱包 */}
      {walletModal && (
        <ModalShell title="绑定收款地址" onClose={() => { if (walletStep !== "loading") { setWalletModal(false); setWalletStep("form"); setWalletInput(""); } }}>
          {walletStep !== "done" ? (<>
            {/* Show both chain statuses */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              {(["BSC","Tron"] as const).map(n => {
                const addr = n === "BSC" ? walletAddrBSC : walletAddrTron;
                const bound = addr !== "";
                return (
                  <div key={n} style={{ padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${bound ? "#D1FAE5" : "#E5E7EB"}`, background: bound ? "#F0FDF4" : "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1C1C2E" }}>{n === "BSC" ? "BSC (BEP-20)" : "Tron (TRC-20)"}{n === "BSC" && <span style={{ marginLeft: 6, fontSize: 11, color: "#16A34A", fontWeight: 600 }}>推荐</span>}</div>
                      {bound ? <div style={{ fontSize: 11, fontFamily: F.mono, color: "#6B7280", marginTop: 2 }}>{addr.slice(0,14)}…{addr.slice(-6)}</div>
                        : <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>未绑定</div>}
                    </div>
                    {bound
                      ? <span style={{ fontSize: 12, fontWeight: 700, color: "#16A34A" }}>✓ 已绑定</span>
                      : <button onClick={() => { setWalletNet(n); setWalletInput(""); }}
                          style={{ padding: "5px 12px", borderRadius: 6, border: `1.5px solid #1C1C2E`, background: walletNet === n ? "#1C1C2E" : "#fff", color: walletNet === n ? C.yellow : "#1C1C2E", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                          {walletNet === n ? "▼ 输入地址" : "绑定"}
                        </button>}
                  </div>
                );
              })}
            </div>
            {/* Input for currently selected chain (only if not bound) */}
            {(walletNet === "BSC" ? walletAddrBSC : walletAddrTron) === "" && (<>
              <div style={{ marginBottom: 10 }}>
                <label style={S.label}>绑定 {walletNet === "BSC" ? "BSC (BEP-20)" : "Tron (TRC-20)"} 地址</label>
                <input value={walletInput} onChange={e => setWalletInput(e.target.value)} placeholder={walletNet==="Tron"?"T 开头的 TRC-20 地址":"0x 开头的 BSC 地址"}
                  style={S.inputM} onFocus={focusGold} onBlur={blurGray} autoFocus />
              </div>
              <div style={{ padding: "8px 12px", background: "#FFFBEB", borderRadius: 7, fontSize: 12, color: "#92400E", lineHeight: 1.7, marginBottom: 14 }}>
                地址绑定后不可自行修改，如需变更请联系客服。请仔细核对，转账错误导致的损失平台不承担责任。
              </div>
              <button onClick={doBindWallet} disabled={!walletInput.trim() || walletStep==="loading"}
                style={{ ...S.btnPri, width: "100%", background: walletInput.trim()?"#1C1C2E":"#D1D5DB" }}>
                {walletStep === "loading" ? "绑定中..." : "确认绑定"}
              </button>
            </>)}
            {walletAddrBSC !== "" && walletAddrTron !== "" && (
              <div style={{ textAlign: "center", padding: "10px 0", fontSize: 13, color: "#16A34A", fontWeight: 600 }}>两条链地址均已绑定</div>
            )}
          </>) : (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 44, marginBottom: 8, color: "#16A34A" }}>✓</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#16A34A" }}>地址绑定成功</div>
            </div>
          )}
        </ModalShell>
      )}

      {/* 提现 */}
      {wdModal && (
        <ModalShell title="申请提现" onClose={() => { if (wdStep==="idle") setWdModal(false); }}>
          {wdStep !== "ok" ? (<>
            {/* chain selector */}
            <label style={S.label}>收款网络</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {(["BSC","Tron"] as const).map(n => (
                <button key={n} onClick={() => setWalletNet(n)}
                  style={{ flex: 1, padding: "9px 8px", borderRadius: 8, border: `1.5px solid ${walletNet===n?"#1C1C2E":"#E5E7EB"}`, background: walletNet===n?"#1C1C2E":"#fff", fontWeight: 700, fontSize: 13, color: walletNet===n?"#FFD700":"#6B7280", cursor: "pointer", lineHeight: 1.4, textAlign: "center" as const }}>
                  <div>{n === "BSC" ? "BSC (BEP-20)" : "Tron (TRC-20)"}</div>
                  <div style={{ fontSize: 11, fontWeight: 400, opacity: .7 }}>{n === "Tron" ? "额外 +1% 手续费" : "推荐"}</div>
                </button>
              ))}
            </div>
            {!walletBoundNet && (
              <div style={{ padding: "8px 12px", background: "#FEF2F2", borderRadius: 7, fontSize: 12, color: "#DC2626", marginBottom: 12 }}>
                当前网络尚未绑定收款地址 — <button onClick={() => { setWdModal(false); setWalletModal(true); setWalletStep("form"); setWalletInput(""); }} style={{ border: "none", background: "none", color: "#DC2626", fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: 0 }}>立即绑定</button>
              </div>
            )}
            {walletBoundNet && <div style={{ padding: "7px 12px", background: "#F0FDF4", borderRadius: 7, fontSize: 12, color: "#16A34A", marginBottom: 12, fontFamily: F.mono }}>
              {walletAddr.slice(0,14)}…{walletAddr.slice(-6)}
            </div>}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <label style={{ ...S.label, marginBottom: 0 }}>提现云币数量</label>
                <span style={{ fontSize: 12, color: "#6B7280" }}>可用 <strong style={{ color: "#1C1C2E" }}>{yunbi.toFixed(2)}</strong> 云币</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={wdAmt} onChange={e => setWdAmt(e.target.value)} type="number" placeholder="输入云币数量"
                  style={{ ...S.inputM, marginBottom: 0, flex: 1 }} onFocus={focusGold} onBlur={blurGray} />
                <button onClick={() => setWdAmt(yunbi.toFixed(2))}
                  style={{ padding: "0 14px", border: `1.5px solid ${C.yellow}`, borderRadius: 8, background: "#FFFDE7", color: "#92400E", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>MAX</button>
              </div>
            </div>
            <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "12px 14px", marginBottom: 12, fontSize: 13, lineHeight: 2 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B7280" }}>提现金额</span>
                <span style={{ fontFamily: F.mono, fontWeight: 700 }}>{wdAmt||"0"} 云币</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B7280" }}>平台手续费 ({(totalFee*100).toFixed(0)}%)</span>
                <span style={{ fontFamily: F.mono, color: "#D97706" }}>−{wdFeeFull.toFixed(2)} 云币</span>
              </div>
              {poolOffset > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#16A34A" }}>签到云币抵扣</span>
                  <span style={{ fontFamily: F.mono, color: "#16A34A", fontWeight: 700 }}>+{poolOffset.toFixed(4)} 云币</span>
                </div>
              )}
              {walletNet === "Tron" && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#D97706" }}>其中 Tron 链附加 (1%)</span>
                  <span style={{ fontFamily: F.mono, color: "#D97706" }}>−{wdRawAmt ? (wdRawAmt*0.01).toFixed(2) : "0.00"} 云币</span>
                </div>
              )}
              <div style={{ height: 1, background: "#E5E7EB", margin: "6px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>预计到账 USDT</span>
                <span style={{ fontFamily: F.mono, fontWeight: 800, fontSize: 15, color: "#1C1C2E" }}>{wdUsdt} USDT</span>
              </div>
            </div>
            {/* 签到云币抵扣手续费开关 */}
            <div onClick={() => feePool > 0 && setWdUsePool(p => !p)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                background: feePool === 0 ? "#F3F4F6" : wdUsePool ? "#F0FDF4" : "#F9FAFB",
                border: `1.5px solid ${feePool === 0 ? "#E5E7EB" : wdUsePool ? "#86EFAC" : "#E5E7EB"}`,
                borderRadius: 8, cursor: feePool > 0 ? "pointer" : "not-allowed",
                marginBottom: 12, userSelect: "none" as const, opacity: feePool === 0 ? 0.6 : 1 }}>
              <div style={{ width: 18, height: 18, borderRadius: 4,
                border: `2px solid ${feePool === 0 ? "#D1D5DB" : wdUsePool ? "#16A34A" : "#D1D5DB"}`,
                background: wdUsePool && feePool > 0 ? "#16A34A" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {wdUsePool && feePool > 0 && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: feePool === 0 ? "#9CA3AF" : wdUsePool ? "#166534" : "#1C1C2E" }}>
                  使用签到云币抵扣手续费
                </div>
                <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2, display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                  <span>签到云币余额：<strong style={{ fontFamily: F.mono, color: feePool > 0 ? "#10B981" : "#9CA3AF" }}>{feePool.toFixed(2)}</strong></span>
                  {wdUsePool && poolOffset > 0 && <span style={{ color: "#16A34A" }}>可抵扣：<strong style={{ fontFamily: F.mono }}>−{poolOffset.toFixed(2)}</strong></span>}
                  {feePool === 0 && <span>（签到后积累可用）</span>}
                </div>
              </div>
              {feePool > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                  background: wdUsePool ? "#DCFCE7" : "#F3F4F6", color: wdUsePool ? "#166534" : "#9CA3AF",
                  border: `1px solid ${wdUsePool ? "#86EFAC" : "#E5E7EB"}` }}>
                  {wdUsePool ? "已启用" : "点击启用"}
                </span>
              )}
            </div>
            <div style={{ padding: "8px 12px", background: "#FFFDE7", borderRadius: 7, fontSize: 12, color: "#92400E", marginBottom: 12, lineHeight: 1.6 }}>
              提现申请经人工审核后到账，通常在 <strong>24 小时内</strong>处理完成，节假日可能顺延。
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>交易密码（二次验证）</label>
              <input value={wdPayPwd} onChange={e => { setWdPayPwd(e.target.value); setWdPayErr(false); }} type="password" placeholder="请输入交易密码"
                style={{ ...S.input, borderColor: wdPayErr ? "#DC2626" : "#D1D5DB" }}
                onFocus={e => (e.target.style.borderColor = wdPayErr ? "#DC2626" : "#D97706")} onBlur={e => (e.target.style.borderColor = wdPayErr ? "#DC2626" : "#D1D5DB")}
              />
              {wdPayErr && <div style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>请输入交易密码</div>}
            </div>
            <button onClick={doWithdraw} disabled={!wdAmt||Number(wdAmt)>yunbi||!walletBoundNet||wdStep==="loading"}
              style={{ ...S.btnPri, width: "100%", background: (wdAmt&&Number(wdAmt)<=yunbi&&walletBoundNet)?"#1C1C2E":"#D1D5DB" }}>
              {wdStep==="loading" ? "提交中..." : "提交提现申请"}
            </button>
          </>) : (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 44, marginBottom: 8, color: "#16A34A" }}>✓</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#16A34A", marginBottom: 6 }}>提现申请已提交</div>
              <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.8 }}>正在人工审核中<br/>预计 <strong>24 小时内</strong>到账，节假日可能顺延</div>
            </div>
          )}
        </ModalShell>
      )}

      {/* 挂卖中心 */}
      {listModal && (
        <ModalShell title="云币挂卖中心" onClose={() => { if (listStep==="idle") setListModal(false); }}>
          {!walletBound ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ color: "#D97706", display: "flex", justifyContent: "center", marginBottom: 12 }}>{Ic.warn}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>请先绑定收款地址</div>
              <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>挂卖成交后款项将直接转入您的收款地址，请先完成绑定。</div>
              <button onClick={() => { setListModal(false); setWalletModal(true); setWalletStep("form"); setWalletInput(""); }}
                style={{ ...S.btnPri }}>前往绑定地址</button>
            </div>
          ) : listStep !== "ok" ? (<>
            <div style={{ marginBottom: 12 }}>
              <label style={S.label}>挂卖数量（可用 {yunbi.toFixed(2)} 云币）</label>
              <input value={listQty} onChange={e => setListQty(e.target.value)} type="number" placeholder="输入云币数量"
                style={S.inputM} onFocus={focusGold} onBlur={blurGray} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>挂卖单价（USDT / 云币）</label>
              <input value={listPrice} onChange={e => setListPrice(e.target.value)} type="number" step="0.01" placeholder="例：0.95"
                style={S.inputM} onFocus={focusGold} onBlur={blurGray} />
            </div>
            {listQty && listPrice && (
              <div style={{ background: "#F9FAFB", borderRadius: 7, padding: "10px 14px", marginBottom: 14, fontSize: 14, color: "#374151" }}>
                挂单总额：<strong style={{ fontFamily: F.mono }}>{(Number(listQty) * Number(listPrice)).toFixed(2)} USDT</strong>
              </div>
            )}
            <div style={{ padding: "9px 12px", background: "#FFFBEB", borderRadius: 7, fontSize: 13, color: "#92400E", marginBottom: 16, lineHeight: 1.7 }}>
              挂卖后云币从余额冻结，成交后 USDT 转入绑定地址（平台收取 3% 撮合费）。
            </div>
            <button onClick={doList} disabled={!listQty||Number(listQty)>yunbi||listStep==="loading"}
              style={{ ...S.btnPri, width: "100%", background: (listQty&&Number(listQty)<=yunbi)?"#1C1C2E":"#D1D5DB" }}>
              {listStep==="loading" ? "挂单中..." : "确认挂卖"}
            </button>
          </>) : (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 44, marginBottom: 8, color: "#16A34A" }}>✓</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#16A34A" }}>挂单成功</div>
            </div>
          )}
        </ModalShell>
      )}

      {/* 积分转账 */}
      {ptsTxModal && (
        <ModalShell title="积分转账" onClose={() => { if (ptsTxStep==="idle") setPtsTxModal(false); }}>
          {ptsTxStep !== "ok" ? (<>
            <div style={{ marginBottom: 12 }}>
              <label style={S.label}>收款方邮箱 / 账户 ID</label>
              <input value={ptsTxTo} onChange={e => setPtsTxTo(e.target.value)} placeholder="邮箱地址或账户 ID"
                style={S.input} onFocus={focusGold} onBlur={blurGray} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>转账积分数量（可用 {pts.toLocaleString()} 积分）</label>
              <input value={ptsTxAmt} onChange={e => setPtsTxAmt(e.target.value)} type="number" placeholder="输入积分数量"
                style={S.inputM} onFocus={focusGold} onBlur={blurGray} />
            </div>
            <div style={{ padding: "9px 12px", background: "#FFFBEB", borderRadius: 7, fontSize: 13, color: "#92400E", marginBottom: 16, lineHeight: 1.7 }}>
              积分转账后无法撤回，请确认收款方账户无误。
            </div>
            <button onClick={doPtsTx} disabled={!ptsTxTo.trim()||!ptsTxAmt||Number(ptsTxAmt)>pts||ptsTxStep==="loading"}
              style={{ ...S.btnPri, width: "100%", background: (ptsTxTo.trim()&&ptsTxAmt&&Number(ptsTxAmt)<=pts)?"#1C1C2E":"#D1D5DB" }}>
              {ptsTxStep==="loading" ? "处理中..." : "确认转账"}
            </button>
          </>) : (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 44, marginBottom: 8, color: "#16A34A" }}>✓</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#16A34A" }}>转账成功</div>
            </div>
          )}
        </ModalShell>
      )}

      {/* 使用激活卡 */}
      {useCard && (
        <ModalShell title="获取卡密" onClose={() => { setUseCard(null); setUseStep("form"); }}>
          {useStep === "form" ? (<>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 18, padding: "8px 12px", background: "#FFFDE7", borderRadius: 7, borderLeft: `3px solid ${C.yellow}` }}>
              获取卡密后请前往首页终端管理页输入激活。卡密仅限激活 1 台终端，请妥善保管。
            </div>
            <button onClick={() => {
              setCards(prev => prev.map(c => c.orderId === useCard.orderId ? { ...c, status: "已绑定" as CardStatus } : c));
              setUseStep("ok");
            }}
              style={{ width: "100%", padding: "11px", border: "none", borderRadius: 8, background: "#1C1C2E", color: C.yellow, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>
              确认获取卡密
            </button>
          </>) : (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>卡密</div>
              <div style={{ fontFamily: F.mono, fontSize: 15, color: "#111827", letterSpacing: 2, padding: "14px 16px", background: "#F0FDF4", borderRadius: 8, border: "1px solid #BBF7D0", marginBottom: 12, wordBreak: "break-all" as const, textAlign: "center" as const, fontWeight: 700 }}>{useCard.code}</div>
              <div style={{ fontSize: 12, color: "#6B7280", textAlign: "center" as const, marginBottom: 18 }}>请复制卡密后前往首页终端管理页激活</div>
              <button onClick={() => navigator.clipboard.writeText(useCard.code).catch(() => {})}
                style={{ width: "100%", padding: "10px", border: `1.5px solid ${C.yellow}`, borderRadius: 8, background: "#fff", color: "#92400E", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn, marginBottom: 8 }}>
                复制卡密
              </button>
              <button onClick={() => { setUseCard(null); setUseStep("form"); }}
                style={{ width: "100%", padding: "10px", border: "1.5px solid #E5E7EB", borderRadius: 8, background: "#fff", color: "#6B7280", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>
                关闭
              </button>
            </div>
          )}
        </ModalShell>
      )}

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MEMBER SETTINGS (device binding sub-component)
══════════════════════════════════════════════════════════════ */

type BoundDevice = { slot: number; code: string; device: string; os: string; boundAt: string; expiry: string; status: "在线" | "离线" };

const INIT_DEVICES: BoundDevice[] = [
  { slot: 1, code: "C3J8Z9FH0K9G6", device: "PC-WIN11-HOME", os: "Windows 11 Home", boundAt: "2026-08-30", expiry: "2027-08-30", status: "在线" },
  { slot: 2, code: "A9K2M5PQ7RNT1", device: "PC-WIN10-PRO", os: "Windows 10 Pro", boundAt: "2026-07-15", expiry: "2027-07-15", status: "离线" },
];

function Toggle({ on }: { on: boolean }) {
  return (
    <div style={{ width: 38, height: 22, borderRadius: 99, background: on ? C.yellow : "#D0D0D0", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background .2s" }}>
      <div style={{ width: 16, height: 16, background: "#fff", borderRadius: "50%", position: "absolute", top: 3, left: on ? 18 : 3, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.25)" }} />
    </div>
  );
}

function MemberSecurity() {
  const [payPwdSet,   setPayPwdSet]   = useState(false);
  const [ppModal,     setPpModal]     = useState(false);
  const [ppOld,       setPpOld]       = useState("");
  const [ppNew,       setPpNew]       = useState("");
  const [ppNew2,      setPpNew2]      = useState("");
  const [ppStep,      setPpStep]      = useState<"idle"|"loading"|"ok">("idle");
  const doSetPayPwd = () => {
    if (!ppNew || ppNew !== ppNew2) return;
    if (payPwdSet && !ppOld) return;
    setPpStep("loading");
    setTimeout(() => { setPayPwdSet(true); setPpStep("ok"); setTimeout(() => { setPpStep("idle"); setPpModal(false); setPpOld(""); setPpNew(""); setPpNew2(""); }, 1800); }, 1400);
  };

  const iStyle = { width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit" };
  const onF = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = C.yellow);
  const onB = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = C.border);

  return (
    <Card>
      <div style={{ fontWeight: 700, marginBottom: 14 }}>账号安全</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {[
          { label: "邮箱地址",   value: "user@example.com",       status: "已验证", color: C.green,  actionLabel: "更换邮箱", onClick: () => alert("请联系客服更换邮箱") },
          { label: "登录密码",   value: "上次修改：2026-08-01",    status: "已设置", color: C.green,  actionLabel: "修改密码", onClick: () => alert("请通过忘记密码流程修改") },
          { label: "交易密码",   value: payPwdSet ? "用于提现/兑换等资金操作" : "未设置，提现时需要", status: payPwdSet ? "已设置" : "未设置", color: payPwdSet ? C.green : C.orange, actionLabel: payPwdSet ? "修改" : "立即设置", onClick: () => { setPpModal(true); setPpStep("idle"); setPpOld(""); setPpNew(""); setPpNew2(""); } },
          { label: "二步验证",   value: "未绑定身份验证器",         status: "未开启", color: C.orange, actionLabel: "立即开启", onClick: () => alert("二步验证功能即将上线") },
        ].map((r, i, arr) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{r.label}</div>
              <div style={{ fontSize: 13, color: C.muted }}>{r.value}</div>
            </div>
            <Badge color={r.color}>{r.status}</Badge>
            <button onClick={r.onClick} style={{ padding: "5px 14px", fontSize: 12, borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", fontWeight: 600, fontFamily: F.cn }}>{r.actionLabel}</button>
          </div>
        ))}
      </div>

      {/* Pay-pwd modal */}
      {ppModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => { if (ppStep !== "loading") setPpModal(false); }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 400, borderRadius: 12, background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,.2)", overflow: "hidden", fontFamily: F.cn }}>
            <div style={{ background: C.dark, padding: "14px 20px", display: "flex", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "#fff", fontSize: 15, flex: 1 }}>{payPwdSet ? "修改交易密码" : "设置交易密码"}</span>
              <button onClick={() => setPpModal(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.4)", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "22px 24px" }}>
              {ppStep !== "ok" ? (<>
                <div style={{ padding: "10px 12px", background: "#FFFBEB", borderRadius: 7, fontSize: 12, color: "#92400E", marginBottom: 16, lineHeight: 1.7 }}>
                  交易密码用于提现、兑换等资金操作的二次身份验证，请妥善保管。
                </div>
                {payPwdSet && (
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block", marginBottom: 5 }}>当前交易密码</label>
                    <input value={ppOld} onChange={e => setPpOld(e.target.value)} type="password" placeholder="输入当前交易密码" style={iStyle} onFocus={onF} onBlur={onB} />
                  </div>
                )}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block", marginBottom: 5 }}>新交易密码</label>
                  <input value={ppNew} onChange={e => setPpNew(e.target.value)} type="password" placeholder="6 位以上数字或字母" style={iStyle} onFocus={onF} onBlur={onB} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block", marginBottom: 5 }}>确认新交易密码</label>
                  <input value={ppNew2} onChange={e => setPpNew2(e.target.value)} type="password" placeholder="再次输入新交易密码"
                    style={{ ...iStyle, borderColor: ppNew2 && ppNew !== ppNew2 ? C.red : C.border }}
                    onFocus={onF} onBlur={e => (e.target.style.borderColor = ppNew2 && ppNew !== ppNew2 ? C.red : C.border)} />
                  {ppNew2 && ppNew !== ppNew2 && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>两次密码不一致</div>}
                  {ppNew2 && ppNew === ppNew2 && <div style={{ fontSize: 11, color: C.green, marginTop: 3 }}>✓ 密码一致</div>}
                </div>
                <button onClick={doSetPayPwd} disabled={!ppNew || ppNew !== ppNew2 || ppStep === "loading"}
                  style={{ width: "100%", padding: "11px", background: (ppNew && ppNew === ppNew2) ? C.yellow : "#D1D5DB", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 14, color: C.dark, cursor: (ppNew && ppNew === ppNew2) ? "pointer" : "not-allowed", fontFamily: F.cn }}>
                  {ppStep === "loading" ? "保存中..." : payPwdSet ? "确认修改" : "确认设置"}
                </button>
              </>) : (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 48, color: C.green, marginBottom: 10 }}>✓</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: C.green }}>交易密码{payPwdSet ? "修改" : "设置"}成功</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function MemberSettings() {
  const [devices, setDevices] = useState<BoundDevice[]>(INIT_DEVICES);
  const [bindModal, setBindModal] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [bindStep, setBindStep] = useState<"idle" | "checking" | "ok" | "error">("idle");
  const [renewSlotIdx, setRenewSlotIdx] = useState<number | null>(null);
  const [renewCode, setRenewCode] = useState("");
  const [renewStep, setRenewStep] = useState<"idle"|"checking"|"ok"|"error">("idle");
  const [notifications, setNotifications] = useState({ order: true, complete: true, points: true, notice: false });

  const MAX_DEVICES = 3;

  const doBindDevice = () => {
    if (!newCode.trim()) return;
    setBindStep("checking");
    setTimeout(() => {
      if (newCode.length < 8) { setBindStep("error"); return; }
      const newDev: BoundDevice = {
        slot: devices.length + 1,
        code: newCode.toUpperCase(),
        device: `PC-WIN11-NEW${devices.length + 1}`,
        os: "Windows 11 Pro",
        boundAt: "2026-08-30",
        expiry: "2027-08-30",
        status: "离线",
      };
      setDevices((d) => [...d, newDev]);
      setBindStep("ok");
      setTimeout(() => { setBindModal(false); setNewCode(""); setBindStep("idle"); }, 900);
    }, 1400);
  };


  return (
    <div style={{ display: "flex", gap: 16 }}>

      {/* Left column */}
      <div style={{ flex: 3, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Device binding card */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: C.muted }}>{Ic.monitor}</span>设备授权管理</div>
              <div style={{ fontSize: 13, color: C.muted }}>每个账号最多绑定 <strong style={{ color: C.orange }}>3 台</strong> Windows 设备，每台有效期 1 年</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 13, color: C.muted }}>
                <span style={{ fontWeight: 700, fontSize: 18, color: devices.length >= MAX_DEVICES ? C.red : C.text }}>{devices.length}</span>
                <span style={{ color: C.muted }}> / {MAX_DEVICES} 台</span>
              </div>
              <PrimaryBtn
                small
                onClick={() => setBindModal(true)}
                style={{ opacity: devices.length >= MAX_DEVICES ? 0.4 : 1, cursor: devices.length >= MAX_DEVICES ? "not-allowed" : "pointer" }}
              >+ 绑定新设备</PrimaryBtn>
            </div>
          </div>

          {/* Slots */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Array.from({ length: MAX_DEVICES }).map((_, i) => {
              const dev = devices[i];
              return dev ? (
                /* Bound slot */
                <div key={dev.slot} style={{ padding: "14px 16px", borderRadius: 9, border: `1.5px solid ${dev.status === "在线" ? C.green + "66" : C.border}`, background: dev.status === "在线" ? C.green + "07" : "#FAFAFA", display: "flex", alignItems: "center", gap: 14 }}>
                  {/* Slot number */}
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: dev.status === "在线" ? C.green + "20" : "#E8E8E8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: dev.status === "在线" ? C.green : C.muted, flexShrink: 0 }}>{i + 1}</div>
                  {/* Device info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{dev.device}</span>
                      <Badge color={dev.status === "在线" ? C.green : C.muted}>{dev.status}</Badge>
                    </div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 2 }}>{dev.os}</div>
                    <div style={{ fontSize: 10, fontFamily: F.mono, color: "#AAA", letterSpacing: 0.5 }}>授权码：{dev.code}</div>
                  </div>
                  {/* Dates */}
                  <div style={{ fontSize: 13, color: C.muted, textAlign: "right", flexShrink: 0 }}>
                    <div>绑定 {dev.boundAt}</div>
                    <div style={{ color: dev.expiry < "2027-01-01" ? C.orange : C.green, fontWeight: 600 }}>到期 {dev.expiry}</div>
                  </div>
                  {/* Actions */}
                  <div style={{ flexShrink: 0 }}>
                    <button onClick={() => { setRenewSlotIdx(i); setRenewCode(""); setRenewStep("idle"); }} style={{ padding: "4px 10px", fontSize: 11, borderRadius: 5, border: `1px solid ${C.yellow}`, background: "#FFFBEA", color: C.dark, cursor: "pointer", fontWeight: 600 }}>续期</button>
                  </div>
                </div>
              ) : (
                /* Empty slot */
                <div key={`empty-${i}`} onClick={() => devices.length < MAX_DEVICES && setBindModal(true)}
                  style={{ padding: "14px 16px", borderRadius: 9, border: `1.5px dashed ${C.border}`, background: "#FAFAFA", display: "flex", alignItems: "center", gap: 14, cursor: devices.length < MAX_DEVICES ? "pointer" : "default", opacity: 0.6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#EBEBEB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#CCC" }}>{i + 1}</div>
                  <div style={{ fontSize: 13, color: "#BDBDBD" }}>空位 — 点击绑定新设备授权码</div>
                </div>
              );
            })}
          </div>

          {devices.length >= MAX_DEVICES && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: C.red + "0F", borderRadius: 7, fontSize: 12, color: C.red }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span>{Ic.warnSm}</span>已达到最大设备绑定数量（3台）</span>
            </div>
          )}
        </Card>

        {/* Account security */}
        <MemberSecurity />
      </div>

      {/* Right column */}
      <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 14 }}>
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>通知设置</div>
          {([
            ["order", "接单成功通知"],
            ["complete", "任务完成通知"],
            ["points", "积分到账通知"],
            ["notice", "系统公告推送"],
          ] as [keyof typeof notifications, string][]).map(([key, label]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${C.border}` }}
              onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))}>
              <span style={{ fontSize: 13 }}>{label}</span>
              <Toggle on={notifications[key]} />
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>账号信息</div>
          {[["注册邮箱", "user@example.com"], ["注册时间", "2026-06-01"], ["当前版本", "v3.2.1 (最新)"], ["会员等级", "黄金会员"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
              <span style={{ color: C.muted }}>{k}</span>
              <span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Bind device modal overlay */}
      {bindModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,.25)" }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>绑定新设备授权码</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
              输入您在该 Windows 设备上运行软件时获得的 <strong>机器授权码</strong>。每台设备有效期 1 年，绑定后不可更换设备。
            </div>

            <div style={{ padding: "10px 12px", background: "#F8F9FA", borderRadius: 8, marginBottom: 16, fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ color: C.muted }}>{Ic.pin}</span>当前已绑定 <strong style={{ color: C.text }}>{devices.length}</strong> / {MAX_DEVICES} 台设备</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ color: C.muted }}>{Ic.pin}</span>授权码格式：XXXXX-XXXXX-XXXXX-XXXXX</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ color: C.muted }}>{Ic.pin}</span>在软件启动界面可查看本机机器授权码</div>
            </div>

            <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6 }}>机器授权码</label>
            <input
              value={newCode} onChange={(e) => { setNewCode(e.target.value); setBindStep("idle"); }}
              placeholder="例：C3J8Z9FH-0K9G6TXR-PQRS2026"
              style={{ width: "100%", padding: "11px 12px", border: `1.5px solid ${bindStep === "error" ? C.red : C.yellow}`, borderRadius: 8, fontSize: 13, fontFamily: F.mono, outline: "none", letterSpacing: 0.5, boxSizing: "border-box", marginBottom: 8 }}
            />

            {bindStep === "checking" && <div style={{ padding: "8px 12px", background: "#E3F2FD", borderRadius: 6, fontSize: 12, color: C.blue, marginBottom: 10 }}>正在验证授权码，联网校验中...</div>}
            {bindStep === "ok" && <div style={{ padding: "8px 12px", background: "#E8F5E9", borderRadius: 6, fontSize: 12, color: C.green, marginBottom: 10 }}>✓ 授权码有效，设备绑定成功！</div>}
            {bindStep === "error" && <div style={{ padding: "8px 12px", background: "#FFEBEE", borderRadius: 6, fontSize: 12, color: C.red, marginBottom: 10 }}>✗ 授权码无效或已被绑定，请检查后重试</div>}

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button onClick={doBindDevice} disabled={bindStep === "checking" || bindStep === "ok"} style={{
                flex: 1, padding: "11px", background: bindStep === "ok" ? C.green : C.yellow, border: "none", borderRadius: 8,
                fontWeight: 800, fontSize: 13, color: bindStep === "ok" ? "#fff" : C.dark, cursor: "pointer", fontFamily: F.cn,
              }}>{bindStep === "idle" ? "确认绑定" : bindStep === "checking" ? "验证中..." : bindStep === "ok" ? "✓ 绑定成功" : "重新验证"}</button>
              <button onClick={() => { setBindModal(false); setNewCode(""); setBindStep("idle"); }} style={{ padding: "11px 20px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MERCHANT — PAGE 4: MEMBER CENTER
══════════════════════════════════════════════════════════════ */

function MerchantMember() {
  type AccountModal = null | "exchange" | "withdraw";
  type SettingModal = null | "paypwd" | "email" | "loginpwd" | "mfa";

  /* ── balances ── */
  const [pts,     setPts]     = useState(218120);
  const [yunbi,   setYunbi]   = useState(128.40);
  const [feePool, setFeePool] = useState(0);

  /* ── wallet & pay-pwd binding status ── */
  // Per-network bound addresses — empty string = not bound; binding is permanent
  const [walletAddrs, setWalletAddrs] = useState<{ BSC: string; Tron: string }>({ BSC: "", Tron: "" });
  const walletBound = walletAddrs.BSC !== "" || walletAddrs.Tron !== "";
  const [payPwdSet, setPayPwdSet] = useState(false);

  /* ── daily check-in ── */
  // dayIndex: 1-7 cycling, resets to 1 if 3+ consecutive days missed
  // rates per day (index 0 = day 1)
  const DAY_RATES = [0.003, 0.004, 0.005, 0.007, 0.008, 0.009, 0.01];
  // consecutive multipliers: streak 1→×1, streak 3→×2, streak 7→×3
  const STREAK_MULT = [1, 1, 2, 2, 2, 2, 3]; // index = streak-1, capped at 7

  const [checkedIn,   setCheckedIn]   = useState(false);
  const [dayIndex,    setDayIndex]    = useState(3);   // 1-7, current day in cycle
  const [streak,      setStreak]      = useState(3);   // consecutive days checked in
  const [missedDays,  setMissedDays]  = useState(0);   // consecutive missed days

  const dayRate    = DAY_RATES[Math.min(dayIndex - 1, 6)];
  const streakMult = STREAK_MULT[Math.min(streak - 1, 6)];
  const checkinReward = 10; // fixed: +10 签到云币 per check-in

  const doCheckin = () => {
    if (checkedIn) return;
    setCheckedIn(true);
    setMissedDays(0);
    setStreak(s => s + 1);
    setDayIndex(d => d >= 7 ? 1 : d + 1);
    setFeePool(p => parseFloat((p + checkinReward).toFixed(2)));
  };

  // simulate "skip day" to test reset logic (dev helper kept in state only)
  const _simulateMiss = () => {
    const next = missedDays + 1;
    if (next >= 3) {
      // 3 consecutive misses → reset to day 1, streak 0
      setMissedDays(0);
      setDayIndex(1);
      setStreak(0);
    } else {
      setMissedDays(next);
      setStreak(0);
    }
    setCheckedIn(false);
  };

  /* ── 积分兑换云币 ── */
  const [exchAmt,  setExchAmt]  = useState("");
  const [exchStep, setExchStep] = useState<"idle"|"loading"|"ok">("idle");
  const [exchVerifyMethod, setExchVerifyMethod] = useState<"otp"|"pwd">("otp");
  const [exchPwd,  setExchPwd]  = useState("");
  const [exchOtp,  setExchOtp]  = useState("");
  const [exchOtpSent, setExchOtpSent] = useState(false);
  const [exchOtpTimer, setExchOtpTimer] = useState(0);
  const exchOtpRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const sendExchOtp = () => {
    setExchOtpSent(true); setExchOtpTimer(60);
    if (exchOtpRef.current) clearInterval(exchOtpRef.current);
    exchOtpRef.current = setInterval(() => setExchOtpTimer(t => { if (t <= 1) { clearInterval(exchOtpRef.current!); return 0; } return t - 1; }), 1000);
  };
  const exchYunbi = Number(exchAmt) / 100;
  const canExch = Number(exchAmt) >= 100 && Number(exchAmt) % 100 === 0 && Number(exchAmt) <= pts;
  const doExch = () => {
    if (!canExch) return;
    setExchStep("loading");
    setTimeout(() => {
      setPts(p => p - Number(exchAmt));
      setYunbi(y => parseFloat((y + exchYunbi).toFixed(2)));
      setExchStep("ok");
      setTimeout(() => { setExchStep("idle"); setExchAmt(""); }, 2000);
    }, 1400);
  };

  /* ── 云币提现 ── */
  const [wdAmt,    setWdAmt]  = useState("");
  const [wdPwd,    setWdPwd]  = useState("");
  const [wdPwdErr, setWdPwdErr] = useState(false);
  const [wdMfaCode, setWdMfaCode] = useState("");
  const [wdVerifyMethod, setWdVerifyMethod] = useState<"otp"|"pwd">("pwd");
  const [wdOtp,  setWdOtp]  = useState("");
  const [wdOtpSent, setWdOtpSent] = useState(false);
  const [wdOtpTimer, setWdOtpTimer] = useState(0);
  const wdOtpRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const sendWdOtp = () => {
    setWdOtpSent(true); setWdOtpTimer(60);
    if (wdOtpRef.current) clearInterval(wdOtpRef.current);
    wdOtpRef.current = setInterval(() => setWdOtpTimer(t => { if (t <= 1) { clearInterval(wdOtpRef.current!); return 0; } return t - 1; }), 1000);
  };
  const [wdStep,   setWdStep] = useState<"idle"|"loading"|"ok">("idle");
  const [usePool,  setUsePool] = useState(false);
  // Default to first bound network
  const [wdNet, setWdNet] = useState<"BSC"|"Tron">(
    walletAddrs.BSC ? "BSC" : "Tron"
  );
  // Per-network fee rates: BSC cheaper, Tron higher
  const NET_FEE: Record<"BSC"|"Tron", number> = { BSC: 0.03, Tron: 0.05 };
  const FEE_RATE   = NET_FEE[wdNet];
  const wdAddr     = walletAddrs[wdNet];   // always from binding, read-only
  const wdRaw      = Number(wdAmt) || 0;
  const wdFee      = parseFloat((wdRaw * FEE_RATE).toFixed(4));
  const poolCover  = usePool ? Math.min(feePool, wdFee) : 0;
  const yunbiCover = parseFloat((wdFee - poolCover).toFixed(4));
  const wdDeduct   = parseFloat((wdRaw + yunbiCover).toFixed(4));
  const wdUsdt     = wdRaw > 0 ? wdRaw.toFixed(2) : "0.00";
  const canWd = wdRaw >= 10 && wdDeduct <= yunbi && !!wdAddr && !!wdPwd.trim();

  /* ── settings: pay password ── */
  const [payOld, setPayOld] = useState("");
  const [payNew, setPayNew] = useState("");
  const [payCfm, setPayCfm] = useState("");
  const [payStep,setPayStep]= useState<"idle"|"loading"|"ok"|"err">("idle");
  const doPayPwd = () => {
    if (!payOld || payNew !== payCfm || payNew.length < 6) { setPayStep("err"); return; }
    setPayStep("loading");
    setTimeout(() => { setPayStep("ok"); setTimeout(() => { setPayStep("idle"); setPayOld(""); setPayNew(""); setPayCfm(""); }, 2000); }, 1400);
  };

  /* ── settings: change email ── */
  const [curEmail] = useState("us****@gmail.com");
  const [newEmail,  setNewEmail]  = useState("");
  const [emailOtp,  setEmailOtp]  = useState("");
  const [otpSent,   setOtpSent]   = useState(false);
  const [otpTimer,  setOtpTimer]  = useState(0);
  const [emailStep, setEmailStep] = useState<"idle"|"loading"|"ok"|"err">("idle");
  const sendOtp = () => {
    if (!newEmail.includes("@")) { setEmailStep("err"); return; }
    setOtpSent(true); setOtpTimer(60);
    const t = setInterval(() => setOtpTimer(s => { if (s <= 1) { clearInterval(t); return 0; } return s - 1; }), 1000);
  };
  const doEmailChange = () => {
    if (!emailOtp || emailOtp.length < 4) { setEmailStep("err"); return; }
    setEmailStep("loading");
    setTimeout(() => { setEmailStep("ok"); setTimeout(() => { setEmailStep("idle"); setNewEmail(""); setEmailOtp(""); setOtpSent(false); }, 2000); }, 1400);
  };

  /* ── settings: change password ── */
  const [loginEmail,   setLoginEmail]   = useState("");
  const [loginOtp,     setLoginOtp]     = useState("");
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtpTimer,setLoginOtpTimer]= useState(0);
  const [loginNewPwd,  setLoginNewPwd]  = useState("");
  const [loginCfmPwd,  setLoginCfmPwd]  = useState("");
  const [loginStep,    setLoginStep]    = useState<"idle"|"loading"|"ok"|"err">("idle");
  const sendLoginOtp = () => {
    if (!loginEmail.includes("@")) { setLoginStep("err"); return; }
    setLoginOtpSent(true); setLoginOtpTimer(60);
    const t = setInterval(() => setLoginOtpTimer(s => { if (s <= 1) { clearInterval(t); return 0; } return s - 1; }), 1000);
  };
  const doLoginPwd = () => {
    if (!loginOtp || loginNewPwd.length < 8 || loginNewPwd !== loginCfmPwd) { setLoginStep("err"); return; }
    setLoginStep("loading");
    setTimeout(() => { setLoginStep("ok"); setTimeout(() => { setLoginStep("idle"); setLoginEmail(""); setLoginOtp(""); setLoginNewPwd(""); setLoginCfmPwd(""); setLoginOtpSent(false); }, 2000); }, 1500);
  };

  /* ── modal open state ── */
  const [acctModal,       setAcctModal]       = useState<AccountModal>(null);
  const [settModal,       setSettModal]       = useState<SettingModal>(null);
  const [bindWalletModal, setBindWalletModal] = useState(false);
  const [bindWalletInput, setBindWalletInput] = useState("");
  const [bindWalletNet,   setBindWalletNet]   = useState<"BSC"|"Tron">("BSC");
  const [bindWalletStep,  setBindWalletStep]  = useState<"form"|"loading"|"done">("form");
  const doBindWallet = () => {
    if (!bindWalletInput.trim()) return;
    // use first unbound net if bindWalletNet is already bound
    const unboundNow = (["BSC", "Tron"] as const).filter(n => !walletAddrs[n]);
    const targetNet = unboundNow.includes(bindWalletNet) ? bindWalletNet : (unboundNow[0] ?? bindWalletNet);
    setBindWalletStep("loading");
    setTimeout(() => {
      setWalletAddrs(prev => ({ ...prev, [targetNet]: bindWalletInput.trim() }));
      setBindWalletStep("done");
      setTimeout(() => { setBindWalletModal(false); setBindWalletStep("form"); setBindWalletInput(""); }, 1500);
    }, 1400);
  };
  /* MFA */
  const [mfaBound, setMfaBound] = useState(false);
  const MFA_SECRET = "JBSW YYTB ORSG KIDY"; // static demo secret
  const [mfaCode,    setMfaCode]    = useState("");
  const [mfaCodeErr, setMfaCodeErr] = useState(false);
  const [mfaStep,    setMfaStep]    = useState<"qr"|"verify"|"ok">("qr");

  /* multi-step within each modal */
  const [mStep, setMStep] = useState(1);
  const openAcct  = (m: AccountModal)  => { setAcctModal(m);  setMStep(1); };
  const openSett  = (m: SettingModal)  => { setSettModal(m);  setMStep(1); setMfaStep("qr"); setMfaCode(""); setMfaCodeErr(false); };
  const closeModal = () => { setAcctModal(null); setSettModal(null); setMStep(1); setWdMfaCode(""); };

  /* ── shared primitives ── */
  const MInp = ({ value, onChange, placeholder, type = "text", mono = false, disabled = false }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; mono?: boolean; disabled?: boolean }) => (
    <input value={value} onChange={e => onChange(e.target.value)} type={type} placeholder={placeholder} disabled={disabled}
      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 14, fontFamily: mono ? F.mono : F.cn, outline: "none", boxSizing: "border-box" as const, background: disabled ? "#F9FAFB" : "#fff" }}
      onFocus={e => (e.target.style.borderColor = "#D97706")} onBlur={e => (e.target.style.borderColor = C.border)} />
  );

  const MLabel = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 7 }}>{children}</div>
  );

  /* step dots */
  const StepDots = ({ total, current }: { total: number; current: number }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginBottom: 24 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ width: i + 1 === current ? 20 : 7, height: 7, borderRadius: 4, background: i + 1 <= current ? C.dark : "#E5E7EB", transition: "all .2s" }}/>
      ))}
    </div>
  );

  /* Modal overlay wrapper */
  const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#fff", borderRadius: 16, width: 480, maxWidth: "calc(100vw - 32px)", boxShadow: "0 24px 64px rgba(0,0,0,.18)", overflow: "hidden" }}>
        {/* Modal header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4, borderRadius: 6, display: "flex" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>
  );

  /* ── Exchange modal steps ── */
  const ExchangeModal = () => {
    const exchYunbi = Number(exchAmt) / 1000;
    const canExch = Number(exchAmt) >= 1000 && Number(exchAmt) <= pts;
    return (
      <Modal title="积分兑换云币" onClose={closeModal}>
        <StepDots total={3} current={mStep} />
        {mStep === 1 && (<>
          <div style={{ padding: "14px 16px", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, marginBottom: 20, fontSize: 12, color: "#92400E" }}>
            兑换比例：<strong style={{ fontFamily: F.mono }}>100 积分 = 1.00 云币</strong>，最低 100 积分起兑
          </div>
          <MLabel>兑换积分数量</MLabel>
          <MInp value={exchAmt} onChange={setExchAmt} placeholder="最低 100" type="number" mono />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "14px 0" }}>
            <span style={{ fontSize: 12, color: C.muted }}>可用积分：<strong style={{ fontFamily: F.mono, color: C.text }}>{pts.toLocaleString()}</strong></span>
            <span style={{ fontSize: 12, color: C.muted }}>可得云币：<strong style={{ fontFamily: F.mono, color: "#7C3AED" }}>{exchYunbi > 0 ? exchYunbi.toFixed(2) : "0.00"}</strong></span>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={closeModal} style={{ flex: 1, padding: "12px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>取消</button>
            <button onClick={() => canExch && setMStep(2)} disabled={!canExch}
              style={{ flex: 2, padding: "12px", borderRadius: 9, border: "none", background: canExch ? C.dark : "#E5E7EB", color: canExch ? C.yellow : C.muted, fontWeight: 700, fontSize: 14, cursor: canExch ? "pointer" : "not-allowed", fontFamily: F.cn }}>
              下一步：确认
            </button>
          </div>
        </>)}
        {mStep === 2 && (<>
          <div style={{ padding: "10px 14px", background: "#F9FAFB", border: `1px solid ${C.border}`, borderRadius: 9, marginBottom: 18 }}>
            {[["扣除积分", `${Number(exchAmt).toLocaleString()} 积分`], ["到账云币", `${(Number(exchAmt)/1000).toFixed(2)} 云币`], ["兑换比例", "1000 积分 = 1.00 云币"]].map(([k, v], i, arr) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize: 12, color: C.muted }}>{k}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: F.mono }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Verify method toggle */}
          <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8 }}>安全验证</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, background: "#F3F4F6", borderRadius: 9, padding: 4 }}>
            {(["otp","pwd"] as const).map(m => (
              <button key={m} onClick={() => { setExchVerifyMethod(m); setExchOtp(""); setExchPwd(""); setExchOtpSent(false); }}
                style={{ flex: 1, padding: "7px 0", borderRadius: 7, border: "none", background: exchVerifyMethod === m ? "#fff" : "transparent", color: exchVerifyMethod === m ? C.text : C.muted, fontWeight: exchVerifyMethod === m ? 700 : 500, fontSize: 12, cursor: "pointer", fontFamily: F.cn, boxShadow: exchVerifyMethod === m ? "0 1px 4px rgba(0,0,0,.1)" : "none" }}>
                {m === "otp" ? "邮箱验证码" : "支付密码"}
              </button>
            ))}
          </div>

          {exchVerifyMethod === "otp" && (<>
            {!exchOtpSent ? (
              <div style={{ textAlign: "center", padding: "8px 0 14px" }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>将向 <strong>us****@gmail.com</strong> 发送 6 位验证码</div>
                <button onClick={sendExchOtp}
                  style={{ padding: "9px 28px", borderRadius: 8, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>
                  发送验证码
                </button>
              </div>
            ) : (<>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, marginBottom: 12, fontSize: 12, color: "#16A34A" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                已发送至 us****@gmail.com
              </div>
              <input value={exchOtp} onChange={e => setExchOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
                placeholder="— — — — — —" maxLength={6} autoFocus
                style={{ width: "100%", padding: "12px 16px", border: `2px solid ${exchOtp.length === 6 ? "#16A34A" : C.border}`, borderRadius: 9, fontSize: 22, fontFamily: F.mono, fontWeight: 800, letterSpacing: 8, outline: "none", boxSizing: "border-box" as const, textAlign: "center" as const, marginBottom: 8 }} />
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                <button onClick={() => exchOtpTimer === 0 && sendExchOtp()} disabled={exchOtpTimer > 0}
                  style={{ background: "none", border: "none", fontSize: 12, color: exchOtpTimer > 0 ? C.muted : C.blue, cursor: exchOtpTimer > 0 ? "default" : "pointer", fontFamily: F.cn, padding: 0 }}>
                  {exchOtpTimer > 0 ? `${exchOtpTimer}s 后可重发` : "重新发送"}
                </button>
              </div>
            </>)}
          </>)}

          {exchVerifyMethod === "pwd" && (
            <div style={{ marginBottom: 14 }}>
              <input type="password" value={exchPwd} onChange={e => setExchPwd(e.target.value)}
                placeholder="请输入支付密码" autoFocus
                style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 15, fontFamily: F.mono, outline: "none", boxSizing: "border-box" as const }}
                onFocus={e => (e.target.style.borderColor = C.dark)} onBlur={e => (e.target.style.borderColor = C.border)} />
            </div>
          )}

          {(() => {
            const canConfirm = exchVerifyMethod === "otp" ? (exchOtpSent && exchOtp.length === 6) : !!exchPwd.trim();
            return (
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setMStep(1)} style={{ flex: 1, padding: "12px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>返回</button>
                <button onClick={() => {
                  if (!canConfirm) return;
                  setExchStep("loading");
                  setTimeout(() => { setPts(p => p - Number(exchAmt)); setYunbi(y => parseFloat((y + Number(exchAmt)/1000).toFixed(2))); setExchStep("ok"); setMStep(3); setExchOtp(""); setExchPwd(""); setExchOtpSent(false); }, 1400);
                }} disabled={!canConfirm || exchStep === "loading"}
                  style={{ flex: 2, padding: "12px", borderRadius: 9, border: "none", background: canConfirm ? C.dark : "#E5E7EB", color: canConfirm ? C.yellow : C.muted, fontWeight: 700, fontSize: 14, cursor: canConfirm ? "pointer" : "not-allowed", fontFamily: F.cn }}>
                  {exchStep === "loading" ? "兑换中…" : "确认兑换"}
                </button>
              </div>
            );
          })()}
        </>)}
        {mStep === 3 && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F0FDF4", border: "2px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: C.green }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>兑换成功</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 24, lineHeight: 1.8 }}>
              {Number(exchAmt).toLocaleString()} 积分已兑换为<br/>
              <strong style={{ fontFamily: F.mono, color: "#7C3AED" }}>{(Number(exchAmt)/100).toFixed(2)} 云币</strong>
            </div>
            <button onClick={() => { closeModal(); setExchAmt(""); setExchStep("idle"); }}
              style={{ padding: "12px 40px", borderRadius: 9, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>
              完成
            </button>
          </div>
        )}
      </Modal>
    );
  };

  /* ── Withdraw modal steps ── */
  const WithdrawModal = () => {
    const canStep1 = wdRaw >= 10 && wdDeduct <= yunbi && !!wdAddr.trim();
    const canStep2 = !!wdPwd.trim() && (!mfaBound || wdMfaCode.length === 6);
    /* Guard: require wallet binding and pay-pwd before allowing withdrawal */
    if (!walletBound || !payPwdSet) {
      return (
        <Modal title="云币兑现" onClose={closeModal}>
          <div style={{ textAlign: "center", padding: "8px 0 24px" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#FFF7ED", border: "2px solid #FED7AA", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", color: "#D97706" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 10 }}>提现前需完成以下设置</div>
            {!walletBound && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, marginBottom: 10, textAlign: "left" as const }}>
                <span style={{ fontSize: 20 }}>💳</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#DC2626" }}>未绑定提现地址</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>需先绑定 BSC 或 Tron 收款地址</div>
                </div>
                <button onClick={() => { closeModal(); }}
                  style={{ padding: "6px 14px", border: "none", borderRadius: 7, background: "#DC2626", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: F.cn }}>去绑定</button>
              </div>
            )}
            {!payPwdSet && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, marginBottom: 10, textAlign: "left" as const }}>
                <span style={{ fontSize: 20 }}>🔐</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#DC2626" }}>未设置支付密码</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>提现操作需要支付密码验证</div>
                </div>
                <button onClick={() => { closeModal(); }}
                  style={{ padding: "6px 14px", border: "none", borderRadius: 7, background: "#DC2626", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: F.cn }}>去设置</button>
              </div>
            )}
            <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>完成上述设置后即可申请云币兑现 USDT</div>
          </div>
        </Modal>
      );
    }
    const boundNets = (["BSC", "Tron"] as const).filter(n => walletAddrs[n]);
    return (
      <Modal title="云币兑现" onClose={closeModal}>
        <StepDots total={3} current={mStep} />
        {mStep === 1 && (<>
          {/* Network selector — only shows bound networks */}
          <div style={{ display: "grid", gridTemplateColumns: boundNets.length > 1 ? "1fr 1fr" : "1fr", gap: 10, marginBottom: 14 }}>
            {boundNets.map(net => (
              <div key={net} onClick={() => setWdNet(net)}
                style={{ border: `1.5px solid ${wdNet === net ? "#7C3AED" : C.border}`, borderRadius: 9, padding: "12px 14px", cursor: "pointer", background: wdNet === net ? "#F5F3FF" : "#FAFAFA", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${wdNet === net ? "#7C3AED" : "#D1D5DB"}`, background: wdNet === net ? "#7C3AED" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {wdNet === net && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }}/>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: wdNet === net ? "#7C3AED" : C.text, fontFamily: F.en }}>{net}</span>
                    {net === "BSC" && <span style={{ fontSize: 9, fontWeight: 700, color: "#16A34A", background: "#F0FDF4", borderRadius: 4, padding: "1px 5px", border: "1px solid #BBF7D0" }}>费率低</span>}
                  </div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{net === "BSC" ? "BEP-20 · USDT · 手续费 3%" : "TRC-20 · USDT · 手续费 5%"}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bound address — read-only */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <MLabel>收款地址（{wdNet}）</MLabel>
              <span style={{ fontSize: 10, color: C.muted, background: "#F3F4F6", borderRadius: 4, padding: "2px 7px" }}>已绑定 · 不可修改</span>
            </div>
            <div style={{ padding: "10px 14px", background: "#F8F9FB", border: `1px solid ${C.border}`, borderRadius: 9, fontFamily: F.mono, fontSize: 12, color: C.text, wordBreak: "break-all" as const, lineHeight: 1.6 }}>
              {wdAddr}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <MLabel>提现金额（云币）</MLabel>
            <MInp value={wdAmt} onChange={setWdAmt} placeholder="最低 10 云币" type="number" mono />
            <div style={{ fontSize: 12, color: C.muted, marginTop: 6, display: "flex", gap: 16, flexWrap: "wrap" as const }}>
              <span>可用云币：<strong style={{ fontFamily: F.mono, color: C.text }}>{yunbi.toFixed(2)}</strong></span>
              <span>手续费率：<strong style={{ fontFamily: F.mono }}>{(FEE_RATE * 100).toFixed(0)}%</strong></span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#10B981", flexShrink: 0 }}/>
                签到云币余额：<strong style={{ fontFamily: F.mono, color: "#10B981" }}>{feePool.toFixed(2)}</strong>
              </span>
            </div>
          </div>

          {/* Fee pool offset option — always shown, disabled when pool empty */}
          <div onClick={() => feePool > 0 && setUsePool(p => !p)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
              background: feePool === 0 ? "#F3F4F6" : usePool ? "#F0FDF4" : "#F9FAFB",
              border: `1.5px solid ${feePool === 0 ? "#E5E7EB" : usePool ? "#86EFAC" : C.border}`,
              borderRadius: 10, cursor: feePool > 0 ? "pointer" : "not-allowed",
              marginBottom: 14, userSelect: "none" as const, opacity: feePool === 0 ? 0.6 : 1, transition: "all .15s" }}>
            <div style={{ width: 20, height: 20, borderRadius: 4,
              border: `2px solid ${feePool === 0 ? "#D1D5DB" : usePool ? "#16A34A" : "#D1D5DB"}`,
              background: usePool && feePool > 0 ? "#16A34A" : "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
              {usePool && feePool > 0 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: feePool === 0 ? C.muted : usePool ? "#166534" : C.text }}>
                使用签到云币抵扣手续费
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2, display: "flex", gap: 10, flexWrap: "wrap" as const }}>
                <span>签到云币余额：<strong style={{ fontFamily: F.mono, color: feePool > 0 ? "#10B981" : C.muted }}>{feePool.toFixed(2)} 云币</strong></span>
                {wdRaw > 0 && usePool && poolCover > 0 && (
                  <span style={{ color: "#16A34A" }}>可抵扣：<strong style={{ fontFamily: F.mono }}>- {poolCover.toFixed(2)} 云币</strong></span>
                )}
                {feePool === 0 && <span style={{ color: "#9CA3AF" }}>（签到积累签到云币后可用）</span>}
              </div>
            </div>
            {feePool > 0 && (
              <div style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99,
                background: usePool ? "#DCFCE7" : "#F3F4F6", color: usePool ? "#166534" : C.muted,
                border: `1px solid ${usePool ? "#86EFAC" : "#E5E7EB"}`, whiteSpace: "nowrap" as const }}>
                {usePool ? "已启用" : "点击启用"}
              </div>
            )}
          </div>

          {/* Fee breakdown card */}
          {wdRaw > 0 && (
            <div style={{ padding: "12px 14px", background: "#F8F9FB", border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: .5 }}>费用明细</div>
              {[
                { label: "兑现云币",   val: `${wdRaw.toFixed(2)} 云币`,                        color: C.text },
                { label: "手续费（5%）", val: `${wdFee.toFixed(4)} 云币`,                       color: C.orange },
                usePool && poolCover > 0 ? { label: "├ 签到云币抵扣",  val: `- ${poolCover.toFixed(2)} 云币`,  color: "#16A34A" } : null,
                yunbiCover > 0          ? { label: `├ 云币余额扣除`,    val: `- ${yunbiCover.toFixed(4)} 云币`, color: C.orange } : null,
                { label: "实际到账",   val: `${wdUsdt} USDT`,                                 color: "#7C3AED" },
                { label: "扣除云币合计", val: `${wdDeduct.toFixed(4)} 云币`,                   color: C.text },
              ].filter(Boolean).map((row: any, i, arr) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: i < arr.length - 1 ? `1px dashed #E5E7EB` : "none" }}>
                  <span style={{ color: C.muted }}>{row.label}</span>
                  <span style={{ fontFamily: F.mono, fontWeight: 700, color: row.color }}>{row.val}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={closeModal} style={{ flex: 1, padding: "12px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>取消</button>
            <button onClick={() => canStep1 && setMStep(2)} disabled={!canStep1}
              style={{ flex: 2, padding: "12px", borderRadius: 9, border: "none", background: canStep1 ? C.dark : "#E5E7EB", color: canStep1 ? C.yellow : C.muted, fontWeight: 700, fontSize: 14, cursor: canStep1 ? "pointer" : "not-allowed", fontFamily: F.cn }}>
              下一步：验证
            </button>
          </div>
        </>)}
        {mStep === 2 && (<>
          <div style={{ padding: "14px 16px", background: "#F9FAFB", border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 20 }}>
            {([
              ["提现网络",     wdNet],
              ["收款地址",     wdAddr.slice(0,8) + "…" + wdAddr.slice(-6)],
              ["兑现云币",     `${wdRaw.toFixed(2)} 云币`],
              ["手续费（5%）", `${wdFee.toFixed(4)} 云币`],
              ...(usePool && poolCover > 0 ? [["签到云币抵扣", `- ${poolCover.toFixed(2)} 云币`]] : []),
              ...(yunbiCover > 0 ? [["云币余额扣手续费", `- ${yunbiCover.toFixed(4)} 云币`]] : []),
              ["实际到账 USDT", `${wdUsdt} USDT`],
            ] as [string,string][]).map(([k, v], i, arr) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ color: C.muted }}>{k}</span>
                <span style={{ fontFamily: F.mono, fontWeight: 600, color: k === "实际到账 USDT" ? "#7C3AED" : k.includes("抵扣") || k.includes("签到云币池") ? "#16A34A" : C.text }}>{v}</span>
              </div>
            ))}
          </div>
          {/* Verify method toggle */}
          <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8 }}>安全验证方式</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, background: "#F3F4F6", borderRadius: 9, padding: 4 }}>
            {(["pwd","otp"] as const).map(m => (
              <button key={m} onClick={() => { setWdVerifyMethod(m); setWdOtp(""); setWdPwd(""); setWdOtpSent(false); }}
                style={{ flex: 1, padding: "7px 0", borderRadius: 7, border: "none", background: wdVerifyMethod === m ? "#fff" : "transparent", color: wdVerifyMethod === m ? C.text : C.muted, fontWeight: wdVerifyMethod === m ? 700 : 500, fontSize: 12, cursor: "pointer", fontFamily: F.cn, boxShadow: wdVerifyMethod === m ? "0 1px 4px rgba(0,0,0,.1)" : "none" }}>
                {m === "pwd" ? "支付密码" : "邮箱验证码"}
              </button>
            ))}
          </div>

          {wdVerifyMethod === "pwd" && (<>
            <MInp value={wdPwd} onChange={setWdPwd} placeholder="输入支付密码" type="password" />
            {mfaBound && (
              <div style={{ marginTop: 10 }}>
                <MLabel>MFA 验证码</MLabel>
                <input value={wdMfaCode} onChange={e => setWdMfaCode(e.target.value.replace(/\D/g,"").slice(0,6))}
                  placeholder="6 位动态码" maxLength={6}
                  style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 15, fontFamily: F.mono, fontWeight: 700, letterSpacing: 4, outline: "none", boxSizing: "border-box" as const, color: C.text }}
                  onFocus={e => (e.target.style.borderColor = C.yellow)} onBlur={e => (e.target.style.borderColor = C.border)} />
              </div>
            )}
          </>)}

          {wdVerifyMethod === "otp" && (<>
            {!wdOtpSent ? (
              <div style={{ textAlign: "center", padding: "8px 0 14px" }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>将向 <strong>us****@gmail.com</strong> 发送 6 位验证码</div>
                <button onClick={sendWdOtp}
                  style={{ padding: "9px 28px", borderRadius: 8, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>
                  发送验证码
                </button>
              </div>
            ) : (<>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, marginBottom: 12, fontSize: 12, color: "#16A34A" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                已发送至 us****@gmail.com
              </div>
              <input value={wdOtp} onChange={e => setWdOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
                placeholder="— — — — — —" maxLength={6} autoFocus
                style={{ width: "100%", padding: "12px 16px", border: `2px solid ${wdOtp.length === 6 ? "#16A34A" : C.border}`, borderRadius: 9, fontSize: 22, fontFamily: F.mono, fontWeight: 800, letterSpacing: 8, outline: "none", boxSizing: "border-box" as const, textAlign: "center" as const, marginBottom: 8 }} />
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                <button onClick={() => wdOtpTimer === 0 && sendWdOtp()} disabled={wdOtpTimer > 0}
                  style={{ background: "none", border: "none", fontSize: 12, color: wdOtpTimer > 0 ? C.muted : C.blue, cursor: wdOtpTimer > 0 ? "default" : "pointer", fontFamily: F.cn, padding: 0 }}>
                  {wdOtpTimer > 0 ? `${wdOtpTimer}s 后可重发` : "重新发送"}
                </button>
              </div>
            </>)}
          </>)}

          {(() => {
            const canConfirm = wdVerifyMethod === "pwd"
              ? (!!wdPwd.trim() && (!mfaBound || wdMfaCode.length === 6))
              : (wdOtpSent && wdOtp.length === 6);
            return (
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={() => { setMStep(1); setWdMfaCode(""); setWdOtp(""); setWdPwd(""); setWdOtpSent(false); }}
                  style={{ flex: 1, padding: "12px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>返回</button>
                <button onClick={() => {
                  if (!canConfirm) return;
                  setWdStep("loading");
                  setTimeout(() => {
                    setYunbi(y => parseFloat((y - wdDeduct).toFixed(4)));
                    if (usePool && poolCover > 0) setFeePool(p => parseFloat((p - poolCover).toFixed(4)));
                    setWdStep("ok"); setWdMfaCode(""); setWdOtp(""); setWdPwd(""); setWdOtpSent(false); setMStep(3);
                  }, 1600);
                }} disabled={!canConfirm || wdStep === "loading"}
                  style={{ flex: 2, padding: "12px", borderRadius: 9, border: "none", background: canConfirm ? C.dark : "#E5E7EB", color: canConfirm ? C.yellow : C.muted, fontWeight: 700, fontSize: 14, cursor: canConfirm ? "pointer" : "not-allowed", fontFamily: F.cn }}>
                  {wdStep === "loading" ? "提交中…" : "确认提现"}
                </button>
              </div>
            );
          })()}
        </>)}
        {mStep === 3 && (
          <div style={{ padding: "8px 0" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F0FDF4", border: "2px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, color: C.green }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style={{ fontSize: 19, fontWeight: 800, color: C.text, marginBottom: 4 }}>提现申请已提交</div>
              <div style={{ fontSize: 12, color: C.muted }}>审核通常 1–24 小时内完成，到账后发送邮件通知</div>
            </div>
            {/* Receipt */}
            <div style={{ background: "#F9FAFB", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 10, textTransform: "uppercase" as const, letterSpacing: .5 }}>交易回执</div>
              {([
                ["兑现云币",      `${wdRaw.toFixed(2)} 云币`],
                ["手续费（5%）",  `${wdFee.toFixed(4)} 云币`],
                ...(usePool && poolCover > 0 ? [["└ 签到云币抵扣", `- ${poolCover.toFixed(2)} 云币`]] : []),
                ...(yunbiCover > 0          ? [["└ 云币余额扣除", `- ${yunbiCover.toFixed(4)} 云币`]] : []),
                ["到账网络",      wdNet],
                ["收款地址",      wdAddr.slice(0,8) + "…" + wdAddr.slice(-6)],
                ["预计到账",      `${wdUsdt} USDT`],
              ] as [string,string][]).map(([k, v], i, arr) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", borderBottom: i < arr.length - 1 ? `1px dashed #E5E7EB` : "none" }}>
                  <span style={{ color: C.muted }}>{k}</span>
                  <span style={{ fontFamily: F.mono, fontWeight: 700, color: k === "预计到账" ? "#7C3AED" : k.includes("抵扣") ? "#16A34A" : C.text }}>{v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { closeModal(); setWdAmt(""); setWdPwd(""); setWdStep("idle"); setUsePool(false); }}
              style={{ width: "100%", padding: "12px 40px", borderRadius: 9, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>
              完成
            </button>
          </div>
        )}
      </Modal>
    );
  };

  /* ── Settings modals ── */
  const PayPwdModal = () => (
    <Modal title={payPwdSet ? "修改支付密码" : "设置支付密码"} onClose={closeModal}>
      <StepDots total={2} current={mStep} />
      {mStep === 1 && (<>
        <div style={{ marginBottom: 14 }}><MLabel>原支付密码</MLabel><MInp value={payOld} onChange={setPayOld} type="password" placeholder="当前支付密码" /></div>
        <div style={{ marginBottom: 14 }}><MLabel>新支付密码</MLabel><MInp value={payNew} onChange={setPayNew} type="password" placeholder="6 位新密码" /></div>
        <div style={{ marginBottom: 20 }}><MLabel>确认新支付密码</MLabel><MInp value={payCfm} onChange={setPayCfm} type="password" placeholder="再次输入" /></div>
        {payStep === "err" && <div style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, color: C.red, marginBottom: 14 }}>两次密码不一致或不足 6 位</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={closeModal} style={{ flex: 1, padding: "12px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>取消</button>
          <button onClick={() => { if (!payOld || payNew !== payCfm || payNew.length < 6) { setPayStep("err"); return; } setPayStep("idle"); setMStep(2); }}
            style={{ flex: 2, padding: "12px", borderRadius: 9, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>
            下一步确认
          </button>
        </div>
      </>)}
      {mStep === 2 && (<>
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F0FDF4", border: "2px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: C.green }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>{payPwdSet ? "支付密码已修改" : "支付密码已设置"}</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>密码已生效，提现操作时需要验证</div>
          <button onClick={() => { setPayPwdSet(true); closeModal(); setPayOld(""); setPayNew(""); setPayCfm(""); setPayStep("idle"); }}
            style={{ padding: "12px 40px", borderRadius: 9, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>完成</button>
        </div>
      </>)}
    </Modal>
  );

  const EmailModal = () => (
    <Modal title="修改绑定邮箱" onClose={closeModal}>
      <StepDots total={3} current={mStep} />
      {mStep === 1 && (<>
        <div style={{ padding: "12px 14px", background: "#F9FAFB", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, color: C.muted, marginBottom: 18 }}>
          当前邮箱：<strong style={{ color: C.text }}>{curEmail}</strong>
        </div>
        <div style={{ marginBottom: 20 }}><MLabel>新邮箱地址</MLabel><MInp value={newEmail} onChange={setNewEmail} placeholder="新邮箱" /></div>
        {emailStep === "err" && <div style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, color: C.red, marginBottom: 14 }}>请填写有效的邮箱地址</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={closeModal} style={{ flex: 1, padding: "12px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>取消</button>
          <button onClick={() => { if (!newEmail.includes("@")) { setEmailStep("err"); return; } setEmailStep("idle"); sendOtp(); setMStep(2); }}
            style={{ flex: 2, padding: "12px", borderRadius: 9, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>
            发送验证码
          </button>
        </div>
      </>)}
      {mStep === 2 && (<>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>验证码已发送至 <strong style={{ color: C.text }}>{newEmail}</strong></div>
        <div style={{ marginBottom: 20 }}><MLabel>邮箱验证码</MLabel><MInp value={emailOtp} onChange={setEmailOtp} placeholder="6 位验证码" mono /></div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <button onClick={() => { if (otpTimer === 0) sendOtp(); }} disabled={otpTimer > 0}
            style={{ background: "none", border: "none", cursor: otpTimer > 0 ? "not-allowed" : "pointer", fontSize: 12, color: otpTimer > 0 ? C.muted : C.blue, fontFamily: F.cn }}>
            {otpTimer > 0 ? `${otpTimer}s 后重发` : "重新发送"}
          </button>
        </div>
        {emailStep === "err" && <div style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, color: C.red, marginBottom: 14 }}>验证码错误或已过期</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setMStep(1)} style={{ flex: 1, padding: "12px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>返回</button>
          <button onClick={() => { if (!emailOtp || emailOtp.length < 4) { setEmailStep("err"); return; } setEmailStep("loading"); setTimeout(() => { setEmailStep("ok"); setMStep(3); }, 1400); }} disabled={emailStep === "loading"}
            style={{ flex: 2, padding: "12px", borderRadius: 9, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>
            {emailStep === "loading" ? "验证中…" : "验证并更换"}
          </button>
        </div>
      </>)}
      {mStep === 3 && (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F0FDF4", border: "2px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: C.green }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>邮箱已更新</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>新绑定邮箱：<strong>{newEmail}</strong></div>
          <button onClick={() => { closeModal(); setNewEmail(""); setEmailOtp(""); setOtpSent(false); setEmailStep("idle"); }}
            style={{ padding: "12px 40px", borderRadius: 9, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>完成</button>
        </div>
      )}
    </Modal>
  );

  const LoginPwdModal = () => (
    <Modal title="修改登录密码" onClose={closeModal}>
      <StepDots total={3} current={mStep} />
      {mStep === 1 && (<>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>请输入绑定邮箱以接收验证码</div>
        <div style={{ marginBottom: 20 }}><MLabel>绑定邮箱</MLabel><MInp value={loginEmail} onChange={setLoginEmail} placeholder="输入绑定邮箱" /></div>
        {loginStep === "err" && <div style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, color: C.red, marginBottom: 14 }}>请填写有效的邮箱地址</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={closeModal} style={{ flex: 1, padding: "12px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>取消</button>
          <button onClick={() => { if (!loginEmail.includes("@")) { setLoginStep("err"); return; } setLoginStep("idle"); sendLoginOtp(); setMStep(2); }}
            style={{ flex: 2, padding: "12px", borderRadius: 9, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>
            发送 OTP 验证码
          </button>
        </div>
      </>)}
      {mStep === 2 && (<>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>验证码已发送至 <strong style={{ color: C.text }}>{loginEmail}</strong></div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}><MLabel>OTP 验证码</MLabel><MInp value={loginOtp} onChange={setLoginOtp} placeholder="6 位验证码" mono /></div>
            <button onClick={() => loginOtpTimer === 0 && sendLoginOtp()} disabled={loginOtpTimer > 0}
              style={{ flexShrink: 0, padding: "11px 14px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: loginOtpTimer > 0 ? C.muted : C.text, fontWeight: 600, fontSize: 12, cursor: loginOtpTimer > 0 ? "not-allowed" : "pointer", fontFamily: F.cn, whiteSpace: "nowrap" as const }}>
              {loginOtpTimer > 0 ? `${loginOtpTimer}s` : "重发"}
            </button>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}><MLabel>新登录密码</MLabel><MInp value={loginNewPwd} onChange={setLoginNewPwd} type="password" placeholder="至少 8 位" /></div>
        <div style={{ marginBottom: 20 }}><MLabel>确认新密码</MLabel><MInp value={loginCfmPwd} onChange={setLoginCfmPwd} type="password" placeholder="再次输入" /></div>
        {loginStep === "err" && <div style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, color: C.red, marginBottom: 14 }}>验证码错误，或两次密码不一致（至少 8 位）</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setMStep(1)} style={{ flex: 1, padding: "12px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>返回</button>
          <button onClick={() => { if (!loginOtp || loginNewPwd.length < 8 || loginNewPwd !== loginCfmPwd) { setLoginStep("err"); return; } setLoginStep("loading"); setTimeout(() => { setLoginStep("ok"); setMStep(3); }, 1500); }} disabled={loginStep === "loading"}
            style={{ flex: 2, padding: "12px", borderRadius: 9, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>
            {loginStep === "loading" ? "修改中…" : "确认修改"}
          </button>
        </div>
      </>)}
      {mStep === 3 && (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F0FDF4", border: "2px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: C.green }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>密码修改成功</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>新密码已生效，下次登录时请使用新密码</div>
          <button onClick={() => { closeModal(); setLoginEmail(""); setLoginOtp(""); setLoginNewPwd(""); setLoginCfmPwd(""); setLoginOtpSent(false); setLoginStep("idle"); }}
            style={{ padding: "12px 40px", borderRadius: 9, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>完成</button>
        </div>
      )}
    </Modal>
  );

  /* ── MFA setup modal ── */
  const MfaModal = () => {
    const doVerifyMfa = () => {
      if (mfaCode.length !== 6 || !/^\d+$/.test(mfaCode)) { setMfaCodeErr(true); return; }
      setMfaCodeErr(false);
      setMfaStep("ok");
      setTimeout(() => { setMfaBound(true); closeModal(); }, 1800);
    };
    /* tiny QR placeholder — 9-block pattern seeded from secret */
    const QR = () => (
      <svg width="96" height="96" viewBox="0 0 9 9" style={{ imageRendering: "pixelated" as const }}>
        {Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => {
          const v = ((r * 3 + c * 7 + r * c) % 3 === 0) || (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3);
          return v ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#111" /> : null;
        }))}
      </svg>
    );
    if (mfaBound && mfaStep !== "ok") {
      return (
        <Modal title="管理 MFA 验证器" onClose={closeModal}>
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F0FDF4", border: "2px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: C.green }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 6 }}>MFA 验证器已绑定</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 24, lineHeight: 1.7 }}>
              每次提现需输入验证器中的 6 位动态码<br/>请勿删除验证器 App 中的账号
            </div>
            <button onClick={() => { setMfaBound(false); closeModal(); }}
              style={{ padding: "10px 28px", borderRadius: 9, border: `1px solid ${C.red}`, background: "#FEF2F2", color: C.red, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>
              解绑 MFA
            </button>
          </div>
        </Modal>
      );
    }
    return (
      <Modal title="绑定 MFA 验证器" onClose={closeModal}>
        {mfaStep === "qr" && (<>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
            使用 <strong style={{ color: C.text }}>Google Authenticator</strong> 或 <strong style={{ color: C.text }}>Authy</strong> 扫描二维码，提现时需输入动态验证码。
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
            <div style={{ padding: 8, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, flexShrink: 0 }}>
              <QR />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>无法扫码？手动输入密钥：</div>
              <div style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: C.text, background: "#F9FAFB", border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 10px", wordBreak: "break-all" as const }}>
                {MFA_SECRET}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>TOTP · 30 秒刷新</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={closeModal} style={{ flex: 1, padding: "10px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>取消</button>
            <button onClick={() => { setMfaStep("verify"); setMfaCode(""); setMfaCodeErr(false); }}
              style={{ flex: 2, padding: "10px", borderRadius: 9, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>
              已扫码，下一步
            </button>
          </div>
        </>)}
        {mfaStep === "verify" && (<>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>打开验证器 App，输入当前显示的 6 位动态码以完成绑定。</div>
          <input
            value={mfaCode} onChange={e => { setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setMfaCodeErr(false); }}
            placeholder="000000" maxLength={6}
            style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${mfaCodeErr ? C.red : C.border}`, borderRadius: 9, fontSize: 20, fontFamily: F.mono, fontWeight: 700, letterSpacing: 8, textAlign: "center" as const, outline: "none", boxSizing: "border-box" as const, color: C.text, marginBottom: 6 }}
            onFocus={e => (e.target.style.borderColor = C.yellow)}
            onBlur={e => (e.target.style.borderColor = mfaCodeErr ? C.red : C.border)}
          />
          {mfaCodeErr && <div style={{ fontSize: 12, color: C.red, marginBottom: 8 }}>请输入完整的 6 位数字验证码</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => setMfaStep("qr")} style={{ flex: 1, padding: "12px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>返回</button>
            <button onClick={doVerifyMfa} disabled={mfaCode.length !== 6}
              style={{ flex: 2, padding: "12px", borderRadius: 9, border: "none", background: mfaCode.length === 6 ? C.dark : "#E5E7EB", color: mfaCode.length === 6 ? C.yellow : C.muted, fontWeight: 700, fontSize: 14, cursor: mfaCode.length === 6 ? "pointer" : "not-allowed", fontFamily: F.cn }}>
              确认绑定
            </button>
          </div>
        </>)}
        {mfaStep === "ok" && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F0FDF4", border: "2px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: C.green }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.green, marginBottom: 8 }}>MFA 绑定成功！</div>
            <div style={{ fontSize: 13, color: C.muted }}>验证器已激活，提现时需要输入动态验证码</div>
          </div>
        )}
      </Modal>
    );
  };

  /* ── Bind wallet modal ── */
  const BindWalletModal = () => {
    const unboundNets = (["BSC", "Tron"] as const).filter(n => !walletAddrs[n]);
    // derive effective network without setState during render
    const effectiveNet = unboundNets.includes(bindWalletNet) ? bindWalletNet : (unboundNets[0] ?? bindWalletNet);
    return (
    <Modal title="绑定提现地址" onClose={() => { if (bindWalletStep !== "loading") { setBindWalletModal(false); setBindWalletStep("form"); setBindWalletInput(""); } }}>
      {bindWalletStep !== "done" ? (<>
        {/* Current binding status */}
        {(["BSC", "Tron"] as const).some(n => walletAddrs[n]) && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: .5 }}>已绑定地址</div>
            {(["BSC", "Tron"] as const).filter(n => walletAddrs[n]).map(n => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#16A34A", fontFamily: F.en }}>{n}</span>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: C.muted, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{walletAddrs[n]}</span>
                <span style={{ fontSize: 10, color: "#16A34A", fontWeight: 700 }}>✓ 已绑定</span>
              </div>
            ))}
          </div>
        )}
        {unboundNets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "16px 0", color: C.muted, fontSize: 13 }}>BSC 和 Tron 地址均已绑定</div>
        ) : (<>
          {unboundNets.length > 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {unboundNets.map(net => (
                <div key={net} onClick={() => setBindWalletNet(net)}
                  style={{ border: `1.5px solid ${effectiveNet === net ? "#7C3AED" : C.border}`, borderRadius: 9, padding: "12px 14px", cursor: "pointer", background: effectiveNet === net ? "#F5F3FF" : "#FAFAFA", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${effectiveNet === net ? "#7C3AED" : "#D1D5DB"}`, background: effectiveNet === net ? "#7C3AED" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {effectiveNet === net && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }}/>}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: effectiveNet === net ? "#7C3AED" : C.text }}>{net}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{net === "BSC" ? "BEP-20 · USDT · 手续费 3%" : "TRC-20 · USDT · 手续费 5%"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {unboundNets.length === 1 && (
            <div style={{ padding: "10px 14px", background: "#F5F3FF", border: "1.5px solid #7C3AED", borderRadius: 9, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#7C3AED", fontFamily: F.en }}>{effectiveNet}</span>
              <span style={{ fontSize: 12, color: "#7C3AED" }}>{effectiveNet === "BSC" ? "BEP-20 · USDT · 手续费 3%" : "TRC-20 · USDT · 手续费 5%"}</span>
            </div>
          )}
          <MLabel>收款地址（{effectiveNet}）</MLabel>
          <MInp value={bindWalletInput} onChange={setBindWalletInput} placeholder={effectiveNet === "BSC" ? "0x..." : "T..."} mono />
          <div style={{ fontSize: 12, color: "#D97706", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 7, padding: "8px 12px", marginTop: 10, marginBottom: 20, lineHeight: 1.6 }}>
            ⚠ 请务必确认地址正确。<strong>绑定后不可修改</strong>，提现将发至此地址。
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setBindWalletModal(false); setBindWalletStep("form"); setBindWalletInput(""); }}
              style={{ flex: 1, padding: "12px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>取消</button>
            <button onClick={doBindWallet} disabled={!bindWalletInput.trim() || bindWalletStep === "loading"}
              style={{ flex: 2, padding: "12px", borderRadius: 9, border: "none", background: bindWalletInput.trim() ? C.dark : "#E5E7EB", color: bindWalletInput.trim() ? C.yellow : C.muted, fontWeight: 700, fontSize: 14, cursor: bindWalletInput.trim() ? "pointer" : "not-allowed", fontFamily: F.cn }}>
              {bindWalletStep === "loading" ? "绑定中…" : "确认绑定"}
            </button>
          </div>
        </>)}
      </>) : (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#F0FDF4", border: "2px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#16A34A" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 6 }}>绑定成功</div>
          <div style={{ fontSize: 13, color: C.muted }}>
            {effectiveNet} 地址已绑定，绑定后不可修改
          </div>
        </div>
      )}
    </Modal>
  );
  };

  /* ── transaction history ── */
  const TX_HISTORY = [
    { date: "2026-09-10", type: "积分兑换云币", amount: "+10.00 云币",  detail: "1,000 积分 → 10.00 云币",   status: "完成" },
    { date: "2026-09-08", type: "云币兑现",     amount: "80.00 USDT",  detail: "80 云币 → Tron (TRC-20)",  status: "审核中" },
    { date: "2026-09-05", type: "积分兑换云币", amount: "+5.00 云币",   detail: "500 积分 → 5.00 云币",     status: "完成" },
    { date: "2026-09-01", type: "每日签到",     amount: "+10 签到云币",  detail: "连续签到第 7 天",           status: "完成" },
    { date: "2026-08-31", type: "积分兑换云币", amount: "+10.00 云币",   detail: "1,000 积分 → 10.00 云币",  status: "完成" },
    { date: "2026-08-28", type: "云币兑现",     amount: "80.00 USDT",   detail: "80 云币 → Tron (TRC-20)",  status: "完成" },
    { date: "2026-08-25", type: "每日签到",     amount: "+10 签到云币",  detail: "连续签到第 4 天",           status: "完成" },
    { date: "2026-08-20", type: "积分兑换云币", amount: "+5.00 云币",    detail: "500 积分 → 5.00 云币",     status: "完成" },
    { date: "2026-08-18", type: "云币兑现",     amount: "50.00 USDT",   detail: "50 云币 → BSC (BEP-20)",   status: "完成" },
    { date: "2026-08-15", type: "每日签到",     amount: "+10 签到云币",  detail: "连续签到第 2 天",           status: "完成" },
    { date: "2026-08-12", type: "积分兑换云币", amount: "+2.00 云币",    detail: "200 积分 → 2.00 云币",     status: "完成" },
    { date: "2026-08-10", type: "云币兑现",     amount: "30.00 USDT",   detail: "30 云币 → Tron (TRC-20)",  status: "失败" },
    { date: "2026-08-08", type: "每日签到",     amount: "+40 签到云币",  detail: "连续签到第 7 天 · 额外奖励 +30", status: "完成" },
    { date: "2026-08-05", type: "积分兑换云币", amount: "+15.00 云币",   detail: "1,500 积分 → 15.00 云币",  status: "完成" },
    { date: "2026-08-01", type: "云币兑现",     amount: "100.00 USDT",  detail: "100 云币 → BSC (BEP-20)",  status: "完成" },
    { date: "2026-07-28", type: "每日签到",     amount: "+10 签到云币",  detail: "连续签到第 4 天",           status: "完成" },
    { date: "2026-07-25", type: "积分兑换云币", amount: "+8.00 云币",    detail: "800 积分 → 8.00 云币",     status: "完成" },
    { date: "2026-07-20", type: "云币兑现",     amount: "60.00 USDT",   detail: "60 云币 → Tron (TRC-20)",  status: "审核中" },
    { date: "2026-07-15", type: "每日签到",     amount: "+10 签到云币",  detail: "连续签到第 3 天",           status: "完成" },
    { date: "2026-07-10", type: "积分兑换云币", amount: "+3.00 云币",   detail: "300 积分 → 3.00 云币",     status: "完成" },
  ];
  const statusColor = (s: string) => s === "完成" ? { bg: "#F0FDF4", border: "#BBF7D0", text: "#16A34A" } : s === "审核中" ? { bg: "#FFFBEB", border: "#FDE68A", text: "#D97706" } : s === "失败" ? { bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" } : { bg: "#F3F4F6", border: "#E5E7EB", text: C.muted };

  /* ── tx list filter / page state ── */
  const [txSearch, setTxSearch] = useState("");
  const [txFrom,   setTxFrom]   = useState("");
  const [txTo,     setTxTo]     = useState("");
  const [txPage,   setTxPage]   = useState(1);
  const [txSize,   setTxSize]   = useState(10);

  /* ── action cards for account tab ── */
  const ActionCard = ({ icon, title, subtitle, btnLabel, btnColor = C.dark, btnTextColor = C.yellow, onClick }: { icon: React.ReactNode; title: string; subtitle: string; btnLabel: string; btnColor?: string; btnTextColor?: string; onClick: () => void }) => (
    <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
      <div style={{ width: 44, height: 44, borderRadius: 11, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.muted }}>{subtitle}</div>
      </div>
      <button onClick={onClick} style={{ flexShrink: 0, padding: "9px 20px", borderRadius: 8, border: "none", background: btnColor, color: btnTextColor, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>
        {btnLabel}
      </button>
    </div>
  );

  /* ── setting row ── */
  const SettingRow = ({ icon, title, subtitle, onClick }: { icon: React.ReactNode; title: string; subtitle: string; onClick: () => void }) => (
    <div onClick={onClick} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.muted }}>{subtitle}</div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
    </div>
  );

  return (
    <div style={{ background: "#F7F8FA", fontFamily: F.cn, minHeight: "100%" }}>

      {/* Modals */}
      {acctModal === "exchange" && <ExchangeModal />}
      {acctModal === "withdraw" && <WithdrawModal />}
      {settModal === "paypwd"   && <PayPwdModal />}
      {settModal === "email"    && <EmailModal />}
      {settModal === "loginpwd" && <LoginPwdModal />}
      {settModal === "mfa"      && <MfaModal />}
      {bindWalletModal          && <BindWalletModal />}

      {/* ── Checkin rules modal ── */}
      {/* ── Hero profile card (matches home page style) ── */}
      <div style={{ margin: "0 0 0 0", background: `linear-gradient(135deg,#0f1729 0%,#1a2a50 60%,#251a45 100%)`, padding: "18px 28px 0", position: "relative", overflow: "hidden" }}>
        {/* decorative glows */}
        <div style={{ position: "absolute", top: -50, right: 100, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,215,0,.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, right: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(156,39,176,.07)", pointerEvents: "none" }} />

        {/* identity row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18, position: "relative" }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg,${C.yellow},${C.orange})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 24, color: C.dark, border: "2px solid rgba(206,147,216,.6)", boxShadow: "0 2px 16px rgba(255,215,0,.32)" }}>S</div>
            <div style={{ position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg,#7C3AED,#4F46E5)", borderRadius: 99, padding: "2px 8px", fontSize: 9, fontWeight: 800, color: "#fff", whiteSpace: "nowrap" as const, letterSpacing: 0.5 }}>VIP 1</div>
          </div>

          {/* name + email + badges */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 7 }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: 0.2, fontFamily: F.en }}>sb1920mg</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.32)", fontFamily: F.mono }}>us****@example.com</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#FBBF24", background: "rgba(251,191,36,.12)", border: "1px solid rgba(251,191,36,.28)", borderRadius: 99, padding: "3px 12px" }}>👑 黄金会员 VIP1</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#4ADE80", background: "rgba(74,222,128,.1)", borderRadius: 99, padding: "3px 10px" }}>● 在线</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.32)", background: "rgba(255,255,255,.05)", borderRadius: 99, padding: "3px 10px" }}>连续签到 {streak} 天</span>
            </div>
          </div>
        </div>

        {/* divider that bleeds into content */}
        <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "0 -28px" }} />
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "20px 28px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

          {/* ── Left column: balances + tx history ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Balance card — three large tiles */}
            <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                {[
                  {
                    label: "积分余额", value: pts.toLocaleString(), unit: "积分",
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v2m0 6v2M9.5 9.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2c0 2.5-5 2.5-5 5s.9 2 2.5 2 2.5-.9 2.5-2"/></svg>,
                    color: "#D97706", iconBg: "#FFF7ED", iconBorder: "#FED7AA", valueBg: "#FFFBF0",
                    btn: { label: "兑换云币", onClick: () => openAcct("exchange"), primary: true },
                  },
                  {
                    label: "云币余额", value: yunbi.toFixed(2), unit: "YB",
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>,
                    color: "#7C3AED", iconBg: "#F5F3FF", iconBorder: "#DDD6FE", valueBg: "#FAF8FF",
                    btn: { label: "兑现 USDT", onClick: () => openAcct("withdraw"), primary: false },
                  },
                  {
                    label: "签到云币池", value: feePool.toFixed(2), unit: "YB",
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
                    color: "#16A34A", iconBg: "#F0FDF4", iconBorder: "#BBF7D0", valueBg: "#F5FEF7",
                    btn: null,
                  },
                ].map((b, i) => (
                  <div key={b.label} style={{ background: b.valueBg, borderRight: i < 2 ? `1px solid ${C.border}` : "none", padding: "22px 22px 18px" }}>
                    {/* icon + label */}
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: b.iconBg, border: `1px solid ${b.iconBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: b.color, flexShrink: 0 }}>
                        {b.icon}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>{b.label}</span>
                    </div>
                    {/* value */}
                    <div style={{ fontFamily: F.mono, fontWeight: 900, fontSize: 26, color: b.color, lineHeight: 1, marginBottom: 4 }}>{b.value}</div>
                    <div style={{ fontSize: 11, color: b.color, opacity: 0.55, marginBottom: b.btn ? 14 : 0 }}>{b.unit}</div>
                    {b.btn && (
                      <button onClick={b.btn.onClick}
                        style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: b.btn.primary ? "none" : `1px solid ${C.border}`,
                          background: b.btn.primary ? C.dark : "#fff", color: b.btn.primary ? C.yellow : C.text,
                          fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: F.cn }}>
                        {b.btn.label}
                      </button>
                    )}
                    {!b.btn && (
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>每日签到<br/>自动积累</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction history — searchable paginated table */}
            {(() => {
              const txFiltered = TX_HISTORY.filter(tx => {
                const q = txSearch.trim().toLowerCase();
                if (q && !tx.type.toLowerCase().includes(q) && !tx.detail.toLowerCase().includes(q) && !tx.status.toLowerCase().includes(q)) return false;
                if (txFrom && tx.date < txFrom) return false;
                if (txTo   && tx.date > txTo)   return false;
                return true;
              });
              const txPages  = Math.max(1, Math.ceil(txFiltered.length / txSize));
              const safePage = Math.min(txPage, txPages);
              const txRows   = txFiltered.slice((safePage - 1) * txSize, safePage * txSize);
              const COLS     = ["#", "日期", "类型", "说明", "金额", "状态"];
              return (
                <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                  {/* toolbar */}
                  <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, background: "#FAFAFA" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text, marginRight: 4 }}>交易记录</span>
                    <input value={txSearch} onChange={e => { setTxSearch(e.target.value); setTxPage(1); }}
                      placeholder="搜索类型 / 说明…"
                      style={{ padding: "5px 10px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, outline: "none", width: 160, fontFamily: F.cn }} />
                    <input type="date" value={txFrom} onChange={e => { setTxFrom(e.target.value); setTxPage(1); }}
                      style={{ padding: "5px 8px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, outline: "none", colorScheme: "light" as const }} />
                    <span style={{ fontSize: 11, color: C.muted }}>至</span>
                    <input type="date" value={txTo} onChange={e => { setTxTo(e.target.value); setTxPage(1); }}
                      style={{ padding: "5px 8px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, outline: "none", colorScheme: "light" as const }} />
                    {(txSearch || txFrom || txTo) && (
                      <button onClick={() => { setTxSearch(""); setTxFrom(""); setTxTo(""); setTxPage(1); }}
                        style={{ padding: "5px 10px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, background: "#fff", color: C.muted, cursor: "pointer", fontFamily: F.cn }}>重置</button>
                    )}
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, color: C.muted }}>每页</span>
                      <select value={txSize} onChange={e => { setTxSize(Number(e.target.value)); setTxPage(1); }}
                        style={{ padding: "4px 6px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, outline: "none", background: "#fff" }}>
                        {[5, 10, 20].map(n => <option key={n} value={n}>{n} 条</option>)}
                      </select>
                      <span style={{ fontSize: 11, color: C.muted }}>共 {txFiltered.length} 条</span>
                    </div>
                  </div>
                  {/* table */}
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "#F7F8FA" }}>
                        {COLS.map((h, hi) => (
                          <th key={h} style={{ padding: "8px 12px", fontWeight: 700, color: "#9AA3B0", fontSize: 11, textAlign: hi >= 4 ? "center" as const : "left" as const, borderBottom: `1.5px solid ${C.border}`, whiteSpace: "nowrap" as const, letterSpacing: .3 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {txRows.length === 0 ? (
                        <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center" as const, color: C.muted, fontSize: 13 }}>暂无符合条件的记录</td></tr>
                      ) : txRows.map((tx, i) => {
                        const sc = statusColor(tx.status);
                        const rowNum = (safePage - 1) * txSize + i + 1;
                        const isCredit = tx.amount.startsWith("+");
                        const isUSDT = tx.amount.includes("USDT");
                        const isCheckin = tx.type === "每日签到";
                        return (
                          <tr key={`${tx.date}-${i}`} style={{ background: i % 2 === 0 ? "#fff" : "#FAFBFC", borderBottom: `1px solid ${C.border}` }}>
                            <td style={{ padding: "9px 12px", color: "#BDBDBD", fontFamily: F.mono, fontSize: 11 }}>{String(rowNum).padStart(2,"0")}</td>
                            <td style={{ padding: "9px 12px", fontFamily: F.mono, fontSize: 12, color: C.muted, whiteSpace: "nowrap" as const }}>{tx.date}</td>
                            <td style={{ padding: "9px 12px" }}>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                                background: tx.type === "积分兑换云币" ? "#EFF6FF" : tx.type === "云币兑现" ? "#F5F3FF" : "#F0FDF4",
                                color:      tx.type === "积分兑换云币" ? "#1D4ED8"  : tx.type === "云币兑现" ? "#7C3AED"  : "#16A34A" }}>
                                {tx.type}
                              </span>
                            </td>
                            <td style={{ padding: "9px 12px", color: C.muted, fontSize: 12 }}>{tx.detail}</td>
                            <td style={{ padding: "9px 12px", textAlign: "center" as const, fontFamily: F.mono, fontWeight: 800, fontSize: 13,
                              color: isCheckin ? "#10B981" : isCredit ? C.green : isUSDT ? "#7C3AED" : C.text }}>
                              {tx.amount}
                            </td>
                            <td style={{ padding: "9px 12px", textAlign: "center" as const }}>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 99, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>{tx.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {/* pagination */}
                  {txPages > 1 && (
                    <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                      <button onClick={() => setTxPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                        style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: safePage === 1 ? "#F3F4F6" : "#fff", color: safePage === 1 ? C.muted : C.text, cursor: safePage === 1 ? "default" : "pointer", fontSize: 12, fontFamily: F.cn }}>上一页</button>
                      {Array.from({ length: txPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setTxPage(p)}
                          style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${p === safePage ? C.yellow : C.border}`, background: p === safePage ? C.yellow : "#fff", color: p === safePage ? C.dark : C.text, fontWeight: p === safePage ? 700 : 400, cursor: "pointer", fontSize: 12 }}>{p}</button>
                      ))}
                      <button onClick={() => setTxPage(p => Math.min(txPages, p + 1))} disabled={safePage === txPages}
                        style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: safePage === txPages ? "#F3F4F6" : "#fff", color: safePage === txPages ? C.muted : C.text, cursor: safePage === txPages ? "default" : "pointer", fontSize: 12, fontFamily: F.cn }}>下一页</button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* ── Right column: settings ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* 资金安全 */}
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
              <div style={{ padding: "12px 18px 10px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase" as const, letterSpacing: 0.8 }}>资金安全</span>
              </div>
              {[
                { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>, title: payPwdSet ? "支付密码" : "设置支付密码", sub: payPwdSet ? "已设置 · 用于提现、兑换验证" : "⚠ 未设置，提现前必须设置", badge: payPwdSet ? { label: "已设置", green: true } : { label: "未设置", green: false }, onClick: () => openSett("paypwd") },
                { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>, title: "提现收款地址", sub: walletBound ? (["BSC","Tron"] as const).filter(n=>walletAddrs[n]).map(n=>`${n} 已绑定`).join(" · ") : "⚠ 未绑定，提现前必须绑定", badge: walletBound ? { label: "已绑定", green: true } : { label: "未绑定", green: false }, onClick: () => { setBindWalletModal(true); setBindWalletStep("form"); setBindWalletInput(""); } },
                { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={mfaBound ? C.green : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>, title: "MFA 验证器", sub: mfaBound ? "已绑定 · 提现时需输入 6 位动态码" : "未绑定 · 绑定后可增强提现安全性", badge: mfaBound ? { label: "已启用", green: true } : { label: "未启用", green: false }, onClick: () => openSett("mfa") },
              ].map((r, i, arr) => (
                <div key={r.title} onClick={r.onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer", transition: "background .12s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, flexShrink: 0 }}>{r.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 1 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{r.sub}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: r.badge.green ? "#F0FDF4" : "#FEF2F2", color: r.badge.green ? "#16A34A" : "#DC2626", border: `1px solid ${r.badge.green ? "#BBF7D0" : "#FECACA"}`, flexShrink: 0 }}>{r.badge.label}</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              ))}
            </div>

            {/* 账号与登录 */}
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
              <div style={{ padding: "12px 18px 10px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase" as const, letterSpacing: 0.8 }}>账号与登录</span>
              </div>
              {[
                { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, title: "绑定邮箱", sub: `当前：${curEmail}`, onClick: () => openSett("email") },
                { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: "登录密码", sub: "需邮箱 OTP 验证，至少 8 位", onClick: () => openSett("loginpwd") },
              ].map((r, i, arr) => (
                <div key={r.title} onClick={r.onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, flexShrink: 0 }}>{r.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 1 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{r.sub}</div>
                  </div>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MERCHANT — PAGE 5: MULTI-ACCOUNT
══════════════════════════════════════════════════════════════ */

type NodeReferral = {
  user: string; joinDate: string; activatedTerminals: number; cardsBought: number;
  spentYunbi: number; spentPts: number; rewardPts: number; status: "已激活"|"注册中";
  txHistory: { time: string; type: string; detail: string; amount: string; status: string }[];
};
type NodeTask = {
  id: string; user: string; domain: string; type: string;
  totalHours: number; doneHours: number;
  lotteryResult: "未抽" | "中奖" | "未中奖" | "暴击";
  lotteryPts: number;   // pts agent earned if won
};
const NODE_REFERRALS: NodeReferral[] = [
  {
    user: "sb****@gmail.com", joinDate: "2026-07-12", activatedTerminals: 12, cardsBought: 15,
    spentYunbi: 750, spentPts: 60000, rewardPts: 6400, status: "已激活",
    txHistory: [
      { time: "2026-09-05 14:22", type: "激活绑定",     detail: "终端 #12 激活",             amount: "1 张卡",     status: "完成" },
      { time: "2026-09-01 10:08", type: "积分兑换云币",  detail: "10,000 积分 → 10.00 云币", amount: "10,000 积分", status: "完成" },
      { time: "2026-08-28 18:45", type: "购买激活卡",    detail: "50 云币 × 3 张",           amount: "150 云币",   status: "完成" },
      { time: "2026-08-25 09:12", type: "参与抽奖",      detail: "投入 2,000 积分",           amount: "2,000 积分", status: "完成" },
      { time: "2026-08-20 16:30", type: "云币兑现",      detail: "200 云币 → USDT (Tron)",   amount: "190 USDT",   status: "完成" },
      { time: "2026-08-15 11:00", type: "积分转账",      detail: "收到 5,000 积分",           amount: "+5,000 积分", status: "完成" },
    ],
  },
  {
    user: "tr****@outlook.com", joinDate: "2026-07-18", activatedTerminals: 10, cardsBought: 12,
    spentYunbi: 600, spentPts: 50000, rewardPts: 4800, status: "已激活",
    txHistory: [
      { time: "2026-09-06 08:00", type: "激活绑定",     detail: "终端 #10 激活",             amount: "1 张卡",     status: "完成" },
      { time: "2026-09-02 20:15", type: "挂卖云币",      detail: "200 云币 @ 0.95 USDT",    amount: "200 云币",   status: "挂卖中" },
      { time: "2026-08-29 13:40", type: "购买激活卡",    detail: "5,000 积分 × 2 张",        amount: "10,000 积分", status: "完成" },
      { time: "2026-08-22 09:22", type: "奖励激活卡",    detail: "抽奖中奖赠送",              amount: "1 张",       status: "完成" },
      { time: "2026-08-18 17:05", type: "转让激活卡",    detail: "转让给 mk****@yahoo.com",  amount: "1 张",       status: "完成" },
      { time: "2026-08-10 12:00", type: "云币兑现",      detail: "150 云币 → USDT (BSC)",    amount: "142.5 USDT", status: "完成" },
    ],
  },
  {
    user: "mk****@yahoo.com", joinDate: "2026-07-25", activatedTerminals: 8, cardsBought: 10,
    spentYunbi: 500, spentPts: 40000, rewardPts: 3200, status: "已激活",
    txHistory: [
      { time: "2026-09-04 15:33", type: "激活绑定",     detail: "终端 #8 激活",              amount: "1 张卡",     status: "完成" },
      { time: "2026-09-01 11:20", type: "积分兑换云币",  detail: "8,000 积分 → 8.00 云币",   amount: "8,000 积分", status: "完成" },
      { time: "2026-08-28 09:45", type: "购买激活卡",    detail: "50 云币 × 2 张",           amount: "100 云币",   status: "完成" },
      { time: "2026-08-20 11:00", type: "参与抽奖",      detail: "投入 3,000 积分",           amount: "3,000 积分", status: "完成" },
    ],
  },
  {
    user: "we****@gmail.com", joinDate: "2026-08-01", activatedTerminals: 7, cardsBought: 8,
    spentYunbi: 400, spentPts: 30000, rewardPts: 2400, status: "已激活",
    txHistory: [
      { time: "2026-09-03 10:12", type: "激活绑定",     detail: "终端 #7 激活",              amount: "1 张卡",     status: "完成" },
      { time: "2026-08-30 09:30", type: "购买激活卡",   detail: "50 云币 × 2 张",            amount: "100 云币",   status: "完成" },
      { time: "2026-08-25 22:10", type: "积分兑换云币", detail: "5,000 积分 → 5.00 云币",    amount: "5,000 积分", status: "完成" },
      { time: "2026-08-15 14:00", type: "云币兑现",     detail: "80 云币 → USDT (BSC)",      amount: "76 USDT",    status: "完成" },
    ],
  },
  {
    user: "li****@hotmail.com", joinDate: "2026-08-10", activatedTerminals: 5, cardsBought: 6,
    spentYunbi: 300, spentPts: 20000, rewardPts: 1600, status: "已激活",
    txHistory: [
      { time: "2026-09-02 16:40", type: "激活绑定",     detail: "终端 #5 激活",              amount: "1 张卡",     status: "完成" },
      { time: "2026-08-28 11:15", type: "购买激活卡",   detail: "50 云币 × 1 张",            amount: "50 云币",    status: "完成" },
      { time: "2026-08-20 08:30", type: "积分兑换云币", detail: "5,000 积分 → 5.00 云币",    amount: "5,000 积分", status: "完成" },
    ],
  },
  {
    user: "us****@proton.me", joinDate: "2026-08-15", activatedTerminals: 4, cardsBought: 5,
    spentYunbi: 250, spentPts: 15000, rewardPts: 800, status: "已激活",
    txHistory: [
      { time: "2026-09-01 09:55", type: "激活绑定",     detail: "终端 #4 激活",              amount: "1 张卡",     status: "完成" },
      { time: "2026-08-25 14:20", type: "购买激活卡",   detail: "50 云币 × 2 张",            amount: "100 云币",   status: "完成" },
      { time: "2026-08-18 17:00", type: "积分兑换云币", detail: "3,000 积分 → 3.00 云币",    amount: "3,000 积分", status: "完成" },
    ],
  },
  {
    user: "cy****@gmail.com", joinDate: "2026-08-22", activatedTerminals: 2, cardsBought: 3,
    spentYunbi: 100, spentPts: 5000, rewardPts: 0, status: "已激活",
    txHistory: [
      { time: "2026-09-05 11:30", type: "激活绑定",     detail: "终端 #2 激活",              amount: "1 张卡",     status: "完成" },
      { time: "2026-09-03 10:00", type: "购买激活卡",   detail: "50 云币 × 1 张",            amount: "50 云币",    status: "完成" },
    ],
  },
  {
    user: "jk****@163.com", joinDate: "2026-09-01", activatedTerminals: 0, cardsBought: 2,
    spentYunbi: 0, spentPts: 0, rewardPts: 0, status: "注册中",
    txHistory: [
      { time: "2026-09-02 09:00", type: "购买激活卡",   detail: "50 云币 × 2 张",            amount: "100 云币",   status: "完成" },
    ],
  },
];

function MerchantAccounts({ forceNode, onGoCards }: { forceNode?: boolean; onGoCards?: () => void } = {}) {
  const MY_INVITE_CODE = "INV-SB1920";
  const MY_ACCOUNT_ID  = "SB1920MG";
  const MY_EMAIL       = "sb1920mg@example.com";
  const NODE_THRESHOLD = 50; // terminal threshold to become a node

  const myPCs            = 8;
  const myTerminals      = 8;
  const invitedPCs       = NODE_REFERRALS.reduce((s, r) => s + r.cardsBought, 0);
  const invitedTerminals = NODE_REFERRALS.reduce((s, r) => s + r.activatedTerminals, 0);
  const totalTerminals   = myTerminals + invitedTerminals;
  const isNode           = forceNode || totalTerminals >= NODE_THRESHOLD;

  const [copied, setCopied] = useState<""|"code"|"id">("");
  const [detailUser, setDetailUser] = useState<NodeReferral | null>(null);
  const copy = (text: string, key: "code"|"id") => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  // ── Node card accumulator pool ──
  // Each task completion triggers a lottery. Won points flow into this pool.
  // Pool fills → agent earns a card. Pool capacity = 5000 pts per card.
  const CARD_POOL_MAX = 5000;
  const [cardPool, setCardPool] = useState(2340);

  type EarnedCard = { id: string; earnedAt: string; claimed: boolean };
  const [earnedCards, setEarnedCards] = useState<EarnedCard[]>([
    { id: "NC-20260901-001", earnedAt: "2026-09-01 14:32", claimed: true  },
    { id: "NC-20260815-002", earnedAt: "2026-08-15 09:18", claimed: false },
    { id: "NC-20260802-003", earnedAt: "2026-08-02 22:05", claimed: false },
  ]);
  const claimCard = (id: string) => {
    setEarnedCards(prev => prev.map(c => c.id === id ? { ...c, claimed: true } : c));
    onGoCards?.();
  };

  // ── Tasks under invitees ──
  const [tasks, setTasks] = useState<NodeTask[]>([
    { id: "T001", user: "sb****@gmail.com",    domain: "cloudflare.com",  type: "自配单",   totalHours: 480, doneHours: 480, lotteryResult: "中奖",  lotteryPts: 4800 },
    { id: "T002", user: "tr****@outlook.com",  domain: "amazon.com",      type: "自配单",   totalHours: 500, doneHours: 500, lotteryResult: "暴击",  lotteryPts: 9600 },
    { id: "T003", user: "we****@gmail.com",    domain: "shopify.com",     type: "平台补贴", totalHours: 400, doneHours: 390, lotteryResult: "未抽",  lotteryPts: 0    },
    { id: "T004", user: "sb****@gmail.com",    domain: "fastly.com",      type: "自配单",   totalHours: 300, doneHours: 300, lotteryResult: "未中奖",lotteryPts: 0    },
    { id: "T005", user: "tr****@outlook.com",  domain: "temu.com",        type: "自配单",   totalHours: 500, doneHours: 420, lotteryResult: "未抽",  lotteryPts: 0    },
    { id: "T006", user: "we****@gmail.com",    domain: "akamai.com",      type: "自配单",   totalHours: 480, doneHours: 120, lotteryResult: "未抽",  lotteryPts: 0    },
    { id: "T007", user: "sb****@gmail.com",    domain: "aliexpress.com",  type: "自配单",   totalHours: 500, doneHours: 500, lotteryResult: "中奖",  lotteryPts: 3200 },
    { id: "T008", user: "mk****@yahoo.com",    domain: "cloudflare.com",  type: "自配单",   totalHours: 480, doneHours: 480, lotteryResult: "中奖",  lotteryPts: 4800 },
    { id: "T009", user: "li****@hotmail.com",  domain: "bytedance.com",   type: "自配单",   totalHours: 500, doneHours: 500, lotteryResult: "未中奖",lotteryPts: 0    },
    { id: "T010", user: "us****@proton.me",    domain: "fastly.com",      type: "平台补贴", totalHours: 480, doneHours: 360, lotteryResult: "未抽",  lotteryPts: 0    },
    { id: "T011", user: "mk****@yahoo.com",    domain: "akamai.com",      type: "自配单",   totalHours: 400, doneHours: 280, lotteryResult: "未抽",  lotteryPts: 0    },
    { id: "T012", user: "cy****@gmail.com",    domain: "amazon.com",      type: "自配单",   totalHours: 500, doneHours: 500, lotteryResult: "暴击",  lotteryPts: 9600 },
  ]);

  // Tasks sorted: 100% first, then by completion % desc
  const sortedTasks = [...tasks].sort((a, b) => {
    const pa = a.doneHours / a.totalHours;
    const pb = b.doneHours / b.totalHours;
    return pb - pa;
  });

  // ── Simulate lottery for a completed task ──
  const [spinning, setSpinning] = useState<string|null>(null);
  const doLottery = (taskId: string) => {
    setSpinning(taskId);
    setTimeout(() => {
      setSpinning(null);
      // 15% crit, 35% win, 50% miss (simulated; real rate is backend-controlled)
      const roll = Math.random();
      const result: NodeTask["lotteryResult"] = roll < 0.15 ? "暴击" : roll < 0.50 ? "中奖" : "未中奖";
      const pts = result === "暴击" ? 9600 : result === "中奖" ? 4800 : 0;
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, lotteryResult: result, lotteryPts: pts } : t));
      if (pts > 0) {
        setCardPool(prev => {
          const next = prev + pts;
          if (next >= CARD_POOL_MAX) {
            const count = Math.floor(next / CARD_POOL_MAX);
            const now = new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-");
            setEarnedCards(c => [
              ...Array.from({ length: count }, (_, i) => ({
                id: `NC-${Date.now()}-${i}`,
                earnedAt: now,
                claimed: false,
              })),
              ...c,
            ]);
            return next % CARD_POOL_MAX;
          }
          return next;
        });
      }
    }, 1800);
  };

  const [tab, setTab] = useState<"pool"|"overview"|"tasks"|"members">("pool");

  const lotteryBadge = (r: NodeTask["lotteryResult"], pts: number) => {
    if (r === "暴击") return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 800, color: "#fff", background: "linear-gradient(90deg,#F59E0B,#EF4444)", borderRadius: 6, padding: "3px 9px" }}>
        ⚡ 暴击！+{pts.toLocaleString()}
      </span>
    );
    if (r === "中奖") return (
      <span style={{ fontSize: 11, fontWeight: 700, color: "#16A34A", background: "#F0FDF4", borderRadius: 6, padding: "3px 9px", border: "1px solid #BBF7D0" }}>
        🎉 中奖 +{pts.toLocaleString()}
      </span>
    );
    if (r === "未中奖") return (
      <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", background: "#F3F4F6", borderRadius: 6, padding: "3px 9px" }}>未中奖</span>
    );
    return null;
  };

  const pct = (t: NodeTask) => Math.round((t.doneHours / t.totalHours) * 100);

  /* ── Pre-node view ── */
  if (!isNode) return (
    <div style={{ padding: "20px 24px", fontFamily: F.cn, color: C.text }}>

      {/* Identity card */}
      <div style={{ background: "linear-gradient(140deg,#0f1729,#1e2d55)", borderRadius: 14, padding: "22px 26px", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 8 }}>账户信息</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: F.mono, marginBottom: 4, letterSpacing: 1 }}>{MY_ACCOUNT_ID}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)" }}>{MY_EMAIL}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 8 }}>专属邀请码</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontFamily: F.mono, fontSize: 20, fontWeight: 900, color: C.yellow, letterSpacing: 3 }}>{MY_INVITE_CODE}</div>
            <button onClick={() => copy(MY_INVITE_CODE, "code")}
              style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid rgba(255,215,0,.3)", background: copied === "code" ? "rgba(255,215,0,.2)" : "rgba(255,255,255,.07)", color: copied === "code" ? C.yellow : "rgba(255,255,255,.7)", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: F.cn }}>
              {copied === "code" ? "✓ 已复制" : "复制邀请码"}
            </button>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 6 }}>新用户注册填写此邀请码，双方获得绑定奖励</div>
        </div>
      </div>

      {/* Stats: own + invited */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[
          { label: "当前账户", items: [{ sub: "绑定电脑数", val: myPCs, unit: "台", color: C.blue }, { sub: "激活终端数", val: myTerminals, unit: "个", color: C.green }] },
          { label: "邀请用户合计", items: [{ sub: "绑定电脑数", val: invitedPCs, unit: "台", color: C.orange }, { sub: "激活终端数", val: invitedTerminals, unit: "个", color: "#7C3AED" }] },
        ].map(g => (
          <div key={g.label} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 11, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase" as const, letterSpacing: .5, marginBottom: 12 }}>{g.label}</div>
            <div style={{ display: "flex", gap: 10 }}>
              {g.items.map(s => (
                <div key={s.sub} style={{ flex: 1, background: "#F8F9FB", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{s.sub}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, fontFamily: F.mono, color: s.color }}>
                    {s.val}<span style={{ fontSize: 11, fontWeight: 500, color: C.muted, marginLeft: 3 }}>{s.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pre-node status + progress */}
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 11, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: C.orange, background: "#FFF7ED", borderRadius: 6, padding: "3px 10px", border: "1px solid #FED7AA" }}>未成为服务商节点</span>
          <span style={{ fontSize: 13, color: C.muted }}>还差 <strong style={{ color: C.orange, fontFamily: F.mono }}>{NODE_THRESHOLD - totalTerminals}</strong> 个激活终端</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 6 }}>
          <span>达标进度</span>
          <span style={{ fontFamily: F.mono, fontWeight: 700, color: C.text }}>{totalTerminals} / {NODE_THRESHOLD} 个激活终端</span>
        </div>
        <div style={{ height: 12, borderRadius: 99, background: "#F0F0F0", overflow: "hidden", marginBottom: 12 }}>
          <div style={{ height: "100%", borderRadius: 99, width: `${Math.min(100, (totalTerminals / NODE_THRESHOLD) * 100)}%`, background: `linear-gradient(90deg,#F59E0B,#EF4444)`, transition: "width .5s" }} />
        </div>
        {[
          { label: "自身激活终端",   val: myTerminals,      done: myTerminals >= 1 },
          { label: "邀请用户激活终端", val: invitedTerminals, done: invitedTerminals >= 10 },
          { label: "合计终端数达标", val: `${totalTerminals} / ${NODE_THRESHOLD}`, done: totalTerminals >= NODE_THRESHOLD },
        ].map(r => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: r.done ? "#16A34A" : "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {r.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <span style={{ fontSize: 13, color: r.done ? C.text : C.muted, flex: 1 }}>{r.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: F.mono, color: r.done ? "#16A34A" : C.muted }}>{r.val}</span>
          </div>
        ))}
        <div style={{ marginTop: 12, fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
          累计激活终端数量（自身 + 邀请用户）达到 <strong style={{ color: C.orange }}>{NODE_THRESHOLD}</strong> 个后自动升级为服务商节点。
        </div>
      </div>

      {/* Invite list preview */}
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 11, overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: 14, color: C.text }}>
          已邀请用户 <span style={{ fontSize: 12, fontWeight: 500, color: C.muted, marginLeft: 6 }}>{NODE_REFERRALS.length} 人</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {["账户","绑定电脑","激活终端","加入日期","状态"].map((h, i) => (
                <th key={h} style={{ padding: "9px 14px", textAlign: i >= 1 ? "center" : "left", fontWeight: 600, color: "#6B7280", fontSize: 12, borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NODE_REFERRALS.map((r, i) => (
              <tr key={i} style={{ background: i%2===0?"#fff":"#FAFAFA", borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "9px 14px", fontFamily: F.mono, fontSize: 12, fontWeight: 600 }}>{r.user}</td>
                <td style={{ padding: "9px 14px", textAlign: "center", fontFamily: F.mono, fontWeight: 700 }}>{r.cardsBought} 台</td>
                <td style={{ padding: "9px 14px", textAlign: "center", fontFamily: F.mono, fontWeight: 700, color: r.activatedTerminals > 0 ? C.green : C.muted }}>{r.activatedTerminals} 个</td>
                <td style={{ padding: "9px 14px", textAlign: "center", color: C.muted, fontSize: 12 }}>{r.joinDate}</td>
                <td style={{ padding: "9px 14px", textAlign: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: r.status==="已激活"?"#16A34A":"#D97706", background: r.status==="已激活"?"#F0FDF4":"#FFFBEB", borderRadius: 4, padding: "2px 8px" }}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* ── Node view ── */
  const poolPct = Math.min(100, (cardPool / CARD_POOL_MAX) * 100);
  return (
    <div style={{ padding: "20px 24px", fontFamily: F.cn, color: C.text }}>

      {/* ── Node hero ── */}
      <div style={{ background: "linear-gradient(140deg,#0f1729,#1e2d55)", borderRadius: 14, padding: "20px 26px", marginBottom: 16, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.yellow, background: "rgba(255,215,0,.12)", borderRadius: 6, padding: "3px 12px", border: "1px solid rgba(255,215,0,.2)", letterSpacing: .5 }}>⚡ 服务商节点</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{MY_EMAIL}</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 4 }}>Account</div>
          <div style={{ fontFamily: F.mono, fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>{MY_ACCOUNT_ID}</div>
        </div>
        {/* Invite code */}
        <div style={{ background: "rgba(255,255,255,.05)", borderRadius: 10, padding: "14px 18px", minWidth: 220 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 6 }}>专属邀请码</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: F.mono, fontSize: 18, fontWeight: 900, color: C.yellow, letterSpacing: 3 }}>{MY_INVITE_CODE}</span>
            <button onClick={() => copy(MY_INVITE_CODE, "code")}
              style={{ padding: "4px 12px", border: "1px solid rgba(255,215,0,.3)", borderRadius: 6, background: "rgba(255,215,0,.1)", color: C.yellow, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: F.cn }}>
              {copied === "code" ? "✓ 已复制" : "复制"}
            </button>
          </div>
        </div>
        {/* Pool summary chip */}
        <div style={{ background: "rgba(255,255,255,.05)", borderRadius: 10, padding: "14px 20px", minWidth: 200, cursor: "pointer" }} onClick={() => setTab("pool")}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 8 }}>节点积分池</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 8 }}>
            <span style={{ fontFamily: F.mono, fontSize: 22, fontWeight: 900, color: C.yellow }}>{cardPool.toLocaleString()}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>/ {CARD_POOL_MAX.toLocaleString()} pts</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,.1)", overflow: "hidden", marginBottom: 6 }}>
            <div style={{ height: "100%", borderRadius: 99, width: `${poolPct}%`, background: "linear-gradient(90deg,#FFD700,#FF8C00)", transition: "width .5s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,.3)" }}>
            <span>待领 <strong style={{ color: earnedCards.filter(c=>!c.claimed).length>0?"#FF8C00":"rgba(255,255,255,.3)" }}>{earnedCards.filter(c=>!c.claimed).length} 张卡</strong></span>
            <span style={{ color: "rgba(255,215,0,.5)" }}>查看详情 →</span>
          </div>
        </div>
      </div>

      {/* ── Quick stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "自身激活终端", val: myTerminals, unit: "个", color: C.blue },
          { label: "邀请用户终端", val: invitedTerminals, unit: "个", color: C.green },
          { label: "伞下进行任务", val: tasks.filter(t=>t.doneHours<t.totalHours).length, unit: "个", color: C.orange },
          { label: "伞下完成任务", val: tasks.filter(t=>t.doneHours>=t.totalHours).length, unit: "个", color: "#7C3AED" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 900, fontFamily: F.mono, color: s.color }}>{s.val}<span style={{ fontSize: 11, color: C.muted, marginLeft: 3 }}>{s.unit}</span></div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 11, overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: "#FAFAFA" }}>
          {([
            { key: "pool",     label: "积分池 & 奖励卡" },
            { key: "overview", label: "任务抽奖" },
            { key: "tasks",    label: "任务进度排行" },
            { key: "members",  label: "伞下成员" },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: "12px 22px", border: "none", background: "transparent", fontWeight: tab===t.key?700:500, fontSize: 14, color: tab===t.key?C.text:C.muted, cursor: "pointer", borderBottom: `2px solid ${tab===t.key?C.dark:"transparent"}`, fontFamily: F.cn, marginBottom: -1 }}>
              {t.label}
              {t.key === "pool" && earnedCards.filter(c=>!c.claimed).length > 0 && (
                <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 800, color: "#fff", background: "#EF4444", borderRadius: 99, padding: "1px 6px", verticalAlign: "middle" }}>
                  {earnedCards.filter(c=>!c.claimed).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── 积分池 & 奖励卡 tab ── */}
        {tab === "pool" && (
          <div style={{ padding: "24px" }}>

            {/* Pool progress — large component */}
            <div style={{ background: "linear-gradient(135deg,#0f1729 0%,#1a2744 60%,#1e3a5f 100%)", borderRadius: 14, padding: "28px 32px", marginBottom: 24, position: "relative" as const, overflow: "hidden" }}>
              {/* Decorative ring */}
              <div style={{ position: "absolute" as const, right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", border: "40px solid rgba(255,215,0,.04)", pointerEvents: "none" as const }} />
              <div style={{ position: "absolute" as const, right: 20, bottom: -60, width: 140, height: 140, borderRadius: "50%", border: "28px solid rgba(255,140,0,.06)", pointerEvents: "none" as const }} />

              <div style={{ display: "flex", alignItems: "flex-start", gap: 32 }}>
                {/* Left: pool info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 10 }}>节点积分池</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontFamily: F.mono, fontSize: 44, fontWeight: 900, color: C.yellow, lineHeight: 1, letterSpacing: -1 }}>{cardPool.toLocaleString()}</span>
                    <span style={{ fontFamily: F.mono, fontSize: 18, color: "rgba(255,255,255,.3)", fontWeight: 400 }}>/ {CARD_POOL_MAX.toLocaleString()}</span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginLeft: 4 }}>pts</span>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginBottom: 20 }}>
                    还差 <strong style={{ color: "rgba(255,215,0,.8)", fontFamily: F.mono }}>{(CARD_POOL_MAX - cardPool).toLocaleString()}</strong> pts 可兑换下一张激活卡
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 6 }}>
                      <span>0</span>
                      <span style={{ color: "rgba(255,215,0,.6)", fontWeight: 700 }}>{Math.round(poolPct)}%</span>
                      <span>{CARD_POOL_MAX.toLocaleString()} pts</span>
                    </div>
                    <div style={{ height: 18, borderRadius: 99, background: "rgba(255,255,255,.08)", overflow: "hidden", position: "relative" as const }}>
                      <div style={{ height: "100%", borderRadius: 99, width: `${poolPct}%`, background: "linear-gradient(90deg,#FFD700,#FF8C00)", transition: "width .6s cubic-bezier(.4,0,.2,1)", position: "relative" as const }}>
                        {poolPct > 10 && (
                          <div style={{ position: "absolute" as const, right: 10, top: 0, bottom: 0, display: "flex", alignItems: "center", fontSize: 10, fontWeight: 800, color: "#000", opacity: .6 }}>▶</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", lineHeight: 1.6 }}>
                    伞下用户每完成一单并中奖，等额节点积分自动流入此池。积分池满 {CARD_POOL_MAX.toLocaleString()} pts 后自动生成一张激活卡并推送至奖励列表。
                  </div>
                </div>

                {/* Right: card stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
                  {[
                    { label: "累计获得激活卡", val: earnedCards.length, unit: "张", color: C.yellow },
                    { label: "待领取", val: earnedCards.filter(c=>!c.claimed).length, unit: "张", color: "#FF8C00" },
                    { label: "已领取", val: earnedCards.filter(c=>c.claimed).length,  unit: "张", color: "#4ADE80" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "rgba(255,255,255,.06)", borderRadius: 10, padding: "12px 20px", minWidth: 140, textAlign: "center" as const }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontFamily: F.mono, fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}<span style={{ fontSize: 13, marginLeft: 3, fontWeight: 500, color: "rgba(255,255,255,.4)" }}>{s.unit}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Earned cards list */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 14 }}>奖励激活卡列表</div>
              {earnedCards.length === 0 ? (
                <div style={{ textAlign: "center" as const, padding: "40px 0", color: C.muted, fontSize: 13 }}>暂无奖励激活卡，继续积累节点积分池吧！</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {earnedCards.map((card) => (
                    <div key={card.id} style={{ display: "flex", alignItems: "center", gap: 16, background: card.claimed ? "#FAFAFA" : "#FFFDF0", border: `1px solid ${card.claimed ? C.border : "#FDE68A"}`, borderRadius: 10, padding: "16px 20px" }}>
                      {/* Card icon */}
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: card.claimed ? "#F3F4F6" : "linear-gradient(135deg,#FFD700,#FF8C00)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={card.claimed ? "#9CA3AF" : "#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
                        </svg>
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: F.mono, fontSize: 14, fontWeight: 800, color: card.claimed ? C.muted : C.text, marginBottom: 3, letterSpacing: .5 }}>{card.id}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>节点积分池满额奖励 · 获得时间：{card.earnedAt}</div>
                      </div>
                      {/* Status / claim */}
                      {card.claimed ? (
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", background: "#F0FDF4", borderRadius: 6, padding: "5px 14px", border: "1px solid #BBF7D0", flexShrink: 0 }}>✓ 已领取</span>
                      ) : (
                        <button onClick={() => claimCard(card.id)}
                          style={{ padding: "8px 22px", borderRadius: 8, border: "none", background: "linear-gradient(90deg,#FFD700,#FF8C00)", color: "#000", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: F.cn, flexShrink: 0, boxShadow: "0 2px 8px rgba(255,140,0,.3)" }}>
                          立即领取 →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 任务抽奖 tab ── */}
        {tab === "overview" && (
          <div style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, padding: "8px 12px", background: "#F8F9FB", borderRadius: 7, lineHeight: 1.7 }}>
              伞下每位用户完成单后，系统自动触发一次抽奖。中奖则客户获得该单奖励，您同步获得等额节点积分进入积分池；积分池满 {CARD_POOL_MAX.toLocaleString()} pts 自动掉一张激活卡。抽奖中奖率由系统后台动态配置，千人千面。
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F9FAFB" }}>
                  {["任务ID","用户","平台","类型","进度","抽奖结果","操作"].map((h, i) => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: i>=4?"center":"left", fontWeight: 600, color: "#6B7280", fontSize: 12, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedTasks.map((t, i) => {
                  const p = pct(t);
                  const done = p === 100;
                  const canDraw = done && t.lotteryResult === "未抽";
                  const isSpinning = spinning === t.id;
                  return (
                    <tr key={t.id} style={{ background: i%2===0?"#fff":"#FAFAFA", borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "9px 14px", fontFamily: F.mono, fontSize: 11, color: C.muted }}>{t.id}</td>
                      <td style={{ padding: "9px 14px", fontFamily: F.mono, fontSize: 12, fontWeight: 600 }}>{t.user}</td>
                      <td style={{ padding: "9px 14px", fontSize: 12, color: C.muted }}>{t.domain}</td>
                      <td style={{ padding: "9px 14px" }}>
                        <span style={{ fontSize: 11, background: "#F0F0F5", borderRadius: 4, padding: "2px 7px", fontWeight: 700, color: C.muted }}>{t.type}</span>
                      </td>
                      <td style={{ padding: "9px 14px", textAlign: "center" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: done ? "#16A34A" : C.orange, marginBottom: 3 }}>{p}%</div>
                        <div style={{ height: 4, width: 60, borderRadius: 99, background: "#E5E7EB", overflow: "hidden", margin: "0 auto" }}>
                          <div style={{ height: "100%", borderRadius: 99, width: `${p}%`, background: done ? "#16A34A" : C.orange }} />
                        </div>
                      </td>
                      <td style={{ padding: "9px 14px", textAlign: "center" }}>
                        {isSpinning ? (
                          <span style={{ fontSize: 11, color: C.blue, fontWeight: 700 }}>🎲 抽奖中…</span>
                        ) : (
                          lotteryBadge(t.lotteryResult, t.lotteryPts) ?? <span style={{ fontSize: 11, color: "#D1D5DB" }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "9px 14px", textAlign: "center" }}>
                        {canDraw ? (
                          <button onClick={() => doLottery(t.id)}
                            style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: F.cn }}>
                            立即抽奖
                          </button>
                        ) : done && t.lotteryResult !== "未抽" ? (
                          <span style={{ fontSize: 11, color: C.muted }}>已抽</span>
                        ) : (
                          <span style={{ fontSize: 11, color: "#D1D5DB" }}>任务未完成</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── 任务进度排行 tab ── */}
        {tab === "tasks" && (
          <div style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>按完成进度排列，越接近 100% 越靠前。完成 100% 后系统自动抽奖一次。</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sortedTasks.map((t, i) => {
                const p = pct(t);
                const done = p === 100;
                return (
                  <div key={t.id} style={{ background: done ? "#F0FDF4" : "#fff", border: `1px solid ${done?"#BBF7D0":C.border}`, borderRadius: 10, padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? "#16A34A" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: done ? "#fff" : C.muted, flexShrink: 0 }}>
                        {done ? "✓" : i+1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 2 }}>{t.domain} · {t.type}</div>
                        <div style={{ fontSize: 11, color: C.muted, fontFamily: F.mono }}>{t.user} · {t.id}</div>
                      </div>
                      <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                        <div style={{ fontSize: 18, fontWeight: 900, fontFamily: F.mono, color: done ? "#16A34A" : C.orange }}>{p}%</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{t.doneHours} / {t.totalHours} h</div>
                      </div>
                    </div>
                    <div style={{ height: 8, borderRadius: 99, background: "#E5E7EB", overflow: "hidden", marginBottom: 8 }}>
                      <div style={{ height: "100%", borderRadius: 99, width: `${p}%`, background: done ? "#16A34A" : `linear-gradient(90deg,${C.yellow},${C.orange})`, transition: "width .4s" }} />
                    </div>
                    {done && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {lotteryBadge(t.lotteryResult, t.lotteryPts) ?? (
                          spinning === t.id
                            ? <span style={{ fontSize: 12, color: C.blue, fontWeight: 700 }}>🎲 系统抽奖中…</span>
                            : <button onClick={() => doLottery(t.id)}
                                style={{ padding: "5px 14px", border: "none", borderRadius: 6, background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: F.cn }}>
                                立即抽奖
                              </button>
                        )}
                        {t.lotteryPts > 0 && (
                          <span style={{ fontSize: 11, color: "#16A34A" }}>→ 进入节点积分池</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 伞下成员 tab ── */}
        {tab === "members" && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["账户","绑定电脑","激活终端","加入日期","状态","操作"].map((h, i) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: i>=1?"center":"left", fontWeight: 600, color: "#6B7280", fontSize: 12, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NODE_REFERRALS.map((r, i) => (
                <tr key={i} style={{ background: i%2===0?"#fff":"#FAFAFA", borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 16px", fontFamily: F.mono, fontSize: 12, fontWeight: 600 }}>{r.user}</td>
                  <td style={{ padding: "10px 16px", textAlign: "center", fontFamily: F.mono, fontWeight: 700 }}>{r.cardsBought} 台</td>
                  <td style={{ padding: "10px 16px", textAlign: "center", fontFamily: F.mono, fontWeight: 700, color: r.activatedTerminals>0?C.green:C.muted }}>{r.activatedTerminals} 个</td>
                  <td style={{ padding: "10px 16px", textAlign: "center", color: C.muted, fontSize: 12 }}>{r.joinDate}</td>
                  <td style={{ padding: "10px 16px", textAlign: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: r.status==="已激活"?"#16A34A":"#D97706", background: r.status==="已激活"?"#F0FDF4":"#FFFBEB", borderRadius: 4, padding: "2px 8px" }}>{r.status}</span>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "center" }}>
                    <button onClick={() => setDetailUser(r)}
                      style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: F.cn }}>
                      详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Member detail modal ── */}
      {detailUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setDetailUser(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 640, maxHeight: "80vh", borderRadius: 12, background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,.2)", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: F.cn }}>
            <div style={{ background: C.dark, padding: "14px 20px", display: "flex", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>成员详情</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{detailUser.user} · 加入于 {detailUser.joinDate}</div>
              </div>
              <button onClick={() => setDetailUser(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.4)", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", background: "#F9FAFB", borderBottom: `1px solid ${C.border}` }}>
              {[
                { label: "绑定电脑", value: `${detailUser.cardsBought} 台` },
                { label: "激活终端", value: `${detailUser.activatedTerminals} 个` },
                { label: "花费云币", value: detailUser.spentYunbi.toFixed(2) },
                { label: "花费积分", value: detailUser.spentPts.toLocaleString() },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, padding: "10px 0", textAlign: "center" as const, borderRight: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, color: C.muted }}>{s.label}</div>
                  <div style={{ fontWeight: 800, fontSize: 15, fontFamily: F.mono, color: C.text }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ overflowY: "auto" as const, flex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead style={{ position: "sticky" as const, top: 0 }}>
                  <tr style={{ background: "#F9FAFB" }}>
                    {["时间","类型","详情","数量/金额","状态"].map((h, i) => (
                      <th key={h} style={{ padding: "9px 14px", textAlign: i>=3?"center":"left", fontWeight: 600, color: "#6B7280", fontSize: 12, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detailUser.txHistory.map((tx, i) => {
                    const sc = tx.status==="完成"?{color:"#16A34A",bg:"#F0FDF4"}:tx.status==="审核中"?{color:"#D97706",bg:"#FFFBEB"}:{color:"#6B7280",bg:"#F3F4F6"};
                    return (
                      <tr key={i} style={{ background: i%2===0?"#fff":"#FAFAFA", borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "9px 14px", fontFamily: F.mono, fontSize: 11, color: C.muted, whiteSpace: "nowrap" as const }}>{tx.time}</td>
                        <td style={{ padding: "9px 14px" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: C.text, background: "#F3F4F6", borderRadius: 4, padding: "2px 7px" }}>{tx.type}</span>
                        </td>
                        <td style={{ padding: "9px 14px", fontSize: 12, color: C.muted }}>{tx.detail}</td>
                        <td style={{ padding: "9px 14px", textAlign: "center" as const, fontFamily: F.mono, fontWeight: 700, fontSize: 12 }}>{tx.amount}</td>
                        <td style={{ padding: "9px 14px", textAlign: "center" as const }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: sc.color, background: sc.bg, borderRadius: 4, padding: "2px 7px" }}>{tx.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOTTERY PAGE
══════════════════════════════════════════════════════════════ */

function MerchantLottery() {
  const POOL_TARGET = 50000;
  const [pool, setPool] = useState(34820);
  const [myEntry, setMyEntry] = useState(0);
  const [inputPts, setInputPts] = useState("");
  const [pts, setPts] = useState(218120);
  const [entryStep, setEntryStep] = useState<"idle"|"loading"|"ok">("idle");
  const [drawn, setDrawn] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const pct = Math.min(100, (pool / POOL_TARGET) * 100);

  const doEnter = () => {
    const n = Number(inputPts);
    if (!n || n < 1 || n > pts) return;
    setEntryStep("loading");
    setTimeout(() => {
      setPts(p => p - n);
      setPool(p => {
        const next = p + n;
        if (next >= POOL_TARGET && !drawn) {
          setTimeout(() => { setSpinning(true); setTimeout(() => { setSpinning(false); setDrawn(true); }, 3000); }, 800);
        }
        return next;
      });
      setMyEntry(e => e + n);
      setEntryStep("ok");
      setTimeout(() => { setEntryStep("idle"); setInputPts(""); }, 1800);
    }, 1200);
  };

  const RECENT = [
    { user: "us****@gmail.com", pts: 12000, time: "13分钟前" },
    { user: "to****@yahoo.com", pts: 5000,  time: "27分钟前" },
    { user: "sa****@outlook.com", pts: 8800, time: "41分钟前" },
    { user: "li****@gmail.com", pts: 3500,  time: "1小时前" },
    { user: "ch****@163.com", pts: 6200,    time: "2小时前" },
  ];

  return (
    <div style={{ padding: "20px", fontFamily: F.cn, fontSize: 14, color: "#111827", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1C1C2E 0%,#252540 100%)", borderRadius: 12, padding: "24px 28px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -20, width: 160, height: 160, background: "rgba(255,215,0,.06)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -40, left: -20, width: 120, height: 120, background: "rgba(255,215,0,.04)", borderRadius: "50%" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, position: "relative" }}>
          {Ic.gift}
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: "#fff" }}>积分大抽奖</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginTop: 2 }}>任意积分参与 · 满 50,000 积分自动开奖 · 1 名幸运用户获得赠送激活卡</div>
          </div>
        </div>
        {/* Pool progress */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>当前奖池积分</span>
            <span style={{ fontSize: 11, color: "#FFD700", fontFamily: F.mono, fontWeight: 700 }}>{pool.toLocaleString()} / {POOL_TARGET.toLocaleString()}</span>
          </div>
          <div style={{ height: 10, background: "rgba(255,255,255,.1)", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#FFD700,#FF8C00)", borderRadius: 6, transition: "width .6s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>已完成 {pct.toFixed(1)}%</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>还差 {Math.max(0, POOL_TARGET - pool).toLocaleString()} 积分开奖</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        {/* Entry panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "18px 20px" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 14 }}>参与抽奖</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, marginBottom: 12 }}>
              {[500, 1000, 2000, 5000, 10000, 20000].map(q => (
                <button key={q} onClick={() => setInputPts(String(q))} style={{ padding: "8px 0", borderRadius: 7, border: `1.5px solid ${inputPts === String(q) ? "#D97706" : "#E5E7EB"}`, background: inputPts === String(q) ? "#FFFBEB" : "#fff", fontWeight: 700, fontSize: 12, color: inputPts === String(q) ? "#D97706" : "#374151", cursor: "pointer" }}>
                  {q.toLocaleString()}
                </button>
              ))}
            </div>
            <input value={inputPts} onChange={e => setInputPts(e.target.value)} type="number" placeholder="或自定义积分数量"
              style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #D1D5DB", borderRadius: 7, fontSize: 13, outline: "none", fontFamily: F.mono, boxSizing: "border-box", marginBottom: 12 }}
              onFocus={e => (e.target.style.borderColor = "#D97706")} onBlur={e => (e.target.style.borderColor = "#D1D5DB")}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, fontSize: 11, color: "#6B7280" }}>
              <span>我的积分余额：<strong style={{ color: "#D97706", fontFamily: F.mono }}>{pts.toLocaleString()}</strong></span>
              <span>我的投入：<strong style={{ color: "#111827", fontFamily: F.mono }}>{myEntry.toLocaleString()}</strong></span>
            </div>
            {inputPts && (
              <div style={{ marginBottom: 12, padding: "8px 12px", background: "#F3F4F6", borderRadius: 7, fontSize: 13, color: "#374151" }}>
                中奖概率约 <strong>{myEntry > 0 ? (((myEntry + Number(inputPts)) / POOL_TARGET * 100).toFixed(1)) : ((Number(inputPts) / POOL_TARGET * 100).toFixed(1))}%</strong>（基于当前奖池）
              </div>
            )}
            <button onClick={doEnter} disabled={!inputPts || Number(inputPts) < 1 || Number(inputPts) > pts || entryStep !== "idle"}
              style={{ width: "100%", padding: "11px", borderRadius: 7, border: "none", background: entryStep === "ok" ? "#16A34A" : (inputPts && Number(inputPts) <= pts) ? "#D97706" : "#D1D5DB", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>
              {entryStep === "idle" ? "投入积分参与" : entryStep === "loading" ? "投入中..." : "✓ 投入成功"}
            </button>
          </div>

          {/* Rules */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#111827", marginBottom: 10 }}>活动规则</div>
            {[
              "每轮奖池积分上限为 50,000 积分，达到后立即自动开奖",
              "每位用户可多次投入，投入比例越大中奖概率越高",
              "奖品为一张激活卡（价值 5,000 积分 / 50 云币），直接发放至中奖账户",
              "开奖后自动进入下一轮，不中奖的积分不退还",
              "平台保留活动最终解释权",
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 11, color: "#6B7280", lineHeight: 1.6 }}>
                <span style={{ color: "#D97706", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: recent entries + draw result */}
        <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 12 }}>
          {drawn && (
            <div style={{ background: "linear-gradient(135deg,#1C1C2E,#252540)", border: "2px solid #FFD700", borderRadius: 10, padding: "18px", textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#FFD700", marginBottom: 4 }}>开奖完毕！</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)" }}>本轮中奖用户</div>
              <div style={{ fontFamily: F.mono, fontSize: 13, color: "#fff", fontWeight: 700, margin: "8px 0" }}>li****@gmail.com</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>激活卡已发放至账户</div>
            </div>
          )}
          {spinning && !drawn && (
            <div style={{ background: "#1C1C2E", borderRadius: 10, padding: "24px", textAlign: "center", border: "2px solid #FFD700" }}>
              <div style={{ fontSize: 11, color: "#FFD700", fontWeight: 700, marginBottom: 12 }}>奖池已满 · 正在抽奖...</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 8, height: 8, background: "#FFD700", borderRadius: "50%", animation: `settle-scroll ${.6 + i * .2}s ease-in-out infinite alternate` }} />
                ))}
              </div>
            </div>
          )}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden", flex: 1 }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid #E5E7EB", fontWeight: 700, fontSize: 12, color: "#111827" }}>最近参与记录</div>
            {RECENT.map((r, i) => (
              <div key={i} style={{ padding: "10px 14px", borderBottom: i < RECENT.length - 1 ? "1px solid #F3F4F6" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>{r.user}</div>
                  <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 1 }}>{r.time}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#D97706", fontFamily: F.mono }}>+{r.pts.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUPPORT CHAT WIDGET
══════════════════════════════════════════════════════════════ */

function SupportChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { from: "support", text: "您好！欢迎联系 StarMatrix 客服，请问有什么可以帮您？", time: "刚刚" },
  ]);
  const [input, setInput] = useState("");
  const [ticketId] = useState("TK-" + Math.random().toString(36).slice(2, 8).toUpperCase());
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = () => {
    const t = input.trim();
    if (!t) return;
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMsgs(m => [...m, { from: "user", text: t, time: timeStr }]);
    setInput("");
    setTimeout(() => {
      setMsgs(m => [...m, { from: "support", text: "感谢您的反馈，客服人员将在工作时间内尽快回复您。工单编号：" + ticketId, time: timeStr }]);
    }, 900);
  };

  useEffect(() => {
    if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [msgs, open]);

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9000, fontFamily: F.cn }}>
      {open && (
        <div style={{ position: "absolute", bottom: 60, right: 0, width: 320, background: "#fff", borderRadius: 12, boxShadow: "0 8px 40px rgba(0,0,0,.18)", display: "flex", flexDirection: "column", overflow: "hidden", animation: "pop-in .2s ease" }}>
          <div style={{ background: "#1C1C2E", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, background: "#43A047", borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#fff", fontSize: 13 }}>在线客服</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginTop: 1 }}>工单 {ticketId}</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.4)", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>✕</button>
          </div>
          <div style={{ flex: 1, maxHeight: 300, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 10, background: "#F9FAFB" }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: m.from === "user" ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
                {m.from === "support" && (
                  <div style={{ width: 28, height: 28, background: "#1C1C2E", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  </div>
                )}
                <div style={{ maxWidth: "75%" }}>
                  <div style={{ padding: "8px 12px", borderRadius: m.from === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px", background: m.from === "user" ? "#1C1C2E" : "#fff", color: m.from === "user" ? "#fff" : "#111827", fontSize: 12, lineHeight: 1.6, boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
                    {m.text}
                  </div>
                  <div style={{ fontSize: 9, color: "#9CA3AF", marginTop: 3, textAlign: m.from === "user" ? "right" : "left" }}>{m.time}</div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: "10px 12px", borderTop: "1px solid #E5E7EB", display: "flex", gap: 8, background: "#fff" }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="输入消息..." style={{ flex: 1, padding: "8px 11px", border: "1px solid #E5E7EB", borderRadius: 7, fontSize: 12, outline: "none" }} />
            <button onClick={send} style={{ width: 36, height: 36, background: "#1C1C2E", border: "none", borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} style={{ width: 48, height: 48, background: "#1C1C2E", border: "2px solid #FFD700", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,.25)", position: "relative" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        {!open && <div style={{ position: "absolute", top: -3, right: -3, width: 10, height: 10, background: "#43A047", borderRadius: "50%", border: "2px solid #fff" }} />}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MERCHANT SHELL
══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   MERCHANT CARDS — 激活卡商城 + 我的激活卡
══════════════════════════════════════════════════════════════ */

type CardProduct = { id: string; name: string; duration: string; price: number; yunbi: number; pts: number; badge?: string; highlight?: boolean };
type PayMethod = "points" | "yunbi" | "crypto" | "bank" | "alipay" | "wechat";
type CryptoChain = "BSC" | "TRON";
type CheckoutStep = "methods" | "confirm" | "crypto_chain" | "crypto_pay" | "bank_form" | "qr_pay" | "success";

const CARD_PRODUCTS: CardProduct[] = [
  { id: "annual", name: "年度激活卡", duration: "1 年", price: 500, yunbi: 500, pts: 5000, badge: "热销", highlight: true },
];

const CRYPTO_ADDRESSES: Record<CryptoChain, string> = {
  BSC:  "0x4B3a9f7C2E1d8A6F0e5B2c9D3a7E4f1b8C5d2A0",
  TRON: "TRX9mKp2QwXvNzE4bYcJsA8fLdU3hG7oV",
};

const MY_CARDS_INIT = [
  { id: "CRD-2026-001", product: "年度激活卡", key: "SM-A1B2-C3D4-E5F6", purchasedAt: "2026-06-01", expires: "2027-06-01", status: "正在使用", usedSlot: "槽位 1", boundUser: "sb1920mg" },
  { id: "CRD-2026-002", product: "年度激活卡", key: "SM-G7H8-I9J0-K1L2", purchasedAt: "2026-07-15", expires: "2027-07-15", status: "已使用",   usedSlot: "槽位 2", boundUser: "sb3851fg" },
  { id: "CRD-2026-003", product: "年度激活卡", key: "SM-M3N4-O5P6-Q7R8", purchasedAt: "2026-09-01", expires: "—",          status: "未使用",   usedSlot: null,     boundUser: undefined },
  { id: "CRD-2026-004", product: "年度激活卡", key: "SM-S9T0-U1V2-W3X4", purchasedAt: "2026-09-05", expires: "—",          status: "未使用",   usedSlot: null,     boundUser: undefined },
];

/* SVG icons for cards page */
const IcCard = {
  key:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="15" r="3"/><path d="M8 12V5l9-3v7"/><circle cx="17" cy="12" r="3"/></svg>,
  check:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  copy:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  back:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  alipay: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 10h20"/><path d="M6 15h4M14 15h4"/></svg>,
  wechat: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8.5 13.5a5.5 5.5 0 100-9 5.5 5.5 0 000 9z"/><path d="M15.5 10.5a5.5 5.5 0 110 8 5.5 5.5 0 010-8z"/></svg>,
  bank:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  crypto: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  cloud:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>,
  star:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  timer:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>,
  success:<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>,
  soon:   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
};

function MerchantCards() {
  const [view, setView] = useState<"shop" | "mycards">("shop");
  const [selectedProduct, setSelectedProduct] = useState<CardProduct | null>(null);
  const [payMethod, setPayMethod] = useState<PayMethod>("alipay");
  const [step, setStep] = useState<CheckoutStep>("methods");
  const [cryptoChain, setCryptoChain] = useState<CryptoChain>("BSC");
  const [countdown, setCountdown] = useState(600);
  const [bankCard, setBankCard] = useState({ num: "", name: "", exp: "", cvv: "" });
  const [myCards, setMyCards] = useState(MY_CARDS_INIT);
  const [useCardId, setUseCardId] = useState<string | null>(null);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedAmt, setCopiedAmt] = useState(false);
  const [cardFilter, setCardFilter] = useState<"all"|"unused"|"active"|"used">("all");
  const [cardSearch, setCardSearch] = useState("");
  const [cardSort, setCardSort]     = useState<"default"|"purchasedAt"|"expires">("default");
  const [cardPage, setCardPage]     = useState(1);
  const [viewCard, setViewCard]     = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pts,   setPts]   = useState(218120);
  const [yunbi, setYunbi] = useState(128.40);

  /* ── lottery cards ── */
  const [lotteryCards, setLotteryCards] = useState(2);
  type LotteryRecord = { date: string; result: string; reward: string };
  const [lotteryHistory, setLotteryHistory] = useState<LotteryRecord[]>([
    { date: "2026-08-29", result: "中奖！", reward: "激活卡 × 1" },
    { date: "2026-08-27", result: "未中奖", reward: "—" },
  ]);
  const [lotterySpinning, setLotterySpinning] = useState(false);
  const [lotteryResult,   setLotteryResult]   = useState<null|"win"|"lose">(null);
  const [lotteryTab, setLotteryTab] = useState<"main"|"cards"|"exchange"|"lottery_history">("main");
  const [lotteryModal, setLotteryModal] = useState(false);
  const [slotPhase, setSlotPhase] = useState<"idle"|"spinning"|"result">("idle");
  const [historyTab, setHistoryTab] = useState<"exchange"|"lottery"|"treasure">("exchange");
  const [cardPageTab, setCardPageTab] = useState<"get"|"mycards"|"history">("get");
  /* ── history list filter/page ── */
  const [hExchSearch, setHExchSearch] = useState(""); const [hExchFrom, setHExchFrom] = useState(""); const [hExchTo, setHExchTo] = useState(""); const [hExchPage, setHExchPage] = useState(1);
  const [hLottSearch, setHLottSearch] = useState(""); const [hLottFrom, setHLottFrom] = useState(""); const [hLottTo, setHLottTo] = useState(""); const [hLottPage, setHLottPage] = useState(1);
  const [hTresSearch, setHTresSearch] = useState(""); const [hTresFrom, setHTresFrom] = useState(""); const [hTresTo, setHTresTo] = useState(""); const [hTresPage, setHTresPage] = useState(1);
  const [slotPrize, setSlotPrize] = useState<typeof WHEEL_PRIZES[number] | null>(null);
  const [wheelAngle, setWheelAngle] = useState(0);

  const WHEEL_PRIZES = [
    { label: "激活卡 ×1",    pts: 0,     isCard: true,  prob: 0.05, color: "#FFD700", dark: "#0a0f1a" },
    { label: "积分 ×10000",  pts: 10000, isCard: false, prob: 0.08, color: "#3B82F6", dark: "#fff"    },
    { label: "积分 ×5000",   pts: 5000,  isCard: false, prob: 0.12, color: "#8B5CF6", dark: "#fff"    },
    { label: "积分 ×2000",   pts: 2000,  isCard: false, prob: 0.20, color: "#10B981", dark: "#fff"    },
    { label: "积分 ×1000",   pts: 1000,  isCard: false, prob: 0.25, color: "#F59E0B", dark: "#0a0f1a" },
    { label: "积分 ×500",    pts: 500,   isCard: false, prob: 0.30, color: "#EF4444", dark: "#fff"    },
  ];
  // cumulative angles for each segment
  const wheelAngles = (() => {
    let cum = 0; return WHEEL_PRIZES.map(p => { const s = cum; cum += p.prob * 360; return { start: s, end: cum, mid: s + p.prob * 180 }; });
  })();

  /* ── 一元夺宝 treasure hunt ── */
  type TreasureEntry = { user: string; pts: number };
  type TreasureRecord = { date: string; action: string; pts: number; result: string };
  const TREASURE_TARGET = 50000;
  const [treasurePool, setTreasurePool] = useState(32480);
  const [treasureInput, setTreasureInput] = useState("");
  const [treasureYunbiInput, setTreasureYunbiInput] = useState("");
  const [treasureHistory, setTreasureHistory] = useState<TreasureRecord[]>([
    { date: "2026-09-10", action: "投入积分", pts: 5000, result: "池子 65%" },
    { date: "2026-09-08", action: "投入积分", pts: 8000, result: "池子 49%" },
  ]);
  const [treasureEntries, setTreasureEntries] = useState<TreasureEntry[]>([
    { user: "sb****@gmail.com", pts: 8000 },
    { user: "tr****@outlook.com", pts: 12000 },
    { user: "wa****@163.com", pts: 6000 },
    { user: "mn****@hotmail.com", pts: 4000 },
    { user: "li****@gmail.com", pts: 2480 },
  ]);

  /* ── exchange history ── */
  type ExchRecord = { date: string; method: string; cost: string; reward: string };
  const [exchHistory, setExchHistory] = useState<ExchRecord[]>([
    { date: "2026-08-28", method: "积分兑换", cost: "50,000 积分", reward: "激活卡 × 1 + 抽奖卡 × 1" },
    { date: "2026-08-20", method: "云币购买", cost: "500 云币",   reward: "激活卡 × 1（免手续费）" },
  ]);

  /* ── OTP flow for pts/yunbi purchase ── */
  type AcqMethod = "pts" | "yunbi";
  const [acqModal,  setAcqModal]  = useState<AcqMethod | null>(null);
  const [acqPtsQty, setAcqPtsQty] = useState("1");
  const [acqOtp,    setAcqOtp]    = useState("");
  const [acqOtpSent,setAcqOtpSent]= useState(false);
  const [acqOtpTimer,setAcqOtpTimer]=useState(0);
  const [acqStep,   setAcqStep]   = useState<"form"|"verify"|"ok">("form");
  const [acqVerifyMethod, setAcqVerifyMethod] = useState<"otp"|"pwd">("otp");
  const [acqPwd, setAcqPwd] = useState("");
  const acqTimerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const CARD_PTS   = 50000;
  const CARD_YUNBI = 500;
  const acqQty = Math.max(1, parseInt(acqPtsQty) || 1);
  const acqMaxPts   = Math.floor(pts / CARD_PTS);
  const acqMaxYunbi = Math.floor(yunbi / CARD_YUNBI);
  const canAcqPts   = acqQty >= 1 && acqQty <= acqMaxPts;
  const canAcqYunbi = acqMaxYunbi >= 1;

  const sendAcqOtp = () => {
    setAcqOtpSent(true);
    setAcqOtpTimer(60);
    if (acqTimerRef.current) clearInterval(acqTimerRef.current);
    acqTimerRef.current = setInterval(() => {
      setAcqOtpTimer(t => { if (t <= 1) { clearInterval(acqTimerRef.current!); return 0; } return t - 1; });
    }, 1000);
  };

  const doAcqConfirm = () => {
    if (acqStep === "form") { setAcqStep("verify"); return; }
    if (acqStep === "verify") {
      if (acqVerifyMethod === "otp" && acqOtp.length < 6) return;
      if (acqVerifyMethod === "pwd" && !acqPwd.trim()) return;
      const qty = acqModal === "pts" ? acqQty : 1;
      const today = new Date().toISOString().slice(0, 10);
      const newCards = Array.from({ length: qty }, (_, i) => ({
        id: `CRD-${Date.now()}-${String(i+1).padStart(3,"0")}`,
        product: "年度激活卡", key: `SM-${Math.random().toString(36).slice(2,6).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`,
        purchasedAt: today, expires: "—", status: "未使用" as const, usedSlot: null, boundUser: undefined,
      }));
      setMyCards(prev => [...newCards, ...prev]);
      if (acqModal === "pts") {
        setLotteryCards(lc => lc + qty);
        setPts(p => p - qty * CARD_PTS);
        setExchHistory(h => [{ date: today, method: "积分兑换", cost: `${(qty * CARD_PTS).toLocaleString()} 积分`, reward: `激活卡 × ${qty} + 抽奖卡 × ${qty}` }, ...h]);
      } else {
        setYunbi(y => parseFloat((y - CARD_YUNBI).toFixed(4)));
        setExchHistory(h => [{ date: today, method: "云币购买", cost: "500 云币", reward: "激活卡 × 1（免手续费）" }, ...h]);
      }
      setAcqStep("ok");
    }
  };

  const closeAcqModal = () => {
    if (acqTimerRef.current) clearInterval(acqTimerRef.current);
    setAcqModal(null); setAcqStep("form"); setAcqOtp(""); setAcqOtpSent(false); setAcqOtpTimer(0); setAcqPtsQty("1"); setAcqPwd(""); setAcqVerifyMethod("otp");
  };

  /* ── lottery spin ── */
  const LOTTERY_PRIZES = [
    { label: "激活卡 × 1", prob: 0.08, win: true, emoji: "🃏" },
    { label: "积分 × 5000", prob: 0.15, win: true, emoji: "⭐" },
    { label: "云币 × 50",   prob: 0.12, win: true, emoji: "💎" },
    { label: "积分 × 1000", prob: 0.20, win: true, emoji: "✨" },
    { label: "未中奖",      prob: 0.45, win: false, emoji: "💨" },
  ];
  const SLOT_LABELS = LOTTERY_PRIZES.map(p => p.emoji + " " + p.label);

  const openLotteryModal = () => {
    if (lotteryCards < 1) return;
    setLotteryModal(true);
    setSlotPhase("idle");
    setLotteryResult(null);
  };

  const doSpin = () => {
    if (lotteryCards < 1 || slotPhase === "spinning") return;
    setLotteryCards(lc => lc - 1);
    setSlotPhase("spinning");
    setSlotPrize(null);
    // pick winner
    const r = Math.random();
    let cum = 0; let prizeIdx = WHEEL_PRIZES.length - 1;
    for (let i = 0; i < WHEEL_PRIZES.length; i++) { cum += WHEEL_PRIZES[i].prob; if (r < cum) { prizeIdx = i; break; } }
    const prize = WHEEL_PRIZES[prizeIdx];
    const targetMid = wheelAngles[prizeIdx].mid;
    // spin 6 full rotations + land on prize (pointer at top = 0°, so subtract mid from 360)
    const landAngle = (360 - targetMid + 360 * 6);
    setWheelAngle(prev => prev + landAngle);
    setTimeout(() => {
      const today = new Date().toISOString().slice(0, 10);
      if (prize.isCard) {
        setMyCards(prev => [{ id: `CRD-L${Date.now()}`, product: "年度激活卡", key: `SM-${Math.random().toString(36).slice(2,6).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`, purchasedAt: today, expires: "—", status: "未使用" as const, usedSlot: null, boundUser: undefined }, ...prev]);
      } else {
        setPts(p => p + prize.pts);
      }
      setLotteryHistory(h => [{ date: today, result: "中奖", reward: prize.label }, ...h]);
      setSlotPrize(prize);
      setSlotPhase("result");
      setLotteryResult("win");
      setLotterySpinning(false);
    }, 4200);
  };

  const cryptoAmountRef = useRef<string>("");
  if (selectedProduct && !cryptoAmountRef.current) cryptoAmountRef.current = (selectedProduct.price + parseFloat((0.00001 + Math.floor(Math.random() * 89999) / 1e9).toFixed(5))).toFixed(5);

  useEffect(() => {
    if (step === "crypto_pay") {
      setCountdown(600);
      timerRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  const openCheckout = (p: CardProduct) => {
    setSelectedProduct(p);
    cryptoAmountRef.current = (p.price + parseFloat("0.0" + String(10000 + Math.floor(Math.random() * 89999)))).toFixed(5);
    setStep("methods");
    setPayMethod("alipay");
  };

  const goNext = () => {
    if (payMethod === "crypto") { setStep("crypto_chain"); return; }
    if (payMethod === "bank") { setStep("bank_form"); return; }
    if (payMethod === "alipay" || payMethod === "wechat") { setStep("qr_pay"); return; }
    setStep("confirm");
  };

  const doConfirmPay = () => {
    setMyCards(prev => [{
      id: `CRD-2026-${String(prev.length + 1).padStart(3, "0")}`,
      product: selectedProduct!.name,
      key: `SM-${Math.random().toString(36).slice(2,6).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`,
      purchasedAt: new Date().toISOString().slice(0, 10),
      expires: "—", status: "未使用", usedSlot: null, boundUser: undefined,
    }, ...prev]);
    setStep("success");
  };

  const mmss = `${String(Math.floor(countdown / 60)).padStart(2, "0")}:${String(countdown % 60).padStart(2, "0")}`;

  const PAY_METHODS: { key: PayMethod; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
    { key: "alipay",  label: "支付宝",   icon: IcCard.alipay, desc: "扫码完成支付",               color: "#1677FF" },
    { key: "wechat",  label: "微信支付", icon: IcCard.wechat, desc: "微信扫码支付",               color: "#07C160" },
    { key: "bank",    label: "银行卡",   icon: IcCard.bank,   desc: "输入卡号付款",               color: C.blue },
    { key: "crypto",  label: "加密货币", icon: IcCard.crypto, desc: "USDT · BSC / TRON",         color: "#F59E0B" },
    { key: "yunbi",   label: "云币支付", icon: IcCard.cloud,  desc: `余额 ${yunbi.toFixed(2)}`,   color: "#7C3AED" },
    { key: "points",  label: "积分支付", icon: IcCard.star,   desc: `余额 ${pts.toLocaleString()}`, color: C.orange },
  ];

  const canPay = payMethod === "points" ? pts >= (selectedProduct?.pts ?? 0)
    : payMethod === "yunbi" ? yunbi >= (selectedProduct?.yunbi ?? 0) : true;

  /* ── QR code SVG ── */
  const QRCode = ({ addr, size = 148 }: { addr: string; size?: number }) => (
    <div style={{ width: size, height: size, background: "#fff", borderRadius: 10, padding: 10, boxShadow: "0 1px 8px rgba(0,0,0,.10)", flexShrink: 0 }}>
      <svg width={size - 20} height={size - 20} viewBox="0 0 21 21" style={{ display: "block" }}>
        {Array.from({ length: 21 }, (_, r) => Array.from({ length: 21 }, (_, c) => {
          const fill = (addr.charCodeAt((r * 21 + c) % addr.length) + r * 3 + c * 7) % 4 === 0;
          const corner = (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);
          return (fill || corner) ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#111"/> : null;
        }))}
      </svg>
    </div>
  );

  /* ── shared nav row ── */
  const NavRow = ({ onBack, title }: { onBack: () => void; title: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontSize: 13, color: C.text, fontFamily: F.cn, boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}>
        {IcCard.back} 返回
      </button>
      <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{title}</span>
    </div>
  );

  /* ── Back / Next buttons ── */
  const FootBtns = ({ onBack, onNext, nextLabel, nextDisabled = false, nextColor = C.dark, nextTextColor = C.yellow }: { onBack: () => void; onNext: () => void; nextLabel: string; nextDisabled?: boolean; nextColor?: string; nextTextColor?: string }) => (
    <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
      <button onClick={onBack} style={{ flex: 1, padding: "11px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>返回</button>
      <button onClick={onNext} disabled={nextDisabled} style={{ flex: 2, padding: "11px", borderRadius: 8, border: "none", background: nextDisabled ? "#E5E7EB" : nextColor, color: nextDisabled ? C.muted : nextTextColor, fontWeight: 700, fontSize: 14, cursor: nextDisabled ? "not-allowed" : "pointer", fontFamily: F.cn }}>
        {nextLabel}
      </button>
    </div>
  );

  if (selectedProduct) {
    const p = selectedProduct;
    const close = () => { setSelectedProduct(null); cryptoAmountRef.current = ""; setStep("methods"); };
    const methodLabel = PAY_METHODS.find(m => m.key === payMethod)?.label ?? "";
    const amountDisplay = payMethod === "points" ? `${p.pts.toLocaleString()} 积分`
      : payMethod === "yunbi" ? `${p.yunbi} 云币` : `$${p.price} USD`;

    return (
      <div style={{ minHeight: "100%", background: "#F7F8FA", fontFamily: F.cn }}>
        {/* Checkout top nav */}
        <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "13px 24px", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={close} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.muted, fontFamily: F.cn, padding: 0 }}>
            {IcCard.back}<span>返回商城</span>
          </button>
          <span style={{ color: "#DDD" }}>·</span>
          <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>结算</span>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "flex", gap: 20, padding: "24px", maxWidth: 860, margin: "0 auto", alignItems: "flex-start" }}>

          {/* Left: sticky order summary */}
          <div style={{ width: 252, flexShrink: 0 }}>
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
              <div style={{ background: "linear-gradient(140deg,#0d1426,#1c2e5a)", padding: "22px 20px" }}>
                <div style={{ width: 40, height: 40, borderRadius: 9, background: "rgba(255,215,0,.1)", border: "1px solid rgba(255,215,0,.2)", display: "flex", alignItems: "center", justifyContent: "center", color: C.yellow, marginBottom: 14 }}>
                  {IcCard.key}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.38)", fontFamily: F.en }}>StarMatrix Node Network</div>
              </div>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: F.en, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 6 }}>Order Total</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 2 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: C.text, fontFamily: F.mono, letterSpacing: -1 }}>${p.price}</span>
                  <span style={{ fontSize: 12, color: C.muted, fontFamily: F.en }}>USD</span>
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>per {p.duration}</div>
                <div style={{ height: 1, background: C.border, marginBottom: 14 }}/>
                {[["有效期", p.duration], ["绑定终端", "1 台"], ["任务类型", "全部"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 9, fontSize: 12 }}>
                    <span style={{ color: C.muted }}>{k}</span>
                    <span style={{ color: C.text, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
                {(payMethod === "points" || payMethod === "yunbi") && (
                  <div style={{ marginTop: 10, padding: "8px 10px", background: "#F9FAFB", borderRadius: 7, display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ color: C.muted }}>实扣</span>
                    <span style={{ fontFamily: F.mono, fontWeight: 700, color: C.text }}>{amountDisplay}</span>
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginTop: 10, padding: "12px 14px", background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 11, color: C.muted, lineHeight: 1.8 }}>
              {["购买即表示同意服务条款", "激活卡永不过期，激活后计时"].map(txt => (
                <div key={txt} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                  <span style={{ color: C.green, flexShrink: 0, marginTop: 2 }}>{IcCard.check}</span><span>{txt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: step panels */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Step: payment methods */}
            {step === "methods" && (
              <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>选择支付方式</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>请选择偏好的付款渠道</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                  {PAY_METHODS.map(m => {
                    const insufficient = (m.key === "points" && pts < p.pts) || (m.key === "yunbi" && yunbi < p.yunbi);
                    const active = payMethod === m.key;
                    return (
                      <div key={m.key} onClick={() => !insufficient && setPayMethod(m.key as PayMethod)}
                        style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${active ? m.color : C.border}`, background: active ? m.color + "08" : "#fff", cursor: insufficient ? "not-allowed" : "pointer", opacity: insufficient ? 0.4 : 1 }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${active ? m.color : "#D1D5DB"}`, background: active ? m.color : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {active && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }}/>}
                        </div>
                        <span style={{ color: active ? m.color : C.muted, display: "flex", flexShrink: 0 }}>{m.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: active ? m.color : C.text }}>{m.label}</div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{m.desc}</div>
                        </div>
                        {insufficient && <span style={{ fontSize: 10, color: C.red, fontWeight: 700, background: "#FEF2F2", padding: "2px 8px", borderRadius: 5 }}>余额不足</span>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>应付金额</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.text, fontFamily: F.mono }}>{amountDisplay}</div>
                  </div>
                  <button onClick={goNext} disabled={!canPay}
                    style={{ padding: "12px 40px", borderRadius: 9, border: "none", background: canPay ? C.dark : "#E5E7EB", color: canPay ? C.yellow : C.muted, fontWeight: 700, fontSize: 14, cursor: canPay ? "pointer" : "not-allowed", fontFamily: F.cn }}>
                    下一步
                  </button>
                </div>
              </div>
            )}

            {/* Step: confirm */}
            {step === "confirm" && (
              <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 20 }}>确认支付</div>
                {[["商品", p.name], ["有效期", p.duration], ["支付方式", methodLabel], ["支付金额", amountDisplay]].map(([k, v], i, arr) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <span style={{ fontSize: 13, color: C.muted }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: i === arr.length - 1 ? F.mono : F.cn }}>{v}</span>
                  </div>
                ))}
                <FootBtns onBack={() => setStep("methods")} onNext={doConfirmPay} nextLabel="确认支付" />
              </div>
            )}

            {/* Step: crypto chain */}
            {step === "crypto_chain" && (
              <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>选择支付链</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>USDT 转账 · 请选择区块链网络</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {(["BSC", "TRON"] as CryptoChain[]).map(chain => (
                    <div key={chain} onClick={() => setCryptoChain(chain)}
                      style={{ border: `1.5px solid ${cryptoChain === chain ? "#F59E0B" : C.border}`, borderRadius: 12, padding: "22px 16px", cursor: "pointer", background: cryptoChain === chain ? "#FFFBEB" : "#FAFAFA", textAlign: "center" }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: chain === "BSC" ? "#FEF3C733" : "#FEE2E233", border: `1.5px solid ${chain === "BSC" ? "#FCD34D" : "#FECACA"}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={chain === "BSC" ? "#F59E0B" : "#EF4444"} strokeWidth="1.6" strokeLinecap="round"><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20M12 2a10 10 0 100 20"/></svg>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: C.text, fontFamily: F.en, marginBottom: 4 }}>{chain}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{chain === "BSC" ? "BEP-20" : "TRC-20"}</div>
                      <div style={{ fontSize: 10, color: "#BDBDBD", marginTop: 2 }}>{chain === "BSC" ? "Binance Smart Chain" : "TRON Network"}</div>
                    </div>
                  ))}
                </div>
                <FootBtns onBack={() => setStep("methods")} onNext={() => setStep("crypto_pay")} nextLabel="确认网络，下一步" nextColor="#1C1C2E" nextTextColor="#F59E0B" />
              </div>
            )}

            {/* Step: crypto pay */}
            {step === "crypto_pay" && (
              <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>加密货币支付</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontFamily: F.en }}>USDT · {cryptoChain === "BSC" ? "BEP-20" : "TRC-20"} · {cryptoChain}</div>
                  </div>
                  <div style={{ background: countdown <= 60 ? "#FEF2F2" : "#FFF7ED", border: `1px solid ${countdown <= 60 ? "#FECACA" : "#FED7AA"}`, borderRadius: 9, padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: countdown <= 60 ? C.red : C.orange, marginBottom: 2 }}>
                      {IcCard.timer}<span style={{ fontSize: 10, fontWeight: 600 }}>剩余时间</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, fontFamily: F.mono, color: countdown <= 60 ? C.red : C.orange }}>{mmss}</div>
                  </div>
                </div>
                <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "16px 18px", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#92400E", fontWeight: 600, marginBottom: 10 }}>转入精确金额（后 5 位小数为订单号，不可四舍五入）</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, fontSize: 22, fontWeight: 900, color: "#78350F", fontFamily: F.mono }}>{cryptoAmountRef.current} <span style={{ fontSize: 12, fontWeight: 600 }}>USDT</span></div>
                    <button onClick={() => { navigator.clipboard.writeText(cryptoAmountRef.current); setCopiedAmt(true); setTimeout(() => setCopiedAmt(false), 2e3); }}
                      style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", fontSize: 12, borderRadius: 7, border: "1px solid #FCD34D", background: copiedAmt ? "#F59E0B" : "#fff", color: copiedAmt ? "#fff" : "#92400E", fontWeight: 600, fontFamily: F.cn, cursor: "pointer" }}>
                      {IcCard.copy}{copiedAmt ? "已复制" : "复制"}
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                  <QRCode addr={CRYPTO_ADDRESSES[cryptoChain]} size={148} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, fontFamily: F.en, marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: 0.6 }}>Payment Address · {cryptoChain}</div>
                    <div style={{ background: "#F9FAFB", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontFamily: F.mono, fontSize: 11, color: C.text, wordBreak: "break-all" as const, lineHeight: 1.9, marginBottom: 10 }}>
                      {CRYPTO_ADDRESSES[cryptoChain]}
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(CRYPTO_ADDRESSES[cryptoChain]); setCopiedAddr(true); setTimeout(() => setCopiedAddr(false), 2e3); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", borderRadius: 7, border: `1px solid ${C.border}`, background: copiedAddr ? C.green : "#fff", color: copiedAddr ? "#fff" : C.text, fontSize: 12, fontWeight: 600, fontFamily: F.cn, cursor: "pointer" }}>
                      {IcCard.copy}{copiedAddr ? "地址已复制" : "复制收款地址"}
                    </button>
                  </div>
                </div>
                <div style={{ padding: "10px 14px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, fontSize: 11, color: "#166534", lineHeight: 1.7, marginBottom: 4 }}>
                  链上确认后系统自动回调，通常 1–3 分钟完成。请勿关闭页面。
                </div>
                <FootBtns onBack={() => setStep("crypto_chain")} onNext={doConfirmPay} nextLabel="模拟支付成功（测试）" nextColor="#16A34A" nextTextColor="#fff" />
              </div>
            )}

            {/* Step: bank */}
            {step === "bank_form" && (
              <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 20 }}>银行卡信息</div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 7 }}>卡号</div>
                  <input value={bankCard.num} onChange={e => setBankCard(b => ({ ...b, num: e.target.value }))} placeholder="0000  0000  0000  0000" maxLength={19}
                    style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 16, fontFamily: F.mono, outline: "none", boxSizing: "border-box", letterSpacing: 2 }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 7 }}>持卡人姓名</div>
                  <input value={bankCard.name} onChange={e => setBankCard(b => ({ ...b, name: e.target.value }))} placeholder="拼音姓名" maxLength={30}
                    style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 14, fontFamily: F.en, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 7 }}>有效期</div>
                    <input value={bankCard.exp} onChange={e => setBankCard(b => ({ ...b, exp: e.target.value }))} placeholder="MM / YY" maxLength={7}
                      style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 14, fontFamily: F.mono, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 7 }}>CVV</div>
                    <input value={bankCard.cvv} onChange={e => setBankCard(b => ({ ...b, cvv: e.target.value }))} placeholder="•••" maxLength={4} type="password"
                      style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 14, fontFamily: F.mono, outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                <FootBtns onBack={() => setStep("methods")} onNext={doConfirmPay} nextLabel={`确认支付 · $${p.price} USD`} nextDisabled={!bankCard.num || !bankCard.name} />
              </div>
            )}

            {/* Step: QR pay */}
            {step === "qr_pay" && (
              <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "36px 24px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: payMethod === "alipay" ? "#EFF6FF" : "#F0FDF4", border: `1.5px solid ${payMethod === "alipay" ? "#BFDBFE" : "#BBF7D0"}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: payMethod === "alipay" ? "#1677FF" : "#07C160" }}>
                  {payMethod === "alipay" ? IcCard.alipay : IcCard.wechat}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>{payMethod === "alipay" ? "支付宝扫码支付" : "微信扫码支付"}</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 24 }}>请用 {payMethod === "alipay" ? "支付宝" : "微信"} App 扫描下方二维码</div>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <QRCode addr={`${payMethod}-${p.id}-${p.price}`} size={176} />
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.text, fontFamily: F.mono, marginBottom: 4 }}>${p.price} <span style={{ fontSize: 13, fontWeight: 500, color: C.muted }}>USD</span></div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 28 }}>二维码有效期 15 分钟</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep("methods")} style={{ flex: 1, padding: "12px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>返回</button>
                  <button onClick={doConfirmPay} style={{ flex: 2, padding: "12px", borderRadius: 9, border: "none", background: payMethod === "alipay" ? "#1677FF" : "#07C160", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>已完成支付</button>
                </div>
              </div>
            )}

            {/* Step: success */}
            {step === "success" && (
              <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "60px 24px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", textAlign: "center" }}>
                <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", border: "2px solid #6EE7B7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#059669" }}>
                  {IcCard.success}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 10 }}>购买成功</div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 36, lineHeight: 1.9 }}>激活卡已添加至「我的激活卡」<br/>前往查看卡密并完成终端绑定</div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <button onClick={close} style={{ padding: "11px 28px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>返回商城</button>
                  <button onClick={() => { close(); setView("mycards"); }} style={{ padding: "11px 28px", borderRadius: 9, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>查看我的激活卡</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const CARD_PAGE_SIZE = 20;

  /* Richer card data with bound user IDs */
  const allCards = myCards as Array<{ id: string; product: string; key: string; purchasedAt: string; expires: string; status: string; usedSlot: string | null; boundUser?: string }>;

  const filteredCards = allCards
    .filter(c => {
      if (cardFilter === "unused")  return c.status === "未使用";
      if (cardFilter === "active")  return c.status === "正在使用";
      if (cardFilter === "used")    return c.status === "已使用";
      return true;
    })
    .filter(c => !cardSearch || c.id.toLowerCase().includes(cardSearch.toLowerCase()) || (c.boundUser ?? "").toLowerCase().includes(cardSearch.toLowerCase()) || c.key.toLowerCase().includes(cardSearch.toLowerCase()))
    .sort((a, b) => {
      /* default: unused first, then active, then used */
      if (cardSort === "default") {
        const order: Record<string,number> = { "未使用": 0, "正在使用": 1, "已使用": 2 };
        return (order[a.status] ?? 3) - (order[b.status] ?? 3);
      }
      if (cardSort === "purchasedAt") return b.purchasedAt.localeCompare(a.purchasedAt);
      if (cardSort === "expires")     return (b.expires === "—" ? "9999" : b.expires).localeCompare(a.expires === "—" ? "9999" : a.expires);
      return 0;
    });

  const cardTotalPages = Math.ceil(filteredCards.length / CARD_PAGE_SIZE);
  const cardPageData   = filteredCards.slice((cardPage - 1) * CARD_PAGE_SIZE, cardPage * CARD_PAGE_SIZE);

  const statUnused  = allCards.filter(c => c.status === "未使用").length;
  const statActive  = allCards.filter(c => c.status === "正在使用").length;
  const statUsed    = allCards.filter(c => c.status === "已使用").length;
  const statTotal   = allCards.length;

  const statusStyle = (s: string) =>
    s === "未使用"  ? { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" } :
    s === "正在使用" ? { bg: "#EFF6FF", color: C.blue,    border: "#BFDBFE" } :
                       { bg: "#F3F4F6", color: C.muted,   border: "#E5E7EB" };

  /* card detail modal */
  const viewCardData = viewCard ? allCards.find(c => c.id === viewCard) : null;

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", background: "#F7F8FA", fontFamily: F.cn }}>

      {/* Card detail modal */}
      {viewCardData && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setViewCard(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 440, background: "#fff", borderRadius: 16, boxShadow: "0 24px 64px rgba(0,0,0,.18)", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(140deg,#0d1426,#1e3060)", padding: "22px 24px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 9, background: "rgba(255,215,0,.12)", border: "1px solid rgba(255,215,0,.2)", display: "flex", alignItems: "center", justifyContent: "center", color: C.yellow }}>{IcCard.key}</div>
              <div>
                <div style={{ fontWeight: 800, color: "#fff", fontSize: 15 }}>{viewCardData.product}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontFamily: F.mono }}>{viewCardData.id}</div>
              </div>
              <button onClick={() => setViewCard(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,.4)", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "22px 24px" }}>
              {[
                ["卡密",     viewCardData.key],
                ["状态",     viewCardData.status],
                ["购买日期", viewCardData.purchasedAt],
                ["到期日期", viewCardData.expires],
                ["绑定账户", viewCardData.boundUser ?? "—"],
                ["绑定槽位", viewCardData.usedSlot ?? "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 13, color: C.muted }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: k === "卡密" || k === "绑定账户" ? F.mono : F.cn, letterSpacing: k === "卡密" ? 1.2 : 0 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
                <button onClick={() => navigator.clipboard.writeText(viewCardData.key)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>
                  {IcCard.copy} 复制卡密
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Page-level tab bar ── */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: "#fff", paddingLeft: 24, flexShrink: 0 }}>
        {([["get","获取激活卡"],["mycards","我的激活卡"],["history","历史记录"]] as const).map(([k,label]) => (
          <button key={k} onClick={() => setCardPageTab(k)}
            style={{ padding: "13px 22px", background: "none", border: "none", borderBottom: `2px solid ${cardPageTab === k ? C.dark : "transparent"}`, color: cardPageTab === k ? C.text : C.muted, fontWeight: cardPageTab === k ? 700 : 500, fontSize: 13, cursor: "pointer", fontFamily: F.cn, marginBottom: -1 }}>
            {label}
            {k === "mycards" && <span style={{ marginLeft: 6, background: cardPageTab === k ? C.dark : "#F0F0F0", color: cardPageTab === k ? "#fff" : C.muted, borderRadius: 99, fontSize: 11, fontWeight: 700, padding: "1px 7px" }}>{myCards.length}</span>}
            {k === "get" && lotteryCards > 0 && <span style={{ marginLeft: 6, background: C.orange, color: "#fff", borderRadius: 99, fontSize: 11, fontWeight: 700, padding: "1px 7px" }}>{lotteryCards} 张抽奖卡</span>}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto" as const, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── OTP / acquire modal ── */}
        {acqModal && (() => {
          const isPts = acqModal === "pts";
          const qty = isPts ? acqQty : 1;
          return (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={closeAcqModal}>
              <div onClick={e => e.stopPropagation()} style={{ width: 420, borderRadius: 14, background: "#fff", boxShadow: "0 24px 64px rgba(0,0,0,.22)", overflow: "hidden", fontFamily: F.cn }}>
                <div style={{ background: C.dark, padding: "14px 20px", display: "flex", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "#fff", fontSize: 15, flex: 1 }}>{isPts ? "积分兑换激活卡" : "云币购买激活卡"}</span>
                  <button onClick={closeAcqModal} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.4)", fontSize: 20, cursor: "pointer" }}>✕</button>
                </div>
                <div style={{ padding: "22px 24px" }}>
                  {acqStep === "form" && (<>
                    {isPts && (
                      <div style={{ padding: "12px 14px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 9, marginBottom: 18, fontSize: 12, color: "#16A34A", lineHeight: 1.7 }}>
                        🎉 积分兑换免手续费，每张附赠 <strong>1 张抽奖卡</strong>，有机会再得激活卡！
                      </div>
                    )}
                    {isPts ? (<>
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <label style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>数量（每张 {CARD_PTS.toLocaleString()} 积分）</label>
                          <span style={{ fontSize: 11, color: C.muted }}>可兑 <strong style={{ color: C.text }}>{acqMaxPts}</strong> 张</span>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input value={acqPtsQty} onChange={e => setAcqPtsQty(e.target.value.replace(/\D/g,""))} type="text" placeholder="输入数量"
                            style={{ flex: 1, padding: "10px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, fontFamily: F.mono, outline: "none", boxSizing: "border-box" as const }}
                            onFocus={e => (e.target.style.borderColor = C.yellow)} onBlur={e => (e.target.style.borderColor = C.border)} />
                          <button onClick={() => setAcqPtsQty(String(acqMaxPts))} style={{ padding: "10px 16px", borderRadius: 8, border: `1px solid ${C.yellow}`, background: "#FFFBEB", color: "#92400E", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>MAX</button>
                        </div>
                      </div>
                      <div style={{ padding: "10px 14px", background: "#F9FAFB", border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 18, fontSize: 12 }}>
                        {[["消耗积分", `${(acqQty * CARD_PTS).toLocaleString()} 积分`], ["获得激活卡", `× ${acqQty} 张`], ["附赠抽奖卡", `× ${acqQty} 张`], ["手续费", "免费"]].map(([k,v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                            <span style={{ color: C.muted }}>{k}</span>
                            <span style={{ fontWeight: 700, color: k === "手续费" ? "#16A34A" : C.text, fontFamily: F.mono }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </>) : (<>
                      <div style={{ padding: "10px 14px", background: "#F9FAFB", border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 18, fontSize: 12 }}>
                        {[["消耗云币", "500 云币"], ["获得激活卡", "× 1 张"], ["手续费", "免费"]].map(([k,v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                            <span style={{ color: C.muted }}>{k}</span>
                            <span style={{ fontWeight: 700, color: k === "手续费" ? "#16A34A" : C.text, fontFamily: F.mono }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </>)}
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={closeAcqModal} style={{ flex: 1, padding: "11px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>取消</button>
                      <button onClick={doAcqConfirm} disabled={isPts ? !canAcqPts : !canAcqYunbi}
                        style={{ flex: 2, padding: "11px", borderRadius: 9, border: "none", background: (isPts ? canAcqPts : canAcqYunbi) ? C.dark : "#E5E7EB", color: (isPts ? canAcqPts : canAcqYunbi) ? C.yellow : C.muted, fontWeight: 700, fontSize: 14, cursor: (isPts ? canAcqPts : canAcqYunbi) ? "pointer" : "not-allowed", fontFamily: F.cn }}>
                        下一步：安全验证
                      </button>
                    </div>
                  </>)}
                  {acqStep === "verify" && (<>
                    {/* Method toggle */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 18, background: "#F3F4F6", borderRadius: 9, padding: 4 }}>
                      {(["otp","pwd"] as const).map(m => (
                        <button key={m} onClick={() => { setAcqVerifyMethod(m); setAcqOtp(""); setAcqPwd(""); setAcqOtpSent(false); }}
                          style={{ flex: 1, padding: "8px 0", borderRadius: 7, border: "none", background: acqVerifyMethod === m ? "#fff" : "transparent", color: acqVerifyMethod === m ? C.text : C.muted, fontWeight: acqVerifyMethod === m ? 700 : 500, fontSize: 13, cursor: "pointer", fontFamily: F.cn, boxShadow: acqVerifyMethod === m ? "0 1px 4px rgba(0,0,0,.1)" : "none", transition: "all .15s" }}>
                          {m === "otp" ? "邮箱验证码" : "支付密码"}
                        </button>
                      ))}
                    </div>

                    {acqVerifyMethod === "otp" && (<>
                      {!acqOtpSent ? (
                        <div style={{ textAlign: "center", padding: "12px 0 20px" }}>
                          <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>将向 <strong>us****@gmail.com</strong> 发送 6 位验证码</div>
                          <button onClick={sendAcqOtp}
                            style={{ padding: "11px 32px", borderRadius: 9, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>
                            发送验证码
                          </button>
                        </div>
                      ) : (<>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 9, marginBottom: 16 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" style={{ marginTop: 1, flexShrink: 0 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                          <span style={{ fontSize: 12, color: "#16A34A" }}>验证码已发送至 <strong>us****@gmail.com</strong></span>
                        </div>
                        <input value={acqOtp} onChange={e => setAcqOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
                          placeholder="— — — — — —" maxLength={6} autoFocus
                          style={{ width: "100%", padding: "14px 16px", border: `2px solid ${acqOtp.length === 6 ? "#16A34A" : C.border}`, borderRadius: 10, fontSize: 24, fontFamily: F.mono, fontWeight: 800, letterSpacing: 10, outline: "none", boxSizing: "border-box" as const, textAlign: "center" as const, marginBottom: 8 }} />
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                          <button onClick={() => acqOtpTimer === 0 && sendAcqOtp()} disabled={acqOtpTimer > 0}
                            style={{ background: "none", border: "none", fontSize: 12, color: acqOtpTimer > 0 ? C.muted : C.blue, fontWeight: 600, cursor: acqOtpTimer > 0 ? "default" : "pointer", fontFamily: F.cn, padding: 0 }}>
                            {acqOtpTimer > 0 ? `${acqOtpTimer}s 后可重发` : "没收到？重新发送"}
                          </button>
                        </div>
                      </>)}
                    </>)}

                    {acqVerifyMethod === "pwd" && (
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ fontSize: 12, color: C.muted, fontWeight: 600, display: "block", marginBottom: 8 }}>支付密码</label>
                        <input type="password" value={acqPwd} onChange={e => setAcqPwd(e.target.value)}
                          placeholder="请输入支付密码" autoFocus
                          style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 15, fontFamily: F.mono, outline: "none", boxSizing: "border-box" as const }}
                          onFocus={e => (e.target.style.borderColor = C.dark)} onBlur={e => (e.target.style.borderColor = C.border)} />
                      </div>
                    )}

                    {(() => {
                      const canVerify = acqVerifyMethod === "otp" ? (acqOtpSent && acqOtp.length === 6) : !!acqPwd.trim();
                      return (
                        <div style={{ display: "flex", gap: 10 }}>
                          <button onClick={() => { setAcqStep("form"); setAcqOtp(""); setAcqPwd(""); setAcqOtpSent(false); }}
                            style={{ flex: 1, padding: "12px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>
                            返回
                          </button>
                          <button onClick={doAcqConfirm} disabled={!canVerify}
                            style={{ flex: 2, padding: "12px", borderRadius: 9, border: "none", background: canVerify ? C.dark : "#E5E7EB", color: canVerify ? C.yellow : C.muted, fontWeight: 700, fontSize: 14, cursor: canVerify ? "pointer" : "not-allowed", fontFamily: F.cn }}>
                            确认兑换
                          </button>
                        </div>
                      );
                    })()}
                  </>)}
                  {acqStep === "ok" && (
                    <div style={{ textAlign: "center", padding: "16px 0" }}>
                      <div style={{ fontSize: 52, marginBottom: 10 }}>🎉</div>
                      <div style={{ fontSize: 19, fontWeight: 800, color: C.text, marginBottom: 6 }}>兑换成功！</div>
                      <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>
                        激活卡已添加至您的卡列表
                      </div>
                      {acqModal === "pts" && (
                        <div style={{ fontSize: 13, color: "#16A34A", fontWeight: 700, marginBottom: 20 }}>
                          🎟 同时获得 {acqQty} 张抽奖卡！
                        </div>
                      )}
                      <button onClick={closeAcqModal} style={{ padding: "11px 36px", borderRadius: 9, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>完成</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── 轮盘抽奖弹窗 ── */}
        {lotteryModal && (() => {
          // SVG wheel helpers
          const W = 260, cx = W/2, cy = W/2, R = W/2 - 4, rInner = 36;
          const toXY = (angleDeg: number, r: number) => {
            const rad = (angleDeg - 90) * Math.PI / 180;
            return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
          };
          const segPath = (s: number, e: number) => {
            const p1 = toXY(s, R), p2 = toXY(e, R), pi1 = toXY(s, rInner), pi2 = toXY(e, rInner);
            const lg = e - s > 180 ? 1 : 0;
            return `M ${pi1.x} ${pi1.y} L ${p1.x} ${p1.y} A ${R} ${R} 0 ${lg} 1 ${p2.x} ${p2.y} L ${pi2.x} ${pi2.y} A ${rInner} ${rInner} 0 ${lg} 0 ${pi1.x} ${pi1.y} Z`;
          };
          return (
          <div onClick={() => { if (slotPhase !== "spinning") { setLotteryModal(false); setSlotPhase("idle"); } }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
            <div onClick={e => e.stopPropagation()}
              style={{ width: 460, borderRadius: 22, background: "linear-gradient(160deg,#07101f 0%,#0e1f45 60%,#1a0a3a 100%)", border: "1px solid rgba(255,215,0,.2)", boxShadow: "0 40px 100px rgba(0,0,0,.7)" }}>

              {/* Header */}
              <div style={{ padding: "20px 22px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase" as const, color: "rgba(255,215,0,.4)", marginBottom: 3 }}>Lucky Wheel</div>
                  <div style={{ fontSize: 19, fontWeight: 900, color: "#fff" }}>幸运轮盘</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ background: "rgba(255,215,0,.1)", border: "1px solid rgba(255,215,0,.2)", borderRadius: 8, padding: "4px 12px", fontSize: 12, color: "#FFD700", fontWeight: 700 }}>
                    {lotteryCards} 张抽奖卡
                  </div>
                  {slotPhase !== "spinning" && (
                    <button onClick={() => { setLotteryModal(false); setSlotPhase("idle"); }}
                      style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.5)", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                  )}
                </div>
              </div>

              {/* Wheel + button */}
              <div style={{ padding: "18px 22px 20px", display: "flex", gap: 20, alignItems: "center" }}>
                {/* SVG wheel */}
                <div style={{ position: "relative" as const, flexShrink: 0 }}>
                  {/* pointer */}
                  <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", zIndex: 10,
                    width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "22px solid #FFD700",
                    filter: "drop-shadow(0 2px 6px rgba(255,215,0,.5))" }} />
                  <svg width={W} height={W} style={{ display: "block", transform: `rotate(${wheelAngle}deg)`, transition: slotPhase === "spinning" ? `transform 4.2s cubic-bezier(0.17,0.67,0.12,0.99)` : "none" }}>
                    {/* segments */}
                    {WHEEL_PRIZES.map((p, i) => {
                      const a = wheelAngles[i];
                      const mid = toXY(a.mid, (R + rInner) / 2);
                      const txtAngle = a.mid - 90;
                      return (
                        <g key={p.label}>
                          <path d={segPath(a.start, a.end)} fill={p.color} stroke="rgba(7,16,31,.4)" strokeWidth="1.5" />
                          <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="middle"
                            transform={`rotate(${txtAngle},${mid.x},${mid.y})`}
                            fill={p.dark} fontSize="9" fontWeight="800" fontFamily="system-ui">
                            {p.label}
                          </text>
                        </g>
                      );
                    })}
                    {/* center hub */}
                    <circle cx={cx} cy={cy} r={rInner - 2} fill="#0e1f45" stroke="rgba(255,215,0,.3)" strokeWidth="1.5" />
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,215,0,.7)" fontSize="10" fontWeight="700">抽奖</text>
                  </svg>
                </div>

                {/* Right panel */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, gap: 10 }}>
                  {/* Result */}
                  {slotPhase === "result" && slotPrize && (
                    <div style={{ padding: "12px 14px", borderRadius: 11, background: "rgba(255,215,0,.1)", border: "1px solid rgba(255,215,0,.3)", textAlign: "center" as const }}>
                      <div style={{ fontSize: 10, color: "rgba(255,215,0,.6)", letterSpacing: 2, marginBottom: 5 }}>恭喜获得</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#FFD700", lineHeight: 1.2 }}>{slotPrize.label}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 5 }}>已发放至账户</div>
                    </div>
                  )}
                  {slotPhase !== "result" && (
                    <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
                      {WHEEL_PRIZES.map(p => (
                        <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 7, padding: "3px 0" }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,.6)", flex: 1 }}>{p.label}</span>
                          <span style={{ fontSize: 10, fontFamily: F.mono, color: "rgba(255,215,0,.45)" }}>{(p.prob*100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={doSpin} disabled={slotPhase === "spinning" || lotteryCards < 1}
                    style={{ width: "100%", padding: "13px", borderRadius: 11, border: "none", fontWeight: 900, fontSize: 14, cursor: slotPhase === "spinning" || lotteryCards < 1 ? "not-allowed" : "pointer", fontFamily: F.cn, letterSpacing: 1, transition: "all .15s",
                      background: slotPhase === "spinning" || lotteryCards < 1 ? "rgba(255,255,255,.06)" : "linear-gradient(135deg,#D97706,#FFD700)",
                      color: slotPhase === "spinning" || lotteryCards < 1 ? "rgba(255,255,255,.2)" : "#07101f" }}>
                    {slotPhase === "spinning" ? "旋转中…" : lotteryCards < 1 ? "暂无抽奖卡" : slotPhase === "result" ? "再转一次" : "开始旋转"}
                  </button>
                  <button onClick={() => { setLotteryModal(false); setSlotPhase("idle"); setCardPageTab("history"); setHistoryTab("lottery"); }}
                    style={{ background: "none", border: "none", padding: 0, fontSize: 11, color: "rgba(255,215,0,.5)", cursor: "pointer", fontFamily: F.cn, textAlign: "left", textDecoration: "underline" }}>
                    查看完整抽奖记录 →
                  </button>
                </div>
              </div>
            </div>
          </div>
          );
        })()}

        {cardPageTab === "get" && (<>

        {/* ── 获得新激活卡 hero ── */}
        <div style={{ position: "relative" as const, borderRadius: 14, overflow: "hidden", background: "linear-gradient(135deg,#07101f 0%,#0c1b3a 60%,#111827 100%)", padding: "18px 20px 16px" }}>
          <div style={{ position: "absolute", right: -60, bottom: -60, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,.08) 0%,transparent 70%)", pointerEvents: "none" as const }} />

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase" as const, color: "rgba(255,255,255,.28)", fontWeight: 600, marginBottom: 3 }}>激活卡获取渠道</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: -0.3 }}>获得新激活卡</div>
            </div>
            <div style={{ marginLeft: "auto", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "rgba(255,255,255,.45)", fontWeight: 500, letterSpacing: 0.3, whiteSpace: "nowrap" as const }}>
              年度激活卡 · $500
            </div>
          </div>

          {/* Three method cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {/* 官方购买 */}
            <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 11, padding: "14px 16px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,215,0,.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,.8)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>官方购买</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>银行卡 / USDT</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 12 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: C.yellow, fontFamily: F.mono, letterSpacing: -1 }}>$500</span>
                <span style={{ fontSize: 10, color: "rgba(255,215,0,.4)", fontWeight: 500 }}>/张</span>
              </div>
              <button onClick={() => openCheckout(CARD_PRODUCTS[0])}
                style={{ marginTop: "auto", width: "100%", padding: "8px 0", borderRadius: 7, border: "none", background: C.yellow, color: "#0a0f1a", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: F.cn }}>
                立即购买
              </button>
            </div>

            {/* 云币 */}
            <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 11, padding: "14px 16px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(139,92,246,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,.8)" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v2m0 6v2M9.5 9.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2c0 2.5-5 2.5-5 5s.9 2 2.5 2 2.5-.9 2.5-2"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>云币兑换</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>免手续费</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: F.mono, letterSpacing: -1 }}>500</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}> 云币/张</span>
              </div>
              <div style={{ fontSize: 10, color: canAcqYunbi ? "rgba(255,255,255,.35)" : "#F87171", marginBottom: 12 }}>
                余额：<span style={{ fontFamily: F.mono }}>{yunbi.toFixed(2)}</span> 云币
              </div>
              <button onClick={() => { setAcqModal("yunbi"); setAcqStep("form"); }}
                disabled={!canAcqYunbi}
                style={{ marginTop: "auto", width: "100%", padding: "8px 0", borderRadius: 7, border: "none", background: canAcqYunbi ? C.yellow : "rgba(255,255,255,.06)", color: canAcqYunbi ? "#0a0f1a" : "rgba(255,255,255,.2)", fontWeight: 800, fontSize: 12, cursor: canAcqYunbi ? "pointer" : "not-allowed", fontFamily: F.cn }}>
                {canAcqYunbi ? "立即兑换" : "余额不足"}
              </button>
            </div>

            {/* 积分 */}
            <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,215,0,.15)", borderRadius: 11, padding: "14px 16px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(251,191,36,.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(251,191,36,.8)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>积分兑换</div>
                  <div style={{ fontSize: 10, color: "#FFD700", fontWeight: 600 }}>附赠抽奖卡</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: F.mono, letterSpacing: -1 }}>50,000</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}> 积分/张</span>
              </div>
              <div style={{ fontSize: 10, color: canAcqPts ? "rgba(255,255,255,.35)" : "#F87171", marginBottom: 12 }}>
                余额：<span style={{ fontFamily: F.mono }}>{pts.toLocaleString()}</span> 积分
              </div>
              <button onClick={() => { setAcqModal("pts"); setAcqStep("form"); }}
                disabled={!canAcqPts}
                style={{ marginTop: "auto", width: "100%", padding: "8px 0", borderRadius: 7, border: "none", background: canAcqPts ? C.yellow : "rgba(255,255,255,.06)", color: canAcqPts ? "#0a0f1a" : "rgba(255,255,255,.2)", fontWeight: 800, fontSize: 12, cursor: canAcqPts ? "pointer" : "not-allowed", fontFamily: F.cn }}>
                {canAcqPts ? "立即兑换" : "积分不足"}
              </button>
            </div>
          </div>
        </div>

        {/* ── 抽奖入口 ── */}
        <div style={{ background: "linear-gradient(135deg,#1a0a3a 0%,#0c1b3a 100%)", borderRadius: 12, border: "1px solid rgba(255,215,0,.15)", padding: "12px 18px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,215,0,.12)", border: "1px solid rgba(255,215,0,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L9 9H2l5.5 4L5 20l7-4.5L19 20l-2.5-7L22 9h-7z"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 2 }}>幸运轮盘抽奖</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>积分兑换激活卡附赠抽奖卡 · 可抽激活卡等大奖</div>
          </div>
          <div style={{ textAlign: "right" as const, flexShrink: 0, marginRight: 10 }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: lotteryCards > 0 ? C.yellow : "rgba(255,255,255,.2)", fontFamily: F.mono, lineHeight: 1 }}>{lotteryCards}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 1 }}>张可用</div>
          </div>
          <button onClick={() => { setLotteryModal(true); setSlotPhase("idle"); }}
            disabled={lotteryCards < 1}
            style={{ flexShrink: 0, padding: "9px 20px", borderRadius: 9, border: "none", background: lotteryCards > 0 ? C.yellow : "rgba(255,255,255,.06)", color: lotteryCards > 0 ? "#07101f" : "rgba(255,255,255,.2)", fontWeight: 900, fontSize: 13, cursor: lotteryCards > 0 ? "pointer" : "not-allowed", fontFamily: F.cn }}>
            开始抽奖
          </button>
        </div>

        {/* ── 一元夺宝 ── */}
        {(() => {
          const pct = Math.min(treasurePool / TREASURE_TARGET * 100, 100);
          const remaining = TREASURE_TARGET - treasurePool;
          const addPts = () => {
            const n = Math.max(1, parseInt(treasureInput) || 0);
            if (n <= 0 || n > pts) return;
            setPts(p => p - n);
            const today = new Date().toISOString().slice(0, 10);
            setTreasurePool(p => {
              const next = p + n;
              if (next >= TREASURE_TARGET) {
                setMyCards(prev => [{ id: `CRD-T${Date.now()}`, product: "年度激活卡", key: `SM-${Math.random().toString(36).slice(2,6).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`, purchasedAt: new Date().toISOString().slice(0,10), expires: "—", status: "未使用" as const, usedSlot: null, boundUser: undefined }, ...prev]);
                setTreasureHistory(h => [{ date: today, action: "投入积分", pts: n, result: "🎉 中奖！获得激活卡" }, ...h]);
                setTreasureEntries([]);
                return 0;
              }
              setTreasureHistory(h => [{ date: today, action: "投入积分", pts: n, result: `池子 ${(next / TREASURE_TARGET * 100).toFixed(0)}%` }, ...h]);
              return next;
            });
            setTreasureEntries(e => [{ user: "sb****@gmail.com", pts: n }, ...e]);
            setTreasureInput("");
          };
          const addYunbi = () => {
            const n = parseFloat(treasureYunbiInput) || 0;
            if (n <= 0 || n > yunbi) return;
            const converted = Math.floor(n * 100); // 1 yunbi = 100 pts
            setYunbi(y => parseFloat((y - n).toFixed(4)));
            setPts(p => p + converted);
            setTreasureYunbiInput("");
          };
          return (
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ background: "linear-gradient(135deg,#07101f,#1a2d55)", padding: "12px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>一元夺宝</div>
                      <div style={{ fontSize: 9, letterSpacing: 2, color: "rgba(255,215,0,.5)", background: "rgba(255,215,0,.1)", padding: "2px 6px", borderRadius: 4 }}>POOL GAME</div>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 2 }}>池满 {TREASURE_TARGET.toLocaleString()} 积分 → 随机一人赢激活卡</div>
                  </div>
                  <div style={{ textAlign: "right" as const }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#FFD700", fontFamily: F.mono, lineHeight: 1 }}>{(pct).toFixed(1)}%</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 1 }}>已满</div>
                  </div>
                </div>
                {/* progress bar */}
                <div style={{ height: 10, borderRadius: 99, background: "rgba(255,255,255,.1)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 99, width: `${pct}%`, background: "linear-gradient(90deg,#F59E0B,#FFD700)", transition: "width .5s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 10, color: "rgba(255,255,255,.35)" }}>
                  <span style={{ fontFamily: F.mono }}>{treasurePool.toLocaleString()} 积分</span>
                  <span>还差 <strong style={{ color: "#FFD700", fontFamily: F.mono }}>{remaining.toLocaleString()}</strong> 积分即满池</span>
                </div>
              </div>

              {/* Input area */}
              <div style={{ padding: "14px 20px", display: "flex", gap: 10, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>投入积分（余额：<strong style={{ color: C.text, fontFamily: F.mono }}>{pts.toLocaleString()}</strong>）</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={treasureInput} onChange={e => setTreasureInput(e.target.value.replace(/\D/g,""))} placeholder="输入积分数" type="text"
                      style={{ flex: 1, padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: F.mono, outline: "none" }} />
                    {[1000,5000,10000].map(v => (
                      <button key={v} onClick={() => setTreasureInput(String(Math.min(v, pts)))}
                        style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#F8FAFC", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: F.mono, color: C.text }}>
                        {v >= 1000 ? `${v/1000}k` : v}
                      </button>
                    ))}
                    <button onClick={addPts} disabled={!treasureInput || parseInt(treasureInput) <= 0}
                      style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn, whiteSpace: "nowrap" as const }}>
                      投入
                    </button>
                  </div>
                </div>
                <div style={{ width: 1, background: C.border }} />
                <div style={{ flexShrink: 0, minWidth: 190 }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>云币换积分（1云币=100积分，余额：<strong style={{ fontFamily: F.mono }}>{yunbi.toFixed(2)}</strong>）</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={treasureYunbiInput} onChange={e => setTreasureYunbiInput(e.target.value)} placeholder="云币" type="text"
                      style={{ flex: 1, padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: F.mono, outline: "none" }} />
                    <button onClick={addYunbi}
                      style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#7C3AED", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>
                      兑换
                    </button>
                  </div>
                </div>
              </div>

              {/* Participant list */}
              <div style={{ padding: "10px 20px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, flex: 1 }}>当前参与者 · {treasureEntries.length} 人</div>
                  <button onClick={() => { setCardPageTab("history"); setHistoryTab("treasure"); }}
                    style={{ background: "none", border: "none", padding: 0, fontSize: 11, color: C.blue, cursor: "pointer", fontFamily: F.cn, textDecoration: "underline" }}>
                    查看我的记录 →
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
                  {treasureEntries.slice(0, 5).map((e, i) => {
                    const share = (e.pts / TREASURE_TARGET * 100).toFixed(1);
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: ["#FFD700","#C0C0C0","#CD7F32","#E2E8F0","#E2E8F0"][i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: i < 3 ? "#0a0f1a" : C.muted, flexShrink: 0 }}>{i+1}</div>
                        <span style={{ flex: 1, color: C.text }}>{e.user}</span>
                        <span style={{ fontFamily: F.mono, color: C.text, fontWeight: 700 }}>{e.pts.toLocaleString()} 积分</span>
                        <div style={{ width: 60, height: 5, borderRadius: 99, background: "#F1F5F9", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${share}%`, background: "#FFD700", borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: 10, color: C.muted, fontFamily: F.mono, minWidth: 36 }}>{share}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        </>)}

        {cardPageTab === "mycards" && (<>

        {/* ── Stats row ── */}
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "全部",     val: statTotal,  color: C.dark,    bg: "#F8FAFC", border: C.border },
            { label: "未使用",   val: statUnused,  color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
            { label: "使用中",   val: statActive,  color: C.blue,    bg: "#EFF6FF", border: "#BFDBFE" },
            { label: "已使用",   val: statUsed,    color: C.muted,   bg: "#F3F4F6", border: "#E5E7EB" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: s.bg, border: `1px solid ${s.border}` }}>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: F.mono, color: s.color, letterSpacing: -1, lineHeight: 1 }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* ── Filter + search + sort toolbar ── */}
        <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const }}>
          {/* Status filter pills */}
          <div style={{ display: "flex", gap: 6 }}>
            {([["all","全部"], ["unused","未使用"], ["active","正在使用"], ["used","已使用"]] as const).map(([k, label]) => (
              <button key={k} onClick={() => { setCardFilter(k); setCardPage(1); }}
                style={{ padding: "5px 14px", borderRadius: 99, border: `1px solid ${cardFilter === k ? C.dark : C.border}`, background: cardFilter === k ? C.dark : "#fff", color: cardFilter === k ? "#fff" : C.muted, fontWeight: cardFilter === k ? 700 : 500, fontSize: 12, cursor: "pointer", fontFamily: F.cn }}>
                {label}
              </button>
            ))}
          </div>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 180, position: "relative" as const }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={cardSearch} onChange={e => { setCardSearch(e.target.value); setCardPage(1); }} placeholder="搜索卡号 / 用户ID / 卡密" style={{ width: "100%", padding: "7px 10px 7px 30px", border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, fontFamily: F.cn, outline: "none", boxSizing: "border-box" as const }} />
          </div>
          {/* Sort */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted }}>
            <span>排序</span>
            <select value={cardSort} onChange={e => { setCardSort(e.target.value as typeof cardSort); setCardPage(1); }}
              style={{ padding: "5px 8px", border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, outline: "none", fontFamily: F.cn }}>
              <option value="default">默认（未使用优先）</option>
              <option value="purchasedAt">购买日期</option>
              <option value="expires">到期日期</option>
            </select>
          </div>
          <span style={{ fontSize: 12, color: C.muted, marginLeft: "auto" }}>共 <strong style={{ color: C.text }}>{filteredCards.length}</strong> 张</span>
        </div>

        {/* ── Card list table ── */}
        <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#F7F8FA" }}>
                {["#", "卡号", "产品", "卡密（脱敏）", "状态", "绑定账户", "购买日期", "到期日期", "操作"].map((h, hi) => (
                  <th key={h} style={{ padding: "10px 12px", fontWeight: 700, color: "#9AA3B0", fontSize: 12, textAlign: hi >= 4 && hi <= 7 ? "center" : "left", borderBottom: `1.5px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cardPageData.length === 0 && (
                <tr><td colSpan={9} style={{ padding: "40px", textAlign: "center", color: C.muted }}>暂无激活卡</td></tr>
              )}
              {cardPageData.map((card, i) => {
                const ss = statusStyle(card.status);
                const rowNum = (cardPage - 1) * CARD_PAGE_SIZE + i + 1;
                const maskedKey = card.key.slice(0, 7) + "****" + card.key.slice(-4);
                return (
                  <tr key={card.id} style={{ background: card.status === "未使用" ? "#FAFFFE" : i % 2 === 0 ? "#fff" : "#FAFBFC", borderBottom: `1px solid ${C.border}`, borderLeft: card.status === "未使用" ? `3px solid #16A34A` : card.status === "正在使用" ? `3px solid ${C.blue}` : "3px solid transparent" }}>
                    <td style={{ padding: "9px 12px", color: "#C8CDD6", fontFamily: F.mono, fontSize: 11 }}>{String(rowNum).padStart(2,"0")}</td>
                    <td style={{ padding: "9px 12px", fontFamily: F.mono, fontSize: 12, fontWeight: 700, color: C.text }}>{card.id}</td>
                    <td style={{ padding: "9px 12px" }}><span style={{ fontSize: 10, background: "#F0F0F5", borderRadius: 4, padding: "1px 6px", fontWeight: 700, color: C.muted }}>{card.product}</span></td>
                    <td style={{ padding: "9px 12px", fontFamily: F.mono, fontSize: 11, color: C.muted, letterSpacing: 1 }}>{maskedKey}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>{card.status}</span>
                    </td>
                    <td style={{ padding: "9px 12px", textAlign: "center", fontFamily: F.mono, fontSize: 11, color: card.boundUser ? C.blue : C.muted }}>
                      {card.boundUser ?? "—"}
                    </td>
                    <td style={{ padding: "9px 12px", textAlign: "center", fontSize: 11, color: C.muted, fontFamily: F.mono }}>{card.purchasedAt}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center", fontSize: 11, fontFamily: F.mono, color: card.expires === "—" ? "#C8CDD6" : C.text }}>{card.expires}</td>
                    <td style={{ padding: "9px 12px" }}>
                      <button onClick={() => setViewCard(card.id)} style={{ padding: "4px 12px", borderRadius: 5, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontWeight: 600, fontSize: 11, cursor: "pointer", fontFamily: F.cn }}>查看</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ padding: "9px 14px", background: "#F7F8FA", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: C.muted }}>共 {filteredCards.length} 张 · 每页 {CARD_PAGE_SIZE} 张</span>
            <span style={{ fontSize: 12, color: C.muted }}>第 {cardPage}/{Math.max(1, cardTotalPages)} 页</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              {([["«", 1], ["‹", cardPage - 1], ["›", cardPage + 1], ["»", cardTotalPages]] as [string,number][]).map(([lbl, pg]) => {
                const disabled = (lbl === "«" || lbl === "‹") ? cardPage === 1 : cardPage === cardTotalPages || cardTotalPages === 0;
                return (
                  <button key={lbl} onClick={() => !disabled && setCardPage(Math.max(1, Math.min(cardTotalPages, pg)))} disabled={disabled}
                    style={{ width: 28, height: 28, borderRadius: 5, border: `1px solid ${C.border}`, background: disabled ? "#F5F5F5" : "#fff", color: disabled ? "#CCC" : C.text, fontSize: 12, cursor: disabled ? "default" : "pointer", fontWeight: 600 }}>
                    {lbl}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        </>)}

        {cardPageTab === "history" && (<>

        {/* ── History sub-tabs ── */}
        <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, padding: "0 4px" }}>
            {([
              ["exchange", "兑换记录",    exchHistory.length],
              ["lottery",  "抽奖记录",    lotteryHistory.length],
              ["treasure", "夺宝记录",    treasureHistory.length],
            ] as [typeof historyTab, string, number][]).map(([k, label, count]) => (
              <button key={k} onClick={() => setHistoryTab(k)}
                style={{ padding: "12px 20px", background: "none", border: "none", borderBottom: `2px solid ${historyTab === k ? C.dark : "transparent"}`, color: historyTab === k ? C.text : C.muted, fontWeight: historyTab === k ? 700 : 500, fontSize: 13, cursor: "pointer", fontFamily: F.cn, marginBottom: -1, display: "flex", alignItems: "center", gap: 6 }}>
                {label}
                <span style={{ background: historyTab === k ? C.dark : "#F0F0F0", color: historyTab === k ? "#fff" : C.muted, borderRadius: 99, fontSize: 11, fontWeight: 700, padding: "1px 7px" }}>{count}</span>
              </button>
            ))}
          </div>

          {/* 兑换记录 */}
          {historyTab === "exchange" && (() => {
            const { rows, total, pages } = filterAndPage(exchHistory, hExchSearch, hExchFrom, hExchTo, hExchPage, (r,q) => r.method.includes(q)||r.cost.toLowerCase().includes(q)||r.reward.toLowerCase().includes(q), r=>r.date);
            return (<>
              <ListBar search={hExchSearch} onSearch={v=>{setHExchSearch(v);setHExchPage(1);}} dateFrom={hExchFrom} onDateFrom={v=>{setHExchFrom(v);setHExchPage(1);}} dateTo={hExchTo} onDateTo={v=>{setHExchTo(v);setHExchPage(1);}} total={total} />
              {rows.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>暂无兑换记录</div>
              : rows.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontSize: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: r.method.includes("积分") ? "#FFFBEB" : "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={r.method.includes("积分") ? C.orange : "#7C3AED"} strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: C.text, marginBottom: 2 }}>{r.method}</div>
                    <div style={{ color: C.muted, fontSize: 11 }}>消耗 {r.cost}</div>
                  </div>
                  <div style={{ textAlign: "right" as const }}>
                    <div style={{ color: "#16A34A", fontWeight: 700, marginBottom: 2 }}>{r.reward}</div>
                    <div style={{ fontFamily: F.mono, color: C.muted, fontSize: 11 }}>{r.date}</div>
                  </div>
                </div>
              ))}
              <ListPager page={Math.min(hExchPage, pages)} pages={pages} onChange={setHExchPage} />
            </>);
          })()}

          {/* 抽奖记录 */}
          {historyTab === "lottery" && (() => {
            const { rows, total, pages } = filterAndPage(lotteryHistory, hLottSearch, hLottFrom, hLottTo, hLottPage, (r,q) => r.result.includes(q)||r.reward.toLowerCase().includes(q), r=>r.date);
            return (<>
              <ListBar search={hLottSearch} onSearch={v=>{setHLottSearch(v);setHLottPage(1);}} dateFrom={hLottFrom} onDateFrom={v=>{setHLottFrom(v);setHLottPage(1);}} dateTo={hLottTo} onDateTo={v=>{setHLottTo(v);setHLottPage(1);}} total={total} />
              {rows.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>暂无抽奖记录</div>
              : rows.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontSize: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: r.result.includes("中奖") ? "#F0FDF4" : "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15 }}>
                    {r.result.includes("中奖") ? "🎉" : "💨"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: r.result.includes("中奖") ? "#16A34A" : C.muted }}>{r.result}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>幸运轮盘</div>
                  </div>
                  <div style={{ textAlign: "right" as const }}>
                    <div style={{ fontFamily: F.mono, color: C.text, fontWeight: 600, marginBottom: 2 }}>{r.reward}</div>
                    <div style={{ fontFamily: F.mono, color: C.muted, fontSize: 11 }}>{r.date}</div>
                  </div>
                </div>
              ))}
              <ListPager page={Math.min(hLottPage, pages)} pages={pages} onChange={setHLottPage} />
            </>);
          })()}

          {/* 夺宝记录 */}
          {historyTab === "treasure" && (() => {
            const { rows, total, pages } = filterAndPage(treasureHistory, hTresSearch, hTresFrom, hTresTo, hTresPage, (r,q) => r.action.includes(q)||r.result.toLowerCase().includes(q), r=>r.date);
            return (<>
              <ListBar search={hTresSearch} onSearch={v=>{setHTresSearch(v);setHTresPage(1);}} dateFrom={hTresFrom} onDateFrom={v=>{setHTresFrom(v);setHTresPage(1);}} dateTo={hTresTo} onDateTo={v=>{setHTresTo(v);setHTresPage(1);}} total={total} />
              {rows.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>暂无夺宝记录</div>
              : rows.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontSize: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: r.result.includes("中奖") ? "#FFFBEB" : "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15 }}>
                    {r.result.includes("中奖") ? "🏆" : "🎯"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: C.text }}>{r.action}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>一元夺宝</div>
                  </div>
                  <div style={{ textAlign: "right" as const }}>
                    <div style={{ fontFamily: F.mono, color: C.text, fontWeight: 700, marginBottom: 2 }}>{r.pts.toLocaleString()} 积分</div>
                    <div style={{ color: r.result.includes("中奖") ? "#16A34A" : C.muted, fontSize: 11, marginBottom: 2 }}>{r.result}</div>
                    <div style={{ fontFamily: F.mono, color: C.muted, fontSize: 11 }}>{r.date}</div>
                  </div>
                </div>
              ))}
              <ListPager page={Math.min(hTresPage, pages)} pages={pages} onChange={setHTresPage} />
            </>);
          })()}
        </div>

        </>)}

        {/* Use card hint */}
        {useCardId && (() => {
          const card = allCards.find(c => c.id === useCardId);
          return card ? (
            <div style={{ padding: "12px 16px", background: "#FFFDE7", border: "1px solid #FCD34D", borderRadius: 10, fontSize: 12, color: "#92400E", lineHeight: 1.8 }}>
              前往「首页 → 终端设备 → 激活绑定」，输入卡密&nbsp;
              <span style={{ fontFamily: F.mono, fontWeight: 700, background: "#FEF3C7", padding: "1px 7px", borderRadius: 4 }}>{card.key}</span>
              &nbsp;完成绑定。
              <button onClick={() => setUseCardId(null)} style={{ marginLeft: 14, padding: "2px 10px", borderRadius: 5, border: `1px solid #FCD34D`, background: "#fff", fontSize: 11, cursor: "pointer", fontFamily: F.cn, color: "#92400E" }}>关闭</button>
            </div>
          ) : null;
        })()}
      </div>
    </div>
  );
}

const IcNav = {
  home:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><path d="M9 21V12h6v9"/></svg>,
  orders:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  points:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v2m0 6v2M9.5 9.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2c0 2.5-5 2.5-5 5s.9 2 2.5 2 2.5-.9 2.5-2"/></svg>,
  member:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  accounts: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  lottery:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9h.01M15 15h.01M15 9L9 15"/></svg>,
  cards:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  node:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 7v4m0 0l-5.5 6M12 11l5.5 6"/></svg>,
};

const MERCHANT_NAV: { key: MerchantPage; icon: React.ReactNode; label: string; badge?: string }[] = [
  { key: "home",     icon: IcNav.home,     label: "首页" },
  { key: "orders",   icon: IcNav.orders,   label: "订单中心" },
  { key: "cards",    icon: IcNav.cards,    label: "激活卡" },
  { key: "member",   icon: IcNav.member,   label: "会员中心" },
  { key: "accounts", icon: IcNav.accounts, label: "服务商节点" },
  { key: "node",     icon: IcNav.node,     label: "节点控制台", badge: "⚡" },
];

function MerchantSite({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<MerchantPage>("home");

  const pages: Record<MerchantPage, React.ReactNode> = {
    home: <MerchantHome />,
    orders: <MerchantOrders />,
    member: <MerchantMember />,
    accounts: <MerchantAccounts />,
    cards: <MerchantCards />,
    node: <MerchantAccounts forceNode onGoCards={() => setPage("cards")} />,
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", fontFamily: F.cn, background: C.bg }}>
      {/* Title bar */}
      <div style={{ height: 54, background: C.dark, display: "flex", alignItems: "center", padding: "0 18px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
          <Logo size="sm" dark={true} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: 2, textTransform: "uppercase", marginLeft: 4, fontFamily: F.en }}>Merchant</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, background: C.green, borderRadius: "50%" }} />
          <span style={{ fontSize: 12, color: "#aaa" }}>sb1920mg</span>
          <Badge color={C.yellow}>黄金</Badge>
          <div style={{ display: "flex", gap: 2, marginLeft: 8 }}>
            {["－", "□", "✕"].map((c, i) => (
              <button key={c} style={{ width: 24, height: 20, background: i === 2 ? "#c0392b" : "#555", border: "none", cursor: "pointer", color: "#fff", fontSize: 11 }}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar nav */}
        <div style={{ width: 82, background: C.darkMid, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0", flexShrink: 0 }}>
          {MERCHANT_NAV.map((n) => (
            <button key={n.key} onClick={() => setPage(n.key)} style={{
              width: "100%", padding: "14px 0", border: "none", background: page === n.key ? C.dark : "transparent",
              cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              borderLeft: `3px solid ${page === n.key ? C.yellow : "transparent"}`,
              marginBottom: 2,
            }}>
              <span style={{ color: page === n.key ? C.yellow : "#888", display: "flex", position: "relative" as const }}>
                <span style={{ display: "inline-flex", transform: "scale(1.25)", transformOrigin: "center" }}>{n.icon}</span>
                {n.badge && <span style={{ position: "absolute" as const, top: -5, right: -7, fontSize: 9, lineHeight: 1, color: C.yellow }}>{n.badge}</span>}
              </span>
              <span style={{ fontSize: 11, color: page === n.key ? C.yellow : "#888", fontWeight: page === n.key ? 700 : 400 }}>{n.label}</span>
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => { if (window.confirm("确认退出登录？")) onLogout(); }} style={{
            width: "100%", padding: "14px 0", border: "none", borderTop: "1px solid rgba(255,255,255,.07)",
            background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
            color: "rgba(255,255,255,.35)",
          }}>
            <span style={{ display: "inline-flex", transform: "scale(1.2)", transformOrigin: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            <span style={{ fontSize: 11, fontFamily: F.cn }}>退出</span>
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" as const }}>
          <div style={{ position: "absolute", inset: 0, overflowY: "auto" as const, display: "flex", flexDirection: "column" }}>{pages[page]}</div>
        </div>
      </div>

      {/* Status bar */}
      <div style={{ height: 24, background: C.dark, display: "flex", alignItems: "center", padding: "0 14px", gap: 20, fontSize: 11, flexShrink: 0 }}>
        <span style={{ color: C.green }}>● 已连接</span>
        <span style={{ color: "#aaa" }}>积分：<strong style={{ color: C.yellow }}>218,120</strong></span>
        <span style={{ color: "#aaa" }}>云币：<strong style={{ color: "#fff" }}>0</strong></span>
        <span style={{ color: "#aaa", marginLeft: "auto", fontFamily: F.mono }}>v3.2.1 · 激活至 2027-08-30</span>
      </div>
      <SupportChat />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ADMIN — DATA & TYPES
══════════════════════════════════════════════════════════════ */

type AdminPage = "dashboard" | "merchants" | "orders" | "history" | "redemptions" | "nodes" | "cards" | "admins" | "cs" | "riskcontrol" | "announcements" | "config" | "logs";

const ADMIN_MERCHANTS = [
  { id: "sb1920mg", name: "张伟",  email: "us****@example.com",  level: "黄金", usedSlots: 2, maxSlots: 3, status: "active",   points: 218120, pendingPts: 36480,  settledPts: 432680, yunbi: 128.40, currentOrders: 2, joined: "2024-03-12", expiry: "2027-08-30", lastSeen: "2分钟前",  activationCode: "SM-BBBB-1002", wallet: "TRC...8821", walletModified: false },
  { id: "sb0482kl", name: "李娜",  email: "li***@163.com",       level: "白银", usedSlots: 1, maxSlots: 3, status: "active",   points:  84320, pendingPts: 12100,  settledPts:  98400, yunbi:  42.10, currentOrders: 1, joined: "2024-05-20", expiry: "2026-05-20", lastSeen: "1小时前",  activationCode: "SM-CCCC-1003", wallet: "TRC...4421", walletModified: false },
  { id: "sb3371qw", name: "王强",  email: "wa***@qq.com",        level: "新人", usedSlots: 2, maxSlots: 3, status: "banned",   points:   2100, pendingPts:     0,  settledPts:   3200, yunbi:   0.00, currentOrders: 0, joined: "2024-08-01", expiry: "2025-08-01", lastSeen: "3天前",    activationCode: "SM-DDDD-1004", wallet: "—",          walletModified: true  },
  { id: "sb7829xz", name: "陈芳",  email: "ch***@sina.com",      level: "铂金", usedSlots: 3, maxSlots: 3, status: "active",   points: 512800, pendingPts: 88200,  settledPts: 920400, yunbi: 310.00, currentOrders: 2, joined: "2023-11-05", expiry: "2028-11-05", lastSeen: "刚刚",     activationCode: "SM-EEEE-1005", wallet: "TRC...2231", walletModified: false },
  { id: "sb2241mp", name: "刘洋",  email: "li***@yahoo.com",     level: "黄金", usedSlots: 2, maxSlots: 3, status: "active",   points: 198400, pendingPts: 24600,  settledPts: 312000, yunbi:  88.60, currentOrders: 2, joined: "2024-01-18", expiry: "2027-01-18", lastSeen: "5小时前",  activationCode: "SM-FFFF-1006", wallet: "TRC...9901", walletModified: false },
  { id: "sb9934yr", name: "赵敏",  email: "zh***@hotmail.com",   level: "白银", usedSlots: 1, maxSlots: 3, status: "inactive", points:  31200, pendingPts:  4800,  settledPts:  44000, yunbi:  12.80, currentOrders: 0, joined: "2024-06-30", expiry: "2026-06-30", lastSeen: "2周前",    activationCode: "SM-GGGG-1007", wallet: "TRC...6612", walletModified: false },
  { id: "sb5512gh", name: "孙磊",  email: "su***@gmail.com",     level: "铂金", usedSlots: 3, maxSlots: 3, status: "active",   points: 489000, pendingPts: 72000,  settledPts: 810000, yunbi: 255.30, currentOrders: 2, joined: "2023-09-14", expiry: "2028-09-14", lastSeen: "10分钟前", activationCode: "SM-HHHH-1008", wallet: "TRC...3341", walletModified: false },
  { id: "sb8803jt", name: "周琴",  email: "zh***@126.com",       level: "新人", usedSlots: 1, maxSlots: 3, status: "active",   points:   8800, pendingPts:  1200,  settledPts:   6400, yunbi:   3.20, currentOrders: 1, joined: "2024-09-10", expiry: "2025-09-10", lastSeen: "昨天",     activationCode: "SM-IIII-1009", wallet: "—",          walletModified: false },
];

const ADMIN_ORDERS = [
  { id: "ORD-20240901-0001", merchant: "sb1920mg", terminalId: "T001", domain: "ex***.com",  purpose: "企业办公", hours: 8,  pts: 1200, status: "completed", settled: 1140, refund: "0%",  time: "2024-09-01 09:12", disconnectedAt: null,                  disconnectedH: 0 },
  { id: "ORD-20240901-0002", merchant: "sb7829xz", terminalId: "T002", domain: "ne***.io",   purpose: "数据抓取", hours: 24, pts: 3600, status: "running",   settled: 0,    refund: "1.2%",time: "2024-09-01 10:30", disconnectedAt: "2024-09-01 15:10",    disconnectedH: 1.5 },
  { id: "ORD-20240901-0003", merchant: "sb5512gh", terminalId: "T003", domain: "ap***.net",  purpose: "Ad Network Delivery", hours: 12, pts: 2000, status: "completed", settled: 1900, refund: "0%",  time: "2024-09-01 11:05", disconnectedAt: null,                  disconnectedH: 0 },
  { id: "ORD-20240901-0004", merchant: "sb0482kl", terminalId: "T001", domain: "sh***.com",  purpose: "SEO优化",  hours: 6,  pts:  800, status: "error",     settled: 0,    refund: "8.4%",time: "2024-09-01 11:48", disconnectedAt: "2024-08-31 12:00",   disconnectedH: 27.8 },
  { id: "ORD-20240901-0005", merchant: "sb2241mp", terminalId: "T002", domain: "gl***.org",  purpose: "企业办公", hours: 48, pts: 7200, status: "running",   settled: 0,    refund: "0.3%",time: "2024-09-01 12:00", disconnectedAt: null,                  disconnectedH: 0 },
  { id: "ORD-20240901-0006", merchant: "sb5512gh", terminalId: "T001", domain: "to***.co",   purpose: "数据抓取", hours: 8,  pts: 1400, status: "completed", settled: 1330, refund: "0%",  time: "2024-09-01 13:22", disconnectedAt: null,                  disconnectedH: 0 },
  { id: "ORD-20240901-0007", merchant: "sb1920mg", terminalId: "T002", domain: "mi***.com",  purpose: "Ad Network Delivery", hours: 16, pts: 2800, status: "pending",   settled: 0,    refund: "2.1%",time: "2024-09-01 14:10", disconnectedAt: "2024-09-01 16:10",    disconnectedH: 0.5 },
  { id: "ORD-20240901-0008", merchant: "sb8803jt", terminalId: "T001", domain: "da***.net",  purpose: "学术研究", hours: 4,  pts:  500, status: "completed", settled: 475,  refund: "0%",  time: "2024-09-01 15:33", disconnectedAt: null,                  disconnectedH: 0 },
];

/* ── Global platform params ── */
const ADMIN_PARAMS_GLOBAL = {
  staticYieldPer10h: 0.50,
  staticMultiplier: 1.0,
  dynamicSettleRatio: 0.95,
  lotteryPool: 50000,
  lotteryWinRate: 9,
  lotteryDisplayRate: 10,
  lotteryCut: 10,
  ptsToYunbi: 1000,
  ptsToCard: 50000,
  withdrawDates: [1, 15],
  minWithdrawal: 20,
  withdrawalFee: 5,
  maxWithdrawal: 5000,
  nodeCommission: 10,
  sediment: 1000,
};

/* ── Per-user / per-node parameter overrides (千人千面) ── */
const ADMIN_PARAM_OVERRIDES = [
  { targetType: "user", targetId: "sb1920mg", staticMult: 1.2,  dynamicMult: 1.0,  winRate: null, staticOn: true,  dynamicOn: true,  reason: "活跃用户激励",     updatedAt: "2024-08-15", updatedBy: "superadmin" },
  { targetType: "user", targetId: "sb0482kl", staticMult: 0,    dynamicMult: 0,    winRate: 0,   staticOn: false, dynamicOn: false, reason: "疑似作弊，人工冻结",updatedAt: "2024-09-01", updatedBy: "superadmin" },
  { targetType: "node", targetId: "ND-001",   staticMult: 1.1,  dynamicMult: 1.15, winRate: null, staticOn: true,  dynamicOn: true,  reason: "金牌节点额外激励",  updatedAt: "2024-07-01", updatedBy: "superadmin" },
  { targetType: "node", targetId: "ND-004",   staticMult: 1.0,  dynamicMult: 0,    winRate: null, staticOn: true,  dynamicOn: false, reason: "节点活跃度低，暂停动态",updatedAt: "2024-08-20", updatedBy: "superadmin" },
  { targetType: "user", targetId: "sb7829xz", staticMult: 1.5,  dynamicMult: 1.3,  winRate: 12,  staticOn: true,  dynamicOn: true,  reason: "铂金商家专属产值",  updatedAt: "2024-06-10", updatedBy: "ops01" },
];

/* ── Risk events ── */
const ADMIN_RISK_EVENTS = [
  { id: "RSK-001", time: "2024-09-01 11:42", merchant: "sb3371qw", type: "频繁登录",   score: 92, detail: "30分钟内尝试登录18次，来自3个不同IP段", action: "auto_freeze", frozenScope: "full",             status: "frozen"    },
  { id: "RSK-002", time: "2024-09-01 10:15", merchant: "sb0482kl", type: "钱包篡改",   score: 98, detail: "检测到钱包地址在未经授权情况下被修改",    action: "auto_freeze", frozenScope: "withdrawal",       status: "frozen"    },
  { id: "RSK-003", time: "2024-09-01 09:30", merchant: "sb7829xz", type: "异常提现",   score: 65, detail: "本周提现金额为历史均值8倍，疑似异常",      action: "manual_review",frozenScope: null,              status: "reviewing" },
  { id: "RSK-004", time: "2024-08-31 22:10", merchant: "sb5512gh", type: "积分异常",   score: 71, detail: "单日积分产出超正常值300%，疑似脚本刷分",   action: "manual_review",frozenScope: null,              status: "cleared"   },
  { id: "RSK-005", time: "2024-08-31 14:00", merchant: "sb2241mp", type: "多地登录",   score: 55, detail: "同账号同时在4个城市登录",                  action: "alert",       frozenScope: null,              status: "monitoring"},
  { id: "RSK-006", time: "2024-08-30 08:30", merchant: "sb9934yr", type: "设备异常",   score: 48, detail: "终端MAC地址在6小时内变更4次",              action: "alert",       frozenScope: null,              status: "cleared"   },
];

const ADMIN_RISK_RULES = [
  { id: 1, name: "频繁登录锁定", desc: "30分钟内登录失败超10次", trigger: "auto_freeze_full",       enabled: true  },
  { id: 2, name: "钱包篡改冻结", desc: "未授权修改钱包地址",     trigger: "auto_freeze_withdrawal",  enabled: true  },
  { id: 3, name: "提现异常告警", desc: "提现额超历史均值5倍",    trigger: "manual_review",            enabled: true  },
  { id: 4, name: "积分暴涨告警", desc: "单日积分超均值200%",     trigger: "manual_review",            enabled: true  },
  { id: 5, name: "多地登录告警", desc: "同账号3个以上地区在线",  trigger: "alert",                    enabled: true  },
  { id: 6, name: "作弊机器检测", desc: "终端行为熵值低于阈值",   trigger: "auto_freeze_static",       enabled: false },
];

/* ── Admin accounts ── */
const ADMIN_ADMINS_LIST = [
  { id: "ADM-001", username: "superadmin", name: "系统管理员", role: "superadmin", email: "admin@starmatrix.com",   lastLogin: "2024-09-01 15:42", status: "active",   perms: ["all"] },
  { id: "ADM-002", username: "finance01",  name: "财务审计",   role: "finance",    email: "fi****@starmatrix.com",  lastLogin: "2024-09-01 14:00", status: "active",   perms: ["redemptions","history","dashboard"] },
  { id: "ADM-003", username: "cs001",      name: "客服专员A",  role: "cs",         email: "cs1***@starmatrix.com",  lastLogin: "2024-09-01 10:30", status: "active",   perms: ["cs","merchants"] },
  { id: "ADM-004", username: "cs002",      name: "客服专员B",  role: "cs",         email: "cs2***@starmatrix.com",  lastLogin: "2024-08-30 16:00", status: "active",   perms: ["cs","merchants"] },
  { id: "ADM-005", username: "ops01",      name: "运营专员",   role: "operator",   email: "op****@starmatrix.com",  lastLogin: "2024-09-01 09:00", status: "active",   perms: ["params","announcements","merchants"] },
  { id: "ADM-006", username: "viewer01",   name: "只读观察员", role: "readonly",   email: "vw****@starmatrix.com",  lastLogin: "2024-08-15 11:00", status: "inactive", perms: ["dashboard"] },
];

const ADMIN_ROLES = [
  { key: "superadmin", label: "超级管理员", color: C.red,    desc: "全部权限，包括账号管理" },
  { key: "finance",    label: "财务",       color: C.orange, desc: "兑现审核、历史记录、数据看板" },
  { key: "cs",         label: "客服",       color: C.blue,   desc: "工单处理、商家查询" },
  { key: "operator",   label: "运营",       color: C.green,  desc: "参数配置、公告管理、商家管理" },
  { key: "readonly",   label: "只读",       color: C.muted,  desc: "仅可查看数据看板" },
];

/* ── CS tickets ── */
const ADMIN_TICKETS = [
  { id: "TK-001", merchant: "sb1920mg", subject: "终端无法连接",       priority: "high",   status: "open",       assignee: "cs001", created: "2024-09-01 09:15", updated: "2024-09-01 10:30", msgs: 3  },
  { id: "TK-002", merchant: "sb7829xz", subject: "提现6天未到账",       priority: "urgent", status: "processing", assignee: "cs002", created: "2024-09-01 08:40", updated: "2024-09-01 11:00", msgs: 7  },
  { id: "TK-003", merchant: "sb5512gh", subject: "申请修改绑定钱包",    priority: "high",   status: "processing", assignee: "cs001", created: "2024-08-31 16:20", updated: "2024-09-01 09:00", msgs: 5  },
  { id: "TK-004", merchant: "sb2241mp", subject: "积分结算数量不对",    priority: "medium", status: "resolved",   assignee: "cs002", created: "2024-08-30 11:00", updated: "2024-08-31 14:00", msgs: 4  },
  { id: "TK-005", merchant: "sb0482kl", subject: "账号被冻结申诉",      priority: "urgent", status: "open",       assignee: null,    created: "2024-09-01 11:30", updated: "2024-09-01 11:30", msgs: 1  },
  { id: "TK-006", merchant: "sb9934yr", subject: "签到奖励未发放",      priority: "low",    status: "resolved",   assignee: "cs001", created: "2024-08-28 14:00", updated: "2024-08-29 09:00", msgs: 2  },
  { id: "TK-007", merchant: "sb8803jt", subject: "新手激活卡兑换问题",  priority: "low",    status: "open",       assignee: null,    created: "2024-09-01 13:00", updated: "2024-09-01 13:00", msgs: 1  },
];

/* ── Announcements ── */
const ADMIN_ANNOUNCEMENTS_DATA = [
  { id: "ANN-001", title: "系统升级维护通知", content: "平台将于2024年9月15日凌晨2:00–4:00进行系统升级维护，届时服务暂停，请提前做好安排。", target: "all",  status: "published", publishedAt: "2024-09-01 10:00", author: "superadmin", pinned: true  },
  { id: "ANN-002", title: "积分兑换规则更新",  content: "自2024年10月1日起，积分兑换云币比率统一调整为1000:1，历史兑换记录不受影响。",         target: "all",  status: "published", publishedAt: "2024-08-28 14:00", author: "superadmin", pinned: false },
  { id: "ANN-003", title: "金牌商家专属活动",  content: "9月金牌商家专属积分翻倍活动，活动时间2024年9月1日-9月30日，请积极参与。",             target: "gold", status: "draft",     publishedAt: "",                 author: "ops01",      pinned: false },
  { id: "ANN-004", title: "9月提现日提醒",      content: "本月两次提现日分别为9月1日和9月15日，请在提现日前完成积分兑换和申请提交。",           target: "all",  status: "published", publishedAt: "2024-08-29 09:00", author: "superadmin", pinned: false },
  { id: "ANN-005", title: "节点佣金结算公告",  content: "8月节点佣金已于9月1日完成结算，请各节点服务商检查钱包到账情况。",                     target: "node", status: "published", publishedAt: "2024-09-01 08:00", author: "superadmin", pinned: false },
];

const ADMIN_HISTORY = [
  { id: "HIS-0001", merchant: "sb1920mg", type: "积分兑换",  detail: "积分 → 云币",         amount: "+50.00 云币",  pts: "-50,000 pts", time: "2024-09-01 08:10", status: "done"    },
  { id: "HIS-0002", merchant: "sb7829xz", type: "兑现提交",  detail: "云币 → USDT",          amount: "-200.00 云币", pts: "—",           time: "2024-09-01 09:05", status: "pending" },
  { id: "HIS-0003", merchant: "sb5512gh", type: "购买激活卡",detail: "卡密 SM-HHHH-1008",    amount: "-50,000 pts",  pts: "—",           time: "2024-09-01 10:18", status: "done"    },
  { id: "HIS-0004", merchant: "sb1920mg", type: "签到奖励",  detail: "Lv.2 × 128.40 × 0.5%",amount: "+0.6420 云币", pts: "—",           time: "2024-09-01 07:00", status: "done"    },
  { id: "HIS-0005", merchant: "sb0482kl", type: "订单结算",  detail: "ORD-20240901-0001",     amount: "+1,140 pts",   pts: "—",           time: "2024-09-01 11:00", status: "done"    },
  { id: "HIS-0006", merchant: "sb2241mp", type: "积分兑换",  detail: "积分 → 云币",           amount: "+80.00 云币",  pts: "-80,000 pts", time: "2024-09-01 11:30", status: "done"    },
  { id: "HIS-0007", merchant: "sb3371qw", type: "激活卡转让",detail: "→ sb0482kl",            amount: "SM-DDDD-1004", pts: "—",           time: "2024-09-01 12:00", status: "done"    },
  { id: "HIS-0008", merchant: "sb9934yr", type: "兑现提交",  detail: "云币 → USDT",          amount: "-12.80 云币",  pts: "—",           time: "2024-09-01 12:40", status: "pending" },
  { id: "HIS-0009", merchant: "sb5512gh", type: "订单结算",  detail: "ORD-20240901-0003",     amount: "+1,900 pts",   pts: "—",           time: "2024-09-01 13:30", status: "done"    },
  { id: "HIS-0010", merchant: "sb1920mg", type: "挂卖激活卡",detail: "卡密 SM-BBBB-1002",    amount: "上架",         pts: "—",           time: "2024-09-01 14:00", status: "done"    },
];

// Wallet: clean=unmodified, cs_auth=modified with tech password, tampered=modified without auth
// Code: valid=first use, reused=multiple devices, tampered=hash mismatch
const ADMIN_REDEMPTIONS = [
  {
    id: "RDM-20240901-001", merchant: "sb1920mg", yunbi: 50.00, usdt: 50.00,
    wallet: "TRCxxxxxxxxxxxxxxxx8821", walletStatus: "clean",
    activationCode: "SM-BBBB-1002", codeStatus: "valid",
    cardSource: "purchased", cardTx: "TX-20240312-001", cardPurchaseTime: "2024-03-12 10:00", cardPricePts: 50000, cardVerified: true,
    orders: [
      { id: "ORD-20240901-0001", domain: "ex***.com", purpose: "企业办公", hours: 8,  pts: 1200, settled: 1140, status: "completed" },
      { id: "ORD-20240901-0007", domain: "mi***.com", purpose: "Ad Network Delivery", hours: 16, pts: 2800, settled: 0,    status: "pending"   },
    ],
    ptsSummary: { fromOrders: 1140, total: 1140 },
    yunbiSources: [
      { type: "积分兑换",  amount: 30.00, pts: 30000, detail: "30,000 pts ÷ 1,000", verified: true },
      { type: "每日签到",  amount: 18.00, pts: 0,     detail: "30天 × 均0.6020",    verified: true },
      { type: "手动转入",  amount:  2.00, pts: 0,     detail: "2次转入合计",         verified: true },
    ],
    status: "pending", requestTime: "2024-09-01 08:20",
  },
  {
    id: "RDM-20240901-002", merchant: "sb7829xz", yunbi: 200.00, usdt: 200.00,
    wallet: "TRCxxxxxxxxxxxxxxxx2231", walletStatus: "cs_auth",
    activationCode: "SM-EEEE-1005", codeStatus: "valid",
    cardSource: "purchased", cardTx: "TX-20231105-002", cardPurchaseTime: "2023-11-05 09:00", cardPricePts: 50000, cardVerified: true,
    orders: [
      { id: "ORD-20240901-0002", domain: "ne***.io",  purpose: "数据抓取", hours: 24, pts: 3600, settled: 0,    status: "running"   },
      { id: "ORD-20240901-0003", domain: "ap***.net", purpose: "Ad Network Delivery", hours: 12, pts: 2000, settled: 1900, status: "completed" },
    ],
    ptsSummary: { fromOrders: 1900, total: 1900 },
    yunbiSources: [
      { type: "积分兑换", amount: 180.00, pts: 180000, detail: "180,000 pts ÷ 1,000", verified: true },
      { type: "每日签到", amount:  20.00, pts: 0,      detail: "45天 × 均0.4444",     verified: true },
    ],
    status: "approved", requestTime: "2024-09-01 09:05",
  },
  {
    id: "RDM-20240901-003", merchant: "sb5512gh", yunbi: 150.00, usdt: 150.00,
    wallet: "TRCxxxxxxxxxxxxxxxx3341", walletStatus: "clean",
    activationCode: "SM-HHHH-1008", codeStatus: "valid",
    cardSource: "purchased", cardTx: "TX-20230914-003", cardPurchaseTime: "2023-09-14 14:20", cardPricePts: 50000, cardVerified: true,
    orders: [
      { id: "ORD-20240901-0006", domain: "to***.co",  purpose: "数据抓取", hours: 8,  pts: 1400, settled: 1330, status: "completed" },
      { id: "ORD-20240901-0003", domain: "ap***.net", purpose: "Ad Network Delivery", hours: 12, pts: 2000, settled: 1900, status: "completed" },
    ],
    ptsSummary: { fromOrders: 3230, total: 3230 },
    yunbiSources: [
      { type: "积分兑换", amount: 130.00, pts: 130000, detail: "130,000 pts ÷ 1,000", verified: true },
      { type: "每日签到", amount:  20.00, pts: 0,      detail: "38天 × 均0.5263",     verified: true },
    ],
    status: "pending", requestTime: "2024-09-01 10:18",
  },
  {
    id: "RDM-20240901-004", merchant: "sb0482kl", yunbi: 20.00, usdt: 20.00,
    wallet: "TRCxxxxxxxxxxxxxxxx4421", walletStatus: "tampered",
    activationCode: "SM-CCCC-1003", codeStatus: "reused",
    cardSource: "transferred", cardTx: "TRF-20240520-001", cardPurchaseTime: "2024-05-20 11:00", cardPricePts: 0, cardVerified: false,
    orders: [
      { id: "ORD-20240901-0004", domain: "sh***.com", purpose: "SEO优化", hours: 6, pts: 800, settled: 0, status: "error" },
    ],
    ptsSummary: { fromOrders: 0, total: 0 },
    yunbiSources: [
      { type: "积分兑换", amount: 20.00, pts: 20000, detail: "20,000 pts ÷ 1,000", verified: false },
    ],
    status: "rejected", requestTime: "2024-09-01 11:00",
  },
  {
    id: "RDM-20240901-005", merchant: "sb2241mp", yunbi: 80.00, usdt: 80.00,
    wallet: "TRCxxxxxxxxxxxxxxxx9901", walletStatus: "clean",
    activationCode: "SM-FFFF-1006", codeStatus: "valid",
    cardSource: "purchased", cardTx: "TX-20240118-004", cardPurchaseTime: "2024-01-18 16:45", cardPricePts: 50000, cardVerified: true,
    orders: [
      { id: "ORD-20240901-0005", domain: "gl***.org", purpose: "企业办公", hours: 48, pts: 7200, settled: 0,    status: "running"   },
    ],
    ptsSummary: { fromOrders: 0, total: 0 },
    yunbiSources: [
      { type: "积分兑换", amount: 60.00, pts: 60000, detail: "60,000 pts ÷ 1,000", verified: true },
      { type: "每日签到", amount: 20.00, pts: 0,     detail: "28天 × 均0.7143",    verified: true },
    ],
    status: "pending", requestTime: "2024-09-01 12:40",
  },
];

const ADMIN_CARDS = [
  { code: "SM-AAAA-1001", status: "unused",   buyer: "—",        purchaseTime: "—",                activatedBy: "—",        expiry: "—" },
  { code: "SM-BBBB-1002", status: "active",   buyer: "sb1920mg", purchaseTime: "2024-03-12 10:00", activatedBy: "sb1920mg", expiry: "2025-03-12" },
  { code: "SM-CCCC-1003", status: "active",   buyer: "sb0482kl", purchaseTime: "2023-11-05 14:32", activatedBy: "sb0482kl", expiry: "2024-11-05" },
  { code: "SM-DDDD-1004", status: "expired",  buyer: "sb3371qw", purchaseTime: "2023-08-01 09:11", activatedBy: "sb3371qw", expiry: "2024-08-01" },
  { code: "SM-EEEE-1005", status: "active",   buyer: "sb7829xz", purchaseTime: "2023-11-05 09:00", activatedBy: "sb7829xz", expiry: "2025-11-05" },
  { code: "SM-FFFF-1006", status: "active",   buyer: "sb2241mp", purchaseTime: "2024-01-18 16:45", activatedBy: "sb2241mp", expiry: "2025-01-18" },
];

const ADMIN_LOGS = [
  { time: "2024-09-01 15:42", admin: "superadmin", action: "封禁商家",   target: "sb3371qw",         ip: "192.168.1.10" },
  { time: "2024-09-01 14:20", admin: "superadmin", action: "兑现审核通过",target: "RDM-20240901-002", ip: "192.168.1.10" },
  { time: "2024-09-01 13:05", admin: "superadmin", action: "修改汇率配置",target: "积分:云币 = 1000:1",ip: "192.168.1.10" },
  { time: "2024-09-01 11:30", admin: "superadmin", action: "生成激活卡",  target: "批量×20张",        ip: "192.168.1.10" },
  { time: "2024-09-01 10:00", admin: "superadmin", action: "发布公告",    target: "系统维护通知",     ip: "192.168.1.10" },
  { time: "2024-09-01 09:15", admin: "superadmin", action: "兑现审核拒绝",target: "RDM-20240901-004", ip: "192.168.1.10" },
  { time: "2024-09-01 08:40", admin: "superadmin", action: "强制结算订单",target: "ORD-20240901-0004",ip: "192.168.1.10" },
];

const ADMIN_NODES = [
  {
    id: "ND-001", contact: "张伟", email: "zw****@example.com",
    refCode: "SM-NODE-ZW01", level: "金牌节点",
    wallet: "TRCxxxxxxxxxxxxxxxx1001", walletStatus: "clean",
    merchants: ["sb1920mg", "sb7829xz"],
    merchantCount: 28, activeMerchants: 22,
    totalVolume: 4820000,   // total pts flowed through referred merchants
    totalYunbi: 9640.00,    // total yunbi converted by referred merchants
    commissionRate: 0.10,
    commissionEarned: 964.00,  // 10% of totalYunbi
    commissionPaid: 820.00,
    commissionPending: 144.00,
    joined: "2023-06-15", lastActive: "2分钟前", status: "active",
    commissionLog: [
      { month: "2024-08", amount: 88.40, status: "paid", settledAt: "2024-09-01" },
      { month: "2024-07", amount: 102.20, status: "paid", settledAt: "2024-08-01" },
      { month: "2024-06", amount: 144.00, status: "pending", settledAt: "" },
    ],
  },
  {
    id: "ND-002", contact: "李明", email: "lm****@example.com",
    refCode: "SM-NODE-LM02", level: "银牌节点",
    wallet: "TRCxxxxxxxxxxxxxxxx2002", walletStatus: "clean",
    merchants: ["sb5512gh"],
    merchantCount: 14, activeMerchants: 10,
    totalVolume: 2340000,
    totalYunbi: 4680.00,
    commissionRate: 0.10,
    commissionEarned: 468.00,
    commissionPaid: 380.00,
    commissionPending: 88.00,
    joined: "2023-09-20", lastActive: "1小时前", status: "active",
    commissionLog: [
      { month: "2024-08", amount: 42.00, status: "paid", settledAt: "2024-09-01" },
      { month: "2024-07", amount: 46.00, status: "paid", settledAt: "2024-08-01" },
      { month: "2024-06", amount: 88.00, status: "pending", settledAt: "" },
    ],
  },
  {
    id: "ND-003", contact: "王芳", email: "wf****@example.com",
    refCode: "SM-NODE-WF03", level: "普通节点",
    wallet: "TRCxxxxxxxxxxxxxxxx3003", walletStatus: "cs_auth",
    merchants: ["sb2241mp", "sb0482kl"],
    merchantCount: 7, activeMerchants: 4,
    totalVolume: 980000,
    totalYunbi: 1960.00,
    commissionRate: 0.10,
    commissionEarned: 196.00,
    commissionPaid: 140.00,
    commissionPending: 56.00,
    joined: "2024-01-10", lastActive: "3天前", status: "active",
    commissionLog: [
      { month: "2024-08", amount: 24.00, status: "paid", settledAt: "2024-09-01" },
      { month: "2024-07", amount: 32.00, status: "paid", settledAt: "2024-08-01" },
      { month: "2024-06", amount: 56.00, status: "pending", settledAt: "" },
    ],
  },
  {
    id: "ND-004", contact: "陈强", email: "cq****@example.com",
    refCode: "SM-NODE-CQ04", level: "普通节点",
    wallet: "TRCxxxxxxxxxxxxxxxx4004", walletStatus: "clean",
    merchants: [],
    merchantCount: 2, activeMerchants: 0,
    totalVolume: 180000,
    totalYunbi: 360.00,
    commissionRate: 0.10,
    commissionEarned: 36.00,
    commissionPaid: 36.00,
    commissionPending: 0.00,
    joined: "2024-03-28", lastActive: "2周前", status: "inactive",
    commissionLog: [
      { month: "2024-05", amount: 36.00, status: "paid", settledAt: "2024-06-01" },
    ],
  },
];

/* ── Sparkline helper ── */
function Sparkline({ data, color = C.yellow, height = 36 }: { data: number[]; color?: string; height?: number }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const w = 120, h = height, pad = 2;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity=".8" />
      <polyline points={`${pad},${h} ${pts} ${w - pad},${h}`} fill={color} fillOpacity=".08" stroke="none" />
    </svg>
  );
}

/* ── Admin KPI card ── */
function AdminKPI({ label, value, sub, accent, spark }: { label: string; value: string; sub: string; accent?: string; spark: number[] }) {
  const sparkColor = accent ?? C.dark;
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: .5 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: C.dark, fontFamily: F.mono, letterSpacing: -.5 }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted }}>{sub}</div>
      <div style={{ marginTop: 4 }}><Sparkline data={spark} color={sparkColor} /></div>
    </div>
  );
}

/* ── Admin status badge ── */
function AdminBadge({ status }: { status: string }) {
  const cfg: Record<string, [string, string]> = {
    active:    [C.green,   "#F0FDF4"],
    inactive:  [C.muted,   "#F5F5F5"],
    banned:    [C.red,     "#FFF5F5"],
    running:   [C.green,   "#F0FDF4"],
    completed: ["#374151", "#F1F5F9"],
    pending:   [C.orange,  "#FFF7ED"],
    error:     [C.red,     "#FFF5F5"],
    approved:  [C.green,   "#F0FDF4"],
    rejected:  [C.red,     "#FFF5F5"],
    unused:    [C.muted,   "#F5F5F5"],
    listed:    [C.orange,  "#FFF7ED"],
    expired:   ["#374151", "#F1F5F9"],
    done:      [C.green,   "#F0FDF4"],
  };
  const [fg, bg] = cfg[status] ?? [C.muted, "#F5F5F5"];
  const labels: Record<string, string> = {
    active: "正常", inactive: "未活跃", banned: "已封禁",
    running: "进行中", completed: "已完成", pending: "待处理",
    error: "异常", approved: "已通过", rejected: "已拒绝",
    unused: "未使用", listed: "挂卖中", expired: "已过期", done: "已完成",
  };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: bg, color: fg, border: `1px solid ${fg}33` }}>
      {labels[status] ?? status}
    </span>
  );
}

/* ── Admin section title ── */
function AdminTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 3, height: 16, borderRadius: 2, background: C.yellow, flexShrink: 0 }} />
        <div style={{ fontSize: 15, fontWeight: 800, color: C.dark }}>{children}</div>
      </div>
      {action && <div style={{ marginLeft: "auto" }}>{action}</div>}
    </div>
  );
}

/* ── Admin table wrapper ── */
function AdminTable({ heads, children }: { heads: string[]; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#F7F8FA", borderBottom: `1px solid ${C.border}` }}>
            {heads.map((h) => (
              <th key={h} style={{ padding: "9px 14px", fontWeight: 600, color: C.muted, fontSize: 11, textAlign: "left" as const, whiteSpace: "nowrap" as const, letterSpacing: .3 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/* ── Reusable inline action button ── */
function ABtn({ children, onClick, variant = "ghost" }: { children: React.ReactNode; onClick?: () => void; variant?: "ghost" | "danger" | "success" | "primary" }) {
  const styles: Record<string, React.CSSProperties> = {
    ghost:   { background: "#F7F8FA", border: `1px solid ${C.border}`, color: C.dark },
    danger:  { background: "#FFF5F5", border: "none", color: C.red },
    success: { background: "#F0FDF4", border: "none", color: C.green },
    primary: { background: C.dark,    border: "none", color: "#fff" },
  };
  return (
    <button onClick={onClick} style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: F.cn, ...styles[variant] }}>
      {children}
    </button>
  );
}

/* ── Admin page wrapper ── */
function AdminPage({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "24px 28px", fontFamily: F.cn, fontSize: 13, color: C.dark, overflowY: "auto" as const, height: "100%" }}>{children}</div>;
}

/* ═══════════════════════════════════════════════════════════
   ADMIN PAGES
══════════════════════════════════════════════════════════════ */

function AdminDashboardPage() {
  const StatTile = ({ label, value, unit = "", sub }: { label: string; value: string | number; unit?: string; sub?: string }) => (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", minWidth: 0 }}>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 3, letterSpacing: .3, whiteSpace: "nowrap" as const }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 900, fontFamily: F.mono, color: C.dark, lineHeight: 1.1 }}>
        {value}<span style={{ fontSize: 10, fontWeight: 500, color: C.muted }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );

  const Section = ({ title, cols, children }: { title: string; cols: number; children: React.ReactNode }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 3, height: 13, borderRadius: 2, background: C.yellow, flexShrink: 0 }} />
        <div style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>{title}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>{children}</div>
    </div>
  );

  const pendingWd = ADMIN_REDEMPTIONS.filter(r => r.status === "pending");

  return (
    <AdminPage>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: C.yellow }} />
          <div style={{ fontSize: 15, fontWeight: 800, color: C.dark }}>数据总台</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: C.muted, fontFamily: F.mono }}>版本 09011617 · 实时更新</div>
      </div>

      {/* ── 顶部快捷数字 ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <AdminKPI label="注册商家" value="1,284" sub="+32 本月新增" spark={[820,910,780,1040,960,1120,1284]} />
        <AdminKPI label="今日任务量" value="3,640" sub="+820 较昨日" spark={[4200,3800,5100,4700,6200,5800,6640]} />
        <AdminKPI label="待审兑现" value={`${pendingWd.length}`} sub={`合计 ${pendingWd.reduce((s,r)=>s+r.yunbi,0).toFixed(0)} USDT`} spark={[1,2,4,3,5,3,pendingWd.length]} accent={pendingWd.length > 0 ? C.orange : C.green} />
        <AdminKPI label="风险事件" value={`${ADMIN_RISK_EVENTS.filter(e=>e.status==="frozen"||e.status==="reviewing").length}`} sub="需人工处理" spark={[0,1,2,1,3,2,2]} accent={C.red} />
        <AdminKPI label="在线终端占比" value="66%" sub="847 / 1,284 在线" spark={[30,42,38,55,61,58,66]} accent={C.green} />
      </div>

      {/* ── 终端状态 ── */}
      <Section title="终端状态" cols={6}>
        <StatTile label="在线台数" value="847" sub="当前" />
        <StatTile label="已激活台数" value="1,284" sub="累计" />
        <StatTile label="付费在线" value="621" sub="付费终端" />
        <StatTile label="免费在线" value="226" sub="免费终端" />
        <StatTile label="自动在线" value="710" sub="自动模式" />
        <StatTile label="手动在线" value="137" sub="手动模式" />
      </Section>

      {/* ── 资金流水 ── */}
      <Section title="资金流水（USDT）" cols={6}>
        <StatTile label="今日入金" value="2,840.00" unit=" U" sub="今日" />
        <StatTile label="累计入金" value="482,300.00" unit=" U" sub="历史总计" />
        <StatTile label="1号申请出金" value="12,480.00" unit=" U" sub="本次待打" />
        <StatTile label="15号申请出金" value="8,920.00" unit=" U" sub="下次待打" />
        <StatTile label="本月累计出金" value="38,200.00" unit=" U" sub="本月已打" />
        <StatTile label="历史累计出金" value="210,640.00" unit=" U" sub="全部已打" />
      </Section>

      {/* ── 激活卡 ── */}
      <Section title="激活卡（张）" cols={8}>
        <StatTile label="总激活卡数" value="3,820" />
        <StatTile label="已售出" value="2,184" sub="含已激活" />
        <StatTile label="售出未激活" value="318" sub="待激活" />
        <StatTile label="奖励卡总数" value="624" sub="各类赠予" />
        <StatTile label="奖励-手工赠予" value="212" />
        <StatTile label="奖励-兑换抽奖" value="180" />
        <StatTile label="奖励-积分抽奖" value="148" />
        <StatTile label="奖励-服务商" value="84" />
      </Section>

      {/* ── 积分流通 ── */}
      <Section title="积分流通（pts）" cols={7}>
        <StatTile label="今日静态产出" value="482,300" />
        <StatTile label="累计静态产出" value="28,420,000" />
        <StatTile label="今日动态产出" value="183,400" sub="服务商" />
        <StatTile label="累计动态产出" value="9,840,000" sub="服务商" />
        <StatTile label="沉淀积分(不可提)" value="1,284,000" sub="≥1000pt门槛" />
        <StatTile label="下期可提现积分" value="3,620,000" sub="已可提" />
        <StatTile label="累计总产出" value="38,260,000" />
      </Section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 3, height: 13, borderRadius: 2, background: C.yellow }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>积分消耗去向</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <StatTile label="积分兑换云币" value="18,400,000" sub="→ 云币" />
            <StatTile label="积分兑换卡" value="3,250,000" sub="→ 激活卡" />
            <StatTile label="参与抽奖" value="4,820,000" sub="→ 抽奖池" />
            <StatTile label="其余沉淀" value="11,790,000" sub="账户余额" />
          </div>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 3, height: 13, borderRadius: 2, background: C.yellow }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>云币（USDT等值）</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <StatTile label="积分兑换未提币" value="4,280.00" unit=" U" />
            <StatTile label="累计总产币" value="210,640.00" unit=" U" />
            <StatTile label="兑换卡消耗" value="3,250.00" unit=" U" />
            <StatTile label="累计已提币" value="182,320.00" unit=" U" />
          </div>
        </div>
      </div>

      {/* ── 抽奖 ── */}
      <Section title="抽奖统计" cols={5}>
        <StatTile label="累计参与积分" value="4,820,000" sub="pts 投入" />
        <StatTile label="实际中奖率" value={`${ADMIN_PARAMS_GLOBAL.lotteryWinRate}%`} sub={`对外显示 ${ADMIN_PARAMS_GLOBAL.lotteryDisplayRate}%`} />
        <StatTile label="累计中奖次数" value="2,184" sub="次" />
        <StatTile label="累计中奖金额" value="43,680" unit=" pts" />
        <StatTile label="平台抽水" value="4,368" unit=" pts" sub={`${ADMIN_PARAMS_GLOBAL.lotteryCut}% 佣金`} />
      </Section>

      {/* ── 快捷表格 ── */}
      <AdminTitle action={
        <span style={{ fontSize: 11, color: C.muted }}>最近 5 条</span>
      }>最新订单</AdminTitle>
      <div style={{ marginBottom: 18 }}>
        <AdminTable heads={["订单编号", "商家", "用途", "积分", "断线", "状态", "时间"]}>
          {ADMIN_ORDERS.slice(0, 5).map((o, i) => (
            <tr key={o.id} style={{ borderBottom: "1px solid #F0F0F0", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
              <td style={{ padding: "8px 12px", fontFamily: F.mono, fontSize: 11, color: C.muted }}>{o.id.slice(-8)}</td>
              <td style={{ padding: "8px 12px", fontWeight: 700, fontSize: 12 }}>{o.merchant}</td>
              <td style={{ padding: "8px 12px", color: C.muted, fontSize: 12 }}>{o.purpose}</td>
              <td style={{ padding: "8px 12px", fontFamily: F.mono, fontWeight: 600 }}>{o.pts.toLocaleString()}</td>
              <td style={{ padding: "8px 12px" }}>
                {o.disconnectedAt
                  ? <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: o.disconnectedH >= 24 ? C.red+"18" : "#FFF7ED", color: o.disconnectedH >= 24 ? C.red : C.orange }}>{o.disconnectedH >= 24 ? `断线${Math.floor(o.disconnectedH)}h` : `断线${o.disconnectedH}h`}</span>
                  : <span style={{ fontSize: 10, color: C.muted }}>—</span>
                }
              </td>
              <td style={{ padding: "8px 12px" }}><AdminBadge status={o.status} /></td>
              <td style={{ padding: "8px 12px", fontSize: 11, color: C.muted }}>{o.time.slice(11)}</td>
            </tr>
          ))}
        </AdminTable>
      </div>

      <AdminTitle>风险预警</AdminTitle>
      <AdminTable heads={["时间", "商家", "类型", "风险分", "状态"]}>
        {ADMIN_RISK_EVENTS.filter(e => e.status !== "cleared").slice(0, 4).map((e, i) => (
          <tr key={e.id} style={{ borderBottom: "1px solid #F0F0F0", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
            <td style={{ padding: "8px 12px", fontSize: 11, color: C.muted, fontFamily: F.mono }}>{e.time.slice(11)}</td>
            <td style={{ padding: "8px 12px", fontWeight: 700, fontSize: 12 }}>{e.merchant}</td>
            <td style={{ padding: "8px 12px", fontSize: 12 }}>{e.type}</td>
            <td style={{ padding: "8px 12px", fontFamily: F.mono, fontWeight: 700, color: e.score >= 80 ? C.red : e.score >= 60 ? C.orange : C.muted }}>{e.score}</td>
            <td style={{ padding: "8px 12px" }}><AdminBadge status={e.status === "frozen" ? "banned" : e.status === "reviewing" ? "pending" : "active"} /></td>
          </tr>
        ))}
      </AdminTable>
    </AdminPage>
  );
}

function AdminMerchantsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [confirmBan, setConfirmBan] = useState<string | null>(null);
  const [detail, setDetail] = useState<typeof ADMIN_MERCHANTS[0] | null>(null);
  const [detailTab, setDetailTab] = useState<"info" | "params">("info");

  const filtered = ADMIN_MERCHANTS.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = m.id.includes(q) || m.name.includes(q) || m.email.includes(q);
    const matchStatus = filterStatus === "all" || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const lvBg  = (l: string) => l === "铂金" ? "#FFF7ED" : l === "黄金" ? "#FEFCE8" : "#F5F5F5";
  const lvFg  = (l: string) => l === "铂金" ? C.orange  : l === "黄金" ? "#92400E" : C.muted;

  return (
    <AdminPage>
      <AdminTitle action={
        <div style={{ display: "flex", gap: 8 }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索账号 / 姓名 / 邮箱…" style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", width: 200 }} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: "none" }}>
            <option value="all">全部状态</option>
            <option value="active">正常</option>
            <option value="inactive">未活跃</option>
            <option value="banned">已封禁</option>
          </select>
          <button style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: C.dark, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>导出 CSV</button>
        </div>
      }>商家管理</AdminTitle>

      <AdminTable heads={["账号ID", "邮箱", "等级", "设备", "积分余额", "待结算", "已结算", "云币", "接单", "到期日", "状态", "操作"]}>
        {filtered.map((m, i) => (
          <tr key={m.id} style={{ borderBottom: "1px solid #F0F0F0", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
            <td style={{ padding: "9px 12px", fontFamily: F.mono, fontWeight: 700, fontSize: 12 }}>{m.id}</td>
            <td style={{ padding: "9px 12px", fontSize: 12, color: C.muted }}>{m.email}</td>
            <td style={{ padding: "9px 12px" }}><span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: lvBg(m.level), color: lvFg(m.level) }}>{m.level}</span></td>
            <td style={{ padding: "9px 12px", textAlign: "center" as const, fontFamily: F.mono, fontSize: 12 }}>{m.usedSlots}/{m.maxSlots}</td>
            <td style={{ padding: "9px 12px", fontFamily: F.mono, color: C.dark, fontSize: 12, fontWeight: 600 }}>{m.points.toLocaleString()}</td>
            <td style={{ padding: "9px 12px", fontFamily: F.mono, color: C.muted, fontSize: 12 }}>{m.pendingPts.toLocaleString()}</td>
            <td style={{ padding: "9px 12px", fontFamily: F.mono, color: C.dark, fontSize: 12 }}>{m.settledPts.toLocaleString()}</td>
            <td style={{ padding: "9px 12px", fontFamily: F.mono, fontSize: 12 }}>{m.yunbi.toFixed(2)}</td>
            <td style={{ padding: "9px 12px", textAlign: "center" as const, fontSize: 12 }}>{m.currentOrders}</td>
            <td style={{ padding: "9px 12px", fontSize: 11, color: m.expiry < "2025-12-31" ? C.red : C.muted }}>{m.expiry}</td>
            <td style={{ padding: "9px 12px" }}><AdminBadge status={m.status} /></td>
            <td style={{ padding: "9px 12px" }}>
              <div style={{ display: "flex", gap: 5 }}>
                <ABtn onClick={() => setDetail(m)}>详情</ABtn>
                {m.status !== "banned"
                  ? <ABtn onClick={() => setConfirmBan(m.id)} variant="danger">封禁</ABtn>
                  : <ABtn variant="success">解封</ABtn>
                }
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      {/* Detail modal */}
      {detail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setDetail(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#F4F5F7", borderRadius: 14, width: 560, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.25)" }}>
            {/* Header */}
            <div style={{ background: C.dark, padding: "16px 22px", borderRadius: "14px 14px 0 0", display: "flex", alignItems: "center", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 800, color: "#fff", fontSize: 14 }}>{detail.id}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{detail.email}</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                <AdminBadge status={detail.status} />
                <button onClick={() => { setDetail(null); setDetailTab("info"); }} style={{ background: "rgba(255,255,255,.08)", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer", width: 28, height: 28, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            {/* Tabs */}
            <div style={{ display: "flex", background: "#fff", borderBottom: `1px solid ${C.border}` }}>
              {(["info", "params"] as const).map(t => (
                <button key={t} onClick={() => setDetailTab(t)} style={{ padding: "10px 20px", border: "none", background: "transparent", fontSize: 12, fontWeight: detailTab === t ? 700 : 400, color: detailTab === t ? C.dark : C.muted, borderBottom: detailTab === t ? `2px solid ${C.yellow}` : "2px solid transparent", cursor: "pointer", fontFamily: F.cn }}>
                  {t === "info" ? "账号信息" : "产值参数"}
                </button>
              ))}
            </div>
            <div style={{ padding: "18px 22px" }}>
              {detailTab === "info" && (<>
                <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 16px", marginBottom: 12 }}>
                  {[
                    ["邮箱", detail.email],
                    ["会员等级", detail.level],
                    ["激活卡", detail.activationCode],
                    ["绑定钱包", detail.wallet || "未绑定"],
                    ["钱包状态", detail.walletModified ? "有修改记录" : "未修改"],
                    ["设备槽位", `${detail.usedSlots} / ${detail.maxSlots}`],
                    ["当前接单", `${detail.currentOrders} 单`],
                    ["积分余额", detail.points.toLocaleString()],
                    ["待结算积分", detail.pendingPts.toLocaleString()],
                    ["已结算积分", detail.settledPts.toLocaleString()],
                    ["云币余额", detail.yunbi.toFixed(4)],
                    ["注册日期", detail.joined],
                    ["激活到期", detail.expiry],
                    ["最后活跃", detail.lastSeen],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", padding: "7px 0", borderBottom: `1px solid #F3F4F6`, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: C.muted, width: 90, flexShrink: 0 }}>{k}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: k === "钱包状态" && detail.walletModified ? C.red : C.dark, fontFamily: k.includes("卡") || k.includes("钱包") ? F.mono : "inherit" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ flex: 1, padding: "8px 0", borderRadius: 7, border: `1px solid ${C.border}`, background: "#F7F8FA", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: F.cn, color: C.dark }}>查看历史记录</button>
                  {detail.status !== "banned"
                    ? <button onClick={() => { setConfirmBan(detail.id); setDetail(null); }} style={{ flex: 1, padding: "8px 0", borderRadius: 7, border: "none", background: "#FFF5F5", color: C.red, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>封禁账户</button>
                    : <button style={{ flex: 1, padding: "8px 0", borderRadius: 7, border: "none", background: "#F0FDF4", color: C.green, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>解封账户</button>
                  }
                </div>
              </>)}

              {detailTab === "params" && (() => {
                const ov = ADMIN_PARAM_OVERRIDES.find(o => o.targetType === "user" && o.targetId === detail.id);
                const G = ADMIN_PARAMS_GLOBAL;
                return (
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
                    <div style={{ fontSize: 11, color: C.muted, background: "#F7F8FA", border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 12px" }}>
                      以下参数为该商家的个性化覆盖配置。留空或不设定则沿用全局默认值。
                    </div>

                    {ov && (
                      <div style={{ background: ov.staticOn && ov.dynamicOn ? "#F0FDF4" : "#FFF5F5", border: `1px solid ${ov.staticOn && ov.dynamicOn ? C.green : C.red}33`, borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
                        <div style={{ fontWeight: 700, color: ov.staticOn && ov.dynamicOn ? C.green : C.red, marginBottom: 4 }}>
                          {ov.staticOn && ov.dynamicOn ? "有效覆盖配置" : ov.staticOn || ov.dynamicOn ? "部分功能已停用" : "静态 + 动态均已停用"}
                        </div>
                        <div style={{ color: C.muted }}>原因：{ov.reason} · 设置于 {ov.updatedAt} by {ov.updatedBy}</div>
                      </div>
                    )}

                    <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                      {[
                        { label: "静态产值倍率", key: "staticMult", cur: ov?.staticMult, def: G.staticMultiplier, unit: "×" },
                        { label: "动态产值倍率", key: "dynamicMult", cur: ov?.dynamicMult, def: 1.0, unit: "×" },
                        { label: "抽奖中奖率",   key: "winRate",    cur: ov?.winRate,    def: G.lotteryWinRate, unit: "%" },
                      ].map((row, ri) => (
                        <div key={row.key} style={{ display: "flex", alignItems: "center", padding: "11px 14px", borderBottom: ri < 2 ? `1px solid ${C.border}` : "none", gap: 12 }}>
                          <div style={{ flex: 1, fontSize: 13, color: C.dark }}>{row.label}</div>
                          <div style={{ fontSize: 11, color: C.muted, fontFamily: F.mono }}>默认 {row.unit}{row.def}</div>
                          <input
                            type="number" step="0.01"
                            defaultValue={row.cur !== null && row.cur !== undefined ? row.cur : ""}
                            placeholder={`${row.def}`}
                            style={{ width: 80, padding: "5px 8px", border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 13, fontFamily: F.mono, outline: "none", textAlign: "right" as const }}
                          />
                          <span style={{ fontSize: 12, color: C.muted, width: 14 }}>{row.unit}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 16px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginBottom: 10 }}>功能开关</div>
                      {[
                        { label: "静态产值", key: "staticOn",  val: ov?.staticOn  ?? true },
                        { label: "动态产值", key: "dynamicOn", val: ov?.dynamicOn ?? true },
                      ].map(sw => (
                        <div key={sw.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: 13, color: C.dark }}>{sw.label}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 11, color: sw.val ? C.green : C.red, fontWeight: 600 }}>{sw.val ? "开启" : "已停"}</span>
                            <div style={{ width: 36, height: 20, borderRadius: 10, background: sw.val ? C.dark : "#D1D5DB", cursor: "pointer", position: "relative" as const }}>
                              <div style={{ position: "absolute" as const, top: 3, left: sw.val ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff" }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div style={{ fontSize: 12, color: C.muted, marginBottom: 5 }}>备注 / 原因</div>
                      <textarea defaultValue={ov?.reason ?? ""} placeholder="填写调整原因（将记录至操作日志）" style={{ width: "100%", boxSizing: "border-box" as const, height: 64, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 10px", fontSize: 12, fontFamily: F.cn, resize: "none" as const, outline: "none" }} />
                    </div>
                    <button style={{ width: "100%", padding: "10px 0", borderRadius: 7, border: "none", background: C.dark, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>保存参数覆盖</button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Ban confirm */}
      {confirmBan && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setConfirmBan(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, padding: "28px 32px", width: 360, boxShadow: "0 24px 64px rgba(0,0,0,.18)" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.dark, marginBottom: 8 }}>确认封禁</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 22 }}>封禁商家 <strong>{confirmBan}</strong> 后，该账户将无法登录和接单，可撤销。</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmBan(null)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>取消</button>
              <button onClick={() => setConfirmBan(null)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: C.red, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>确认封禁</button>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}

function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMerchant, setFilterMerchant] = useState("all");

  const filtered = ADMIN_ORDERS.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = o.id.includes(q) || o.merchant.includes(q) || o.purpose.includes(q) || o.domain.includes(q);
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const matchMerchant = filterMerchant === "all" || o.merchant === filterMerchant;
    return matchSearch && matchStatus && matchMerchant;
  });

  const refundColor = (r: string) => parseFloat(r) === 0 ? C.green : parseFloat(r) > 5 ? C.red : C.orange;

  return (
    <AdminPage>
      <AdminTitle action={
        <div style={{ display: "flex", gap: 8 }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索订单号 / 商家 / 域名…" style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", width: 200 }} />
          <select value={filterMerchant} onChange={(e) => setFilterMerchant(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: "none" }}>
            <option value="all">全部商家</option>
            {ADMIN_MERCHANTS.map(m => <option key={m.id} value={m.id}>{m.id}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: "none" }}>
            <option value="all">全部状态</option>
            <option value="running">进行中</option>
            <option value="completed">已完成</option>
            <option value="pending">待接单</option>
            <option value="error">异常</option>
          </select>
          <button style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: C.dark, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>导出 CSV</button>
        </div>
      }>订单管理</AdminTitle>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { label: "全部",   value: ADMIN_ORDERS.length },
          { label: "进行中", value: ADMIN_ORDERS.filter(o => o.status === "running").length },
          { label: "已完成", value: ADMIN_ORDERS.filter(o => o.status === "completed").length },
          { label: "待处理", value: ADMIN_ORDERS.filter(o => o.status === "pending").length },
          { label: "异常",   value: ADMIN_ORDERS.filter(o => o.status === "error").length },
          { label: "总积分", value: ADMIN_ORDERS.reduce((s,o) => s+o.pts,0).toLocaleString() },
          { label: "已结算", value: ADMIN_ORDERS.reduce((s,o) => s+o.settled,0).toLocaleString() },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 3, letterSpacing: .3 }}>{s.label}</div>
            <div style={{ fontSize: 15, fontWeight: 900, fontFamily: F.mono, color: C.dark }}>{s.value}</div>
          </div>
        ))}
      </div>

      <AdminTable heads={["订单编号", "商家ID", "终端", "域名", "用途", "时长(h)", "出价积分", "延迟率", "已结算", "状态", "断线", "时间", "操作"]}>
        {filtered.map((o, i) => (
          <tr key={o.id} style={{ borderBottom: "1px solid #F0F0F0", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
            <td style={{ padding: "9px 12px", fontFamily: F.mono, fontSize: 11, color: C.muted }}>{o.id}</td>
            <td style={{ padding: "9px 12px", fontWeight: 700, fontSize: 12 }}>{o.merchant}</td>
            <td style={{ padding: "9px 12px", fontSize: 11, color: C.muted }}>{o.terminalId}</td>
            <td style={{ padding: "9px 12px", fontFamily: F.mono, fontSize: 12 }}>{o.domain}</td>
            <td style={{ padding: "9px 12px", color: C.muted, fontSize: 12 }}>{o.purpose}</td>
            <td style={{ padding: "9px 12px", textAlign: "center" as const, fontFamily: F.mono, fontSize: 12 }}>{o.hours}</td>
            <td style={{ padding: "9px 12px", fontFamily: F.mono, fontWeight: 600, color: C.dark, fontSize: 12 }}>{o.pts.toLocaleString()}</td>
            <td style={{ padding: "9px 12px", textAlign: "center" as const, fontWeight: 600, fontSize: 12, color: refundColor(o.refund) }}>{o.refund}</td>
            <td style={{ padding: "9px 12px", fontFamily: F.mono, fontSize: 12, color: o.settled > 0 ? C.dark : C.muted }}>{o.settled > 0 ? o.settled.toLocaleString() : "—"}</td>
            <td style={{ padding: "9px 12px" }}><AdminBadge status={o.status} /></td>
            <td style={{ padding: "9px 12px" }}>
              {o.disconnectedAt
                ? <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: o.disconnectedH >= 24 ? C.red+"18" : "#FFF7ED", color: o.disconnectedH >= 24 ? C.red : C.orange, whiteSpace: "nowrap" as const }}>
                    {o.disconnectedH >= 24 ? `断线24h+ (${o.disconnectedH}h)` : `断线 ${o.disconnectedH}h`}
                  </span>
                : <span style={{ color: C.muted, fontSize: 11 }}>—</span>}
            </td>
            <td style={{ padding: "9px 12px", fontSize: 11, color: C.muted }}>{o.time}</td>
            <td style={{ padding: "9px 12px" }}>
              <div style={{ display: "flex", gap: 5 }}>
                <ABtn>详情</ABtn>
                {o.status === "error" && <ABtn variant="danger">强制结算</ABtn>}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </AdminPage>
  );
}

function AdminHistoryPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterMerchant, setFilterMerchant] = useState("all");

  const types = [...new Set(ADMIN_HISTORY.map(h => h.type))];
  const filtered = ADMIN_HISTORY.filter((h) => {
    const q = search.toLowerCase();
    const matchQ = h.id.includes(q) || h.merchant.includes(q) || h.detail.includes(q);
    const matchType = filterType === "all" || h.type === filterType;
    const matchM = filterMerchant === "all" || h.merchant === filterMerchant;
    return matchQ && matchType && matchM;
  });

  const typeBg: Record<string,string> = {
    "积分兑换":"#FEFCE8","兑现提交":"#FFF7ED","购买激活卡":"#F0FDF4",
    "签到奖励":"#F0FDF4","订单结算":"#F0FDF4","激活卡转让":"#F5F5F5","挂卖激活卡":"#F5F5F5",
  };
  const typeFg: Record<string,string> = {
    "积分兑换":"#92400E","兑现提交":C.orange,"购买激活卡":C.green,
    "签到奖励":C.green,"订单结算":C.green,"激活卡转让":C.muted,"挂卖激活卡":C.muted,
  };

  return (
    <AdminPage>
      <AdminTitle action={
        <div style={{ display: "flex", gap: 8 }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索记录…" style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", width: 180 }} />
          <select value={filterMerchant} onChange={(e) => setFilterMerchant(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: "none" }}>
            <option value="all">全部商家</option>
            {ADMIN_MERCHANTS.map(m => <option key={m.id} value={m.id}>{m.id}</option>)}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: "none" }}>
            <option value="all">全部类型</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: C.dark, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>导出 CSV</button>
        </div>
      }>全平台历史记录</AdminTitle>

      <AdminTable heads={["记录ID", "商家ID", "类型", "详情", "变动金额", "积分变动", "时间", "状态"]}>
        {filtered.map((h, i) => (
          <tr key={h.id} style={{ borderBottom: "1px solid #F0F0F0", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
            <td style={{ padding: "10px 12px", fontFamily: F.mono, fontSize: 11, color: C.muted }}>{h.id}</td>
            <td style={{ padding: "10px 12px", fontWeight: 700, fontSize: 12 }}>{h.merchant}</td>
            <td style={{ padding: "10px 12px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: typeBg[h.type] ?? "#F5F5F5", color: typeFg[h.type] ?? C.muted }}>{h.type}</span>
            </td>
            <td style={{ padding: "10px 12px", fontSize: 12, color: C.muted }}>{h.detail}</td>
            <td style={{ padding: "10px 12px", fontFamily: F.mono, fontSize: 12, fontWeight: 700, color: h.amount.startsWith("+") ? C.green : h.amount.startsWith("-") ? C.red : C.dark }}>{h.amount}</td>
            <td style={{ padding: "10px 12px", fontFamily: F.mono, fontSize: 12, color: h.pts.startsWith("-") ? C.red : C.muted }}>{h.pts}</td>
            <td style={{ padding: "10px 12px", fontSize: 11, color: C.muted }}>{h.time}</td>
            <td style={{ padding: "10px 12px" }}><AdminBadge status={h.status} /></td>
          </tr>
        ))}
      </AdminTable>
    </AdminPage>
  );
}

function AdminRedemptionsPage() {
  const [ledger, setLedger] = useState<typeof ADMIN_REDEMPTIONS[0] | null>(null);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [verifyPwd, setVerifyPwd] = useState("");
  const [statuses, setStatuses] = useState<Record<string,string>>({});

  const act = (id: string, action: "approved"|"rejected") => setStatuses(s => ({ ...s, [id]: action }));
  const effective = ADMIN_REDEMPTIONS.map(r => ({ ...r, status: statuses[r.id] ?? r.status }));
  const pending = effective.filter(r => r.status === "pending");

  const toggleExpand = (i: number) => setExpanded(e => e.includes(i) ? e.filter(x => x !== i) : [...e, i]);

  const walletLabel: Record<string,string> = { clean: "✓ 未修改", cs_auth: "⚠ 客服授权改绑（已验密）", tampered: "✕ 未授权修改" };
  const walletColor: Record<string,string> = { clean: C.green, cs_auth: C.orange, tampered: C.red };
  const codeLabel:   Record<string,string> = { valid: "✓ 正常（首次使用）", reused: "✕ 重复使用", tampered: "✕ 哈希异常" };
  const codeColor:   Record<string,string> = { valid: C.green, reused: C.red, tampered: C.red };

  const overallPass = (r: typeof ADMIN_REDEMPTIONS[0]) =>
    r.walletStatus === "clean" && r.codeStatus === "valid" && r.cardVerified &&
    r.yunbiSources.every(s => s.verified);

  return (
    <AdminPage>
      <AdminTitle>兑现管理 <span style={{ fontSize: 12, color: C.muted, fontWeight: 400 }}>（云币 → USDT）</span></AdminTitle>

      {/* Summary */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { label: "待审核",    value: pending.length,                                        unit: "笔" },
          { label: "待审金额",  value: pending.reduce((s,r) => s+r.yunbi, 0).toFixed(2),     unit: " USDT" },
          { label: "今日已通过", value: effective.filter(r=>r.status==="approved").length,    unit: "笔" },
          { label: "今日拒绝",  value: effective.filter(r=>r.status==="rejected").length,     unit: "笔" },
          { label: "风险标记",  value: effective.filter(r=>!overallPass(r)).length,           unit: "笔" },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, letterSpacing: .3 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: F.mono, color: C.dark }}>{s.value}<span style={{ fontSize: 11, fontWeight: 500, color: C.muted }}>{s.unit}</span></div>
          </div>
        ))}
      </div>

      <AdminTable heads={["申请编号", "商家ID", "申请金额", "钱包地址", "激活码", "卡来源", "风险", "状态", "申请时间", "操作"]}>
        {effective.map((r, i) => {
          const pass = overallPass(r);
          return (
            <tr key={r.id} style={{ borderBottom: "1px solid #F0F0F0", background: !pass && r.status==="pending" ? "#FFFBEA" : i%2===0 ? "#fff" : "#FAFAFA" }}>
              <td style={{ padding: "10px 12px", fontFamily: F.mono, fontSize: 11, color: C.muted }}>{r.id}</td>
              <td style={{ padding: "10px 12px", fontWeight: 700 }}>{r.merchant}</td>
              <td style={{ padding: "10px 12px", fontFamily: F.mono, fontWeight: 900, color: C.dark }}>{r.yunbi.toFixed(2)} U</td>
              <td style={{ padding: "10px 12px", fontFamily: F.mono, fontSize: 11 }}>{r.wallet.slice(0,8)}…{r.wallet.slice(-4)}</td>
              <td style={{ padding: "10px 12px", fontFamily: F.mono, fontSize: 11 }}>{r.activationCode}</td>
              <td style={{ padding: "10px 12px", fontSize: 12, color: C.muted }}>{r.cardSource === "purchased" ? "自购" : "转让"}</td>
              <td style={{ padding: "10px 12px" }}>
                {pass
                  ? <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>✓ 通过</span>
                  : <span style={{ fontSize: 11, fontWeight: 700, color: C.red }}>⚠ 有风险</span>
                }
              </td>
              <td style={{ padding: "10px 12px" }}><AdminBadge status={r.status} /></td>
              <td style={{ padding: "10px 12px", fontSize: 11, color: C.muted }}>{r.requestTime}</td>
              <td style={{ padding: "9px 12px" }}>
                <div style={{ display: "flex", gap: 5 }}>
                  <ABtn onClick={() => { setLedger(r); setExpanded([]); }} variant="primary">台账</ABtn>
                  {r.status === "pending" && <>
                    <ABtn onClick={() => act(r.id, "approved")} variant="success">通过</ABtn>
                    <ABtn onClick={() => act(r.id, "rejected")} variant="danger">拒绝</ABtn>
                  </>}
                </div>
              </td>
            </tr>
          );
        })}
      </AdminTable>

      {/* Ledger verification modal */}
      {ledger && (() => {
        const pass = overallPass(ledger);
        const totalOrders = ledger.orders.reduce((a: number, o: any) => a + o.hours, 0);
        const settledPts = ledger.orders.reduce((a: number, o: any) => a + o.settled, 0);
        const totalYunbi = ledger.yunbiSources.reduce((a: number, s: any) => a + s.amount, 0);
        const exchYunbi = ledger.yunbiSources.filter((s: any) => s.type === "积分兑换").reduce((a: number, s: any) => a + s.amount, 0);
        const exchPts = ledger.yunbiSources.filter((s: any) => s.type === "积分兑换").reduce((a: number, s: any) => a + s.pts, 0);

        // SVG icon set — inline, no deps
        const IcoKey = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="15" r="5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>;
        const IcoList = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>;
        const IcoStar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
        const IcoCoins = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>;
        const IcoDollar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
        const IcoRefresh = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>;
        const IcoLock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
        const IcoWallet = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12h.01"/></svg>;
        const IcoCheck = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
        const IcoX = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
        const IcoChevron = ({ up }: { up: boolean }) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points={up ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/></svg>;
        const IcoArrow = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

        const SectionHeader = ({ icon, title, badge, badgeColor }: { icon: React.ReactNode; title: string; badge?: string; badgeColor?: string }) => (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ color: C.dark, display: "flex", alignItems: "center" }}>{icon}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{title}</span>
            {badge && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: badgeColor ?? C.muted, background: (badgeColor ?? C.muted) + "18", borderRadius: 4, padding: "2px 7px" }}>{badge}</span>}
          </div>
        );

        const KV = ({ label, value, mono, color }: { label: string; value: string; mono?: boolean; color?: string }) => (
          <div style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid #F3F4F6", alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, color: C.muted, width: 82, flexShrink: 0, paddingTop: 1 }}>{label}</span>
            <span style={{ fontSize: 12, color: color ?? C.dark, fontFamily: mono ? F.mono : "inherit", flex: 1, wordBreak: "break-all" as const }}>{value}</span>
          </div>
        );

        const flowItems = [
          { icon: <IcoKey />, label: "激活卡购买", val: ledger.cardSource === "purchased" ? `${(ledger.cardPricePts/1000).toFixed(0)}k 积分` : "他人转让" },
          { icon: null, label: "", val: "" },
          { icon: <IcoList />, label: "接单时长", val: `${totalOrders} 小时` },
          { icon: null, label: "", val: "" },
          { icon: <IcoStar />, label: "产出积分", val: `${settledPts.toLocaleString()} pts` },
          { icon: null, label: "", val: "" },
          { icon: <IcoCoins />, label: "兑换云币", val: `${exchYunbi.toFixed(2)} 云币` },
          { icon: null, label: "", val: "" },
          { icon: <IcoDollar />, label: "申请兑现", val: `${ledger.yunbi.toFixed(2)} USDT` },
        ];

        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setLedger(null)}>
            <div onClick={(e: React.MouseEvent) => e.stopPropagation()} style={{ background: "#F4F5F7", borderRadius: 16, width: "min(720px,96vw)", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 40px 100px rgba(0,0,0,.35)", display: "flex", flexDirection: "column" as const }}>

              {/* ── Header ── */}
              <div style={{ background: C.dark, padding: "18px 24px", borderRadius: "16px 16px 0 0", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>台账核查</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", fontFamily: F.mono, marginTop: 2 }}>{ledger.id} · 商家 {ledger.merchant}</div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" as const }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.yellow, fontFamily: F.mono, lineHeight: 1 }}>{ledger.yunbi.toFixed(2)}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginTop: 2 }}>云币申请兑换 USDT</div>
                </div>
                <button onClick={() => setLedger(null)} style={{ background: "rgba(255,255,255,.08)", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer", width: 30, height: 30, borderRadius: 6, marginLeft: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IcoX size={14} />
                </button>
              </div>

              {/* ── Flow summary strip ── */}
              <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "14px 24px", display: "flex", alignItems: "center" }}>
                {flowItems.map((item, i) => (
                  item.icon === null
                    ? <div key={i} style={{ color: C.muted, margin: "0 6px", display: "flex", alignItems: "center" }}><IcoArrow /></div>
                    : <div key={i} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, flex: 1 }}>
                        <span style={{ color: C.dark, display: "flex", alignItems: "center" }}>{item.icon}</span>
                        <div style={{ fontSize: 9, color: C.muted, textAlign: "center" as const }}>{item.label}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.dark, fontFamily: F.mono }}>{item.val}</div>
                      </div>
                ))}
              </div>

              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column" as const, gap: 14 }}>

                {/* ── Section 1: 激活卡购买记录 ── */}
                <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 16px" }}>
                  <SectionHeader icon={<IcoKey />} title="激活卡购买记录" badge={ledger.cardVerified ? "已验证" : "异常"} badgeColor={ledger.cardVerified ? C.green : C.red} />
                  <KV label="激活码" value={ledger.activationCode} mono />
                  <KV label="来源" value={ledger.cardSource === "purchased" ? "自购（积分支付）" : "他人转让"} />
                  <KV label="交易编号" value={ledger.cardTx} mono />
                  <KV label="购买时间" value={ledger.cardPurchaseTime} mono />
                  {ledger.cardSource === "purchased" && (
                    <KV label="支付积分" value={`${ledger.cardPricePts.toLocaleString()} pts`} color={C.orange} />
                  )}
                  <KV label="验证结果" value={ledger.cardVerified ? "卡密与购买记录一一对应，支付状态已确认" : "无法在系统中找到对应的购买或转让记录"} color={ledger.cardVerified ? C.green : C.red} />
                </div>

                {/* ── Section 2: 接单明细 ── */}
                <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 16px" }}>
                  <SectionHeader icon={<IcoList />} title="接单明细（产出积分）" badge={`共 ${totalOrders} 小时 / 结算 ${settledPts.toLocaleString()} pts`} badgeColor={C.dark} />
                  <div style={{ overflowX: "auto" as const }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: "#F8F9FA" }}>
                          {["订单号", "域名", "用途", "接单时长", "产出积分", "已结算积分", "状态"].map(h => (
                            <th key={h} style={{ padding: "6px 8px", textAlign: "left" as const, fontSize: 10, color: C.muted, fontWeight: 600, whiteSpace: "nowrap" as const, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ledger.orders.map((o: any, i: number) => (
                          <tr key={o.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                            <td style={{ padding: "7px 8px", fontFamily: F.mono, fontSize: 11, color: C.muted, whiteSpace: "nowrap" as const }}>{o.id}</td>
                            <td style={{ padding: "7px 8px", fontFamily: F.mono, fontSize: 11 }}>{o.domain}</td>
                            <td style={{ padding: "7px 8px", fontSize: 11 }}>{o.purpose}</td>
                            <td style={{ padding: "7px 8px", fontWeight: 700, color: C.dark, fontFamily: F.mono, whiteSpace: "nowrap" as const }}>{o.hours}h</td>
                            <td style={{ padding: "7px 8px", fontWeight: 700, color: C.yellow, fontFamily: F.mono, whiteSpace: "nowrap" as const }}>{o.pts.toLocaleString()}</td>
                            <td style={{ padding: "7px 8px", fontWeight: 700, color: o.settled > 0 ? C.green : C.muted, fontFamily: F.mono, whiteSpace: "nowrap" as const }}>{o.settled.toLocaleString()}</td>
                            <td style={{ padding: "7px 8px" }}>
                              <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "2px 6px", background: o.status === "completed" ? C.green+"18" : o.status === "running" ? C.blue+"18" : C.red+"18", color: o.status === "completed" ? C.green : o.status === "running" ? C.blue : C.red }}>
                                {o.status === "completed" ? "已完成" : o.status === "running" ? "进行中" : "异常"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: "#F0F4FF", borderTop: `2px solid ${C.border}` }}>
                          <td colSpan={3} style={{ padding: "7px 8px", fontSize: 11, fontWeight: 700, color: C.dark }}>合计</td>
                          <td style={{ padding: "7px 8px", fontWeight: 900, color: C.dark, fontFamily: F.mono }}>{totalOrders}h</td>
                          <td style={{ padding: "7px 8px", fontWeight: 900, color: C.yellow, fontFamily: F.mono }}>{ledger.orders.reduce((a: number, o: any) => a + o.pts, 0).toLocaleString()}</td>
                          <td style={{ padding: "7px 8px", fontWeight: 900, color: C.green, fontFamily: F.mono }}>{settledPts.toLocaleString()}</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* ── Section 3: 积分 → 云币兑换 ── */}
                <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 16px" }}>
                  <SectionHeader icon={<IcoRefresh />} title="积分 → 云币兑换明细" badge={`兑换 ${exchPts.toLocaleString()} pts = ${exchYunbi.toFixed(2)} 云币`} badgeColor={C.dark} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 80px", gap: 0 }}>
                    {["类型", "消耗积分", "获得云币", "核实"].map(h => (
                      <div key={h} style={{ padding: "6px 8px", fontSize: 10, color: C.muted, fontWeight: 600, background: "#F8F9FA", borderBottom: `1px solid ${C.border}` }}>{h}</div>
                    ))}
                    {ledger.yunbiSources.map((s: any, i: number) => (
                      <Fragment key={i}>
                        <div style={{ padding: "8px 8px", fontSize: 12, borderBottom: `1px solid #F3F4F6`, fontWeight: 600 }}>{s.type}</div>
                        <div style={{ padding: "8px 8px", fontSize: 12, color: s.pts > 0 ? C.orange : C.muted, fontFamily: F.mono, borderBottom: `1px solid #F3F4F6` }}>{s.pts > 0 ? `-${s.pts.toLocaleString()}` : "—"}</div>
                        <div style={{ padding: "8px 8px", fontSize: 12, fontWeight: 700, color: C.green, fontFamily: F.mono, borderBottom: `1px solid #F3F4F6` }}>+{s.amount.toFixed(2)}</div>
                        <div style={{ padding: "8px 8px", fontSize: 11, fontWeight: 700, color: s.verified ? C.green : C.red, borderBottom: `1px solid #F3F4F6`, display: "flex", alignItems: "center", gap: 3 }}>
                          {s.verified ? <IcoCheck size={12} /> : <IcoX size={12} />}
                          {s.verified ? "核实" : "异常"}
                        </div>
                      </Fragment>
                    ))}
                    <div style={{ padding: "8px 8px", fontSize: 12, fontWeight: 800, background: "#F0F4FF" }}>合计</div>
                    <div style={{ padding: "8px 8px", fontSize: 12, fontWeight: 800, color: C.orange, fontFamily: F.mono, background: "#F0F4FF" }}>{exchPts > 0 ? `-${exchPts.toLocaleString()}` : "—"}</div>
                    <div style={{ padding: "8px 8px", fontSize: 12, fontWeight: 900, color: C.green, fontFamily: F.mono, background: "#F0F4FF" }}>+{totalYunbi.toFixed(2)}</div>
                    <div style={{ padding: "8px 8px", background: "#F0F4FF" }} />
                  </div>
                  <div style={{ marginTop: 10, padding: "8px 10px", background: totalYunbi === ledger.yunbi ? "#F0FDF4" : "#FFF5F5", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: C.muted }}>来源合计 vs 申请金额</span>
                    <span style={{ fontSize: 13, fontWeight: 900, fontFamily: F.mono, color: totalYunbi === ledger.yunbi ? C.green : C.red }}>
                      {totalYunbi.toFixed(2)} 云币 {totalYunbi === ledger.yunbi ? "= ✓" : "≠ ✕"} {ledger.yunbi.toFixed(2)} 云币
                    </span>
                  </div>
                </div>

                {/* ── Section 4: 安全核查 (accordion) ── */}
                <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: C.dark, display: "flex" }}><IcoLock /></span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>安全核查</span>
                  </div>
                  {[
                    {
                      step: 1, icon: <IcoKey />, title: "激活码完整性",
                      pass: ledger.codeStatus === "valid",
                      tag: codeLabel[ledger.codeStatus], tagColor: codeColor[ledger.codeStatus],
                      rows: [
                        { k: "激活码", v: ledger.activationCode, mono: true },
                        { k: "状态", v: codeLabel[ledger.codeStatus], color: codeColor[ledger.codeStatus] },
                        { k: "判断依据", v: ledger.codeStatus === "valid" ? "哈希匹配，仅绑定一台设备" : ledger.codeStatus === "reused" ? "同一激活码绑定多台设备" : "服务器哈希与原始记录不一致" },
                      ],
                    },
                    {
                      step: 2, icon: <IcoWallet />, title: "钱包地址真实性",
                      pass: ledger.walletStatus !== "tampered",
                      tag: walletLabel[ledger.walletStatus], tagColor: walletColor[ledger.walletStatus],
                      rows: [
                        { k: "收款地址", v: ledger.wallet, mono: true },
                        { k: "修改状态", v: walletLabel[ledger.walletStatus], color: walletColor[ledger.walletStatus] },
                        { k: "说明", v: ledger.walletStatus === "clean" ? "从未修改，与注册时一致" : ledger.walletStatus === "cs_auth" ? "客服通过技术密码验证后授权改绑，合规" : "检测到未经技术密码验证的地址变更，高风险" },
                        ...(ledger.walletStatus === "cs_auth" ? [{ k: "授权凭证", v: "已验证（技术人员操作）", color: C.green }] : []),
                      ],
                    },
                  ].map(({ step, icon, title, pass, tag, tagColor, rows }: any) => (
                    <div key={step} style={{ borderBottom: step < 2 ? `1px solid ${C.border}` : "none" }}>
                      <button onClick={() => toggleExpand(step)} style={{ width: "100%", padding: "11px 16px", display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer", textAlign: "left" as const }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: pass ? C.green : C.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff" }}>
                          {pass ? <IcoCheck size={12} /> : <IcoX size={12} />}
                        </span>
                        <span style={{ color: C.dark, display: "flex", alignItems: "center" }}>{icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>{title}</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: tagColor, background: tagColor + "18", borderRadius: 4, padding: "2px 7px" }}>{tag}</span>
                        <span style={{ color: C.muted, marginLeft: 6, display: "flex", alignItems: "center" }}><IcoChevron up={expanded.includes(step)} /></span>
                      </button>
                      {expanded.includes(step) && (
                        <div style={{ padding: "4px 16px 12px", borderTop: `1px solid #F3F4F6` }}>
                          {rows.map((r: any, ri: number) => (
                            <div key={ri} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: ri < rows.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                              <span style={{ fontSize: 11, color: C.muted, width: 70, flexShrink: 0 }}>{r.k}</span>
                              <span style={{ fontSize: 12, color: r.color ?? C.dark, fontFamily: r.mono ? F.mono : "inherit", flex: 1, wordBreak: "break-all" as const }}>{r.v}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* ── Overall verdict ── */}
                <div style={{ background: pass ? "#F0FDF4" : "#FFF5F5", border: `2px solid ${pass ? C.green : C.red}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: pass ? C.green : C.red, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                    {pass ? <IcoCheck size={18} /> : <IcoX size={18} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: pass ? C.green : C.red }}>{pass ? "综合核查通过 — 建议放款" : "核查未通过 — 建议拒绝或人工复核"}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                      {pass ? "激活卡、接单记录、积分兑换、钱包安全四项均通过，资金链路清晰，可安全放款。" : "存在一项或多项异常（标红处），请展开查看后由人工决策。"}
                    </div>
                  </div>
                </div>

                {/* ── Action buttons ── */}
                {(statuses[ledger.id] ?? ledger.status) === "pending" && (
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => { act(ledger.id, "approved"); setLedger(null); }} style={{ flex: 1, padding: "12px 0", borderRadius: 8, border: "none", background: C.green, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: F.cn, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <IcoCheck size={16} /> 审核通过，放款
                    </button>
                    <button onClick={() => { act(ledger.id, "rejected"); setLedger(null); }} style={{ flex: 1, padding: "12px 0", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", color: C.red, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: F.cn, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <IcoX size={16} /> 拒绝申请
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        );
      })()}
    </AdminPage>
  );
}

function AdminCardsPage() {
  const [genCount, setGenCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const doGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); setTimeout(() => setGenerated(false), 2000); }, 1200);
  };

  const stats = [
    { label: "未使用", count: ADMIN_CARDS.filter(c => c.status === "unused").length },
    { label: "已激活", count: ADMIN_CARDS.filter(c => c.status === "active").length },
    { label: "挂卖中", count: ADMIN_CARDS.filter(c => c.status === "listed").length },
    { label: "已过期", count: ADMIN_CARDS.filter(c => c.status === "expired").length },
  ];

  return (
    <AdminPage>
      <AdminTitle>激活卡管理</AdminTitle>

      <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ flex: 1, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, letterSpacing: .3 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 900, fontFamily: F.mono, color: C.dark }}>{s.count}</div>
          </div>
        ))}

        {/* Generate card */}
        <div style={{ flex: 2, background: C.dark, borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 4 }}>批量生成卡密</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <input type="number" value={genCount} onChange={(e) => setGenCount(Number(e.target.value))} min={1} max={100}
                style={{ width: 70, padding: "6px 10px", borderRadius: 6, border: "none", background: "rgba(255,255,255,.1)", color: "#fff", fontSize: 14, fontFamily: F.mono, outline: "none", textAlign: "center" }} />
              <span style={{ color: "rgba(255,255,255,.4)", fontSize: 12 }}>张</span>
              <button onClick={doGenerate} disabled={generating} style={{ padding: "6px 18px", borderRadius: 6, border: "none", background: C.yellow, color: C.dark, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: F.cn, opacity: generating ? .7 : 1 }}>
                {generating ? "生成中…" : generated ? "已生成" : "立即生成"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AdminTable heads={["卡密编号", "状态", "购买商家", "购买时间", "激活设备", "有效期", "操作"]}>
        {ADMIN_CARDS.map((c, i) => (
          <tr key={c.code} style={{ borderBottom: "1px solid #F0F0F0", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
            <td style={{ padding: "10px 14px", fontFamily: F.mono, fontSize: 12 }}>{c.code}</td>
            <td style={{ padding: "10px 14px" }}><AdminBadge status={c.status} /></td>
            <td style={{ padding: "10px 14px", fontWeight: c.buyer !== "—" ? 700 : 400, color: c.buyer !== "—" ? C.dark : C.muted }}>{c.buyer}</td>
            <td style={{ padding: "10px 14px", fontSize: 11, color: C.muted }}>{c.purchaseTime}</td>
            <td style={{ padding: "10px 14px", fontSize: 12, color: C.muted }}>{c.activatedBy}</td>
            <td style={{ padding: "10px 14px", fontFamily: F.mono, fontSize: 12, color: C.muted }}>{c.expiry}</td>
            <td style={{ padding: "9px 14px" }}>
              {c.status === "unused" ? <ABtn variant="danger">作废</ABtn> : <span style={{ fontSize: 11, color: C.muted }}>—</span>}
            </td>
          </tr>
        ))}
      </AdminTable>
    </AdminPage>
  );
}

function AdminConfigPage() {
  const [announcement, setAnnouncement] = useState("平台已完成系统升级，新增积分兑换功能，欢迎商家体验。");
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const configs = [
    { group: "签到奖励", items: [
      { label: "Lv.1 阈值（云币）", value: "0 – 49.99", type: "display" },
      { label: "Lv.1 奖励比率", value: "0.3%", type: "input" },
      { label: "Lv.2 阈值（云币）", value: "50 – 199.99", type: "display" },
      { label: "Lv.2 奖励比率", value: "0.5%", type: "input" },
      { label: "Lv.3 阈值（云币）", value: "200 – 499.99", type: "display" },
      { label: "Lv.3 奖励比率", value: "0.7%", type: "input" },
      { label: "Lv.4 阈值（云币）", value: "500+", type: "display" },
      { label: "Lv.4 奖励比率", value: "1.0%", type: "input" },
    ]},
    { group: "提现设置", items: [
      { label: "最低提现金额 (¥)", value: "20", type: "input" },
      { label: "提现手续费 (%)", value: "5", type: "input" },
      { label: "单次提现上限 (¥)", value: "5000", type: "input" },
    ]},
    { group: "积分 & 云币", items: [
      { label: "积分:云币 兑换比", value: "1000", type: "input" },
      { label: "购卡积分单价", value: "50000", type: "input" },
    ]},
  ];

  return (
    <AdminPage>
      <AdminTitle>系统配置</AdminTitle>

      {/* Announcement */}
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 10 }}>系统公告</div>
        <textarea value={announcement} onChange={(e) => setAnnouncement(e.target.value)} rows={3}
          style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: F.cn, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
        <button onClick={save} style={{ marginTop: 10, padding: "7px 22px", borderRadius: 7, border: "none", background: C.dark, color: saved ? C.yellow : "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>
          {saved ? "已发布" : "发布公告"}
        </button>
      </div>

      {/* Config groups */}
      <div style={{ display: "flex", gap: 14 }}>
        {configs.map((group) => (
          <div key={group.group} style={{ flex: 1, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>{group.group}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {group.items.map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: 12, color: C.muted, flex: 1 }}>{item.label}</span>
                  {item.type === "input"
                    ? <input defaultValue={item.value} style={{ width: 80, padding: "4px 8px", border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 12, fontFamily: F.mono, outline: "none", textAlign: "right" }} />
                    : <span style={{ fontSize: 12, fontFamily: F.mono, color: C.muted }}>{item.value}</span>
                  }
                </div>
              ))}
            </div>
            <button onClick={save} style={{ marginTop: 14, width: "100%", padding: "7px 0", borderRadius: 7, border: `1px solid ${C.border}`, background: "#F7F8FA", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: F.cn, color: C.dark }}>
              保存修改
            </button>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}

function AdminLogsPage() {
  return (
    <AdminPage>
      <AdminTitle action={
        <button style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: C.dark, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>导出日志</button>
      }>操作日志</AdminTitle>

      {/* Risk alerts */}
      <div style={{ background: "#F7F8FA", border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.orange}`, borderRadius: "0 8px 8px 0", padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 10 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.dark, marginBottom: 4 }}>风控提示</div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.9 }}>
            商家 <strong style={{ color: C.dark }}>sb3371qw</strong> 今日尝试登录 12 次，已触发异常锁定<br />
            商家 <strong style={{ color: C.dark }}>sb7829xz</strong> 本周提现金额超过 ¥500，建议人工复核
          </div>
        </div>
      </div>

      <AdminTable heads={["时间", "操作人", "操作类型", "操作对象", "IP 地址"]}>
        {ADMIN_LOGS.map((l, i) => {
          const isDanger  = l.action.includes("封禁") || l.action.includes("拒绝");
          const isSuccess = l.action.includes("通过") || l.action.includes("生成");
          return (
            <tr key={i} style={{ borderBottom: "1px solid #F0F0F0", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
              <td style={{ padding: "9px 14px", fontFamily: F.mono, fontSize: 11, color: C.muted }}>{l.time}</td>
              <td style={{ padding: "9px 14px", fontWeight: 700, fontSize: 12 }}>{l.admin}</td>
              <td style={{ padding: "9px 14px" }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 99, background: isDanger ? "#FFF5F5" : isSuccess ? "#F0FDF4" : "#F7F8FA", color: isDanger ? C.red : isSuccess ? C.green : C.muted, border: `1px solid ${isDanger ? C.red : isSuccess ? C.green : C.border}33` }}>
                  {l.action}
                </span>
              </td>
              <td style={{ padding: "9px 14px", fontSize: 12, color: C.dark }}>{l.target}</td>
              <td style={{ padding: "9px 14px", fontFamily: F.mono, fontSize: 11, color: C.muted }}>{l.ip}</td>
            </tr>
          );
        })}
      </AdminTable>
    </AdminPage>
  );
}

function AdminNodesPage() {
  const [detail, setDetail] = useState<typeof ADMIN_NODES[0] | null>(null);
  const [nodeDetailTab, setNodeDetailTab] = useState<"info" | "params">("info");
  const [search, setSearch] = useState("");
  const [payoutNode, setPayoutNode] = useState<typeof ADMIN_NODES[0] | null>(null);

  const filtered = ADMIN_NODES.filter(n => {
    const q = search.toLowerCase();
    return n.id.toLowerCase().includes(q) || n.contact.includes(q) || n.refCode.toLowerCase().includes(q) || n.email.includes(q);
  });

  const totalPending = ADMIN_NODES.reduce((s, n) => s + n.commissionPending, 0);
  const totalPaid    = ADMIN_NODES.reduce((s, n) => s + n.commissionPaid, 0);
  const totalNodes   = ADMIN_NODES.length;
  const activeNodes  = ADMIN_NODES.filter(n => n.status === "active").length;

  const levelBg = (l: string) => l === "金牌节点" ? "#FEFCE8" : l === "银牌节点" ? "#F7F8FA" : "#F7F8FA";
  const levelFg = (l: string) => l === "金牌节点" ? "#92400E" : l === "银牌节点" ? C.muted : C.muted;

  const walletLabel: Record<string, string> = { clean: "正常", cs_auth: "客服授权改绑", tampered: "异常" };
  const walletColor: Record<string, string> = { clean: C.green, cs_auth: C.orange, tampered: C.red };

  return (
    <AdminPage>
      <AdminTitle action={
        <div style={{ display: "flex", gap: 8 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索节点 / 推荐码…"
            style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", width: 200 }} />
          <button style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: C.dark, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>
            + 新增节点
          </button>
        </div>
      }>服务商节点管理</AdminTitle>

      {/* Summary */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { label: "节点总数",   value: totalNodes },
          { label: "活跃节点",   value: activeNodes },
          { label: "已推荐商家", value: ADMIN_NODES.reduce((s, n) => s + n.merchantCount, 0) },
          { label: "累计佣金",   value: ADMIN_NODES.reduce((s, n) => s + n.commissionEarned, 0).toFixed(2) },
          { label: "已结算佣金", value: totalPaid.toFixed(2) },
          { label: "待结算佣金", value: totalPending.toFixed(2) },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, letterSpacing: .3 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: F.mono, color: C.dark }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Commission rate banner */}
      <div style={{ background: C.dark, borderRadius: 8, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>当前佣金制度：节点推荐商家成功注册后，该商家每笔兑现流水的</span>
        <span style={{ fontSize: 15, fontWeight: 900, color: C.yellow, fontFamily: F.mono }}>10%</span>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>作为节点佣金，每月结算一次</span>
        <button style={{ marginLeft: "auto", padding: "5px 14px", borderRadius: 6, border: `1px solid rgba(255,215,0,.3)`, background: "transparent", color: C.yellow, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F.cn }}>修改比率</button>
      </div>

      {/* Node table */}
      <AdminTable heads={["节点ID", "联系人", "推荐码", "等级", "推荐商家", "活跃商家", "累计流水(云币)", "累计佣金", "待结算", "状态", "最后活跃", "操作"]}>
        {filtered.map((n, i) => (
          <tr key={n.id} style={{ borderBottom: "1px solid #F0F0F0", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
            <td style={{ padding: "9px 12px", fontFamily: F.mono, fontWeight: 700, fontSize: 12 }}>{n.id}</td>
            <td style={{ padding: "9px 12px", fontSize: 13, fontWeight: 600 }}>{n.contact}</td>
            <td style={{ padding: "9px 12px" }}>
              <span style={{ fontFamily: F.mono, fontSize: 11, background: "#F7F8FA", border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 7px", color: C.dark }}>{n.refCode}</span>
            </td>
            <td style={{ padding: "9px 12px" }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: levelBg(n.level), color: levelFg(n.level), border: `1px solid ${levelFg(n.level)}22` }}>{n.level}</span>
            </td>
            <td style={{ padding: "9px 12px", fontFamily: F.mono, fontSize: 12, textAlign: "center" as const, fontWeight: 600 }}>{n.merchantCount}</td>
            <td style={{ padding: "9px 12px", fontFamily: F.mono, fontSize: 12, textAlign: "center" as const, color: n.activeMerchants > 0 ? C.dark : C.muted }}>{n.activeMerchants}</td>
            <td style={{ padding: "9px 12px", fontFamily: F.mono, fontSize: 12, color: C.dark, fontWeight: 600 }}>{n.totalYunbi.toFixed(2)}</td>
            <td style={{ padding: "9px 12px", fontFamily: F.mono, fontSize: 12, fontWeight: 700, color: C.dark }}>{n.commissionEarned.toFixed(2)}</td>
            <td style={{ padding: "9px 12px", fontFamily: F.mono, fontSize: 12, color: n.commissionPending > 0 ? C.orange : C.muted, fontWeight: n.commissionPending > 0 ? 700 : 400 }}>{n.commissionPending.toFixed(2)}</td>
            <td style={{ padding: "9px 12px" }}><AdminBadge status={n.status} /></td>
            <td style={{ padding: "9px 12px", fontSize: 11, color: C.muted }}>{n.lastActive}</td>
            <td style={{ padding: "9px 12px" }}>
              <div style={{ display: "flex", gap: 5 }}>
                <ABtn onClick={() => setDetail(n)}>详情</ABtn>
                {n.commissionPending > 0 && <ABtn onClick={() => setPayoutNode(n)} variant="primary">结算</ABtn>}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      {/* Detail modal */}
      {detail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setDetail(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#F4F5F7", borderRadius: 16, width: "min(660px,96vw)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 40px 100px rgba(0,0,0,.3)" }}>

            {/* Header */}
            <div style={{ background: C.dark, padding: "16px 22px", borderRadius: "16px 16px 0 0", display: "flex", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{detail.id} · {detail.contact}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontFamily: F.mono, marginTop: 2 }}>{detail.refCode}</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                <AdminBadge status={detail.status} />
                <button onClick={() => { setDetail(null); setNodeDetailTab("info"); }} style={{ background: "rgba(255,255,255,.08)", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer", width: 28, height: 28, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            {/* Tabs */}
            <div style={{ display: "flex", background: "#fff", borderBottom: `1px solid ${C.border}` }}>
              {(["info", "params"] as const).map(t => (
                <button key={t} onClick={() => setNodeDetailTab(t)} style={{ padding: "10px 20px", border: "none", background: "transparent", fontSize: 12, fontWeight: nodeDetailTab === t ? 700 : 400, color: nodeDetailTab === t ? C.dark : C.muted, borderBottom: nodeDetailTab === t ? `2px solid ${C.yellow}` : "2px solid transparent", cursor: "pointer", fontFamily: F.cn }}>
                  {t === "info" ? "节点信息" : "产值参数"}
                </button>
              ))}
            </div>

            {nodeDetailTab === "info" && <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column" as const, gap: 14 }}>

              {/* Basic info */}
              <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 3, height: 12, borderRadius: 2, background: C.yellow }} />
                  基本信息
                </div>
                {[
                  ["邮箱",     detail.email],
                  ["等级",     detail.level],
                  ["推荐码",   detail.refCode],
                  ["收款钱包", detail.wallet],
                  ["钱包状态", walletLabel[detail.walletStatus]],
                  ["加入时间", detail.joined],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid #F3F4F6", alignItems: "flex-start" }}>
                    <span style={{ fontSize: 11, color: C.muted, width: 72, flexShrink: 0, paddingTop: 1 }}>{k}</span>
                    <span style={{ fontSize: 12, color: k === "钱包状态" ? walletColor[detail.walletStatus] : C.dark, fontFamily: k.includes("钱包") || k.includes("推荐") ? F.mono : "inherit", wordBreak: "break-all" as const }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Commission stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { label: "推荐商家",   value: detail.merchantCount,                    unit: "家" },
                  { label: "累计流水",   value: detail.totalYunbi.toFixed(2),             unit: " 云币" },
                  { label: "佣金比率",   value: `${(detail.commissionRate * 100).toFixed(0)}%`, unit: "" },
                  { label: "累计佣金",   value: detail.commissionEarned.toFixed(2),       unit: " USDT" },
                  { label: "已结算",     value: detail.commissionPaid.toFixed(2),         unit: " USDT" },
                  { label: "待结算",     value: detail.commissionPending.toFixed(2),      unit: " USDT" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 900, fontFamily: F.mono, color: C.dark }}>{s.value}<span style={{ fontSize: 11, color: C.muted, fontWeight: 400 }}>{s.unit}</span></div>
                  </div>
                ))}
              </div>

              {/* Commission log */}
              <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 12, fontWeight: 700, color: C.dark, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 3, height: 12, borderRadius: 2, background: C.yellow }} />
                  佣金结算记录
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#F8F9FA" }}>
                      {["月份", "佣金金额", "结算状态", "结算时间"].map(h => (
                        <th key={h} style={{ padding: "7px 14px", textAlign: "left" as const, fontSize: 10, color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.commissionLog.map((log, li) => (
                      <tr key={li} style={{ borderBottom: li < detail.commissionLog.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                        <td style={{ padding: "8px 14px", fontFamily: F.mono, fontWeight: 600 }}>{log.month}</td>
                        <td style={{ padding: "8px 14px", fontFamily: F.mono, fontWeight: 700, color: C.dark }}>{log.amount.toFixed(2)} USDT</td>
                        <td style={{ padding: "8px 14px" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: log.status === "paid" ? "#F0FDF4" : "#FFF7ED", color: log.status === "paid" ? C.green : C.orange, border: `1px solid ${log.status === "paid" ? C.green : C.orange}33` }}>
                            {log.status === "paid" ? "已结算" : "待结算"}
                          </span>
                        </td>
                        <td style={{ padding: "8px 14px", fontSize: 11, color: C.muted, fontFamily: F.mono }}>{log.settledAt || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Referred merchants */}
              {detail.merchants.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 3, height: 12, borderRadius: 2, background: C.yellow }} />
                    旗下商家（样本）
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                    {detail.merchants.map(mid => (
                      <span key={mid} style={{ fontFamily: F.mono, fontSize: 11, background: "#F7F8FA", border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 9px", color: C.dark }}>{mid}</span>
                    ))}
                    {detail.merchantCount > detail.merchants.length && (
                      <span style={{ fontSize: 11, color: C.muted, padding: "3px 6px" }}>+{detail.merchantCount - detail.merchants.length} 家…</span>
                    )}
                  </div>
                </div>
              )}

              {/* Action */}
              {detail.commissionPending > 0 && (
                <button onClick={() => { setPayoutNode(detail); setDetail(null); }} style={{ width: "100%", padding: "11px 0", borderRadius: 8, border: "none", background: C.dark, color: C.yellow, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: F.cn }}>
                  结算待付佣金 {detail.commissionPending.toFixed(2)} USDT →
                </button>
              )}
            </div>}

            {nodeDetailTab === "params" && (() => {
              const ov = ADMIN_PARAM_OVERRIDES.find(o => o.targetType === "node" && o.targetId === detail.id);
              const G = ADMIN_PARAMS_GLOBAL;
              return (
                <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column" as const, gap: 12 }}>
                  <div style={{ fontSize: 11, color: C.muted, background: "#F7F8FA", border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 12px" }}>
                    以下参数将覆盖该节点旗下所有商家的全局默认值（商家有单独设定时优先使用商家值）。
                  </div>

                  {ov && (
                    <div style={{ background: ov.staticOn && ov.dynamicOn ? "#F0FDF4" : "#FFF5F5", border: `1px solid ${ov.staticOn && ov.dynamicOn ? C.green : C.red}33`, borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
                      <div style={{ fontWeight: 700, color: ov.staticOn && ov.dynamicOn ? C.green : C.red, marginBottom: 4 }}>
                        {ov.staticOn && ov.dynamicOn ? "有效覆盖配置" : "部分或全部功能已停用"}
                      </div>
                      <div style={{ color: C.muted }}>原因：{ov.reason} · 设置于 {ov.updatedAt} by {ov.updatedBy}</div>
                    </div>
                  )}

                  <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                    {[
                      { label: "静态产值倍率（伞下所有商家）", key: "staticMult",  cur: ov?.staticMult,  def: G.staticMultiplier, unit: "×" },
                      { label: "动态产值倍率（伞下所有商家）", key: "dynamicMult", cur: ov?.dynamicMult, def: 1.0, unit: "×" },
                      { label: "抽奖中奖率覆盖",              key: "winRate",     cur: ov?.winRate,     def: G.lotteryWinRate, unit: "%" },
                      { label: "节点佣金率",                  key: "commission",  cur: detail.commissionRate * 100, def: G.nodeCommission, unit: "%" },
                    ].map((row, ri) => (
                      <div key={row.key} style={{ display: "flex", alignItems: "center", padding: "11px 14px", borderBottom: ri < 3 ? `1px solid ${C.border}` : "none", gap: 12 }}>
                        <div style={{ flex: 1, fontSize: 13, color: C.dark }}>{row.label}</div>
                        <div style={{ fontSize: 11, color: C.muted, fontFamily: F.mono }}>默认 {row.unit}{row.def}</div>
                        <input
                          type="number" step="0.01"
                          defaultValue={row.cur !== null && row.cur !== undefined ? row.cur : ""}
                          placeholder={`${row.def}`}
                          style={{ width: 80, padding: "5px 8px", border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 13, fontFamily: F.mono, outline: "none", textAlign: "right" as const }}
                        />
                        <span style={{ fontSize: 12, color: C.muted, width: 14 }}>{row.unit}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 16px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginBottom: 10 }}>功能开关（影响伞下所有商家）</div>
                    {[
                      { label: "静态产值", val: ov?.staticOn ?? true },
                      { label: "动态产值", val: ov?.dynamicOn ?? true },
                    ].map((sw, si) => (
                      <div key={sw.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: si === 0 ? `1px solid ${C.border}` : "none" }}>
                        <span style={{ fontSize: 13, color: C.dark }}>{sw.label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, color: sw.val ? C.green : C.red, fontWeight: 600 }}>{sw.val ? "开启" : "已停"}</span>
                          <div style={{ width: 36, height: 20, borderRadius: 10, background: sw.val ? C.dark : "#D1D5DB", cursor: "pointer", position: "relative" as const }}>
                            <div style={{ position: "absolute" as const, top: 3, left: sw.val ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff" }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 5 }}>备注 / 原因</div>
                    <textarea defaultValue={ov?.reason ?? ""} placeholder="填写调整原因（将记录至操作日志）" style={{ width: "100%", boxSizing: "border-box" as const, height: 64, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 10px", fontSize: 12, fontFamily: F.cn, resize: "none" as const, outline: "none" }} />
                  </div>
                  <button style={{ width: "100%", padding: "10px 0", borderRadius: 7, border: "none", background: C.dark, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>保存参数覆盖</button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Payout confirm modal */}
      {payoutNode && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setPayoutNode(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, padding: "28px 30px", width: 380, boxShadow: "0 24px 64px rgba(0,0,0,.2)" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginBottom: 6 }}>确认结算佣金</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 18, lineHeight: 1.8 }}>
              向节点 <strong style={{ color: C.dark }}>{payoutNode.id} · {payoutNode.contact}</strong> 结算本期佣金：
            </div>
            <div style={{ background: "#F7F8FA", border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 20 }}>
              {[
                ["收款地址", payoutNode.wallet.slice(0, 10) + "…" + payoutNode.wallet.slice(-4)],
                ["结算金额", `${payoutNode.commissionPending.toFixed(2)} USDT`],
                ["对应流水", `${(payoutNode.commissionPending / payoutNode.commissionRate).toFixed(2)} 云币`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12 }}>
                  <span style={{ color: C.muted }}>{k}</span>
                  <span style={{ fontWeight: 700, fontFamily: F.mono, color: C.dark }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setPayoutNode(null)} style={{ flex: 1, padding: "9px 0", borderRadius: 7, border: `1px solid ${C.border}`, background: "#F7F8FA", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: F.cn, color: C.dark }}>取消</button>
              <button onClick={() => setPayoutNode(null)} style={{ flex: 1, padding: "9px 0", borderRadius: 7, border: "none", background: C.dark, color: C.yellow, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>确认打款</button>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}

/* ─── Admin Params (千人千面) ─────────────────────────────── */
function AdminParamsPage() {
  const [tab, setTab] = useState<"global" | "nodes" | "users">("global");
  const g = ADMIN_PARAMS_GLOBAL;
  const GRow = ({ label, value, unit = "" }: { label: string; value: string | number; unit?: string }) => (
    <div style={{ display: "flex", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ flex: 1, fontSize: 13, color: C.dark }}>{label}</div>
      <div style={{ fontFamily: F.mono, fontWeight: 700, color: C.dark, fontSize: 13 }}>{value}{unit && <span style={{ fontSize: 11, color: C.muted, marginLeft: 3 }}>{unit}</span>}</div>
    </div>
  );
  return (
    <AdminPage>
      <AdminTitle>参数管理（千人千面）</AdminTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["global","nodes","users"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 16px", borderRadius: 6, border: `1px solid ${t===tab?C.dark:C.border}`, background: t===tab?C.dark:"#fff", color: t===tab?"#fff":C.dark, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F.cn }}>
            {t==="global"?"全局默认":t==="nodes"?"节点覆盖":"用户覆盖"}
          </button>
        ))}
      </div>

      {tab === "global" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, letterSpacing: .5 }}>静态 / 动态收益</div>
            <GRow label="静态收益基准（每10h）" value={g.staticYieldPer10h} unit="pt/台" />
            <GRow label="静态倍率" value={`×${g.staticMultiplier}`} />
            <GRow label="动态结算比例" value={`${g.dynamicSettleRatio*100}%`} />
          </div>
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, letterSpacing: .5 }}>抽奖配置</div>
            <GRow label="奖池阈值" value={g.lotteryPool.toLocaleString()} unit="pts" />
            <GRow label="实际中奖率" value={`${g.lotteryWinRate}%`} />
            <GRow label="对外显示中奖率" value={`${g.lotteryDisplayRate}%`} />
            <GRow label="平台抽水比例" value={`${g.lotteryCut}%`} />
          </div>
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, letterSpacing: .5 }}>兑换比率</div>
            <GRow label="积分→云币" value={`${g.ptsToYunbi.toLocaleString()} pt`} unit="= 1 USDT" />
            <GRow label="积分→激活卡" value={`${g.ptsToCard.toLocaleString()} pt`} unit="= 1张" />
            <GRow label="沉淀下限" value={`${g.sediment.toLocaleString()} pt`} unit="不可提" />
          </div>
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, letterSpacing: .5 }}>提现规则</div>
            <GRow label="提现日期" value={g.withdrawDates.join(" / ") + " 号"} />
            <GRow label="最低提现" value={g.minWithdrawal} unit="USDT" />
            <GRow label="最高单笔" value={g.maxWithdrawal.toLocaleString()} unit="USDT" />
            <GRow label="手续费" value={`${g.withdrawalFee}%`} />
            <GRow label="节点佣金率" value={`${g.nodeCommission}%`} />
          </div>
        </div>
      )}

      {tab !== "global" && (
        <AdminTable heads={tab==="nodes"?["节点ID","联系人","静态倍率","动态倍率","中奖率","静态","动态","原因","操作"]:["用户ID","类型","静态倍率","动态倍率","中奖率","静态","动态","原因","操作"]}>
          {ADMIN_PARAM_OVERRIDES.filter(o => tab==="nodes" ? o.targetType==="node" : o.targetType==="user").map((o, i) => (
            <tr key={o.targetId} style={{ borderBottom: "1px solid #F0F0F0", background: i%2===0?"#fff":"#FAFAFA" }}>
              <td style={{ padding: "9px 12px", fontFamily: F.mono, fontWeight: 700, fontSize: 12 }}>{o.targetId}</td>
              <td style={{ padding: "9px 12px", fontSize: 12 }}>{o.targetType==="node"?"节点":"用户"}</td>
              <td style={{ padding: "9px 12px", fontFamily: F.mono, fontSize: 12, color: o.staticMult > 1 ? C.green : o.staticMult === 0 ? C.red : C.dark }}>×{o.staticMult}</td>
              <td style={{ padding: "9px 12px", fontFamily: F.mono, fontSize: 12, color: o.dynamicMult > 1 ? C.green : o.dynamicMult === 0 ? C.red : C.dark }}>×{o.dynamicMult}</td>
              <td style={{ padding: "9px 12px", fontFamily: F.mono, fontSize: 12 }}>{o.winRate !== null ? `${o.winRate}%` : "默认"}</td>
              <td style={{ padding: "9px 12px" }}><span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: o.staticOn ? "#F0FDF4" : "#FFF5F5", color: o.staticOn ? C.green : C.red }}>{o.staticOn?"开":"停"}</span></td>
              <td style={{ padding: "9px 12px" }}><span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: o.dynamicOn ? "#F0FDF4" : "#FFF5F5", color: o.dynamicOn ? C.green : C.red }}>{o.dynamicOn?"开":"停"}</span></td>
              <td style={{ padding: "9px 12px", fontSize: 11, color: C.muted, maxWidth: 150 }}>{o.reason}</td>
              <td style={{ padding: "9px 12px" }}><ABtn>编辑</ABtn></td>
            </tr>
          ))}
        </AdminTable>
      )}
    </AdminPage>
  );
}

/* ─── Admin Admins (账号权限) ────────────────────────────── */
function AdminAdminsPage() {
  const permLabels: Record<string, string> = {
    all: "全部", merchants: "商家", orders: "订单", finance: "财务", risk: "风控", cs: "客服", params: "参数", nodes: "节点", logs: "日志"
  };
  return (
    <AdminPage>
      <AdminTitle action={<ABtn variant="primary">+ 新建账号</ABtn>}>管理员账号与权限</AdminTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {ADMIN_ROLES.map(role => (
          <div key={role.key} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{role.label}</div>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: F.mono }}>{role.key}</div>
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>{role.desc}</div>
          </div>
        ))}
      </div>

      <AdminTitle>账号列表</AdminTitle>
      <AdminTable heads={["账号", "角色", "真实姓名", "最后登录", "状态", "权限快览", "操作"]}>
        {ADMIN_ADMINS_LIST.map((a, i) => (
          <tr key={a.id} style={{ borderBottom: "1px solid #F0F0F0", background: i%2===0?"#fff":"#FAFAFA" }}>
            <td style={{ padding: "9px 12px", fontFamily: F.mono, fontWeight: 700, fontSize: 12 }}>{a.id}</td>
            <td style={{ padding: "9px 12px" }}><span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: a.role==="superadmin"?C.dark:C.border, color: a.role==="superadmin"?"#FFD700":C.dark }}>{a.role}</span></td>
            <td style={{ padding: "9px 12px", fontSize: 12 }}>{a.name}</td>
            <td style={{ padding: "9px 12px", fontSize: 11, color: C.muted, fontFamily: F.mono }}>{a.lastLogin}</td>
            <td style={{ padding: "9px 12px" }}><AdminBadge status={a.status==="active"?"active":"banned"} /></td>
            <td style={{ padding: "9px 12px" }}>
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap" as const }}>
                {a.perms.slice(0,4).map(p => <span key={p} style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "#F4F5F7", color: C.muted, fontWeight: 600 }}>{permLabels[p]??p}</span>)}
                {a.perms.length > 4 && <span style={{ fontSize: 9, color: C.muted }}>+{a.perms.length-4}</span>}
              </div>
            </td>
            <td style={{ padding: "9px 12px" }}>
              <div style={{ display: "flex", gap: 5 }}>
                <ABtn>编辑</ABtn>
                {a.role !== "superadmin" && <ABtn variant="danger">禁用</ABtn>}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </AdminPage>
  );
}

/* ─── Admin CS (客服系统) ────────────────────────────────── */

const CS_AGENTS = [
  { id: "cs001", name: "王晓敏", avatar: "王", status: "online",  role: "高级客服" },
  { id: "cs002", name: "李志强", avatar: "李", status: "online",  role: "客服专员" },
  { id: "cs003", name: "张美华", avatar: "张", status: "busy",    role: "客服专员" },
  { id: "ai",    name: "AI 助手", avatar: "AI", status: "online", role: "智能客服" },
];

type CsMsg = { from: "agent"|"merchant"|"ai"; text: string; time: string; sender?: string };

const TICKET_HISTORY: Record<string, CsMsg[]> = {
  "TK-001": [
    { from: "merchant", text: "我的终端一直显示无法连接，已经重启三次了还是不行", time: "09:15", sender: "sb1920mg" },
    { from: "agent",    text: "您好，请问您的终端 HWID 是多少？我帮您查一下后台状态", time: "09:18", sender: "cs001" },
    { from: "merchant", text: "HWID-A7F3-2K9X-B4M1", time: "09:20", sender: "sb1920mg" },
    { from: "agent",    text: "查到了，您的终端网络认证已过期，需要重新激活一次。我帮您生成临时通行码", time: "10:30", sender: "cs001" },
  ],
  "TK-002": [
    { from: "merchant", text: "我6天前申请了提现200云币，一直没有到账，请帮我查一下", time: "08:40", sender: "sb7829xz" },
    { from: "agent",    text: "您好，我看到您的提现申请已在审核队列中，目前有较多申请积压，预计今日内完成", time: "08:55", sender: "cs002" },
    { from: "merchant", text: "好的，请加快处理，谢谢", time: "09:10", sender: "sb7829xz" },
    { from: "agent",    text: "已标记为优先处理，财务部门会在2小时内完成审核", time: "11:00", sender: "cs002" },
  ],
  "TK-005": [
    { from: "merchant", text: "我的账号被冻结了，我没有做任何违规操作，请帮我解冻", time: "11:30", sender: "sb0482kl" },
  ],
  "TK-007": [
    { from: "merchant", text: "我购买了激活卡但不知道怎么兑换，麻烦指导一下", time: "13:00", sender: "sb8803jt" },
  ],
};

const AI_RESPONSES: Record<string, string> = {
  "激活": "激活终端步骤：①进入首页→终端管理 ②点击空槽位【激活绑定】 ③在【积分提现】页面获取卡密 ④将卡密输入激活框即可。如仍有问题请告知具体报错信息。",
  "提现": "提现相关说明：①每月 1 日和 15 日 10:00-15:00 为提现窗口 ②平台手续费 5%，Tron 链额外 +1% ③提交后人工审核，通常 24 小时内到账。如有其他问题请继续提问。",
  "积分": "积分相关说明：积分可通过完成接单任务获得，1000 积分 = 1 云币。每月 1 日/15 日结算窗口可将积分结算提取。如需了解详细规则请说明具体问题。",
  "卡密": "激活卡密使用说明：①在【积分提现】页找到您的激活卡 ②点击【使用】按钮获取卡密 ③复制卡密后前往首页终端管理页输入激活。每张卡密仅可激活一台终端。",
  "冻结": "账号冻结处理：请提供您的账号 ID 和联系方式，我会将您的申诉转交风控团队进行人工审核，通常在 1 个工作日内给出结果。",
};

function getAiReply(text: string): string {
  for (const [kw, reply] of Object.entries(AI_RESPONSES)) {
    if (text.includes(kw)) return reply;
  }
  return "感谢您的提问，您的问题已记录。如涉及账号安全或资金问题，将由专属客服跟进处理。如问题紧急请在工单中标注优先级。";
}

function AdminCsPage() {
  const [activeTicket, setActiveTicket]   = useState<string>("TK-001");
  const [mode,         setMode]           = useState<"human"|"ai">("human");
  const [assignAgent,  setAssignAgent]    = useState<string>("cs001");
  const [msgMap,       setMsgMap]         = useState<Record<string, CsMsg[]>>(TICKET_HISTORY);
  const [input,        setInput]          = useState("");
  const [aiTyping,     setAiTyping]       = useState(false);
  const [ticketStatus, setTicketStatus]   = useState<Record<string, string>>(
    Object.fromEntries(ADMIN_TICKETS.map(t => [t.id, t.status]))
  );
  const [rightTab, setRightTab] = useState<"member"|"ledger"|"info">("member");
  const bottomRef = useRef<HTMLDivElement>(null);

  const ticket  = ADMIN_TICKETS.find(t => t.id === activeTicket)!;
  const msgs    = msgMap[activeTicket] ?? [];
  const status  = ticketStatus[activeTicket] ?? ticket?.status;
  const isWithdrawTicket = ticket?.subject?.includes("提现") || ticket?.subject?.includes("到账") || ticket?.subject?.includes("转账");

  // Mock member data keyed by merchant ID
  const MEMBER_DATA: Record<string, { level: string; joined: string; terminals: number; pts: number; yunbi: number; totalEarned: number; totalWithdrawn: number; pendingWd: number; lastLogin: string; wallet: string; referer: string }> = {
    "sb1920mg": { level: "黄金", joined: "2026-03-12", terminals: 3, pts: 128400, yunbi: 842, totalEarned: 3280, totalWithdrawn: 2400, pendingWd: 0, lastLogin: "2026-09-03 09:01", wallet: "0xA3f...9B2c (BSC)", referer: "sb0011aa" },
    "sb7829xz": { level: "铂金", joined: "2026-01-08", terminals: 7, pts: 304000, yunbi: 2100, totalEarned: 8950, totalWithdrawn: 6800, pendingWd: 200, lastLogin: "2026-09-03 08:38", wallet: "TRX7k...mN9 (Tron)", referer: "sb0022bb" },
    "sb5512gh": { level: "黄金", joined: "2026-05-20", terminals: 2, pts: 56000, yunbi: 380, totalEarned: 1540, totalWithdrawn: 1160, pendingWd: 0, lastLogin: "2026-09-02 22:15", wallet: "未绑定", referer: "sb0033cc" },
    "sb2241mp": { level: "标准", joined: "2026-06-14", terminals: 1, pts: 22000, yunbi: 120, totalEarned: 480, totalWithdrawn: 360, pendingWd: 0, lastLogin: "2026-09-01 18:44", wallet: "0xB8d...4E1a (BSC)", referer: "sb0011aa" },
    "sb0482kl": { level: "黄金", joined: "2026-02-28", terminals: 4, pts: 178000, yunbi: 1240, totalEarned: 4800, totalWithdrawn: 3560, pendingWd: 0, lastLogin: "2026-09-03 11:28", wallet: "0xC2a...7F3b (BSC)", referer: "sb0044dd" },
    "sb9934yr": { level: "标准", joined: "2026-07-01", terminals: 1, pts: 14000, yunbi: 60, totalEarned: 240, totalWithdrawn: 180, pendingWd: 0, lastLogin: "2026-08-29 10:22", wallet: "TRX3m...pQ4 (Tron)", referer: "sb0022bb" },
    "sb8803jt": { level: "标准", joined: "2026-08-15", terminals: 0, pts: 3200, yunbi: 0, totalEarned: 0, totalWithdrawn: 0, pendingWd: 0, lastLogin: "2026-09-01 13:00", wallet: "未绑定", referer: "sb0011aa" },
  };

  const LEDGER_DATA: Record<string, { date: string; type: string; amount: number; status: string; note: string }[]> = {
    "sb7829xz": [
      { date: "2026-09-01", type: "提现申请", amount: -200, status: "审核中", note: "TRC20 · TRX7k...mN9" },
      { date: "2026-08-15", type: "提现到账", amount: -500, status: "已完成", note: "BSC · 0xA3f...9B2c" },
      { date: "2026-08-15", type: "积分结算", amount: 980, status: "已完成", note: "8月上旬结算" },
      { date: "2026-08-01", type: "提现到账", amount: -800, status: "已完成", note: "TRC20 · TRX7k...mN9" },
      { date: "2026-08-01", type: "积分结算", amount: 1200, status: "已完成", note: "7月结算" },
      { date: "2026-07-15", type: "提现到账", amount: -600, status: "已完成", note: "BSC · 0xA3f...9B2c" },
    ],
    "sb1920mg": [
      { date: "2026-09-01", type: "积分结算", amount: 480, status: "已完成", note: "8月下旬结算" },
      { date: "2026-08-15", type: "提现到账", amount: -400, status: "已完成", note: "BSC · 0xA3f...9B2c" },
      { date: "2026-08-01", type: "积分结算", amount: 620, status: "已完成", note: "7月结算" },
    ],
  };

  const memberInfo = MEMBER_DATA[ticket?.merchant ?? ""];
  const ledger = LEDGER_DATA[ticket?.merchant ?? ""] ?? [];

  const priorityColor = (p: string) => p==="urgent"?C.red:p==="high"?C.orange:p==="medium"?C.blue:C.muted;
  const priorityLabel = (p: string) => ({"urgent":"紧急","high":"高","medium":"普通","low":"低"} as Record<string,string>)[p]??p;
  const statusLabel   = (s: string) => ({"open":"待接入","processing":"处理中","resolved":"已解决","closed":"已关闭"} as Record<string,string>)[s]??s;
  const statusColor   = (s: string) => s==="open"?C.orange:s==="processing"?C.blue:s==="resolved"?C.green:C.muted;

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [msgs, activeTicket]);

  const send = () => {
    const t = input.trim(); if (!t) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`;
    const newMsg: CsMsg = mode === "ai"
      ? { from: "ai", text: t, time, sender: "AI助手" }
      : { from: "agent", text: t, time, sender: assignAgent };
    setMsgMap(m => ({ ...m, [activeTicket]: [...(m[activeTicket]??[]), newMsg] }));
    setInput("");
    if (mode === "ai") {
      setAiTyping(true);
      setTimeout(() => {
        const reply: CsMsg = { from: "ai", text: getAiReply(t), time, sender: "AI助手" };
        setMsgMap(m => ({ ...m, [activeTicket]: [...(m[activeTicket]??[]), reply] }));
        setAiTyping(false);
      }, 900);
    }
    if (status === "open") setTicketStatus(s => ({ ...s, [activeTicket]: "processing" }));
  };

  return (
    <AdminPage>
      <AdminTitle action={
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.muted }}>在线客服：</span>
          {CS_AGENTS.filter(a => a.id !== "ai").map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: a.status==="online"?C.green:a.status==="busy"?C.orange:C.muted }} />
              <span style={{ fontSize: 12, color: C.text }}>{a.name}</span>
            </div>
          ))}
        </div>
      }>客服系统</AdminTitle>

      <div style={{ display: "flex", gap: 0, height: "calc(100vh - 160px)", minHeight: 500, background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>

        {/* ── Left: ticket list ── */}
        <div style={{ width: 240, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, fontSize: 12, fontWeight: 700, color: C.text, background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>工单列表</span>
            <span style={{ fontSize: 10, background: C.orange+"18", color: C.orange, borderRadius: 4, padding: "2px 7px", fontWeight: 700 }}>{ADMIN_TICKETS.filter(t=>ticketStatus[t.id]==="open"||ticketStatus[t.id]==="processing").length} 处理中</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto" as const }}>
            {ADMIN_TICKETS.map(t => {
              const st = ticketStatus[t.id] ?? t.status;
              const isActive = activeTicket === t.id;
              return (
                <div key={t.id} onClick={() => setActiveTicket(t.id)}
                  style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", background: isActive ? "#FFF9E6" : "transparent", borderLeft: `3px solid ${isActive ? C.yellow : "transparent"}`, transition: "background .15s" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.dark }}>{t.merchant}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: priorityColor(t.priority)+"18", color: priorityColor(t.priority) }}>{priorityLabel(t.priority)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.text, marginBottom: 4, lineHeight: 1.4 }}>{t.subject}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 9, fontFamily: F.mono, color: C.muted }}>{t.id}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: statusColor(st) }}>{statusLabel(st)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Center: chat area ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Chat header */}
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, background: "#FAFAFA", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{ticket?.subject}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{ticket?.merchant} · {activeTicket} · {ticket?.created}</div>
            </div>
            {/* Mode toggle */}
            <div style={{ display: "flex", background: "#EFEFEF", borderRadius: 7, padding: 3, gap: 2 }}>
              {([["human","人工客服"],["ai","AI 客服"]] as [string,string][]).map(([m, label]) => (
                <button key={m} onClick={() => setMode(m as "human"|"ai")}
                  style={{ padding: "5px 12px", borderRadius: 5, border: "none", background: mode===m ? C.dark : "transparent", color: mode===m ? C.yellow : C.muted, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: F.cn, transition: "background .15s" }}>
                  {label}
                </button>
              ))}
            </div>
            {/* Status badge */}
            <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, background: statusColor(status)+"15", color: statusColor(status) }}>{statusLabel(status)}</span>
            {/* Close button */}
            {status !== "closed" && status !== "resolved" && (
              <button onClick={() => setTicketStatus(s => ({ ...s, [activeTicket]: "resolved" }))}
                style={{ padding: "5px 12px", border: `1px solid ${C.green}`, borderRadius: 6, background: "#fff", color: C.green, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: F.cn }}>
                标记解决
              </button>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto" as const, padding: "16px", display: "flex", flexDirection: "column", gap: 10, background: "#F8F9FB" }}>
            {msgs.length === 0 && (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 13 }}>暂无消息记录</div>
            )}
            {msgs.map((m, i) => {
              const isUser = m.from === "merchant";
              const isAi   = m.from === "ai";
              return (
                <div key={i} style={{ display: "flex", flexDirection: isUser ? "row" : "row-reverse", gap: 8, alignItems: "flex-end" }}>
                  {/* Avatar */}
                  <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11,
                    background: isUser ? "#E5E7EB" : isAi ? "linear-gradient(135deg,#7C3AED,#4F46E5)" : C.dark,
                    color: isUser ? C.muted : "#FFD700" }}>
                    {isUser ? m.sender?.slice(0,2).toUpperCase() : isAi ? "AI" : CS_AGENTS.find(a=>a.id===m.sender)?.avatar ?? "客"}
                  </div>
                  <div style={{ maxWidth: "65%" }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 3, textAlign: isUser ? "left" : "right" }}>
                      {isUser ? m.sender : isAi ? "AI 助手" : CS_AGENTS.find(a=>a.id===m.sender)?.name ?? m.sender} · {m.time}
                    </div>
                    <div style={{ padding: "9px 12px", borderRadius: isUser ? "10px 10px 10px 2px" : "10px 10px 2px 10px",
                      background: isUser ? "#fff" : isAi ? "linear-gradient(135deg,#EDE9FE,#E0E7FF)" : C.dark,
                      color: isUser ? C.text : isAi ? "#4C1D95" : "#fff",
                      fontSize: 13, lineHeight: 1.6, boxShadow: "0 1px 3px rgba(0,0,0,.07)" }}>
                      {m.text}
                    </div>
                  </div>
                </div>
              );
            })}
            {aiTyping && (
              <div style={{ display: "flex", flexDirection: "row-reverse", gap: 8, alignItems: "flex-end" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 800 }}>AI</div>
                <div style={{ padding: "9px 16px", borderRadius: "10px 10px 2px 10px", background: "#EDE9FE", color: "#4C1D95", fontSize: 13 }}>
                  <span style={{ letterSpacing: 2 }}>···</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 16px", background: "#fff" }}>
            {mode === "ai" && (
              <div style={{ marginBottom: 8, padding: "6px 10px", background: "#EDE9FE", borderRadius: 6, fontSize: 11, color: "#4C1D95", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7C3AED" }} />
                AI 客服模式：消息将由 AI 自动回复并学习归档
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <textarea value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={mode === "ai" ? "输入消息，AI 将自动回复用户…（Enter 发送，Shift+Enter 换行）" : "输入回复内容…（Enter 发送，Shift+Enter 换行）"}
                style={{ flex: 1, padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, resize: "none" as const, height: 60, fontFamily: F.cn, outline: "none", lineHeight: 1.5 }}
                onFocus={e => e.target.style.borderColor = C.yellow} onBlur={e => e.target.style.borderColor = C.border} />
              <button onClick={send}
                style={{ width: 48, alignSelf: "flex-end", height: 40, background: mode==="ai" ? "#7C3AED" : C.dark, border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: sidebar ── */}
        <div style={{ width: 220, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, background: "#FAFAFA" }}>
          {/* Assign agent */}
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: .5 }}>分配客服</div>
            {CS_AGENTS.map(a => (
              <div key={a.id} onClick={() => { setAssignAgent(a.id); setMode(a.id==="ai"?"ai":"human"); }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 7, cursor: "pointer", marginBottom: 3,
                  background: assignAgent===a.id ? (a.id==="ai"?"#EDE9FE":C.dark) : "transparent",
                  border: `1px solid ${assignAgent===a.id ? (a.id==="ai"?"#7C3AED":C.dark) : "transparent"}`,
                  transition: "background .15s" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 10,
                  background: a.id==="ai" ? "linear-gradient(135deg,#7C3AED,#4F46E5)" : assignAgent===a.id ? C.yellow+"33" : "#E5E7EB",
                  color: a.id==="ai" ? "#fff" : assignAgent===a.id ? C.yellow : C.muted }}>
                  {a.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: assignAgent===a.id ? (a.id==="ai"?"#4C1D95":C.yellow) : C.dark }}>{a.name}</div>
                  <div style={{ fontSize: 10, color: assignAgent===a.id ? (a.id==="ai"?"#7C3AED":"rgba(255,215,0,.6)") : C.muted }}>{a.role}</div>
                </div>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: a.status==="online"?C.green:a.status==="busy"?C.orange:C.muted, flexShrink: 0 }} />
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: "#fff" }}>
            {([["member","会员"], ["ledger","台账"], ["info","工单"]] as [string,string][]).map(([tab, label]) => {
              const show = tab !== "ledger" || isWithdrawTicket;
              if (!show) return null;
              return (
                <button key={tab} onClick={() => setRightTab(tab as "member"|"ledger"|"info")}
                  style={{ flex: 1, padding: "8px 4px", border: "none", borderBottom: `2px solid ${rightTab===tab ? C.yellow : "transparent"}`, background: "transparent", fontSize: 11, fontWeight: rightTab===tab ? 800 : 500, color: rightTab===tab ? C.dark : C.muted, cursor: "pointer", fontFamily: F.cn, transition: "color .15s" }}>
                  {label}
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, overflowY: "auto" as const }}>
            {/* ── 会员信息 tab ── */}
            {rightTab === "member" && (
              <div style={{ padding: "12px 14px" }}>
                {memberInfo ? (<>
                  {/* Avatar + level */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "10px 12px", background: "#F8F9FB", borderRadius: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: C.yellow, flexShrink: 0 }}>
                      {ticket?.merchant?.slice(2,4).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{ticket?.merchant}</div>
                      <div style={{ fontSize: 10, marginTop: 2 }}>
                        <span style={{ background: memberInfo.level==="铂金"?"#E8F4FD":memberInfo.level==="黄金"?"#FFFDE7":"#F3F4F6", color: memberInfo.level==="铂金"?C.blue:memberInfo.level==="黄金"?"#92400E":C.muted, padding: "1px 7px", borderRadius: 4, fontWeight: 700 }}>{memberInfo.level}会员</span>
                      </div>
                    </div>
                  </div>
                  {[
                    { label: "注册时间", value: memberInfo.joined },
                    { label: "上级", value: memberInfo.referer },
                    { label: "最后登录", value: memberInfo.lastLogin.slice(5) },
                    { label: "绑定钱包", value: memberInfo.wallet },
                  ].map(r => (
                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 11 }}>
                      <span style={{ color: C.muted }}>{r.label}</span>
                      <span style={{ fontWeight: 600, color: C.dark, textAlign: "right" as const, maxWidth: 130, wordBreak: "break-all" as const }}>{r.value}</span>
                    </div>
                  ))}

                  <div style={{ margin: "10px 0", borderTop: `1px solid ${C.border}` }} />
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase" as const, letterSpacing: .5, marginBottom: 8 }}>资产概览</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
                    {[
                      { label: "终端数", value: memberInfo.terminals, unit: "台", color: C.blue },
                      { label: "积分余额", value: memberInfo.pts.toLocaleString(), unit: "pts", color: C.orange },
                      { label: "云币余额", value: memberInfo.yunbi, unit: "YB", color: C.yellow },
                      { label: "待审提现", value: memberInfo.pendingWd, unit: "YB", color: memberInfo.pendingWd>0?C.red:C.muted },
                    ].map(s => (
                      <div key={s.label} style={{ background: "#F8F9FB", borderRadius: 7, padding: "8px 10px" }}>
                        <div style={{ fontSize: 9, color: C.muted, marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: F.mono, color: s.color }}>{s.value}<span style={{ fontSize: 9, fontWeight: 500, color: C.muted, marginLeft: 2 }}>{s.unit}</span></div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {[
                      { label: "累计收益", value: memberInfo.totalEarned },
                      { label: "累计提现", value: memberInfo.totalWithdrawn },
                    ].map(s => (
                      <div key={s.label} style={{ background: "#F0FDF4", borderRadius: 7, padding: "8px 10px" }}>
                        <div style={{ fontSize: 9, color: C.muted, marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, fontFamily: F.mono, color: C.green }}>{s.value}<span style={{ fontSize: 9, fontWeight: 500, color: C.muted, marginLeft: 2 }}>YB</span></div>
                      </div>
                    ))}
                  </div>

                  <div style={{ margin: "12px 0 8px", borderTop: `1px solid ${C.border}` }} />
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase" as const, letterSpacing: .5, marginBottom: 8 }}>快捷回复</div>
                  {["稍等，正在查询", "已提交财务处理", "请提供账号ID", "问题已解决，请确认"].map(q => (
                    <button key={q} onClick={() => setInput(q)}
                      style={{ display: "block", width: "100%", textAlign: "left" as const, padding: "6px 10px", marginBottom: 4, fontSize: 11, border: `1px solid ${C.border}`, borderRadius: 6, background: "#fff", color: C.text, cursor: "pointer", fontFamily: F.cn }}>
                      {q}
                    </button>
                  ))}
                </>) : (
                  <div style={{ padding: "20px 0", textAlign: "center" as const, color: C.muted, fontSize: 12 }}>暂无会员数据</div>
                )}
              </div>
            )}

            {/* ── 台账 tab ── */}
            {rightTab === "ledger" && isWithdrawTicket && (
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>资金台账</span>
                  <span style={{ fontSize: 10, color: C.blue }}>{ticket?.merchant}</span>
                </div>
                {/* Summary */}
                {memberInfo && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
                    {[
                      { label: "累计入账", value: `+${memberInfo.totalEarned}`, color: C.green },
                      { label: "累计提现", value: `-${memberInfo.totalWithdrawn}`, color: C.red },
                      { label: "云币余额", value: `${memberInfo.yunbi}`, color: C.blue },
                      { label: "待审", value: memberInfo.pendingWd > 0 ? `-${memberInfo.pendingWd}` : "0", color: memberInfo.pendingWd>0?C.orange:C.muted },
                    ].map(s => (
                      <div key={s.label} style={{ background: "#F8F9FB", borderRadius: 7, padding: "7px 10px" }}>
                        <div style={{ fontSize: 9, color: C.muted, marginBottom: 1 }}>{s.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, fontFamily: F.mono, color: s.color }}>{s.value}<span style={{ fontSize: 9, color: C.muted, marginLeft: 2 }}>YB</span></div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Ledger entries */}
                {ledger.length > 0 ? ledger.map((entry, i) => (
                  <div key={i} style={{ padding: "8px 10px", marginBottom: 5, background: entry.amount < 0 ? "#FFF5F5" : "#F0FDF4", borderRadius: 7, borderLeft: `3px solid ${entry.amount < 0 ? C.red : C.green}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.dark }}>{entry.type}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, fontFamily: F.mono, color: entry.amount < 0 ? C.red : C.green }}>{entry.amount > 0 ? "+" : ""}{entry.amount}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, color: C.muted }}>{entry.date}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: entry.status==="审核中"?C.orange:C.green }}>{entry.status}</span>
                    </div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2, fontFamily: F.mono }}>{entry.note}</div>
                  </div>
                )) : (
                  <div style={{ padding: "20px 0", textAlign: "center" as const, color: C.muted, fontSize: 12 }}>暂无台账记录</div>
                )}
              </div>
            )}

            {/* ── 工单 tab ── */}
            {rightTab === "info" && (
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase" as const, letterSpacing: .5, marginBottom: 10 }}>工单详情</div>
                {[
                  { label: "工单号", value: activeTicket },
                  { label: "商家 ID", value: ticket?.merchant },
                  { label: "创建时间", value: ticket?.created },
                  { label: "最后更新", value: ticket?.updated },
                  { label: "消息数量", value: `${msgs.length} 条` },
                  { label: "优先级", value: priorityLabel(ticket?.priority ?? ""), color: priorityColor(ticket?.priority ?? "") },
                  { label: "状态", value: statusLabel(status), color: statusColor(status) },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 11 }}>
                    <span style={{ color: C.muted }}>{row.label}</span>
                    <span style={{ fontWeight: 700, color: (row as {color?:string}).color ?? C.dark, textAlign: "right" as const }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase" as const, letterSpacing: .5, marginBottom: 8 }}>快捷操作</div>
                  {[
                    { label: "标记解决", action: () => setTicketStatus(s => ({ ...s, [activeTicket]: "resolved" })), color: C.green },
                    { label: "标记关闭", action: () => setTicketStatus(s => ({ ...s, [activeTicket]: "closed" })), color: C.muted },
                  ].map(btn => (
                    <button key={btn.label} onClick={btn.action}
                      style={{ display: "block", width: "100%", textAlign: "left" as const, padding: "7px 10px", marginBottom: 5, fontSize: 11, border: `1px solid ${btn.color}22`, borderRadius: 6, background: `${btn.color}08`, color: btn.color, cursor: "pointer", fontWeight: 700, fontFamily: F.cn }}>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminPage>
  );
}

/* ─── Admin Risk (风控) ──────────────────────────────────── */
function AdminRiskPage() {
  return (
    <AdminPage>
      <AdminTitle>风险控制</AdminTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          { label: "已冻结账号", value: ADMIN_RISK_EVENTS.filter(e=>e.status==="frozen").length, color: C.red },
          { label: "审核中", value: ADMIN_RISK_EVENTS.filter(e=>e.status==="reviewing").length, color: C.orange },
          { label: "已清除", value: ADMIN_RISK_EVENTS.filter(e=>e.status==="cleared").length, color: C.green },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 900, fontFamily: F.mono, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <AdminTitle>风险事件</AdminTitle>
          <AdminTable heads={["时间", "商家", "类型", "风险分", "动作", "状态", "操作"]}>
            {ADMIN_RISK_EVENTS.map((e, i) => (
              <tr key={e.id} style={{ borderBottom: "1px solid #F0F0F0", background: i%2===0?"#fff":"#FAFAFA" }}>
                <td style={{ padding: "8px 10px", fontSize: 11, color: C.muted, fontFamily: F.mono, whiteSpace: "nowrap" as const }}>{e.time.slice(5)}</td>
                <td style={{ padding: "8px 10px", fontWeight: 700, fontSize: 12 }}>{e.merchant}</td>
                <td style={{ padding: "8px 10px", fontSize: 11 }}>{e.type}</td>
                <td style={{ padding: "8px 10px", fontFamily: F.mono, fontWeight: 700, color: e.score >= 80 ? C.red : e.score >= 60 ? C.orange : C.muted }}>{e.score}</td>
                <td style={{ padding: "8px 10px", fontSize: 11 }}>{e.action}</td>
                <td style={{ padding: "8px 10px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: e.status==="frozen"?C.red+"18":e.status==="reviewing"?"#FFF7ED":"#F0FDF4", color: e.status==="frozen"?C.red:e.status==="reviewing"?C.orange:C.green }}>
                    {e.status==="frozen"?"已冻结":e.status==="reviewing"?"审核中":"已清除"}
                  </span>
                </td>
                <td style={{ padding: "8px 10px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {e.status==="frozen" && <ABtn variant="success">解冻</ABtn>}
                    {e.status==="reviewing" && <ABtn variant="danger">冻结</ABtn>}
                    <ABtn>详情</ABtn>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        </div>

        <div>
          <AdminTitle>自动触发规则</AdminTitle>
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
            {ADMIN_RISK_RULES.map((rule, i) => (
              <div key={rule.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: i<ADMIN_RISK_RULES.length-1?`1px solid ${C.border}`:"none" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{rule.name}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{rule.desc}</div>
                </div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: F.mono }}>{rule.trigger}</div>
                <div onClick={() => {}} style={{ width: 36, height: 20, borderRadius: 10, background: rule.enabled ? C.dark : "#D1D5DB", cursor: "pointer", position: "relative" as const, flexShrink: 0, transition: "background .2s" }}>
                  <div style={{ position: "absolute" as const, top: 3, left: rule.enabled ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPage>
  );
}

/* ─── Admin Announcements ──────────────────────────────── */
function AdminAnnouncementsPage() {
  const targetLabel = (t: string) => ({all:"全部用户",gold:"黄金及以上",node:"节点商家",merchant:"所有商家"})[t]??t;
  const statusColor = (s: string) => s==="published"?C.green:s==="draft"?C.muted:C.orange;
  const statusLabel = (s: string) => ({published:"已发布",draft:"草稿",scheduled:"定时"})[s]??s;

  return (
    <AdminPage>
      <AdminTitle action={<ABtn variant="primary">+ 新建公告</ABtn>}>公告管理</AdminTitle>
      <AdminTable heads={["标题", "目标用户", "状态", "置顶", "发布时间", "操作"]}>
        {ADMIN_ANNOUNCEMENTS_DATA.map((a, i) => (
          <tr key={a.id} style={{ borderBottom: "1px solid #F0F0F0", background: i%2===0?"#fff":"#FAFAFA" }}>
            <td style={{ padding: "9px 12px", fontSize: 13, fontWeight: a.pinned ? 700 : 400, color: C.dark }}>
              {a.pinned && <span style={{ fontSize: 9, fontWeight: 800, marginRight: 6, padding: "1px 5px", borderRadius: 3, background: C.yellow+"30", color: "#A0800D" }}>置顶</span>}
              {a.title}
            </td>
            <td style={{ padding: "9px 12px", fontSize: 12, color: C.muted }}>{targetLabel(a.target)}</td>
            <td style={{ padding: "9px 12px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: statusColor(a.status)+"18", color: statusColor(a.status) }}>{statusLabel(a.status)}</span>
            </td>
            <td style={{ padding: "9px 12px", textAlign: "center" as const }}>
              <div style={{ width: 32, height: 18, borderRadius: 9, background: a.pinned?C.dark:"#D1D5DB", cursor: "pointer", position: "relative" as const, display: "inline-block" }}>
                <div style={{ position: "absolute" as const, top: 2, left: a.pinned?16:2, width: 14, height: 14, borderRadius: "50%", background: "#fff" }} />
              </div>
            </td>
            <td style={{ padding: "9px 12px", fontSize: 11, color: C.muted, fontFamily: F.mono }}>{a.publishedAt || "—"}</td>
            <td style={{ padding: "9px 12px" }}>
              <div style={{ display: "flex", gap: 5 }}>
                <ABtn>编辑</ABtn>
                {a.status==="draft" && <ABtn variant="success">发布</ABtn>}
                {a.status==="published" && <ABtn variant="danger">撤回</ABtn>}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </AdminPage>
  );
}

/* ═══════════════════════════════════════════════════════════
   ADMIN SITE SHELL
══════════════════════════════════════════════════════════════ */

type AdminNav = { key: AdminPage; icon: () => React.ReactNode; label: string; badge?: number };

const NavIcoDashboard  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const NavIcoMerchants  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const NavIcoOrders     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const NavIcoHistory    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 0 .5-4.5"/><polyline points="3 3 3 9 9 9"/></svg>;
const NavIcoRedempt    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const NavIcoCards      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const NavIcoConfig     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const NavIcoLogs       = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const NavIcoNodes      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="12" y1="8" x2="5" y2="16"/><line x1="12" y1="8" x2="19" y2="16"/></svg>;
const NavIcoParams     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/></svg>;
const NavIcoAdmins     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const NavIcoCs         = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const NavIcoRisk       = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const NavIcoAnnounce   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;

const ADMIN_NAV: AdminNav[] = [
  { key: "dashboard",     icon: NavIcoDashboard, label: "数据总台" },
  { key: "merchants",     icon: NavIcoMerchants, label: "商家管理" },
  { key: "orders",        icon: NavIcoOrders,    label: "订单中心" },
  { key: "history",       icon: NavIcoHistory,   label: "历史记录" },
  { key: "redemptions",   icon: NavIcoRedempt,   label: "兑现管理", badge: 3 },
  { key: "nodes",         icon: NavIcoNodes,     label: "节点管理" },
  { key: "cards",         icon: NavIcoCards,     label: "激活卡管理" },
  { key: "announcements", icon: NavIcoAnnounce,  label: "公告管理" },
  { key: "admins",        icon: NavIcoAdmins,    label: "账号权限" },
  { key: "cs",            icon: NavIcoCs,        label: "客服系统", badge: ADMIN_TICKETS.filter(t=>t.status==="open").length },
  { key: "riskcontrol",   icon: NavIcoRisk,      label: "风险控制", badge: ADMIN_RISK_EVENTS.filter(e=>e.status==="frozen"||e.status==="reviewing").length },
  { key: "config",        icon: NavIcoConfig,    label: "系统配置" },
  { key: "logs",          icon: NavIcoLogs,      label: "操作日志" },
];

function AdminSite({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<AdminPage>("dashboard");

  const pages: Record<AdminPage, React.ReactNode> = {
    dashboard:     <AdminDashboardPage />,
    merchants:     <AdminMerchantsPage />,
    orders:        <AdminOrdersPage />,
    history:       <AdminHistoryPage />,
    redemptions:   <AdminRedemptionsPage />,
    nodes:         <AdminNodesPage />,
    cards:         <AdminCardsPage />,
    admins:        <AdminAdminsPage />,
    cs:            <AdminCsPage />,
    riskcontrol:   <AdminRiskPage />,
    announcements: <AdminAnnouncementsPage />,
    config:        <AdminConfigPage />,
    logs:          <AdminLogsPage />,
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", fontFamily: F.cn, background: "#F4F5F7" }}>

      {/* Header */}
      <div style={{ height: 56, background: "#0F172A", display: "flex", alignItems: "center", padding: "0 22px", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <Logo size="sm" dark={true} />
        <span style={{ fontSize: 10, color: "rgba(255,255,255,.25)", marginLeft: 12, letterSpacing: 2, textTransform: "uppercase" as const, fontFamily: F.en }}>Admin Console</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.55)" }}>superadmin</span>
          </div>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,.1)" }} />
          <button onClick={() => { if (window.confirm("确认退出后台管理？")) onLogout(); }} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.35)", cursor: "pointer", fontSize: 12, fontFamily: F.cn, display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            退出
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{ width: 200, background: "#0F172A", display: "flex", flexDirection: "column", flexShrink: 0, padding: "16px 0" }}>
          <div style={{ padding: "0 12px", marginBottom: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.2)", letterSpacing: 2, textTransform: "uppercase" as const, padding: "0 8px" }}>主导航</div>
          </div>
          {ADMIN_NAV.map((n) => {
            const Icon = n.icon;
            return (
              <button key={n.key} onClick={() => setPage(n.key)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 20px",
                border: "none", background: page === n.key ? "rgba(255,215,0,.07)" : "transparent",
                cursor: "pointer", textAlign: "left" as const, width: "100%",
                borderLeft: `3px solid ${page === n.key ? C.yellow : "transparent"}`,
                marginBottom: 1,
              }}>
                <span style={{ color: page === n.key ? C.yellow : "rgba(255,255,255,.38)", display: "flex", alignItems: "center", flexShrink: 0 }}><Icon /></span>
                <span style={{ fontSize: 13, fontWeight: page === n.key ? 700 : 400, color: page === n.key ? C.yellow : "rgba(255,255,255,.5)", fontFamily: F.cn }}>{n.label}</span>
                {n.badge && (
                  <span style={{ marginLeft: "auto", background: C.red, color: "#fff", borderRadius: 99, fontSize: 10, fontWeight: 800, padding: "1px 6px", minWidth: 18, textAlign: "center" as const }}>{n.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto" }}>{pages[page]}</div>
      </div>

      {/* Status bar */}
      <div style={{ height: 24, background: "#0F172A", display: "flex", alignItems: "center", padding: "0 16px", gap: 20, fontSize: 11, flexShrink: 0 }}>
        <span style={{ color: C.green }}>● 系统正常</span>
        <span style={{ color: "rgba(255,255,255,.35)" }}>在线商家 <strong style={{ color: C.yellow }}>847</strong></span>
        <span style={{ color: "rgba(255,255,255,.35)" }}>今日任务 <strong style={{ color: "#fff" }}>3,640</strong></span>
        <span style={{ color: "rgba(255,255,255,.25)", marginLeft: "auto", fontFamily: F.mono }}>Admin v1.0.0 · {new Date().toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
      </div>
    </div>
  );
}

/* ── Admin Login ── */
function AdminLogin({ onEnter }: { onEnter: () => void }) {
  const [user, setUser] = useState("");
  const [pwd,  setPwd]  = useState("");
  const [step, setStep] = useState<"idle" | "loading" | "ok">("idle");
  const [err,  setErr]  = useState("");

  const doLogin = () => {
    if (!user || !pwd) { setErr("请输入账号和密码"); return; }
    setErr(""); setStep("loading");
    setTimeout(() => {
      if (user === "admin" && pwd === "admin123") { setStep("ok"); setTimeout(onEnter, 800); }
      else { setStep("idle"); setErr("账号或密码错误"); }
    }, 1200);
  };

  return (
    <div style={{ width: "100%", height: "100%", background: "#060d1f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.cn }}>
      {/* dot grid bg */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {Array.from({ length: 40 }, (_, col) => Array.from({ length: 25 }, (_, row) => {
          const x = col * 28 + 14, y = row * 28 + 14;
          return <circle key={`${col}-${row}`} cx={x} cy={y} r="1" fill="#B8C4D8" fillOpacity="0.07" />;
        }))}
      </svg>

      <div style={{ position: "relative", zIndex: 1, width: 400, background: "#0a1628", border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "40px 36px", boxShadow: "0 40px 80px rgba(0,0,0,.6)" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Logo size="lg" dark={true} />
          <div style={{ marginTop: 10, fontSize: 10, color: "rgba(255,255,255,.22)", letterSpacing: 3.5, textTransform: "uppercase" as const, fontFamily: F.en }}>Admin Console</div>
        </div>

        {/* Fields */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", marginBottom: 6 }}>管理员账号</div>
          <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="admin"
            style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, outline: "none", fontFamily: F.cn, boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", marginBottom: 6 }}>密码</div>
          <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doLogin()} placeholder="••••••••"
            style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, outline: "none", fontFamily: F.cn, boxSizing: "border-box" }} />
        </div>

        {err && <div style={{ marginBottom: 14, fontSize: 12, color: C.red, textAlign: "center" }}>{err}</div>}

        <button onClick={doLogin} disabled={step === "loading" || step === "ok"}
          style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: step === "ok" ? C.green : C.yellow, color: C.dark, fontWeight: 900, fontSize: 15, cursor: step === "loading" ? "wait" : "pointer", fontFamily: F.cn, letterSpacing: .5 }}>
          {step === "loading" ? "验证中…" : step === "ok" ? "✓ 进入后台…" : "登录管理后台"}
        </button>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,.2)" }}>
          演示账号：admin / admin123
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════════════ */

export default function App() {
  const isAdmin = window.location.pathname.startsWith("/admin");
  const [state, setState] = useState<"login" | "merchant">("login");
  const [adminState, setAdminState] = useState<"login" | "admin">("login");

  if (isAdmin) {
    if (adminState === "login") return <AdminLogin onEnter={() => setAdminState("admin")} />;
    return <AdminSite onLogout={() => setAdminState("login")} />;
  }

  if (state === "login") return <LoginScreen onEnter={() => setState("merchant")} />;
  return <MerchantSite onLogout={() => setState("login")} />;
}
