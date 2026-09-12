import { Icons, LiveBadge } from "./Icons";
import { PolarisLogo } from "./Login";

type Screen =
  | "overview"
  | "twin"
  | "environment"
  | "energy"
  | "equipment"
  | "logistics"
  | "predictions"
  | "simulation"
  | "alerts"
  | "maintenance"
  | "reports"
  | "settings"
  | "comparison";

interface Props {
  children: React.ReactNode;
  active: Screen;
  onNavigate: (s: Screen) => void;
  station: "MAITRI" | "BHARATI";
  onStationChange: (s: "MAITRI" | "BHARATI") => void;
  onLogout: () => void;
}

const navItems: { id: Screen; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: "overview", label: "Overview", icon: Icons.overview },
  { id: "twin", label: "Digital Twin", icon: Icons.twin },
  { id: "environment", label: "Environment", icon: Icons.environment },
  { id: "energy", label: "Energy", icon: Icons.energy },
  { id: "equipment", label: "Equipment", icon: Icons.equipment },
  { id: "logistics", label: "Logistics", icon: Icons.logistics },
  { id: "predictions", label: "Predictions", icon: Icons.predictions },
  { id: "simulation", label: "Simulations", icon: Icons.simulation },
  { id: "scenariocmp", label: "Scen. Compare", icon: Icons.comparison },
  { id: "alerts", label: "Alerts", icon: Icons.alerts, badge: 3 },
  { id: "maintenance", label: "Maintenance", icon: Icons.maintenance },
  { id: "reports", label: "Reports", icon: Icons.reports },
  { id: "comparison", label: "Station Compare", icon: Icons.comparison },
  { id: "settings", label: "Settings", icon: Icons.settings },
];

function formatTime() {
  const now = new Date();
  // Antarctic local time (UTC+5 for Maitri)
  const antarcticOffset = 5 * 60;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const antTime = new Date(utc + antarcticOffset * 60000);
  return antTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

export default function Shell({ children, active, onNavigate, station, onStationChange, onLogout }: Props) {
  const [time, setTime] = React.useState(formatTime());
  React.useEffect(() => {
    const t = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#070d1a", overflow: "hidden" }}>
      {/* SIDEBAR */}
      <aside style={{
        width: 200,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "rgba(7,13,26,0.95)",
        borderRight: "1px solid rgba(0,200,232,0.1)",
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid rgba(0,200,232,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <PolarisLogo size={28} />
            <div>
              <div className="font-display" style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.08em", color: "#e2e8f0", lineHeight: 1 }}>POLARIS</div>
              <div className="font-mono" style={{ fontSize: 8, color: "#00c8e8", letterSpacing: "0.1em", marginTop: 2 }}>DIGITAL TWIN</div>
            </div>
          </div>
          {/* Station selector */}
          <div style={{ position: "relative" }}>
            <select
              value={station}
              onChange={e => onStationChange(e.target.value as "MAITRI" | "BHARATI")}
              style={{
                width: "100%",
                padding: "7px 10px",
                background: "rgba(0,200,232,0.08)",
                border: "1px solid rgba(0,200,232,0.2)",
                borderRadius: 5,
                color: "#00c8e8",
                fontSize: 12,
                fontFamily: "Rajdhani, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.08em",
                cursor: "pointer",
                outline: "none",
                appearance: "none",
              }}
            >
              <option value="MAITRI">⬡ MAITRI</option>
              <option value="BHARATI">⬡ BHARATI</option>
            </select>
            <svg style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke="#00c8e8" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${active === item.id ? "active" : ""}`}
              style={{ width: "100%", marginBottom: 2, position: "relative" }}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon" style={{ flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  background: "#ef4444",
                  color: "white",
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "1px 5px",
                  borderRadius: 10,
                  minWidth: 18,
                  textAlign: "center",
                }}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom status */}
        <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(0,200,232,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981", flexShrink: 0, display: "inline-block" }} />
            <span className="font-mono" style={{ fontSize: 9, color: "#10b981", letterSpacing: "0.08em" }}>SYSTEM ONLINE</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg, #00c8e8, #0ea5e9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#070d1a", fontFamily: "Rajdhani, sans-serif",
              flexShrink: 0,
            }}>DP</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Dr. D. Pillai</div>
              <div className="font-mono" style={{ fontSize: 9, color: "#475569" }}>STATION COMMANDER</div>
            </div>
            <button onClick={onLogout} title="Logout" style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 2 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 12H2a1 1 0 01-1-1V3a1 1 0 011-1h3M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* TOP BAR */}
        <header style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderBottom: "1px solid rgba(0,200,232,0.1)",
          background: "rgba(7,13,26,0.9)",
          flexShrink: 0,
          gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div>
              <span className="font-display" style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.06em", color: "#e2e8f0" }}>
                {station === "MAITRI" ? "MAITRI STATION" : "BHARATI STATION"}
              </span>
              <span style={{ color: "#475569", margin: "0 8px" }}>·</span>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                {station === "MAITRI" ? "71°S 11°E · Queen Maud Land" : "69°S 76°E · Prydz Bay"}
              </span>
            </div>
            <LiveBadge />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <input
                placeholder="Search systems..."
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(148,163,184,0.12)",
                  borderRadius: 6,
                  padding: "6px 12px 6px 32px",
                  fontSize: 12,
                  color: "#64748b",
                  outline: "none",
                  width: 180,
                  fontFamily: "Inter, sans-serif",
                }}
              />
              <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="5" cy="5" r="4" stroke="#475569" strokeWidth="1.2"/>
                <path d="M8 8l3 3" stroke="#475569" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Time */}
            <div style={{ textAlign: "right" }}>
              <div className="font-mono" style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", letterSpacing: "0.05em" }}>{time}</div>
              <div className="font-mono" style={{ fontSize: 9, color: "#475569", letterSpacing: "0.06em" }}>ANTARCTIC LOCAL · UTC+5</div>
            </div>

            {/* Last sync */}
            <div className="font-mono" style={{ fontSize: 10, color: "#2d3d50", padding: "4px 8px", borderLeft: "1px solid rgba(0,200,232,0.1)" }}>
              SYNC: 04s AGO
            </div>

            {/* Notifications */}
            <button style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 4 }} onClick={() => alert("3 active alerts")}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1a6 6 0 016 6v3l1.5 2.5H1.5L3 10V7a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M7 14.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              <span style={{ position: "absolute", top: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: "#ef4444", border: "1.5px solid #070d1a" }} />
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// Re-export React for convenience
import React from "react";
