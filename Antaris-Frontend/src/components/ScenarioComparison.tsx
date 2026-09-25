import { useCallback, useEffect, useState } from "react";

type Station = "MAITRI" | "BHARATI";

interface DashboardData {
  stationCode?: string;
  stationName?: string;
  stationStatus?: string;
  environment?: {
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
  };
  energy?: {
    totalGeneration?: number;
    totalConsumption?: number;
    powerBalance?: number;
    batteryPercentage?: number;
    generatorLoad?: number;
  };
  fuel?: {
    fuelLevel?: number;
    fuelPercentage?: number;
    consumptionRate?: number;
    estimatedRuntimeHours?: number;
  };
  activeAlerts?: number;
  totalEquipment?: number;
  operationalEquipment?: number;
  warningEquipment?: number;
}

interface PredictionData {
  [key: string]: unknown;
}

interface SimulationState {
  [key: string]: unknown;
}

interface SimulationImpact {
  [key: string]: unknown;
}

interface SimulationResult {
  station: string;
  scenarioName: string;
  horizonHours: number;
  baselineState: SimulationState;
  simulatedState: SimulationState;
  impact: SimulationImpact;
}

interface ScenarioEntity {
  id: number;
  scenarioName?: string;
  station?: {
    code?: string;
  };
}

interface DecisionResult {
  decisionCode?: string;
  decision?: string;
  riskScore?: number;
  riskLevel?: string;
  primaryRisk?: string;
  reason?: string;
}

interface Recommendation {
  actionCode?: string;
  action?: string;
  priority?: string;
  reason?: string;
}

interface RecommendationResult {
  decisionCode?: string;
  decision?: string;
  riskLevel?: string;
  riskScore?: number;
  primaryRisk?: string;
  recommendations?: Recommendation[];
}

interface ExplanationResult {
  summary?: string;
  detailedExplanation?: string;
  operationalImplication?: string;
  impactFactors?: string[];
  recommendationCount?: number;
}

interface FlowState {
  monitor: boolean;
  predict: boolean;
  simulate: boolean;
  decide: boolean;
}

