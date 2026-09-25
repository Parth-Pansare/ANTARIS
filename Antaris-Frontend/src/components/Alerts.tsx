import { useEffect, useMemo, useState } from "react";

type Station = "MAITRI" | "BHARATI";

type AlertSeverity = "CRITICAL" | "WARNING" | "INFO";

type AlertFilter =
  | "ALL"
  | "CRITICAL"
  | "WARNING"
  | "INFO"
  | "ACTIVE"
  | "ACKNOWLEDGED";

interface AlertRecord {
  id: number;
  acknowledged: boolean;
  active: boolean;
  alertType: string;
  message: string;
  severity: AlertSeverity;
  source: string;
  stationCode: string;
  stationId: number;
  timestamp: string;
  title: string;
}

interface AlertsProps {
  station: Station;
}

const severityMeta: Record<
  AlertSeverity,
  {
    color: string;
    bg: string;
    label: string;
  }
> = {
  CRITICAL: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.05)",
    label: "CRITICAL",
  },
  WARNING: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.05)",
    label: "WARNING",
  },
  INFO: {
    color: "#00c8e8",
    bg: "rgba(0,200,232,0.05)",
    label: "INFO",
  },
};

function getStationId(station: Station) {
  return station === "MAITRI" ? 1 : 2;
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatRelativeTime(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) {
    return "1 day ago";
  }

  return `${diffDays} days ago`;
}

