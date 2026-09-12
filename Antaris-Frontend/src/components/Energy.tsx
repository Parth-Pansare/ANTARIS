import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

const energyTimeline = Array.from({ length: 24 }, (_, i) => ({
  t: `${String(i).padStart(2, "0")}:00`,
  gen: 172 + Math.sin(i * 0.4) * 14,
  con: 168 + Math.sin(i * 0.45) * 12,
  bat: 2 + Math.sin(i * 0.3) * 1.5,
}));

const systemLoad = [
  { name: "Heating", kw: 68, pct: 37 },
  { name: "Laboratory", kw: 28, pct: 15 },
  { name: "Living Qtrs", kw: 24, pct: 13 },
  { name: "Gen Systems", kw: 18, pct: 10 },
  { name: "Comms", kw: 8, pct: 4 },
  { name: "Critical Sys", kw: 14, pct: 8 },
  { name: "Misc", kw: 25, pct: 13 },
];

const genStatus = [
  { id: "G-01", status: "normal", load: 78, temp: "74°C", runtime: "5,120h", output: "92 kW" },
  { id: "G-02", status: "warning", load: 82, temp: "87°C", runtime: "7,421h", output: "93 kW" },
  { id: "Battery", status: "monitoring", load: 82, temp: "22°C", runtime: "—", output: "+2.1 kW" },
];

const statusColors: Record<string, string> = {
  normal: "#10b981",
  warning: "#f59e0b",
  monitoring: "#00c8e8",
};

// Sankey-style flow nodes
const flowNodes = [
  { label: "GENERATOR G-01", value: "92 kW", color: "#10b981", level: 0, pos: 0 },
  { label: "GENERATOR G-02", value: "93 kW", color: "#f59e0b", level: 0, pos: 1 },
  { label: "BATTERY BANK", value: "+2 kW", color: "#00c8e8", level: 0, pos: 2 },
  { label: "DISTRIBUTION BUS", value: "185 kW", color: "#e2e8f0", level: 1, pos: 0 },
  { label: "HEATING SYSTEMS", value: "68 kW", color: "#ef4444", level: 2, pos: 0 },
  { label: "LABORATORY", value: "28 kW", color: "#8b5cf6", level: 2, pos: 1 },
  { label: "LIVING QUARTERS", value: "24 kW", color: "#0ea5e9", level: 2, pos: 2 },
  { label: "CRITICAL SYSTEMS", value: "14 kW", color: "#f59e0b", level: 2, pos: 3 },
];

