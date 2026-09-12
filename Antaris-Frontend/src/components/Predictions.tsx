import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine, AreaChart, Area } from "recharts";

const energyForecast = Array.from({ length: 24 }, (_, i) => ({
  t: `${String(i).padStart(2, "0")}:00`,
  actual: i < 14 ? 180 + Math.sin(i * 0.4) * 12 : undefined,
  predicted: 180 + Math.sin(i * 0.4) * 12 + (i > 14 ? 8 + i * 0.8 : 0),
  upper: 180 + Math.sin(i * 0.4) * 12 + (i > 14 ? 16 + i * 1.2 : 0),
  lower: 180 + Math.sin(i * 0.4) * 12 + (i > 14 ? i * 0.4 : 0),
}));

const fuelForecast = Array.from({ length: 14 }, (_, i) => ({
  d: `Sep ${i + 4}`,
  actual: i < 8 ? 7800 - i * 90 : undefined,
  predicted: 7800 - i * 90,
}));

const tempForecast = Array.from({ length: 24 }, (_, i) => ({
  t: `+${i}h`,
  v: -25 - i * 0.38 - Math.sin(i * 0.3) * 2,
}));

const equipmentRisk = [
  { name: "Generator G-02", risk: 18, trend: "+3%", color: "#ef4444" },
  { name: "Heating Unit H-04", risk: 12, trend: "+1%", color: "#f59e0b" },
  { name: "Battery Bank B-01", risk: 3, trend: "−1%", color: "#10b981" },
  { name: "Generator G-01", risk: 4, trend: "→", color: "#10b981" },
  { name: "Water Treatment", risk: 2, trend: "→", color: "#10b981" },
];

const inventoryDepletion = [
  { item: "Diesel Fuel", days: 36, status: "warning" },
  { item: "Technical Components", days: 12, status: "critical" },
  { item: "Food Supplies", days: 38, status: "normal" },
  { item: "Water Reserves", days: 48, status: "normal" },
];

const statusColors: Record<string, string> = {
  normal: "#10b981",
  warning: "#f59e0b",
  critical: "#ef4444",
};

