import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { LiveBadge } from "./Icons";

type DashboardData = {
  stationId: number;
  stationCode: string;
  stationName: string;
  stationLocation: string;
  stationStatus: string;

  environment: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    timestamp: string;
  };

  energy: {
    totalGeneration: number;
    totalConsumption: number;
    powerBalance: number;
    batteryPercentage: number;
    generatorLoad: number;
    timestamp: string;
  };

  fuel: {
    fuelLevel: number;
    fuelCapacity: number;
    fuelPercentage: number;
    consumptionRate: number;
    estimatedRuntimeHours: number;
    dailyConsumption: number;
    timestamp: string;
  };

  totalEquipment: number;
  operationalEquipment: number;
  warningEquipment: number;

  totalInventoryItems: number;
  lowInventoryItems: number;
  criticalInventoryItems: number;

  totalAlerts: number;
  activeAlerts: number;

  scheduledMaintenance: number;
  inProgressMaintenance: number;

  lastUpdated: string;
};

const stationMeta: Record<
  string,
  {
    lat: string;
    desc: string;
    riskLevel: string;
    riskColor: string;
  }
> = {
  MAITRI: {
    lat: "70°46′S, 11°44′E",
    desc: "Queen Maud Land, Antarctica",
    riskLevel: "MEDIUM",
    riskColor: "#f59e0b",
  },

  BHARATI: {
    lat: "69°24′S, 76°11′E",
    desc: "Larsemann Hills, Antarctica",
    riskLevel: "LOW",
    riskColor: "#10b981",
  },
};

const fallbackTempData = Array.from({ length: 24 }, (_, i) => ({
  t: `${String(i).padStart(2, "0")}:00`,
  v: -25 + Math.sin(i * 0.42) * 5.5 + (i < 6 || i > 20 ? -3 : 0),
}));

const fallbackEnergyData = Array.from({ length: 24 }, (_, i) => ({
  t: `${String(i).padStart(2, "0")}:00`,
  gen: 172 + Math.sin(i * 0.38) * 14,
  con: 168 + Math.sin(i * 0.44) * 12,
}));

const fallbackFuelData = [
  { d: "Sep 5", v: 7900 },
  { d: "Sep 6", v: 7740 },
  { d: "Sep 7", v: 7580 },
  { d: "Sep 8", v: 7420 },
  { d: "Sep 9", v: 7310 },
  { d: "Sep 10", v: 7240 },
  { d: "Sep 11", v: 7200 },
];

const cascadeSteps = [
  { icon: "🌡", label: "Temperature drops", arrow: true },
  { icon: "🔥", label: "Heating demand ↑", arrow: true },
  { icon: "⚡", label: "Energy demand ↑", arrow: true },
  { icon: "⚙", label: "Generator load ↑", arrow: true },
  { icon: "🛢", label: "Fuel consumption ↑", arrow: true },
  { icon: "⚠", label: "Depletion risk → Alert", arrow: false },
];

const phases = [
  {
    id: "monitor",
    label: "MONITOR",
    icon: "◉",
    color: "#00c8e8",
    desc: "Real-time telemetry · Station state · Live KPIs",
  },
  {
    id: "predict",
    label: "PREDICT",
    icon: "◈",
    color: "#a78bfa",
    desc: "Energy forecasting · Fuel depletion · Anomaly detection",
  },
  {
    id: "simulate",
    label: "SIMULATE",
    icon: "◍",
    color: "#f59e0b",
    desc: "What-if scenarios · Multi-system impact · Cascade analysis",
  },
  {
    id: "decide",
    label: "DECIDE",
    icon: "◆",
    color: "#10b981",
    desc: "Recommendations · Risk scoring · Automated reports",
  },
];

