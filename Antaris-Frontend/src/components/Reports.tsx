const reportTypes = [
  {
    id: "daily", title: "Daily Operations Report",
    sub: "Comprehensive station activity summary",
    icon: "📋", date: "Sep 11, 2026", pages: 14,
    color: "#00c8e8", status: "ready",
  },
  {
    id: "energy", title: "Energy Management Report",
    sub: "Generation, consumption & efficiency metrics",
    icon: "⚡", date: "Sep 11, 2026", pages: 8,
    color: "#10b981", status: "ready",
  },
  {
    id: "fuel", title: "Fuel & Logistics Report",
    sub: "Consumption trends, inventory, resupply status",
    icon: "🛢", date: "Sep 11, 2026", pages: 6,
    color: "#f59e0b", status: "ready",
  },
  {
    id: "equipment", title: "Equipment Health Report",
    sub: "Health scores, maintenance log, failure predictions",
    icon: "⚙", date: "Sep 11, 2026", pages: 12,
    color: "#8b5cf6", status: "ready",
  },
  {
    id: "environment", title: "Environmental Report",
    sub: "Weather data, anomalies, forecast accuracy",
    icon: "🌡", date: "Sep 11, 2026", pages: 10,
    color: "#0ea5e9", status: "generating",
  },
  {
    id: "incident", title: "Incident & Alert Report",
    sub: "Alert timeline, resolutions, recommendations",
    icon: "⚠", date: "Sep 10, 2026", pages: 4,
    color: "#ef4444", status: "ready",
  },
  {
    id: "simulation", title: "Simulation Report",
    sub: "What-if scenarios, risk assessments, AI insights",
    icon: "◈", date: "Sep 09, 2026", pages: 7,
    color: "#64748b", status: "ready",
  },
  {
    id: "monthly", title: "Monthly Station Summary",
    sub: "Aggregate monthly KPIs and trend analysis",
    icon: "📊", date: "Aug 31, 2026", pages: 24,
    color: "#00c8e8", status: "archived",
  },
];

export default function Reports() {
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.06em", color: "#e2e8f0" }}>
            STATION INTELLIGENCE REPORTS
          </h1>
          <p style={{ fontSize: 13, color: "#64748b" }}>Automated reporting · AI-generated insights · Export ready</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-secondary" style={{ fontSize: 12 }}>Generate All</button>
          <button className="btn-ghost" style={{ fontSize: 12 }}>Schedule Reports</button>
        </div>
      </div>

      {/* Report cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {reportTypes.map(r => (
          <div key={r.id} className="kpi-card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${r.color}, transparent)` }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: 6, background: `${r.color}12`, border: `1px solid ${r.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                  {r.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.3 }}>{r.title}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 1 }}>{r.date} · {r.pages} pages</div>
                </div>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <p style={{ fontSize: 11, color: "#64748b", marginBottom: 14 }}>{r.sub}</p>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn-secondary" style={{ flex: 1, fontSize: 11, padding: "6px 10px" }}>Generate</button>
              <button className="btn-ghost" style={{ fontSize: 11, padding: "6px 10px" }}>Preview</button>
              <button className="btn-ghost" style={{ fontSize: 11, padding: "6px 10px" }}>PDF ↓</button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="glass" style={{ borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(0,200,232,0.1)" }}>
          <div className="section-label">Recent Report Activity</div>
        </div>
        <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Report</th>
              <th style={{ textAlign: "left" }}>Generated</th>
              <th style={{ textAlign: "left" }}>By</th>
              <th style={{ textAlign: "right" }}>Pages</th>
              <th style={{ textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Daily Operations Report", date: "Sep 11, 09:00", by: "Auto", pages: 14 },
              { name: "Energy Management Report", date: "Sep 11, 09:00", by: "Auto", pages: 8 },
              { name: "Incident Report — ALT-002", date: "Sep 11, 07:52", by: "Dr. D. Pillai", pages: 3 },
              { name: "Simulation Report — Extreme Cold", date: "Sep 10, 14:30", by: "Eng. R. Kumar", pages: 7 },
            ].map(r => (
              <tr key={r.name}>
                <td style={{ color: "#e2e8f0", fontWeight: 500 }}>{r.name}</td>
                <td className="font-mono" style={{ fontSize: 11 }}>{r.date}</td>
                <td style={{ color: "#64748b" }}>{r.by}</td>
                <td style={{ textAlign: "right" }} className="font-mono">{r.pages}</td>
                <td style={{ textAlign: "center" }}>
                  <button className="btn-ghost" style={{ fontSize: 10, padding: "3px 10px" }}>Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    ready: { color: "#10b981", label: "READY" },
    generating: { color: "#f59e0b", label: "GENERATING" },
    archived: { color: "#475569", label: "ARCHIVED" },
  };
  const c = config[status] || config.ready;
  return (
    <span style={{ padding: "2px 7px", background: `${c.color}12`, border: `1px solid ${c.color}30`, borderRadius: 3, fontSize: 9, fontFamily: "JetBrains Mono", color: c.color, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
      {c.label}
    </span>
  );
}
