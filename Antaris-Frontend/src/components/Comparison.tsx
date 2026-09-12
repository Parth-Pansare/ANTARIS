import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const radarData = [
  { metric: "Health", maitri: 92, bharati: 88 },
  { metric: "Energy", maitri: 85, bharati: 78 },
  { metric: "Fuel", maitri: 72, bharati: 81 },
  { metric: "Equipment", maitri: 87, bharati: 92 },
  { metric: "Comms", maitri: 100, bharati: 96 },
  { metric: "Inventory", maitri: 74, bharati: 85 },
];

const compareData = [
  { metric: "Energy Load", maitri: 185, bharati: 142, unit: "kW" },
  { metric: "Fuel Level", maitri: 72, bharati: 81, unit: "%" },
  { metric: "Battery SOC", maitri: 82, bharati: 76, unit: "%" },
  { metric: "Crew", maitri: 38, bharati: 24, unit: "" },
  { metric: "Equipment Health", maitri: 94, bharati: 96, unit: "%" },
  { metric: "Active Alerts", maitri: 3, bharati: 1, unit: "" },
];

const barData = [
  { name: "Energy\n(kW)", MAITRI: 185, BHARATI: 142 },
  { name: "Crew", MAITRI: 38, BHARATI: 24 },
  { name: "Alerts", MAITRI: 3, BHARATI: 1 },
];

const stations = {
  MAITRI: {
    health: 92,
    status: "OPERATIONAL",
    location: "71°S 11°E · Queen Maud Land",
    established: 1989,
    healthColor: "#10b981",
    alerts: 3,
    alertColors: "#f59e0b",
    crew: 38,
    energy: "185 kW",
    fuel: "7,200 L (72%)",
    battery: "82%",
    equip: "94%",
    temp: "-25°C",
    comms: "STRONG",
  },
  BHARATI: {
    health: 88,
    status: "OPERATIONAL",
    location: "69°S 76°E · Prydz Bay",
    established: 2012,
    healthColor: "#10b981",
    alerts: 1,
    alertColors: "#10b981",
    crew: 24,
    energy: "142 kW",
    fuel: "8,100 L (81%)",
    battery: "76%",
    equip: "96%",
    temp: "-22°C",
    comms: "STRONG",
  },
};

export default function Comparison() {
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.06em", color: "#e2e8f0" }}>
          MAITRI vs BHARATI
        </h1>
        <p style={{ fontSize: 13, color: "#64748b" }}>Side-by-side station comparison · Real-time telemetry · India's Antarctic research stations</p>
      </div>

      {/* Station summary headers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center" }}>
        <StationSummary station="MAITRI" data={stations.MAITRI} color="#00c8e8" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, transparent, rgba(0,200,232,0.3), transparent)" }} />
          <div className="font-display" style={{ fontSize: 13, fontWeight: 700, color: "#475569", letterSpacing: "0.1em" }}>VS</div>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, transparent, rgba(0,200,232,0.3), transparent)" }} />
        </div>
        <StationSummary station="BHARATI" data={stations.BHARATI} color="#8b5cf6" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Radar */}
        <div className="glass" style={{ borderRadius: 8, padding: 16 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Performance Radar</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(0,200,232,0.1)"/>
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 10, fontFamily: "JetBrains Mono" }}/>
              <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 11 }} />
              <Radar dataKey="maitri" stroke="#00c8e8" fill="#00c8e8" fillOpacity={0.15} name="MAITRI"/>
              <Radar dataKey="bharati" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} name="BHARATI"/>
              <Legend formatter={(v) => <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "#64748b" }}>{v}</span>}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar comparison */}
        <div className="glass" style={{ borderRadius: 8, padding: 16 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Key Metrics Comparison</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,232,0.05)"/>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#475569", fontFamily: "JetBrains Mono" }}/>
              <YAxis tick={{ fontSize: 9, fill: "#475569", fontFamily: "JetBrains Mono" }}/>
              <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 11 }} />
              <Bar dataKey="MAITRI" fill="#00c8e8" radius={[2, 2, 0, 0]} opacity={0.8}/>
              <Bar dataKey="BHARATI" fill="#8b5cf6" radius={[2, 2, 0, 0]} opacity={0.8}/>
              <Legend formatter={(v) => <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "#64748b" }}>{v}</span>}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed comparison table */}
      <div className="glass" style={{ borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(0,200,232,0.1)" }}>
          <div className="section-label">Detailed Metrics Comparison</div>
        </div>
        <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Metric</th>
              <th style={{ textAlign: "center", color: "#00c8e8" }}>MAITRI</th>
              <th style={{ textAlign: "center", color: "#8b5cf6" }}>BHARATI</th>
              <th style={{ textAlign: "center" }}>Advantage</th>
            </tr>
          </thead>
          <tbody>
            {compareData.map(row => {
              const mBetter = row.metric === "Active Alerts" ? row.maitri < row.bharati : row.maitri > row.bharati;
              return (
                <tr key={row.metric}>
                  <td style={{ color: "#e2e8f0", fontWeight: 500 }}>{row.metric}</td>
                  <td style={{ textAlign: "center" }} className="font-mono">{row.maitri}{row.unit}</td>
                  <td style={{ textAlign: "center" }} className="font-mono">{row.bharati}{row.unit}</td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{ padding: "2px 8px", borderRadius: 3, fontSize: 9, fontFamily: "JetBrains Mono", letterSpacing: "0.1em", background: mBetter ? "rgba(0,200,232,0.12)" : "rgba(139,92,246,0.12)", color: mBetter ? "#00c8e8" : "#8b5cf6", border: `1px solid ${mBetter ? "rgba(0,200,232,0.25)" : "rgba(139,92,246,0.25)"}` }}>
                      {mBetter ? "MAITRI" : "BHARATI"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StationSummary({ station, data, color }: { station: string; data: typeof stations.MAITRI; color: string }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - data.health / 100);
  return (
    <div className="glass" style={{ borderRadius: 8, padding: 20, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <svg width="90" height="90">
          <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="6"/>
          <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            transform="rotate(-90 45 45)"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
          <text x="45" y="42" textAnchor="middle" fill={color} fontSize="16" fontFamily="Rajdhani" fontWeight="700">{data.health}%</text>
          <text x="45" y="56" textAnchor="middle" fill="#475569" fontSize="7" fontFamily="JetBrains Mono">HEALTH</text>
        </svg>
        <div style={{ flex: 1 }}>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.06em" }}>{station}</div>
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 10 }}>{data.location}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { label: "Crew", value: String(data.crew) },
              { label: "Energy", value: data.energy },
              { label: "Fuel", value: data.fuel },
              { label: "Battery", value: data.battery },
            ].map(item => (
              <div key={item.label}>
                <div className="section-label" style={{ marginBottom: 1 }}>{item.label}</div>
                <div className="font-mono" style={{ fontSize: 11, color: "#e2e8f0" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <StatusChip label={data.status} color="#10b981" />
          <StatusChip label={`${data.alerts} ALERT${data.alerts !== 1 ? "S" : ""}`} color={data.alerts > 2 ? "#ef4444" : data.alerts > 0 ? "#f59e0b" : "#10b981"} />
          <StatusChip label={`EST. ${data.established}`} color="#475569" />
        </div>
      </div>
    </div>
  );
}

function StatusChip({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ padding: "3px 8px", background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 3, fontSize: 9, fontFamily: "JetBrains Mono", color, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}
