import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid } from "recharts";
import { StatusDot, LiveBadge } from "./Icons";

const tempData = Array.from({ length: 24 }, (_, i) => ({
  t: `${String(i).padStart(2, "0")}:00`,
  v: -25 + Math.sin(i * 0.42) * 5.5 + (i < 6 || i > 20 ? -3 : 0),
}));

const energyData = Array.from({ length: 24 }, (_, i) => ({
  t: `${String(i).padStart(2, "0")}:00`,
  gen: 172 + Math.sin(i * 0.38) * 14,
  con: 168 + Math.sin(i * 0.44) * 12,
}));

const fuelData = [
  { d: "Sep 5", v: 7900 }, { d: "Sep 6", v: 7740 }, { d: "Sep 7", v: 7580 },
  { d: "Sep 8", v: 7420 }, { d: "Sep 9", v: 7310 }, { d: "Sep 10", v: 7240 }, { d: "Sep 11", v: 7200 },
];

const buildings = [
  { id: "main", label: "Main Station", x: 38, y: 28, w: 24, h: 18, status: "normal" as const },
  { id: "power", label: "Power House", x: 8, y: 46, w: 18, h: 13, status: "warning" as const },
  { id: "fuel", label: "Fuel Storage", x: 8, y: 20, w: 14, h: 16, status: "warning" as const },
  { id: "lab", label: "Laboratory", x: 66, y: 22, w: 19, h: 15, status: "monitoring" as const },
  { id: "living", label: "Living Quarters", x: 65, y: 46, w: 19, h: 15, status: "normal" as const },
  { id: "comm", label: "Comm Tower", x: 43, y: 60, w: 13, h: 9, status: "normal" as const },
  { id: "emerg", label: "Emergency Fac.", x: 27, y: 72, w: 14, h: 9, status: "normal" as const },
  { id: "battery", label: "Battery Bank", x: 24, y: 20, w: 11, h: 8, status: "monitoring" as const },
];

const statusColors: Record<string, string> = {
  normal: "#10b981",
  warning: "#f59e0b",
  critical: "#ef4444",
  monitoring: "#00c8e8",
};

const kpis = [
  { label: "Energy Load", value: "185 kW", sub: "+2.1% from avg", color: "#00c8e8", sparkline: [170, 175, 180, 178, 183, 185] },
  { label: "Fuel Level", value: "7,200 L", sub: "72% · trending ↑8%", color: "#f59e0b", sparkline: [7900, 7740, 7580, 7420, 7310, 7200] },
  { label: "Battery SOC", value: "82%", sub: "Charging +2.1 kW", color: "#10b981", sparkline: [78, 79, 80, 81, 81, 82] },
  { label: "Crew On-Site", value: "38", sub: "All personnel safe", color: "#94a3b8", sparkline: [38, 38, 38, 38, 38, 38] },
  { label: "Active Alerts", value: "03", sub: "1 critical · 2 warning", color: "#ef4444", sparkline: [1, 2, 2, 3, 3, 3] },
  { label: "Equip. Health", value: "94%", sub: "2 items attention", color: "#10b981", sparkline: [96, 95, 95, 94, 94, 94] },
];