export default function Energy() {
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.06em", color: "#e2e8f0" }}>
            ENERGY COMMAND
          </h1>
          <p style={{ fontSize: 13, color: "#64748b" }}>Power generation, distribution, and consumption intelligence</p>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        {[
          { label: "Generation", value: "185 kW", color: "#10b981" },
          { label: "Consumption", value: "182 kW", color: "#00c8e8" },
          { label: "Battery SOC", value: "82%", color: "#00c8e8" },
          { label: "Peak Load", value: "212 kW", color: "#f59e0b" },
          { label: "Efficiency", value: "98.4%", color: "#10b981" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="section-label" style={{ marginBottom: 8 }}>{k.label}</div>
            <div className="font-display" style={{ fontSize: 24, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Generation vs Consumption Chart */}
        <div className="chart-container">
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>Generation vs Consumption</div>
              <div className="section-label" style={{ marginTop: 2 }}>24-hour power balance</div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <LegendDot color="#10b981" label="Generation" />
              <LegendDot color="#00c8e8" label="Consumption" />
              <LegendDot color="#f59e0b" label="Battery" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={energyTimeline}>
              <defs>
                <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="conGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c8e8" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#00c8e8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,232,0.05)"/>
              <XAxis dataKey="t" tick={{ fontSize: 8, fill: "#475569", fontFamily: "JetBrains Mono" }} interval={3}/>
              <YAxis domain={[150, 210]} tick={{ fontSize: 8, fill: "#475569", fontFamily: "JetBrains Mono" }} width={32}/>
              <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 11 }} />
              <Area type="monotone" dataKey="gen" stroke="#10b981" strokeWidth={2} fill="url(#genGrad)" dot={false} name="Gen (kW)"/>
              <Area type="monotone" dataKey="con" stroke="#00c8e8" strokeWidth={1.5} fill="url(#conGrad)" dot={false} name="Con (kW)" strokeDasharray="3 2"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Load distribution */}
        <div className="chart-container">
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>Load Distribution</div>
            <div className="section-label" style={{ marginTop: 2 }}>System-by-system breakdown</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={systemLoad} layout="vertical" margin={{ left: 0 }}>
              <XAxis type="number" tick={{ fontSize: 8, fill: "#475569", fontFamily: "JetBrains Mono" }}/>
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "#64748b", fontFamily: "JetBrains Mono" }} width={80}/>
              <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 11 }} />
              <Bar dataKey="kw" fill="#00c8e8" radius={[0, 2, 2, 0]} name="Load (kW)" opacity={0.8}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Generator status + Energy flow */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Generator status */}
        <div className="glass" style={{ borderRadius: 8, padding: 16 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Generator & Storage Status</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {genStatus.map(g => (
              <div key={g.id} style={{ padding: "12px", background: "rgba(7,13,26,0.6)", border: `1px solid ${statusColors[g.status]}22`, borderRadius: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div className="font-display" style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{g.id}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>Output: {g.output}</div>
                  </div>
                  <span style={{ padding: "2px 8px", background: `${statusColors[g.status]}12`, border: `1px solid ${statusColors[g.status]}30`, borderRadius: 3, fontSize: 10, fontFamily: "JetBrains Mono", color: statusColors[g.status], letterSpacing: "0.1em" }}>
                    {g.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                  <div className="section-label">LOAD: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{g.load}%</span></div>
                  <div className="section-label">TEMP: <span style={{ color: g.temp > "80" ? "#f59e0b" : "#e2e8f0", fontWeight: 600 }}>{g.temp}</span></div>
                  <div className="section-label">RT: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{g.runtime}</span></div>
                </div>
                <LoadBar value={g.load} color={statusColors[g.status]} />
              </div>
            ))}
          </div>
        </div>

        {/* Energy flow diagram */}
        <div className="glass" style={{ borderRadius: 8, padding: 16 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Energy Flow Diagram</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Sources */}
            <div style={{ display: "flex", gap: 8 }}>
              {["Generator G-01\n92 kW", "Generator G-02\n93 kW", "Battery Bank\n+2 kW"].map((src, i) => (
                <div key={i} style={{
                  flex: 1, padding: "8px", borderRadius: 5, textAlign: "center",
                  background: ["rgba(16,185,129,0.08)", "rgba(245,158,11,0.08)", "rgba(0,200,232,0.08)"][i],
                  border: `1px solid ${["rgba(16,185,129,0.2)", "rgba(245,158,11,0.2)", "rgba(0,200,232,0.2)"][i]}`,
                }}>
                  {src.split("\n").map((l, j) => (
                    <div key={j} style={{ fontSize: j === 0 ? 9 : 13, fontFamily: j === 0 ? "JetBrains Mono" : "Rajdhani", fontWeight: j === 1 ? 700 : 400, color: j === 0 ? "#475569" : ["#10b981", "#f59e0b", "#00c8e8"][i], letterSpacing: j === 0 ? "0.08em" : 0 }}>{l}</div>
                  ))}
                </div>
              ))}
            </div>
            {/* Arrow */}
            <div style={{ display: "flex", justifyContent: "center", gap: 4, color: "#00c8e8" }}>
              <span>↓</span><span>↓</span><span>↓</span>
            </div>
            {/* Distribution bus */}
            <div style={{ padding: "10px", borderRadius: 5, textAlign: "center", background: "rgba(0,200,232,0.06)", border: "1px solid rgba(0,200,232,0.2)" }}>
              <div className="section-label">DISTRIBUTION BUS</div>
              <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: "#00c8e8" }}>185 kW</div>
            </div>
            {/* Arrow */}
            <div style={{ display: "flex", justifyContent: "center", color: "#00c8e8" }}>↓</div>
            {/* Consumers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                { label: "Heating", value: "68 kW", pct: 37, color: "#ef4444" },
                { label: "Laboratory", value: "28 kW", pct: 15, color: "#8b5cf6" },
                { label: "Living Qtrs", value: "24 kW", pct: 13, color: "#0ea5e9" },
                { label: "Critical", value: "14 kW", pct: 8, color: "#f59e0b" },
              ].map(c => (
                <div key={c.label} style={{ padding: "8px", borderRadius: 4, background: "rgba(7,13,26,0.6)", border: "1px solid rgba(148,163,184,0.08)" }}>
                  <div className="section-label" style={{ marginBottom: 4 }}>{c.label}</div>
                  <div className="font-display" style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{c.value}</div>
                  <div style={{ marginTop: 4, height: 3, background: "rgba(148,163,184,0.1)", borderRadius: 2 }}>
                    <div style={{ width: `${c.pct}%`, height: "100%", background: c.color, borderRadius: 2, opacity: 0.8 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Panel */}
          <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(0,200,232,0.04)", border: "1px solid rgba(0,200,232,0.15)", borderRadius: 6 }}>
            <div className="font-mono" style={{ fontSize: 9, color: "#00c8e8", letterSpacing: "0.1em", marginBottom: 4 }}>AI RECOMMENDATION</div>
            <p style={{ fontSize: 11, color: "#94a3b8" }}>Predicted peak demand: <strong style={{ color: "#f59e0b" }}>225 kW</strong> in 18 hours. Maintain G-02 standby mode and pre-charge battery bank to 95%.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
      <span style={{ fontSize: 9, color: "#475569", fontFamily: "JetBrains Mono" }}>{label}</span>
    </div>
  );
}

function LoadBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: 4, background: "rgba(148,163,184,0.1)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.5s ease", opacity: 0.8 }} />
    </div>
  );
}
