const schedule = [
  {
    id: "MNT-041",
    equipment: "Generator G-02",
    type: "Vibration Inspection",
    priority: "CRITICAL",
    due: "Sep 13, 2026",
    daysLeft: 2,
    assignee: "Eng. R. Kumar",
    status: "pending",
    duration: "4 hrs",
    notes: "Abnormal vibration detected. Full bearing inspection and lubrication check required.",
  },
  {
    id: "MNT-042",
    equipment: "Heating Unit H-04",
    type: "Predictive Maintenance",
    priority: "HIGH",
    due: "Sep 17, 2026",
    daysLeft: 6,
    assignee: "Tech. S. Sharma",
    status: "scheduled",
    duration: "6 hrs",
    notes: "Load approaching maximum capacity. Valve inspection and thermal efficiency check.",
  },
  {
    id: "MNT-043",
    equipment: "Battery Bank B-01",
    type: "Cycle Test & Capacity Check",
    priority: "ROUTINE",
    due: "Oct 20, 2026",
    daysLeft: 39,
    assignee: "Eng. P. Nair",
    status: "scheduled",
    duration: "8 hrs",
    notes: "Quarterly capacity test and cell health assessment.",
  },
  {
    id: "MNT-040",
    equipment: "Satellite Comm Array",
    type: "Antenna Alignment Check",
    priority: "ROUTINE",
    due: "Sep 09, 2026",
    daysLeft: -2,
    assignee: "Tech. A. Verma",
    status: "completed",
    duration: "2 hrs",
    notes: "Completed successfully. Signal strength improved by 3 dBm.",
  },
];

const priorityColors: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f59e0b",
  ROUTINE: "#10b981",
};

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  scheduled: "#00c8e8",
  completed: "#10b981",
  overdue: "#ef4444",
};

export default function Maintenance() {
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.06em", color: "#e2e8f0" }}>
            MAINTENANCE CONTROL
          </h1>
          <p style={{ fontSize: 13, color: "#64748b" }}>Scheduled maintenance · Work orders · Service history</p>
        </div>
        <button className="btn-primary" style={{ fontSize: 12 }}>New Work Order</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          { label: "Critical Pending", value: "1", color: "#ef4444" },
          { label: "Scheduled (30d)", value: "3", color: "#00c8e8" },
          { label: "Completed (Month)", value: "12", color: "#10b981" },
          { label: "Avg Completion", value: "4.2 hrs", color: "#94a3b8" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="section-label" style={{ marginBottom: 8 }}>{k.label}</div>
            <div className="font-display" style={{ fontSize: 24, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Schedule */}
      <div className="glass" style={{ borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(0,200,232,0.1)" }}>
          <div className="section-label">Maintenance Schedule</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {schedule.map(m => (
            <div key={m.id} style={{
              display: "flex",
              gap: 16,
              padding: "16px 20px",
              borderBottom: "1px solid rgba(148,163,184,0.06)",
              borderLeft: `3px solid ${priorityColors[m.priority]}`,
              alignItems: "flex-start",
            }}>
              <div style={{ width: 60, flexShrink: 0, textAlign: "center" }}>
                <div className="font-mono" style={{ fontSize: 22, fontWeight: 700, color: m.daysLeft < 0 ? "#ef4444" : m.daysLeft <= 3 ? "#f59e0b" : "#94a3b8" }}>
                  {m.daysLeft < 0 ? Math.abs(m.daysLeft) : m.daysLeft}
                </div>
                <div className="font-mono" style={{ fontSize: 8, color: "#475569", letterSpacing: "0.1em" }}>
                  {m.daysLeft < 0 ? "DAYS AGO" : "DAYS LEFT"}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                  <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{m.equipment}</div>
                  <span style={{ padding: "1px 7px", background: `${priorityColors[m.priority]}12`, border: `1px solid ${priorityColors[m.priority]}30`, borderRadius: 3, fontSize: 9, fontFamily: "JetBrains Mono", color: priorityColors[m.priority], letterSpacing: "0.1em" }}>
                    {m.priority}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>{m.type}</div>
                <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>{m.notes}</div>
                <div style={{ display: "flex", gap: 16, fontSize: 10, color: "#475569" }}>
                  <span>ID: <span className="font-mono" style={{ color: "#64748b" }}>{m.id}</span></span>
                  <span>Assignee: <span style={{ color: "#64748b" }}>{m.assignee}</span></span>
                  <span>Duration: <span className="font-mono" style={{ color: "#64748b" }}>{m.duration}</span></span>
                  <span>Due: <span style={{ color: "#64748b" }}>{m.due}</span></span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                <span style={{ padding: "2px 8px", background: `${statusColors[m.status]}12`, border: `1px solid ${statusColors[m.status]}30`, borderRadius: 3, fontSize: 9, fontFamily: "JetBrains Mono", color: statusColors[m.status], letterSpacing: "0.1em" }}>
                  {m.status.toUpperCase()}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-secondary" style={{ fontSize: 10, padding: "4px 10px" }}>Update</button>
                  <button className="btn-ghost" style={{ fontSize: 10, padding: "4px 10px" }}>View</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
