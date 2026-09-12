import { useState } from "react";

interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => onLogin(), 1200);
  };

  return (
    <div
      className="aurora-bg grid-overlay"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Polar glow orbs */}
      <div style={{
        position: "absolute",
        top: "20%",
        left: "15%",
        width: 400,
        height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,200,232,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        bottom: "20%",
        right: "15%",
        width: 300,
        height: 300,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Horizontal scan line */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        background: "linear-gradient(90deg, transparent, rgba(0,200,232,0.3), transparent)",
        animation: "scan-line 8s linear infinite",
        pointerEvents: "none",
      }} />

      {/* Top bar */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 32px",
        borderBottom: "1px solid rgba(0,200,232,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <PolarisLogo size={28} />
          <span className="font-display" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.05em", color: "#e2e8f0" }}>POLARIS</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 6px #10b981" }} />
          <span className="font-mono" style={{ fontSize: 11, color: "#475569", letterSpacing: "0.05em" }}>SYSTEM STATUS: OPERATIONAL</span>
        </div>
      </div>

      {/* Login card */}
      <div className="glass-strong" style={{
        width: "100%",
        maxWidth: 420,
        padding: "48px 40px",
        borderRadius: 12,
        position: "relative",
      }}>
        {/* Top accent line */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 40,
          right: 40,
          height: 2,
          background: "linear-gradient(90deg, transparent, #00c8e8, transparent)",
          borderRadius: 1,
        }} />

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <PolarisLogo size={52} />
          </div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "0.08em", color: "#e2e8f0", marginBottom: 6 }}>
            POLARIS
          </h1>
          <p className="font-display" style={{ fontSize: 13, color: "#00c8e8", letterSpacing: "0.12em", fontWeight: 500, marginBottom: 10 }}>
            ANTARCTIC DIGITAL TWIN
          </p>
          <p style={{ fontSize: 12, color: "#475569", fontStyle: "italic" }}>
            Remote Intelligence for Extreme Environments
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="section-label" style={{ display: "block", marginBottom: 6 }}>Mission Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="operator@ncpor.res.in"
              style={{
                width: "100%",
                padding: "11px 14px",
                background: "rgba(7,13,26,0.8)",
                border: "1px solid rgba(0,200,232,0.2)",
                borderRadius: 6,
                color: "#e2e8f0",
                fontSize: 14,
                outline: "none",
                fontFamily: "Inter, sans-serif",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(0,200,232,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(0,200,232,0.2)")}
            />
          </div>
          <div>
            <label className="section-label" style={{ display: "block", marginBottom: 6 }}>Access Code</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                width: "100%",
                padding: "11px 14px",
                background: "rgba(7,13,26,0.8)",
                border: "1px solid rgba(0,200,232,0.2)",
                borderRadius: 6,
                color: "#e2e8f0",
                fontSize: 14,
                outline: "none",
                fontFamily: "Inter, sans-serif",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(0,200,232,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(0,200,232,0.2)")}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: 8, width: "100%", padding: "13px 20px", fontSize: 15, letterSpacing: "0.12em" }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span style={{ width: 14, height: 14, border: "2px solid rgba(7,13,26,0.3)", borderTopColor: "#070d1a", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                AUTHENTICATING...
              </span>
            ) : "SIGN IN TO MISSION"}
          </button>
        </form>

        <div style={{ marginTop: 28, padding: "14px", background: "rgba(0,200,232,0.04)", border: "1px solid rgba(0,200,232,0.1)", borderRadius: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="4.5" width="10" height="7" rx="1" stroke="#00c8e8" strokeWidth="1.2"/>
              <path d="M3.5 4.5V3a2.5 2.5 0 015 0v1.5" stroke="#00c8e8" strokeWidth="1.2"/>
            </svg>
            <span className="font-mono" style={{ fontSize: 10, color: "#00c8e8", letterSpacing: "0.1em" }}>SECURE MISSION ENVIRONMENT</span>
          </div>
          <p style={{ fontSize: 11, color: "#475569" }}>AES-256 encrypted · TLS 1.3 · MFA protected · NCPOR classified network</p>
        </div>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <span style={{ fontSize: 11, color: "#2d3748", cursor: "pointer" }}>Forgot access code?</span>
          <span style={{ color: "#1a2535", margin: "0 8px" }}>·</span>
          <span style={{ fontSize: 11, color: "#2d3748", cursor: "pointer" }}>Contact Mission Control</span>
        </div>
      </div>

      {/* Bottom strip */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 32px",
        borderTop: "1px solid rgba(0,200,232,0.06)",
      }}>
        <span className="font-mono" style={{ fontSize: 10, color: "#1e2d3d" }}>NCPOR — NATIONAL CENTRE FOR POLAR AND OCEAN RESEARCH</span>
        <span className="font-mono" style={{ fontSize: 10, color: "#1e2d3d" }}>v3.2.1 · BUILD 2026.09</span>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function PolarisLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <polygon points="20,2 38,11 38,29 20,38 2,29 2,11" stroke="#00c8e8" strokeWidth="1.5" fill="rgba(0,200,232,0.05)"/>
      <polygon points="20,8 32,14.5 32,25.5 20,32 8,25.5 8,14.5" stroke="#00c8e8" strokeWidth="1" fill="rgba(0,200,232,0.03)" opacity="0.6"/>
      <circle cx="20" cy="20" r="4" fill="#00c8e8" opacity="0.9"/>
      <line x1="20" y1="2" x2="20" y2="8" stroke="#00c8e8" strokeWidth="1" opacity="0.5"/>
      <line x1="20" y1="32" x2="20" y2="38" stroke="#00c8e8" strokeWidth="1" opacity="0.5"/>
      <line x1="2" y1="11" x2="8" y2="14.5" stroke="#00c8e8" strokeWidth="1" opacity="0.5"/>
      <line x1="32" y1="25.5" x2="38" y2="29" stroke="#00c8e8" strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}
