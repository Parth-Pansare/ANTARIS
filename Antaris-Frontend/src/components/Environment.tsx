import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine, LineChart, Line, ComposedChart } from "recharts";

const tempData = Array.from({ length: 24 }, (_, i) => ({
  t: `${String(i).padStart(2,"0")}:00`,
  v: -25 + Math.sin(i * 0.4) * 5 + (i < 6 || i > 20 ? -3 : 0),
  forecast: -25 + Math.sin(i * 0.4) * 5 - 1.5,
}));

const windData = Array.from({ length: 24 }, (_, i) => ({
  t: `${String(i).padStart(2,"0")}:00`,
  v: 12 + Math.sin(i * 0.5) * 6 + (i === 14 ? 18 : 0),
  gust: 18 + Math.sin(i * 0.5) * 8 + (i === 14 ? 25 : 0),
}));

const pressData = Array.from({ length: 24 }, (_, i) => ({
  t: `${String(i).padStart(2,"0")}:00`,
  v: 987 + Math.cos(i * 0.3) * 4,
}));

const humidData = Array.from({ length: 24 }, (_, i) => ({
  t: `${String(i).padStart(2,"0")}:00`,
  v: 62 + Math.sin(i * 0.6) * 12,
}));

const forecast = [
  { label: "NOW", temp: "-25°C", wind: "12 km/h", cond: "CLEAR", icon: "◎" },
  { label: "+6 HRS", temp: "-27°C", wind: "18 km/h", cond: "PARTLY CLOUD", icon: "⛅" },
  { label: "+12 HRS", temp: "-30°C", wind: "24 km/h", cond: "OVERCAST", icon: "☁" },
  { label: "+24 HRS", temp: "-34°C", wind: "31 km/h", cond: "BLIZZARD RISK", icon: "❄" },
];

export default function Environment() {
  const [timeframe, setTimeframe] = useState("24H");
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.06em", color: "#e2e8f0" }}>
            ENVIRONMENTAL INTELLIGENCE
          </h1>
          <p style={{ fontSize: 13, color: "#64748b" }}>Antarctic conditions · Real-time monitoring · 24h forecast</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["24H", "7D", "30D"].map(r => (
            <button key={r} onClick={() => setTimeframe(r)} className="btn-ghost" style={{ fontSize: 11, padding: "4px 10px", background: timeframe === r ? "rgba(0,200,232,0.1)" : "transparent", color: timeframe === r ? "#00c8e8" : "inherit" }}>{r}</button>
          ))}
        </div>
      </div>

      {/* Current conditions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        {[
          { label: "Temperature", value: "-25°C", sub: "Feels like -33°C", color: "#00c8e8", trend: "↓", icon: "🌡" },
          { label: "Humidity", value: "62%", sub: "Relative humidity", color: "#64748b", trend: "→", icon: "💧" },
          { label: "Pressure", value: "987 hPa", sub: "Steady", color: "#94a3b8", trend: "→", icon: "⊛" },
          { label: "Wind Speed", value: "12 km/h", sub: "SW direction", color: "#f59e0b", trend: "↑", icon: "💨" },
          { label: "Visibility", value: "8.4 km", sub: "Good conditions", color: "#10b981", trend: "↑", icon: "👁" },
        ].map(c => (
          <div key={c.label} className="kpi-card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div className="section-label">{c.label}</div>
              <span style={{ fontSize: 13 }}>{c.icon}</span>
            </div>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{c.sub}
              <span style={{ color: c.trend === "↓" ? "#ef4444" : c.trend === "↑" ? "#10b981" : "#64748b", marginLeft: 4 }}>{c.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + forecast */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 16 }}>
        {/* Charts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <EnvChart title="Temperature (°C)" sub="24-hour with anomaly markers">
            <ResponsiveContainer width="100%" height={110}>
              <ComposedChart data={tempData}>
                <defs>
                  <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00c8e8" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#00c8e8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,232,0.05)"/>
                <XAxis dataKey="t" tick={{ fontSize: 8, fill: "#475569", fontFamily: "JetBrains Mono" }} interval={3}/>
                <YAxis domain={[-38, -18]} tick={{ fontSize: 8, fill: "#475569", fontFamily: "JetBrains Mono" }} width={32}/>
                <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 11 }} />
                <ReferenceLine y={-32} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1} label={{ value: "ALERT", fill: "#ef4444", fontSize: 9, fontFamily: "JetBrains Mono" }}/>
                <Area type="monotone" dataKey="v" stroke="#00c8e8" strokeWidth={2} fill="url(#tg)" dot={false} name="Actual"/>
                <Line type="monotone" dataKey="forecast" stroke="#0ea5e9" strokeWidth={1} dot={false} strokeDasharray="3 2" name="Forecast"/>
              </ComposedChart>
            </ResponsiveContainer>
          </EnvChart>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <EnvChart title="Wind Speed (km/h)" sub="Speed and gust readings">
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={windData}>
                  <defs>
                    <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,232,0.05)"/>
                  <XAxis dataKey="t" tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} interval={5}/>
                  <YAxis tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} width={25}/>
                  <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 10 }} />
                  <Area type="monotone" dataKey="gust" stroke="#ef4444" strokeWidth={1} fill="rgba(239,68,68,0.05)" dot={false} name="Gust"/>
                  <Area type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={1.5} fill="url(#wg)" dot={false} name="Speed"/>
                </AreaChart>
              </ResponsiveContainer>
            </EnvChart>
            <EnvChart title="Atmospheric Pressure (hPa)" sub="Barometric trend">
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={pressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,232,0.05)"/>
                  <XAxis dataKey="t" tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} interval={5}/>
                  <YAxis domain={[980, 995]} tick={{ fontSize: 7, fill: "#475569", fontFamily: "JetBrains Mono" }} width={32}/>
                  <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 10 }} />
                  <Line type="monotone" dataKey="v" stroke="#94a3b8" strokeWidth={1.5} dot={false}/>
                </LineChart>
              </ResponsiveContainer>
            </EnvChart>
          </div>
        </div>

        {/* Forecast panel */}
        <div className="glass" style={{ borderRadius: 8, padding: 16 }}>
          <div className="section-label" style={{ marginBottom: 4 }}>Environmental Forecast</div>
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 16 }}>AI model · 87% confidence</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {forecast.map((f, i) => (
              <div key={f.label} style={{
                padding: "12px",
                background: i === 0 ? "rgba(0,200,232,0.08)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${i === 0 ? "rgba(0,200,232,0.2)" : "rgba(148,163,184,0.06)"}`,
                borderRadius: 6,
              }}>
                <div className="section-label" style={{ marginBottom: 6 }}>{f.label}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: i === 3 ? "#f59e0b" : "#e2e8f0" }}>{f.temp}</div>
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                </div>
                <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>{f.wind} · {f.cond}</div>
              </div>
            ))}
          </div>

          {/* Anomaly marker */}
          <div style={{ marginTop: 16, padding: "10px 12px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 6 }}>
            <div className="font-mono" style={{ fontSize: 9, color: "#f59e0b", letterSpacing: "0.1em", marginBottom: 4 }}>⚠ ANOMALY DETECTED</div>
            <p style={{ fontSize: 11, color: "#94a3b8" }}>Temperature drop of 9°C expected in 24h — unusual for this season. Heating system pre-warm recommended.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnvChart({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="chart-container">
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>{title}</div>
        <div className="section-label" style={{ marginTop: 1 }}>{sub}</div>
      </div>
      {children}
    </div>
  );
}
