import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const fuelHistory = Array.from({ length: 14 }, (_, i) => ({
  d: `Sep ${i + 1}`,
  actual: i < 11 ? 8200 - i * 90 : undefined,
  forecast: 8200 - i * 90,
  depletion: 10000 * (1 - i / 18),
}));

const inventory = [
  { item: "Diesel Fuel", current: "7,200 L", daily: "200 L", days: 36, status: "warning", pct: 72 },
  { item: "Food Supplies", current: "1,240 kg", daily: "32 kg", days: 38, status: "normal", pct: 78 },
  { item: "Medical Supplies", current: "Full kit", daily: "—", days: 90, status: "normal", pct: 95 },
  { item: "Spare Parts (Gen)", current: "14 units", daily: "—", days: 45, status: "normal", pct: 60 },
  { item: "Water Reserves", current: "18,400 L", daily: "380 L", days: 48, status: "normal", pct: 85 },
  { item: "Technical Components", current: "Low stock", daily: "—", days: 12, status: "critical", pct: 20 },
  { item: "Aviation Fuel", current: "4,200 L", daily: "—", days: 60, status: "normal", pct: 70 },
];

const statusColors: Record<string, string> = {
  normal: "#10b981",
  warning: "#f59e0b",
  critical: "#ef4444",
};

