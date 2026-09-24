import { useCallback, useEffect, useState } from "react";

type Station = "MAITRI" | "BHARATI";

type SimulatorSnapshot = {
  stationCode: string;
  temperatureC: number;
  humidityPct: number;
  batteryPercentage: number;
  fuelLevelL: number;
  fuelPercentage: number;
  fuelCapacityL: number;
  fuelConsumptionRateLph: number;
  estimatedRuntimeHours: number;
  generatorLoadPct: number;
  totalConsumptionKw: number;
  totalGenerationKw: number;
  powerBalanceKw: number;
  windSpeed: number;
  windDirectionDeg: number;
  windResourceIndex: number;
  timestamp: string;
};

type PredictionResponse = {
  station: string;
  predictionType: string;
  predictedValue: number;
  unit: string;
  horizonHours: number;
  modelVersion: string;
  timestamp?: string;
};

type PredictionState = {
  energy: PredictionResponse | null;
  fuel: PredictionResponse | null;
  environment: PredictionResponse | null;
  equipment: PredictionResponse | null;
};

const EMPTY_PREDICTIONS: PredictionState = {
  energy: null,
  fuel: null,
  environment: null,
  equipment: null,
};

function normalizeUnit(unit: string) {
  return unit
    .replace(/Â°C/g, "°C")
    .replace(/â„ƒ/g, "°C")
    .replace(/Â/g, "")
    .trim();
}

