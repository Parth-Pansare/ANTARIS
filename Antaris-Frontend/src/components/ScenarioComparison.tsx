import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const scenarios = {
  baseline: {
    label: "BASELINE",
    sub: "Current operational state",
    color: "#00c8e8",
    safe: true,
    energy: 185,
    fuel: 7200,
    fuelPct: 72,
    battery: 82,
    equipment: 94,
    risk: "LOW",
    riskScore: 12,
    inventory: 74,
    stationHealth: 92,
    alerts: 3,
    heatingLoad: 68,
    genLoad: 80,
    temp: -25,
  },
  scenarioA: {
    label: "SCENARIO A",
    sub: "Temperature drop to -35°C",
    color: "#f59e0b",
    safe: false,
    energy: 228,
    fuel: 6100,
    fuelPct: 61,
    battery: 67,
    equipment: 88,
    risk: "HIGH",
    riskScore: 68,
    inventory: 55,
    stationHealth: 78,
    alerts: 7,
    heatingLoad: 98,
    genLoad: 95,
    temp: -35,
  },
  scenarioB: {
    label: "SCENARIO B",
    sub: "G-02 failure + cold snap",
    color: "#ef4444",
    safe: false,
    energy: 248,
    fuel: 5400,
    fuelPct: 54,
    battery: 51,
    equipment: 71,
    risk: "CRITICAL",
    riskScore: 88,
    inventory: 48,
    stationHealth: 62,
    alerts: 12,
    heatingLoad: 100,
    genLoad: 100,
    temp: -35,
  },
};

const metrics = ["stationHealth", "battery", "fuelPct", "equipment", "inventory"] as const;
const metricLabels: Record<string, string> = {
  stationHealth: "Station Health",
  battery: "Battery",
  fuelPct: "Fuel Level",
  equipment: "Equipment",
  inventory: "Inventory",
};

const radarData = [
  { metric: "Health", baseline: 92, scenarioA: 78, scenarioB: 62 },
  { metric: "Energy", baseline: 88, scenarioA: 55, scenarioB: 42 },
  { metric: "Fuel", baseline: 72, scenarioA: 61, scenarioB: 54 },
  { metric: "Battery", baseline: 82, scenarioA: 67, scenarioB: 51 },
  { metric: "Equipment", baseline: 94, scenarioA: 88, scenarioB: 71 },
  { metric: "Inventory", baseline: 74, scenarioA: 55, scenarioB: 48 },
];

const timelineData = Array.from({ length: 72 }, (_, h) => ({
  h: `${h}h`,
  baseline: 7200 - h * 200 / 24,
  scenarioA: 7200 - h * 260 / 24,
  scenarioB: 7200 - h * 300 / 24,
}));

const downsampledTimeline = timelineData.filter((_, i) => i % 6 === 0);

const keys: Array<keyof typeof scenarios> = ["baseline", "scenarioA", "scenarioB"];

