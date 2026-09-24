import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";
import { LiveBadge } from "./Icons";

/* ── Simulated telemetry data ── */
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

/* ── Station parameters (matches SIH document) ── */
const STATION_PARAMS: Record<string, {
  temp: string; energy: string; fuel: string; battery: string; genLoad: string;
  crew: string; alerts: string; health: string; lat: string; desc: string; riskLevel: string; riskColor: string;
}> = {
  MAITRI: {
    temp: "−25 °C", energy: "185 kW", fuel: "7,200 L", battery: "82%",
    genLoad: "68%", crew: "38", alerts: "03", health: "92",
    lat: "70°46′S, 11°44′E", desc: "Queen Maud Land, Antarctica",
    riskLevel: "MEDIUM", riskColor: "#f59e0b",
  },
  BHARATI: {
    temp: "−18 °C", energy: "122 kW", fuel: "5,400 L", battery: "91%",
    genLoad: "52%", crew: "23", alerts: "01", health: "97",
    lat: "69°24′S, 76°11′E", desc: "Larsemann Hills, Antarctica",
    riskLevel: "LOW", riskColor: "#10b981",
  },
};

const kpiDef = (s: typeof STATION_PARAMS["MAITRI"]) => [
  { label: "Temperature",    value: s.temp,     sub: "Ambient · Forecast −34°C",    color: "#00c8e8", icon: "🌡", sparkline: [-30,-28,-26,-25,-25,-25] },
  { label: "Energy Demand",  value: s.energy,   sub: "+2.1% from daily avg",         color: "#a78bfa", icon: "⚡", sparkline: [170, 175, 180, 178, 183, 185] },
  { label: "Fuel Level",     value: s.fuel,     sub: `72% · ${s.genLoad} gen load`,  color: "#f59e0b", icon: "🛢", sparkline: [7900, 7740, 7580, 7420, 7310, 7200] },
  { label: "Battery SOC",    value: s.battery,  sub: "Charging +2.1 kW",             color: "#10b981", icon: "🔋", sparkline: [78, 79, 80, 81, 81, 82] },
  { label: "Active Alerts",  value: s.alerts,   sub: "1 critical · 2 warning",       color: "#ef4444", icon: "⚠", sparkline: [1, 2, 2, 3, 3, 3] },
  { label: "Equip. Health",  value: s.health + "%", sub: "2 items need attention",   color: "#10b981", icon: "⚙", sparkline: [96, 95, 95, 94, 94, 94] },
];

/* Cascade steps from SIH doc */
const cascadeSteps = [
  { icon: "🌡", label: "Temperature drops", arrow: true },
  { icon: "🔥", label: "Heating demand ↑", arrow: true },
  { icon: "⚡", label: "Energy demand ↑", arrow: true },
  { icon: "⚙", label: "Generator load ↑", arrow: true },
  { icon: "🛢", label: "Fuel consumption ↑", arrow: true },
  { icon: "⚠", label: "Depletion risk → Alert", arrow: false },
];

const phases = [
  { id: "monitor",  label: "MONITOR",  icon: "◉", color: "#00c8e8", desc: "Real-time telemetry · Station state · Live KPIs" },
  { id: "predict",  label: "PREDICT",  icon: "◈", color: "#a78bfa", desc: "Energy forecasting · Fuel depletion · Anomaly detection" },
  { id: "simulate", label: "SIMULATE", icon: "◎", color: "#f59e0b", desc: "What-if scenarios · Multi-system impact · Cascade analysis" },
  { id: "decide",   label: "DECIDE",   icon: "◆", color: "#10b981", desc: "Recommendations · Risk scoring · Automated reports" },
];

