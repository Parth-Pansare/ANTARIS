import { useState } from "react";
import { StatusDot } from "./Icons";

type Status = "normal" | "warning" | "critical" | "offline" | "monitoring";

interface System {
  id: string;
  label: string;
  type: string;
  status: Status;
  iso: { x: number; y: number; w: number; h: number; z: number };
  details: Record<string, string | number>;
  aiNote: string;
}

const systems: System[] = [
  {
    id: "main", label: "Main Station", type: "OPERATIONS HQ",
    status: "normal",
    iso: { x: 340, y: 160, w: 110, h: 80, z: 30 },
    details: { Temperature: "19°C", Occupancy: "38 crew", Load: "65%", Health: 98 },
    aiNote: "All systems nominal. Internal temperature maintained. Crew count: 38.",
  },
  {
    id: "lab", label: "Laboratory", type: "RESEARCH FACILITY",
    status: "monitoring",
    iso: { x: 520, y: 120, w: 90, h: 60, z: 22 },
    details: { Temperature: "20°C", Power: "28 kW", Load: "82%", Health: 95 },
    aiNote: "Active research operations. Seismic monitoring online. Data uplink nominal.",
  },
  {
    id: "living", label: "Living Quarters", type: "RESIDENTIAL",
    status: "normal",
    iso: { x: 510, y: 240, w: 85, h: 65, z: 22 },
    details: { Temperature: "21°C", Occupancy: "38", Load: "45%", Health: 99 },
    aiNote: "Occupancy: 38. Life support and heating operating normally.",
  },
  {
    id: "power", label: "Power House", type: "ENERGY PLANT",
    status: "warning",
    iso: { x: 150, y: 200, w: 80, h: 60, z: 24 },
    details: { "G-01 Load": "78%", "G-02 Load": "82%", Temperature: "87°C", Health: 74 },
    aiNote: "Generator G-02 exhibiting abnormal vibration. Inspection within 24h recommended.",
  },
  {
    id: "fuel", label: "Fuel Storage", type: "STORAGE",
    status: "warning",
    iso: { x: 160, y: 110, w: 70, h: 50, z: 40 },
    details: { Level: "72% (7,200L)", Temperature: "−18°C", Pressure: "1.2 bar", Health: 96 },
    aiNote: "Consumption trending +8% above forecast. Estimated depletion: Sep 18.",
  },
  {
    id: "battery", label: "Battery Bank", type: "ENERGY STORAGE",
    status: "monitoring",
    iso: { x: 250, y: 115, w: 65, h: 42, z: 18 },
    details: { SOC: "82%", Temperature: "22°C", "Charge Rate": "+2.1 kW", Health: 88 },
    aiNote: "Charging optimally. SOC at 82%. Full charge in ~4.2 hours.",
  },
  {
    id: "comm", label: "Comm Tower", type: "COMMUNICATIONS",
    status: "normal",
    iso: { x: 380, y: 295, w: 50, h: 35, z: 60 },
    details: { "Signal": "−62 dBm", Power: "8 kW", Uptime: "99.97%", Health: 100 },
    aiNote: "Satellite link active. All communication systems nominal.",
  },
  {
    id: "heat", label: "Heating Unit H-04", type: "HVAC",
    status: "warning",
    iso: { x: 480, y: 310, w: 60, h: 40, z: 14 },
    details: { Load: "91%", Temperature: "88°C", Runtime: "3,204 hrs", Health: 72 },
    aiNote: "Operating near max capacity. Predictive maintenance in 6 days.",
  },
  {
    id: "emerg", label: "Emergency Facility", type: "SAFETY",
    status: "normal",
    iso: { x: 260, y: 295, w: 65, h: 45, z: 16 },
    details: { Status: "STANDBY", Temperature: "16°C", "Last Drill": "3 days ago", Health: 100 },
    aiNote: "Standby mode. All emergency systems armed and ready.",
  },
];

const statusColors: Record<Status, string> = {
  normal: "#10b981",
  warning: "#f59e0b",
  critical: "#ef4444",
  offline: "#475569",
  monitoring: "#00c8e8",
};

const layers = ["All", "Infrastructure", "Energy", "HVAC", "Comms", "Safety"];

