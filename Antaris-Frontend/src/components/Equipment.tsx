type Status = "normal" | "warning" | "critical" | "offline";

const equipment = [
  {
    id: "GEN-01", name: "Generator G-01", type: "Power Generation",
    status: "normal" as Status, health: 91, runtime: "5,120 hrs", temp: "74°C",
    vibration: "Normal", failProb: 4, lastMaint: "Aug 15, 2026", nextMaint: "Oct 15, 2026",
  },
  {
    id: "GEN-02", name: "Generator G-02", type: "Power Generation",
    status: "warning" as Status, health: 68, runtime: "7,421 hrs", temp: "87°C",
    vibration: "HIGH", failProb: 18, lastMaint: "Jul 02, 2026", nextMaint: "Sep 13, 2026",
  },
  {
    id: "HTR-04", name: "Heating Unit H-04", type: "HVAC / Thermal",
    status: "warning" as Status, health: 72, runtime: "3,204 hrs", temp: "88°C",
    vibration: "Elevated", failProb: 12, lastMaint: "Aug 01, 2026", nextMaint: "Sep 17, 2026",
  },
  {
    id: "SAT-01", name: "Satellite Comms", type: "Communications",
    status: "normal" as Status, health: 100, runtime: "8,760 hrs", temp: "-18°C",
    vibration: "N/A", failProb: 1, lastMaint: "Sep 01, 2026", nextMaint: "Dec 01, 2026",
  },
  {
    id: "BAT-01", name: "Battery Bank B-01", type: "Energy Storage",
    status: "normal" as Status, health: 88, runtime: "12,400 hrs", temp: "22°C",
    vibration: "N/A", failProb: 3, lastMaint: "Jul 20, 2026", nextMaint: "Oct 20, 2026",
  },
  {
    id: "WTR-01", name: "Water Treatment", type: "Life Support",
    status: "normal" as Status, health: 95, runtime: "2,880 hrs", temp: "12°C",
    vibration: "Normal", failProb: 2, lastMaint: "Aug 10, 2026", nextMaint: "Nov 10, 2026",
  },
];

const upcoming = [
  { eq: "Generator G-02", action: "Vibration inspection", urgency: "IMMEDIATE", days: 2, risk: "#ef4444" },
  { eq: "Heating Unit H-04", action: "Predictive maintenance", urgency: "PLANNED", days: 6, risk: "#f59e0b" },
  { eq: "Battery Bank B-01", action: "Cycle test & capacity check", urgency: "SCHEDULED", days: 39, risk: "#10b981" },
];

const statusColors: Record<Status, string> = {
  normal: "#10b981",
  warning: "#f59e0b",
  critical: "#ef4444",
  offline: "#475569",
};

export default function Equipment() {
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.06em", color: "#e2e8f0" }}>
            EQUIPMENT INTELLIGENCE
          </h1>
          <p style={{ fontSize: 13, color: "#64748b" }}>Health monitoring · Predictive maintenance · Failure risk analysis</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["All", "Warning", "Critical"].map(f => (
            <button key={f} className="btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          { label: "Overall Health", value: "87%", color: "#10b981" },
          { label: "Items Normal", value: "4 / 6", color: "#10b981" },
          { label: "Items Warning", value: "2 / 6", color: "#f59e0b" },
          { label: "Avg Failure Risk", value: "6.7%", color: "#f59e0b" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="section-label" style={{ marginBottom: 8 }}>{k.label}</div>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Equipment cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {equipment.map(eq => (
          <EquipmentCard key={eq.id} eq={eq} />
        ))}
      </div>

      {/* Predictive maintenance */}
      <div className="glass" style={{ borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(0,200,232,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>Predictive Maintenance Schedule</div>
            <div className="section-label" style={{ marginTop: 2 }}>AI-generated maintenance predictions based on sensor telemetry</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {upcoming.map((m, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 20px",
              borderBottom: "1px solid rgba(148,163,184,0.06)",
              borderLeft: `3px solid ${m.risk}`,
            }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", border: `2px solid ${m.risk}`, display: "flex", alignItems: "center", justifyContent: "center", background: `${m.risk}10`, flexShrink: 0 }}>
                <span className="font-mono" style={{ fontSize: 11, fontWeight: 700, color: m.risk }}>{m.days}d</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 2 }}>{m.eq}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{m.action}</div>
              </div>
              <div style={{ padding: "3px 10px", background: `${m.risk}12`, border: `1px solid ${m.risk}30`, borderRadius: 4, fontSize: 10, fontFamily: "JetBrains Mono", color: m.risk, letterSpacing: "0.1em" }}>
                {m.urgency}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn-secondary" style={{ fontSize: 11, padding: "5px 12px" }}>Schedule</button>
                <button className="btn-ghost" style={{ fontSize: 11, padding: "5px 12px" }}>Inspect</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EquipmentCard({ eq }: { eq: typeof equipment[0] }) {
  const color = statusColors[eq.status];
  const r = 32;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - eq.health / 100);

  return (
    <div className="kpi-card" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 2 }}>{eq.id} · {eq.type}</div>
            <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{eq.name}</div>
          </div>
          <span style={{ padding: "2px 8px", background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 3, fontSize: 9, fontFamily: "JetBrains Mono", color, letterSpacing: "0.1em" }}>
            {eq.status.toUpperCase()}
          </span>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
          {/* Health ring */}
          <svg width={74} height={74}>
            <circle cx={37} cy={37} r={r} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="5"/>
            <circle cx={37} cy={37} r={r} fill="none" stroke={color} strokeWidth="5"
              strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
              transform={`rotate(-90 37 37)`}
              style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            />
            <text x={37} y={37} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="14" fontFamily="Rajdhani, sans-serif" fontWeight="700">{eq.health}%</text>
          </svg>
          <div>
            <div className="section-label" style={{ marginBottom: 6 }}>Health Score</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <MiniStat label="Runtime" value={eq.runtime} />
              <MiniStat label="Temp" value={eq.temp} valueColor={parseInt(eq.temp) > 85 ? "#f59e0b" : "#e2e8f0"} />
              <MiniStat label="Vibration" value={eq.vibration} valueColor={eq.vibration === "HIGH" ? "#ef4444" : eq.vibration === "Elevated" ? "#f59e0b" : "#10b981"} />
            </div>
          </div>
        </div>

        {/* Failure risk bar */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span className="section-label">Failure Risk</span>
            <span className="font-mono" style={{ fontSize: 10, color: eq.failProb > 15 ? "#ef4444" : eq.failProb > 8 ? "#f59e0b" : "#10b981", fontWeight: 600 }}>{eq.failProb}%</span>
          </div>
          <div style={{ height: 3, background: "rgba(148,163,184,0.1)", borderRadius: 2 }}>
            <div style={{ width: `${eq.failProb}%`, height: "100%", background: eq.failProb > 15 ? "#ef4444" : eq.failProb > 8 ? "#f59e0b" : "#10b981", borderRadius: 2, opacity: 0.8 }} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#475569" }}>
          <span>Last maint: {eq.lastMaint}</span>
          <span>Next: {eq.nextMaint}</span>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, valueColor = "#e2e8f0" }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <span className="section-label" style={{ width: 52 }}>{label}</span>
      <span className="font-mono" style={{ fontSize: 10, color: valueColor, fontWeight: 600 }}>{value}</span>
    </div>
  );
}
