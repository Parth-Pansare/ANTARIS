import { useState } from "react";

type Priority = "critical" | "warning" | "info" | "resolved";

interface Alert {
  id: string;
  time: string;
  system: string;
  priority: Priority;
  title: string;
  description: string;
  currentValue: string;
  threshold: string;
  recommendation: string;
}

const alerts: Alert[] = [
  {
    id: "ALT-001",
    time: "09:14:32",
    system: "FUEL SYSTEM",
    priority: "critical",
    title: "Fuel Consumption Anomaly",
    description: "Fuel consumption has exceeded predicted range by 14% over the past 6 hours. Current daily rate: 228 L vs forecast 200 L.",
    currentValue: "228 L/day",
    threshold: "220 L/day",
    recommendation: "Review generator load distribution. Initiate contingency resupply plan. Check for potential fuel line inefficiency.",
  },
  {
    id: "ALT-002",
    time: "07:52:18",
    system: "GENERATOR G-02",
    priority: "critical",
    title: "Abnormal Vibration — Generator G-02",
    description: "Vibration sensors on Generator G-02 are reporting readings 34% above normal operational range. Temperature also elevated at 87°C.",
    currentValue: "1.8 mm/s RMS",
    threshold: "1.2 mm/s RMS",
    recommendation: "Reduce generator load to 65%. Schedule immediate mechanical inspection. Prepare G-01 for full load transfer.",
  },
  {
    id: "ALT-003",
    time: "06:30:00",
    system: "HEATING UNIT H-04",
    priority: "warning",
    title: "Heating Unit Operating Near Capacity",
    description: "H-04 is operating at 91% rated capacity. Predictive model forecasts maintenance requirement within 6 days if load remains unchanged.",
    currentValue: "91% capacity",
    threshold: "88% capacity",
    recommendation: "Monitor closely. Pre-schedule maintenance window. Consider distributing heating load to backup units.",
  },
  {
    id: "ALT-004",
    time: "04:15:09",
    system: "ENVIRONMENT",
    priority: "info",
    title: "Temperature Forecast — Significant Drop",
    description: "AI forecast indicates temperature will reach -34°C within 24 hours — 9°C below current. Potential blizzard conditions.",
    currentValue: "-25°C",
    threshold: "N/A",
    recommendation: "Pre-warm heating systems. Review outdoor equipment protocols. Brief crew on weather procedures.",
  },
  {
    id: "ALT-005",
    time: "Yesterday",
    system: "INVENTORY",
    priority: "resolved",
    title: "Technical Components Stock Low",
    description: "Technical component inventory reached critical threshold (12 days remaining). Resupply request has been initiated.",
    currentValue: "12 days",
    threshold: "14 days",
    recommendation: "Resupply request submitted. ETA: Sep 20, 2026. Avoid non-essential component usage.",
  },
];

const priorityMeta: Record<Priority, { color: string; bg: string; label: string; border: string }> = {
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.05)", label: "CRITICAL", border: "alert-critical" },
  warning: { color: "#f59e0b", bg: "rgba(245,158,11,0.05)", label: "WARNING", border: "alert-warning" },
  info: { color: "#00c8e8", bg: "rgba(0,200,232,0.05)", label: "INFO", border: "alert-info" },
  resolved: { color: "#475569", bg: "rgba(71,85,105,0.05)", label: "RESOLVED", border: "" },
};