function isoProject(x: number, y: number, z: number = 0) {
  const angle = Math.PI / 6;
  const px = (x - y) * Math.cos(angle);
  const py = (x + y) * Math.sin(angle) - z;
  return { px, py };
}

function IsoBuilding({ sys, selected, onClick }: { sys: System; selected: boolean; onClick: () => void }) {
  const { x, y, w, h, z } = sys.iso;
  const color = statusColors[sys.status];

  // 8 corners of box
  const tl = isoProject(x, y, z);
  const tr = isoProject(x + w, y, z);
  const br = isoProject(x + w, y + h, z);
  const bl = isoProject(x, y + h, z);
  const tl0 = isoProject(x, y, 0);
  const tr0 = isoProject(x + w, y, 0);
  const br0 = isoProject(x + w, y + h, 0);
  const bl0 = isoProject(x, y + h, 0);

  const topFace = `${tl.px},${tl.py} ${tr.px},${tr.py} ${br.px},${br.py} ${bl.px},${bl.py}`;
  const leftFace = `${tl.px},${tl.py} ${tl0.px},${tl0.py} ${bl0.px},${bl0.py} ${bl.px},${bl.py}`;
  const rightFace = `${tr.px},${tr.py} ${tr0.px},${tr0.py} ${br0.px},${br0.py} ${br.px},${br.py}`;

  const cx = (tl.px + tr.px + br.px + bl.px) / 4;
  const cy = (tl.py + tr.py + br.py + bl.py) / 4;

  const alpha = selected ? 0.9 : 0.6;
  const strokeW = selected ? 1.2 : 0.7;

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {/* Right face */}
      <polygon points={rightFace}
        fill={`rgba(${hexToRgb(color)},${alpha * 0.25})`}
        stroke={color} strokeWidth={strokeW} strokeOpacity={0.5}
      />
      {/* Left face */}
      <polygon points={leftFace}
        fill={`rgba(${hexToRgb(color)},${alpha * 0.18})`}
        stroke={color} strokeWidth={strokeW} strokeOpacity={0.5}
      />
      {/* Top face */}
      <polygon points={topFace}
        fill={selected ? `rgba(${hexToRgb(color)},0.22)` : `rgba(${hexToRgb(color)},0.12)`}
        stroke={color} strokeWidth={strokeW}
        style={selected ? { filter: `drop-shadow(0 0 8px ${color})` } : {}}
      />
      {/* Status dot */}
      {sys.status === "warning" ? (
        <circle cx={tr.px - 2} cy={tr.py - 2} r="4" fill={color} opacity="0.9">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
        </circle>
      ) : (
        <circle cx={tr.px - 2} cy={tr.py - 2} r="3.5" fill={color} opacity={0.85}/>
      )}
      {/* Label */}
      <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="middle"
        fill={selected ? "#e2e8f0" : "#64748b"} fontSize={selected ? "8.5" : "7.5"}
        fontFamily="JetBrains Mono" fontWeight={selected ? "600" : "400"}
        style={{ pointerEvents: "none" }}
      >{sys.label}</text>
    </g>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// Ground plane
function GroundPlane() {
  const corners = [
    isoProject(80, 60, 0),
    isoProject(680, 60, 0),
    isoProject(680, 380, 0),
    isoProject(80, 380, 0),
  ];
  const pts = corners.map(c => `${c.px},${c.py}`).join(" ");

  // Grid lines
  const gridLines = [];
  for (let gx = 100; gx < 680; gx += 60) {
    const a = isoProject(gx, 60, 0);
    const b = isoProject(gx, 380, 0);
    gridLines.push(<line key={`gx${gx}`} x1={a.px} y1={a.py} x2={b.px} y2={b.py} stroke="rgba(0,200,232,0.04)" strokeWidth="0.5"/>);
  }
  for (let gy = 80; gy < 380; gy += 60) {
    const a = isoProject(80, gy, 0);
    const b = isoProject(680, gy, 0);
    gridLines.push(<line key={`gy${gy}`} x1={a.px} y1={a.py} x2={b.px} y2={b.py} stroke="rgba(0,200,232,0.04)" strokeWidth="0.5"/>);
  }

  return (
    <g>
      <polygon points={pts} fill="rgba(7,13,26,0.9)" stroke="rgba(0,200,232,0.08)" strokeWidth="1"/>
      {gridLines}
    </g>
  );
}

// Connection lines between systems
function Connections({ selected }: { selected: string | null }) {
  const connections = [
    ["power", "main"], ["power", "lab"], ["power", "living"],
    ["battery", "power"], ["fuel", "power"],
    ["comm", "main"], ["heat", "living"], ["heat", "lab"],
  ];
  return (
    <g>
      {connections.map(([a, b]) => {
        const sa = systems.find(s => s.id === a)!;
        const sb = systems.find(s => s.id === b)!;
        const { iso: ia } = sa;
        const { iso: ib } = sb;
        const pa = isoProject(ia.x + ia.w / 2, ia.y + ia.h / 2, 2);
        const pb = isoProject(ib.x + ib.w / 2, ib.y + ib.h / 2, 2);
        const highlight = selected === a || selected === b;
        return (
          <line key={`${a}-${b}`}
            x1={pa.px} y1={pa.py} x2={pb.px} y2={pb.py}
            stroke={highlight ? "#00c8e8" : "rgba(0,200,232,0.12)"}
            strokeWidth={highlight ? 1 : 0.5}
            strokeDasharray={highlight ? "none" : "3,4"}
            opacity={highlight ? 0.8 : 1}
          />
        );
      })}
    </g>
  );
}

export default function DigitalTwin() {
  const [selected, setSelected] = useState<System | null>(null);
  const [layer, setLayer] = useState("All");

  const visible = systems.filter(s => {
    if (layer === "All") return true;
    if (layer === "Infrastructure") return ["main", "lab", "living", "emerg"].includes(s.id);
    if (layer === "Energy") return ["power", "fuel", "battery"].includes(s.id);
    if (layer === "HVAC") return s.id === "heat";
    if (layer === "Comms") return s.id === "comm";
    if (layer === "Safety") return s.id === "emerg";
    return true;
  });

  // Sort by render order (back to front in isometric)
  const sorted = [...visible].sort((a, b) => {
    const aDepth = a.iso.x + a.iso.y;
    const bDepth = b.iso.x + b.iso.y;
    return aDepth - bDepth;
  });

  // SVG viewBox to fit the isometric projection
  const allPts = systems.flatMap(s => {
    const { x, y, w, h, z } = s.iso;
    return [isoProject(x, y, z), isoProject(x + w, y, z), isoProject(x + w, y + h, z), isoProject(x, y + h, z), isoProject(x, y, 0)];
  });
  const minX = Math.min(...allPts.map(p => p.px)) - 20;
  const maxX = Math.max(...allPts.map(p => p.px)) + 20;
  const minY = Math.min(...allPts.map(p => p.py)) - 20;
  const maxY = Math.max(...allPts.map(p => p.py)) + 20;
  const vb = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  return (
    <div style={{ padding: "20px", height: "100%", display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.06em", color: "#e2e8f0" }}>
            MAITRI DIGITAL TWIN
          </h1>
          <p style={{ fontSize: 13, color: "#64748b" }}>Isometric station model · Click any system to inspect · Real-time state</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { icon: "↻", label: "Reset View" },
            { icon: "⊕", label: "Zoom In" },
            { icon: "⊖", label: "Zoom Out" },
          ].map(btn => (
            <button key={btn.label} className="btn-ghost" style={{ fontSize: 12, gap: 4, display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 14 }}>{btn.icon}</span> {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Layer filters */}
      <div style={{ display: "flex", gap: 6 }}>
        <span className="section-label" style={{ alignSelf: "center", marginRight: 4 }}>FILTER:</span>
        {layers.map(l => (
          <button
            key={l}
            onClick={() => setLayer(l)}
            style={{
              padding: "5px 12px", borderRadius: 4, fontSize: 11,
              fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em",
              cursor: "pointer", transition: "all 0.15s",
              background: layer === l ? "rgba(0,200,232,0.12)" : "transparent",
              border: layer === l ? "1px solid rgba(0,200,232,0.3)" : "1px solid rgba(148,163,184,0.12)",
              color: layer === l ? "#00c8e8" : "#475569",
            }}
          >{l}</button>
        ))}
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 280px", gap: 14, minHeight: 0 }}>
        {/* Isometric view */}
        <div className="glass" style={{ borderRadius: 8, overflow: "hidden", position: "relative" }}>
          {/* Station label overlay */}
          <div style={{ position: "absolute", top: 12, left: 16, zIndex: 2 }}>
            <div className="font-mono" style={{ fontSize: 9, color: "#00c8e8", letterSpacing: "0.15em" }}>MAITRI STATION — 71°S 11°E</div>
            <div className="font-mono" style={{ fontSize: 8, color: "#2d3d50", marginTop: 2 }}>QUEEN MAUD LAND, ANTARCTICA</div>
          </div>

          <svg viewBox={vb} style={{ width: "100%", height: "100%", minHeight: 380 }}>
            <defs>
              <filter id="iso-glow">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              {/* Snow/ice texture */}
              <pattern id="snow" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="7" r="0.8" fill="rgba(148,163,184,0.06)"/>
                <circle cx="14" cy="2" r="0.5" fill="rgba(148,163,184,0.04)"/>
                <circle cx="18" cy="15" r="0.6" fill="rgba(148,163,184,0.05)"/>
              </pattern>
            </defs>

            {/* Background */}
            <rect x={minX} y={minY} width={maxX - minX} height={maxY - minY} fill="#070d1a"/>
            <rect x={minX} y={minY} width={maxX - minX} height={maxY - minY} fill="url(#snow)"/>

            {/* Ground */}
            <GroundPlane/>

            {/* Connections */}
            <Connections selected={selected?.id ?? null}/>

            {/* Systems */}
            {sorted.map(sys => (
              <IsoBuilding
                key={sys.id}
                sys={sys}
                selected={selected?.id === sys.id}
                onClick={() => setSelected(prev => prev?.id === sys.id ? null : sys)}
              />
            ))}

            {/* Compass */}
            <g transform={`translate(${maxX - 30},${minY + 20})`}>
              <circle r="14" fill="rgba(7,13,26,0.8)" stroke="rgba(0,200,232,0.2)" strokeWidth="0.8"/>
              <polygon points="0,-10 2,0 -2,0" fill="#00c8e8" opacity="0.9"/>
              <polygon points="0,10 2,0 -2,0" fill="#475569" opacity="0.5"/>
              <text y="0.5" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="5" fontFamily="JetBrains Mono">N</text>
            </g>

            {/* Scale bar */}
            <g transform={`translate(${minX + 12},${maxY - 16})`}>
              <line x1="0" y1="0" x2="40" y2="0" stroke="#475569" strokeWidth="0.5"/>
              <line x1="0" y1="-3" x2="0" y2="3" stroke="#475569" strokeWidth="0.5"/>
              <line x1="40" y1="-3" x2="40" y2="3" stroke="#475569" strokeWidth="0.5"/>
              <text x="20" y="-6" textAnchor="middle" fill="#475569" fontSize="5" fontFamily="JetBrains Mono">100 m</text>
            </g>
          </svg>

          {/* Status legend */}
          <div style={{ position: "absolute", bottom: 12, right: 16, display: "flex", gap: 12, background: "rgba(7,13,26,0.85)", padding: "6px 10px", borderRadius: 5, border: "1px solid rgba(0,200,232,0.1)" }}>
            {(["normal", "warning", "monitoring", "offline"] as Status[]).map(s => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <StatusDot status={s}/>
                <span className="font-mono" style={{ fontSize: 8, color: "#475569", textTransform: "uppercase" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {selected ? (
          <DetailPanel sys={selected} onClose={() => setSelected(null)}/>
        ) : (
          <SystemSummaryPanel systems={systems}/>
        )}
      </div>
    </div>
  );
}

function DetailPanel({ sys, onClose }: { sys: System; onClose: () => void }) {
  const color = statusColors[sys.status];
  const health = Number(sys.details.Health ?? sys.details.health ?? 90);
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - health / 100);
  const hColor = health > 80 ? "#10b981" : health > 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="glass-strong" style={{ borderRadius: 8, padding: 20, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}/>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="section-label" style={{ marginBottom: 3 }}>{sys.type}</div>
          <div className="font-display" style={{ fontSize: 17, fontWeight: 700, color: "#e2e8f0" }}>{sys.label}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>✕</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: `${color}12`, border: `1px solid ${color}28`, borderRadius: 5 }}>
        <StatusDot status={sys.status}/>
        <span className="font-mono" style={{ fontSize: 10, color, letterSpacing: "0.1em" }}>{sys.status.toUpperCase()}</span>
      </div>

      {/* Health ring */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <svg width="84" height="84">
          <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="7"/>
          <circle cx="42" cy="42" r={r} fill="none" stroke={hColor} strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            transform="rotate(-90 42 42)"
            style={{ filter: `drop-shadow(0 0 5px ${hColor})`, transition: "stroke-dashoffset 1s ease" }}
          />
          <text x="42" y="38" textAnchor="middle" fill={hColor} fontSize="16" fontFamily="Rajdhani" fontWeight="700">{health}%</text>
          <text x="42" y="52" textAnchor="middle" fill="#475569" fontSize="7" fontFamily="JetBrains Mono">HEALTH</text>
        </svg>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
          {Object.entries(sys.details).filter(([k]) => k !== "Health").map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
              <span className="section-label">{k}</span>
              <span className="font-mono" style={{ fontSize: 11, color: String(v).includes("HIGH") || String(v).includes("91%") ? "#f59e0b" : "#e2e8f0", fontWeight: 500 }}>{String(v)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Note */}
      <div style={{ padding: "10px 12px", background: "rgba(0,200,232,0.04)", border: "1px solid rgba(0,200,232,0.15)", borderRadius: 6 }}>
        <div className="font-mono" style={{ fontSize: 8, color: "#00c8e8", letterSpacing: "0.12em", marginBottom: 5 }}>AI ANALYSIS</div>
        <p style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.65 }}>{sys.aiNote}</p>
      </div>

      <div style={{ display: "flex", gap: 7 }}>
        <button className="btn-secondary" style={{ flex: 1, fontSize: 11, padding: "7px 10px" }}>History</button>
        <button className="btn-ghost" style={{ flex: 1, fontSize: 11, padding: "7px 10px" }}>Schedule</button>
      </div>
    </div>
  );
}

function SystemSummaryPanel({ systems }: { systems: System[] }) {
  const counts = {
    normal: systems.filter(s => s.status === "normal").length,
    warning: systems.filter(s => s.status === "warning").length,
    monitoring: systems.filter(s => s.status === "monitoring").length,
    offline: systems.filter(s => s.status === "offline").length,
  };
  const statusColors2: Record<string, string> = { normal: "#10b981", warning: "#f59e0b", monitoring: "#00c8e8", offline: "#475569" };

  return (
    <div className="glass" style={{ borderRadius: 8, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>Station Overview</div>
        <div style={{ fontSize: 11, color: "#475569" }}>Click any structure to inspect</div>
      </div>

      {/* Status summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} style={{ padding: "10px", background: `${statusColors2[status]}08`, border: `1px solid ${statusColors2[status]}18`, borderRadius: 5, textAlign: "center" }}>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: statusColors2[status] }}>{count}</div>
            <div className="font-mono" style={{ fontSize: 8, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase" }}>{status}</div>
          </div>
        ))}
      </div>

      {/* System list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div className="section-label" style={{ marginBottom: 8 }}>All Systems</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {systems.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "rgba(7,13,26,0.4)", border: "1px solid rgba(148,163,184,0.06)", borderRadius: 5 }}>
              <StatusDot status={s.status}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</div>
                <div className="font-mono" style={{ fontSize: 8, color: "#2d3d50" }}>{s.type}</div>
              </div>
              <span className="font-mono" style={{ fontSize: 9, color: statusColors[s.status] }}>{s.status.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick tip */}
      <div style={{ padding: "8px 10px", background: "rgba(0,200,232,0.03)", border: "1px solid rgba(0,200,232,0.1)", borderRadius: 5 }}>
        <p style={{ fontSize: 10, color: "#2d3d50", lineHeight: 1.5 }}>💡 Systems with pulsing indicators require immediate attention. Use layer filters to focus on specific subsystems.</p>
      </div>
    </div>
  );
}
