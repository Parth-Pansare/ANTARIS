// SVG icon set for POLARIS
export const Icons = {
  overview: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  twin: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" stroke="currentColor" strokeWidth="1.2"/>
      <polygon points="8,4 12,6.5 12,9.5 8,12 4,9.5 4,6.5" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  environment: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1 8h14M8 1c-2.5 3-2.5 9 0 14M8 1c2.5 3 2.5 9 0 14" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  energy: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M9 1L4 9h5l-2 6 7-9h-5l1-5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  ),
  equipment: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  logistics: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="5" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M11 8h2.5l1.5 2v3h-4V8z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="4" cy="13" r="1.2" stroke="currentColor" strokeWidth="1"/>
      <circle cx="12" cy="13" r="1.2" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  predictions: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 13L6 7l3 4 3-6 2 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="13" cy="3" r="2" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  simulation: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="4" cy="12" r="2" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M6 4h4M4 6v4M12 6v4M6 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  alerts: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1l7 13H1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M8 6v4M8 11.5v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  maintenance: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M12 2l-2 2 2 2 2-2-2-2zM6 8L2 12l1 1 4-4-1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M10 4L6 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  reports: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  comparison: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="9" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
};

export const StatusDot = ({ status }: { status: 'normal' | 'warning' | 'critical' | 'offline' | 'monitoring' }) => {
  const colors = {
    normal: '#10b981',
    warning: '#f59e0b',
    critical: '#ef4444',
    offline: '#475569',
    monitoring: '#00c8e8',
  };
  return (
    <span
      style={{
        display: 'inline-block',
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: colors[status],
        boxShadow: `0 0 6px ${colors[status]}`,
        flexShrink: 0,
      }}
    />
  );
};

export const LiveBadge = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: 'rgba(0,200,232,0.08)', border: '1px solid rgba(0,200,232,0.2)', borderRadius: 4 }}>
    <span className="pulse-live" style={{ width: 6, height: 6, borderRadius: '50%', background: '#00c8e8', display: 'inline-block', boxShadow: '0 0 8px #00c8e8' }} />
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#00c8e8' }}>LIVE</span>
  </div>
);
