import { useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';

type Station = 'MAITRI' | 'BHARATI';

interface EnvironmentReading {
  id: number;
  stationId: number;
  stationCode: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  timestamp: string;
}

interface EnvironmentProps {
  station: Station;
}

function stationIdFor(station: Station) {
  return station === 'MAITRI' ? 1 : 2;
}

function directionLabel(degrees: number) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatDate(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleDateString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function Environment({ station }: EnvironmentProps) {
  const [timeframe, setTimeframe] = useState('24H');
  const [current, setCurrent] = useState<EnvironmentReading | null>(null);
  const [history, setHistory] = useState<EnvironmentReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stationId = stationIdFor(station);

  useEffect(() => {
    let cancelled = false;

    const loadEnvironment = async () => {
      try {
        setLoading(true);
        setError(null);

        const [currentResponse, historyResponse] = await Promise.all([
          fetch(`/api/environment/${stationId}/current`),
          fetch(`/api/environment/${stationId}/history`),
        ]);

        if (!currentResponse.ok) {
          throw new Error(
            `Current environment request failed (${currentResponse.status})`,
          );
        }

        if (!historyResponse.ok) {
          throw new Error(
            `Environment history request failed (${historyResponse.status})`,
          );
        }

        const currentData =
          (await currentResponse.json()) as EnvironmentReading;

        const historyData =
          (await historyResponse.json()) as EnvironmentReading[];

        if (cancelled) {
          return;
        }

        setCurrent(currentData);
        setHistory(historyData);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load environmental telemetry.',
        );
        setCurrent(null);
        setHistory([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadEnvironment();

    const interval = window.setInterval(loadEnvironment, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [stationId]);

  const chartHistory = useMemo(() => {
    const sorted = [...history].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime(),
    );

    return sorted.map((reading) => ({
      t: formatTime(reading.timestamp),
      v: reading.temperature,
      humidity: reading.humidity,
      pressure: reading.pressure,
      wind: reading.windSpeed,
    }));
  }, [history]);

  const temperatureDomain = useMemo(() => {
    if (chartHistory.length === 0) {
      return [-40, -10] as [number, number];
    }

    const values = chartHistory.map((item) => item.v);
    const min = Math.floor(Math.min(...values) - 2);
    const max = Math.ceil(Math.max(...values) + 2);

    return [min, max] as [number, number];
  }, [chartHistory]);

  const pressureDomain = useMemo(() => {
    if (chartHistory.length === 0) {
      return [980, 995] as [number, number];
    }

    const values = chartHistory.map((item) => item.pressure);
    const min = Math.floor(Math.min(...values) - 2);
    const max = Math.ceil(Math.max(...values) + 2);

    return [min, max] as [number, number];
  }, [chartHistory]);

  const windData = chartHistory.map((item) => ({
    t: item.t,
    v: item.wind,
    gust: item.wind * 1.2,
  }));

  const pressureData = chartHistory.map((item) => ({
    t: item.t,
    v: item.pressure,
  }));

  const humidityData = chartHistory.map((item) => ({
    t: item.t,
    v: item.humidity,
  }));

  const forecast = current
    ? [
        {
          label: 'NOW',
          temp: `${current.temperature.toFixed(1)}°C`,
          wind: `${current.windSpeed.toFixed(1)} km/h`,
          cond:
            current.temperature <= -30
              ? 'EXTREME COLD'
              : current.windSpeed >= 30
                ? 'HIGH WIND'
                : 'CURRENT CONDITIONS',
          icon: '◉',
        },
        {
          label: 'LATEST',
          temp: `${current.temperature.toFixed(1)}°C`,
          wind: `${current.windSpeed.toFixed(1)} km/h`,
          cond: `${current.humidity.toFixed(1)}% HUMIDITY`,
          icon: '◌',
        },
      ]
    : [];

  const direction = current
    ? `${directionLabel(current.windDirection)} (${current.windDirection.toFixed(0)}°)`
    : '--';

  return (
    <div
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <h1
            className="font-display"
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#e2e8f0',
            }}
          >
            ENVIRONMENTAL INTELLIGENCE
          </h1>

          <p style={{ fontSize: 13, color: '#64748b' }}>
            {station} · Antarctic conditions · Real-time monitoring
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {['24H', '7D', '30D'].map((r) => (
            <button
              key={r}
              onClick={() => setTimeframe(r)}
              className="btn-ghost"
              style={{
                fontSize: 11,
                padding: '4px 10px',
                background:
                  timeframe === r
                    ? 'rgba(0,200,232,0.1)'
                    : 'transparent',
                color: timeframe === r ? '#00c8e8' : 'inherit',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          className="glass"
          style={{
            padding: 12,
            borderRadius: 6,
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#ef4444',
            fontSize: 12,
          }}
        >
          Environment telemetry error: {error}
        </div>
      )}

      {/* Current conditions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 10,
        }}
      >
        {[
          {
            label: 'Temperature',
            value: current ? `${current.temperature.toFixed(1)}°C` : '--',
            sub: current ? `Recorded ${formatTime(current.timestamp)}` : 'Loading...',
            color: '#00c8e8',
            icon: '🌡',
          },
          {
            label: 'Humidity',
            value: current ? `${current.humidity.toFixed(1)}%` : '--',
            sub: 'Relative humidity',
            color: '#64748b',
            icon: '💧',
          },
          {
            label: 'Pressure',
            value: current ? `${current.pressure.toFixed(1)} hPa` : '--',
            sub: 'Barometric pressure',
            color: '#94a3b8',
            icon: '⊛',
          },
          {
            label: 'Wind Speed',
            value: current ? `${current.windSpeed.toFixed(1)} km/h` : '--',
            sub: current ? direction : 'Loading...',
            color: '#f59e0b',
            icon: '💨',
          },
          {
            label: 'Wind Direction',
            value: current
              ? `${current.windDirection.toFixed(0)}°`
              : '--',
            sub: current ? directionLabel(current.windDirection) : 'Loading...',
            color: '#10b981',
            icon: '🧭',
          },
        ].map((c) => (
          <div key={c.label} className="kpi-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <div className="section-label">{c.label}</div>
              <span style={{ fontSize: 13 }}>{c.icon}</span>
            </div>

            <div
              className="font-display"
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: c.color,
              }}
            >
              {loading ? '...' : c.value}
            </div>

            <div
              style={{
                fontSize: 11,
                color: '#475569',
                marginTop: 4,
              }}
            >
              {c.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Backend status */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.16)',
          borderRadius: 6,
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: '#10b981',
            letterSpacing: '0.08em',
            fontFamily: 'JetBrains Mono',
          }}
        >
          ● LIVE BACKEND ENVIRONMENT TELEMETRY
        </span>

        <span
          style={{
            fontSize: 10,
            color: '#64748b',
            fontFamily: 'JetBrains Mono',
          }}
        >
          {current
            ? `LAST READING: ${formatDate(current.timestamp)} ${formatTime(current.timestamp)}`
            : 'WAITING FOR TELEMETRY'}
        </span>
      </div>

      {/* Charts + forecast */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 240px',
          gap: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <EnvChart
            title="Temperature (°C)"
            sub={`${station} historical telemetry`}
          >
            <ResponsiveContainer width="100%" height={110}>
              <ComposedChart data={chartHistory}>
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

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,200,232,0.05)"
                />

                <XAxis
                  dataKey="t"
                  tick={{
                    fontSize: 8,
                    fill: '#475569',
                    fontFamily: 'JetBrains Mono',
                  }}
                  interval={3}
                />

                <YAxis
                  domain={temperatureDomain}
                  tick={{
                    fontSize: 8,
                    fill: '#475569',
                    fontFamily: 'JetBrains Mono',
                  }}
                  width={32}
                />

                <Tooltip
                  contentStyle={{
                    background: '#0d1b2e',
                    border: '1px solid rgba(0,200,232,0.2)',
                    borderRadius: 4,
                    fontSize: 11,
                  }}
                />

                <ReferenceLine
                  y={-32}
                  stroke="#ef4444"
                  strokeDasharray="4 2"
                  strokeWidth={1}
                  label={{
                    value: 'ALERT',
                    fill: '#ef4444',
                    fontSize: 9,
                    fontFamily: 'JetBrains Mono',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#00c8e8"
                  strokeWidth={2}
                  fill="url(#tg)"
                  dot={false}
                  name="Temperature"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </EnvChart>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            <EnvChart
              title="Wind Speed (km/h)"
              sub="Backend wind readings"
            >
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={windData}>
                  <defs>
                    <linearGradient
                      id="wg"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#f59e0b"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor="#f59e0b"
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
                      fontSize: 7,
                      fill: '#475569',
                      fontFamily: 'JetBrains Mono',
                    }}
                    interval={5}
                  />

                  <YAxis
                    tick={{
                      fontSize: 7,
                      fill: '#475569',
                      fontFamily: 'JetBrains Mono',
                    }}
                    width={25}
                  />

                  <Tooltip
                    contentStyle={{
                      background: '#0d1b2e',
                      border: '1px solid rgba(0,200,232,0.2)',
                      borderRadius: 4,
                      fontSize: 10,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="gust"
                    stroke="#ef4444"
                    strokeWidth={1}
                    fill="rgba(239,68,68,0.05)"
                    dot={false}
                    name="Estimated Gust"
                  />

                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    fill="url(#wg)"
                    dot={false}
                    name="Wind Speed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </EnvChart>

            <EnvChart
              title="Atmospheric Pressure (hPa)"
              sub="Backend pressure readings"
            >
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={pressureData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,200,232,0.05)"
                  />

                  <XAxis
                    dataKey="t"
                    tick={{
                      fontSize: 7,
                      fill: '#475569',
                      fontFamily: 'JetBrains Mono',
                    }}
                    interval={5}
                  />

                  <YAxis
                    domain={pressureDomain}
                    tick={{
                      fontSize: 7,
                      fill: '#475569',
                      fontFamily: 'JetBrains Mono',
                    }}
                    width={32}
                  />

                  <Tooltip
                    contentStyle={{
                      background: '#0d1b2e',
                      border: '1px solid rgba(0,200,232,0.2)',
                      borderRadius: 4,
                      fontSize: 10,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    dot={false}
                    name="Pressure"
                  />
                </LineChart>
              </ResponsiveContainer>
            </EnvChart>
          </div>

          <EnvChart
            title="Humidity (%)"
            sub="Backend humidity readings"
          >
            <ResponsiveContainer width="100%" height={90}>
              <LineChart data={humidityData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,200,232,0.05)"
                />

                <XAxis
                  dataKey="t"
                  tick={{
                    fontSize: 7,
                    fill: '#475569',
                    fontFamily: 'JetBrains Mono',
                  }}
                  interval={5}
                />

                <YAxis
                  domain={[0, 100]}
                  tick={{
                    fontSize: 7,
                    fill: '#475569',
                    fontFamily: 'JetBrains Mono',
                  }}
                  width={25}
                />

                <Tooltip
                  contentStyle={{
                    background: '#0d1b2e',
                    border: '1px solid rgba(0,200,232,0.2)',
                    borderRadius: 4,
                    fontSize: 10,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#64748b"
                  strokeWidth={1.5}
                  dot={false}
                  name="Humidity"
                />
              </LineChart>
            </ResponsiveContainer>
          </EnvChart>
        </div>

        {/* Forecast / telemetry panel */}
        <div
          className="glass"
          style={{
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div
            className="section-label"
            style={{ marginBottom: 4 }}
          >
            ENVIRONMENTAL TELEMETRY
          </div>

          <div
            style={{
              fontSize: 11,
              color: '#475569',
              marginBottom: 16,
            }}
          >
            {station} · Backend source
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {forecast.map((f, i) => (
              <div
                key={f.label}
                style={{
                  padding: '12px',
                  background:
                    i === 0
                      ? 'rgba(0,200,232,0.08)'
                      : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${
                    i === 0
                      ? 'rgba(0,200,232,0.2)'
                      : 'rgba(148,163,184,0.06)'
                  }`,
                  borderRadius: 6,
                }}
              >
                <div
                  className="section-label"
                  style={{ marginBottom: 6 }}
                >
                  {f.label}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div
                    className="font-display"
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: '#e2e8f0',
                    }}
                  >
                    {f.temp}
                  </div>

                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                </div>

                <div
                  style={{
                    fontSize: 10,
                    color: '#475569',
                    marginTop: 4,
                  }}
                >
                  {f.wind} · {f.cond}
                </div>
              </div>
            ))}
          </div>

          {current && (
            <div
              style={{
                marginTop: 16,
                padding: '10px 12px',
                background: 'rgba(148,163,184,0.06)',
                border: '1px solid rgba(148,163,184,0.12)',
                borderRadius: 6,
              }}
            >
              <div
                className="font-mono"
                style={{
                  fontSize: 9,
                  color: '#94a3b8',
                  letterSpacing: '0.1em',
                  marginBottom: 4,
                }}
              >
                LATEST SENSOR READING
              </div>

              <p
                style={{
                  fontSize: 11,
                  color: '#94a3b8',
                  lineHeight: 1.5,
                }}
              >
                Temperature {current.temperature.toFixed(1)}°C,
                humidity {current.humidity.toFixed(1)}%, pressure{' '}
                {current.pressure.toFixed(1)} hPa, wind{' '}
                {current.windSpeed.toFixed(1)} km/h from{' '}
                {directionLabel(current.windDirection)}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EnvChart({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="chart-container">
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#94a3b8',
          }}
        >
          {title}
        </div>

        <div
          className="section-label"
          style={{ marginTop: 1 }}
        >
          {sub}
        </div>
      </div>

      {children}
    </div>
  );
}