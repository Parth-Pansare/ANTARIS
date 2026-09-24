import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

type Station = "MAITRI" | "BHARATI";

type EnergyReading = {
  id: number;
  stationId: number;
  stationCode: string;
  totalGeneration: number;
  totalConsumption: number;
  powerBalance: number;
  batteryPercentage: number;
  generatorLoad: number;
  timestamp: string;
};

type EnergyProps = {
  station: Station;
};

const stationIds: Record<Station, number> = {
  MAITRI: 1,
  BHARATI: 2,
};

function formatTime(timestamp?: string) {
  if (!timestamp) return "--:--";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDateTime(timestamp?: string) {
  if (!timestamp) return "No reading";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "No reading";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatNumber(value: number | undefined, decimals = 1) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "--";
  }

  return value.toFixed(decimals);
}

function getBalanceLabel(balance: number) {
  if (balance > 0) return "SURPLUS";
  if (balance < 0) return "DEFICIT";
  return "BALANCED";
}

function getBalanceColor(balance: number) {
  if (balance > 0) return "#10b981";
  if (balance < 0) return "#ef4444";
  return "#00c8e8";
}

function LegendDot({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
      <span
        style={{
          fontSize: 9,
          color: "#475569",
          fontFamily: "JetBrains Mono",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function LoadBar({
  value,
  color,
}: {
  value: number;
  color: string;
}) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div
      style={{
        height: 4,
        background: "rgba(148,163,184,0.1)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${safeValue}%`,
          height: "100%",
          background: color,
          borderRadius: 2,
          transition: "width 0.5s ease",
          opacity: 0.8,
        }}
      />
    </div>
  );
}

export default function Energy({ station }: EnergyProps) {
  const stationId = stationIds[station];

  const [current, setCurrent] = useState<EnergyReading | null>(null);
  const [history, setHistory] = useState<EnergyReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadEnergy = async () => {
      try {
        setError("");

        const [currentResponse, historyResponse] = await Promise.all([
          fetch(`/api/energy/${stationId}/current`),
          fetch(`/api/energy/${stationId}/history`),
        ]);

        if (!currentResponse.ok) {
          throw new Error(
            `Current energy API returned HTTP ${currentResponse.status}`,
          );
        }

        if (!historyResponse.ok) {
          throw new Error(
            `Energy history API returned HTTP ${historyResponse.status}`,
          );
        }

        const currentData: EnergyReading = await currentResponse.json();
        const historyData: EnergyReading[] = await historyResponse.json();

        if (cancelled) return;

        setCurrent(currentData);

        const sortedHistory = [...historyData].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() -
            new Date(b.timestamp).getTime(),
        );

        setHistory(sortedHistory);
      } catch (err) {
        if (cancelled) return;

        console.error("ANTARIS energy telemetry error:", err);

        setCurrent(null);
        setHistory([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load energy telemetry.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    loadEnergy();

    const interval = window.setInterval(loadEnergy, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [stationId]);

  const energyTimeline = useMemo(() => {
    return history.map((reading) => ({
      t: formatTime(reading.timestamp),
      gen: Number(reading.totalGeneration),
      con: Number(reading.totalConsumption),
      bat: Number(reading.batteryPercentage),
      load: Number(reading.generatorLoad),
      balance: Number(reading.powerBalance),
    }));
  }, [history]);

  const latest = current;

  const efficiency =
    latest && latest.totalGeneration > 0
      ? (latest.totalConsumption / latest.totalGeneration) * 100
      : 0;

  const balance = latest?.powerBalance ?? 0;
  const balanceColor = getBalanceColor(balance);

  const loadColor =
    (latest?.generatorLoad ?? 0) >= 85
      ? "#ef4444"
      : (latest?.generatorLoad ?? 0) >= 70
        ? "#f59e0b"
        : "#10b981";

  const batteryColor =
    (latest?.batteryPercentage ?? 0) <= 20
      ? "#ef4444"
      : (latest?.batteryPercentage ?? 0) <= 40
        ? "#f59e0b"
        : "#00c8e8";

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
            ENERGY COMMAND
          </h1>

          <p style={{ fontSize: 13, color: "#64748b" }}>
            {station} · Power generation, distribution, and consumption
            intelligence
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && !current && (
        <div
          className="glass"
          style={{
            padding: 16,
            borderRadius: 8,
            color: "#00c8e8",
            fontFamily: "JetBrains Mono",
            fontSize: 11,
          }}
        >
          CONNECTING TO BACKEND ENERGY TELEMETRY...
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 6,
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#fca5a5",
            fontSize: 11,
            fontFamily: "JetBrains Mono",
          }}
        >
          ENERGY TELEMETRY ERROR · {error}
        </div>
      )}

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 10,
        }}
      >
        {[
          {
            label: "Generation",
            value: latest
              ? `${formatNumber(latest.totalGeneration)} kW`
              : "--",
            color: "#10b981",
          },
          {
            label: "Consumption",
            value: latest
              ? `${formatNumber(latest.totalConsumption)} kW`
              : "--",
            color: "#00c8e8",
          },
          {
            label: "Battery SOC",
            value: latest
              ? `${formatNumber(latest.batteryPercentage)}%`
              : "--",
            color: batteryColor,
          },
          {
            label: "Power Balance",
            value: latest
              ? `${balance >= 0 ? "+" : ""}${formatNumber(balance)} kW`
              : "--",
            color: balanceColor,
          },
          {
            label: "Efficiency",
            value: latest ? `${formatNumber(efficiency)}%` : "--",
            color: "#10b981",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="section-label" style={{ marginBottom: 8 }}>
              {kpi.label}
            </div>

            <div
              className="font-display"
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: kpi.color,
              }}
            >
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Backend status */}
      <div
        style={{
          padding: "9px 12px",
          borderRadius: 6,
          background: "rgba(0,200,232,0.035)",
          border: "1px solid rgba(0,200,232,0.16)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            color: "#00d9a5",
            fontFamily: "JetBrains Mono",
            fontSize: 10,
            letterSpacing: "0.08em",
          }}
        >
          <span style={{ marginRight: 6 }}>●</span>
          LIVE BACKEND ENERGY TELEMETRY
        </div>

        <div
          style={{
            color: "#64748b",
            fontFamily: "JetBrains Mono",
            fontSize: 9,
          }}
        >
          LAST READING: {formatDateTime(latest?.timestamp)}
        </div>
      </div>

      {/* Charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {/* Generation vs Consumption */}
        <div className="chart-container">
          <div
            style={{
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
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
                Generation vs Consumption
              </div>

              <div
                className="section-label"
                style={{ marginTop: 2 }}
              >
                {station} historical energy telemetry
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <LegendDot color="#10b981" label="Generation" />
              <LegendDot color="#00c8e8" label="Consumption" />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={energyTimeline}>
              <defs>
                <linearGradient
                  id={`genGrad-${station}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#10b981"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="#10b981"
                    stopOpacity={0}
                  />
                </linearGradient>

                <linearGradient
                  id={`conGrad-${station}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#00c8e8"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="#00c8e8"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,200,232,0.05)"
              />

              <XAxis
                dataKey="t"
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
                width={40}
              />

              <Tooltip
                contentStyle={{
                  background: "#0d1b2e",
                  border: "1px solid rgba(0,200,232,0.2)",
                  borderRadius: 4,
                  fontSize: 11,
                }}
              />

              <Area
                type="monotone"
                dataKey="gen"
                stroke="#10b981"
                strokeWidth={2}
                fill={`url(#genGrad-${station})`}
                dot={false}
                name="Generation (kW)"
              />

              <Area
                type="monotone"
                dataKey="con"
                stroke="#00c8e8"
                strokeWidth={1.5}
                fill={`url(#conGrad-${station})`}
                dot={false}
                strokeDasharray="3 2"
                name="Consumption (kW)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Battery + Generator Load */}
        <div className="chart-container">
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#94a3b8",
              }}
            >
              Generator & Battery Telemetry
            </div>

            <div
              className="section-label"
              style={{ marginTop: 2 }}
            >
              Backend generator load and battery state
            </div>
          </div>

          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={energyTimeline}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,200,232,0.05)"
              />

              <XAxis
                dataKey="t"
                tick={{
                  fontSize: 8,
                  fill: "#475569",
                  fontFamily: "JetBrains Mono",
                }}
              />

              <YAxis
                domain={[0, 100]}
                tick={{
                  fontSize: 8,
                  fill: "#475569",
                  fontFamily: "JetBrains Mono",
                }}
                width={30}
              />

              <Tooltip
                contentStyle={{
                  background: "#0d1b2e",
                  border: "1px solid rgba(0,200,232,0.2)",
                  borderRadius: 4,
                  fontSize: 11,
                }}
              />

              <Bar
                dataKey="load"
                fill="#f59e0b"
                radius={[2, 2, 0, 0]}
                name="Generator Load (%)"
                opacity={0.8}
              />

              <Bar
                dataKey="bat"
                fill="#00c8e8"
                radius={[2, 2, 0, 0]}
                name="Battery (%)"
                opacity={0.55}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status + Energy Flow */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {/* Live system status */}
        <div
          className="glass"
          style={{
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div
            className="section-label"
            style={{ marginBottom: 12 }}
          >
            LIVE ENERGY SYSTEM STATUS
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {/* Generation */}
            <div
              style={{
                padding: 12,
                background: "rgba(7,13,26,0.6)",
                border: "1px solid rgba(16,185,129,0.14)",
                borderRadius: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div>
                  <div
                    className="font-display"
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#e2e8f0",
                    }}
                  >
                    GENERATION
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#475569",
                    }}
                  >
                    Total station generation
                  </div>
                </div>

                <div
                  className="font-display"
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#10b981",
                  }}
                >
                  {latest
                    ? `${formatNumber(latest.totalGeneration)} kW`
                    : "--"}
                </div>
              </div>

              <LoadBar
                value={
                  latest && latest.totalGeneration > 0
                    ? Math.min(
                        100,
                        (latest.totalGeneration / 600) * 100,
                      )
                    : 0
                }
                color="#10b981"
              />
            </div>

            {/* Consumption */}
            <div
              style={{
                padding: 12,
                background: "rgba(7,13,26,0.6)",
                border: "1px solid rgba(0,200,232,0.14)",
                borderRadius: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div>
                  <div
                    className="font-display"
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#e2e8f0",
                    }}
                  >
                    CONSUMPTION
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#475569",
                    }}
                  >
                    Total station demand
                  </div>
                </div>

                <div
                  className="font-display"
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#00c8e8",
                  }}
                >
                  {latest
                    ? `${formatNumber(latest.totalConsumption)} kW`
                    : "--"}
                </div>
              </div>

              <LoadBar
                value={
                  latest && latest.totalConsumption > 0
                    ? Math.min(
                        100,
                        (latest.totalConsumption / 600) * 100,
                      )
                    : 0
                }
                color="#00c8e8"
              />
            </div>

            {/* Generator load */}
            <div
              style={{
                padding: 12,
                background: "rgba(7,13,26,0.6)",
                border: `1px solid ${loadColor}22`,
                borderRadius: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div>
                  <div
                    className="font-display"
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#e2e8f0",
                    }}
                  >
                    GENERATOR LOAD
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#475569",
                    }}
                  >
                    Current generator utilization
                  </div>
                </div>

                <div
                  className="font-display"
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: loadColor,
                  }}
                >
                  {latest
                    ? `${formatNumber(latest.generatorLoad)}%`
                    : "--"}
                </div>
              </div>

              <LoadBar
                value={latest?.generatorLoad ?? 0}
                color={loadColor}
              />
            </div>

            {/* Battery */}
            <div
              style={{
                padding: 12,
                background: "rgba(7,13,26,0.6)",
                border: `1px solid ${batteryColor}22`,
                borderRadius: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div>
                  <div
                    className="font-display"
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#e2e8f0",
                    }}
                  >
                    BATTERY BANK
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#475569",
                    }}
                  >
                    Current state of charge
                  </div>
                </div>

                <div
                  className="font-display"
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: batteryColor,
                  }}
                >
                  {latest
                    ? `${formatNumber(latest.batteryPercentage)}%`
                    : "--"}
                </div>
              </div>

              <LoadBar
                value={latest?.batteryPercentage ?? 0}
                color={batteryColor}
              />
            </div>
          </div>
        </div>

        {/* Energy flow */}
        <div
          className="glass"
          style={{
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div
            className="section-label"
            style={{ marginBottom: 12 }}
          >
            ENERGY FLOW
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {/* Source */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <div
                style={{
                  padding: 12,
                  borderRadius: 5,
                  textAlign: "center",
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontFamily: "JetBrains Mono",
                    color: "#475569",
                    letterSpacing: "0.08em",
                  }}
                >
                  GENERATION
                </div>

                <div
                  className="font-display"
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#10b981",
                  }}
                >
                  {latest
                    ? `${formatNumber(latest.totalGeneration)} kW`
                    : "--"}
                </div>
              </div>

              <div
                style={{
                  padding: 12,
                  borderRadius: 5,
                  textAlign: "center",
                  background: "rgba(0,200,232,0.08)",
                  border: "1px solid rgba(0,200,232,0.2)",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontFamily: "JetBrains Mono",
                    color: "#475569",
                    letterSpacing: "0.08em",
                  }}
                >
                  BATTERY SOC
                </div>

                <div
                  className="font-display"
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#00c8e8",
                  }}
                >
                  {latest
                    ? `${formatNumber(latest.batteryPercentage)}%`
                    : "--"}
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                color: "#00c8e8",
                fontSize: 18,
              }}
            >
              ↓
            </div>

            {/* Distribution bus */}
            <div
              style={{
                padding: 12,
                borderRadius: 5,
                textAlign: "center",
                background: "rgba(0,200,232,0.06)",
                border: "1px solid rgba(0,200,232,0.2)",
              }}
            >
              <div className="section-label">
                DISTRIBUTION BUS / POWER BALANCE
              </div>

              <div
                className="font-display"
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: balanceColor,
                }}
              >
                {latest
                  ? `${balance >= 0 ? "+" : ""}${formatNumber(balance)} kW`
                  : "--"}
              </div>

              <div
                style={{
                  marginTop: 3,
                  fontSize: 10,
                  color: balanceColor,
                  fontFamily: "JetBrains Mono",
                  letterSpacing: "0.08em",
                }}
              >
                {getBalanceLabel(balance)}
              </div>
            </div>

            {/* Arrow */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                color: "#00c8e8",
                fontSize: 18,
              }}
            >
              ↓
            </div>

            {/* Consumer */}
            <div
              style={{
                padding: 14,
                borderRadius: 5,
                background: "rgba(7,13,26,0.6)",
                border: "1px solid rgba(148,163,184,0.08)",
                textAlign: "center",
              }}
            >
              <div className="section-label">
                TOTAL STATION CONSUMPTION
              </div>

              <div
                className="font-display"
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#00c8e8",
                  marginTop: 4,
                }}
              >
                {latest
                  ? `${formatNumber(latest.totalConsumption)} kW`
                  : "--"}
              </div>
            </div>
          </div>

          {/* Backend source */}
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              background: "rgba(0,200,232,0.04)",
              border: "1px solid rgba(0,200,232,0.15)",
              borderRadius: 6,
            }}
          >
            <div
              className="font-mono"
              style={{
                fontSize: 9,
                color: "#00c8e8",
                letterSpacing: "0.1em",
                marginBottom: 4,
              }}
            >
              BACKEND ENERGY SOURCE
            </div>

            <p
              style={{
                fontSize: 11,
                color: "#94a3b8",
                margin: 0,
              }}
            >
              {station} energy telemetry is being read from the
              Spring Boot backend. Predictive energy recommendations
              will be connected during the PREDICT UI phase.
            </p>
          </div>
        </div>
      </div>

      {/* Telemetry footer */}
      {latest && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            color: "#475569",
            fontFamily: "JetBrains Mono",
            fontSize: 9,
          }}
        >
          <span>
            {station} · BACKEND SOURCE · READING #{latest.id}
          </span>

          <span>
            AUTO REFRESH: 15s · {formatTime(latest.timestamp)}
          </span>
        </div>
      )}
    </div>
  );
}