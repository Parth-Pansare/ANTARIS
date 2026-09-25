import {
  useEffect,
  useMemo,
  useState,
} from "react";
import ThreeDStationCanvas, {
  type StationModelItem,
  type StationConnection,
} from "./ThreeDStationCanvas";

type Station = "MAITRI" | "BHARATI";

type S =
  | "normal"
  | "warning"
  | "critical"
  | "offline"
  | "monitoring";

interface DashboardResponse {
  stationId: number;
  stationCode: string;
  stationName: string;
  stationLocation: string;
  stationStatus: string;

  environment?: {
    temperature: number | null;
    humidity: number | null;
    pressure: number | null;
    windSpeed: number | null;
    windDirection: number | null;
    timestamp: string | null;
  };

  energy?: {
    totalGeneration: number | null;
    totalConsumption: number | null;
    powerBalance: number | null;
    batteryPercentage: number | null;
    generatorLoad: number | null;
    timestamp: string | null;
  };

  fuel?: {
    fuelLevel: number | null;
    fuelCapacity: number | null;
    fuelPercentage: number | null;
    consumptionRate: number | null;
    estimatedRuntimeHours: number | null;
    dailyConsumption: number | null;
    timestamp: string | null;
  };

  totalEquipment?: number | null;
  operationalEquipment?: number | null;
  warningEquipment?: number | null;

  totalInventoryItems?: number | null;
  lowInventoryItems?: number | null;
  criticalInventoryItems?: number | null;

  totalAlerts?: number | null;
  activeAlerts?: number | null;

  scheduledMaintenance?: number | null;
  inProgressMaintenance?: number | null;

  lastUpdated?: string | null;
}

interface EquipmentResponse {
  id: number;
  stationId: number;
  stationCode: string;
  equipmentCode: string;
  equipmentName: string;
  equipmentType: string;
  status: string;
  healthScore: number | null;
  loadPercentage: number | null;
  temperature: number | null;
  runtimeHours: number | null;
  lastMaintenance: string | null;
  timestamp: string | null;
}

interface Item
  extends StationModelItem {
  temperature: string;
  power: string;
  alert: string;
  lastUpdate: string;
  dataSource: string;
}

const connections: StationConnection[] = [
  {
    from: "fuel",
    to: "power",
    label: "FUEL SUPPLY",
    kind: "fuel",
  },
  {
    from: "power",
    to: "main",
    label: "POWER",
    kind: "power",
  },
  {
    from: "power",
    to: "lab",
    label: "POWER",
    kind: "power",
  },
  {
    from: "power",
    to: "living",
    label: "POWER",
    kind: "power",
  },
  {
    from: "power",
    to: "comm",
    label: "POWER",
    kind: "power",
  },
  {
    from: "power",
    to: "equip",
    label: "POWER",
    kind: "power",
  },
  {
    from: "main",
    to: "comm",
    label: "TELEMETRY / CONTROL",
    kind: "data",
  },
  {
    from: "main",
    to: "lab",
    label: "OPERATIONS DATA",
    kind: "data",
  },
  {
    from: "main",
    to: "living",
    label: "SERVICES",
    kind: "support",
  },
  {
    from: "lab",
    to: "equip",
    label: "SCIENCE DATA",
    kind: "data",
  },
  {
    from: "fuel",
    to: "main",
    label: "FUEL LOGISTICS",
    kind: "support",
  },
];

function getStationId(
  station: Station,
) {
  return station === "MAITRI" ? 1 : 2;
}

function formatNumber(
  value: number | null | undefined,
  digits = 1,
) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(value)
  ) {
    return "—";
  }

  return value.toFixed(digits);
}

function formatInteger(
  value: number | null | undefined,
) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(value)
  ) {
    return "—";
  }

  return Math.round(value).toString();
}

function formatTimestamp(
  timestamp: string | null | undefined,
) {
  if (!timestamp) {
    return "—";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    },
  );
}

