import './theme-polish.css';
import { useEffect, useState } from 'react';
import Login from './components/Login';
import Shell from './components/Shell';
import Overview from './components/Overview';
import DigitalTwin from './components/DigitalTwin';
import Environment from './components/Environment';
import Energy from './components/Energy';
import Logistics from './components/Logistics';
import Equipment from './components/Equipment';
import Predictions from './components/Predictions';
import Simulation from './components/Simulation';
import Decision from './components/Decision';
import Alerts from './components/Alerts';
import Maintenance from './components/Maintenance';
import Reports from './components/Reports';
import Comparison from './components/Comparison';
import ScenarioComparison from './components/ScenarioComparison';
import Profile from './components/Profile';
import AIAssistant from './components/AIAssistant';

export type Screen =
  | 'overview'
  | 'twin'
  | 'environment'
  | 'energy'
  | 'equipment'
  | 'logistics'
  | 'predictions'
  | 'simulation'
  | 'decision'
  | 'scenariocmp'
  | 'alerts'
  | 'maintenance'
  | 'reports'
  | 'settings'
  | 'comparison'
  | 'profile';

const themes = ['Dark', 'Light'] as const;

function initialTheme() {
  return themes[0];
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const [screen, setScreen] =
    useState<Screen>('overview');

  const [station, setStation] =
    useState<'MAITRI' | 'BHARATI'>('MAITRI');

  const [theme, setTheme] =
    useState<string>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme =
      theme.toLowerCase();

    if (theme === 'Dark') {
      localStorage.setItem(
        'antaris-theme',
        'Dark',
      );
    } else {
      localStorage.setItem(
        'antaris-theme',
        'Light',
      );
    }
  }, [theme]);

  const render = () => {
    switch (screen) {
      case 'overview':
        return <Overview station={station} />;

      case 'twin':
        return <DigitalTwin station={station} />;

      case 'environment':
        return (
          <Environment station={station} />
        );

      case 'energy':
        return <Energy station={station} />;

      case 'logistics':
        return (
          <Logistics station={station} />
        );

      case 'equipment':
        return (
          <Equipment station={station} />
        );

      case 'predictions':
        return <Predictions station={station} />;

      case 'simulation':
        return <Simulation station={station} />;

      case 'decision':
        return <Decision station={station} />;

      case 'scenariocmp':
        return <ScenarioComparison />;

      case 'alerts':
        return <Alerts station={station} />;

      case 'maintenance':
        return (
          <Maintenance station={station} />
        );

      case 'reports':
        return <Reports />;

      case 'comparison':
        return <Comparison />;

      case 'profile':
        return (
          <Profile
            theme={theme}
            onTheme={setTheme}
            onLogout={() =>
              setLoggedIn(false)
            }
          />
        );

      case 'settings':
        return (
          <Settings
            theme={theme}
            onTheme={setTheme}
          />
        );

      default:
        return <Overview station={station} />;
    }
  };

  if (!loggedIn) {
    return (
      <Login
        onLogin={() => setLoggedIn(true)}
      />
    );
  }

  return (
    <Shell
      active={screen}
      onNavigate={setScreen}
      station={station}
      onStationChange={setStation}
      onLogout={() => setLoggedIn(false)}
      theme={theme}
      onTheme={setTheme}
    >
      {render()}
      <AIAssistant />
    </Shell>
  );
}