const intelligenceItems = [
  { icon: "⚠", color: "#ef4444", priority: "CRITICAL", text: "Generator G-02 abnormal vibration · 34% above threshold" },
  { icon: "⚠", color: "#f59e0b", priority: "WARNING",  text: "Fuel consumption +8% above forecast · 8.4 days remaining" },
  { icon: "⚠", color: "#f59e0b", priority: "WARNING",  text: "Heating H-04 at 91% rated capacity · Maintenance due" },
  { icon: "✓", color: "#10b981", priority: "OK",       text: "Environmental conditions stable · Wind 12 knots" },
  { icon: "✓", color: "#10b981", priority: "OK",       text: "Communication systems nominal · Relay INSAT active" },
  { icon: "ℹ", color: "#00c8e8", priority: "INFO",     text: "Battery charging at optimal rate · +2.1 kW surplus" },
];

const riskDomains = [
  { label: "Energy",      v: 72, color: "#a78bfa" },
  { label: "Fuel",        v: 61, color: "#f59e0b" },
  { label: "Equipment",   v: 34, color: "#10b981" },
  { label: "Environment", v: 28, color: "#00c8e8" },
  { label: "Logistics",   v: 48, color: "#f97316" },
];

export default function Overview({ station }: { station: string }) {
  const [syncSecs, setSyncSecs] = useState(4);
  const p = STATION_PARAMS[station] ?? STATION_PARAMS.MAITRI;

  useEffect(() => {
    const t = setInterval(() => setSyncSecs(s => s >= 60 ? 1 : s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono'", color: "#475569", letterSpacing: "0.12em", marginBottom: 4 }}>
            SIH26060 · ANTARCTIC DIGITAL TWIN · NCPOR / MoES
          </div>
          <h1 className="font-display" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.06em", color: "#e2e8f0", lineHeight: 1.2 }}>
            {station} STATION — COMMAND OVERVIEW
          </h1>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
            {p.lat} · {p.desc} · Remote Operations Centre, NCPOR
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LiveBadge />
          <div className="font-mono" style={{ fontSize: 10, color: "#2d3d50", padding: "4px 10px", border: "1px solid rgba(0,200,232,0.08)", borderRadius: 4 }}>
            SYNC: {syncSecs}s AGO
          </div>
          <div style={{ padding: "4px 12px", border: `1px solid ${p.riskColor}44`, borderRadius: 4, background: `${p.riskColor}0f` }}>
            <span className="font-mono" style={{ fontSize: 10, color: p.riskColor, letterSpacing: "0.1em" }}>
              ● RISK: {p.riskLevel}
            </span>
          </div>
          <div style={{ padding: "4px 12px", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 4, background: "rgba(16,185,129,0.06)" }}>
            <span className="font-mono" style={{ fontSize: 10, color: "#10b981", letterSpacing: "0.1em" }}>● OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* ── Phase strip: MONITOR → PREDICT → SIMULATE → DECIDE ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {phases.map((ph, i) => (
          <div key={ph.id} style={{
            padding: "10px 14px", borderRadius: 8,
            background: `${ph.color}0a`, border: `1px solid ${ph.color}25`,
            display: "flex", alignItems: "center", gap: 10, position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${ph.color}, transparent)` }} />
            <span style={{ fontSize: 18, color: ph.color }}>{ph.icon}</span>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: ph.color, letterSpacing: "0.12em", fontWeight: 700 }}>{ph.label}</div>
              <div style={{ fontSize: 10, color: "#475569", marginTop: 2, lineHeight: 1.4 }}>{ph.desc}</div>
            </div>
            {i < 3 && (
              <span style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", color: "#334155", fontSize: 16, zIndex: 2 }}>›</span>
            )}
          </div>
        ))}
      </div>

      {/* ── Row 1: Health index + KPI grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12 }}>
        <div className="kpi-card glow-cyan" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #00c8e8, transparent)" }} />
          <div className="section-label" style={{ marginBottom: 14 }}>Station Health Index</div>
          <HealthRing value={Number(p.health)} />
          <div className="font-display" style={{ fontSize: 34, fontWeight: 700, color: "#00c8e8", marginTop: 6, lineHeight: 1 }}>{p.health}%</div>
          <div className="font-mono" style={{ fontSize: 10, color: "#10b981", letterSpacing: "0.12em", marginTop: 4 }}>STATUS: STABLE</div>
          <div style={{ marginTop: 12, width: "100%", display: "flex", flexDirection: "column", gap: 5 }}>
            {[
              { label: "Infrastructure", v: 98, c: "#10b981" },
              { label: "Energy Systems", v: 82, c: "#f59e0b" },
              { label: "Logistics",      v: 74, c: "#f59e0b" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span className="section-label">{s.label}</span>
                  <span className="font-mono" style={{ fontSize: 9, color: s.c }}>{s.v}%</span>
                </div>
                <div style={{ height: 2, background: "rgba(148,163,184,0.1)", borderRadius: 1 }}>
                  <div style={{ width: `${s.v}%`, height: "100%", background: s.c, borderRadius: 1, opacity: 0.8 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {kpiDef(p).map(k => (
            <div key={k.label} className="kpi-card" style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 14 }}>{k.icon}</span>
                <div className="section-label">{k.label}</div>
              </div>
              <div className="font-display" style={{ fontSize: 24, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: 10, color: "#475569", marginTop: 3, marginBottom: 8 }}>{k.sub}</div>
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
                  return <line key={i} x1={`${x1}%`} y1={y1} x2={`${x2}%`} y2={y2} stroke={k.color} strokeWidth="1.4" />;
                })}
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 2: Cascade + Intelligence + AI insight ── */}
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 260px", gap: 12 }}>

        {/* Interconnected cascade (SIH document diagram) */}
        <div className="glass" style={{ borderRadius: 8, padding: "14px 16px" }}>
          <div className="section-label" style={{ marginBottom: 12 }}>System Cascade</div>
          <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono'", color: "#475569", marginBottom: 10, letterSpacing: "0.1em" }}>
            INTERCONNECTED IMPACT
          </div>
          {cascadeSteps.map((step, i) => (
            <div key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, background: i === 0 ? "rgba(0,200,232,0.08)" : i === cascadeSteps.length - 1 ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${i === 0 ? "rgba(0,200,232,0.2)" : i === cascadeSteps.length - 1 ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.04)"}` }}>
                <span style={{ fontSize: 12 }}>{step.icon}</span>
                <span style={{ fontSize: 10, color: i === 0 ? "#00c8e8" : i === cascadeSteps.length - 1 ? "#ef4444" : "#94a3b8", lineHeight: 1.3 }}>{step.label}</span>
              </div>
              {step.arrow && <div style={{ textAlign: "center", color: "#334155", fontSize: 12, lineHeight: "18px" }}>↓</div>}
            </div>
          ))}
        </div>

        {/* Critical Intelligence */}
        <div className="glass overview-intelligence-card" style={{ borderRadius: 8 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,200,232,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="section-label">Critical Intelligence</div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: "#475569", letterSpacing: "0.1em" }}>LIVE · {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} UTC</div>
            </div>
          </div>
          <div style={{ padding: "10px 16px" }}>
            {intelligenceItems.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: i < intelligenceItems.length - 1 ? "1px solid rgba(148,163,184,0.05)" : "none" }}>
                <span style={{ color: item.color, fontSize: 12, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, color: item.color, letterSpacing: "0.1em", marginRight: 6 }}>{item.priority}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.45 }}>{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight + Risk Domains */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ borderRadius: 8, padding: 14, background: "rgba(0,200,232,0.04)", border: "1px solid rgba(0,200,232,0.18)", position: "relative", overflow: "hidden", flex: 1 }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #00c8e8, transparent)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ color: "#00c8e8", fontSize: 14 }}>✦</span>
              <span className="font-mono" style={{ fontSize: 9, color: "#00c8e8", letterSpacing: "0.12em" }}>AI INSIGHT · 87% CONFIDENCE</span>
            </div>
            <p style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
              Energy demand will increase <strong style={{ color: "#f59e0b" }}>+12%</strong> in 24h as temperature drops to{" "}
              <strong style={{ color: "#00c8e8" }}>−34°C</strong>. Pre-charge battery and inspect G-02 before next cycle.
            </p>
            <div style={{ marginTop: 10, padding: "6px 8px", background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: 6 }}>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, color: "#a78bfa", letterSpacing: "0.1em", marginBottom: 2 }}>PREDICTED FUEL SURVIVAL</div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 16, color: "#f59e0b", fontWeight: 700 }}>8.4 days</div>
              <div style={{ fontSize: 9, color: "#64748b" }}>at current consumption · resupply in 12d</div>
            </div>
            <div className="font-mono" style={{ fontSize: 8, color: "#53697b", marginTop: 10 }}>POLAR-OS PREDICTIVE ENGINE · DEMO DATA</div>
          </div>

          {/* Risk domain breakdown */}
          <div className="glass" style={{ borderRadius: 8, padding: "12px 14px" }}>
            <div className="section-label" style={{ marginBottom: 10 }}>Risk Domains</div>
            {riskDomains.map(r => (
              <div key={r.label} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: "#64748b" }}>{r.label}</span>
                  <span className="font-mono" style={{ fontSize: 9, color: r.color }}>{r.v}%</span>
                </div>
                <div style={{ height: 3, background: "rgba(148,163,184,0.08)", borderRadius: 2 }}>
                  <div style={{ width: `${r.v}%`, height: "100%", background: r.color, borderRadius: 2, boxShadow: `0 0 6px ${r.color}55` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Live charts ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <MiniChart title="Ambient Temperature (°C)" color="#00c8e8" valueLabel="-25°C NOW">
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={tempData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c8e8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00c8e8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} interval={5} />
              <YAxis domain={[-38, -18]} tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} width={26} />
              <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 10 }} />
              <Area type="monotone" dataKey="v" stroke="#00c8e8" strokeWidth={1.5} fill="url(#tg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </MiniChart>

        <MiniChart title="Energy (kW) — Gen vs Consumption" color="#10b981" valueLabel="185 kW NOW">
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={energyData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <XAxis dataKey="t" tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} interval={5} />
              <YAxis domain={[150, 200]} tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} width={28} />
              <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 10 }} />
              <Line type="monotone" dataKey="gen" stroke="#10b981" strokeWidth={1.5} dot={false} name="Generated" />
              <Line type="monotone" dataKey="con" stroke="#a78bfa" strokeWidth={1.5} dot={false} strokeDasharray="3 2" name="Consumed" />
            </LineChart>
          </ResponsiveContainer>
        </MiniChart>

        <MiniChart title="Fuel Inventory (L) — 7 Day Trend" color="#f59e0b" valueLabel="7,200L NOW">
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={fuelData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} />
              <YAxis domain={[6800, 8200]} tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} width={32} />
              <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 10 }} />
              <Area type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={1.5} fill="url(#fg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </MiniChart>
      </div>

      {/* ── Demo story footer (5-minute demo guide) ── */}
      <div style={{ borderRadius: 8, padding: "12px 16px", background: "rgba(167,139,250,0.04)", border: "1px solid rgba(167,139,250,0.12)", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: "#a78bfa", letterSpacing: "0.12em", whiteSpace: "nowrap" }}>◈ DEMO FLOW</span>
        {["1. Dashboard & telemetry", "→ 2. Digital Twin asset", "→ 3. Predictions", "→ 4. Simulate −35°C", "→ 5. Risk escalates", "→ 6. Decision engine", "→ 7. Scenario report"].map((step, i) => (
          <span key={i} style={{ fontSize: 10, color: i === 0 ? "#a78bfa" : "#475569", fontFamily: i === 0 ? "'JetBrains Mono'" : "inherit" }}>{step}</span>
        ))}
        <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono'", fontSize: 8, color: "#334155" }}>SIH26060 · NCPOR · MoES</span>
      </div>
    </div>
  );
}

function HealthRing({ value }: { value: number }) {
  const size = 90, r = 35;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,200,232,0.08)" strokeWidth="7" />
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
