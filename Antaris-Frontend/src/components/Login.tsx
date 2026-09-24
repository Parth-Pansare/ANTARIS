import { useState, useRef, useEffect } from 'react';
import { beginAuthentication, verifyOtp, AuthProvider } from '../services/authService';
import ModernLogin from './ModernLogin';

interface Props { onLogin: () => void; }

export default function Login({ onLogin }: Props) {
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Snow / blizzard canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const flakes = Array.from({ length: 160 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 0.4,
      vx: (Math.random() - 0.4) * 0.6,   // slight wind drift right
      vy: Math.random() * 0.8 + 0.3,
      a: Math.random() * 0.6 + 0.2,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      flakes.forEach(f => {
        f.x += f.vx; f.y += f.vy;
        if (f.y > canvas.height) { f.y = -4; f.x = Math.random() * canvas.width; }
        if (f.x > canvas.width) f.x = 0;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,235,255,${f.a})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  async function auth(provider: AuthProvider) {
    setLoading(true); setError('');
    const r = await beginAuthentication(provider, email);
    setLoading(false);
    if (!r.success) { setError(r.message || 'Authentication failed.'); return; }
    setStep('otp');
  }

  async function submit() {
    setLoading(true);
    const ok = await verifyOtp(otp);
    setLoading(false);
    if (ok) onLogin();
    else setError('Invalid OTP. Demo verification expects 123456.');
  }

  function handleOtpChange(index: number, val: string) {
    if (/[^0-9]/.test(val)) return;
    let chars = otp.split('');
    while (chars.length < 6) chars.push('');
    chars[index] = val.charAt(val.length - 1) || '';
    const newOtp = chars.join('').slice(0, 6);
    setOtp(newOtp);
    if (val && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
    else if (e.key === 'Enter' && otp.length === 6) submit();
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text) { setOtp(text); inputRefs.current[Math.min(text.length, 5)]?.focus(); }
  }

  return <ModernLogin onLogin={onLogin} />;

  return (
    <div style={{
      minHeight: '100vh', position: 'relative', display: 'grid', placeItems: 'center',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #010b14 0%, #021622 30%, #021e2c 55%, #031e2a 75%, #041c20 100%)',
      color: '#e7eef7',
    }}>
      {/* Snow canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }} />

      {/* ── Aurora Australis ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {/* Wide aurora band 1 - green */}
        <div style={{
          position: 'absolute', top: '4%', left: '-10%', width: '80%', height: '32vh',
          background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(32,200,120,0.22) 0%, rgba(0,180,100,0.08) 55%, transparent 100%)',
          filter: 'blur(18px)',
          animation: 'auroraWave1 11s ease-in-out infinite',
        }} />
        {/* Aurora band 2 - teal */}
        <div style={{
          position: 'absolute', top: '0%', right: '-5%', width: '65%', height: '40vh',
          background: 'radial-gradient(ellipse 70% 100% at 60% 0%, rgba(0,190,180,0.18) 0%, rgba(0,150,140,0.06) 60%, transparent 100%)',
          filter: 'blur(22px)',
          animation: 'auroraWave2 15s ease-in-out infinite',
        }} />
        {/* Aurora band 3 - violet edge */}
        <div style={{
          position: 'absolute', top: '8%', left: '30%', width: '50%', height: '28vh',
          background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(80,60,200,0.12) 0%, transparent 70%)',
          filter: 'blur(28px)',
          animation: 'auroraWave3 18s ease-in-out infinite',
        }} />
        {/* Faint star field */}
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${Math.random() * 60}%`,
            left: `${Math.random() * 100}%`,
            width: Math.random() > 0.85 ? 2 : 1,
            height: Math.random() > 0.85 ? 2 : 1,
            borderRadius: '50%',
            background: `rgba(200,230,255,${Math.random() * 0.5 + 0.1})`,
          }} />
        ))}
      </div>

      {/* ── Ice shelf / Antarctic landscape silhouette ── */}
      <svg viewBox="0 0 1440 260" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', zIndex: 2, pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="iceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d3a4e" stopOpacity="1" />
            <stop offset="100%" stopColor="#041520" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="iceHighlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(150,220,240,0.18)" />
            <stop offset="100%" stopColor="rgba(150,220,240,0)" />
          </linearGradient>
        </defs>
        {/* Far mountains */}
        <path d="M0,200 L60,140 L130,170 L200,100 L280,150 L360,80 L440,130 L520,90 L600,140 L680,70 L760,120 L840,60 L920,110 L1000,75 L1080,130 L1160,85 L1240,140 L1320,100 L1440,130 L1440,260 L0,260 Z"
          fill="url(#iceGrad)" opacity="0.7" />
        {/* Mid ice shelf */}
        <path d="M0,220 L80,190 L160,205 L240,185 L320,198 L400,180 L500,195 L600,175 L700,192 L800,178 L900,194 L1000,182 L1100,196 L1200,185 L1300,200 L1440,188 L1440,260 L0,260 Z"
          fill="url(#iceGrad)" />
        {/* Ice highlights / snow edge */}
        <path d="M0,221 Q80,210 160,220 Q240,208 320,218 Q400,207 500,215 Q600,206 700,216 Q800,208 900,218 Q1000,209 1100,219 Q1200,210 1300,220 L1440,215"
          fill="none" stroke="rgba(180,230,245,0.25)" strokeWidth="1.5" />
        {/* Research station silhouette */}
        <g transform="translate(560, 140)" opacity="0.75">
          {/* Main hab module */}
          <rect x="0" y="20" width="80" height="40" fill="#0a2535" rx="3" />
          {/* Dome */}
          <ellipse cx="40" cy="20" rx="30" ry="18" fill="#0a2535" />
          {/* Antenna */}
          <line x1="40" y1="2" x2="40" y2="-18" stroke="#0a2535" strokeWidth="2" />
          <circle cx="40" cy="-18" r="3" fill="#0a2535" />
          <line x1="34" y1="-10" x2="46" y2="-10" stroke="#0a2535" strokeWidth="1.5" />
          {/* Connecting corridor */}
          <rect x="80" y="32" width="40" height="16" fill="#0a2535" />
          {/* Side module */}
          <rect x="120" y="22" width="50" height="36" fill="#0a2535" rx="2" />
          {/* Windows - small cyan glow */}
          <rect x="12" y="32" width="8" height="6" fill="rgba(0,200,232,0.5)" rx="1" />
          <rect x="28" y="32" width="8" height="6" fill="rgba(0,200,232,0.4)" rx="1" />
          <rect x="130" y="30" width="7" height="5" fill="rgba(0,200,232,0.45)" rx="1" />
          <rect x="148" y="30" width="7" height="5" fill="rgba(255,200,80,0.4)" rx="1" />
          {/* Support legs */}
          <line x1="10" y1="60" x2="5" y2="78" stroke="#0a2535" strokeWidth="3" />
          <line x1="70" y1="60" x2="75" y2="78" stroke="#0a2535" strokeWidth="3" />
          <line x1="130" y1="58" x2="125" y2="76" stroke="#0a2535" strokeWidth="3" />
          <line x1="165" y1="58" x2="168" y2="76" stroke="#0a2535" strokeWidth="3" />
        </g>
        {/* Second distant station */}
        <g transform="translate(950, 165)" opacity="0.4">
          <rect x="0" y="10" width="50" height="25" fill="#0a2535" rx="2" />
          <ellipse cx="25" cy="10" rx="18" ry="10" fill="#0a2535" />
          <line x1="25" y1="0" x2="25" y2="-12" stroke="#0a2535" strokeWidth="1.5" />
          <circle cx="25" cy="-12" r="2" fill="#0a2535" />
          <rect x="5" y="18" width="6" height="4" fill="rgba(0,200,232,0.4)" rx="1" />
        </g>
      </svg>

      {/* ── Top bar ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 28px',
        borderBottom: '1px solid rgba(100,200,220,0.08)',
        backdropFilter: 'blur(12px)',
        background: 'rgba(1,11,20,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#4dd8e0' }}>
          <AntarisLogo size={26} />
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, letterSpacing: '0.22em', color: '#d8eef5', fontWeight: 700 }}>ANTARIS</span>
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: '#2a6070', letterSpacing: '0.1em', marginLeft: 4 }}>ANTARIS · REMOTE STATION INTELLIGENCE</span>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: '#2a5060', letterSpacing: '0.1em' }}>
            MAITRI · 70°46′S · QUEEN MAUD LAND
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono'", fontSize: 9, color: '#20c080', letterSpacing: '0.12em', padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(32,192,128,0.2)', background: 'rgba(32,192,128,0.06)' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#20c080', boxShadow: '0 0 5px #20c080', display: 'inline-block' }} />
            SYSTEM OPERATIONAL
          </div>
        </div>
      </div>

      {/* ── Login Card ── */}
      <div style={{ position: 'relative', zIndex: 10, width: 'min(94vw, 460px)', animation: 'cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
        {/* Card glow from aurora above */}
        <div style={{ position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)', width: 300, height: 50, background: 'radial-gradient(ellipse, rgba(32,200,120,0.15), transparent 70%)', filter: 'blur(12px)', pointerEvents: 'none' }} />

        <div style={{
          padding: '34px 38px', borderRadius: 14, position: 'relative',
          background: 'rgba(2,16,28,0.88)', backdropFilter: 'blur(28px)',
          border: '1px solid rgba(80,190,210,0.14)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(80,190,210,0.04), inset 0 1px 0 rgba(120,200,220,0.06)',
        }}>
          {/* Top accent line — ice blue */}
          <div style={{ position: 'absolute', top: 0, left: 36, right: 36, height: 2, borderRadius: '0 0 4px 4px', background: 'linear-gradient(90deg, transparent, #20c8d0, #20d890, transparent)' }} />

          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: 26, color: '#4dd8e0' }}>
            <AntarisLogo size={52} />
            <h1 style={{ fontSize: 30, letterSpacing: '0.14em', margin: '10px 0 3px', color: '#d8eef5', fontFamily: "'JetBrains Mono'", fontWeight: 700 }}>ANTARIS</h1>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 8.5, letterSpacing: '0.12em', color: '#2a6070' }}>
              ANTARCTIC INTELLIGENCE &amp; REMOTE OPERATIONS SYSTEM
            </div>
            <p style={{ fontSize: 11, color: '#3a6878', fontStyle: 'italic', marginTop: 5 }}>Monitor · Predict · Simulate · Decide</p>
          </div>

          {/* Station info strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 22 }}>
            {[
              { label: 'MAITRI', sub: '70°46′S · Queen Maud Land', temp: '−25°C', color: '#4dd8e0' },
              { label: 'BHARATI', sub: '69°24′S · Larsemann Hills', temp: '−18°C', color: '#20c890' },
            ].map(s => (
              <div key={s.label} style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}20`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>🏔</span>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: s.color, letterSpacing: '0.1em' }}>{s.label}</div>
                  <div style={{ fontSize: 8.5, color: '#2a5060', marginTop: 1 }}>{s.sub}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono'", fontSize: 11, color: '#4a8090', fontWeight: 700 }}>{s.temp}</div>
              </div>
            ))}
          </div>

          {step === 'login' ? (
            <>
              <form onSubmit={e => { e.preventDefault(); auth('password'); }} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                <label style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, letterSpacing: '0.12em', color: '#3a7080', display: 'block' }}>
                  MISSION EMAIL
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="operator@ncpor.res.in"
                    style={{ display: 'block', width: '100%', marginTop: 7, padding: '11px 13px', border: '1px solid rgba(80,190,210,0.18)', borderRadius: 8, background: 'rgba(0,10,22,0.75)', color: '#d8eef5', outline: 'none', fontSize: 13, boxSizing: 'border-box' }} />
                </label>
                <label style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, letterSpacing: '0.12em', color: '#3a7080', display: 'block' }}>
                  ACCESS CODE
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{ display: 'block', width: '100%', marginTop: 7, padding: '11px 13px', border: '1px solid rgba(80,190,210,0.18)', borderRadius: 8, background: 'rgba(0,10,22,0.75)', color: '#d8eef5', outline: 'none', fontSize: 13, boxSizing: 'border-box' }} />
                </label>
                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '13px', marginTop: 2,
                  background: 'linear-gradient(135deg, #0a6070, #0a9090, #10b8a0)',
                  border: 'none', borderRadius: 8, color: '#d8f8f4',
                  fontFamily: "'JetBrains Mono'", fontSize: 11, letterSpacing: '0.14em',
                  cursor: 'pointer', fontWeight: 700,
                  boxShadow: '0 0 24px rgba(10,160,160,0.25)',
                }}>
                  {loading ? 'AUTHENTICATING…' : 'SIGN IN TO MISSION CONTROL'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 13px' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(80,190,210,0.1)' }} />
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: '#2a5060', letterSpacing: '0.1em' }}>OR CONTINUE WITH</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(80,190,210,0.1)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'G  Google', fn: () => auth('google') },
                  { label: '⊞  Microsoft', fn: () => auth('microsoft') },
                  { label: '▣  Government ID', fn: () => auth('government'), full: true },
                ].map(b => (
                  <button key={b.label} onClick={b.fn} style={{ gridColumn: b.full ? '1/-1' : 'auto', padding: '10px', border: '1px solid rgba(80,190,210,0.12)', borderRadius: 7, background: 'rgba(255,255,255,0.025)', color: '#7ab8c8', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {b.label}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 16, padding: '10px 12px', border: '1px solid rgba(32,200,150,0.12)', background: 'rgba(32,200,150,0.04)', borderRadius: 8 }}>
                <b style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: '#20c890', letterSpacing: '0.1em' }}>◈ SECURE MISSION ENVIRONMENT</b>
                <span style={{ fontSize: 9, color: '#2a5060', marginTop: 4, display: 'block' }}>MFA protected · OAuth/OIDC ready · NCPOR backend authentication</span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 30, color: '#4dd8e0', marginBottom: 6 }}>⌁</div>
              <h2 style={{ fontFamily: "'JetBrains Mono'", fontSize: 18, letterSpacing: '0.08em', marginBottom: 6, color: '#d8eef5' }}>VERIFY MISSION ACCESS</h2>
              <p style={{ fontSize: 11, color: '#3a6878', lineHeight: 1.6, marginBottom: 4 }}>
                Enter the 6-digit OTP for <b style={{ color: '#8cc8d8' }}>{email || 'your identity provider'}</b>.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '18px 0 0' }} onPaste={handleOtpPaste}>
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <input key={i} ref={el => { inputRefs.current[i] = el; }} maxLength={1} inputMode="numeric"
                    value={otp[i] || ''} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)}
                    style={{ width: 44, height: 52, textAlign: 'center', border: '1px solid rgba(80,190,210,0.28)', borderRadius: 8, background: 'rgba(0,10,22,0.85)', color: '#d8eef5', fontSize: 20, fontFamily: "'JetBrains Mono'", fontWeight: 700, outline: 'none' }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button style={{ flex: 1, padding: '13px', background: 'linear-gradient(135deg, #0a6070, #0a9090, #10b8a0)', border: 'none', borderRadius: 8, color: '#d8f8f4', fontFamily: "'JetBrains Mono'", fontSize: 11, letterSpacing: '0.12em', cursor: 'pointer', fontWeight: 700 }} onClick={submit} disabled={loading}>
                  {loading ? 'VERIFYING…' : 'VERIFY OTP'}
                </button>
                <button style={{ padding: '0 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(80,190,210,0.12)', color: '#7ab8c8', borderRadius: 8, cursor: 'pointer', fontSize: 12 }} onClick={() => setOtp('123456')}>
                  Demo Fill
                </button>
              </div>
              <button style={{ display: 'block', margin: '14px auto 0', background: 'transparent', border: 0, color: '#4dd8e0', fontSize: 11, cursor: 'pointer' }} onClick={() => setStep('login')}>← Back to sign in</button>
              <small style={{ display: 'block', color: '#2a5060', marginTop: 14, fontSize: 9, lineHeight: 1.5 }}>Demo UI: use 123456. Real OTP generation belongs to Spring Boot backend.</small>
            </div>
          )}

          {error && <div style={{ marginTop: 12, padding: '9px 12px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.07)', color: '#ff8d8d', fontSize: 11 }}>{error}</div>}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 28px', borderTop: '1px solid rgba(80,190,210,0.07)',
        fontFamily: "'JetBrains Mono'", fontSize: 9, color: '#1e4050',
        backdropFilter: 'blur(10px)', background: 'rgba(1,11,20,0.55)',
      }}>
        <span>NCPOR · NATIONAL CENTRE FOR POLAR AND OCEAN RESEARCH · MINISTRY OF EARTH SCIENCES</span>
        <span>SIH26060 · ANTARCTIC DIGITAL TWIN · DEMO v1.0</span>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes auroraWave1 { 0%,100%{transform:scaleX(1) translateX(0);opacity:0.9} 50%{transform:scaleX(1.1) translateX(3%);opacity:1} }
        @keyframes auroraWave2 { 0%,100%{transform:scaleX(1) translateX(0);opacity:0.8} 50%{transform:scaleX(0.92) translateX(-4%);opacity:1} }
        @keyframes auroraWave3 { 0%,100%{transform:scaleX(1) translateY(0);opacity:0.7} 50%{transform:scaleX(1.06) translateY(10px);opacity:1} }
        @keyframes cardIn { from{opacity:0;transform:translateY(24px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>
    </div>
  );
}

export function AntarisLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <polygon points="20,2 38,11 38,29 20,38 2,29 2,11" stroke="currentColor" strokeWidth="1.5" fill="rgba(0,200,232,.05)" />
      <polygon points="20,8 32,14.5 32,25.5 20,32 8,25.5 8,14.5" stroke="currentColor" opacity=".65" />
      <circle cx="20" cy="20" r="4" fill="currentColor" />
      <path d="M20 2v6M20 32v6M2 11l6 3.5M32 25.5L38 29" stroke="currentColor" opacity=".5" />
    </svg>
  );
}