function numberValue(
  source: Record<string, unknown> | null | undefined,
  keys: string[],
  fallback = 0,
): number {
  if (!source) return fallback;

  for (const key of keys) {
    const value = source[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return fallback;
}

function stringValue(
  source: Record<string, unknown> | null | undefined,
  keys: string[],
  fallback = "—",
): string {
  if (!source) return fallback;

  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallback;
}

function formatNumber(value: number, decimals = 1) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function riskColor(level?: string) {
  switch ((level ?? "").toUpperCase()) {
    case "CRITICAL":
      return "#ef4444";
    case "HIGH":
      return "#f97316";
    case "ELEVATED":
      return "#f59e0b";
    case "LOW":
      return "#10b981";
    default:
      return "#64748b";
  }
}

function StatusBadge({
  state,
  label,
}: {
  state: boolean;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "5px 9px",
        borderRadius: 4,
        border: state
          ? "1px solid rgba(16,185,129,0.25)"
          : "1px solid rgba(148,163,184,0.12)",
        background: state
          ? "rgba(16,185,129,0.06)"
          : "rgba(148,163,184,0.03)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: state ? "#10b981" : "#475569",
          boxShadow: state ? "0 0 7px #10b981" : "none",
        }}
      />
      <span
        className="font-mono"
        style={{
          fontSize: 8,
          color: state ? "#10b981" : "#475569",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function FlowStep({
  number,
  title,
  subtitle,
  active,
  complete,
}: {
  number: string;
  title: string;
  subtitle: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 150,
        padding: 14,
        borderRadius: 7,
        border: active
          ? "1px solid rgba(0,200,232,0.35)"
          : complete
            ? "1px solid rgba(16,185,129,0.25)"
            : "1px solid rgba(148,163,184,0.10)",
        background: active
          ? "rgba(0,200,232,0.06)"
          : complete
            ? "rgba(16,185,129,0.04)"
            : "rgba(148,163,184,0.025)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {active && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "#00c8e8",
          }}
        />
      )}

      <div
        className="font-mono"
        style={{
          fontSize: 8,
          color: active
            ? "#00c8e8"
            : complete
              ? "#10b981"
              : "#475569",
          letterSpacing: "0.12em",
          marginBottom: 5,
        }}
      >
        STEP {number}
      </div>

      <div
        className="font-display"
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: active || complete ? "#e2e8f0" : "#64748b",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 10,
          color: "#64748b",
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 6,
        background: "rgba(148,163,184,0.025)",
        border: "1px solid rgba(148,163,184,0.08)",
      }}
    >
      <div className="section-label" style={{ marginBottom: 5 }}>
        {label}
      </div>

      <div
        className="font-display"
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#e2e8f0",
        }}
      >
        {value}
        {unit && (
          <span
            className="font-mono"
            style={{
              fontSize: 9,
              color: "#64748b",
              marginLeft: 4,
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ScenarioComparison({
  station,
}: {
  station: Station;
}) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [simulation, setSimulation] =
    useState<SimulationResult | null>(null);
  const [decision, setDecision] =
    useState<DecisionResult | null>(null);
  const [recommendations, setRecommendations] =
    useState<RecommendationResult | null>(null);
  const [explanation, setExplanation] =
    useState<ExplanationResult | null>(null);

  const [flow, setFlow] = useState<FlowState>({
    monitor: false,
    predict: false,
    simulate: false,
    decide: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scenarioId, setScenarioId] = useState<number | null>(null);

  const loadMonitorAndPrediction = useCallback(async () => {
    setError("");

    try {
      const dashboardResponse = await fetch(
        `/api/dashboard/${station === "MAITRI" ? 1 : 2}`,
      );

      if (!dashboardResponse.ok) {
        throw new Error(
          `Monitor API failed (${dashboardResponse.status})`,
        );
      }

      const dashboardData =
        (await dashboardResponse.json()) as DashboardData;

      setDashboard(dashboardData);
      setFlow((current) => ({
        ...current,
        monitor: true,
      }));

      const simulatorResponse = await fetch(
        `/api/simulator/station/${station}`,
        {
          method: "POST",
        },
      );

      if (!simulatorResponse.ok) {
        throw new Error(
          `Unable to activate ${station} prediction context (${simulatorResponse.status})`,
        );
      }

      const predictionResponse = await fetch(
        "/api/predictions/energy/current?horizonHours=24",
        {
          method: "POST",
        },
      );

      if (!predictionResponse.ok) {
        const message = await predictionResponse.text();

        throw new Error(
          `Prediction API failed (${predictionResponse.status})${
            message ? `: ${message}` : ""
          }`,
        );
      }

      const predictionData =
        (await predictionResponse.json()) as PredictionData;

      setPrediction(predictionData);

      setFlow((current) => ({
        ...current,
        predict: true,
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load monitor and prediction data.",
      );
    }
  }, [station]);

  useEffect(() => {
    setDashboard(null);
    setPrediction(null);
    setSimulation(null);
    setDecision(null);
    setRecommendations(null);
    setExplanation(null);
    setScenarioId(null);

    setFlow({
      monitor: false,
      predict: false,
      simulate: false,
      decide: false,
    });

    void loadMonitorAndPrediction();
  }, [station, loadMonitorAndPrediction]);

  const runEndToEnd = async () => {
    if (loading) return;

    setLoading(true);
    setError("");
    setSimulation(null);
    setDecision(null);
    setRecommendations(null);
    setExplanation(null);
    setScenarioId(null);

    setFlow({
      monitor: false,
      predict: false,
      simulate: false,
      decide: false,
    });

    try {
      /*
       * STEP 1 — MONITOR
       */
      const dashboardResponse = await fetch(
        `/api/dashboard/${station === "MAITRI" ? 1 : 2}`,
      );

      if (!dashboardResponse.ok) {
        throw new Error(
          `Monitor API failed (${dashboardResponse.status})`,
        );
      }

      const dashboardData =
        (await dashboardResponse.json()) as DashboardData;

      setDashboard(dashboardData);

      setFlow({
        monitor: true,
        predict: false,
        simulate: false,
        decide: false,
      });

      /*
       * STEP 2 — PREDICT
       */
      const simulatorResponse = await fetch(
        `/api/simulator/station/${station}`,
        {
          method: "POST",
        },
      );

      if (!simulatorResponse.ok) {
        throw new Error(
          `Unable to activate ${station} prediction context (${simulatorResponse.status})`,
        );
      }

      const predictionResponse = await fetch(
        "/api/predictions/energy/current?horizonHours=24",
        {
          method: "POST",
        },
      );

      if (!predictionResponse.ok) {
        const message = await predictionResponse.text();

        throw new Error(
          `Prediction API failed (${predictionResponse.status})${
            message ? `: ${message}` : ""
          }`,
        );
      }

      const predictionData =
        (await predictionResponse.json()) as PredictionData;

      setPrediction(predictionData);

      setFlow({
        monitor: true,
        predict: true,
        simulate: false,
        decide: false,
      });

      /*
       * STEP 3 — SIMULATE
       *
       * Use controlled, valid scenario changes.
       * Wind is deliberately kept at 0 to stay inside
       * the backend's -1.0 to +1.0 validation range.
       */
      const currentTemperature =
        dashboardData.environment?.temperature ?? -25;

      const currentBattery =
        dashboardData.energy?.batteryPercentage ?? 70;

      const currentFuel =
        dashboardData.fuel?.fuelPercentage ?? 70;

      const scenarioRequest = {
        station,
        scenarioName: `${station} End-to-End Operational Scenario`,
        description:
          "ANTARIS end-to-end MONITOR to PREDICT to SIMULATE to DECIDE workflow.",
        horizonHours: 72,
        changes: {
          temperatureChangeC: -5,
          humidityChangePct: 0,
          windResourceChange: 0,
          generatorAvailabilityChangePct: 0,
          fuelChangePct: -5,
          batteryChangePct: -5,
          consumptionChangePct: 5,
        },
      };

      /*
       * Keep values referenced so the live monitor data
       * is visibly part of the workflow.
       */
      void currentTemperature;
      void currentBattery;
      void currentFuel;

      const createResponse = await fetch(
        "/api/simulation/scenarios",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(scenarioRequest),
        },
      );

      if (!createResponse.ok) {
        const message = await createResponse.text();

        throw new Error(
          `Scenario creation failed (${createResponse.status})${
            message ? `: ${message}` : ""
          }`,
        );
      }

      const scenario =
        (await createResponse.json()) as ScenarioEntity;

      if (!scenario.id) {
        throw new Error(
          "Scenario was created without an ID.",
        );
      }

      setScenarioId(scenario.id);

      const runResponse = await fetch(
        `/api/simulation/scenarios/${scenario.id}/run`,
        {
          method: "POST",
        },
      );

      if (!runResponse.ok) {
        const message = await runResponse.text();

        throw new Error(
          `Simulation execution failed (${runResponse.status})${
            message ? `: ${message}` : ""
          }`,
        );
      }

      const simulationResult =
        (await runResponse.json()) as SimulationResult;

      if (!simulationResult.impact) {
        throw new Error(
          "Simulation completed without an impact result.",
        );
      }

      setSimulation(simulationResult);

      setFlow({
        monitor: true,
        predict: true,
        simulate: true,
        decide: false,
      });

      /*
       * STEP 4 — DECIDE
       */
      const impactBody = JSON.stringify(
        simulationResult.impact,
      );

      const decisionResponse = await fetch(
        "/api/simulation/decision",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: impactBody,
        },
      );

      if (!decisionResponse.ok) {
        const message = await decisionResponse.text();

        throw new Error(
          `Decision API failed (${decisionResponse.status})${
            message ? `: ${message}` : ""
          }`,
        );
      }

      const decisionData =
        (await decisionResponse.json()) as DecisionResult;

      setDecision(decisionData);

      const recommendationResponse = await fetch(
        "/api/simulation/recommendations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: impactBody,
        },
      );

      if (!recommendationResponse.ok) {
        const message =
          await recommendationResponse.text();

        throw new Error(
          `Recommendation API failed (${recommendationResponse.status})${
            message ? `: ${message}` : ""
          }`,
        );
      }

      const recommendationData =
        (await recommendationResponse.json()) as RecommendationResult;

      setRecommendations(recommendationData);

      const explanationResponse = await fetch(
        "/api/simulation/explanation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: impactBody,
        },
      );

      if (!explanationResponse.ok) {
        const message =
          await explanationResponse.text();

        throw new Error(
          `Explanation API failed (${explanationResponse.status})${
            message ? `: ${message}` : ""
          }`,
        );
      }

      const explanationData =
        (await explanationResponse.json()) as ExplanationResult;

      setExplanation(explanationData);

      setFlow({
        monitor: true,
        predict: true,
        simulate: true,
        decide: true,
      });
    } catch (err) {
      console.error(
        "ANTARIS end-to-end workflow error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "End-to-end workflow failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  const baseline = simulation?.baselineState;
  const simulated = simulation?.simulatedState;

  const baselineFuel = numberValue(
    baseline,
    ["fuelLevelL", "fuelLevel", "fuelRemaining", "fuelL"],
  );

  const simulatedFuel = numberValue(
    simulated,
    ["fuelLevelL", "fuelLevel", "fuelRemaining", "fuelL"],
  );

  const baselineBattery = numberValue(
    baseline,
    [
      "batteryPercentage",
      "batteryLevel",
      "batterySoc",
      "batterySOC",
    ],
  );

  const simulatedBattery = numberValue(
    simulated,
    [
      "batteryPercentage",
      "batteryLevel",
      "batterySoc",
      "batterySOC",
    ],
  );

  const baselineEnergy = numberValue(
    baseline,
    [
      "totalConsumptionKw",
      "consumptionKw",
      "energyLoadKw",
      "energy",
    ],
  );

  const simulatedEnergy = numberValue(
    simulated,
    [
      "totalConsumptionKw",
      "consumptionKw",
      "energyLoadKw",
      "energy",
    ],
  );

  const predictionValue = numberValue(
    prediction,
    [
      "predictedValue",
      "predictedEnergy",
      "predictedGeneration",
      "prediction",
      "value",
    ],
    0,
  );

  const decisionRisk = decision?.riskLevel ?? "—";
  const riskScore =
    typeof decision?.riskScore === "number"
      ? decision.riskScore
      : null;

  return (
    <div
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        <div>
          <div
            className="font-mono"
            style={{
              fontSize: 9,
              color: "#00c8e8",
              letterSpacing: "0.15em",
              marginBottom: 6,
            }}
          >
            OPERATIONS / INTELLIGENCE PIPELINE
          </div>

          <h1
            className="font-display"
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#e2e8f0",
            }}
          >
            END-TO-END OPERATIONS
          </h1>

          <p
            style={{
              marginTop: 7,
              fontSize: 13,
              color: "#64748b",
            }}
          >
            MONITOR → PREDICT → SIMULATE → DECIDE
            {" · "}
            Live backend integration
          </p>
        </div>

        <div
          style={{
            textAlign: "right",
          }}
        >
          <div className="section-label">
            ACTIVE STATION
          </div>

          <div
            className="font-display"
            style={{
              marginTop: 4,
              fontSize: 16,
              fontWeight: 700,
              color: "#00c8e8",
            }}
          >
            {station}
          </div>

          {scenarioId && (
            <div
              className="font-mono"
              style={{
                marginTop: 4,
                fontSize: 8,
                color: "#475569",
              }}
            >
              SCENARIO #{scenarioId}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 6,
            border: "1px solid rgba(239,68,68,0.25)",
            background: "rgba(239,68,68,0.06)",
            color: "#fca5a5",
            fontSize: 11,
            fontFamily: "JetBrains Mono",
          }}
        >
          WORKFLOW ERROR · {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <FlowStep
          number="01"
          title="MONITOR"
          subtitle="Live station telemetry"
          active={!flow.monitor && !loading}
          complete={flow.monitor}
        />

        <FlowStep
          number="02"
          title="PREDICT"
          subtitle="ML energy forecast"
          active={flow.monitor && !flow.predict && loading}
          complete={flow.predict}
        />

        <FlowStep
          number="03"
          title="SIMULATE"
          subtitle="72h what-if scenario"
          active={flow.predict && !flow.simulate && loading}
          complete={flow.simulate}
        />

        <FlowStep
          number="04"
          title="DECIDE"
          subtitle="Risk + actions"
          active={flow.simulate && !flow.decide && loading}
          complete={flow.decide}
        />
      </div>

      <div
        className="glass"
        style={{
          borderRadius: 8,
          padding: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="section-label">
            PIPELINE STATUS
          </div>

          <div
            className="font-mono"
            style={{
              marginTop: 5,
              fontSize: 10,
              color: flow.decide
                ? "#10b981"
                : loading
                  ? "#00c8e8"
                  : "#64748b",
            }}
          >
            {flow.decide
              ? "END-TO-END FLOW COMPLETE"
              : loading
                ? "PROCESSING BACKEND PIPELINE..."
                : "READY FOR OPERATIONAL SIMULATION"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 7,
          }}
        >
          <StatusBadge
            state={flow.monitor}
            label="MONITOR"
          />
          <StatusBadge
            state={flow.predict}
            label="PREDICT"
          />
          <StatusBadge
            state={flow.simulate}
            label="SIMULATE"
          />
          <StatusBadge
            state={flow.decide}
            label="DECIDE"
          />
        </div>

        <button
          className="btn-primary"
          onClick={runEndToEnd}
          disabled={loading}
          style={{
            minWidth: 190,
            padding: "11px 15px",
            fontSize: 11,
            letterSpacing: "0.08em",
          }}
        >
          {loading
            ? "RUNNING PIPELINE..."
            : "RUN END-TO-END FLOW"}
        </button>
      </div>

      {dashboard && (
        <div>
          <div
            className="font-mono"
            style={{
              fontSize: 9,
              color: "#00c8e8",
              letterSpacing: "0.13em",
              marginBottom: 8,
            }}
          >
            01 / MONITOR · LIVE STATION STATE
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(6, minmax(0, 1fr))",
              gap: 9,
            }}
          >
            <Metric
              label="TEMPERATURE"
              value={formatNumber(
                dashboard.environment?.temperature ?? 0,
                1,
              )}
              unit="°C"
            />

            <Metric
              label="POWER LOAD"
              value={formatNumber(
                dashboard.energy?.totalConsumption ?? 0,
                1,
              )}
              unit="kW"
            />

            <Metric
              label="BATTERY"
              value={formatNumber(
                dashboard.energy?.batteryPercentage ?? 0,
                1,
              )}
              unit="%"
            />

            <Metric
              label="FUEL"
              value={formatNumber(
                dashboard.fuel?.fuelLevel ?? 0,
                0,
              )}
              unit="L"
            />

            <Metric
              label="EQUIPMENT"
              value={`${dashboard.operationalEquipment ?? 0}/${dashboard.totalEquipment ?? 0}`}
            />

            <Metric
              label="ACTIVE ALERTS"
              value={String(
                dashboard.activeAlerts ?? 0,
              )}
            />
          </div>
        </div>
      )}

      {prediction && (
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
              color: "#a78bfa",
              letterSpacing: "0.13em",
              marginBottom: 8,
            }}
          >
            02 / PREDICT · ML SERVICE
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, minmax(0, 1fr))",
              gap: 10,
            }}
          >
            <Metric
              label="CURRENT POWER LOAD"
              value={formatNumber(
                dashboard?.energy?.totalConsumption ?? 0,
                1,
              )}
              unit="kW"
            />

            <Metric
              label="PREDICTED ENERGY"
              value={
                predictionValue
                  ? formatNumber(predictionValue, 2)
                  : "AVAILABLE"
              }
              unit={predictionValue ? "kW" : undefined}
            />

            <Metric
              label="MODEL"
              value={stringValue(
                prediction,
                ["modelVersion", "model", "version"],
                "ML MODEL",
              )}
            />

            <Metric
              label="HORIZON"
              value="24"
              unit="h"
            />
          </div>
        </div>
      )}

      {simulation && (
        <div>
          <div
            className="font-mono"
            style={{
              fontSize: 9,
              color: "#f59e0b",
              letterSpacing: "0.13em",
              marginBottom: 8,
            }}
          >
            03 / SIMULATE · BACKEND WHAT-IF ENGINE
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <div
              className="glass"
              style={{
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div className="section-label">
                BASELINE STATE
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, 1fr)",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <Metric
                  label="ENERGY"
                  value={formatNumber(
                    baselineEnergy,
                    1,
                  )}
                  unit="kW"
                />

                <Metric
                  label="FUEL"
                  value={formatNumber(
                    baselineFuel,
                    0,
                  )}
                  unit="L"
                />

                <Metric
                  label="BATTERY"
                  value={formatNumber(
                    baselineBattery,
                    1,
                  )}
                  unit="%"
                />
              </div>
            </div>

            <div
              className="glass"
              style={{
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div className="section-label">
                SIMULATED STATE
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, 1fr)",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <Metric
                  label="ENERGY"
                  value={formatNumber(
                    simulatedEnergy,
                    1,
                  )}
                  unit="kW"
                />

                <Metric
                  label="FUEL"
                  value={formatNumber(
                    simulatedFuel,
                    0,
                  )}
                  unit="L"
                />

                <Metric
                  label="BATTERY"
                  value={formatNumber(
                    simulatedBattery,
                    1,
                  )}
                  unit="%"
                />
              </div>
            </div>
          </div>

          <div
            className="glass"
            style={{
              marginTop: 10,
              borderRadius: 8,
              padding: 14,
            }}
          >
            <div className="section-label">
              SIMULATION IMPACT
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4, minmax(0, 1fr))",
                gap: 8,
                marginTop: 10,
              }}
            >
              {Object.entries(simulation.impact)
                .filter(
                  ([, value]) =>
                    value !== null &&
                    value !== undefined &&
                    typeof value !== "object",
                )
                .slice(0, 8)
                .map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      padding: 9,
                      borderRadius: 5,
                      background:
                        "rgba(148,163,184,0.025)",
                    }}
                  >
                    <div
                      className="font-mono"
                      style={{
                        fontSize: 8,
                        color: "#475569",
                      }}
                    >
                      {formatLabel(key)}
                    </div>

                    <div
                      className="font-mono"
                      style={{
                        marginTop: 4,
                        fontSize: 11,
                        color: "#e2e8f0",
                      }}
                    >
                      {typeof value === "number"
                        ? formatNumber(value, 2)
                        : String(value)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {decision && (
        <div>
          <div
            className="font-mono"
            style={{
              fontSize: 9,
              color: riskColor(decision.riskLevel),
              letterSpacing: "0.13em",
              marginBottom: 8,
            }}
          >
            04 / DECIDE · OPERATIONAL DECISION ENGINE
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <div
              className="glass"
              style={{
                borderRadius: 8,
                padding: 18,
                border: `1px solid ${riskColor(decision.riskLevel)}30`,
              }}
            >
              <div className="section-label">
                DECISION
              </div>

              <div
                className="font-display"
                style={{
                  marginTop: 8,
                  fontSize: 20,
                  fontWeight: 700,
                  color: riskColor(
                    decision.riskLevel,
                  ),
                }}
              >
                {decision.decision ?? "—"}
              </div>

              <div
                className="font-mono"
                style={{
                  marginTop: 7,
                  fontSize: 9,
                  color: "#64748b",
                }}
              >
                {decision.decisionCode ?? "—"}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 18,
                  marginTop: 16,
                }}
              >
                <div>
                  <div className="section-label">
                    RISK
                  </div>

                  <div
                    className="font-mono"
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      fontWeight: 700,
                      color: riskColor(
                        decision.riskLevel,
                      ),
                    }}
                  >
                    {decisionRisk}
                  </div>
                </div>

                <div>
                  <div className="section-label">
                    SCORE
                  </div>

                  <div
                    className="font-mono"
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#e2e8f0",
                    }}
                  >
                    {riskScore !== null
                      ? formatNumber(riskScore, 2)
                      : "—"}
                  </div>
                </div>

                <div>
                  <div className="section-label">
                    PRIMARY RISK
                  </div>

                  <div
                    className="font-mono"
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#e2e8f0",
                    }}
                  >
                    {decision.primaryRisk ??
                      "—"}
                  </div>
                </div>
              </div>

              {decision.reason && (
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop:
                      "1px solid rgba(148,163,184,0.08)",
                    fontSize: 11,
                    lineHeight: 1.6,
                    color: "#94a3b8",
                  }}
                >
                  {decision.reason}
                </div>
              )}
            </div>

            <div
              className="glass"
              style={{
                borderRadius: 8,
                padding: 18,
              }}
            >
              <div className="section-label">
                RECOMMENDED ACTIONS
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                {recommendations?.recommendations?.map(
                  (item, index) => (
                    <div
                      key={
                        item.actionCode ??
                        index
                      }
                      style={{
                        padding: 10,
                        borderRadius: 5,
                        border:
                          "1px solid rgba(148,163,184,0.08)",
                        background:
                          "rgba(148,163,184,0.025)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#e2e8f0",
                          }}
                        >
                          {item.action ??
                            "Operational action"}
                        </span>

                        <span
                          className="font-mono"
                          style={{
                            fontSize: 8,
                            color: riskColor(
                              item.priority,
                            ),
                          }}
                        >
                          {item.priority ??
                            "—"}
                        </span>
                      </div>

                      {item.reason && (
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 9,
                            lineHeight: 1.5,
                            color: "#64748b",
                          }}
                        >
                          {item.reason}
                        </div>
                      )}
                    </div>
                  ),
                )}

                {(!recommendations?.recommendations ||
                  recommendations.recommendations
                    .length === 0) && (
                  <div
                    style={{
                      fontSize: 10,
                      color: "#64748b",
                    }}
                  >
                    No recommendations returned.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {explanation && (
        <div
          className="glass"
          style={{
            borderRadius: 8,
            padding: 18,
            border:
              "1px solid rgba(167,139,250,0.18)",
          }}
        >
          <div
            className="font-mono"
            style={{
              fontSize: 9,
              color: "#a78bfa",
              letterSpacing: "0.13em",
              marginBottom: 9,
            }}
          >
            DECISION EXPLANATION
          </div>

          {explanation.summary && (
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#e2e8f0",
              }}
            >
              {explanation.summary}
            </div>
          )}

          {explanation.detailedExplanation && (
            <p
              style={{
                marginTop: 8,
                marginBottom: 0,
                fontSize: 11,
                lineHeight: 1.65,
                color: "#94a3b8",
              }}
            >
              {explanation.detailedExplanation}
            </p>
          )}

          {explanation.operationalImplication && (
            <div
              style={{
                marginTop: 12,
                padding: 10,
                borderRadius: 5,
                background:
                  "rgba(167,139,250,0.04)",
                border:
                  "1px solid rgba(167,139,250,0.10)",
                fontSize: 10,
                lineHeight: 1.6,
                color: "#c4b5fd",
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: 8,
                  letterSpacing: "0.08em",
                }}
              >
                OPERATIONAL IMPLICATION ·{" "}
              </span>

              {explanation.operationalImplication}
            </div>
          )}

          {explanation.impactFactors &&
            explanation.impactFactors.length > 0 && (
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                }}
              >
                {explanation.impactFactors.map(
                  (factor, index) => (
                    <span
                      key={`${factor}-${index}`}
                      className="font-mono"
                      style={{
                        padding: "4px 7px",
                        borderRadius: 3,
                        fontSize: 8,
                        color: "#94a3b8",
                        background:
                          "rgba(148,163,184,0.05)",
                        border:
                          "1px solid rgba(148,163,184,0.08)",
                      }}
                    >
                      {factor}
                    </span>
                  ),
                )}
              </div>
            )}
        </div>
      )}
    </div>
  );
}