export default function Alerts({
  station,
}: AlertsProps) {
  const stationId = getStationId(station);

  const [alerts, setAlerts] = useState<
    AlertRecord[]
  >([]);

  const [filter, setFilter] =
    useState<AlertFilter>("ALL");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [actionError, setActionError] =
    useState<string | null>(null);

  const [acknowledgingId, setAcknowledgingId] =
    useState<number | null>(null);

  const [acknowledgingAll, setAcknowledgingAll] =
    useState(false);

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  const loadAlerts = async () => {
    try {
      setError(null);

      const response = await fetch(
        `/api/alerts/${stationId}`,
      );

      if (!response.ok) {
        throw new Error(
          `Alert API returned ${response.status}`,
        );
      }

      const data: AlertRecord[] =
        await response.json();

      setAlerts(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(
        "Alerts API error:",
        err,
      );

      setError(
        "Unable to connect to alert telemetry",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadAlerts();

    const interval = window.setInterval(
      loadAlerts,
      15000,
    );

    return () =>
      window.clearInterval(interval);
  }, [stationId]);

  const acknowledgeAlert = async (
    id: number,
  ) => {
    try {
      setActionError(null);
      setAcknowledgingId(id);

      const response = await fetch(
        `/api/alerts/item/${id}/acknowledge`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Acknowledge API returned ${response.status}`,
        );
      }

      const updatedAlert: AlertRecord =
        await response.json();

      setAlerts((current) =>
        current.map((alert) =>
          alert.id === id
            ? updatedAlert
            : alert,
        ),
      );

      setLastUpdated(new Date());
    } catch (err) {
      console.error(
        "Acknowledge alert error:",
        err,
      );

      setActionError(
        `Failed to acknowledge alert #${id}`,
      );
    } finally {
      setAcknowledgingId(null);
    }
  };

  const acknowledgeAll = async () => {
    const pendingAlerts = alerts.filter(
      (alert) => !alert.acknowledged,
    );

    if (pendingAlerts.length === 0) {
      return;
    }

    try {
      setActionError(null);
      setAcknowledgingAll(true);

      const results =
        await Promise.allSettled(
          pendingAlerts.map((alert) =>
            fetch(
              `/api/alerts/item/${alert.id}/acknowledge`,
              {
                method: "PUT",
                headers: {
                  "Content-Type":
                    "application/json",
                },
              },
            ),
          ),
        );

      const failedIds: number[] = [];

      results.forEach(
        (result, index) => {
          if (
            result.status ===
              "rejected" ||
            !result.value.ok
          ) {
            failedIds.push(
              pendingAlerts[index].id,
            );
          }
        },
      );

      if (failedIds.length > 0) {
        setActionError(
          `Failed to acknowledge ${failedIds.length} alert(s).`,
        );
      }

      await loadAlerts();
    } catch (err) {
      console.error(
        "Acknowledge all error:",
        err,
      );

      setActionError(
        "Failed to acknowledge all alerts.",
      );
    } finally {
      setAcknowledgingAll(false);
    }
  };

  const counts = useMemo(() => {
    return {
      all: alerts.length,

      critical: alerts.filter(
        (alert) =>
          alert.severity === "CRITICAL",
      ).length,

      warning: alerts.filter(
        (alert) =>
          alert.severity === "WARNING",
      ).length,

      info: alerts.filter(
        (alert) =>
          alert.severity === "INFO",
      ).length,

      active: alerts.filter(
        (alert) => alert.active,
      ).length,

      acknowledged: alerts.filter(
        (alert) => alert.acknowledged,
      ).length,
    };
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      switch (filter) {
        case "CRITICAL":
          return alert.severity === "CRITICAL";

        case "WARNING":
          return alert.severity === "WARNING";

        case "INFO":
          return alert.severity === "INFO";

        case "ACTIVE":
          return alert.active;

        case "ACKNOWLEDGED":
          return alert.acknowledged;

        case "ALL":
        default:
          return true;
      }
    });
  }, [alerts, filter]);

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
            MISSION ALERTS
          </h1>

          <p
            style={{
              fontSize: 13,
              color: "#64748b",
            }}
          >
            {station} · Real-time alert
            monitoring · Predictive risk ·
            Station intelligence
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <div
            className="font-mono"
            style={{
              fontSize: 9,
              color: error
                ? "#ef4444"
                : "#10b981",
              marginRight: 8,
              letterSpacing: "0.08em",
            }}
          >
            ●{" "}
            {error
              ? "BACKEND OFFLINE"
              : "LIVE BACKEND"}
          </div>

          <button
            onClick={acknowledgeAll}
            className="btn-secondary"
            style={{ fontSize: 12 }}
            disabled={
              acknowledgingAll ||
              alerts.every(
                (alert) =>
                  alert.acknowledged,
              )
            }
          >
            {acknowledgingAll
              ? "Acknowledging..."
              : "Acknowledge All"}
          </button>

          <button
            className="btn-ghost"
            style={{ fontSize: 12 }}
            onClick={() => {
              const log = alerts
                .map(
                  (alert) =>
                    `${alert.id},${alert.stationCode},${alert.severity},${alert.alertType},${alert.title},${alert.timestamp}`,
                )
                .join("\n");

              const blob = new Blob(
                [
                  `ID,Station,Severity,Type,Title,Timestamp\n${log}`,
                ],
                {
                  type: "text/csv",
                },
              );

              const url =
                URL.createObjectURL(blob);

              const link =
                document.createElement(
                  "a",
                );

              link.href = url;
              link.download = `${station.toLowerCase()}_alerts_log.csv`;
              link.click();

              URL.revokeObjectURL(url);
            }}
          >
            Export Log
          </button>
        </div>
      </div>

      {/* Action error */}
      {actionError && (
        <div
          style={{
            padding: "10px 14px",
            background:
              "rgba(239,68,68,0.05)",
            border:
              "1px solid rgba(239,68,68,0.2)",
            borderRadius: 6,
            color: "#ef4444",
            fontSize: 11,
          }}
        >
          {actionError}
        </div>
      )}

      {/* Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, 1fr)",
          gap: 10,
        }}
      >
        <div className="kpi-card">
          <div
            className="section-label"
            style={{ marginBottom: 8 }}
          >
            Active Alerts
          </div>

          <div
            className="font-display"
            style={{
              fontSize: 24,
              fontWeight: 700,
              color:
                counts.active > 0
                  ? "#f59e0b"
                  : "#10b981",
            }}
          >
            {counts.active}
          </div>

          <div
            style={{
              fontSize: 10,
              color: "#475569",
              marginTop: 3,
            }}
          >
            Current station alerts
          </div>
        </div>

        <div className="kpi-card">
          <div
            className="section-label"
            style={{ marginBottom: 8 }}
          >
            Critical
          </div>

          <div
            className="font-display"
            style={{
              fontSize: 24,
              fontWeight: 700,
              color:
                counts.critical > 0
                  ? "#ef4444"
                  : "#10b981",
            }}
          >
            {counts.critical}
          </div>

          <div
            style={{
              fontSize: 10,
              color: "#475569",
              marginTop: 3,
            }}
          >
            Backend severity
          </div>
        </div>

        <div className="kpi-card">
          <div
            className="section-label"
            style={{ marginBottom: 8 }}
          >
            Warnings
          </div>

          <div
            className="font-display"
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#f59e0b",
            }}
          >
            {counts.warning}
          </div>

          <div
            style={{
              fontSize: 10,
              color: "#475569",
              marginTop: 3,
            }}
          >
            Backend severity
          </div>
        </div>

        <div className="kpi-card">
          <div
            className="section-label"
            style={{ marginBottom: 8 }}
          >
            Acknowledged
          </div>

          <div
            className="font-display"
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#10b981",
            }}
          >
            {counts.acknowledged}
          </div>

          <div
            style={{
              fontSize: 10,
              color: "#475569",
              marginTop: 3,
            }}
          >
            Current backend records
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        {(
          [
            "ALL",
            "CRITICAL",
            "WARNING",
            "INFO",
            "ACTIVE",
            "ACKNOWLEDGED",
          ] as AlertFilter[]
        ).map((item) => {
          let color = "#94a3b8";
          let label = item;

          if (item === "CRITICAL") {
            color = "#ef4444";
          }

          if (item === "WARNING") {
            color = "#f59e0b";
          }

          if (item === "INFO") {
            color = "#00c8e8";
          }

          if (item === "ACTIVE") {
            color = "#10b981";
          }

          if (item === "ACKNOWLEDGED") {
            color = "#64748b";
          }

          const count =
            item === "ALL"
              ? counts.all
              : item === "CRITICAL"
                ? counts.critical
                : item === "WARNING"
                  ? counts.warning
                  : item === "INFO"
                    ? counts.info
                    : item === "ACTIVE"
                      ? counts.active
                      : counts.acknowledged;

          const isActive =
            filter === item;

          return (
            <button
              key={item}
              onClick={() =>
                setFilter(item)
              }
              style={{
                padding: "6px 14px",
                borderRadius: 4,
                fontSize: 11,
                fontFamily:
                  "JetBrains Mono, monospace",
                letterSpacing: "0.08em",
                cursor: "pointer",
                background: isActive
                  ? `${color}12`
                  : "transparent",
                border: isActive
                  ? `1px solid ${color}30`
                  : "1px solid rgba(148,163,184,0.12)",
                color: isActive
                  ? color
                  : "#475569",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {label}

              <span
                style={{
                  background: isActive
                    ? `${color}20`
                    : "rgba(148,163,184,0.1)",
                  borderRadius: 8,
                  padding: "0 5px",
                  fontSize: 9,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading &&
        alerts.length === 0 && (
          <div
            className="glass"
            style={{
              padding: 30,
              borderRadius: 8,
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Loading live alerts...
          </div>
        )}

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "10px 14px",
            background:
              "rgba(239,68,68,0.05)",
            border:
              "1px solid rgba(239,68,68,0.2)",
            borderRadius: 6,
            color: "#ef4444",
            fontSize: 11,
          }}
        >
          {error}
        </div>
      )}

      {/* Alerts */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {filteredAlerts.map((alert) => {
          const meta =
            severityMeta[alert.severity];

          const isAcknowledging =
            acknowledgingId ===
            alert.id;

          return (
            <div
              key={alert.id}
              style={{
                borderRadius: 8,
                padding: "16px 20px",
                background:
                  alert.acknowledged
                    ? "rgba(7,13,26,0.5)"
                    : meta.bg,
                border: `1px solid ${meta.color}20`,
                borderLeftWidth: 3,
                borderLeftColor:
                  meta.color,
                opacity:
                  alert.acknowledged
                    ? 0.68
                    : 1,
                transition:
                  "opacity 0.2s",
              }}
            >
              {/* Alert header */}
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "flex-start",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    flexWrap:
                      "wrap",
                  }}
                >
                  <span
                    style={{
                      padding:
                        "2px 10px",
                      background: `${meta.color}18`,
                      border: `1px solid ${meta.color}30`,
                      borderRadius: 3,
                      fontSize: 9,
                      fontFamily:
                        "JetBrains Mono",
                      color:
                        meta.color,
                      letterSpacing:
                        "0.12em",
                    }}
                  >
                    {meta.label}
                  </span>

                  <span
                    style={{
                      padding:
                        "2px 8px",
                      background:
                        "rgba(148,163,184,0.06)",
                      border:
                        "1px solid rgba(148,163,184,0.1)",
                      borderRadius: 3,
                      fontSize: 9,
                      fontFamily:
                        "JetBrains Mono",
                      color:
                        "#64748b",
                      letterSpacing:
                        "0.08em",
                    }}
                  >
                    {alert.alertType}
                  </span>

                  <span
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      color: "#475569",
                      letterSpacing:
                        "0.06em",
                    }}
                  >
                    {alert.source}
                  </span>

                  <span
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      color: "#2d3d50",
                    }}
                  >
                    ID: {alert.id}
                  </span>
                </div>

                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      color: "#475569",
                    }}
                  >
                    {formatRelativeTime(
                      alert.timestamp,
                    )}
                  </div>

                  <div
                    className="font-mono"
                    style={{
                      fontSize: 8,
                      color: "#334155",
                      marginTop: 2,
                    }}
                  >
                    {formatTimestamp(
                      alert.timestamp,
                    )}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div
                className="font-display"
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#e2e8f0",
                  marginBottom: 6,
                }}
              >
                {alert.title}
              </div>

              {/* Message */}
              <p
                style={{
                  fontSize: 12,
                  color: "#94a3b8",
                  lineHeight: 1.6,
                  marginBottom: 12,
                }}
              >
                {alert.message}
              </p>

              {/* Metadata */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    padding:
                      "6px 10px",
                    background:
                      "rgba(7,13,26,0.6)",
                    borderRadius: 4,
                    border:
                      "1px solid rgba(148,163,184,0.08)",
                  }}
                >
                  <div
                    className="section-label"
                    style={{
                      marginBottom: 2,
                    }}
                  >
                    STATUS
                  </div>

                  <div
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      color:
                        alert.active
                          ? "#10b981"
                          : "#64748b",
                      fontWeight: 600,
                    }}
                  >
                    {alert.active
                      ? "ACTIVE"
                      : "INACTIVE"}
                  </div>
                </div>

                <div
                  style={{
                    padding:
                      "6px 10px",
                    background:
                      "rgba(7,13,26,0.6)",
                    borderRadius: 4,
                    border:
                      "1px solid rgba(148,163,184,0.08)",
                  }}
                >
                  <div
                    className="section-label"
                    style={{
                      marginBottom: 2,
                    }}
                  >
                    ACKNOWLEDGEMENT
                  </div>

                  <div
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      color:
                        alert.acknowledged
                          ? "#10b981"
                          : "#f59e0b",
                      fontWeight: 600,
                    }}
                  >
                    {alert.acknowledged
                      ? "ACKNOWLEDGED"
                      : "PENDING"}
                  </div>
                </div>

                <div
                  style={{
                    padding:
                      "6px 10px",
                    background:
                      "rgba(7,13,26,0.6)",
                    borderRadius: 4,
                    border:
                      "1px solid rgba(148,163,184,0.08)",
                  }}
                >
                  <div
                    className="section-label"
                    style={{
                      marginBottom: 2,
                    }}
                  >
                    STATION
                  </div>

                  <div
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      color: "#94a3b8",
                      fontWeight: 600,
                    }}
                  >
                    {alert.stationCode}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                }}
              >
                {alert.active && (
                  <button
                    onClick={() =>
                      acknowledgeAlert(
                        alert.id,
                      )
                    }
                    className="btn-secondary"
                    style={{
                      fontSize: 11,
                      padding:
                        "6px 14px",
                    }}
                    disabled={
                      alert.acknowledged ||
                      isAcknowledging ||
                      acknowledgingAll
                    }
                  >
                    {isAcknowledging
                      ? "Acknowledging..."
                      : alert.acknowledged
                        ? "✓ Acknowledged"
                        : "Acknowledge"}
                  </button>
                )}

                <button
                  className="btn-primary"
                  style={{
                    fontSize: 11,
                    padding:
                      "6px 14px",
                  }}
                  onClick={() =>
                    console.log(
                      "Investigating alert:",
                      alert,
                    )
                  }
                >
                  Investigate
                </button>

                <button
                  className="btn-ghost"
                  style={{
                    fontSize: 11,
                    padding:
                      "6px 14px",
                  }}
                  onClick={() =>
                    console.log(
                      "Opening diagnostics for:",
                      alert.source,
                    )
                  }
                >
                  View System
                </button>
              </div>
            </div>
          );
        })}

        {!loading &&
          filteredAlerts.length === 0 && (
            <div
              className="glass"
              style={{
                padding: 30,
                borderRadius: 8,
                textAlign: "center",
                color: "#64748b",
              }}
            >
              No alerts match the selected
              filter for {station}.
            </div>
          )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          padding: "10px 4px",
        }}
      >
        <div
          className="font-mono"
          style={{
            fontSize: 9,
            color: "#475569",
          }}
        >
          SOURCE: /api/alerts/{stationId}
        </div>

        <div
          className="font-mono"
          style={{
            fontSize: 9,
            color: "#475569",
          }}
        >
          LAST SYNC:{" "}
          {lastUpdated
            ? lastUpdated.toLocaleTimeString()
            : "—"}{" "}
          · REFRESH: 15s
        </div>
      </div>
    </div>
  );
}