export default function ScenarioComparison() {
  const safest = keys.reduce((a, b) => scenarios[a].riskScore < scenarios[b].riskScore ? a : b);

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.06em", color: "#e2e8f0" }}>
            SCENARIO COMPARISON
          </h1>
          <p style={{ fontSize: 13, color: "#64748b" }}>Baseline vs Scenario A vs Scenario B · AI risk assessment · Safest path identification</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-secondary" style={{ fontSize: 12 }}>Apply Safest Scenario</button>
          <button className="btn-ghost" style={{ fontSize: 12 }}>Export Report</button>
        </div>
      </div>

      {/* Scenario header cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {keys.map(k => {
          const s = scenarios[k];
          const isSafest = k === safest;
          return (
            <div key={k} style={{
              borderRadius: 8, padding: 20,
              background: `${s.color}06`,
              border: `1px solid ${s.color}${isSafest ? "40" : "20"}`,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }}/>
              {isSafest && (
                <div style={{ position: "absolute", top: 10, right: 10, padding: "2px 8px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 3, fontSize: 8, fontFamily: "JetBrains Mono", color: "#10b981", letterSpacing: "0.1em" }}>
                  ★ SAFEST
                </div>
              )}
              <div className="font-mono" style={{ fontSize: 10, color: s.color, letterSpacing: "0.12em", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>{s.sub}</div>

              {/* Risk score ring */}
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
                <RiskGauge score={s.riskScore} color={s.color}/>
                <div>
                  <div className="section-label" style={{ marginBottom: 2 }}>Risk Score</div>
                  <div className="font-display" style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.riskScore}</div>
                  <div className="font-mono" style={{ fontSize: 9, color: s.color, letterSpacing: "0.1em" }}>{s.risk} RISK</div>
                </div>
              </div>

              {/* Key metrics */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "Energy Load", value: `${s.energy} kW`, warn: s.energy > 200 },
                  { label: "Fuel Level", value: `${s.fuelPct}% (${(s.fuel / 1000).toFixed(1)}k L)`, warn: s.fuelPct < 65 },
                  { label: "Battery SOC", value: `${s.battery}%`, warn: s.battery < 70 },
                  { label: "Station Health", value: `${s.stationHealth}%`, warn: s.stationHealth < 80 },
                  { label: "Active Alerts", value: `${s.alerts}`, warn: s.alerts > 5 },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                    <span className="section-label">{row.label}</span>
                    <span className="font-mono" style={{ fontSize: 11, color: row.warn ? "#ef4444" : "#e2e8f0", fontWeight: 500 }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12 }}>
                <button className="btn-ghost" style={{ width: "100%", fontSize: 11, padding: "7px" }}>Apply Scenario</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Radar */}
        <div className="chart-container">
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>System Resilience Radar</div>
            <div className="section-label" style={{ marginTop: 1 }}>Higher = better across all dimensions</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(0,200,232,0.08)"/>
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 10, fontFamily: "JetBrains Mono" }}/>
              <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 11 }}/>
              <Radar dataKey="baseline" stroke={scenarios.baseline.color} fill={scenarios.baseline.color} fillOpacity={0.12} name="Baseline"/>
              <Radar dataKey="scenarioA" stroke={scenarios.scenarioA.color} fill={scenarios.scenarioA.color} fillOpacity={0.1} name="Scenario A"/>
              <Radar dataKey="scenarioB" stroke={scenarios.scenarioB.color} fill={scenarios.scenarioB.color} fillOpacity={0.08} name="Scenario B"/>
              <Legend formatter={v => <span style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "#64748b" }}>{v}</span>}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Fuel depletion timeline */}
        <div className="chart-container">
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>Fuel Depletion — 72h Projection</div>
            <div className="section-label" style={{ marginTop: 1 }}>Scenario impact on fuel reserves</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={downsampledTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,232,0.05)"/>
              <XAxis dataKey="h" tick={{ fontSize: 8, fill: "#475569", fontFamily: "JetBrains Mono" }}/>
              <YAxis tick={{ fontSize: 8, fill: "#475569", fontFamily: "JetBrains Mono" }} width={38}/>
              <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 11 }}/>
              <Bar dataKey="baseline" fill={scenarios.baseline.color} opacity={0.7} name="Baseline" radius={[1, 1, 0, 0]}/>
              <Bar dataKey="scenarioA" fill={scenarios.scenarioA.color} opacity={0.7} name="Scenario A" radius={[1, 1, 0, 0]}/>
              <Bar dataKey="scenarioB" fill={scenarios.scenarioB.color} opacity={0.7} name="Scenario B" radius={[1, 1, 0, 0]}/>
              <Legend formatter={v => <span style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "#64748b" }}>{v}</span>}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metric comparison table */}
      <div className="glass" style={{ borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(0,200,232,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="section-label">Detailed Metric Comparison</div>
          <div style={{ display: "flex", gap: 16 }}>
            {keys.map(k => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: scenarios[k].color, display: "inline-block" }}/>
                <span className="font-mono" style={{ fontSize: 9, color: "#64748b" }}>{scenarios[k].label}</span>
              </div>
            ))}
          </div>
        </div>
        <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Metric</th>
              <th style={{ textAlign: "center", color: scenarios.baseline.color }}>BASELINE</th>
              <th style={{ textAlign: "center", color: scenarios.scenarioA.color }}>SCENARIO A</th>
              <th style={{ textAlign: "center", color: scenarios.scenarioB.color }}>SCENARIO B</th>
              <th style={{ textAlign: "center" }}>Best Option</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Energy Load (kW)", values: [185, 228, 248], lowerBetter: true },
              { label: "Fuel Level (%)", values: [72, 61, 54], lowerBetter: false },
              { label: "Battery SOC (%)", values: [82, 67, 51], lowerBetter: false },
              { label: "Station Health (%)", values: [92, 78, 62], lowerBetter: false },
              { label: "Equipment Health (%)", values: [94, 88, 71], lowerBetter: false },
              { label: "Active Alerts", values: [3, 7, 12], lowerBetter: true },
              { label: "Risk Score", values: [12, 68, 88], lowerBetter: true },
            ].map(row => {
              const bestVal = row.lowerBetter ? Math.min(...row.values) : Math.max(...row.values);
              const bestIdx = row.values.indexOf(bestVal);
              const bestKey = keys[bestIdx];
              return (
                <tr key={row.label}>
                  <td style={{ color: "#e2e8f0", fontWeight: 500 }}>{row.label}</td>
                  {row.values.map((v, i) => {
                    const isBest = i === bestIdx;
                    const isWorst = v === (row.lowerBetter ? Math.max(...row.values) : Math.min(...row.values));
                    return (
                      <td key={i} style={{ textAlign: "center" }}>
                        <span className="font-mono" style={{ fontSize: 12, color: isBest ? "#10b981" : isWorst ? "#ef4444" : "#94a3b8", fontWeight: isBest ? 700 : 400 }}>
                          {v}
                          {isBest && " ★"}
                        </span>
                      </td>
                    );
                  })}
                  <td style={{ textAlign: "center" }}>
                    <span style={{ padding: "2px 8px", background: `${scenarios[bestKey].color}12`, border: `1px solid ${scenarios[bestKey].color}28`, borderRadius: 3, fontSize: 9, fontFamily: "JetBrains Mono", color: scenarios[bestKey].color, letterSpacing: "0.08em" }}>
                      {scenarios[bestKey].label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* AI Recommendation */}
      <div style={{ padding: "16px 20px", background: "rgba(0,200,232,0.04)", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 8, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #00c8e8, transparent)" }}/>
        <div className="font-mono" style={{ fontSize: 9, color: "#00c8e8", letterSpacing: "0.15em", marginBottom: 10 }}>AI RECOMMENDATION</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <div className="font-display" style={{ fontSize: 13, fontWeight: 700, color: "#10b981", marginBottom: 4 }}>✓ Baseline is safest</div>
            <p style={{ fontSize: 11, color: "#94a3b8" }}>Maintain current operations. Risk score of 12 is well within acceptable operational parameters.</p>
          </div>
          <div>
            <div className="font-display" style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", marginBottom: 4 }}>⚠ If Scenario A occurs</div>
            <p style={{ fontSize: 11, color: "#94a3b8" }}>Increase fuel reserve by 18%, pre-charge battery to 95%, and pre-warm heating systems 6h before temperature drop.</p>
          </div>
          <div>
            <div className="font-display" style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", marginBottom: 4 }}>✕ Scenario B: High risk</div>
            <p style={{ fontSize: 11, color: "#94a3b8" }}>G-02 failure during extreme cold creates cascading risk. Emergency resupply required and load shedding of 20% mandatory.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskGauge({ score, color }: { score: number; color: string }) {
  const size = 60;
  const r = 22;
  const circ = Math.PI * r; // half circle
  const offset = circ * (1 - score / 100);
  return (
    <svg width={size} height={size / 2 + 8}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="6" strokeDasharray={circ} strokeDashoffset={0} transform={`rotate(-180 ${size / 2} ${size / 2})`}/>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-180 ${size / 2} ${size / 2})`}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}