export default function Overview({ station }: { station: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [syncSecs, setSyncSecs] = useState(4);

  useEffect(() => {
    const t = setInterval(() => setSyncSecs(s => s >= 60 ? 1 : s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Page header + telemetry strip */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.06em", color: "#e2e8f0", lineHeight: 1.2 }}>
            {station} STATION
          </h1>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>Remote Operations Overview · Mission-critical telemetry</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LiveBadge/>
          <div className="font-mono" style={{ fontSize: 10, color: "#2d3d50", padding: "4px 10px", border: "1px solid rgba(0,200,232,0.08)", borderRadius: 4 }}>
            SYNC: {syncSecs}s AGO
          </div>
          <div style={{ padding: "4px 12px", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 4, background: "rgba(16,185,129,0.06)" }}>
            <span className="font-mono" style={{ fontSize: 10, color: "#10b981", letterSpacing: "0.1em" }}>● STATION OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* Row 1: Health index + KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12 }}>
        {/* Health index */}
        <div className="kpi-card glow-cyan" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #00c8e8, transparent)" }}/>
          <div className="section-label" style={{ marginBottom: 14 }}>Station Health Index</div>
          <HealthRing value={92}/>
          <div className="font-display" style={{ fontSize: 34, fontWeight: 700, color: "#00c8e8", marginTop: 6, lineHeight: 1 }}>92%</div>
          <div className="font-mono" style={{ fontSize: 10, color: "#10b981", letterSpacing: "0.12em", marginTop: 4 }}>STATUS: STABLE</div>
          <div style={{ marginTop: 12, width: "100%", display: "flex", flexDirection: "column", gap: 5 }}>
            {[
              { label: "Infrastructure", v: 98, c: "#10b981" },
              { label: "Energy Systems", v: 82, c: "#f59e0b" },
              { label: "Logistics", v: 74, c: "#f59e0b" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span className="section-label">{s.label}</span>
                  <span className="font-mono" style={{ fontSize: 9, color: s.c }}>{s.v}%</span>
                </div>
                <div style={{ height: 2, background: "rgba(148,163,184,0.1)", borderRadius: 1 }}>
                  <div style={{ width: `${s.v}%`, height: "100%", background: s.c, borderRadius: 1, opacity: 0.8 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {kpis.map(k => (
            <div key={k.label} className="kpi-card" style={{ position: "relative" }}>
              <div className="section-label" style={{ marginBottom: 6 }}>{k.label}</div>
              <div className="font-display" style={{ fontSize: 24, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: 10, color: "#475569", marginTop: 3, marginBottom: 8 }}>{k.sub}</div>
              {/* Mini sparkline */}
              <svg width="100%" height="24" style={{ opacity: 0.6 }}>
                {k.sparkline.map((v, i) => {
                  if (i === 0) return null;
                  const minV = Math.min(...k.sparkline);
                  const maxV = Math.max(...k.sparkline);
                  const range = maxV - minV || 1;
                  const x1 = ((i - 1) / (k.sparkline.length - 1)) * 100;
                  const x2 = (i / (k.sparkline.length - 1)) * 100;
                  const y1 = 22 - ((k.sparkline[i - 1] - minV) / range) * 20;
                  const y2 = 22 - ((v - minV) / range) * 20;
                  return <line key={i} x1={`${x1}%`} y1={y1} x2={`${x2}%`} y2={y2} stroke={k.color} strokeWidth="1.2"/>;
                })}
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Station map + Intelligence panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 12 }}>
        {/* Station map */}
        <div className="glass" style={{ borderRadius: 8, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div className="section-label">Facility Map</div>
              <div style={{ fontSize: 10, color: "#2d3d50", marginTop: 1 }}>Click any structure to inspect</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {["normal", "warning", "monitoring"].map(s => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <StatusDot status={s as any}/>
                  <span style={{ fontSize: 9, color: "#475569", textTransform: "capitalize" }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "relative", background: "rgba(7,13,26,0.8)", borderRadius: 6, border: "1px solid rgba(0,200,232,0.07)", overflow: "hidden" }}>
            <svg viewBox="0 0 100 88" style={{ width: "100%", height: 220 }}>
              <defs>
                <pattern id="ovgrid" width="5" height="5" patternUnits="userSpaceOnUse">
                  <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(0,200,232,0.05)" strokeWidth="0.15"/>
                </pattern>
                <filter id="selglow">
                  <feGaussianBlur stdDeviation="0.6" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <rect width="100" height="88" fill="url(#ovgrid)"/>
              {/* Roads */}
              <line x1="50" y1="84" x2="50" y2="10" stroke="rgba(148,163,184,0.09)" strokeWidth="1.2" strokeDasharray="2,3"/>
              <line x1="5" y1="42" x2="95" y2="42" stroke="rgba(148,163,184,0.06)" strokeWidth="0.6" strokeDasharray="1,4"/>
              {/* Buildings */}
              {buildings.map(b => {
                const isSel = selected === b.id;
                return (
                  <g key={b.id} onClick={() => setSelected(isSel ? null : b.id)} style={{ cursor: "pointer" }}>
                    <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="0.8"
                      fill={isSel ? `${statusColors[b.status]}20` : `${statusColors[b.status]}08`}
                      stroke={statusColors[b.status]} strokeWidth={isSel ? 0.9 : 0.45}
                      filter={isSel ? "url(#selglow)" : undefined}
                    />
                    {/* Roof detail line */}
                    <line x1={b.x + 2} y1={b.y + 1.8} x2={b.x + b.w - 2} y2={b.y + 1.8}
                      stroke={statusColors[b.status]} strokeWidth="0.2" opacity="0.4"/>
                    {/* Status dot */}
                    <circle cx={b.x + b.w - 1.5} cy={b.y + 1.5} r="1.3" fill={statusColors[b.status]} opacity={0.85}>
                      {b.status === "warning" && (
                        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
                      )}
                    </circle>
                    {/* Label */}
                    <text x={b.x + b.w / 2} y={b.y + b.h / 2} textAnchor="middle" dominantBaseline="middle"
                      fill={isSel ? "#e2e8f0" : "#475569"} fontSize="2.1" fontFamily="JetBrains Mono">
                      {b.label}
                    </text>
                  </g>
                );
              })}
              {/* Compass */}
              <text x="94" y="5.5" fill="#475569" fontSize="2.5" fontFamily="JetBrains Mono" textAnchor="middle">N</text>
              <line x1="94" y1="6.5" x2="94" y2="10" stroke="#475569" strokeWidth="0.3"/>
            </svg>

            {/* Building tooltip */}
            {selected && (() => {
              const b = buildings.find(x => x.id === selected)!;
              return (
                <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(13,27,46,0.95)", border: `1px solid ${statusColors[b.status]}44`, borderRadius: 5, padding: "8px 12px", minWidth: 130 }}>
                  <div className="font-display" style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{b.label}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <StatusDot status={b.status}/>
                    <span className="font-mono" style={{ fontSize: 9, color: statusColors[b.status], textTransform: "uppercase" }}>{b.status}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Critical Intelligence */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="glass" style={{ borderRadius: 8, padding: 14, flex: 1 }}>
            <div className="section-label" style={{ marginBottom: 10 }}>Critical Intelligence</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {[
                { icon: "⚠", color: "#ef4444", text: "Generator G-02 abnormal vibration · 34% above limit" },
                { icon: "⚠", color: "#f59e0b", text: "Fuel consumption +8% above forecast" },
                { icon: "⚠", color: "#f59e0b", text: "Heating H-04 at 91% rated capacity" },
                { icon: "✓", color: "#10b981", text: "Environmental conditions stable" },
                { icon: "✓", color: "#10b981", text: "Communication systems nominal" },
                { icon: "ℹ", color: "#00c8e8", text: "Battery charging at optimal rate" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", padding: "5px 0", borderBottom: i < 5 ? "1px solid rgba(148,163,184,0.05)" : "none" }}>
                  <span style={{ color: item.color, fontSize: 10, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.45 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insight */}
          <div style={{ borderRadius: 8, padding: 14, background: "rgba(0,200,232,0.04)", border: "1px solid rgba(0,200,232,0.18)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #00c8e8, transparent)" }}/>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#00c8e8" strokeWidth="1"/>
                <path d="M4 4.5a2 2 0 114 0c0 1-.8 1.5-1.5 1.9V7.5" stroke="#00c8e8" strokeWidth="1" strokeLinecap="round"/>
                <circle cx="6" cy="9" r=".6" fill="#00c8e8"/>
              </svg>
              <span className="font-mono" style={{ fontSize: 8, color: "#00c8e8", letterSpacing: "0.12em" }}>AI INSIGHT · 87% CONFIDENCE</span>
            </div>
            <p style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
              Energy demand will increase <strong style={{ color: "#f59e0b" }}>+12%</strong> in 24h as temperature drops to <strong style={{ color: "#00c8e8" }}>−34°C</strong>. Pre-charge battery and inspect G-02 before next cycle.
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Live charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <MiniChart title="Temperature (°C)" color="#00c8e8" valueLabel="-25°C NOW">
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={tempData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c8e8" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#00c8e8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} interval={5}/>
              <YAxis domain={[-38, -18]} tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} width={26}/>
              <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 10 }}/>
              <Area type="monotone" dataKey="v" stroke="#00c8e8" strokeWidth={1.5} fill="url(#tg)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </MiniChart>

        <MiniChart title="Energy (kW) — Gen vs Con" color="#10b981" valueLabel="185 kW NOW">
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={energyData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <XAxis dataKey="t" tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} interval={5}/>
              <YAxis domain={[150, 200]} tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} width={28}/>
              <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 10 }}/>
              <Line type="monotone" dataKey="gen" stroke="#10b981" strokeWidth={1.5} dot={false} name="Gen"/>
              <Line type="monotone" dataKey="con" stroke="#00c8e8" strokeWidth={1.5} dot={false} strokeDasharray="3 2" name="Con"/>
            </LineChart>
          </ResponsiveContainer>
        </MiniChart>

        <MiniChart title="Fuel Level (L) — 7 Day" color="#f59e0b" valueLabel="7,200L NOW">
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={fuelData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }}/>
              <YAxis domain={[6800, 8200]} tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} width={32}/>
              <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 10 }}/>
              <Area type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={1.5} fill="url(#fg)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </MiniChart>
      </div>
    </div>
  );
}

function HealthRing({ value }: { value: number }) {
  const size = 90;
  const r = 35;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,200,232,0.08)" strokeWidth="7"/>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#00c8e8" strokeWidth="7"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ filter: "drop-shadow(0 0 6px #00c8e8)" }}
      />
    </svg>
  );
}

function MiniChart({ title, color, valueLabel, children }: { title: string; color: string; valueLabel: string; children: React.ReactNode }) {
  return (
    <div className="chart-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>{title}</div>
        <div className="font-mono" style={{ fontSize: 10, color, fontWeight: 600 }}>{valueLabel}</div>
      </div>
      {children}
    </div>
  );
}