export default function Alerts() {
  const [filter, setFilter] = useState<"all" | Priority>("all");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const filtered = alerts.filter(a => filter === "all" || a.priority === filter);

  const counts = {
    all: alerts.length,
    critical: alerts.filter(a => a.priority === "critical").length,
    warning: alerts.filter(a => a.priority === "warning").length,
    info: alerts.filter(a => a.priority === "info").length,
    resolved: alerts.filter(a => a.priority === "resolved").length,
  };

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.06em", color: "#e2e8f0" }}>
            MISSION ALERTS
          </h1>
          <p style={{ fontSize: 13, color: "#64748b" }}>Real-time alert monitoring · Recommended actions · Station intelligence</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setAcknowledged(new Set(alerts.map(a => a.id)))} className="btn-secondary" style={{ fontSize: 12 }}>Acknowledge All</button>
          <button onClick={() => alert("Exported alerts_log.csv")} className="btn-ghost" style={{ fontSize: 12 }}>Export Log</button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6 }}>
        {(["all", "critical", "warning", "info", "resolved"] as const).map(f => {
          const meta = f !== "all" ? priorityMeta[f] : { color: "#94a3b8", bg: "", label: "ALL", border: "" };
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px",
                borderRadius: 4,
                fontSize: 11,
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "0.08em",
                cursor: "pointer",
                background: isActive ? (f !== "all" ? `${meta.color}12` : "rgba(148,163,184,0.1)") : "transparent",
                border: isActive ? `1px solid ${meta.color}30` : "1px solid rgba(148,163,184,0.12)",
                color: isActive ? meta.color : "#475569",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {meta.label}
              <span style={{ background: isActive ? `${meta.color}20` : "rgba(148,163,184,0.1)", borderRadius: 8, padding: "0 5px", fontSize: 9 }}>
                {counts[f]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Alerts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(alert => {
          const meta = priorityMeta[alert.priority];
          const isAcked = acknowledged.has(alert.id);
          return (
            <div
              key={alert.id}
              className={meta.border}
              style={{
                borderRadius: 8,
                padding: "16px 20px",
                background: isAcked ? "rgba(7,13,26,0.5)" : meta.bg,
                border: `1px solid ${meta.color}20`,
                borderLeftWidth: 3,
                opacity: isAcked ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ padding: "2px 10px", background: `${meta.color}18`, border: `1px solid ${meta.color}30`, borderRadius: 3, fontSize: 9, fontFamily: "JetBrains Mono", color: meta.color, letterSpacing: "0.12em" }}>
                    {meta.label}
                  </span>
                  <span className="font-mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.06em" }}>{alert.system}</span>
                  <span className="font-mono" style={{ fontSize: 10, color: "#2d3d50" }}>ID: {alert.id}</span>
                </div>
                <span className="font-mono" style={{ fontSize: 10, color: "#475569" }}>{alert.time}</span>
              </div>

              <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>{alert.title}</div>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, marginBottom: 12 }}>{alert.description}</p>

              <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                <div style={{ padding: "6px 10px", background: "rgba(7,13,26,0.6)", borderRadius: 4, border: "1px solid rgba(148,163,184,0.08)" }}>
                  <div className="section-label" style={{ marginBottom: 2 }}>Current Value</div>
                  <div className="font-mono" style={{ fontSize: 12, color: meta.color, fontWeight: 600 }}>{alert.currentValue}</div>
                </div>
                <div style={{ padding: "6px 10px", background: "rgba(7,13,26,0.6)", borderRadius: 4, border: "1px solid rgba(148,163,184,0.08)" }}>
                  <div className="section-label" style={{ marginBottom: 2 }}>Threshold</div>
                  <div className="font-mono" style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{alert.threshold}</div>
                </div>
              </div>

              <div style={{ padding: "8px 12px", background: "rgba(0,200,232,0.04)", border: "1px solid rgba(0,200,232,0.1)", borderRadius: 5, marginBottom: 12 }}>
                <span className="font-mono" style={{ fontSize: 9, color: "#00c8e8", letterSpacing: "0.1em" }}>RECOMMENDED ACTION: </span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{alert.recommendation}</span>
              </div>

              {alert.priority !== "resolved" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => alert(`Investigating ${alert.system}...`)} className="btn-primary" style={{ fontSize: 11, padding: "6px 14px" }}>Investigate</button>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: 11, padding: "6px 14px" }}
                    onClick={() => setAcknowledged(prev => new Set([...prev, alert.id]))}
                  >
                    {isAcked ? "✓ Acknowledged" : "Acknowledge"}
                  </button>
                  <button onClick={() => alert(`Opening ${alert.system} diagnostics...`)} className="btn-ghost" style={{ fontSize: 11, padding: "6px 14px" }}>View System</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
