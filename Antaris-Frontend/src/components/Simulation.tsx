import { useEffect, useMemo, useState } from "react";

type Station = "MAITRI" | "BHARATI";

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

interface ScenarioChangeRequest {
  temperatureChangeC: number;
  humidityChangePct: number;
  windResourceChange: number;
  generatorAvailabilityChangePct: number;
  fuelChangePct: number;
  batteryChangePct: number;
  consumptionChangePct: number;
}

interface ScenarioRequest {
  station: Station;
  scenarioName: string;
  description: string;
  horizonHours: number;
  changes: ScenarioChangeRequest;
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
  station?: {
    code?: string;
  };
  scenarioName?: string;
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

const riskColors = {
  LOW: "#10b981",
  ELEVATED: "#f59e0b",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

function numberValue(
  state: SimulationState | null | undefined,
  keys: string[],
  fallback = 0,
): number {
  if (!state) return fallback;

  for (const key of keys) {
    const value = state[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return fallback;
}

function stringValue(
  state: SimulationState | null | undefined,
  keys: string[],
  fallback = "—",
): string {
  if (!state) return fallback;

  for (const key of keys) {
    const value = state[key];

    if (
      typeof value === "string" &&
      value.trim().length > 0
    ) {
      return value;
    }
  }

  return fallback;
}

function formatNumber(
  value: number,
  decimals = 0,
): string {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function getRiskFromState(
  state: SimulationState | null,
): "LOW" | "ELEVATED" | "HIGH" | "CRITICAL" {
  if (!state) return "LOW";

  const explicitRisk = stringValue(
    state,
    [
      "overallRisk",
      "risk",
      "riskLevel",
      "resupplyRisk",
      "status",
    ],
    "",
  ).toUpperCase();

  if (
    explicitRisk === "CRITICAL" ||
    explicitRisk === "HIGH" ||
    explicitRisk === "ELEVATED" ||
    explicitRisk === "LOW"
  ) {
    return explicitRisk;
  }

  const fuel = numberValue(
    state,
    [
      "fuelLevelL",
      "fuelLevel",
      "fuelRemaining",
      "fuelL",
    ],
    100000,
  );

  const battery = numberValue(
    state,
    [
      "batteryPercentage",
      "batteryLevel",
      "batterySoc",
      "batterySOC",
    ],
    100,
  );

  const consumption = numberValue(
    state,
    [
      "totalConsumptionKw",
      "consumptionKw",
      "energyLoadKw",
      "energy",
    ],
    0,
  );

  if (fuel < 1000 || battery < 20 || consumption > 1000) {
    return "CRITICAL";
  }

  if (fuel < 2500 || battery < 35 || consumption > 500) {
    return "HIGH";
  }

  if (fuel < 4000 || battery < 60 || consumption > 300) {
    return "ELEVATED";
  }

  return "LOW";
}

function getImpactEntries(
  impact: SimulationImpact | null,
): Array<{
  label: string;
  value: string;
}> {
  if (!impact) return [];

  return Object.entries(impact)
    .filter(
      ([, value]) =>
        value !== null &&
        value !== undefined &&
        typeof value !== "object",
    )
    .map(([key, value]) => ({
      label: formatLabel(key),
      value:
        typeof value === "number"
          ? formatNumber(value, 2)
          : String(value),
    }));
}

function formatLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

function buildScenarioRequest(
  station: Station,
  params: Params,
): ScenarioRequest {
  const temperatureChange =
    params.temperature - defaults.temperature;

  const windResourceChange =
    params.windSpeed === defaults.windSpeed
      ? 0
      : (params.windSpeed - defaults.windSpeed) /
        Math.max(defaults.windSpeed, 1);

  const generatorAvailabilityChangePct =
    params.gen2Status === "FAILURE"
      ? -50
      : 0;

  const fuelChangePct =
    defaults.fuelLevel === 0
      ? 0
      : ((params.fuelLevel - defaults.fuelLevel) /
          defaults.fuelLevel) *
        100;

  const batteryChangePct =
    params.batteryLevel - defaults.batteryLevel;

  const consumptionChangePct =
    params.energyDemand - defaults.energyDemand;

  return {
    station,
    scenarioName: `${station} What-If Simulation`,
    description:
      "ANTARIS operational what-if simulation generated from the mission control interface.",
    horizonHours: params.duration,
    changes: {
      temperatureChangeC:
        temperatureChange,

      humidityChangePct: 0,

      windResourceChange:
        windResourceChange,

      generatorAvailabilityChangePct:
        generatorAvailabilityChangePct,

      fuelChangePct:
        fuelChangePct,

      batteryChangePct:
        batteryChangePct,

      consumptionChangePct:
        consumptionChangePct,
    },
  };
}

function getRecommendations(
  params: Params,
  result: SimulationResult,
): string[] {
  const recommendations: string[] = [];

  const simulated = result.simulatedState;

  const fuel = numberValue(
    simulated,
    [
      "fuelLevelL",
      "fuelLevel",
      "fuelRemaining",
      "fuelL",
    ],
    params.fuelLevel,
  );

  const battery = numberValue(
    simulated,
    [
      "batteryPercentage",
      "batteryLevel",
      "batterySoc",
      "batterySOC",
    ],
    params.batteryLevel,
  );

  const energy = numberValue(
    simulated,
    [
      "totalConsumptionKw",
      "consumptionKw",
      "energyLoadKw",
      "energy",
    ],
    0,
  );

  const risk = getRiskFromState(simulated);

  if (params.gen2Status === "FAILURE") {
    recommendations.push(
      "Generator G-02 failure scenario detected. Review load allocation and maintain Generator G-01 availability.",
    );
  }

  if (params.temperature < -30) {
    recommendations.push(
      "Extreme temperature scenario detected. Review heating demand and emergency fuel reserve requirements.",
    );
  }

  if (fuel < 3000) {
    recommendations.push(
      "Simulated fuel reserve is low. Consider resupply planning and non-critical load reduction.",
    );
  }

  if (battery < 55) {
    recommendations.push(
      "Simulated battery state is reduced. Preserve battery capacity for emergency generation interruptions.",
    );
  }

  if (energy > 0) {
    recommendations.push(
      `Simulated energy demand is ${formatNumber(
        energy,
        1,
      )} kW. Review generation capacity against projected consumption.`,
    );
  }

  if (risk === "CRITICAL") {
    recommendations.push(
      "Simulation indicates a critical operational condition. Review the scenario before applying it to operational planning.",
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Scenario remains within the evaluated operating envelope. Continue monitoring the affected resources.",
    );
  }

  return recommendations.slice(0, 4);
}

export default function Simulation({
  station,
}: {
  station: Station;
}) {
  const [params, setParams] =
    useState<Params>(defaults);

  const [running, setRunning] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [result, setResult] =
    useState<SimulationResult | null>(null);

  const [scenarioId, setScenarioId] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  const [stationLoading, setStationLoading] =
    useState(false);

  useEffect(() => {
    setResult(null);
    setScenarioId(null);
    setError("");
  }, [station]);

  const baseline = result?.baselineState ?? null;
  const simulated = result?.simulatedState ?? null;

  const baselineRisk =
    getRiskFromState(baseline);

  const simulatedRisk =
    getRiskFromState(simulated);

  const baselineEnergy = numberValue(
    baseline,
    [
      "totalConsumptionKw",
      "consumptionKw",
      "energyLoadKw",
      "energy",
    ],
    0,
  );

  const simulatedEnergy = numberValue(
    simulated,
    [
      "totalConsumptionKw",
      "consumptionKw",
      "energyLoadKw",
      "energy",
    ],
    0,
  );

  const baselineFuel = numberValue(
    baseline,
    [
      "fuelLevelL",
      "fuelLevel",
      "fuelRemaining",
      "fuelL",
    ],
    0,
  );

  const simulatedFuel = numberValue(
    simulated,
    [
      "fuelLevelL",
      "fuelLevel",
      "fuelRemaining",
      "fuelL",
    ],
    0,
  );

  const baselineBattery = numberValue(
    baseline,
    [
      "batteryPercentage",
      "batteryLevel",
      "batterySoc",
      "batterySOC",
    ],
    0,
  );

  const simulatedBattery = numberValue(
    simulated,
    [
      "batteryPercentage",
      "batteryLevel",
      "batterySoc",
      "batterySOC",
    ],
    0,
  );

  const impactEntries = useMemo(
    () => getImpactEntries(result?.impact ?? null),
    [result],
  );

  const handleRun = async () => {
    if (running) return;

    setRunning(true);
    setProgress(10);
    setResult(null);
    setScenarioId(null);
    setError("");

    try {
      /*
       * The simulation engine evaluates the station associated
       * with the saved scenario. We switch the simulator station
       * first so the backend scenario is evaluated against the
       * selected ANTARIS station.
       */
      setStationLoading(true);

      const stationResponse = await fetch(
        `/api/simulator/station/${station}`,
        {
          method: "POST",
        },
      );

      if (!stationResponse.ok) {
        throw new Error(
          `Unable to activate ${station} simulation context (${stationResponse.status})`,
        );
      }

      setStationLoading(false);
      setProgress(25);

      const scenarioRequest =
        buildScenarioRequest(
          station,
          params,
        );

      const createResponse = await fetch(
        "/api/simulation/scenarios",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            scenarioRequest,
          ),
        },
      );

      if (!createResponse.ok) {
        const message =
          await createResponse.text();

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
          "Simulation scenario was created without an ID.",
        );
      }

      setScenarioId(scenario.id);
      setProgress(55);

      const runResponse = await fetch(
        `/api/simulation/scenarios/${scenario.id}/run`,
        {
          method: "POST",
        },
      );

      if (!runResponse.ok) {
        const message =
          await runResponse.text();

        throw new Error(
          `Simulation execution failed (${runResponse.status})${
            message ? `: ${message}` : ""
          }`,
        );
      }

      const simulationResult =
        (await runResponse.json()) as SimulationResult;

      setProgress(100);
      setResult(simulationResult);
    } catch (err) {
      console.error(
        "ANTARIS simulation integration error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to run simulation.",
      );
    } finally {
      setStationLoading(false);

      window.setTimeout(() => {
        setRunning(false);
        setProgress(0);
      }, 250);
    }
  };

  const reset = () => {
    setParams(defaults);
    setResult(null);
    setScenarioId(null);
    setError("");
  };

  const temperatureDelta =
    params.temperature -
    defaults.temperature;

  const genFailed =
    params.gen2Status === "FAILURE";

  const recommendations = result
    ? getRecommendations(
        params,
        result,
      )
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
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
            WHAT-IF SIMULATION
          </h1>

          <p
            style={{
              fontSize: 13,
              color: "#64748b",
            }}
          >
            Model station behavior before making
            operational decisions · Real backend
            simulation engine
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 5,
          }}
        >
          <div
            className="font-mono"
            style={{
              fontSize: 9,
              color: "#00c8e8",
              letterSpacing: "0.12em",
            }}
          >
            ACTIVE STATION
          </div>

