import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine } from "recharts";

interface Params {
  temperature: number;
  windSpeed: number;
  crew: number;
  gen2Status: "ONLINE" | "FAILURE";
  batteryLevel: number;
  fuelLevel: number;
  duration: number;
  energyDemand: number;
}

const defaults: Params = {
  temperature: -25,
  windSpeed: 12,
  crew: 38,
  gen2Status: "ONLINE",
  batteryLevel: 82,
  fuelLevel: 7200,
  duration: 72,
  energyDemand: 100,
};

function simulate(p: Params) {
  const tempFactor = Math.max(0, (-p.temperature - 25) / 10);
  const genFailed = p.gen2Status === "FAILURE";
  const demandFactor = p.energyDemand / 100;

  const energyIncrease = tempFactor * 16 * demandFactor + (genFailed ? 32 : 0) + (p.crew - 30) * 0.5;
  const energy = Math.round(185 + energyIncrease);

  const fuelDailyBase = 200;
  const fuelDailyIncrease = tempFactor * 22 + (genFailed ? 45 : 0);
  const totalDailyRate = fuelDailyBase + fuelDailyIncrease;
  const fuelUsed = totalDailyRate * (p.duration / 24);
  const fuelRemaining = Math.max(0, Math.round(p.fuelLevel - fuelUsed));

  const batteryDrain = (genFailed ? 18 : 0) + tempFactor * 4;
  const battery = Math.max(0, Math.round(p.batteryLevel - batteryDrain));

  const risk: "LOW" | "ELEVATED" | "HIGH" | "CRITICAL" =
    (fuelRemaining < 1000 || (genFailed && tempFactor > 0.5)) ? "CRITICAL" :
    fuelRemaining < 2500 || genFailed ? "HIGH" :
    fuelRemaining < 4000 || tempFactor > 0.5 ? "ELEVATED" : "LOW";

  const riskColors = { LOW: "#10b981", ELEVATED: "#f59e0b", HIGH: "#f97316", CRITICAL: "#ef4444" };
  const riskColor = riskColors[risk];

  // Timeline data
  const timeline = Array.from({ length: p.duration + 1 }, (_, h) => ({
    h: `${h}h`,
    energy: Math.round(185 + energyIncrease * (h / p.duration)),
    fuel: Math.max(0, Math.round(p.fuelLevel - totalDailyRate * (h / 24))),
    battery: Math.max(0, Math.round(p.batteryLevel - batteryDrain * (h / p.duration))),
    baseline_energy: 185,
    baseline_fuel: Math.max(0, Math.round(p.fuelLevel - fuelDailyBase * (h / 24))),
  })).filter((_, i) => i % Math.ceil(p.duration / 24) === 0);

  return { energy, fuelRemaining, battery, risk, riskColor, fuelDailyIncrease, energyIncrease, totalDailyRate, timeline };
}

const riskColors = { LOW: "#10b981", ELEVATED: "#f59e0b", HIGH: "#f97316", CRITICAL: "#ef4444" };