export default function Logistics() {
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.06em", color: "#e2e8f0" }}>
            LOGISTICS & RESOURCE COMMAND
          </h1>
          <p style={{ fontSize: 13, color: "#64748b" }}>Fuel, inventory, and resupply management</p>
        </div>
        <button className="btn-primary" style={{ fontSize: 12 }}>Request Resupply</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
        {/* Fuel tank visual */}
        <div className="glass" style={{ borderRadius: 8, padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="section-label" style={{ marginBottom: 16 }}>Primary Fuel Storage</div>
          <FuelTank level={72} />
          <div className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b", marginTop: 12 }}>7,200 L</div>
          <div className="font-mono" style={{ fontSize: 12, color: "#475569" }}>72% CAPACITY</div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
            <InfoRow label="Daily Consumption" value="~200 L" />
            <InfoRow label="Consumption Trend" value="+8% ↑" valueColor="#f59e0b" />
            <InfoRow label="Est. Depletion" value="18 Sep 2026" />
            <InfoRow label="Next Resupply" value="20 Sep 2026" />
            <InfoRow label="Safety Reserve" value="1,000 L" />
          </div>
          <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 5, width: "100%" }}>
            <div className="font-mono" style={{ fontSize: 9, color: "#ef4444", letterSpacing: "0.1em", marginBottom: 4 }}>⚠ RISK: HIGH</div>
            <p style={{ fontSize: 10, color: "#94a3b8" }}>Depletion window narrows resupply buffer to 2 days. Contingency plan required.</p>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Fuel trend chart */}
          <div className="chart-container">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>Fuel Consumption Forecast</div>
                <div className="section-label" style={{ marginTop: 2 }}>14-day projection with resupply date</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={fuelHistory}>
                <defs>
                  <linearGradient id="fuelGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" tick={{ fontSize: 8, fill: "#475569", fontFamily: "JetBrains Mono" }} interval={1}/>
                <YAxis domain={[5000, 9000]} tick={{ fontSize: 8, fill: "#475569", fontFamily: "JetBrains Mono" }} width={38}/>
                <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 11 }} />
                <Area type="monotone" dataKey="actual" stroke="#f59e0b" strokeWidth={2} fill="url(#fuelGrad2)" dot={false} name="Actual (L)"/>
                <Area type="monotone" dataKey="forecast" stroke="#0ea5e9" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="3 2" name="Forecast (L)"/>
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              <div className="font-mono" style={{ fontSize: 10, color: "#f59e0b" }}>━ Actual consumption</div>
              <div className="font-mono" style={{ fontSize: 10, color: "#0ea5e9" }}>╌ Forecast</div>
              <div className="font-mono" style={{ fontSize: 10, color: "#10b981" }}>▲ Resupply: Sep 20</div>
            </div>
          </div>

          {/* AI prediction strip */}
          <div style={{ padding: "12px 16px", background: "rgba(0,200,232,0.05)", border: "1px solid rgba(0,200,232,0.15)", borderRadius: 6, display: "flex", gap: 24 }}>
            <div>
              <div className="font-mono" style={{ fontSize: 9, color: "#00c8e8", letterSpacing: "0.1em", marginBottom: 4 }}>AI PREDICTION</div>
              <p style={{ fontSize: 12, color: "#94a3b8" }}>Estimated depletion: <strong style={{ color: "#ef4444" }}>18 Sept 2026</strong> · Next resupply: <strong style={{ color: "#10b981" }}>20 Sept 2026</strong></p>
            </div>
            <div style={{ borderLeft: "1px solid rgba(0,200,232,0.1)", paddingLeft: 24 }}>
              <div className="font-mono" style={{ fontSize: 9, color: "#00c8e8", letterSpacing: "0.1em", marginBottom: 4 }}>RECOMMENDATION</div>
              <p style={{ fontSize: 12, color: "#94a3b8" }}>Increase emergency reserve by <strong style={{ color: "#f59e0b" }}>18%</strong>. Reduce non-critical load by 8% for 72h.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory table */}
      <div className="glass" style={{ borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(0,200,232,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="section-label">Inventory Status</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }}>Export CSV</button>
            <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>Update Stock</button>
          </div>
        </div>
        <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Item</th>
              <th style={{ textAlign: "right" }}>Current Stock</th>
              <th style={{ textAlign: "right" }}>Daily Usage</th>
              <th style={{ textAlign: "right" }}>Days Remaining</th>
              <th style={{ textAlign: "center" }}>Level</th>
              <th style={{ textAlign: "center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(r => (
              <tr key={r.item}>
                <td style={{ color: "#e2e8f0", fontWeight: 500 }}>{r.item}</td>
                <td style={{ textAlign: "right" }} className="font-mono">{r.current}</td>
                <td style={{ textAlign: "right" }} className="font-mono">{r.daily}</td>
                <td className="font-mono" style={{ textAlign: "right", color: r.days < 20 ? "#ef4444" : r.days < 40 ? "#f59e0b" : "#10b981" }}>{r.days}d</td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ height: 4, background: "rgba(148,163,184,0.1)", borderRadius: 2, width: 100 }}>
                    <div style={{ width: `${r.pct}%`, height: "100%", background: statusColors[r.status], borderRadius: 2, opacity: 0.8 }} />
                  </div>
                </td>
                <td style={{ textAlign: "center" }}>
                  <span style={{ padding: "2px 8px", background: `${statusColors[r.status]}12`, border: `1px solid ${statusColors[r.status]}30`, borderRadius: 3, fontSize: 9, fontFamily: "JetBrains Mono", color: statusColors[r.status], letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FuelTank({ level }: { level: number }) {
  const height = 140;
  const fillHeight = (level / 100) * height;
  return (
    <div style={{ position: "relative", width: 80 }}>
      <svg width="80" height={height + 20} viewBox={`0 0 80 ${height + 20}`}>
        {/* Tank body */}
        <rect x="10" y="8" width="60" height={height} rx="4" fill="rgba(7,13,26,0.8)" stroke="rgba(0,200,232,0.2)" strokeWidth="1.5"/>
        {/* Fill */}
        <rect
          x="12" y={8 + height - fillHeight}
          width="56" height={fillHeight - 2}
          rx="2"
          fill={level < 30 ? "#ef4444" : level < 60 ? "#f59e0b" : "#10b981"}
          opacity="0.7"
        />
        {/* Wave on top of fill */}
        <path
          d={`M 12 ${8 + height - fillHeight} Q 22 ${8 + height - fillHeight - 4} 40 ${8 + height - fillHeight} Q 58 ${8 + height - fillHeight + 4} 68 ${8 + height - fillHeight} V ${8 + height - fillHeight} Z`}
          fill={level < 30 ? "#ef4444" : level < 60 ? "#f59e0b" : "#10b981"}
          opacity="0.5"
        />
        {/* Measurement marks */}
        {[25, 50, 75].map(m => (
          <g key={m}>
            <line x1="10" y1={8 + height - (m / 100) * height} x2="18" y2={8 + height - (m / 100) * height} stroke="rgba(148,163,184,0.3)" strokeWidth="1"/>
            <text x="4" y={8 + height - (m / 100) * height + 3} fill="#475569" fontSize="7" fontFamily="JetBrains Mono" textAnchor="middle">{m}</text>
          </g>
        ))}
        {/* Cap */}
        <rect x="28" y="3" width="24" height="8" rx="2" fill="rgba(0,200,232,0.1)" stroke="rgba(0,200,232,0.2)" strokeWidth="1"/>
        {/* Level text */}
        <text x="40" y={8 + height / 2 + 4} textAnchor="middle" fill="white" fontSize="14" fontFamily="Rajdhani" fontWeight="700">{level}%</text>
      </svg>
    </div>
  );
}

function InfoRow({ label, value, valueColor = "#e2e8f0" }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
      <span className="section-label">{label}</span>
      <span className="font-mono" style={{ fontSize: 10, color: valueColor, fontWeight: 600 }}>{value}</span>
    </div>
  );
}