export default function Overview({ station }: { station: string }) {
  const [syncSecs, setSyncSecs] = useState(4);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const stationCode = station.toUpperCase();
  const meta = stationMeta[stationCode] ?? stationMeta.MAITRI;

  const stationId = stationCode === "BHARATI" ? 2 : 1;

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/dashboard/${stationId}`);

        if (!response.ok) {
          throw new Error(`Dashboard API returned ${response.status}`);
        }

        const data: DashboardData = await response.json();

        if (!cancelled) {
          setDashboard(data);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);

        if (!cancelled) {
          setError("LIVE DATA UNAVAILABLE");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    const refresh = setInterval(loadDashboard, 15000);

    return () => {
      cancelled = true;
      clearInterval(refresh);
    };
  }, [stationId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSyncSecs((seconds) => (seconds >= 60 ? 1 : seconds + 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (value: number, decimals = 1) =>
    Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "--";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const equipmentAvailability = dashboard
    ? Math.round(
        (dashboard.operationalEquipment /
          Math.max(dashboard.totalEquipment, 1)) *
          100,
      )
    : 0;

  const kpis = useMemo(() => {
    if (!dashboard) {
      return [
        {
          label: "Temperature",
          value: "--",
          sub: "Waiting for telemetry",
          color: "#00c8e8",
          icon: "🌡",
          sparkline: [-30, -28, -26, -25, -25, -25],
        },
        {
          label: "Energy Demand",
          value: "--",
          sub: "Waiting for telemetry",
          color: "#a78bfa",
          icon: "⚡",
          sparkline: [170, 175, 180, 178, 183, 185],
        },
        {
          label: "Fuel Level",
          value: "--",
          sub: "Waiting for telemetry",
          color: "#f59e0b",
          icon: "🛢",
          sparkline: [7900, 7740, 7580, 7420, 7310, 7200],
        },
        {
          label: "Battery SOC",
          value: "--",
          sub: "Waiting for telemetry",
          color: "#10b981",
          icon: "🔋",
          sparkline: [78, 79, 80, 81, 81, 82],
        },
        {
          label: "Active Alerts",
          value: "--",
          sub: "Waiting for telemetry",
          color: "#ef4444",
          icon: "⚠",
          sparkline: [1, 2, 2, 3, 3, 3],
        },
        {
          label: "Equip. Availability",
          value: "--",
          sub: "Waiting for telemetry",
          color: "#10b981",
          icon: "⚙",
          sparkline: [96, 95, 95, 94, 94, 94],
        },
      ];
    }

    return [
      {
        label: "Temperature",
        value: `${formatNumber(dashboard.environment.temperature)} °C`,
        sub: `Humidity ${formatNumber(dashboard.environment.humidity)}%`,
        color: "#00c8e8",
        icon: "🌡",
        sparkline: [
          dashboard.environment.temperature - 2,
          dashboard.environment.temperature - 1.2,
          dashboard.environment.temperature - 0.8,
          dashboard.environment.temperature - 0.4,
          dashboard.environment.temperature - 0.2,
          dashboard.environment.temperature,
        ],
      },
      {
        label: "Energy Demand",
        value: `${formatNumber(dashboard.energy.totalConsumption)} kW`,
        sub: `Generation ${formatNumber(dashboard.energy.totalGeneration)} kW`,
        color: "#a78bfa",
        icon: "⚡",
        sparkline: [
          dashboard.energy.totalConsumption - 20,
          dashboard.energy.totalConsumption - 12,
          dashboard.energy.totalConsumption - 7,
          dashboard.energy.totalConsumption - 4,
          dashboard.energy.totalConsumption - 2,
          dashboard.energy.totalConsumption,
        ],
      },
      {
        label: "Fuel Level",
        value: `${formatNumber(dashboard.fuel.fuelLevel, 0)} L`,
        sub: `${formatNumber(dashboard.fuel.fuelPercentage)}% · ${formatNumber(dashboard.fuel.consumptionRate, 0)} L/h`,
        color: "#f59e0b",
        icon: "🛢",
        sparkline: [
          dashboard.fuel.fuelLevel + 1200,
          dashboard.fuel.fuelLevel + 950,
          dashboard.fuel.fuelLevel + 700,
          dashboard.fuel.fuelLevel + 450,
          dashboard.fuel.fuelLevel + 200,
          dashboard.fuel.fuelLevel,
        ],
      },
      {
        label: "Battery SOC",
        value: `${formatNumber(dashboard.energy.batteryPercentage)}%`,
        sub: `Generator load ${formatNumber(dashboard.energy.generatorLoad)}%`,
        color: "#10b981",
        icon: "🔋",
        sparkline: [
          dashboard.energy.batteryPercentage - 5,
          dashboard.energy.batteryPercentage - 4,
          dashboard.energy.batteryPercentage - 2,
          dashboard.energy.batteryPercentage - 1,
          dashboard.energy.batteryPercentage,
          dashboard.energy.batteryPercentage,
        ],
      },
      {
        label: "Active Alerts",
        value: `${dashboard.activeAlerts}`,
        sub: `${dashboard.totalAlerts} total alerts`,
        color: "#ef4444",
        icon: "⚠",
        sparkline: [
          Math.max(0, dashboard.activeAlerts - 2),
          Math.max(0, dashboard.activeAlerts - 1),
          Math.max(0, dashboard.activeAlerts - 1),
          dashboard.activeAlerts,
          dashboard.activeAlerts,
          dashboard.activeAlerts,
        ],
      },
      {
        label: "Equip. Availability",
        value: `${equipmentAvailability}%`,
        sub: `${dashboard.operationalEquipment}/${dashboard.totalEquipment} operational`,
        color: "#10b981",
        icon: "⚙",
        sparkline: [
          Math.max(0, equipmentAvailability - 8),
          Math.max(0, equipmentAvailability - 6),
          Math.max(0, equipmentAvailability - 4),
          Math.max(0, equipmentAvailability - 2),
          equipmentAvailability,
          equipmentAvailability,
        ],
      },
    ];
  }, [dashboard]);

  const temperatureChartData = dashboard
    ? fallbackTempData.map((point, index) => ({
        ...point,
        v:
          dashboard.environment.temperature +
          Math.sin(index * 0.42) * 2.5,
      }))
    : fallbackTempData;

  const energyChartData = dashboard
    ? fallbackEnergyData.map((point, index) => ({
        ...point,
        gen:
          dashboard.energy.totalGeneration +
          Math.sin(index * 0.38) * 12,
        con:
          dashboard.energy.totalConsumption +
          Math.sin(index * 0.44) * 10,
      }))
    : fallbackEnergyData;

  const fuelChartData = dashboard
    ? fallbackFuelData.map((point, index) => ({
        ...point,
        v:
          dashboard.fuel.fuelLevel +
          (6 - index) * dashboard.fuel.dailyConsumption,
      }))
    : fallbackFuelData;

  const intelligenceItems = dashboard
    ? [
        {
          icon: dashboard.warningEquipment > 0 ? "⚠" : "✓",
          color: dashboard.warningEquipment > 0 ? "#f59e0b" : "#10b981",
          priority: dashboard.warningEquipment > 0 ? "WARNING" : "OK",
          text:
            dashboard.warningEquipment > 0
              ? `${dashboard.warningEquipment} equipment item(s) require attention`
              : "All monitored equipment is operating normally",
        },
        {
          icon: dashboard.activeAlerts > 0 ? "⚠" : "✓",
          color: dashboard.activeAlerts > 0 ? "#f59e0b" : "#10b981",
          priority: dashboard.activeAlerts > 0 ? "ALERT" : "OK",
          text:
            dashboard.activeAlerts > 0
              ? `${dashboard.activeAlerts} active alert(s) require monitoring`
              : "No active alerts reported",
        },
        {
          icon: dashboard.lowInventoryItems > 0 ? "⚠" : "✓",
          color: dashboard.lowInventoryItems > 0 ? "#f59e0b" : "#10b981",
          priority: dashboard.lowInventoryItems > 0 ? "WARNING" : "OK",
          text:
            dashboard.lowInventoryItems > 0
              ? `${dashboard.lowInventoryItems} inventory item(s) are below normal level`
              : "Inventory levels are currently normal",
        },
        {
          icon: "⚡",
          color: "#a78bfa",
          priority: "ENERGY",
          text: `Power balance ${dashboard.energy.powerBalance >= 0 ? "+" : ""}${formatNumber(dashboard.energy.powerBalance)} kW`,
        },
        {
          icon: "🛢",
          color: "#f59e0b",
          priority: "FUEL",
          text: `${formatNumber(dashboard.fuel.fuelPercentage)}% fuel remaining · ${formatNumber(dashboard.fuel.estimatedRuntimeHours, 0)} h estimated runtime`,
        },
        {
          icon: "✓",
          color: "#10b981",
          priority: "SYSTEM",
          text: `Station status ${dashboard.stationStatus}`,
        },
      ]
    : [];

  const riskDomains = dashboard
    ? [
        {
          label: "Energy",
          v: Math.min(
            100,
            Math.max(
              0,
              Math.round(dashboard.energy.generatorLoad),
            ),
          ),
          color: "#a78bfa",
        },
        {
          label: "Fuel",
          v: Math.min(
            100,
            Math.max(
              0,
              Math.round(100 - dashboard.fuel.fuelPercentage),
            ),
          ),
          color: "#f59e0b",
        },
        {
          label: "Equipment",
          v: Math.min(
            100,
            Math.max(0, 100 - equipmentAvailability),
          ),
          color: "#10b981",
        },
        {
          label: "Environment",
          v: Math.min(
            100,
            Math.max(
              0,
              Math.round(
                Math.abs(dashboard.environment.temperature) / 50 * 100,
              ),
            ),
          ),
          color: "#00c8e8",
        },
        {
          label: "Logistics",
          v: Math.min(
            100,
            Math.max(
              0,
              Math.round(
                (dashboard.lowInventoryItems /
                  Math.max(dashboard.totalInventoryItems, 1)) *
                  100,
              ),
            ),
          ),
          color: "#f97316",
        },
      ]
    : [];

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono'",
              color: "#475569",
              letterSpacing: "0.12em",
              marginBottom: 4,
            }}
          >
            SIH26060 · ANTARCTIC DIGITAL TWIN · NCPOR / MoES
          </div>

          <h1
            className="font-display"
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#e2e8f0",
              lineHeight: 1.2,
            }}
          >
            {stationCode} STATION — COMMAND OVERVIEW
          </h1>

          <p
            style={{
              fontSize: 12,
              color: "#64748b",
              marginTop: 3,
            }}
          >
            {meta.lat} · {meta.desc} · Remote Operations Centre, NCPOR
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <LiveBadge />

          <div
            className="font-mono"
            style={{
              fontSize: 10,
              color: "#2d3d50",
              padding: "4px 10px",
              border: "1px solid rgba(0,200,232,0.08)",
              borderRadius: 4,
            }}
          >
            SYNC: {syncSecs}s AGO
          </div>

          <div
            style={{
              padding: "4px 12px",
              border: `1px solid ${meta.riskColor}44`,
              borderRadius: 4,
              background: `${meta.riskColor}0f`,
            }}
          >
            <span
              className="font-mono"
              style={{
                fontSize: 10,
                color: meta.riskColor,
                letterSpacing: "0.1em",
              }}
            >
              ● RISK: {meta.riskLevel}
            </span>
          </div>

          <div
            style={{
              padding: "4px 12px",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 4,
              background: "rgba(16,185,129,0.06)",
            }}
          >
            <span
              className="font-mono"
              style={{
                fontSize: 10,
                color:
                  dashboard?.stationStatus === "OPERATIONAL"
                    ? "#10b981"
                    : "#f59e0b",
                letterSpacing: "0.1em",
              }}
            >
              ● {dashboard?.stationStatus ?? "CONNECTING"}
            </span>
          </div>
        </div>
      </div>

      {/* API connection status */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "7px 12px",
          borderRadius: 6,
          background: error
            ? "rgba(239,68,68,0.06)"
            : "rgba(16,185,129,0.05)",
          border: error
            ? "1px solid rgba(239,68,68,0.16)"
            : "1px solid rgba(16,185,129,0.12)",
        }}
      >
        <span
          className="font-mono"
          style={{
            fontSize: 9,
            color: error ? "#ef4444" : "#10b981",
            letterSpacing: "0.1em",
          }}
        >
          {loading
            ? "● CONNECTING TO ANTARIS BACKEND..."
            : error
              ? `● ${error}`
              : "● LIVE BACKEND TELEMETRY CONNECTED"}
        </span>

        {dashboard && (
          <span
            className="font-mono"
            style={{
              fontSize: 8,
              color: "#475569",
            }}
          >
            LAST UPDATE: {formatTimestamp(dashboard.lastUpdated)}
          </span>
        )}
      </div>

      {/* Phase strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
        }}
      >
        {phases.map((ph, i) => (
          <div
            key={ph.id}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: `${ph.color}0a`,
              border: `1px solid ${ph.color}25`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${ph.color}, transparent)`,
              }}
            />

            <span style={{ fontSize: 18, color: ph.color }}>
              {ph.icon}
            </span>

            <div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono'",
                  fontSize: 10,
                  color: ph.color,
                  letterSpacing: "0.12em",
                  fontWeight: 700,
                }}
              >
                {ph.label}
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: "#475569",
                  marginTop: 2,
                  lineHeight: 1.4,
                }}
              >
                {ph.desc}
              </div>
            </div>

            {i < 3 && (
              <span
                style={{
                  position: "absolute",
                  right: -6,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#334155",
                  fontSize: 16,
                  zIndex: 2,
                }}
              >
                ›
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Row 1 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: 12,
        }}
      >
        {/* Equipment availability */}
        <div
          className="kpi-card glow-cyan"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 16px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background:
                "linear-gradient(90deg, transparent, #00c8e8, transparent)",
            }}
          />

          <div
            className="section-label"
            style={{ marginBottom: 14 }}
          >
            Equipment Availability
          </div>

          <HealthRing value={equipmentAvailability} />

          <div
            className="font-display"
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: "#00c8e8",
              marginTop: 6,
              lineHeight: 1,
            }}
          >
            {dashboard ? `${equipmentAvailability}%` : "--"}
          </div>

          <div
            className="font-mono"
            style={{
              fontSize: 10,
              color: "#10b981",
              letterSpacing: "0.12em",
              marginTop: 4,
            }}
          >
            {dashboard
              ? `${dashboard.operationalEquipment}/${dashboard.totalEquipment} OPERATIONAL`
              : "LOADING"}
          </div>

          <div
            style={{
              marginTop: 12,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
          >
            {[
              {
                label: "Operational",
                v: dashboard
                  ? Math.round(
                      (dashboard.operationalEquipment /
                        Math.max(dashboard.totalEquipment, 1)) *
                        100,
                    )
                  : 0,
                c: "#10b981",
              },
              {
                label: "Warning",
                v: dashboard
                  ? Math.round(
                      (dashboard.warningEquipment /
                        Math.max(dashboard.totalEquipment, 1)) *
                        100,
                    )
                  : 0,
                c: "#f59e0b",
              },
              {
                label: "Critical Inventory",
                v: dashboard
                  ? Math.round(
                      (dashboard.criticalInventoryItems /
                        Math.max(dashboard.totalInventoryItems, 1)) *
                        100,
                    )
                  : 0,
                c: "#ef4444",
              },
            ].map((item) => (
              <div key={item.label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 2,
                  }}
                >
                  <span className="section-label">
                    {item.label}
                  </span>

                  <span
                    className="font-mono"
                    style={{
                      fontSize: 9,
                      color: item.c,
                    }}
                  >
                    {dashboard ? `${item.v}%` : "--"}
                  </span>
                </div>

                <div
                  style={{
                    height: 2,
                    background: "rgba(148,163,184,0.1)",
                    borderRadius: 1,
                  }}
                >
                  <div
                    style={{
                      width: `${item.v}%`,
                      height: "100%",
                      background: item.c,
                      borderRadius: 1,
                      opacity: 0.8,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KPI grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
          }}
        >
          {kpis.map((k) => (
            <div
              key={k.label}
              className="kpi-card"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 14 }}>{k.icon}</span>

                <div className="section-label">
                  {k.label}
                </div>
              </div>

              <div
                className="font-display"
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: k.color,
                  lineHeight: 1,
                }}
              >
                {k.value}
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: "#475569",
                  marginTop: 3,
                  marginBottom: 8,
                }}
              >
                {k.sub}
              </div>

              <svg
                width="100%"
                height="24"
                style={{ opacity: 0.6 }}
              >
                {k.sparkline.map((value, index) => {
                  if (index === 0) return null;

                  const minValue = Math.min(...k.sparkline);
                  const maxValue = Math.max(...k.sparkline);
                  const range = maxValue - minValue || 1;

                  const x1 =
                    ((index - 1) / (k.sparkline.length - 1)) *
                    100;

                  const x2 =
                    (index / (k.sparkline.length - 1)) * 100;

                  const y1 =
                    22 -
                    ((k.sparkline[index - 1] - minValue) /
                      range) *
                      20;

                  const y2 =
                    22 -
                    ((value - minValue) / range) * 20;

                  return (
                    <line
                      key={index}
                      x1={`${x1}%`}
                      y1={y1}
                      x2={`${x2}%`}
                      y2={y2}
                      stroke={k.color}
                      strokeWidth="1.4"
                    />
                  );
                })}
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr 260px",
          gap: 12,
        }}
      >
        {/* Cascade */}
        <div
          className="glass"
          style={{
            borderRadius: 8,
            padding: "14px 16px",
          }}
        >
          <div
            className="section-label"
            style={{ marginBottom: 12 }}
          >
            System Cascade
          </div>

          <div
            style={{
              fontSize: 9,
              fontFamily: "'JetBrains Mono'",
              color: "#475569",
              marginBottom: 10,
              letterSpacing: "0.1em",
            }}
          >
            INTERCONNECTED IMPACT
          </div>

          {cascadeSteps.map((step, i) => (
            <div key={i}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 6,
                  background:
                    i === 0
                      ? "rgba(0,200,232,0.08)"
                      : i === cascadeSteps.length - 1
                        ? "rgba(239,68,68,0.08)"
                        : "rgba(255,255,255,0.02)",
                  border: `1px solid ${
                    i === 0
                      ? "rgba(0,200,232,0.2)"
                      : i === cascadeSteps.length - 1
                        ? "rgba(239,68,68,0.2)"
                        : "rgba(255,255,255,0.04)"
                  }`,
                }}
              >
                <span style={{ fontSize: 12 }}>
                  {step.icon}
                </span>

                <span
                  style={{
                    fontSize: 10,
                    color:
                      i === 0
                        ? "#00c8e8"
                        : i === cascadeSteps.length - 1
                          ? "#ef4444"
                          : "#94a3b8",
                    lineHeight: 1.3,
                  }}
                >
                  {step.label}
                </span>
              </div>

              {step.arrow && (
                <div
                  style={{
                    textAlign: "center",
                    color: "#334155",
                    fontSize: 12,
                    lineHeight: "18px",
                  }}
                >
                  ↓
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Critical Intelligence */}
        <div
          className="glass overview-intelligence-card"
          style={{
            borderRadius: 8,
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom:
                "1px solid rgba(0,200,232,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div className="section-label">
                Critical Intelligence
              </div>

              <div
                style={{
                  fontFamily: "'JetBrains Mono'",
                  fontSize: 9,
                  color: "#475569",
                  letterSpacing: "0.1em",
                }}
              >
                LIVE ·{" "}
                {new Date().toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}{" "}
                UTC
              </div>
            </div>
          </div>

          <div style={{ padding: "10px 16px" }}>
            {loading ? (
              <div
                style={{
                  padding: "20px 0",
                  textAlign: "center",
                  fontSize: 10,
                  color: "#475569",
                  fontFamily: "'JetBrains Mono'",
                }}
              >
                LOADING LIVE TELEMETRY...
              </div>
            ) : (
              intelligenceItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    padding: "8px 0",
                    borderBottom:
                      i < intelligenceItems.length - 1
                        ? "1px solid rgba(148,163,184,0.05)"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      color: item.color,
                      fontSize: 12,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {item.icon}
                  </span>

                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono'",
                        fontSize: 8,
                        color: item.color,
                        letterSpacing: "0.1em",
                        marginRight: 6,
                      }}
                    >
                      {item.priority}
                    </span>

                    <span
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        lineHeight: 1.45,
                      }}
                    >
                      {item.text}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Insight + Risk */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              borderRadius: 8,
              padding: 14,
              background: "rgba(0,200,232,0.04)",
              border: "1px solid rgba(0,200,232,0.18)",
              position: "relative",
              overflow: "hidden",
              flex: 1,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background:
                  "linear-gradient(90deg, transparent, #00c8e8, transparent)",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  color: "#00c8e8",
                  fontSize: 14,
                }}
              >
                ✦
              </span>

              <span
                className="font-mono"
                style={{
                  fontSize: 9,
                  color: "#00c8e8",
                  letterSpacing: "0.12em",
                }}
              >
                LIVE STATION TELEMETRY
              </span>
            </div>

            {dashboard ? (
              <>
                <p
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {dashboard.stationName} is currently{" "}
                  <strong style={{ color: "#10b981" }}>
                    {dashboard.stationStatus}
                  </strong>
                  . Current power balance is{" "}
                  <strong style={{ color: "#a78bfa" }}>
                    {dashboard.energy.powerBalance >= 0
                      ? "+"
                      : ""}
                    {formatNumber(
                      dashboard.energy.powerBalance,
                    )}{" "}
                    kW
                  </strong>
                  , with fuel at{" "}
                  <strong style={{ color: "#f59e0b" }}>
                    {formatNumber(
                      dashboard.fuel.fuelPercentage,
                    )}
                    %
                  </strong>
                  .
                </p>

                <div
                  style={{
                    marginTop: 10,
                    padding: "6px 8px",
                    background:
                      "rgba(167,139,250,0.06)",
                    border:
                      "1px solid rgba(167,139,250,0.15)",
                    borderRadius: 6,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono'",
                      fontSize: 8,
                      color: "#a78bfa",
                      letterSpacing: "0.1em",
                      marginBottom: 2,
                    }}
                  >
                    ESTIMATED FUEL RUNTIME
                  </div>

                  <div
                    style={{
                      fontFamily: "'JetBrains Mono'",
                      fontSize: 16,
                      color: "#f59e0b",
                      fontWeight: 700,
                    }}
                  >
                    {formatNumber(
                      dashboard.fuel.estimatedRuntimeHours,
                      0,
                    )}{" "}
                    h
                  </div>

                  <div
                    style={{
                      fontSize: 9,
                      color: "#64748b",
                    }}
                  >
                    at current consumption rate
                  </div>
                </div>

                <div
                  className="font-mono"
                  style={{
                    fontSize: 8,
                    color: "#53697b",
                    marginTop: 10,
                  }}
                >
                  SPRING BOOT · POSTGRESQL · LIVE API
                </div>
              </>
            ) : (
              <p
                style={{
                  fontSize: 11,
                  color: "#64748b",
                }}
              >
                Waiting for live station telemetry...
              </p>
            )}
          </div>

          <div
            className="glass"
            style={{
              borderRadius: 8,
              padding: "12px 14px",
            }}
          >
            <div
              className="section-label"
              style={{ marginBottom: 10 }}
            >
              Risk Domains
            </div>

            {riskDomains.map((risk) => (
              <div
                key={risk.label}
                style={{ marginBottom: 6 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 3,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: "#64748b",
                    }}
                  >
                    {risk.label}
                  </span>

                  <span
                    className="font-mono"
                    style={{
                      fontSize: 9,
                      color: risk.color,
                    }}
                  >
                    {risk.v}%
                  </span>
                </div>

                <div
                  style={{
                    height: 3,
                    background:
                      "rgba(148,163,184,0.08)",
                    borderRadius: 2,
                  }}
                >
                  <div
                    style={{
                      width: `${risk.v}%`,
                      height: "100%",
                      background: risk.color,
                      borderRadius: 2,
                      boxShadow: `0 0 6px ${risk.color}55`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
        }}
      >
        <MiniChart
          title="Ambient Temperature (°C)"
          color="#00c8e8"
          valueLabel={
            dashboard
              ? `${formatNumber(
                  dashboard.environment.temperature,
                )}°C NOW`
              : "--"
          }
        >
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart
              data={temperatureChartData}
              margin={{
                top: 2,
                right: 0,
                bottom: 0,
                left: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="tg"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#00c8e8"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="#00c8e8"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="t"
                tick={{
                  fontSize: 7,
                  fill: "#475569",
                  fontFamily: "JetBrains Mono",
                }}
                interval={5}
              />

              <YAxis
                domain={[-50, 0]}
                tick={{
                  fontSize: 7,
                  fill: "#475569",
                  fontFamily: "JetBrains Mono",
                }}
                width={26}
              />

              <Tooltip
                contentStyle={{
                  background: "#0d1b2e",
                  border:
                    "1px solid rgba(0,200,232,0.2)",
                  borderRadius: 4,
                  fontSize: 10,
                }}
              />

              <Area
                type="monotone"
                dataKey="v"
                stroke="#00c8e8"
                strokeWidth={1.5}
                fill="url(#tg)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </MiniChart>

        <MiniChart
          title="Energy (kW) — Gen vs Consumption"
          color="#10b981"
          valueLabel={
            dashboard
              ? `${formatNumber(
                  dashboard.energy.totalConsumption,
                )} kW NOW`
              : "--"
          }
        >
          <ResponsiveContainer width="100%" height={80}>
            <LineChart
              data={energyChartData}
              margin={{
                top: 2,
                right: 0,
                bottom: 0,
                left: 0,
              }}
            >
              <XAxis
                dataKey="t"
                tick={{
                  fontSize: 7,
                  fill: "#475569",
                  fontFamily: "JetBrains Mono",
                }}
                interval={5}
              />

              <YAxis
                domain={["auto", "auto"]}
                tick={{
                  fontSize: 7,
                  fill: "#475569",
                  fontFamily: "JetBrains Mono",
                }}
                width={28}
              />

              <Tooltip
                contentStyle={{
                  background: "#0d1b2e",
                  border:
                    "1px solid rgba(0,200,232,0.2)",
                  borderRadius: 4,
                  fontSize: 10,
                }}
              />

              <Line
                type="monotone"
                dataKey="gen"
                stroke="#10b981"
                strokeWidth={1.5}
                dot={false}
                name="Generated"
              />

              <Line
                type="monotone"
                dataKey="con"
                stroke="#a78bfa"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="3 2"
                name="Consumed"
              />
            </LineChart>
          </ResponsiveContainer>
        </MiniChart>

        <MiniChart
          title="Fuel Inventory (L)"
          color="#f59e0b"
          valueLabel={
            dashboard
              ? `${formatNumber(
                  dashboard.fuel.fuelLevel,
                  0,
                )} L NOW`
              : "--"
          }
        >
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart
              data={fuelChartData}
              margin={{
                top: 2,
                right: 0,
                bottom: 0,
                left: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="fg"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#f59e0b"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="#f59e0b"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="d"
                tick={{
                  fontSize: 7,
                  fill: "#475569",
                  fontFamily: "JetBrains Mono",
                }}
              />

              <YAxis
                domain={["auto", "auto"]}
                tick={{
                  fontSize: 7,
                  fill: "#475569",
                  fontFamily: "JetBrains Mono",
                }}
                width={42}
              />

              <Tooltip
                contentStyle={{
                  background: "#0d1b2e",
                  border:
                    "1px solid rgba(0,200,232,0.2)",
                  borderRadius: 4,
                  fontSize: 10,
                }}
              />

              <Area
                type="monotone"
                dataKey="v"
                stroke="#f59e0b"
                strokeWidth={1.5}
                fill="url(#fg)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </MiniChart>
      </div>

      {/* Demo flow footer */}
      <div
        style={{
          borderRadius: 8,
          padding: "12px 16px",
          background: "rgba(167,139,250,0.04)",
          border: "1px solid rgba(167,139,250,0.12)",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono'",
            fontSize: 9,
            color: "#a78bfa",
            letterSpacing: "0.12em",
            whiteSpace: "nowrap",
          }}
        >
          ◈ DEMO FLOW
        </span>

        {[
          "1. Dashboard & telemetry",
          "→ 2. Digital Twin asset",
          "→ 3. Predictions",
          "→ 4. Simulate −35°C",
          "→ 5. Risk escalates",
          "→ 6. Decision engine",
          "→ 7. Scenario report",
        ].map((step, i) => (
          <span
            key={i}
            style={{
              fontSize: 10,
              color: i === 0 ? "#a78bfa" : "#475569",
              fontFamily:
                i === 0 ? "'JetBrains Mono'" : "inherit",
            }}
          >
            {step}
          </span>
        ))}

        <span
          style={{
            marginLeft: "auto",
            fontFamily: "'JetBrains Mono'",
            fontSize: 8,
            color: "#334155",
          }}
        >
          SIH26060 · NCPOR · MoES
        </span>
      </div>
    </div>
  );
}

function HealthRing({ value }: { value: number }) {
  const size = 90;
  const r = 35;
  const circ = 2 * Math.PI * r;
  const safeValue = Math.min(100, Math.max(0, value));
  const offset = circ * (1 - safeValue / 100);

  return (
    <svg
      width={size}
      height={size}
      style={{ display: "block" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(0,200,232,0.08)"
        strokeWidth="7"
      />

      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#00c8e8"
        strokeWidth="7"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          filter: "drop-shadow(0 0 6px #00c8e8)",
        }}
      />
    </svg>
  );
}

function MiniChart({
  title,
  color,
  valueLabel,
  children,
}: {
  title: string;
  color: string;
  valueLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="chart-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#94a3b8",
          }}
        >
          {title}
        </div>

        <div
          className="font-mono"
          style={{
            fontSize: 10,
            color,
            fontWeight: 600,
          }}
        >
          {valueLabel}
        </div>
      </div>

      {children}
    </div>
  );
}