          <div
            className="font-display"
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#e2e8f0",
            }}
          >
            {station}
          </div>

          {scenarioId && (
            <div
              className="font-mono"
              style={{
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
            border:
              "1px solid rgba(239,68,68,0.25)",
            background:
              "rgba(239,68,68,0.06)",
            color: "#fca5a5",
            fontSize: 11,
            fontFamily: "JetBrains Mono",
          }}
        >
          SIMULATION ERROR · {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "290px 1fr",
          gap: 14,
          alignItems: "start",
        }}
      >
        <div
          className="glass-strong"
          style={{
            borderRadius: 8,
            padding: 20,
            position: "sticky",
            top: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div className="section-label">
              Scenario Parameters
            </div>

            <button
              onClick={reset}
              style={{
                fontSize: 10,
                color: "#475569",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>

          <div
            style={{
              padding: "8px 10px",
              marginBottom: 16,
              borderRadius: 5,
              background:
                "rgba(0,200,232,0.04)",
              border:
                "1px solid rgba(0,200,232,0.12)",
            }}
          >
            <div
              className="font-mono"
              style={{
                fontSize: 8,
                color: "#475569",
              }}
            >
              SIMULATION TARGET
            </div>

            <div
              className="font-display"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#00c8e8",
                marginTop: 3,
              }}
            >
              {station}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <SliderParam
              label="Temperature"
              value={params.temperature}
              min={-50}
              max={-5}
              unit=" °C"
              baseline={defaults.temperature}
              onChange={(v) =>
                setParams((p) => ({
                  ...p,
                  temperature: v,
                }))
              }
              valueColor={
                params.temperature < -35
                  ? "#ef4444"
                  : params.temperature < -30
                    ? "#f59e0b"
                    : "#e2e8f0"
              }
            />

            <SliderParam
              label="Wind Speed"
              value={params.windSpeed}
              min={0}
              max={80}
              unit=" km/h"
              baseline={defaults.windSpeed}
              onChange={(v) =>
                setParams((p) => ({
                  ...p,
                  windSpeed: v,
                }))
              }
              valueColor={
                params.windSpeed > 50
                  ? "#ef4444"
                  : params.windSpeed > 30
                    ? "#f59e0b"
                    : "#e2e8f0"
              }
            />

            <SliderParam
              label="Crew Size"
              value={params.crew}
              min={10}
              max={60}
              unit=""
              baseline={defaults.crew}
              onChange={(v) =>
                setParams((p) => ({
                  ...p,
                  crew: v,
                }))
              }
            />

            <SliderParam
              label="Battery Level"
              value={params.batteryLevel}
              min={10}
              max={100}
              unit="%"
              baseline={defaults.batteryLevel}
              onChange={(v) =>
                setParams((p) => ({
                  ...p,
                  batteryLevel: v,
                }))
              }
              valueColor={
                params.batteryLevel < 30
                  ? "#ef4444"
                  : params.batteryLevel < 60
                    ? "#f59e0b"
                    : "#10b981"
              }
            />

            <SliderParam
              label="Fuel Level"
              value={params.fuelLevel}
              min={500}
              max={10000}
              unit=" L"
              baseline={defaults.fuelLevel}
              onChange={(v) =>
                setParams((p) => ({
                  ...p,
                  fuelLevel: v,
                }))
              }
              valueColor={
                params.fuelLevel < 2000
                  ? "#ef4444"
                  : params.fuelLevel < 4000
                    ? "#f59e0b"
                    : "#e2e8f0"
              }
            />

            <SliderParam
              label="Duration"
              value={params.duration}
              min={12}
              max={168}
              unit="h"
              baseline={defaults.duration}
              onChange={(v) =>
                setParams((p) => ({
                  ...p,
                  duration: v,
                }))
              }
            />

            <SliderParam
              label="Energy Demand"
              value={params.energyDemand}
              min={60}
              max={150}
              unit="%"
              baseline={defaults.energyDemand}
              onChange={(v) =>
                setParams((p) => ({
                  ...p,
                  energyDemand: v,
                }))
              }
              valueColor={
                params.energyDemand > 120
                  ? "#f59e0b"
                  : "#e2e8f0"
              }
            />

            <div>
              <div
                className="section-label"
                style={{
                  marginBottom: 7,
                }}
              >
                Generator G-02
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 6,
                }}
              >
                {(
                  ["ONLINE", "FAILURE"] as const
                ).map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setParams((p) => ({
                        ...p,
                        gen2Status: status,
                      }))
                    }
                    style={{
                      flex: 1,
                      padding: "8px 6px",
                      borderRadius: 5,
                      fontSize: 11,
                      fontFamily:
                        "JetBrains Mono",
                      fontWeight: 700,
                      letterSpacing:
                        "0.06em",
                      cursor: "pointer",
                      background:
                        params.gen2Status ===
                        status
                          ? status ===
                            "ONLINE"
                            ? "rgba(16,185,129,0.14)"
                            : "rgba(239,68,68,0.14)"
                          : "transparent",
                      border:
                        params.gen2Status ===
                        status
                          ? `1px solid ${
                              status ===
                              "ONLINE"
                                ? "rgba(16,185,129,0.4)"
                                : "rgba(239,68,68,0.4)"
                            }`
                          : "1px solid rgba(148,163,184,0.12)",
                      color:
                        params.gen2Status ===
                        status
                          ? status ===
                            "ONLINE"
                            ? "#10b981"
                            : "#ef4444"
                          : "#475569",
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{
              width: "100%",
              marginTop: 20,
              padding: "13px",
              fontSize: 14,
              letterSpacing: "0.1em",
              position: "relative",
              overflow: "hidden",
            }}
            onClick={handleRun}
            disabled={running}
          >
            {running ? (
              <div>
                <div
                  style={{
                    position:
                      "absolute",
                    bottom: 0,
                    left: 0,
                    height: 2,
                    background:
                      "rgba(7,13,26,0.4)",
                    transition:
                      "width 0.15s ease",
                    width: `${progress}%`,
                  }}
                />

                <span
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 11,
                      height: 11,
                      border:
                        "2px solid rgba(7,13,26,0.3)",
                      borderTopColor:
                        "#070d1a",
                      borderRadius:
                        "50%",
                      animation:
                        "spin 0.8s linear infinite",
                      display:
                        "inline-block",
                    }}
                  />

                  COMPUTING{" "}
                  {Math.round(progress)}%
                </span>
              </div>
            ) : (
              "RUN SIMULATION"
            )}
          </button>

          {stationLoading && (
            <div
              className="font-mono"
              style={{
                marginTop: 8,
                textAlign: "center",
                fontSize: 8,
                color: "#475569",
              }}
            >
              ACTIVATING {station} SIMULATION
              CONTEXT...
            </div>
          )}

          <style>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 12,
            }}
          >
            <StateCard
              label="BASELINE STATE"
              color="#00c8e8"
              energy={
                result
                  ? baselineEnergy
                  : null
              }
              fuel={
                result
                  ? baselineFuel
                  : null
              }
              battery={
                result
                  ? baselineBattery
                  : null
              }
              risk={
                result
                  ? baselineRisk
                  : null
              }
              dimmed={
                !result
              }
            />

            <StateCard
              label="SIMULATED STATE"
              color={
                result
                  ? riskColors[
                      simulatedRisk
                    ]
                  : "#475569"
              }
              energy={
                result
                  ? simulatedEnergy
                  : null
              }
              fuel={
                result
                  ? simulatedFuel
                  : null
              }
              battery={
                result
                  ? simulatedBattery
                  : null
              }
              risk={
                result
                  ? simulatedRisk
                  : null
              }
              highlight={
                !!result
              }
            />
          </div>

          <div
            className="glass"
            style={{
              borderRadius: 8,
              padding: 20,
            }}
          >
            <div
              className="section-label"
              style={{
                marginBottom: 14,
              }}
            >
              SCENARIO IMPACT ANALYSIS
            </div>

            {result ? (
              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: 12,
                }}
              >
                <CascadeFlow
                  params={params}
                  result={result}
                  tempDelta={
                    temperatureDelta
                  }
                  genFailed={
                    genFailed
                  }
                />

                {impactEntries.length >
                  0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    {impactEntries.map(
                      (entry) => (
                        <div
                          key={
                            entry.label
                          }
                          style={{
                            padding:
                              "9px 10px",
                            border:
                              "1px solid rgba(148,163,184,0.08)",
                            background:
                              "rgba(148,163,184,0.03)",
                            borderRadius:
                              5,
                          }}
                        >
                          <div
                            className="font-mono"
                            style={{
                              fontSize: 8,
                              color:
                                "#475569",
                              marginBottom:
                                4,
                            }}
                          >
                            {
                              entry.label
                            }
                          </div>

                          <div
                            className="font-mono"
                            style={{
                              fontSize: 11,
                              color:
                                "#94a3b8",
                              fontWeight:
                                600,
                            }}
                          >
                            {
                              entry.value
                            }
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            ) : (
              <CascadeFlow
                params={params}
                result={null}
                tempDelta={
                  temperatureDelta
                }
                genFailed={
                  genFailed
                }
              />
            )}
          </div>

          {result && (
            <div
              className="glass"
              style={{
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div
                className="section-label"
                style={{
                  marginBottom: 10,
                }}
              >
                SIMULATION OUTPUT
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, 1fr)",
                  gap: 10,
                }}
              >
                <OutputMetric
                  label="STATION"
                  value={
                    result.station
                  }
                />

                <OutputMetric
                  label="HORIZON"
                  value={`${result.horizonHours}h`}
                />

                <OutputMetric
                  label="SCENARIO"
                  value={
                    result.scenarioName
                  }
                />
              </div>
            </div>
          )}

          {result && (
            <div
              style={{
                borderRadius: 8,
                padding: 20,
                background:
                  "rgba(0,200,232,0.04)",
                border:
                  "1px solid rgba(0,200,232,0.2)",
                position:
                  "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position:
                    "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background:
                    "linear-gradient(90deg, transparent, #00c8e8, transparent)",
                }}
              />

              <div
                className="font-mono"
                style={{
                  fontSize: 9,
                  color: "#00c8e8",
                  letterSpacing:
                    "0.15em",
                  marginBottom: 10,
                }}
              >
                AI RECOMMENDATION
              </div>

              <div
                style={{
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  gap: 8,
                  marginBottom:
                    14,
                }}
              >
                {recommendations.map(
                  (recommendation, index) => (
                    <div
                      key={index}
                      style={{
                        display:
                          "flex",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          color:
                            "#00c8e8",
                          fontWeight:
                            700,
                          flexShrink: 0,
                          fontFamily:
                            "Rajdhani",
                        }}
                      >
                        {index + 1}.
                      </span>

                      <span
                        style={{
                          fontSize: 13,
                          color:
                            "#94a3b8",
                        }}
                      >
                        {
                          recommendation
                        }
                      </span>
                    </div>
                  ),
                )}
              </div>

              <div
                style={{
                  padding:
                    "8px 10px",
                  border:
                    "1px solid rgba(148,163,184,0.08)",
                  background:
                    "rgba(148,163,184,0.03)",
                  borderRadius: 5,
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 8,
                    color:
                      "#475569",
                  }}
                >
                  BACKEND SCENARIO
                </div>

                <div
                  className="font-mono"
                  style={{
                    fontSize: 9,
                    color:
                      "#64748b",
                    marginTop: 3,
                  }}
                >
                  Scenario #
                  {scenarioId} ·
                  Evaluation completed
                  by ANTARIS
                  simulation engine
                </div>
              </div>
            </div>
          )}

          {!result && !running && (
            <div
              className="glass"
              style={{
                borderRadius: 8,
                padding: 40,
                display: "flex",
                flexDirection:
                  "column",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                textAlign:
                  "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius:
                    "50%",
                  border:
                    "1px solid rgba(0,200,232,0.2)",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  marginBottom:
                    14,
                  color:
                    "#2d3d50",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="9"
                    stroke="#00c8e8"
                    strokeWidth="1"
                    opacity="0.4"
                  />

                  <path
                    d="M8 11h6M11 8l3 3-3 3"
                    stroke="#00c8e8"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                  />
                </svg>
              </div>

              <div
                className="font-display"
                style={{
                  fontSize: 14,
                  color: "#475569",
                  letterSpacing:
                    "0.06em",
                }}
              >
                SIMULATION READY
              </div>

              <p
                style={{
                  fontSize: 11,
                  color: "#2d3d50",
                  marginTop: 6,
                }}
              >
                Adjust parameters and
                press Run Simulation to
                execute the real ANTARIS
                simulation engine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StateCard({
  label,
  color,
  energy,
  fuel,
  battery,
  risk,
  dimmed,
  highlight,
}: {
  label: string;
  color: string;
  energy: number | null;
  fuel: number | null;
  battery: number | null;
  risk: string | null;
  dimmed?: boolean;
  highlight?: boolean;
}) {
  const riskColor =
    risk
      ? riskColors[
          risk as keyof typeof riskColors
        ] ?? "#475569"
      : "#475569";

  return (
    <div
      style={{
        borderRadius: 8,
        padding: 18,
        background:
          highlight && energy
            ? `${color}06`
            : "rgba(13,27,46,0.6)",
        border: `1px solid ${
          highlight && energy
            ? `${color}25`
            : "rgba(148,163,184,0.08)"
        }`,
        opacity: dimmed ? 0.75 : 1,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {highlight && energy && (
        <div
          style={{
            position:
              "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              `linear-gradient(90deg, transparent, ${color}, transparent)`,
          }}
        />
      )}

      <div
        className="font-mono"
        style={{
          fontSize: 9,
          color:
            highlight && energy
              ? color
              : "#475569",
          letterSpacing:
            "0.12em",
          marginBottom: 12,
        }}
      >
        {label}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection:
            "column",
          gap: 10,
        }}
      >
        <StateMetric
          label="Energy Load"
          value={
            energy !== null
              ? `${formatNumber(energy, 1)} kW`
              : "—"
          }
          warning={
            energy !== null &&
            energy > 500
          }
        />

        <StateMetric
          label="Fuel Level"
          value={
            fuel !== null
              ? `${formatNumber(fuel, 0)} L`
              : "—"
          }
          warning={
            fuel !== null &&
            fuel < 3000
          }
        />

        <StateMetric
          label="Battery SOC"
          value={
            battery !== null
              ? `${formatNumber(battery, 1)}%`
              : "—"
          }
          warning={
            battery !== null &&
            battery < 60
          }
        />

        <StateMetric
          label="Overall Risk"
          value={
            risk ?? "—"
          }
          valueColor={
            risk
              ? riskColor
              : "#475569"
          }
        />
      </div>
    </div>
  );
}

function StateMetric({
  label,
  value,
  warning,
  valueColor,
}: {
  label: string;
  value: string;
  warning?: boolean;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems:
          "center",
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: "#64748b",
        }}
      >
        {label}
      </span>

      <span
        className="font-display"
        style={{
          fontSize: 18,
          fontWeight: 700,
          color:
            valueColor ??
            (warning
              ? "#ef4444"
              : "#e2e8f0"),
        }}
      >
        {value}
      </span>
    </div>
  );
}

function CascadeFlow({
  params,
  result,
  tempDelta,
  genFailed,
}: {
  params: Params;
  result: SimulationResult | null;
  tempDelta: number;
  genFailed: boolean;
}) {
  const simulated =
    result?.simulatedState;

  const simulatedEnergy =
    numberValue(
      simulated,
      [
        "totalConsumptionKw",
        "consumptionKw",
        "energyLoadKw",
        "energy",
      ],
      0,
    );

  const simulatedFuel =
    numberValue(
      simulated,
      [
        "fuelLevelL",
        "fuelLevel",
        "fuelRemaining",
        "fuelL",
      ],
      0,
    );

  const risk =
    result
      ? getRiskFromState(
          simulated,
        )
      : null;

  const nodes = [
    {
      label: "Temperature Change",
      value:
        tempDelta !== 0
          ? `${params.temperature} °C (${tempDelta > 0 ? "+" : ""}${tempDelta} °C)`
          : `${params.temperature} °C`,
      color:
        params.temperature <
        -35
          ? "#ef4444"
          : params.temperature <
              -28
            ? "#f59e0b"
            : "#10b981",
      active:
        tempDelta !== 0,
    },
    {
      label: "Generator Status",
      value: genFailed
        ? "G-02: FAILURE"
        : "G-02: ONLINE",
      color: genFailed
        ? "#ef4444"
        : "#10b981",
      active: true,
    },
    {
      label: "Energy Load",
      value: result
        ? `${formatNumber(
            simulatedEnergy,
            1,
          )} kW`
        : "—",
      color:
        simulatedEnergy >
        500
          ? "#ef4444"
          : simulatedEnergy >
              300
            ? "#f59e0b"
            : "#10b981",
      active: !!result,
    },
    {
      label: "Fuel State",
      value: result
        ? `${formatNumber(
            simulatedFuel,
            0,
          )} L`
        : "—",
      color:
        simulatedFuel <
        2500
          ? "#ef4444"
          : simulatedFuel <
              4000
            ? "#f59e0b"
            : "#10b981",
      active: !!result,
    },
    {
      label: "Resupply Risk",
      value:
        risk ?? "—",
      color:
        risk
          ? riskColors[
              risk
            ]
          : "#475569",
      active: !!result,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexWrap:
          "wrap",
        gap: 6,
        alignItems:
          "center",
      }}
    >
      {nodes.map(
        (node, index) => (
          <div
            key={node.label}
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: 6,
            }}
          >
            <div
              style={{
                padding:
                  "8px 14px",
                borderRadius: 6,
                background:
                  node.active
                    ? `${node.color}10`
                    : "rgba(148,163,184,0.03)",
                border:
                  `1px solid ${
                    node.active
                      ? `${node.color}30`
                      : "rgba(148,163,184,0.1)"
                  }`,
                minWidth: 120,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  color:
                    node.active
                      ? node.color
                      : "#2d3d50",
                  fontFamily:
                    "JetBrains Mono",
                  letterSpacing:
                    "0.06em",
                  marginBottom:
                    2,
                  textTransform:
                    "uppercase",
                }}
              >
                {node.label}
              </div>

              <div
                className="font-mono"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color:
                    node.active
                      ? node.color
                      : "#1e2d3d",
                }}
              >
                {node.value}
              </div>
            </div>

            {index <
              nodes.length - 1 && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M5 10h10M12 7l3 3-3 3"
                  stroke={
                    node.active
                      ? node.color
                      : "#475569"
                  }
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={
                    node.active
                      ? 0.8
                      : 0.2
                  }
                />
              </svg>
            )}
          </div>
        ),
      )}
    </div>
  );
}

function OutputMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "9px 10px",
        background:
          "rgba(148,163,184,0.03)",
        border:
          "1px solid rgba(148,163,184,0.08)",
        borderRadius: 5,
      }}
    >
      <div
        className="font-mono"
        style={{
          fontSize: 8,
          color: "#475569",
        }}
      >
        {label}
      </div>

      <div
        className="font-mono"
        style={{
          fontSize: 10,
          color: "#94a3b8",
          marginTop: 3,
          overflow: "hidden",
          textOverflow:
            "ellipsis",
          whiteSpace:
            "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SliderParam({
  label,
  value,
  min,
  max,
  unit,
  baseline,
  onChange,
  valueColor = "#e2e8f0",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  baseline: number;
  onChange: (value: number) => void;
  valueColor?: string;
}) {
  const changed =
    value !== baseline;

  const delta =
    value - baseline;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          marginBottom: 5,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems:
              "center",
          }}
        >
          <span className="section-label">
            {label}
          </span>

          {changed && (
            <span
              className="font-mono"
              style={{
                fontSize: 8,
                color:
                  delta < 0
                    ? "#00c8e8"
                    : "#f59e0b",
                background:
                  delta < 0
                    ? "rgba(0,200,232,0.1)"
                    : "rgba(245,158,11,0.1)",
                padding:
                  "1px 4px",
                borderRadius: 2,
              }}
            >
              {delta > 0
                ? "+"
                : ""}
              {delta}
              {unit}
            </span>
          )}
        </div>

        <span
          className="font-mono"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: valueColor,
          }}
        >
          {value}
          {unit}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value,
            ),
          )
        }
        style={{
          width: "100%",
          accentColor:
            "#00c8e8",
          cursor: "pointer",
          height: 2,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          marginTop: 1,
        }}
      >
        <span
          className="font-mono"
          style={{
            fontSize: 7,
            color: "#2d3d50",
          }}
        >
          {min}
          {unit}
        </span>

        <span
          className="font-mono"
          style={{
            fontSize: 7,
            color: "#2d3d50",
          }}
        >
          BASE: {baseline}
          {unit}
        </span>

        <span
          className="font-mono"
          style={{
            fontSize: 7,
            color: "#2d3d50",
          }}
        >
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}