function normalizeStatus(
  status: string | null | undefined,
): S {
  const normalized =
    String(status ?? "")
      .trim()
      .toUpperCase();

  if (
    normalized === "CRITICAL" ||
    normalized === "FAILED" ||
    normalized === "FAILURE" ||
    normalized === "OFFLINE"
  ) {
    return "critical";
  }

  if (
    normalized === "WARNING" ||
    normalized === "DEGRADED"
  ) {
    return "warning";
  }

  if (
    normalized === "MONITORING" ||
    normalized === "MAINTENANCE"
  ) {
    return "monitoring";
  }

  if (
    normalized === "OPERATIONAL" ||
    normalized === "ONLINE" ||
    normalized === "NORMAL"
  ) {
    return "normal";
  }

  return "monitoring";
}

function healthToStatus(
  health: number | null | undefined,
): S {
  if (
    health === null ||
    health === undefined
  ) {
    return "monitoring";
  }

  if (health < 60) {
    return "critical";
  }

  if (health < 80) {
    return "warning";
  }

  return "normal";
}

function averageHealth(
  equipment: EquipmentResponse[],
) {
  const values = equipment
    .map((item) => item.healthScore)
    .filter(
      (value): value is number =>
        value !== null &&
        value !== undefined &&
        !Number.isNaN(value),
    );

  if (!values.length) {
    return null;
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0,
    ) / values.length
  );
}

function findEquipment(
  equipment: EquipmentResponse[],
  keywords: string[],
) {
  return equipment.find((item) => {
    const text =
      `${item.equipmentCode} ${item.equipmentName} ${item.equipmentType}`.toLowerCase();

    return keywords.some((keyword) =>
      text.includes(keyword),
    );
  });
}

