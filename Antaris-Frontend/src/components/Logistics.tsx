import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useEffect, useMemo, useState } from "react";

type Station = "MAITRI" | "BHARATI";

interface FuelReading {
  id: number;
  stationId: number;
  stationCode: string;
  fuelLevel: number;
  fuelCapacity: number;
  fuelPercentage: number;
  consumptionRate: number;
  estimatedRuntimeHours: number;
  dailyConsumption: number;
  lastRefill: string;
  timestamp: string;
}

interface InventoryItem {
  id: number;
  stationId: number;
  stationCode: string;
  itemCode: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  minimumRequired: number;
  status: string;
}

interface LogisticsProps {
  station: Station;
}

const statusColors: Record<string, string> = {
  AVAILABLE: "#10b981",
  LOW: "#f59e0b",
  CRITICAL: "#ef4444",
};

function stationIdFor(station: Station) {
  return station === "MAITRI" ? 1 : 2;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Logistics({ station }: LogisticsProps) {
  const stationId = stationIdFor(station);

  const [fuelCurrent, setFuelCurrent] = useState<FuelReading | null>(null);
  const [fuelHistory, setFuelHistory] = useState<FuelReading[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadLogistics = async () => {
    try {
      setError(null);

      const [fuelCurrentResponse, fuelHistoryResponse, inventoryResponse] =
        await Promise.all([
          fetch(`/api/fuel/${stationId}/current`),
          fetch(`/api/fuel/${stationId}/history`),
          fetch(`/api/inventory/${stationId}`),
        ]);

      if (
        !fuelCurrentResponse.ok ||
        !fuelHistoryResponse.ok ||
        !inventoryResponse.ok
      ) {
        throw new Error("Failed to load logistics telemetry");
      }

      const currentData: FuelReading = await fuelCurrentResponse.json();
      const historyData: FuelReading[] = await fuelHistoryResponse.json();
      const inventoryData: InventoryItem[] = await inventoryResponse.json();

      setFuelCurrent(currentData);
      setFuelHistory(Array.isArray(historyData) ? historyData : []);
      setInventory(Array.isArray(inventoryData) ? inventoryData : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Logistics API error:", err);
      setError("Unable to connect to logistics telemetry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogistics();

    const interval = window.setInterval(loadLogistics, 15000);

    return () => window.clearInterval(interval);
  }, [stationId]);

  const chartData = useMemo(() => {
    return [...fuelHistory]
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() -
          new Date(b.timestamp).getTime(),
      )
      .map((reading) => ({
        time: new Date(reading.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fuel: reading.fuelLevel,
        consumption: reading.consumptionRate,
      }));
  }, [fuelHistory]);

  const consumptionTrend = useMemo(() => {
    if (fuelHistory.length < 2) return 0;

    const sorted = [...fuelHistory].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime(),
    );

    const first = sorted[0].consumptionRate;
    const latest = sorted[sorted.length - 1].consumptionRate;

    if (!first) return 0;

    return ((latest - first) / first) * 100;
  }, [fuelHistory]);

  const lowInventoryCount = inventory.filter(
    (item) => item.status === "LOW",
  ).length;

  const criticalInventoryCount = inventory.filter(
    (item) => item.status === "CRITICAL",
  ).length;

  const fuelRisk =
    fuelCurrent && fuelCurrent.fuelPercentage < 30
      ? "HIGH"
      : fuelCurrent && fuelCurrent.fuelPercentage < 50
        ? "MEDIUM"
        : "NORMAL";

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
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
          <h1
            className="font-display"
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#e2e8f0",
            }}
          >
            LOGISTICS & RESOURCE COMMAND
          </h1>

          <p style={{ fontSize: 13, color: "#64748b" }}>
            {station} · Fuel, inventory, and resource monitoring
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            className="font-mono"
            style={{
              fontSize: 9,
              color: error ? "#ef4444" : "#10b981",
              letterSpacing: "0.08em",
            }}
          >
            ● {error ? "BACKEND OFFLINE" : "LIVE BACKEND TELEMETRY"}
          </div>

          <button className="btn-primary" style={{ fontSize: 12 }}>
            Request Resupply
          </button>
        </div>
      </div>

      {loading && !fuelCurrent ? (
        <div
          className="glass"
          style={{
            padding: 30,
            borderRadius: 8,
            textAlign: "center",
            color: "#64748b",
          }}
        >
          Loading logistics telemetry...
        </div>
      ) : (
        <>
          {/* Main fuel section */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "240px 1fr",
              gap: 16,
            }}
          >
            {/* Fuel tank */}
            <div
              className="glass"
              style={{
                borderRadius: 8,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                className="section-label"
                style={{ marginBottom: 16 }}
              >
                PRIMARY FUEL STORAGE
              </div>

              <FuelTank
                level={fuelCurrent?.fuelPercentage ?? 0}
              />

              <div
                className="font-display"
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color:
                    fuelRisk === "HIGH"
                      ? "#ef4444"
                      : fuelRisk === "MEDIUM"
                        ? "#f59e0b"
                        : "#10b981",
                  marginTop: 12,
                }}
              >
                {formatNumber(fuelCurrent?.fuelLevel ?? 0)} L
              </div>

              <div
                className="font-mono"
                style={{
                  fontSize: 12,
                  color: "#475569",
                }}
              >
                {fuelCurrent?.fuelPercentage?.toFixed(1) ?? "0.0"}%
                CAPACITY
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  width: "100%",
                }}
              >
                <InfoRow
                  label="Storage Capacity"
                  value={`${formatNumber(
                    fuelCurrent?.fuelCapacity ?? 0,
                  )} L`}
                />

                <InfoRow
                  label="Consumption Rate"
                  value={`${formatNumber(
                    fuelCurrent?.consumptionRate ?? 0,
                  )} L/h`}
                />

                <InfoRow
                  label="Daily Consumption"
                  value={`${formatNumber(
                    fuelCurrent?.dailyConsumption ?? 0,
                  )} L/day`}
                />

                <InfoRow
                  label="Estimated Runtime"
                  value={`${formatNumber(
                    fuelCurrent?.estimatedRuntimeHours ?? 0,
                  )} h`}
                />

                <InfoRow
                  label="Last Refill"
                  value={formatDate(fuelCurrent?.lastRefill)}
                />

                <InfoRow
                  label="Telemetry"
                  value={formatDate(fuelCurrent?.timestamp)}
                />
              </div>

              <div
                style={{
                  marginTop: 12,
                  padding: "8px 12px",
                  background:
                    fuelRisk === "HIGH"
                      ? "rgba(239,68,68,0.08)"
                      : fuelRisk === "MEDIUM"
                        ? "rgba(245,158,11,0.08)"
                        : "rgba(16,185,129,0.08)",
                  border:
                    fuelRisk === "HIGH"
                      ? "1px solid rgba(239,68,68,0.2)"
                      : fuelRisk === "MEDIUM"
                        ? "1px solid rgba(245,158,11,0.2)"
                        : "1px solid rgba(16,185,129,0.2)",
                  borderRadius: 5,
                  width: "100%",
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 9,
                    color:
                      fuelRisk === "HIGH"
                        ? "#ef4444"
                        : fuelRisk === "MEDIUM"
                          ? "#f59e0b"
                          : "#10b981",
                    letterSpacing: "0.1em",
                    marginBottom: 4,
                  }}
                >
                  FUEL STATUS: {fuelRisk}
                </div>

                <p
                  style={{
                    fontSize: 10,
                    color: "#94a3b8",
                    margin: 0,
                  }}
                >
                  Current fuel level and runtime are sourced directly
                  from the ANTARIS backend.
                </p>
              </div>
            </div>

            {/* Fuel history */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div className="chart-container">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#94a3b8",
                      }}
                    >
                      Fuel Level History
                    </div>

                    <div
                      className="section-label"
                      style={{ marginTop: 2 }}
                    >
                      Historical fuel telemetry from {station}
                    </div>
                  </div>

                  <div
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      color:
                        consumptionTrend > 0
                          ? "#f59e0b"
                          : "#10b981",
                    }}
                  >
                    Consumption trend{" "}
                    {consumptionTrend >= 0 ? "+" : ""}
                    {consumptionTrend.toFixed(1)}%
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="fuelGradLive"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f59e0b"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f59e0b"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey="time"
                      tick={{
                        fontSize: 8,
                        fill: "#475569",
                        fontFamily: "JetBrains Mono",
                      }}
                    />

                    <YAxis
                      tick={{
                        fontSize: 8,
                        fill: "#475569",
                        fontFamily: "JetBrains Mono",
                      }}
                      width={48}
                    />

                    <Tooltip
                      contentStyle={{
                        background: "#0d1b2e",
                        border:
                          "1px solid rgba(0,200,232,0.2)",
                        borderRadius: 4,
                        fontSize: 11,
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="fuel"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="url(#fuelGradLive)"
                      dot={false}
                      name="Fuel Level (L)"
                    />
                  </AreaChart>
                </ResponsiveContainer>

                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    marginTop: 8,
                  }}
                >
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      color: "#f59e0b",
                    }}
                  >
                    ● Historical Fuel Level
                  </div>

                  <div
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      color: "#64748b",
                    }}
                  >
                    {fuelHistory.length} telemetry records
                  </div>
                </div>
              </div>

              {/* Operational summary */}
              <div
                style={{
                  padding: "12px 16px",
                  background: "rgba(0,200,232,0.05)",
                  border:
                    "1px solid rgba(0,200,232,0.15)",
                  borderRadius: 6,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 20,
                }}
              >
                <SummaryMetric
                  label="CURRENT FUEL"
                  value={`${formatNumber(
                    fuelCurrent?.fuelLevel ?? 0,
                  )} L`}
                />

                <SummaryMetric
                  label="RUNTIME REMAINING"
                  value={`${formatNumber(
                    fuelCurrent?.estimatedRuntimeHours ?? 0,
                  )} h`}
                />

                <SummaryMetric
                  label="DAILY CONSUMPTION"
                  value={`${formatNumber(
                    fuelCurrent?.dailyConsumption ?? 0,
                  )} L`}
                />
              </div>
            </div>
          </div>

          {/* Inventory overview */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            <SummaryCard
              label="TOTAL INVENTORY ITEMS"
              value={String(inventory.length)}
              detail="Tracked resources"
            />

            <SummaryCard
              label="LOW STOCK"
              value={String(lowInventoryCount)}
              detail="Below minimum required"
              valueColor="#f59e0b"
            />

            <SummaryCard
              label="CRITICAL STOCK"
              value={String(criticalInventoryCount)}
              detail="Immediate attention required"
              valueColor={
                criticalInventoryCount > 0
                  ? "#ef4444"
                  : "#10b981"
              }
            />
          </div>

          {/* Inventory table */}
          <div
            className="glass"
            style={{
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom:
                  "1px solid rgba(0,200,232,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div className="section-label">
                  INVENTORY STATUS
                </div>

                <div
                  className="font-mono"
                  style={{
                    fontSize: 9,
                    color: "#475569",
                    marginTop: 3,
                  }}
                >
                  {station} RESOURCE INVENTORY
                </div>
              </div>

              <div
                className="font-mono"
                style={{
                  fontSize: 9,
                  color: "#10b981",
                }}
              >
                ● LIVE BACKEND
              </div>
            </div>

            <table
              className="data-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>
                    Item
                  </th>

                  <th style={{ textAlign: "left" }}>
                    Category
                  </th>

                  <th style={{ textAlign: "right" }}>
                    Current Stock
                  </th>

                  <th style={{ textAlign: "right" }}>
                    Minimum Required
                  </th>

                  <th style={{ textAlign: "center" }}>
                    Level
                  </th>

                  <th style={{ textAlign: "center" }}>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {inventory.map((item) => {
                  const color =
                    statusColors[item.status] ??
                    "#64748b";

                  const relativeLevel =
                    item.minimumRequired > 0
                      ? Math.min(
                          100,
                          (item.quantity /
                            item.minimumRequired) *
                            100,
                        )
                      : 100;

                  return (
                    <tr key={item.id}>
                      <td
                        style={{
                          color: "#e2e8f0",
                          fontWeight: 500,
                        }}
                      >
                        {item.itemName}

                        <div
                          className="font-mono"
                          style={{
                            fontSize: 8,
                            color: "#475569",
                            marginTop: 2,
                          }}
                        >
                          {item.itemCode}
                        </div>
                      </td>

                      <td>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: 9,
                            color: "#64748b",
                          }}
                        >
                          {item.category}
                        </span>
                      </td>

                      <td
                        style={{
                          textAlign: "right",
                        }}
                        className="font-mono"
                      >
                        {formatNumber(item.quantity)}{" "}
                        {item.unit}
                      </td>

                      <td
                        style={{
                          textAlign: "right",
                        }}
                        className="font-mono"
                      >
                        {formatNumber(
                          item.minimumRequired,
                        )}{" "}
                        {item.unit}
                      </td>

                      <td
                        style={{
                          padding: "10px 12px",
                        }}
                      >
                        <div
                          style={{
                            height: 4,
                            background:
                              "rgba(148,163,184,0.1)",
                            borderRadius: 2,
                            width: 100,
                            margin: "0 auto",
                          }}
                        >
                          <div
                            style={{
                              width: `${relativeLevel}%`,
                              height: "100%",
                              background: color,
                              borderRadius: 2,
                              opacity: 0.8,
                            }}
                          />
                        </div>

                        <div
                          className="font-mono"
                          style={{
                            fontSize: 8,
                            color,
                            textAlign: "center",
                            marginTop: 4,
                          }}
                        >
                          {relativeLevel.toFixed(0)}%
                          vs minimum
                        </div>
                      </td>

                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            padding: "2px 8px",
                            background: `${color}12`,
                            border: `1px solid ${color}30`,
                            borderRadius: 3,
                            fontSize: 9,
                            fontFamily:
                              "JetBrains Mono",
                            color,
                            letterSpacing:
                              "0.1em",
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Backend source */}
          <div
            className="font-mono"
            style={{
              fontSize: 9,
              color: "#475569",
              textAlign: "right",
            }}
          >
            LAST FRONTEND SYNC:{" "}
            {lastUpdated
              ? lastUpdated.toLocaleTimeString()
              : "—"}{" "}
            · REFRESH 15s · API: /api/fuel + /api/inventory
          </div>
        </>
      )}
    </div>
  );
}