function formatNumber(value: number | undefined, decimals = 2) {
  if (value === undefined || Number.isNaN(value)) return "—";

  return value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function getRisk(
  type: "energy" | "fuel" | "environment" | "equipment",
  prediction: PredictionResponse | null,
  snapshot: SimulatorSnapshot | null,
) {
  if (!prediction) {
    return {
      label: "UNKNOWN",
      color: "#64748b",
      trend: "—",
    };
  }

  const value = prediction.predictedValue;

  if (type === "equipment") {
    if (value >= 0.7) {
      return {
        label: "HIGH",
        color: "#ef4444",
        trend: "ANOMALY",
      };
    }

    if (value >= 0.4) {
      return {
        label: "MEDIUM",
        color: "#f59e0b",
        trend: "ANOMALY",
      };
    }

    return {
      label: "LOW",
      color: "#10b981",
      trend: "STABLE",
    };
  }

  if (type === "fuel") {
    if (value <= 20) {
      return {
        label: "HIGH",
        color: "#ef4444",
        trend: "LOW RESERVE",
      };
    }

    if (value <= 40) {
      return {
        label: "MEDIUM",
        color: "#f59e0b",
        trend: "DECLINING",
      };
    }

    return {
      label: "LOW",
      color: "#10b981",
      trend: "STABLE",
    };
  }

  if (type === "environment") {
    if (value <= -30) {
      return {
        label: "HIGH",
        color: "#ef4444",
        trend: "EXTREME COLD",
      };
    }

    if (value <= -20) {
      return {
        label: "MEDIUM",
        color: "#f59e0b",
        trend: "COLD",
      };
    }

    return {
      label: "LOW",
      color: "#10b981",
      trend: "STABLE",
    };
  }

  if (type === "energy") {
    const current = snapshot?.totalConsumptionKw ?? 0;

    if (current > 0 && value > current * 1.25) {
      return {
        label: "HIGH",
        color: "#ef4444",
        trend: `↑ ${formatNumber(((value - current) / current) * 100, 1)}%`,
      };
    }

    if (current > 0 && value > current * 1.1) {
      return {
        label: "MEDIUM",
        color: "#f59e0b",
        trend: `↑ ${formatNumber(((value - current) / current) * 100, 1)}%`,
      };
    }

    return {
      label: "LOW",
      color: "#10b981",
      trend:
        current > 0
          ? `${value >= current ? "↑" : "↓"} ${formatNumber(
              Math.abs(((value - current) / current) * 100),
              1,
            )}%`
          : "MODEL OUTPUT",
    };
  }

  return {
    label: "UNKNOWN",
    color: "#64748b",
    trend: "—",
  };
}

export default function Predictions({
  station,
}: {
  station: Station;
}) {
  const [snapshot, setSnapshot] = useState<SimulatorSnapshot | null>(null);
  const [predictions, setPredictions] =
    useState<PredictionState>(EMPTY_PREDICTIONS);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadPredictions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      /*
       * The current-prediction backend reads the simulator's
       * active station snapshot. Therefore we switch the simulator
       * station first, then request all four ML predictions.
       */
      const stationResponse = await fetch(
        `/api/simulator/station/${station}`,
        {
          method: "POST",
        },
      );

      if (!stationResponse.ok) {
        throw new Error(
          `Unable to switch simulator to ${station} (${stationResponse.status})`,
        );
      }

      const stationSnapshot =
        (await stationResponse.json()) as SimulatorSnapshot;

      setSnapshot(stationSnapshot);

      const horizon = 24;

      const [energyResponse, fuelResponse, environmentResponse, equipmentResponse] =
        await Promise.all([
          fetch(
            `/api/predictions/energy/current?horizonHours=${horizon}`,
            {
              method: "POST",
            },
          ),
          fetch(
            `/api/predictions/fuel/current?horizonHours=${horizon}`,
            {
              method: "POST",
            },
          ),
          fetch(
            `/api/predictions/environment/current?horizonHours=${horizon}`,
            {
              method: "POST",
            },
          ),
          fetch(
            `/api/predictions/equipment/current?horizonHours=${horizon}`,
            {
              method: "POST",
            },
          ),
        ]);

      const responses = [
        energyResponse,
        fuelResponse,
        environmentResponse,
        equipmentResponse,
      ];

      const failedResponse = responses.find((response) => !response.ok);

      if (failedResponse) {
        throw new Error(
          `Prediction API request failed (${failedResponse.status})`,
        );
      }

      const [
        energy,
        fuel,
        environment,
        equipment,
      ] = (await Promise.all(
        responses.map((response) => response.json()),
      )) as [
        PredictionResponse,
        PredictionResponse,
        PredictionResponse,
        PredictionResponse,
      ];

      setPredictions({
        energy,
        fuel,
        environment,
        equipment,
      });

      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error("ANTARIS prediction integration error:", err);

      setPredictions(EMPTY_PREDICTIONS);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load prediction data.",
      );
    } finally {
      setLoading(false);
    }
  }, [station]);

  useEffect(() => {
    loadPredictions();

    const interval = window.setInterval(loadPredictions, 15000);

    return () => window.clearInterval(interval);
  }, [loadPredictions]);

  const energyRisk = getRisk("energy", predictions.energy, snapshot);
  const fuelRisk = getRisk("fuel", predictions.fuel, snapshot);
  const environmentRisk = getRisk(
    "environment",
    predictions.environment,
    snapshot,
  );
  const equipmentRisk = getRisk(
    "equipment",
    predictions.equipment,
    snapshot,
  );

  const energyCurrent = snapshot?.totalConsumptionKw;
  const fuelCurrent = snapshot?.fuelPercentage;
  const environmentCurrent = snapshot?.temperatureC;
  const equipmentScore = predictions.equipment?.predictedValue;

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
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
            AI PREDICTION CENTER
          </h1>

          <p
            style={{
              fontSize: 13,
              color: "#64748b",
              marginTop: 4,
            }}
          >
            Machine learning forecasts · Anomaly detection · Risk assessment
          </p>
        </div>

        <div
          style={{
            textAlign: "right",
            padding: "8px 12px",
            border: "1px solid rgba(0,200,232,0.12)",
            background: "rgba(0,200,232,0.03)",
            borderRadius: 6,
          }}
        >
          <div
            className="font-mono"
            style={{
              fontSize: 9,
              color: "#00c8e8",
              letterSpacing: "0.1em",
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
              marginTop: 2,
            }}
          >
            {station}
          </div>

          <div
            className="font-mono"
            style={{
              fontSize: 8,
              color: "#475569",
              marginTop: 3,
            }}
          >
            {loading
              ? "MODEL QUERY IN PROGRESS"
              : lastUpdated
                ? `UPDATED ${new Date(lastUpdated).toLocaleTimeString()}`
                : "WAITING FOR MODEL"}
          </div>
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
          ML INTEGRATION ERROR · {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
        }}
      >
        <PredictionCard
          title="Energy Forecast"
          sub={`Next ${predictions.energy?.horizonHours ?? 24} hours · ${predictions.energy?.modelVersion ?? "MODEL OFFLINE"}`}
          current={{
            label: "Current Load",
            value:
              energyCurrent !== undefined
                ? `${formatNumber(energyCurrent)} kW`
                : "—",
          }}
          predicted={{
            label: "Predicted Consumption",
            value: predictions.energy
              ? `${formatNumber(predictions.energy.predictedValue)} ${normalizeUnit(predictions.energy.unit)}`
              : "—",
            color: energyRisk.color,
          }}
          risk={energyRisk.label}
          riskColor={energyRisk.color}
          trend={energyRisk.trend}
          loading={loading}
        >
          <ModelOutput
            prediction={predictions.energy}
            accent={energyRisk.color}
          />
        </PredictionCard>

        <PredictionCard
          title="Fuel Level Forecast"
          sub={`Next ${predictions.fuel?.horizonHours ?? 24} hours · ${predictions.fuel?.modelVersion ?? "MODEL OFFLINE"}`}
          current={{
            label: "Current Level",
            value:
              fuelCurrent !== undefined
                ? `${formatNumber(fuelCurrent, 1)} %`
                : "—",
          }}
          predicted={{
            label: "Predicted Level",
            value: predictions.fuel
              ? `${formatNumber(predictions.fuel.predictedValue, 2)} ${normalizeUnit(predictions.fuel.unit)}`
              : "—",
            color: fuelRisk.color,
          }}
          risk={fuelRisk.label}
          riskColor={fuelRisk.color}
          trend={fuelRisk.trend}
          loading={loading}
        >
          <ModelOutput
            prediction={predictions.fuel}
            accent={fuelRisk.color}
          />

          {snapshot && (
            <div
              style={{
                marginTop: 10,
                padding: "8px 10px",
                background: "rgba(148,163,184,0.04)",
                border: "1px solid rgba(148,163,184,0.08)",
                borderRadius: 5,
              }}
            >
              <div
                className="font-mono"
                style={{
                  fontSize: 9,
                  color: "#64748b",
                }}
              >
                CURRENT FUEL TELEMETRY
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 18,
                  marginTop: 5,
                }}
              >
                <TelemetryValue
                  label="VOLUME"
                  value={`${formatNumber(snapshot.fuelLevelL, 0)} L`}
                />

                <TelemetryValue
                  label="RATE"
                  value={`${formatNumber(snapshot.fuelConsumptionRateLph, 1)} L/h`}
                />

                <TelemetryValue
                  label="RUNTIME"
                  value={`${formatNumber(snapshot.estimatedRuntimeHours, 0)} h`}
                />
              </div>
            </div>
          )}
        </PredictionCard>

        <PredictionCard
          title="Environment Forecast"
          sub={`Next ${predictions.environment?.horizonHours ?? 24} hours · ${predictions.environment?.modelVersion ?? "MODEL OFFLINE"}`}
          current={{
            label: "Current Temp",
            value:
              environmentCurrent !== undefined
                ? `${formatNumber(environmentCurrent, 1)} °C`
                : "—",
          }}
          predicted={{
            label: "Predicted Temperature",
            value: predictions.environment
              ? `${formatNumber(predictions.environment.predictedValue, 2)} ${normalizeUnit(predictions.environment.unit)}`
              : "—",
            color: environmentRisk.color,
          }}
          risk={environmentRisk.label}
          riskColor={environmentRisk.color}
          trend={environmentRisk.trend}
          loading={loading}
        >
          <ModelOutput
            prediction={predictions.environment}
            accent={environmentRisk.color}
          />

          {snapshot && (
            <div
              style={{
                display: "flex",
                gap: 18,
                marginTop: 10,
                padding: "8px 10px",
                background: "rgba(148,163,184,0.04)",
                border: "1px solid rgba(148,163,184,0.08)",
                borderRadius: 5,
              }}
            >
              <TelemetryValue
                label="HUMIDITY"
                value={`${formatNumber(snapshot.humidityPct, 1)} %`}
              />

              <TelemetryValue
                label="WIND"
                value={`${formatNumber(snapshot.windSpeed, 1)} km/h`}
              />

              <TelemetryValue
                label="WIND INDEX"
                value={formatNumber(snapshot.windResourceIndex, 2)}
              />
            </div>
          )}
        </PredictionCard>

        <div
          className="glass"
          style={{
            borderRadius: 8,
            padding: 16,
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
              background: `linear-gradient(90deg, transparent, ${equipmentRisk.color}, transparent)`,
            }}
          />

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
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#94a3b8",
                }}
              >
                Equipment Anomaly Risk
              </div>

              <div
                className="section-label"
                style={{
                  marginTop: 2,
                }}
              >
                Current ML anomaly score ·{" "}
                {predictions.equipment?.modelVersion ?? "MODEL OFFLINE"}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: 10,
                  color: "#475569",
                }}
              >
                {equipmentRisk.trend}
              </span>

              <span
                style={{
                  padding: "2px 8px",
                  background: `${equipmentRisk.color}12`,
                  border: `1px solid ${equipmentRisk.color}30`,
                  borderRadius: 3,
                  fontSize: 9,
                  fontFamily: "JetBrains Mono",
                  color: equipmentRisk.color,
                  letterSpacing: "0.08em",
                }}
              >
                {equipmentRisk.label} RISK
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <span
              className="font-display"
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: equipmentRisk.color,
              }}
            >
              {equipmentScore !== undefined
                ? formatNumber(equipmentScore, 2)
                : "—"}
            </span>

            <span
              className="font-mono"
              style={{
                fontSize: 10,
                color: "#475569",
              }}
            >
              ANOMALY SCORE
            </span>
          </div>

          <div
            style={{
              height: 6,
              background: "rgba(148,163,184,0.1)",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${
                  equipmentScore !== undefined
                    ? Math.min(Math.max(equipmentScore * 100, 0), 100)
                    : 0
                }%`,
                height: "100%",
                background: equipmentRisk.color,
                borderRadius: 3,
                transition: "width 1s ease",
              }}
            />
          </div>

          <ModelOutput
            prediction={predictions.equipment}
            accent={equipmentRisk.color}
          />

          <div
            style={{
              marginTop: 14,
              padding: "10px 12px",
              background: "rgba(0,200,232,0.04)",
              border: "1px solid rgba(0,200,232,0.12)",
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
              AI MODEL OUTPUT
            </div>

            <p
              style={{
                fontSize: 11,
                color: "#94a3b8",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              The equipment model currently returns an aggregate anomaly
              score. Individual equipment failure probabilities are not
              exposed by the current prediction API.
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "10px 12px",
          borderRadius: 6,
          border: "1px solid rgba(148,163,184,0.08)",
          background: "rgba(148,163,184,0.025)",
        }}
      >
        <div
          className="font-mono"
          style={{
            fontSize: 9,
            color: "#475569",
            letterSpacing: "0.08em",
          }}
        >
          ML PIPELINE
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 7,
            flexWrap: "wrap",
          }}
        >
          {[
            "TELEMETRY",
            "SPRING BOOT",
            "PYTHON ML",
            "MODEL OUTPUT",
          ].map((step, index) => (
            <div
              key={step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: 9,
                  color: index === 3 ? "#00c8e8" : "#64748b",
                  padding: "4px 7px",
                  border: `1px solid ${
                    index === 3
                      ? "rgba(0,200,232,0.2)"
                      : "rgba(148,163,184,0.08)"
                  }`,
                  borderRadius: 3,
                }}
              >
                {step}
              </span>

              {index < 3 && (
                <span
                  className="font-mono"
                  style={{
                    color: "#334155",
                    fontSize: 10,
                  }}
                >
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PredictionCard({
  title,
  sub,
  current,
  predicted,
  risk,
  riskColor,
  trend,
  loading,
  children,
}: {
  title: string;
  sub: string;
  current: {
    label: string;
    value: string;
  };
  predicted: {
    label: string;
    value: string;
    color: string;
  };
  risk: string;
  riskColor: string;
  trend: string;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="glass"
      style={{
        borderRadius: 8,
        padding: 16,
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
          background: `linear-gradient(90deg, transparent, ${riskColor}, transparent)`,
        }}
      />

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
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#94a3b8",
            }}
          >
            {title}
          </div>

          <div
            className="section-label"
            style={{
              marginTop: 2,
              maxWidth: 340,
            }}
          >
            {sub}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: 10,
              color: "#475569",
            }}
          >
            {loading ? "LOADING" : trend}
          </span>

          <span
            style={{
              padding: "2px 8px",
              background: `${riskColor}12`,
              border: `1px solid ${riskColor}30`,
              borderRadius: 3,
              fontSize: 9,
              fontFamily: "JetBrains Mono",
              color: riskColor,
              letterSpacing: "0.08em",
            }}
          >
            {risk} RISK
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 12,
        }}
      >
        <div>
          <div
            className="section-label"
            style={{
              marginBottom: 2,
            }}
          >
            {current.label}
          </div>

          <div
            className="font-display"
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#e2e8f0",
            }}
          >
            {current.value}
          </div>
        </div>

        <div
          style={{
            borderLeft: "1px solid rgba(0,200,232,0.1)",
            paddingLeft: 20,
          }}
        >
          <div
            className="section-label"
            style={{
              marginBottom: 2,
            }}
          >
            {predicted.label}
          </div>

          <div
            className="font-display"
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: predicted.color,
            }}
          >
            {predicted.value}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

function ModelOutput({
  prediction,
  accent,
}: {
  prediction: PredictionResponse | null;
  accent: string;
}) {
  return (
    <div
      style={{
        marginTop: 10,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "7px 10px",
        background: `${accent}06`,
        border: `1px solid ${accent}12`,
        borderRadius: 5,
      }}
    >
      <div>
        <div
          className="font-mono"
          style={{
            fontSize: 8,
            color: "#475569",
            letterSpacing: "0.08em",
          }}
        >
          MODEL
        </div>

        <div
          className="font-mono"
          style={{
            fontSize: 9,
            color: "#64748b",
            marginTop: 2,
          }}
        >
          {prediction?.modelVersion ?? "—"}
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div
          className="font-mono"
          style={{
            fontSize: 8,
            color: "#475569",
            letterSpacing: "0.08em",
          }}
        >
          HORIZON
        </div>

        <div
          className="font-mono"
          style={{
            fontSize: 9,
            color: "#64748b",
            marginTop: 2,
          }}
        >
          {prediction ? `${prediction.horizonHours} HOURS` : "—"}
        </div>
      </div>
    </div>
  );
}

function TelemetryValue({
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
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  );
}