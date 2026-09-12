import { useState } from "react";
import Login from "./components/Login";
import Shell from "./components/Shell";
import Overview from "./components/Overview";
import DigitalTwin from "./components/DigitalTwin";
import Environment from "./components/Environment";
import Energy from "./components/Energy";
import Logistics from "./components/Logistics";
import Equipment from "./components/Equipment";
import Predictions from "./components/Predictions";
import Simulation from "./components/Simulation";
import Alerts from "./components/Alerts";
import Maintenance from "./components/Maintenance";
import Reports from "./components/Reports";
import Comparison from "./components/Comparison";
import ScenarioComparison from "./components/ScenarioComparison";

type Screen =
  | "overview"
  | "twin"
  | "environment"
  | "energy"
  | "equipment"
  | "logistics"
  | "predictions"
  | "simulation"
  | "scenariocmp"
  | "alerts"
  | "maintenance"
  | "reports"
  | "settings"
  | "comparison";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [screen, setScreen] = useState<Screen>("overview");
  const [station, setStation] = useState<"MAITRI" | "BHARATI">("MAITRI");

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  const renderScreen = () => {
    switch (screen) {
      case "overview":    return <Overview station={station} />;
      case "twin":        return <DigitalTwin />;
      case "environment": return <Environment />;
      case "energy":      return <Energy />;
      case "logistics":   return <Logistics />;
      case "equipment":   return <Equipment />;
      case "predictions": return <Predictions />;
      case "simulation":   return <Simulation />;
      case "scenariocmp": return <ScenarioComparison />;
      case "alerts":       return <Alerts />;
      case "maintenance": return <Maintenance />;
      case "reports":     return <Reports />;
      case "comparison":  return <Comparison />;
      case "settings":    return <Settings />;
      default:            return <Overview station={station} />;
    }
  };

  return (
    <Shell
      active={screen}
      onNavigate={setScreen}
      station={station}
      onStationChange={setStation}
      onLogout={() => setLoggedIn(false)}
    >
      {renderScreen()}
    </Shell>
  );
}

function Settings() {
  return (
    <div style={{ padding: "20px" }}>
      <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.06em", color: "#e2e8f0", marginBottom: 6 }}>
        SYSTEM SETTINGS
      </h1>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>Platform configuration and user preferences</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 800 }}>
        {["Telemetry Refresh Rate", "Alert Thresholds", "Notification Settings", "User Management", "Data Retention", "API Configuration", "Security & Access", "About POLARIS"].map(s => (
          <div key={s} className="kpi-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <span style={{ fontSize: 14, color: "#94a3b8" }}>{s}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