export default function Simulation() {
  const [params, setParams] = useState<Params>(defaults);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof simulate> | null>(null);

  const handleRun = () => {
    setRunning(true);
    setProgress(0);
    setResult(null);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18 + 5;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(interval);
        setResult(simulate(params));
        setRunning(false);
      }
    }, 80);
  };

  const sim = result;
  const tempDelta = params.temperature - defaults.temperature;
  const genFailed = params.gen2Status === "FAILURE";

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.06em", color: "#e2e8f0" }}>
            WHAT-IF SIMULATION
          </h1>
          <p style={{ fontSize: 13, color: "#64748b" }}>Model station behavior before making operational decisions · Cascading impact analysis</p>
        </div>
        {sim && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" style={{ fontSize: 12 }}>Compare Scenarios</button>
            <button className="btn-ghost" style={{ fontSize: 12 }}>Export Report</button>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "290px 1fr", gap: 14, alignItems: "start" }}>
        {/* Config panel */}
        <div className="glass-strong" style={{ borderRadius: 8, padding: 20, position: "sticky", top: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div className="section-label">Scenario Parameters</div>
            <button onClick={() => { setParams(defaults); setResult(null); }} style={{ fontSize: 10, color: "#475569", background: "none", border: "none", cursor: "pointer" }}>Reset</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SliderParam label="Temperature" value={params.temperature} min={-50} max={-5} unit="°C"
              baseline={defaults.temperature}
              onChange={v => setParams(p => ({ ...p, temperature: v }))}
              valueColor={params.temperature < -35 ? "#ef4444" : params.temperature < -30 ? "#f59e0b" : "#e2e8f0"}
            />
            <SliderParam label="Wind Speed" value={params.windSpeed} min={0} max={80} unit=" km/h"
              baseline={defaults.windSpeed}
              onChange={v => setParams(p => ({ ...p, windSpeed: v }))}
              valueColor={params.windSpeed > 50 ? "#ef4444" : params.windSpeed > 30 ? "#f59e0b" : "#e2e8f0"}
            />
            <SliderParam label="Crew Size" value={params.crew} min={10} max={60} unit="" baseline={defaults.crew}
              onChange={v => setParams(p => ({ ...p, crew: v }))}
            />
            <SliderParam label="Battery Level" value={params.batteryLevel} min={10} max={100} unit="%"
              baseline={defaults.batteryLevel}
              onChange={v => setParams(p => ({ ...p, batteryLevel: v }))}
              valueColor={params.batteryLevel < 30 ? "#ef4444" : params.batteryLevel < 60 ? "#f59e0b" : "#10b981"}
            />
            <SliderParam label="Fuel Level" value={params.fuelLevel} min={500} max={10000} unit=" L"
              baseline={defaults.fuelLevel}
              onChange={v => setParams(p => ({ ...p, fuelLevel: v }))}
              valueColor={params.fuelLevel < 2000 ? "#ef4444" : params.fuelLevel < 4000 ? "#f59e0b" : "#e2e8f0"}
            />
            <SliderParam label="Duration" value={params.duration} min={12} max={168} unit="h"
              baseline={defaults.duration}
              onChange={v => setParams(p => ({ ...p, duration: v }))}
            />
            <SliderParam label="Energy Demand" value={params.energyDemand} min={60} max={150} unit="%"
              baseline={defaults.energyDemand}
              onChange={v => setParams(p => ({ ...p, energyDemand: v }))}
              valueColor={params.energyDemand > 120 ? "#f59e0b" : "#e2e8f0"}
            />

            {/* Gen G-02 toggle */}
            <div>
              <div className="section-label" style={{ marginBottom: 7 }}>Generator G-02</div>
              <div style={{ display: "flex", gap: 6 }}>
                {(["ONLINE", "FAILURE"] as const).map(s => (
                  <button key={s} onClick={() => setParams(p => ({ ...p, gen2Status: s }))}
                    style={{
                      flex: 1, padding: "8px 6px", borderRadius: 5, fontSize: 11,
                      fontFamily: "JetBrains Mono", fontWeight: 700, letterSpacing: "0.06em",
                      cursor: "pointer", transition: "all 0.15s",
                      background: params.gen2Status === s ? (s === "ONLINE" ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)") : "transparent",
                      border: params.gen2Status === s ? `1px solid ${s === "ONLINE" ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}` : "1px solid rgba(148,163,184,0.12)",
                      color: params.gen2Status === s ? (s === "ONLINE" ? "#10b981" : "#ef4444") : "#475569",
                    }}
                  >{s}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Run button */}
          <button className="btn-primary" style={{ width: "100%", marginTop: 20, padding: "13px", fontSize: 14, letterSpacing: "0.1em", position: "relative", overflow: "hidden" }}
            onClick={handleRun} disabled={running}>
            {running ? (
              <div>
                <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, background: "rgba(7,13,26,0.4)", transition: "width 0.15s ease", width: `${progress}%` }}/>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ width: 11, height: 11, border: "2px solid rgba(7,13,26,0.3)", borderTopColor: "#070d1a", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }}/>
                  COMPUTING {Math.round(progress)}%
                </span>
              </div>
            ) : "RUN SIMULATION"}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* State comparison */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <StateCard label="CURRENT STATE" color="#00c8e8" energy={185} fuel={defaults.fuelLevel} battery={defaults.batteryLevel} risk="LOW" dimmed={!!sim}/>
            <StateCard
              label="SIMULATED STATE" color={sim?.riskColor ?? "#475569"}
              energy={sim?.energy ?? null} fuel={sim?.fuelRemaining ?? null}
              battery={sim?.battery ?? null} risk={sim?.risk ?? null}
              highlight dimmed={false}
            />
          </div>

          {/* Cascade flow — always visible, activated when run */}
          <div className="glass" style={{ borderRadius: 8, padding: 20 }}>
            <div className="section-label" style={{ marginBottom: 14 }}>Cascading Impact Analysis</div>
            <CascadeFlow params={params} sim={sim} tempDelta={tempDelta} genFailed={genFailed}/>
          </div>

          {/* Timeline charts */}
          {sim && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="chart-container">
                <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>Energy Load — {params.duration}h Projection</div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={sim.timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,232,0.05)"/>
                    <XAxis dataKey="h" tick={{ fontSize: 8, fill: "#475569", fontFamily: "JetBrains Mono" }}/>
                    <YAxis tick={{ fontSize: 8, fill: "#475569", fontFamily: "JetBrains Mono" }} width={28}/>
                    <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 10 }}/>
                    <ReferenceLine y={225} stroke="rgba(239,68,68,0.4)" strokeDasharray="3 2" label={{ value: "CAPACITY", fill: "#ef4444", fontSize: 7, fontFamily: "JetBrains Mono" }}/>
                    <Line type="monotone" dataKey="baseline_energy" stroke="rgba(0,200,232,0.35)" strokeWidth={1} dot={false} name="Baseline" strokeDasharray="3 2"/>
                    <Line type="monotone" dataKey="energy" stroke={sim.riskColor} strokeWidth={2} dot={false} name="Simulated"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-container">
                <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>Fuel Level — {params.duration}h Projection</div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={sim.timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,232,0.05)"/>
                    <XAxis dataKey="h" tick={{ fontSize: 8, fill: "#475569", fontFamily: "JetBrains Mono" }}/>
                    <YAxis tick={{ fontSize: 8, fill: "#475569", fontFamily: "JetBrains Mono" }} width={32}/>
                    <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid rgba(0,200,232,0.2)", borderRadius: 4, fontSize: 10 }}/>
                    <ReferenceLine y={1000} stroke="rgba(239,68,68,0.4)" strokeDasharray="3 2" label={{ value: "RESERVE", fill: "#ef4444", fontSize: 7, fontFamily: "JetBrains Mono" }}/>
                    <Line type="monotone" dataKey="baseline_fuel" stroke="rgba(0,200,232,0.35)" strokeWidth={1} dot={false} name="Baseline" strokeDasharray="3 2"/>
                    <Line type="monotone" dataKey="fuel" stroke={sim.riskColor} strokeWidth={2} dot={false} name="Simulated"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* AI recommendation */}
          {sim && (
            <div style={{ borderRadius: 8, padding: 20, background: "rgba(0,200,232,0.04)", border: "1px solid rgba(0,200,232,0.2)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #00c8e8, transparent)" }}/>
              <div className="font-mono" style={{ fontSize: 9, color: "#00c8e8", letterSpacing: "0.15em", marginBottom: 10 }}>AI RECOMMENDATION</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {getRecommendations(params, sim).map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 10 }}>
                    <span style={{ color: "#00c8e8", fontWeight: 700, flexShrink: 0, fontFamily: "Rajdhani" }}>{i + 1}.</span>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>{r}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-primary" style={{ fontSize: 12, padding: "8px 16px" }}>Apply Scenario</button>
                <button className="btn-secondary" style={{ fontSize: 12, padding: "8px 16px" }}>Compare Scenarios</button>
                <button className="btn-ghost" style={{ fontSize: 12, padding: "8px 16px" }}>Export Report</button>
              </div>
            </div>
          )}

          {!sim && !running && (
            <div className="glass" style={{ borderRadius: 8, padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(0,200,232,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, color: "#2d3d50" }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="9" stroke="#00c8e8" strokeWidth="1" opacity="0.4"/>
                  <path d="M8 11h6M11 8l3 3-3 3" stroke="#00c8e8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
                </svg>
              </div>
              <div className="font-display" style={{ fontSize: 14, color: "#475569", letterSpacing: "0.06em" }}>SIMULATION READY</div>
              <p style={{ fontSize: 11, color: "#2d3d50", marginTop: 6 }}>Adjust parameters in the configuration panel and press Run Simulation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StateCard({ label, color, energy, fuel, battery, risk, dimmed, highlight }: {
  label: string; color: string; energy: number | null; fuel: number | null;
  battery: number | null; risk: string | null; dimmed?: boolean; highlight?: boolean;
}) {
  const riskColor = risk ? riskColors[risk as keyof typeof riskColors] ?? "#475569" : "#475569";
  return (
    <div style={{
      borderRadius: 8, padding: 18,
      background: highlight && energy ? `${color}06` : "rgba(13,27,46,0.6)",
      border: `1px solid ${highlight && energy ? `${color}25` : "rgba(148,163,184,0.08)"}`,
      opacity: dimmed ? 0.75 : 1,
      position: "relative", overflow: "hidden",
      transition: "all 0.4s ease",
    }}>
      {highlight && energy && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}/>}
      <div className="font-mono" style={{ fontSize: 9, color: highlight && energy ? color : "#475569", letterSpacing: "0.12em", marginBottom: 12 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { label: "Energy Load", value: energy !== null ? `${energy} kW` : "—", warn: energy !== null && energy > 210 },
          { label: "Fuel Level", value: fuel !== null ? `${fuel.toLocaleString()} L` : "—", warn: fuel !== null && fuel < 3000 },
          { label: "Battery SOC", value: battery !== null ? `${battery}%` : "—", warn: battery !== null && battery < 60 },
          { label: "Overall Risk", value: risk ?? "—", color: risk ? riskColor : "#475569", isRisk: true },
        ].map(row => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>{row.label}</span>
            <span className="font-display" style={{
              fontSize: 18, fontWeight: 700,
              color: row.isRisk ? (row.color ?? "#e2e8f0") : row.warn ? "#ef4444" : "#e2e8f0",
            }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CascadeFlow({ params, sim, tempDelta, genFailed }: { params: Params; sim: ReturnType<typeof simulate> | null; tempDelta: number; genFailed: boolean }) {
  type NodeState = { label: string; value: string; color: string; active: boolean };
  const nodes: NodeState[] = [
    {
      label: "Temperature Change",
      value: tempDelta < 0 ? `${params.temperature}°C (${tempDelta}°C ↓)` : `${params.temperature}°C`,
      color: params.temperature < -35 ? "#ef4444" : params.temperature < -28 ? "#f59e0b" : "#10b981",
      active: tempDelta < -3,
    },
    {
      label: "Generator Status",
      value: genFailed ? "G-02: FAILURE" : "G-02: ONLINE",
      color: genFailed ? "#ef4444" : "#10b981",
      active: genFailed,
    },
    {
      label: "Heating Demand",
      value: sim ? `+${Math.round(sim.energyIncrease * 0.65)} kW` : "—",
      color: sim && sim.energyIncrease > 20 ? "#f59e0b" : "#10b981",
      active: !!sim,
    },
    {
      label: "Total Energy Load",
      value: sim ? `${sim.energy} kW` : "—",
      color: sim && sim.energy > 210 ? "#ef4444" : sim && sim.energy > 195 ? "#f59e0b" : "#10b981",
      active: !!sim,
    },
    {
      label: "Fuel Consumption Rate",
      value: sim ? `${Math.round(sim.totalDailyRate)} L/day` : "—",
      color: sim && sim.totalDailyRate > 260 ? "#ef4444" : sim && sim.totalDailyRate > 220 ? "#f59e0b" : "#10b981",
      active: !!sim,
    },
    {
      label: "Resupply Risk",
      value: sim ? sim.risk : "—",
      color: sim ? sim.riskColor : "#475569",
      active: !!sim,
    },
  ];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      {nodes.map((node, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            padding: "8px 14px",
            borderRadius: 6,
            background: node.active ? `${node.color}10` : "rgba(148,163,184,0.03)",
            border: `1px solid ${node.active ? `${node.color}30` : "rgba(148,163,184,0.1)"}`,
            minWidth: 120,
            transition: "all 0.4s ease",
          }}>
            <div style={{ fontSize: 9, color: node.active ? node.color : "#2d3d50", fontFamily: "JetBrains Mono", letterSpacing: "0.06em", marginBottom: 2, textTransform: "uppercase" }}>{node.label}</div>
            <div className="font-mono" style={{ fontSize: 12, fontWeight: 700, color: node.active ? node.color : "#1e2d3d" }}>{node.value}</div>
          </div>
          {i < nodes.length - 1 && (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity: node.active ? 0.8 : 0.2, transition: "opacity 0.4s" }}>
              <path d="M5 10h10M12 7l3 3-3 3" stroke={node.active ? node.color : "#475569"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

function SliderParam({ label, value, min, max, unit, baseline, onChange, valueColor = "#e2e8f0" }: {
  label: string; value: number; min: number; max: number; unit: string;
  baseline: number; onChange: (v: number) => void; valueColor?: string;
}) {
  const changed = value !== baseline;
  const delta = value - baseline;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span className="section-label">{label}</span>
          {changed && (
            <span className="font-mono" style={{ fontSize: 8, color: delta < 0 ? "#00c8e8" : "#f59e0b", background: delta < 0 ? "rgba(0,200,232,0.1)" : "rgba(245,158,11,0.1)", padding: "1px 4px", borderRadius: 2 }}>
              {delta > 0 ? "+" : ""}{delta}{unit}
            </span>
          )}
        </div>
        <span className="font-mono" style={{ fontSize: 11, fontWeight: 600, color: valueColor }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#00c8e8", cursor: "pointer", height: 2 }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 1 }}>
        <span className="font-mono" style={{ fontSize: 7, color: "#2d3d50" }}>{min}{unit}</span>
        <span className="font-mono" style={{ fontSize: 7, color: "#2d3d50" }}>BASE: {baseline}{unit}</span>
        <span className="font-mono" style={{ fontSize: 7, color: "#2d3d50" }}>{max}{unit}</span>
      </div>
    </div>
  );
}

function getRecommendations(p: Params, sim: ReturnType<typeof simulate>): string[] {
  const recs: string[] = [];
  if (p.gen2Status === "FAILURE") recs.push("Transfer all load to Generator G-01 immediately. Implement 20% non-critical load shedding to maintain capacity within rated limits.");
  if (p.temperature < -30) recs.push(`Pre-warm heating systems 6 hours before temperature drop. Increase emergency fuel reserve by ${Math.abs(p.temperature + 25) * 2}% to buffer extreme demand.`);
  if (sim.fuelRemaining < 3000) recs.push("Initiate emergency resupply request now. Current fuel trajectory insufficient. Reduce consumption by 15% through non-critical system hibernation.");
  if (sim.battery < 55) recs.push("Charge battery bank to maximum capacity before simulated conditions begin. Provides 4–6 hour emergency buffer if generation fails.");
  recs.push(`Reduce non-critical loads (recreation, non-priority lab equipment) by 8% to extend fuel margin from ${sim.fuelRemaining.toLocaleString()} L by an estimated 400–600 L.`);
  return recs.slice(0, 4);
}
