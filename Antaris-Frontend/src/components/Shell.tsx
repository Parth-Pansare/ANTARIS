import React from 'react';
import { Icons, LiveBadge } from './Icons';
import { AntarisLogo } from './Login';
import type { Screen } from '../App';

interface Props {
  children: React.ReactNode;
  active: Screen;
  onNavigate: (s: Screen) => void;
  station: 'MAITRI' | 'BHARATI';
  onStationChange: (s: 'MAITRI' | 'BHARATI') => void;
  onLogout: () => void;
  theme: string;
  onTheme: (t: string) => void;
}

const nav: {
  id: Screen;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}[] = [
  ['overview', 'Overview', Icons.overview],
  ['twin', 'Digital Twin', Icons.twin],
  ['environment', 'Environment', Icons.environment],
  ['energy', 'Energy', Icons.energy],
  ['equipment', 'Equipment', Icons.equipment],
  ['logistics', 'Logistics', Icons.logistics],
  ['predictions', 'Predictions', Icons.predictions],
  ['simulation', 'Simulations', Icons.simulation],
  ['decision', 'Decision & Recommendations', Icons.comparison],
  ['scenariocmp', 'Scenario Compare', Icons.comparison],
  ['alerts', 'Alerts', Icons.alerts, 3],
  ['maintenance', 'Maintenance', Icons.maintenance],
  ['reports', 'Reports', Icons.reports],
  ['comparison', 'Station Compare', Icons.comparison],
  ['settings', 'Settings', Icons.settings],
].map((x) => ({
  id: x[0] as Screen,
  label: x[1] as string,
  icon: x[2],
  badge: x[3] as number | undefined,
}));

const themes = ['Dark', 'Light'];
const stations = ['MAITRI', 'BHARATI'] as const;