export default function DigitalTwin({
  station,
}: {
  station: Station;
}) {
  const stationId = getStationId(station);

  const [selectedId, setSelectedId] =
    useState("main");

  const [layer, setLayer] =
    useState("All");

  const [viewKey, setViewKey] =
    useState(0);

  const [
    cameraCommand,
    setCameraCommand,
  ] = useState<{
    type:
      | "reset"
      | "zoomIn"
      | "zoomOut"
      | "focus";
    id: number;
    targetId?: string;
  }>({
    type: "reset",
    id: 0,
  });

  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(
      null,
    );

  const [equipment, setEquipment] =
    useState<EquipmentResponse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadTwinData = async () => {
    try {
      setError(null);

      const [
        dashboardResponse,
        equipmentResponse,
      ] = await Promise.all([
        fetch(
          `/api/dashboard/${stationId}`,
        ),
        fetch(
          `/api/equipment/${stationId}`,
        ),
      ]);

      if (
        !dashboardResponse.ok
      ) {
        throw new Error(
          `Dashboard API returned ${dashboardResponse.status}`,
        );
      }

      if (
        !equipmentResponse.ok
      ) {
        throw new Error(
          `Equipment API returned ${equipmentResponse.status}`,
        );
      }

      const dashboardData: DashboardResponse =
        await dashboardResponse.json();

      const equipmentData: EquipmentResponse[] =
        await equipmentResponse.json();

      setDashboard(dashboardData);

      setEquipment(
        Array.isArray(equipmentData)
          ? equipmentData
          : [],
      );
    } catch (err) {
      console.error(
        "Digital Twin API error:",
        err,
      );

      setError(
        "Unable to load live Digital Twin telemetry",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);

    setSelectedId("main");

    loadTwinData();

    const interval =
      window.setInterval(
        loadTwinData,
        15000,
      );

    return () =>
      window.clearInterval(
        interval,
      );
  }, [stationId]);

  const averageEquipmentHealth =
    averageHealth(equipment);

  const generator =
    findEquipment(
      equipment,
      [
        "generator",
        "gen-",
      ],
    );

  const heating =
    findEquipment(
      equipment,
      [
        "heating",
        "heater",
        "htr-",
      ],
    );

  const communications =
    findEquipment(
      equipment,
      [
        "communication",
        "satellite",
        "comm-",
      ],
    );

  const scientific =
    findEquipment(
      equipment,
      [
        "science",
        "scientific",
        "lab",
      ],
    );

  const fuel =
    dashboard?.fuel;

  const energy =
    dashboard?.energy;

  const environment =
    dashboard?.environment;

  const stationStatus =
    normalizeStatus(
      dashboard?.stationStatus,
    );

  const fuelStatus =
    fuel?.fuelPercentage !==
    null &&
    fuel?.fuelPercentage !==
      undefined
      ? fuel.fuelPercentage <
        25
        ? "critical"
        : fuel.fuelPercentage <
            40
          ? "warning"
          : "normal"
      : "monitoring";

  const equipmentStatus =
    dashboard
      ? dashboard.warningEquipment &&
        dashboard.warningEquipment >
          0
        ? "warning"
        : dashboard.operationalEquipment ===
              dashboard.totalEquipment &&
            dashboard.totalEquipment >
              0
          ? "normal"
          : "monitoring"
      : "monitoring";

  const systems: Item[] = [
    {
      id: "main",
      label: "Main Station",
      type: "Infrastructure",
      status: stationStatus,
      health:
        averageEquipmentHealth ??
        0,
      temperature:
        environment?.temperature !==
        null &&
        environment?.temperature !==
          undefined
          ? `${formatNumber(environment.temperature)} °C`
          : "—",
      power:
        energy?.totalConsumption !==
          null &&
        energy?.totalConsumption !==
          undefined
          ? `${formatNumber(energy.totalConsumption)} kW`
          : "—",
      alert:
        dashboard?.activeAlerts &&
        dashboard.activeAlerts > 0
          ? `${dashboard.activeAlerts} active alert${dashboard.activeAlerts === 1 ? "" : "s"}`
          : "None",
      lastUpdate:
        formatTimestamp(
          dashboard?.lastUpdated,
        ),
      dataSource: "LIVE BACKEND",
      x: 0,
      z: 0,
      w: 7.2,
      d: 4.2,
      h: 2.8,
    },

    {
      id: "lab",
      label: "Science Laboratory",
      type: "Laboratory",
      status:
        scientific
          ? normalizeStatus(
              scientific.status,
            )
          : "monitoring",
      health:
        scientific?.healthScore ??
        0,
      temperature:
        scientific?.temperature !==
          null &&
        scientific?.temperature !==
          undefined
          ? `${formatNumber(scientific.temperature)} °C`
          : "MODEL ONLY",
      power: "MODEL ONLY",
      alert:
        scientific
          ? scientific.status
          : "No individual telemetry",
      lastUpdate:
        formatTimestamp(
          scientific?.timestamp,
        ),
      dataSource: scientific
        ? "LIVE EQUIPMENT"
        : "MODEL ONLY",
      x: -5.8,
      z: -2.4,
      w: 4,
      d: 3.2,
      h: 2.2,
    },

    {
      id: "living",
      label: "Residential Wing",
      type: "Living",
      status: "monitoring",
      health:
        averageEquipmentHealth ??
        0,
      temperature:
        environment?.temperature !==
          null &&
        environment?.temperature !==
          undefined
          ? `${formatNumber(environment.temperature)} °C`
          : "MODEL ONLY",
      power: "MODEL ONLY",
      alert:
        "No individual residential telemetry",
      lastUpdate:
        formatTimestamp(
          environment?.timestamp,
        ),
      dataSource:
        "STATION ENVIRONMENT",
      x: 5.4,
      z: 2.2,
      w: 4.2,
      d: 3,
      h: 2.1,
    },

    {
      id: "power",
      label: "Power House",
      type: "Energy",
      status:
        energy?.generatorLoad !==
          null &&
        energy?.generatorLoad !==
          undefined
          ? energy.generatorLoad >
            90
            ? "critical"
            : energy.generatorLoad >
                80
              ? "warning"
              : "normal"
          : equipmentStatus,
      health:
        generator?.healthScore ??
        averageEquipmentHealth ??
        0,
      temperature:
        generator?.temperature !==
          null &&
        generator?.temperature !==
          undefined
          ? `${formatNumber(generator.temperature)} °C`
          : "—",
      power:
        energy?.totalGeneration !==
          null &&
        energy?.totalGeneration !==
          undefined
          ? `${formatNumber(energy.totalGeneration)} kW`
          : "—",
      alert:
        energy?.generatorLoad !==
          null &&
        energy?.generatorLoad !==
          undefined
          ? `Generator load ${formatNumber(energy.generatorLoad)}%`
          : "No generator telemetry",
      lastUpdate:
        formatTimestamp(
          energy?.timestamp,
        ),
      dataSource: "LIVE ENERGY",
      x: -2.8,
      z: 5.2,
      w: 4,
      d: 3.2,
      h: 2,
    },

    {
      id: "fuel",
      label: "Fuel Storage",
      type: "Energy",
      status:
        fuelStatus,
      health:
        fuel?.fuelPercentage ??
        0,
      temperature:
        environment?.temperature !==
          null &&
        environment?.temperature !==
          undefined
          ? `${formatNumber(environment.temperature)} °C`
          : "—",
      power: "—",
      alert:
        fuel?.fuelPercentage !==
          null &&
        fuel?.fuelPercentage !==
          undefined
          ? `${formatNumber(fuel.fuelPercentage)}% reserve`
          : "No fuel telemetry",
      lastUpdate:
        formatTimestamp(
          fuel?.timestamp,
        ),
      dataSource: "LIVE FUEL",
      x: 6.5,
      z: -4.8,
      w: 3.2,
      d: 2.8,
      h: 1.8,
    },

    {
      id: "comm",
      label: "Communications Tower",
      type: "Comms",
      status:
        communications
          ? normalizeStatus(
              communications.status,
            )
          : "monitoring",
      health:
        communications?.healthScore ??
        0,
      temperature:
        communications?.temperature !==
          null &&
        communications?.temperature !==
          undefined
          ? `${formatNumber(communications.temperature)} °C`
          : "MODEL ONLY",
      power:
        communications?.loadPercentage !==
          null &&
        communications?.loadPercentage !==
          undefined
          ? `${formatNumber(communications.loadPercentage)}% load`
          : "MODEL ONLY",
      alert:
        communications
          ? communications.status
          : "No individual telemetry",
      lastUpdate:
        formatTimestamp(
          communications?.timestamp,
        ),
      dataSource:
        communications
          ? "LIVE EQUIPMENT"
          : "MODEL ONLY",
      x: -7,
      z: 3.5,
      w: 2.7,
      d: 2.4,
      h: 1.7,
    },

    {
      id: "equip",
      label: "Science Equipment",
      type: "Scientific",
      status:
        scientific
          ? healthToStatus(
              scientific.healthScore,
            )
          : equipmentStatus,
      health:
        scientific?.healthScore ??
        averageEquipmentHealth ??
        0,
      temperature:
        scientific?.temperature !==
          null &&
        scientific?.temperature !==
          undefined
          ? `${formatNumber(scientific.temperature)} °C`
          : "—",
      power:
        scientific?.loadPercentage !==
          null &&
        scientific?.loadPercentage !==
          undefined
          ? `${formatNumber(scientific.loadPercentage)}% load`
          : "—",
      alert:
        dashboard?.warningEquipment &&
        dashboard.warningEquipment >
          0
          ? `${dashboard.warningEquipment} equipment warning${dashboard.warningEquipment === 1 ? "" : "s"}`
          : "None",
      lastUpdate:
        formatTimestamp(
          scientific?.timestamp ??
            dashboard?.lastUpdated,
        ),
      dataSource:
        scientific
          ? "LIVE EQUIPMENT"
          : "EQUIPMENT AGGREGATE",
      x: 1.8,
      z: -4.4,
      w: 3.5,
      d: 2.6,
      h: 1.7,
    },
  ];

  const selected =
    systems.find(
      (item) =>
        item.id === selectedId,
    ) ?? systems[0];

  const visible =
    useMemo(
      () =>
        systems.filter(
          (item) =>
            layer === "All" ||
            item.type === layer ||
            (layer ===
              "Infrastructure" &&
              [
                "Infrastructure",
                "Laboratory",
                "Living",
              ].includes(
                item.type,
              )),
        ),
      [layer, systems],
    );

  const visibleIds = new Set(
    visible.map((item) => item.id),
  );

  const visibleConnections =
    connections.filter(
      (connection) =>
        visibleIds.has(
          connection.from,
        ) &&
        visibleIds.has(
          connection.to,
        ),
    );

  const connectedTo =
    connections
      .filter(
        (connection) =>
          connection.from ===
            selected.id ||
          connection.to ===
            selected.id,
      )
      .map(
        (connection) =>
          systems.find(
            (item) =>
              item.id ===
              (connection.from ===
              selected.id
                ? connection.to
                : connection.from),
          ),
      )
      .filter(Boolean) as Item[];

  const reset = () => {
    setViewKey(
      (key) => key + 1,
    );

    setCameraCommand(
      (command) => ({
        type: "reset",
        id: command.id + 1,
      }),
    );
  };

  const camera = (
    type:
      | "zoomIn"
      | "zoomOut",
  ) =>
    setCameraCommand(
      (command) => ({
        type,
        id: command.id + 1,
      }),
    );

  const selectSystem = (
    id: string,
  ) => {
    setSelectedId(id);

    setCameraCommand(
      (command) => ({
        type: "focus",
        targetId: id,
        id: command.id + 1,
      }),
    );
  };

  const model = visible.map(
    ({
      temperature,
      power,
      alert,
      lastUpdate,
      dataSource,
      ...modelItem
    }) => ({
      ...modelItem,
      x: modelItem.x * 1.35,
      z: modelItem.z * 1.35,
    }),
  );

  const scaledConnections =
    visibleConnections.map(
      (connection) => ({
        ...connection,
        from: connection.from,
        to: connection.to,
      }),
    );

  return (
    <div className="page-shell twin-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            DIGITAL TWIN / {station}
          </div>

          <h1 className="page-title">
            {station} DIGITAL TWIN
          </h1>

          <p className="page-subtitle">
            Interactive station utility map ·
            orbit · zoom · pan · select systems
            to inspect live relationships
          </p>
        </div>

        <div className="twin-controls">
          <button
            className="btn-ghost"
            onClick={reset}
          >
            ↻ Reset View
          </button>

          <button
            className="btn-ghost"
            onClick={() =>
              camera("zoomIn")
            }
          >
            ＋
          </button>

          <button
            className="btn-ghost"
            onClick={() =>
              camera("zoomOut")
            }
          >
            −
          </button>

          <button
            className="btn-secondary"
            onClick={reset}
          >
            Full View
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 10,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div
          className="font-mono"
          style={{
            fontSize: 9,
            letterSpacing: "0.08em",
            color: error
              ? "#ef4444"
              : "#10b981",
          }}
        >
          ●{" "}
          {error
            ? "LIVE BACKEND ERROR"
            : loading
              ? "LOADING LIVE TELEMETRY"
              : "LIVE BACKEND · 15s REFRESH"}
        </div>

        {dashboard && (
          <div
            className="font-mono"
            style={{
              fontSize: 9,
              color: "#64748b",
              letterSpacing:
                "0.06em",
            }}
          >
            {dashboard.stationCode} ·{" "}
            {dashboard.stationLocation} ·
            {dashboard.activeAlerts ?? 0}{" "}
            ACTIVE ALERTS ·{" "}
            {dashboard.operationalEquipment ??
              0}
            /
            {dashboard.totalEquipment ??
              0}{" "}
            EQUIPMENT OPERATIONAL
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            marginBottom: 10,
            padding: "8px 12px",
            border:
              "1px solid rgba(239,68,68,0.25)",
            background:
              "rgba(239,68,68,0.05)",
            borderRadius: 6,
            color: "#ef4444",
            fontSize: 11,
          }}
        >
          {error}
        </div>
      )}

      <div className="twin-layout">
        <section className="glass twin-viewport">
          <div className="viewport-hud">
            <span>
              ANTARIS STATION DIGITAL TWIN
            </span>

            <small>
              SCHEMATIC 3D SITE MODEL ·
              LIVE UTILITY + DATA NETWORK
            </small>
          </div>

          <ThreeDStationCanvas
            key={viewKey}
            items={model}
            connections={
              scaledConnections
            }
            selectedId={selectedId}
            onSelect={selectSystem}
            interactive
            command={cameraCommand}
          />

          <div className="viewport-legend">
            <span>
              <i className="legend-dot normal" />
              Operational
            </span>

            <span>
              <i className="legend-dot monitoring" />
              Monitoring
            </span>

            <span>
              <i className="legend-dot warning" />
              Attention
            </span>

            <span>
              <i className="connection-key">
                <i className="line-swatch fuel" />
                Fuel
              </i>
            </span>

            <span className="connection-key">
              <i className="line-swatch power" />
              Power
            </span>

            <span className="connection-key">
              <i className="line-swatch data" />
              Data
            </span>
          </div>

          <div className="viewport-help">
            DRAG ORBIT · WHEEL ZOOM ·
            SHIFT/RIGHT-DRAG PAN · CLICK SELECT ·
            TOUCH DRAG
          </div>
        </section>

        <aside className="glass twin-inspector">
          <div className="section-title">
            SYSTEM INSPECTOR
          </div>

          <div className="inspector-name font-display">
            {selected.label}
          </div>

          <div
            className={`status-pill ${selected.status}`}
          >
            {selected.status.toUpperCase()}
          </div>

          <div className="health-ring">
            <strong>
              {selected.health > 0
                ? `${formatNumber(
                    selected.health,
                    0,
                  )}%`
                : "—"}
            </strong>

            <span>
              {selected.dataSource ===
              "MODEL ONLY"
                ? "MODEL"
                : "HEALTH"}
            </span>
          </div>

          {[
            [
              "Type",
              selected.type,
            ],
            [
              "Temperature",
              selected.temperature,
            ],
            [
              "Power / Load",
              selected.power,
            ],
            [
              "Alert",
              selected.alert,
            ],
            [
              "Last update",
              selected.lastUpdate,
            ],
            [
              "Data source",
              selected.dataSource,
            ],
          ].map(([key, value]) => (
            <div
              className="inspector-row"
              key={key}
            >
              <span>{key}</span>
              <b>{value}</b>
            </div>
          ))}

          <div className="section-title layer-title">
            CONNECTED SYSTEMS
          </div>

          <div className="connection-list">
            {connectedTo.map(
              (item) => (
                <button
                  className="connection-row"
                  key={item.id}
                  onClick={() =>
                    selectSystem(
                      item.id,
                    )
                  }
                >
                  <span
                    className={`connection-status ${item.status}`}
                  />

                  <span>
                    {item.label}
                  </span>

                  <small>
                    {
                      connections.find(
                        (connection) =>
                          (connection.from ===
                            selected.id &&
                            connection.to ===
                              item.id) ||
                          (connection.to ===
                            selected.id &&
                            connection.from ===
                              item.id),
                      )?.label
                    }
                  </small>
                </button>
              ),
            )}

            {!connectedTo.length && (
              <div className="panel-note">
                No active relationship in
                the current layer.
              </div>
            )}
          </div>

          <div className="section-title layer-title">
            VISUALIZATION LAYERS
          </div>

          {[
            "All",
            "Infrastructure",
            "Energy",
            "Laboratory",
            "Comms",
            "Scientific",
          ].map((item) => (
            <button
              key={item}
              className={`layer-btn ${
                layer === item
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setLayer(item)
              }
            >
              {item}
            </button>
          ))}

          <div className="concept-note">
            3D topology is a conceptual
            station representation. Telemetry
            shown as LIVE BACKEND comes from
            ANTARIS APIs; MODEL ONLY fields do
            not claim individual physical-site
            measurements.
          </div>
        </aside>
      </div>
    </div>
  );
}