function FuelTank({ level }: { level: number }) {
  const height = 140;
  const safeLevel = Math.max(
    0,
    Math.min(100, level),
  );
  const fillHeight =
    (safeLevel / 100) * height;

  const fillColor =
    safeLevel < 30
      ? "#ef4444"
      : safeLevel < 60
        ? "#f59e0b"
        : "#10b981";

  return (
    <div
      style={{
        position: "relative",
        width: 80,
      }}
    >
      <svg
        width="80"
        height={height + 20}
        viewBox={`0 0 80 ${height + 20}`}
      >
        <rect
          x="10"
          y="8"
          width="60"
          height={height}
          rx="4"
          fill="rgba(7,13,26,0.8)"
          stroke="rgba(0,200,232,0.2)"
          strokeWidth="1.5"
        />

        <rect
          x="12"
          y={8 + height - fillHeight}
          width="56"
          height={Math.max(0, fillHeight - 2)}
          rx="2"
          fill={fillColor}
          opacity="0.7"
        />

        <path
          d={`M 12 ${
            8 + height - fillHeight
          } Q 22 ${
            8 + height - fillHeight - 4
          } 40 ${
            8 + height - fillHeight
          } Q 58 ${
            8 + height - fillHeight + 4
          } 68 ${
            8 + height - fillHeight
          } V ${
            8 + height - fillHeight
          } Z`}
          fill={fillColor}
          opacity="0.5"
        />

        {[25, 50, 75].map((mark) => {
          const y =
            8 +
            height -
            (mark / 100) * height;

          return (
            <g key={mark}>
              <line
                x1="10"
                y1={y}
                x2="18"
                y2={y}
                stroke="rgba(148,163,184,0.3)"
                strokeWidth="1"
              />

              <text
                x="4"
                y={y + 3}
                fill="#475569"
                fontSize="7"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
              >
                {mark}
              </text>
            </g>
          );
        })}

        <rect
          x="28"
          y="3"
          width="24"
          height="8"
          rx="2"
          fill="rgba(0,200,232,0.1)"
          stroke="rgba(0,200,232,0.2)"
          strokeWidth="1"
        />

        <text
          x="40"
          y={8 + height / 2 + 4}
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontFamily="Rajdhani"
          fontWeight="700"
        >
          {safeLevel.toFixed(1)}%
        </text>
      </svg>
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueColor = "#e2e8f0",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "4px 0",
        borderBottom:
          "1px solid rgba(148,163,184,0.06)",
      }}
    >
      <span className="section-label">
        {label}
      </span>

      <span
        className="font-mono"
        style={{
          fontSize: 10,
          color: valueColor,
          fontWeight: 600,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        className="font-mono"
        style={{
          fontSize: 9,
          color: "#00c8e8",
          letterSpacing: "0.1em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#e2e8f0",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  valueColor = "#e2e8f0",
}: {
  label: string;
  value: string;
  detail: string;
  valueColor?: string;
}) {
  return (
    <div
      className="glass"
      style={{
        borderRadius: 8,
        padding: 16,
      }}
    >
      <div
        className="font-mono"
        style={{
          fontSize: 9,
          color: "#64748b",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </div>

      <div
        className="font-display"
        style={{
          fontSize: 25,
          fontWeight: 700,
          color: valueColor,
          marginTop: 5,
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: 10,
          color: "#475569",
          marginTop: 2,
        }}
      >
        {detail}
      </div>
    </div>
  );
}