export default function Predictions() {
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.06em", color: "#e2e8f0" }}>
          AI PREDICTION CENTER
        </h1>
        <p style={{ fontSize: 13, color: "#64748b" }}>Machine learning forecasts · Anomaly detection · Risk assessment</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Energy forecast */}
        <PredCard
          title="Energy Forecast"
          sub="Next 24 hours · Confidence 89%"
          current={{ label: "Current Load", value: "182 kW" }}
          predicted={{ label: "Predicted Peak", value: "225 kW", color: "#f59e0b" }}
          risk="MEDIUM"
          riskColor="#f59e0b"
          trend="↑ +23%"
        >
          <ResponsiveContainer width="100%" height={110}>
            <AreaChart data={energyForecast}>
              <defs>
                <linearGradient id="efg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c8e8" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#00c8e8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,232,0.05)"/>
              <XAxis dataKey="t" tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} interval={5}/>
              <YAxis domain={[160, 245]} tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} width={28}/>
              <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 10 }} />
              <ReferenceLine x="14:00" stroke="rgba(0,200,232,0.3)" strokeDasharray="3 2" label={{ value: "NOW", fill: "#00c8e8", fontSize: 8, fontFamily: "JetBrains Mono" }}/>
              <Area type="monotone" dataKey="actual" stroke="#00c8e8" strokeWidth={2} fill="url(#efg)" dot={false} name="Actual"/>
              <Area type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={1.5} fill="rgba(245,158,11,0.05)" dot={false} name="Forecast" strokeDasharray="3 2"/>
            </AreaChart>
          </ResponsiveContainer>
        </PredCard>

        {/* Fuel forecast */}
        <PredCard
          title="Fuel Depletion Forecast"
          sub="Next 14 days · Confidence 91%"
          current={{ label: "Current Level", value: "7,200 L" }}
          predicted={{ label: "Depletion Date", value: "Sep 18, 2026", color: "#ef4444" }}
          risk="HIGH"
          riskColor="#ef4444"
          trend="↓ 200 L/day"
        >
          <ResponsiveContainer width="100%" height={110}>
            <AreaChart data={fuelForecast}>
              <defs>
                <linearGradient id="ffg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,232,0.05)"/>
              <XAxis dataKey="d" tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} interval={2}/>
              <YAxis domain={[5000, 8500]} tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} width={36}/>
              <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 10 }} />
              <ReferenceLine y={1000} stroke="rgba(239,68,68,0.4)" strokeDasharray="4 2" label={{ value: "RESERVE", fill: "#ef4444", fontSize: 8, fontFamily: "JetBrains Mono", position: "insideTopRight" }}/>
              <Area type="monotone" dataKey="actual" stroke="#f59e0b" strokeWidth={2} fill="url(#ffg)" dot={false} name="Actual"/>
              <Area type="monotone" dataKey="predicted" stroke="#ef4444" strokeWidth={1.5} fill="rgba(239,68,68,0.05)" dot={false} name="Predicted" strokeDasharray="3 2"/>
            </AreaChart>
          </ResponsiveContainer>
        </PredCard>

        {/* Environment forecast */}
        <PredCard
          title="Environment Forecast"
          sub="Next 24 hours · Confidence 87%"
          current={{ label: "Current Temp", value: "-25°C" }}
          predicted={{ label: "Predicted Low", value: "-34°C", color: "#00c8e8" }}
          risk="ELEVATED"
          riskColor="#f59e0b"
          trend="↓ 9°C"
        >
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={tempForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,232,0.05)"/>
              <XAxis dataKey="t" tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} interval={5}/>
              <YAxis domain={[-38, -22]} tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} width={28}/>
              <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 10 }} />
              <ReferenceLine y={-32} stroke="#ef4444" strokeDasharray="4 2" label={{ value: "ALERT", fill: "#ef4444", fontSize: 8, fontFamily: "JetBrains Mono" }}/>
              <Line type="monotone" dataKey="v" stroke="#00c8e8" strokeWidth={2} dot={false} name="Temp (°C)"/>
            </LineChart>
          </ResponsiveContainer>
        </PredCard>

        {/* Equipment failure risk */}
        <div className="glass" style={{ borderRadius: 8, padding: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>Equipment Failure Risk</div>
            <div className="section-label" style={{ marginTop: 2 }}>Next 30 days · ML model v2.4</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {equipmentRisk.map(eq => (
              <div key={eq.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{eq.name}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="font-mono" style={{ fontSize: 10, color: "#475569" }}>{eq.trend}</span>
                    <span className="font-mono" style={{ fontSize: 11, color: eq.color, fontWeight: 600 }}>{eq.risk}%</span>
                  </div>
                </div>
                <div style={{ height: 4, background: "rgba(148,163,184,0.1)", borderRadius: 2 }}>
                  <div style={{ width: `${eq.risk * 4}%`, height: "100%", background: eq.color, borderRadius: 2, opacity: 0.8, transition: "width 1s ease" }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: "10px 12px", background: "rgba(0,200,232,0.04)", border: "1px solid rgba(0,200,232,0.12)", borderRadius: 6 }}>
            <div className="font-mono" style={{ fontSize: 9, color: "#00c8e8", letterSpacing: "0.1em", marginBottom: 4 }}>AI ALERT</div>
            <p style={{ fontSize: 11, color: "#94a3b8" }}>Generator G-02 failure probability has increased 3% in the past 48 hours. Immediate inspection recommended.</p>
          </div>

          <div style={{ marginTop: 12 }}>
            <div className="section-label" style={{ marginBottom: 10 }}>Inventory Depletion Risk</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {inventoryDepletion.map(inv => (
                <div key={inv.item} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: `${statusColors[inv.status]}06`, border: `1px solid ${statusColors[inv.status]}18`, borderRadius: 4 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{inv.item}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="font-mono" style={{ fontSize: 10, color: "#475569" }}>{inv.days}d</span>
                    <span style={{ padding: "1px 6px", background: `${statusColors[inv.status]}18`, borderRadius: 3, fontSize: 9, fontFamily: "JetBrains Mono", color: statusColors[inv.status] }}>{inv.status.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PredCard({ title, sub, current, predicted, risk, riskColor, trend, children }: {
  title: string; sub: string;
  current: { label: string; value: string };
  predicted: { label: string; value: string; color: string };
  risk: string; riskColor: string; trend: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass" style={{ borderRadius: 8, padding: 16, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${riskColor}, transparent)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>{title}</div>
          <div className="section-label" style={{ marginTop: 2 }}>{sub}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="font-mono" style={{ fontSize: 10, color: "#475569" }}>{trend}</span>
          <span style={{ padding: "2px 8px", background: `${riskColor}12`, border: `1px solid ${riskColor}30`, borderRadius: 3, fontSize: 9, fontFamily: "JetBrains Mono", color: riskColor, letterSpacing: "0.08em" }}>
            {risk} RISK
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 2 }}>{current.label}</div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>{current.value}</div>
        </div>
        <div style={{ borderLeft: "1px solid rgba(0,200,232,0.1)", paddingLeft: 20 }}>
          <div className="section-label" style={{ marginBottom: 2 }}>{predicted.label}</div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 700, color: predicted.color }}>{predicted.value}</div>
        </div>
      </div>
      {children}
    </div>
  );
}
