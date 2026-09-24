import { useEffect, useMemo, useState } from "react";

type Station = "MAITRI" | "BHARATI";

interface MaintenanceRecord {
  id: number;
  stationId: number;
  stationCode: string;
  equipmentCode: string;
  equipmentName: string;
  maintenanceType: string;
  status: string;
  description: string;
  scheduledDate: string;
  completedDate: string | null;
  createdAt: string;
}

interface MaintenanceProps {
  station: Station;
}

const statusColors: Record<string, string> = {
  SCHEDULED: "#00c8e8",
  IN_PROGRESS: "#f59e0b",
  COMPLETED: "#10b981",
};

const typeColors: Record<string, string> = {
  CORRECTIVE: "#ef4444",
  PREVENTIVE: "#f59e0b",
  INSPECTION: "#00c8e8",
};

function stationIdFor(station: Station) {
  return station === "MAITRI" ? 1 : 2;
}

function formatDate(value: string | null) {
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

function formatDateTime(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function daysFromToday(value: string) {
  const scheduled = new Date(value);
  const now = new Date();

  scheduled.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  return Math.ceil(
    (scheduled.getTime() - now.getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

export default function Maintenance({
  station,
}: MaintenanceProps) {
  const stationId = stationIdFor(station);

  const [records, setRecords] = useState<
    MaintenanceRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );
  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  const loadMaintenance = async () => {
    try {
      setError(null);

      const response = await fetch(
        `/api/maintenance/${stationId}`,
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load maintenance records",
        );
      }

      const data: MaintenanceRecord[] =
        await response.json();

      setRecords(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(
        "Maintenance API error:",
        err,
      );

      setError(
        "Unable to connect to maintenance telemetry",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadMaintenance();

    const interval = window.setInterval(
      loadMaintenance,
      15000,
    );

    return () =>
      window.clearInterval(interval);
  }, [stationId]);

  const stats = useMemo(() => {
    const scheduled = records.filter(
      (record) => record.status === "SCHEDULED",
    ).length;

    const inProgress = records.filter(
      (record) => record.status === "IN_PROGRESS",
    ).length;

    const completed = records.filter(
      (record) => record.status === "COMPLETED",
    ).length;

    const overdue = records.filter((record) => {
      if (
        record.status === "COMPLETED" ||
        !record.scheduledDate
      ) {
        return false;
      }

      return daysFromToday(record.scheduledDate) < 0;
    }).length;

    return {
      scheduled,
      inProgress,
      completed,
      overdue,
    };
  }, [records]);

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
            MAINTENANCE CONTROL
          </h1>

          <p
            style={{
              fontSize: 13,
              color: "#64748b",
            }}
          >
            {station} · Scheduled maintenance ·
            Work orders · Service history
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            className="font-mono"
            style={{
              fontSize: 9,
              color: error
                ? "#ef4444"
                : "#10b981",
              letterSpacing: "0.08em",
            }}
          >
            ●{" "}
            {error
              ? "BACKEND OFFLINE"
              : "LIVE BACKEND TELEMETRY"}
          </div>

          <button
            className="btn-primary"
            style={{ fontSize: 12 }}
          >
            New Work Order
          </button>
        </div>
      </div>

      {loading && records.length === 0 ? (
        <div
          className="glass"
          style={{
            padding: 30,
            borderRadius: 8,
            textAlign: "center",
            color: "#64748b",
          }}
        >
          Loading maintenance records...
        </div>
      ) : (
        <>
          {/* Stats */}
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
                Scheduled
              </div>

              <div
                className="font-display"
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#00c8e8",
                }}
              >
                {stats.scheduled}
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: "#475569",
                  marginTop: 3,
                }}
              >
                Active scheduled work
              </div>
            </div>

            <div className="kpi-card">
              <div
                className="section-label"
                style={{ marginBottom: 8 }}
              >
                In Progress
              </div>

              <div
                className="font-display"
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#f59e0b",
                }}
              >
                {stats.inProgress}
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: "#475569",
                  marginTop: 3,
                }}
              >
                Currently being serviced
              </div>
            </div>

            <div className="kpi-card">
              <div
                className="section-label"
                style={{ marginBottom: 8 }}
              >
                Completed
              </div>

              <div
                className="font-display"
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#10b981",
                }}
              >
                {stats.completed}
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: "#475569",
                  marginTop: 3,
                }}
              >
                Completed service records
              </div>
            </div>

            <div className="kpi-card">
              <div
                className="section-label"
                style={{ marginBottom: 8 }}
              >
                Overdue
              </div>

              <div
                className="font-display"
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color:
                    stats.overdue > 0
                      ? "#ef4444"
                      : "#10b981",
                }}
              >
                {stats.overdue}
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: "#475569",
                  marginTop: 3,
                }}
              >
                Based on scheduled date
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div
            className="glass"
            style={{
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                borderBottom:
                  "1px solid rgba(0,200,232,0.1)",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div className="section-label">
                  MAINTENANCE SCHEDULE
                </div>

                <div
                  className="font-mono"
                  style={{
                    fontSize: 9,
                    color: "#475569",
                    marginTop: 4,
                  }}
                >
                  {station} ·{" "}
                  {records.length} backend records
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

            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {records.map((record) => {
                const daysLeft = daysFromToday(
                  record.scheduledDate,
                );

                const statusColor =
                  statusColors[
                    record.status
                  ] ?? "#64748b";

                const typeColor =
                  typeColors[
                    record.maintenanceType
                  ] ?? "#64748b";

                const isOverdue =
                  record.status !==
                    "COMPLETED" &&
                  daysLeft < 0;

                const priorityColor =
                  record.status ===
                  "IN_PROGRESS"
                    ? "#f59e0b"
                    : record.maintenanceType ===
                        "CORRECTIVE"
                      ? "#ef4444"
                      : typeColor;

                return (
                  <div
                    key={record.id}
                    style={{
                      display: "flex",
                      gap: 16,
                      padding:
                        "16px 20px",
                      borderBottom:
                        "1px solid rgba(148,163,184,0.06)",
                      borderLeft: `3px solid ${priorityColor}`,
                      alignItems:
                        "flex-start",
                    }}
                  >
                    {/* Days */}
                    <div
                      style={{
                        width: 60,
                        flexShrink: 0,
                        textAlign:
                          "center",
                      }}
                    >
                      <div
                        className="font-mono"
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          color:
                            record.status ===
                            "COMPLETED"
                              ? "#10b981"
                              : isOverdue
                                ? "#ef4444"
                                : daysLeft <=
                                    3
                                  ? "#f59e0b"
                                  : "#94a3b8",
                        }}
                      >
                        {record.status ===
                        "COMPLETED"
                          ? "✓"
                          : Math.abs(
                              daysLeft,
                            )}
                      </div>

                      <div
                        className="font-mono"
                        style={{
                          fontSize: 8,
                          color:
                            "#475569",
                          letterSpacing:
                            "0.1em",
                        }}
                      >
                        {record.status ===
                        "COMPLETED"
                          ? "DONE"
                          : isOverdue
                            ? "DAYS AGO"
                            : "DAYS LEFT"}
                      </div>
                    </div>

                    {/* Details */}
                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems:
                            "center",
                          marginBottom: 4,
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <div
                          className="font-display"
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color:
                              "#e2e8f0",
                          }}
                        >
                          {
                            record.equipmentName
                          }
                        </div>

                        <span
                          style={{
                            padding:
                              "1px 7px",
                            background: `${typeColor}12`,
                            border: `1px solid ${typeColor}30`,
                            borderRadius: 3,
                            fontSize: 9,
                            fontFamily:
                              "JetBrains Mono",
                            color:
                              typeColor,
                            letterSpacing:
                              "0.1em",
                          }}
                        >
                          {
                            record.maintenanceType
                          }
                        </span>

                        <span
                          style={{
                            padding:
                              "1px 7px",
                            background: `${statusColor}12`,
                            border: `1px solid ${statusColor}30`,
                            borderRadius: 3,
                            fontSize: 9,
                            fontFamily:
                              "JetBrains Mono",
                            color:
                              statusColor,
                            letterSpacing:
                              "0.1em",
                          }}
                        >
                          {
                            record.status
                          }
                        </span>
                      </div>

                      <div
                        className="font-mono"
                        style={{
                          fontSize: 9,
                          color:
                            "#475569",
                          marginBottom: 6,
                        }}
                      >
                        Equipment Code:{" "}
                        {
                          record.equipmentCode
                        }
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color:
                            "#94a3b8",
                          marginBottom: 5,
                        }}
                      >
                        {
                          record.description
                        }
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          flexWrap:
                            "wrap",
                          fontSize: 10,
                          color:
                            "#475569",
                        }}
                      >
                        <span>
                          ID:{" "}
                          <span
                            className="font-mono"
                            style={{
                              color:
                                "#64748b",
                            }}
                          >
                            MNT-
                            {String(
                              record.id,
                            ).padStart(
                              3,
                              "0",
                            )}
                          </span>
                        </span>

                        <span>
                          Scheduled:{" "}
                          <span
                            style={{
                              color:
                                "#64748b",
                            }}
                          >
                            {formatDate(
                              record.scheduledDate,
                            )}
                          </span>
                        </span>

                        <span>
                          Completed:{" "}
                          <span
                            style={{
                              color:
                                "#64748b",
                            }}
                          >
                            {formatDate(
                              record.completedDate,
                            )}
                          </span>
                        </span>

                        <span>
                          Created:{" "}
                          <span
                            style={{
                              color:
                                "#64748b",
                            }}
                          >
                            {formatDate(
                              record.createdAt,
                            )}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Right side */}
                    <div
                      style={{
                        display:
                          "flex",
                        flexDirection:
                          "column",
                        gap: 8,
                        alignItems:
                          "flex-end",
                        minWidth: 90,
                      }}
                    >
                      <span
                        style={{
                          padding:
                            "2px 8px",
                          background: `${statusColor}12`,
                          border: `1px solid ${statusColor}30`,
                          borderRadius: 3,
                          fontSize: 9,
                          fontFamily:
                            "JetBrains Mono",
                          color:
                            statusColor,
                          letterSpacing:
                            "0.1em",
                        }}
                      >
                        {record.status}
                      </span>

                      <button
                        className="btn-ghost"
                        style={{
                          fontSize: 10,
                          padding:
                            "4px 10px",
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })}

              {records.length === 0 && (
                <div
                  style={{
                    padding: 30,
                    textAlign:
                      "center",
                    color: "#64748b",
                  }}
                >
                  No maintenance records
                  found for {station}.
                </div>
              )}
            </div>
          </div>

          {/* Backend information */}
          <div
            style={{
              padding: "12px 16px",
              background:
                "rgba(0,200,232,0.04)",
              border:
                "1px solid rgba(0,200,232,0.12)",
              borderRadius: 6,
            }}
          >
            <div
              className="font-mono"
              style={{
                fontSize: 9,
                color: "#00c8e8",
                letterSpacing:
                  "0.1em",
                marginBottom: 5,
              }}
            >
              MAINTENANCE DATA SOURCE
            </div>

            <div
              style={{
                fontSize: 11,
                color: "#64748b",
              }}
            >
              Live records retrieved from
              the ANTARIS Spring Boot
              maintenance API for{" "}
              <span
                style={{
                  color: "#94a3b8",
                }}
              >
                {station}
              </span>
              . The interface refreshes
              automatically every 15 seconds.
            </div>
          </div>

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
            · API: /api/maintenance/
            {stationId}
          </div>
        </>
      )}
    </div>
  );
}