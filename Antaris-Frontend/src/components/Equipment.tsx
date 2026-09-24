import { useEffect, useMemo, useState } from "react";

type Station = "MAITRI" | "BHARATI";

type BackendEquipment = {
  id: number;
  stationId: number;
  stationCode: string;
  equipmentCode: string;
  equipmentName: string;
  equipmentType: string;
  status: string;
  healthScore: number;
  loadPercentage: number;
  temperature: number;
  runtimeHours: number;
  lastMaintenance: string;
  timestamp: string;
};

type EquipmentProps = {
  station: Station;
};

type Filter = "All" | "Warning" | "Critical";

const stationIds: Record<Station, number> = {
  MAITRI: 1,
  BHARATI: 2,
};

const statusColors: Record<string, string> = {
  OPERATIONAL: "#10b981",
  WARNING: "#f59e0b",
  CRITICAL: "#ef4444",
  OFFLINE: "#475569",
};

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTimestamp(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRuntime(hours: number) {
  if (!Number.isFinite(hours)) return "—";

  return `${hours.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })} hrs`;
}

function getStatusColor(status: string) {
  return statusColors[status?.toUpperCase()] ?? "#64748b";
}

function getHealthColor(health: number) {
  if (health >= 85) return "#10b981";
  if (health >= 60) return "#f59e0b";
  return "#ef4444";
}

function getHealthLabel(health: number) {
  if (health >= 85) return "HEALTHY";
  if (health >= 60) return "WATCH";
  return "CRITICAL";
}

function getHealthRisk(health: number) {
  return Math.max(0, Math.round(100 - health));
}

function getLoadColor(load: number) {
  if (load >= 85) return "#ef4444";
  if (load >= 70) return "#f59e0b";
  return "#10b981";
}

function getTemperatureColor(temperature: number) {
  if (temperature >= 85) return "#ef4444";
  if (temperature >= 75) return "#f59e0b";
  return "#e2e8f0";
}

function getMaintenanceAge(lastMaintenance: string) {
  if (!lastMaintenance) return "—";

  const date = new Date(lastMaintenance);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const diffDays = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "Scheduled";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";

  return `${diffDays} days ago`;
}

export default function Equipment({ station }: EquipmentProps) {
  const [equipment, setEquipment] = useState<BackendEquipment[]>([]);
  const [filter, setFilter] = useState<Filter>("All");
  const [inspectEq, setInspectEq] = useState<BackendEquipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const stationId = stationIds[station];

  useEffect(() => {
    let cancelled = false;

    const fetchEquipment = async () => {
      try {
        const response = await fetch(`/api/equipment/${stationId}`);

        if (!response.ok) {
          throw new Error(
            `Equipment API returned HTTP ${response.status}`
          );
        }

        const data = await response.json();

        const list: BackendEquipment[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.value)
            ? data.value
            : [];

        if (!cancelled) {
          setEquipment(list);
          setLastUpdated(
            list.length > 0
              ? list.reduce((latest, item) =>
                  new Date(item.timestamp).getTime() >
                  new Date(latest.timestamp).getTime()
                    ? item
                    : latest
                ).timestamp
              : null
          );
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load equipment telemetry."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    fetchEquipment();

    const interval = window.setInterval(fetchEquipment, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [stationId]);

  useEffect(() => {
    setInspectEq(null);
    setFilter("All");
  }, [station]);

  const filteredEquipment = useMemo(() => {
    return equipment.filter((eq) => {
      const status = eq.status?.toUpperCase();

      if (filter === "All") return true;
      if (filter === "Warning") return status === "WARNING";
      if (filter === "Critical") {
        return status === "CRITICAL" || eq.healthScore < 60;
      }

      return true;
    });
  }, [equipment, filter]);

  const summary = useMemo(() => {
    const total = equipment.length;

    const operational = equipment.filter(
      (eq) => eq.status?.toUpperCase() === "OPERATIONAL"
    ).length;

    const warning = equipment.filter(
      (eq) => eq.status?.toUpperCase() === "WARNING"
    ).length;

    const critical = equipment.filter(
      (eq) =>
        eq.status?.toUpperCase() === "CRITICAL" ||
        eq.healthScore < 60
    ).length;

    const averageHealth =
      total > 0
        ? equipment.reduce(
            (sum, eq) => sum + Number(eq.healthScore || 0),
            0
          ) / total
        : 0;

    const averageRisk =
      total > 0
        ? equipment.reduce(
            (sum, eq) => sum + getHealthRisk(eq.healthScore),
            0
          ) / total
        : 0;

    const averageLoad =
      total > 0
        ? equipment.reduce(
            (sum, eq) => sum + Number(eq.loadPercentage || 0),
            0
          ) / total
        : 0;

    return {
      total,
      operational,
      warning,
      critical,
      averageHealth,
      averageRisk,
      averageLoad,
    };
  }, [equipment]);

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
            EQUIPMENT INTELLIGENCE
          </h1>

          <p
            style={{
              fontSize: 13,
              color: "#64748b",
              marginTop: 4,
            }}
          >
            {station} · Health monitoring · Equipment diagnostics
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginTop: 8,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: error ? "#ef4444" : "#10b981",
                boxShadow: error
                  ? "0 0 8px rgba(239,68,68,0.7)"
                  : "0 0 8px rgba(16,185,129,0.7)",
              }}
            />

            <span
              className="font-mono"
              style={{
                fontSize: 9,
                letterSpacing: "0.12em",
                color: error ? "#ef4444" : "#10b981",
              }}
            >
              {error
                ? "EQUIPMENT TELEMETRY ERROR"
                : "LIVE BACKEND EQUIPMENT TELEMETRY"}
            </span>

            {lastUpdated && !error && (
              <span
                style={{
                  fontSize: 10,
                  color: "#475569",
                }}
              >
                · Updated {formatTimestamp(lastUpdated)}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {(["All", "Warning", "Critical"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="btn-ghost"
              style={{
                fontSize: 11,
                padding: "4px 10px",
                background:
                  filter === f
                    ? "rgba(0,200,232,0.1)"
                    : "transparent",
                color:
                  filter === f ? "#00c8e8" : "inherit",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && equipment.length === 0 && (
        <div
          className="glass"
          style={{
            padding: 24,
            borderRadius: 8,
            color: "#94a3b8",
            fontSize: 13,
          }}
        >
          Loading live equipment telemetry for {station}...
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid rgba(239,68,68,0.25)",
            background: "rgba(239,68,68,0.06)",
            color: "#fca5a5",
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {/* Summary KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
        }}
      >
        {[
          {
            label: "Overall Health",
            value: `${summary.averageHealth.toFixed(1)}%`,
            color: getHealthColor(summary.averageHealth),
          },
          {
            label: "Items Operational",
            value: `${summary.operational} / ${summary.total}`,
            color: "#10b981",
          },
          {
            label: "Items Warning",
            value: `${summary.warning} / ${summary.total}`,
            color: "#f59e0b",
          },
          {
            label: "Health Risk Index",
            value: `${summary.averageRisk.toFixed(1)}%`,
            color:
              summary.averageRisk > 40
                ? "#ef4444"
                : summary.averageRisk > 20
                  ? "#f59e0b"
                  : "#10b981",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div
              className="section-label"
              style={{ marginBottom: 8 }}
            >
              {kpi.label}
            </div>

            <div
              className="font-display"
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: kpi.color,
              }}
            >
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Equipment cards */}
      {!loading && filteredEquipment.length === 0 && !error && (
        <div
          className="glass"
          style={{
            padding: 24,
            borderRadius: 8,
            color: "#64748b",
            fontSize: 13,
          }}
        >
          No equipment matches the selected filter.
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        {filteredEquipment.map((eq) => (
          <EquipmentCard
            key={eq.id}
            eq={eq}
            onInspect={() => setInspectEq(eq)}
          />
        ))}
      </div>

      {/* Backend telemetry information */}
      {equipment.length > 0 && (
        <div
          className="glass"
          style={{
            borderRadius: 8,
            padding: "14px 20px",
          }}
        >
          <div
            className="font-display"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: 6,
            }}
          >
            EQUIPMENT TELEMETRY SUMMARY
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            <MiniStat
              label="Equipment"
              value={`${summary.total} registered`}
            />

            <MiniStat
              label="Avg Load"
              value={`${summary.averageLoad.toFixed(1)}%`}
              valueColor={getLoadColor(summary.averageLoad)}
            />

            <MiniStat
              label="Critical"
              value={`${summary.critical} items`}
              valueColor={
                summary.critical > 0 ? "#ef4444" : "#10b981"
              }
            />
          </div>
        </div>
      )}

      {/* Inspection drawer */}
      {inspectEq && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: 400,
            background: "rgba(7,13,26,0.97)",
            borderLeft:
              "1px solid rgba(0,200,232,0.2)",
            zIndex: 1000,
            padding: 24,
            backdropFilter: "blur(12px)",
            boxShadow:
              "-4px 0 24px rgba(0,0,0,0.5)",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div>
              <div
                className="section-label"
                style={{ marginBottom: 4 }}
              >
                {inspectEq.equipmentCode}
              </div>

              <h2
                className="font-display"
                style={{
                  fontSize: 20,
                  color: "#e2e8f0",
                }}
              >
                {inspectEq.equipmentName}
              </h2>
            </div>

            <button
              onClick={() => setInspectEq(null)}
              className="btn-ghost"
              style={{
                fontSize: 16,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Status */}
            <div
              className="glass"
              style={{
                padding: 16,
                borderRadius: 8,
              }}
            >
              <div
                className="section-label"
                style={{ marginBottom: 10 }}
              >
                CURRENT STATUS
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 4,
                    border: `1px solid ${getStatusColor(
                      inspectEq.status
                    )}40`,
                    background: `${getStatusColor(
                      inspectEq.status
                    )}12`,
                    color: getStatusColor(
                      inspectEq.status
                    ),
                    fontFamily: "JetBrains Mono",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                  }}
                >
                  {inspectEq.status.toUpperCase()}
                </span>

                <span
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                  }}
                >
                  {inspectEq.equipmentType}
                </span>
              </div>
            </div>

            {/* Health */}
            <div
              className="glass"
              style={{
                padding: 16,
                borderRadius: 8,
              }}
            >
              <div
                className="section-label"
                style={{ marginBottom: 12 }}
              >
                HEALTH & OPERATING DATA
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <MiniStat
                  label="Health"
                  value={`${inspectEq.healthScore}%`}
                  valueColor={getHealthColor(
                    inspectEq.healthScore
                  )}
                />

                <MiniStat
                  label="Risk"
                  value={`${getHealthRisk(
                    inspectEq.healthScore
                  )}%`}
                  valueColor={getHealthColor(
                    inspectEq.healthScore
                  )}
                />

                <MiniStat
                  label="Load"
                  value={`${inspectEq.loadPercentage}%`}
                  valueColor={getLoadColor(
                    inspectEq.loadPercentage
                  )}
                />

                <MiniStat
                  label="Temp"
                  value={`${inspectEq.temperature}°C`}
                  valueColor={getTemperatureColor(
                    inspectEq.temperature
                  )}
                />

                <MiniStat
                  label="Runtime"
                  value={formatRuntime(
                    inspectEq.runtimeHours
                  )}
                />

                <MiniStat
                  label="Maint."
                  value={formatMaintenanceAge(
                    inspectEq.lastMaintenance
                  )}
                />
              </div>
            </div>

            {/* Maintenance */}
            <div
              className="glass"
              style={{
                padding: 16,
                borderRadius: 8,
              }}
            >
              <div
                className="section-label"
                style={{ marginBottom: 8 }}
              >
                MAINTENANCE
              </div>

              <p
                style={{
                  fontSize: 13,
                  color: "#e2e8f0",
                  lineHeight: 1.5,
                }}
              >
                Last maintenance:{" "}
                <strong>
                  {formatDate(
                    inspectEq.lastMaintenance
                  )}
                </strong>
              </p>

              <p
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  marginTop: 6,
                }}
              >
                Maintenance scheduling data is not
                currently provided by the Equipment API.
              </p>
            </div>

            {/* Telemetry timestamp */}
            <div
              className="glass"
              style={{
                padding: 16,
                borderRadius: 8,
              }}
            >
              <div
                className="section-label"
                style={{ marginBottom: 8 }}
              >
                LAST TELEMETRY
              </div>

              <div
                className="font-mono"
                style={{
                  fontSize: 11,
                  color: "#00c8e8",
                }}
              >
                {formatTimestamp(
                  inspectEq.timestamp
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EquipmentCard({
  eq,
  onInspect,
}: {
  eq: BackendEquipment;
  onInspect: () => void;
}) {
  const color = getStatusColor(eq.status);

  const radius = 32;
  const circumference = 2 * Math.PI * radius;

  const health = Math.max(
    0,
    Math.min(100, Number(eq.healthScore || 0))
  );

  const offset =
    circumference * (1 - health / 100);

  return (
    <div
      className="kpi-card"
      style={{
        padding: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />

      <div style={{ padding: 16 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <div>
            <div
              className="section-label"
              style={{ marginBottom: 2 }}
            >
              {eq.equipmentCode} · {eq.equipmentType}
            </div>

            <div
              className="font-display"
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#e2e8f0",
              }}
            >
              {eq.equipmentName}
            </div>
          </div>

          <span
            style={{
              padding: "2px 8px",
              background: `${color}12`,
              border: `1px solid ${color}30`,
              borderRadius: 3,
              fontSize: 9,
              fontFamily: "JetBrains Mono",
              color,
              letterSpacing: "0.1em",
            }}
          >
            {eq.status.toUpperCase()}
          </span>
        </div>

        {/* Health */}
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <svg width={74} height={74}>
            <circle
              cx={37}
              cy={37}
              r={radius}
              fill="none"
              stroke="rgba(148,163,184,0.1)"
              strokeWidth="5"
            />

            <circle
              cx={37}
              cy={37}
              r={radius}
              fill="none"
              stroke={getHealthColor(health)}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 37 37)"
              style={{
                filter: `drop-shadow(0 0 4px ${getHealthColor(
                  health
                )})`,
              }}
            />

            <text
              x={37}
              y={37}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={getHealthColor(health)}
              fontSize="14"
              fontFamily="Rajdhani, sans-serif"
              fontWeight="700"
            >
              {health.toFixed(0)}%
            </text>
          </svg>

          <div>
            <div
              className="section-label"
              style={{ marginBottom: 6 }}
            >
              Health Score
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <MiniStat
                label="State"
                value={getHealthLabel(health)}
                valueColor={getHealthColor(health)}
              />

              <MiniStat
                label="Load"
                value={`${eq.loadPercentage}%`}
                valueColor={getLoadColor(
                  eq.loadPercentage
                )}
              />

              <MiniStat
                label="Temp"
                value={`${eq.temperature}°C`}
                valueColor={getTemperatureColor(
                  eq.temperature
                )}
              />
            </div>
          </div>
        </div>

        {/* Operating data */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              padding: "8px 10px",
              borderRadius: 5,
              background: "rgba(148,163,184,0.04)",
            }}
          >
            <div className="section-label">
              Runtime
            </div>

            <div
              className="font-mono"
              style={{
                marginTop: 3,
                fontSize: 10,
                color: "#e2e8f0",
              }}
            >
              {formatRuntime(eq.runtimeHours)}
            </div>
          </div>

          <div
            style={{
              padding: "8px 10px",
              borderRadius: 5,
              background: "rgba(148,163,184,0.04)",
            }}
          >
            <div className="section-label">
              Health Risk
            </div>

            <div
              className="font-mono"
              style={{
                marginTop: 3,
                fontSize: 10,
                color: getHealthColor(health),
              }}
            >
              {getHealthRisk(health)}%
            </div>
          </div>
        </div>

        {/* Health risk bar */}
        <div style={{ marginBottom: 10 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span className="section-label">
              Health Risk Index
            </span>

            <span
              className="font-mono"
              style={{
                fontSize: 10,
                color: getHealthColor(health),
                fontWeight: 600,
              }}
            >
              {getHealthRisk(health)}%
            </span>
          </div>

          <div
            style={{
              height: 3,
              background:
                "rgba(148,163,184,0.1)",
              borderRadius: 2,
            }}
          >
            <div
              style={{
                width: `${getHealthRisk(health)}%`,
                height: "100%",
                background: getHealthColor(health),
                borderRadius: 2,
                opacity: 0.8,
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            fontSize: 10,
            color: "#475569",
          }}
        >
          <span>
            Last maint: {formatDate(eq.lastMaintenance)}
          </span>

          <button
            onClick={onInspect}
            className="btn-ghost"
            style={{
              fontSize: 10,
              padding: "4px 9px",
            }}
          >
            Inspect
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
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
        gap: 8,
        alignItems: "baseline",
      }}
    >
      <span
        className="section-label"
        style={{ width: 52 }}
      >
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