function time(station: 'MAITRI' | 'BHARATI') {
  const n = new Date();
  const u =
    n.getTime() +
    n.getTimezoneOffset() * 60000;

  const offset = station === 'MAITRI' ? 0 : 5;

  return new Date(
    u + offset * 60 * 60000,
  ).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

const searchItems = [
  ...nav.map((n) => ({
    type: 'Screen',
    label: n.label,
    target: n.id,
  })),
  {
    type: 'Equipment',
    label: 'Generator G-01',
    target: 'equipment',
  },
  {
    type: 'Equipment',
    label: 'Battery B-02',
    target: 'equipment',
  },
  {
    type: 'Alert',
    label: 'Thermal Warning H-04',
    target: 'alerts',
  },
];

export default function Shell(p: Props) {
  const [t, setT] = React.useState(
    time(p.station),
  );

  const [mobile, setMobile] =
    React.useState(false);

  const [syncCounter, setSyncCounter] =
    React.useState(0);

  const [searchQuery, setSearchQuery] =
    React.useState('');

  const [searchOpen, setSearchOpen] =
    React.useState(false);

  const [stationOpen, setStationOpen] =
    React.useState(false);

  const searchInputRef =
    React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setT(time(p.station));

    const x = setInterval(() => {
      setT(time(p.station));

      setSyncCounter((c) =>
        c >= 15 ? 0 : c + 1,
      );
    }, 1000);

    return () => clearInterval(x);
  }, [p.station]);

  React.useEffect(() => {
    const handleKeyDown = (
      e: KeyboardEvent,
    ) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === 'k'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () =>
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
  }, []);

  const filteredSearch =
    searchItems.filter((x) =>
      x.label
        .toLowerCase()
        .includes(
          searchQuery.toLowerCase(),
        ),
    );

  return (
    <div className="app-shell">
      {mobile && (
        <div
          className="mobile-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background:
              'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
          onClick={() =>
            setMobile(false)
          }
        />
      )}

      <aside
        className={
          'sidebar ' +
          (mobile
            ? 'mobile-open'
            : '')
        }
      >
        <div className="brand-block">
          <div className="brand-row">
            <AntarisLogo size={32} />

            <div>
              <div className="brand-name font-display">
                ANTARIS
              </div>

              <div className="brand-sub font-mono">
                MISSION CONTROL
              </div>
            </div>
          </div>

          <div className="station-selector">
            <span className="selector-label">
              ACTIVE STATION
            </span>

            <div
              style={{
                position: 'relative',
                width: '100%',
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setStationOpen((open) => !open)
                }
                aria-haspopup="listbox"
                aria-expanded={stationOpen}
                style={{
                  width: '100%',
                  height: 38,
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#061923',
                  color: '#00d9ff',
                  border: '1px solid #00d9ff',
                  borderRadius: 8,
                  fontFamily: 'inherit',
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  cursor: 'pointer',
                }}
              >
                <span>{p.station}</span>
                <span
                  style={{
                    fontSize: 14,
                    transform: stationOpen
                      ? 'rotate(180deg)'
                      : 'rotate(0deg)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  ▾
                </span>
              </button>

              {stationOpen && (
                <div
                  role="listbox"
                  aria-label="Active station"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    padding: 4,
                    background: '#071824',
                    border: '1px solid #0b6475',
                    borderRadius: 8,
                    boxShadow:
                      '0 12px 28px rgba(0, 0, 0, 0.45)',
                  }}
                >
                  {stations.map((station) => (
                    <button
                      key={station}
                      type="button"
                      role="option"
                      aria-selected={
                        p.station === station
                      }
                      onClick={() => {
                        p.onStationChange(station);
                        setStationOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: 'none',
                        borderRadius: 6,
                        background:
                          p.station === station
                            ? 'rgba(0, 217, 255, 0.12)'
                            : 'transparent',
                        color:
                          p.station === station
                            ? '#00d9ff'
                            : '#d7e7ee',
                        fontFamily: 'inherit',
                        fontSize: 15,
                        fontWeight:
                          p.station === station
                            ? 600
                            : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span>{station}</span>
                      {p.station === station && (
                        <span>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {nav.map((i) => (
            <button
              key={i.id}
              className={
                'nav-item ' +
                (p.active === i.id
                  ? 'active'
                  : '')
              }
              onClick={() => {
                p.onNavigate(i.id);
                setMobile(false);
              }}
            >
              <span className="nav-icon">
                {i.icon}
              </span>

              <span>{i.label}</span>

              {i.badge && (
                <span className="nav-badge">
                  {i.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="system-online">
            <span className="status-dot live" />
            SYSTEM ONLINE
          </div>

          <button
            className="profile-mini"
            onClick={() =>
              p.onNavigate('profile')
            }
            title="View Profile"
            aria-label="View Profile"
          >
            <span className="avatar-sm">
              DP
            </span>

            <span>
              <b>Dr. D. Pillai</b>
              <small>
                STATION COMMANDER
              </small>
            </span>

            <span>›</span>
          </button>

          <div className="footer-actions">
            <select
              className="appearance-select"
              value={p.theme}
              onChange={(e) =>
                p.onTheme(
                  e.target.value,
                )
              }
              title="Change appearance"
              aria-label="Change appearance"
            >
              {themes.map((x) => (
                <option key={x}>
                  {x}
                </option>
              ))}
            </select>

            <button
              onClick={p.onLogout}
              title="Log Out"
              aria-label="Log Out"
            >
              ↪
            </button>
          </div>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() =>
              setMobile(!mobile)
            }
            aria-label="Toggle Menu"
          >
            ☰
          </button>

          <div className="station-meta">
            <span className="top-station font-display">
              {p.station} STATION
            </span>

            <span className="top-coords">
              {p.station === 'MAITRI'
                ? '71°S 11°E · Queen Maud Land'
                : '69°S 76°E · Prydz Bay'}
            </span>

            <LiveBadge />
          </div>

          <div className="top-actions">
            <div
              className="search-container"
              style={{
                position:
                  'relative',
              }}
            >
              <input
                ref={
                  searchInputRef
                }
                className="global-search"
                placeholder="Search systems… (Ctrl+K)"
                value={
                  searchQuery
                }
                onChange={(e) => {
                  setSearchQuery(
                    e.target.value,
                  );
                  setSearchOpen(
                    true,
                  );
                }}
                onFocus={() =>
                  setSearchOpen(
                    true,
                  )
                }
                onBlur={() =>
                  setTimeout(
                    () =>
                      setSearchOpen(
                        false,
                      ),
                    200,
                  )
                }
              />

              {searchOpen &&
                searchQuery && (
                  <div
                    className="search-dropdown glass-strong"
                    style={{
                      position:
                        'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      zIndex: 100,
                      padding: 8,
                      borderRadius: 6,
                    }}
                  >
                    {filteredSearch.map(
                      (
                        item,
                        idx,
                      ) => (
                        <button
                          key={idx}
                          style={{
                            display:
                              'block',
                            width:
                              '100%',
                            textAlign:
                              'left',
                            padding:
                              '6px 8px',
                            background:
                              'none',
                            color:
                              'inherit',
                            border:
                              'none',
                            cursor:
                              'pointer',
                            borderRadius:
                              4,
                          }}
                          onClick={() => {
                            p.onNavigate(
                              item.target as Screen,
                            );

                            setSearchQuery(
                              '',
                            );

                            setSearchOpen(
                              false,
                            );
                          }}
                        >
                          <small
                            style={{
                              opacity:
                                0.6,
                              marginRight:
                                8,
                              display:
                                'inline-block',
                              minWidth:
                                60,
                            }}
                          >
                            {
                              item.type
                            }
                          </small>

                          {
                            item.label
                          }
                        </button>
                      ),
                    )}

                    {filteredSearch.length ===
                      0 && (
                      <div
                        style={{
                          padding: 8,
                          opacity:
                            0.6,
                        }}
                      >
                        No results found
                      </div>
                    )}
                  </div>
                )}
            </div>

            <div className="clock">
              <b>{t}</b>

              <small>
                ANTARCTIC LOCAL · UTC+
                {p.station === 'MAITRI'
                  ? '0'
                  : '5'}
              </small>
            </div>

            <span
              className="sync"
              style={{
                color:
                  syncCounter === 0
                    ? 'var(--color-live)'
                    : 'inherit',
                transition:
                  'color 0.2s',
              }}
            >
              SYNC{' '}
              {syncCounter
                .toString()
                .padStart(
                  2,
                  '0',
                )}
              s AGO
            </span>

            <button
              className="notification"
              onClick={() =>
                p.onNavigate(
                  'alerts',
                )
              }
              aria-label="Alerts"
              title="Alerts"
            >
              ♢<i>3</i>
            </button>
          </div>
        </header>

        <main className="content-area">
          {p.children}
        </main>
      </div>
    </div>
  );
}