function Settings({
  theme,
  onTheme,
}: {
  theme: string;
  onTheme: (t: string) => void;
}) {
  const [refreshRate, setRefreshRate] =
    useState('5s');

  const [alertSound, setAlertSound] =
    useState(true);

  const [retention, setRetention] =
    useState('30d');

  const [sensitivity, setSensitivity] =
    useState('medium');

  return (
    <div className="page-shell">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            PLATFORM / CONFIGURATION
          </div>

          <h1 className="page-title">
            SYSTEM SETTINGS
          </h1>

          <p className="page-subtitle">
            Mission platform configuration and
            operator preferences.
          </p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-grid">
          <div
            className="kpi-card setting-card"
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span
              style={{ fontWeight: 600 }}
            >
              Telemetry Refresh Rate
            </span>

            <select
              value={refreshRate}
              onChange={(e) =>
                setRefreshRate(
                  e.target.value,
                )
              }
              style={{
                background: '#0f172a',
                color: '#e2e8f0',
                border:
                  '1px solid rgba(255,255,255,0.15)',
                padding: '6px',
                borderRadius: '4px',
              }}
            >
              <option value="1s">
                1 Second
              </option>

              <option value="5s">
                5 Seconds
              </option>

              <option value="15s">
                15 Seconds
              </option>

              <option value="60s">
                60 Seconds
              </option>
            </select>

            <small
              style={{ opacity: 0.6 }}
            >
              How often dashboard telemetry
              updates.
            </small>
          </div>

          <div
            className="kpi-card setting-card"
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span
              style={{ fontWeight: 600 }}
            >
              Alert Sensitivity
            </span>

            <select
              value={sensitivity}
              onChange={(e) =>
                setSensitivity(
                  e.target.value,
                )
              }
              style={{
                background: '#0f172a',
                color: '#e2e8f0',
                border:
                  '1px solid rgba(255,255,255,0.15)',
                padding: '6px',
                borderRadius: '4px',
              }}
            >
              <option value="low">
                Low (Only Critical)
              </option>

              <option value="medium">
                Medium (Warning & Critical)
              </option>

              <option value="high">
                High (All Anomalies)
              </option>
            </select>

            <small
              style={{ opacity: 0.6 }}
            >
              Threshold for triggering AI alerts.
            </small>
          </div>

          <div
            className="kpi-card setting-card"
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span
              style={{ fontWeight: 600 }}
            >
              Notification Sounds
            </span>

            <button
              onClick={() =>
                setAlertSound(
                  !alertSound,
                )
              }
              style={{
                padding: '6px 12px',
                background: alertSound
                  ? 'var(--color-primary)'
                  : 'rgba(255,255,255,0.05)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {alertSound
                ? 'Enabled'
                : 'Muted'}
            </button>

            <small
              style={{ opacity: 0.6 }}
            >
              Play sounds for incoming alerts.
            </small>
          </div>

          <div
            className="kpi-card setting-card"
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span
              style={{ fontWeight: 600 }}
            >
              Data Retention Policy
            </span>

            <select
              value={retention}
              onChange={(e) =>
                setRetention(
                  e.target.value,
                )
              }
              style={{
                background: '#0f172a',
                color: '#e2e8f0',
                border:
                  '1px solid rgba(255,255,255,0.15)',
                padding: '6px',
                borderRadius: '4px',
              }}
            >
              <option value="7d">
                7 Days
              </option>

              <option value="30d">
                30 Days
              </option>

              <option value="90d">
                90 Days
              </option>

              <option value="1y">
                1 Year
              </option>
            </select>

            <small
              style={{ opacity: 0.6 }}
            >
              Duration to store historical
              telemetry.
            </small>
          </div>
        </div>

        <div className="glass panel-pad">
          <div className="section-title">
            APPEARANCE
          </div>

          <p className="panel-note">
            Choose the ANTARIS interface
            appearance. All mission surfaces
            use the same design system in either
            mode.
          </p>

          <select
            value={theme}
            onChange={(e) =>
              onTheme(e.target.value)
            }
            className="theme-select large"
          >
            {themes.map((t) => (
              <option
                key={t}
                value={t}
              >
                {t}
              </option>
            ))}
          </select>

          <div className="theme-swatches">
            {themes.map((t) => (
              <button
                key={t}
                className={
                  'theme-chip ' +
                  (theme === t
                    ? 'selected'
                    : '')
                }
                onClick={() =>
                  onTheme(t)
                }
              >
                <span
                  className={
                    'appearance-dot ' +
                    t.toLowerCase()
                  }
                />

                {t} appearance
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}