import { useRef, useState } from 'react';
import { beginAuthentication, verifyOtp, AuthProvider } from '../services/authService';
import { AntarisLogo } from './Login';

interface Props { onLogin: () => void; }


export default function ModernLogin({ onLogin }: Props) {
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function auth(provider: AuthProvider) {
    setLoading(true); setError('');
    const result = await beginAuthentication(provider, email);
    setLoading(false);
    if (!result.success) { setError(result.message || 'Authentication failed.'); return; }
    setStep('otp');
  }

  async function submit() {
    setLoading(true); setError('');
    const valid = await verifyOtp(otp);
    setLoading(false);
    if (valid) onLogin(); else setError('Invalid OTP. Demo verification expects 123456.');
  }

  function handleOtpChange(index: number, value: string) {
    if (/[^0-9]/.test(value)) return;
    const chars = otp.padEnd(6, ' ').split('');
    chars[index] = value.charAt(value.length - 1) || ' ';
    setOtp(chars.join('').trimEnd().slice(0, 6));
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleOtpPaste(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const value = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    inputRefs.current[Math.min(value.length, 5)]?.focus();
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <div className="login-brand"><AntarisLogo size={30} /><span>ANTARIS</span><small>SECURE ACCESS</small></div>
        <div className="login-header-meta"><span>MINISTRY OF EARTH SCIENCES</span><span className="status-mark"><i /> PLATFORM READY</span></div>
      </header>

      <div className="login-layout">
        <section className="access-panel">
          <div className="access-heading"><div><span className="panel-kicker">AUTHORIZED PERSONNEL</span><h2>Access ANTARIS</h2></div><div className="access-lock">SECURE<br />MFA</div></div>
          {step === 'login' ? <>
            <form onSubmit={event => { event.preventDefault(); auth('password'); }} className="access-form">
              <label>OFFICIAL EMAIL<input type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="operator@ncpor.res.in" /></label>
              <label>ACCESS CODE<input type="password" required value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter access code" /></label>
              <button type="submit" disabled={loading} className="access-submit">{loading ? 'AUTHENTICATING...' : 'CONTINUE TO COMMAND CENTRE'}<span>↗</span></button>
            </form>
            <div className="access-divider"><span>OR CONTINUE WITH</span></div>
            <div className="provider-grid">{[{ label: 'Google Workspace', fn: () => auth('google') }, { label: 'Microsoft Entra ID', fn: () => auth('microsoft') }, { label: 'Government identity', fn: () => auth('government'), full: true }].map(provider => <button key={provider.label} onClick={provider.fn} className={provider.full ? 'provider-full' : ''}>{provider.label}<span>↗</span></button>)}</div>
            <div className="access-note"><b>ACCESS CONTROLLED ENVIRONMENT</b><span>Authentication is handled through the authorized backend. All operator actions are audit logged.</span></div>
          </> : <div className="otp-panel"><span className="panel-kicker">SECOND FACTOR REQUIRED</span><h2>Verify mission access</h2><p>Enter the six-digit code sent to <b>{email || 'your identity provider'}</b>.</p><div className="otp-inputs" onPaste={handleOtpPaste}>{[0, 1, 2, 3, 4, 5].map(index => <input key={index} ref={element => { inputRefs.current[index] = element; }} maxLength={1} inputMode="numeric" value={otp[index] || ''} onChange={event => handleOtpChange(index, event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && otp.length === 6) submit(); if (event.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus(); }} />)}</div><button className="access-submit" onClick={submit} disabled={loading}>{loading ? 'VERIFYING...' : 'VERIFY ACCESS'}<span>↗</span></button><button className="back-link" onClick={() => setStep('login')}>← Return to sign in</button><small>Demo verification: 123456</small></div>}
          {error && <div className="login-error">{error}</div>}
          <footer className="access-footer">ANTARIS v1.0 <span>•</span> SIH26060 <span>•</span> NCPOR DEMONSTRATION INSTANCE</footer>
        </section>
      </div>

      <style>{`
        .login-page{min-height:100vh;overflow:auto;position:relative;background:#08121c;color:#e6eef3;font-family:Inter,sans-serif;background-image:linear-gradient(115deg,rgba(11,33,46,.96),rgba(6,16,25,.98) 54%,rgba(18,32,37,.96)),radial-gradient(circle at 18% 20%,rgba(77,184,173,.13),transparent 32%)}.login-header{height:72px;padding:0 5vw;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(177,210,215,.14);position:relative;z-index:2}.login-brand{display:flex;align-items:center;gap:12px;color:#a9e0d7}.login-brand>span{font:700 17px 'JetBrains Mono';letter-spacing:.18em;color:#eef5f2}.login-brand small,.login-header-meta,.panel-kicker,.login-kicker,.stage-label,.stage-readout,.login-disclaimer,.access-footer{font:10px 'JetBrains Mono';letter-spacing:.12em}.login-brand small{color:#718891;border-left:1px solid #3b5961;padding-left:12px}.login-header-meta{display:flex;align-items:center;gap:26px;color:#82949d}.status-mark{color:#9bd4c8}.status-mark i{display:inline-block;width:6px;height:6px;background:#5ec9a9;border-radius:50%;margin-right:7px}.login-layout{width:min(1240px,90vw);min-height:calc(100vh - 72px);margin:auto;display:grid;grid-template-columns:1.08fr .92fr;gap:clamp(44px,7vw,120px);align-items:center;padding:44px 0 52px}.login-briefing{animation:login-rise .7s ease both}.login-kicker,.panel-kicker{color:#74c4b7}.login-briefing h1{font:500 clamp(38px,4.7vw,68px)/1.02 Rajdhani,sans-serif;letter-spacing:.01em;margin:19px 0;color:#f1f5f3}.login-briefing h1 em{font-style:normal;color:#91cfc4}.login-lead{max-width:610px;font-size:15px;line-height:1.75;color:#afc0c5;margin:0}.login-pipeline{display:flex;align-items:center;gap:17px;margin-top:28px}.pipeline-step{display:flex;align-items:center;gap:8px;color:#dce9e8}.pipeline-step span{font:10px 'JetBrains Mono';color:#6a8b91}.pipeline-step b{font:600 11px 'JetBrains Mono';letter-spacing:.1em}.pipeline-step i{font-style:normal;color:#5d8b8e;margin-left:7px}.station-stage{height:300px;max-width:650px;margin-top:32px;border:1px solid rgba(141,194,194,.2);position:relative;overflow:hidden;background:linear-gradient(180deg,rgba(92,157,161,.09),rgba(7,19,28,.1) 64%),repeating-linear-gradient(90deg,rgba(129,194,190,.09) 0 1px,transparent 1px 44px)}.stage-grid{position:absolute;left:-10%;right:-10%;bottom:-65%;height:75%;transform:perspective(360px) rotateX(61deg);transform-origin:top;border-top:1px solid rgba(140,207,200,.3);background:repeating-linear-gradient(90deg,rgba(122,199,193,.18) 0 1px,transparent 1px 48px),repeating-linear-gradient(0deg,rgba(122,199,193,.15) 0 1px,transparent 1px 34px)}.station-3d{position:absolute;left:39%;top:102px;width:225px;height:120px;transform:perspective(600px) rotateX(58deg) rotateZ(-9deg);transform-style:preserve-3d;filter:drop-shadow(0 22px 9px rgba(0,0,0,.55));animation:station-float 5s ease-in-out infinite}.station-module{position:absolute;background:linear-gradient(135deg,#314952,#172e39);border:1px solid #759b9b;box-shadow:inset 0 0 18px rgba(118,211,194,.13);transform-style:preserve-3d;color:#a4d8cf;font:9px 'JetBrains Mono';letter-spacing:.12em}.station-module span{position:absolute;top:-22px;left:5px;white-space:nowrap}.station-module i{display:inline-block;width:17px;height:8px;margin:18px 3px;background:#83cbbb;box-shadow:0 0 8px rgba(127,210,193,.45)}.station-module-main{width:140px;height:74px;left:0;top:20px;padding:14px}.station-module-side{width:77px;height:51px;left:148px;top:31px;padding:7px}.station-module-side i{width:12px;height:6px;margin:16px 2px}.station-dome{position:absolute;left:46px;top:-9px;width:68px;height:40px;border:1px solid #82aaa6;border-bottom:0;border-radius:70px 70px 0 0;background:linear-gradient(90deg,#2f5258,#152e39);transform:translateZ(2px)}.station-antenna{position:absolute;left:80px;top:-49px;height:43px;border-left:1px solid #9ed3c8}.station-antenna i{position:absolute;top:-4px;left:-4px;width:7px;height:7px;border:1px solid #b7e5d7;border-radius:50%}.station-leg{position:absolute;top:92px;width:2px;height:25px;background:#9bb7b4}.leg-a{left:23px}.leg-b{left:120px}.leg-c{left:185px}.stage-label{position:absolute;top:17px;left:18px;color:#7eaaa9}.stage-readout{position:absolute;right:18px;top:16px;text-align:right;color:#6c989b}.stage-readout b{display:block;font:600 21px Rajdhani;color:#dbebe6;letter-spacing:.05em;margin:3px 0}.stage-readout small{font-size:8px}.stage-callout{position:absolute;border-left:1px solid #78c5b8;padding-left:9px;color:#7fa7a6;font:9px 'JetBrains Mono';line-height:1.5}.stage-callout b{display:block;color:#bedbd4;font-size:8px}.callout-a{top:114px;left:18px}.callout-b{right:17px;bottom:27px}.stage-line{height:1px;background:#70b9b1;position:absolute;opacity:.65}.line-a{width:82px;top:139px;left:113px;transform:rotate(-31deg)}.line-b{width:75px;right:104px;bottom:71px;transform:rotate(28deg)}.login-disclaimer{color:#69848c;font-size:8px;margin-top:11px;letter-spacing:.04em}.access-panel{background:#f1f4f1;color:#14262c;padding:36px 38px 24px;max-width:475px;justify-self:end;width:100%;box-shadow:0 24px 80px rgba(0,0,0,.26);animation:login-rise .7s .12s ease both}.access-heading{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #ccd8d5;padding-bottom:23px}.access-heading h2,.otp-panel h2{font:600 31px Rajdhani;margin:7px 0 0;color:#142c35}.access-lock{font:9px 'JetBrains Mono';line-height:1.45;text-align:right;color:#4b7778;border:1px solid #afc9c2;padding:6px 8px}.access-form{display:flex;flex-direction:column;gap:18px;margin-top:25px}.access-form label{font:10px 'JetBrains Mono';letter-spacing:.1em;color:#537477}.access-form input{width:100%;display:block;margin-top:8px;padding:13px 12px;border:1px solid #bdcdca;background:#fff;color:#18323a;font:13px Inter;outline:none}.access-form input:focus,.otp-inputs input:focus{border-color:#3b8a81;box-shadow:0 0 0 2px rgba(59,138,129,.12)}.access-submit{width:100%;display:flex;align-items:center;justify-content:space-between;margin-top:3px;padding:14px 15px;border:0;background:#174b50;color:#f2f8f4;font:600 11px 'JetBrains Mono';letter-spacing:.08em;cursor:pointer}.access-submit:hover{background:#236b69}.access-submit span,.provider-grid button span{font-size:16px}.access-divider{display:flex;align-items:center;gap:10px;margin:24px 0 13px;color:#7e9695;font:9px 'JetBrains Mono'}.access-divider:before,.access-divider:after{content:'';height:1px;background:#d0dcda;flex:1}.provider-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.provider-grid button{display:flex;justify-content:space-between;align-items:center;padding:11px 12px;border:1px solid #c7d4d1;background:transparent;color:#31565b;font:11px Inter;cursor:pointer}.provider-grid button:hover{border-color:#438c83;background:#e6efeb}.provider-grid .provider-full{grid-column:1/-1}.access-note{margin-top:22px;padding:12px;background:#e4eeea;border-left:2px solid #4f9d8b}.access-note b{display:block;color:#36736d;font:9px 'JetBrains Mono';letter-spacing:.08em}.access-note span{display:block;margin-top:5px;color:#688381;font-size:10px;line-height:1.5}.access-footer{border-top:1px solid #d1ddda;margin-top:27px;padding-top:15px;color:#7a9290;font-size:8px}.access-footer span{padding:0 6px;color:#b3c1be}.login-error{margin-top:13px;padding:10px;background:#fbe8e5;color:#a8473d;border-left:2px solid #c76155;font-size:11px}.otp-panel{margin-top:26px}.otp-panel p{font-size:12px;line-height:1.6;color:#607876}.otp-panel p b{color:#214e51}.otp-inputs{display:flex;gap:8px;margin:23px 0}.otp-inputs input{width:45px;height:52px;text-align:center;border:1px solid #bdcdca;background:#fff;color:#18323a;font:700 20px 'JetBrains Mono';outline:none}.back-link{border:0;background:none;color:#36736d;display:block;margin:16px auto 0;cursor:pointer;font-size:11px}.otp-panel small{display:block;text-align:center;margin-top:18px;color:#819391;font-size:10px}@keyframes login-rise{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:none}}@keyframes station-float{0%,100%{transform:perspective(600px) rotateX(58deg) rotateZ(-9deg) translateY(0)}50%{transform:perspective(600px) rotateX(58deg) rotateZ(-9deg) translateY(-5px)}}
  @media(max-width:900px){.login-layout{grid-template-columns:1fr;gap:28px;padding-top:34px}.access-panel{justify-self:stretch;max-width:none}.login-briefing h1{font-size:48px}.station-stage{max-width:none}.login-header-meta span:first-child{display:none}}@media(max-width:560px){.login-header{padding:0 20px}.login-brand small{display:none}.login-header-meta{font-size:8px}.login-layout{width:calc(100% - 40px);padding:28px 0 38px}.login-briefing h1{font-size:39px}.login-lead{font-size:13px}.login-pipeline{gap:8px;justify-content:space-between}.pipeline-step{gap:4px}.pipeline-step b{font-size:8px}.pipeline-step i{margin-left:0}.station-stage{height:250px}.station-3d{left:27%;top:93px;transform:scale(.82) perspective(600px) rotateX(58deg) rotateZ(-9deg)}.access-panel{padding:28px 22px 20px}.access-heading h2{font-size:27px}.provider-grid{grid-template-columns:1fr}.provider-grid .provider-full{grid-column:auto}.otp-inputs{gap:5px}.otp-inputs input{width:calc((100vw - 94px)/6);max-width:45px}}
        /* Login surface follows the ANTARIS command-centre visual system. */
        .login-page{background:#070d1a;color:#e2e8f0;background-image:radial-gradient(circle at 18% 22%,rgba(0,200,232,.08),transparent 28%),linear-gradient(135deg,#070d1a 0%,#0a1628 58%,#07141f 100%)}
        .login-page:before{content:'';position:absolute;inset:72px 0 0;background-image:linear-gradient(rgba(0,200,232,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,232,.035) 1px,transparent 1px);background-size:42px 42px;pointer-events:none;mask-image:linear-gradient(90deg,#000,transparent 78%)}
        .login-header{height:64px;padding:0 28px;background:rgba(7,13,26,.9);border-bottom:1px solid rgba(0,200,232,.15)}.login-brand{color:#00c8e8}.login-brand>span{font:700 19px Rajdhani;letter-spacing:.14em}.login-brand small{font:10px 'JetBrains Mono';color:#475569;border-color:rgba(0,200,232,.15)}.login-header-meta{font:10px 'JetBrains Mono';color:#64748b}.status-mark{color:#10b981}.status-mark i{background:#10b981;box-shadow:0 0 8px #10b981}
        .login-layout{position:relative;z-index:1;width:min(1320px,calc(100% - 56px));min-height:calc(100vh - 64px);grid-template-columns:minmax(0,1.22fr) minmax(360px,.78fr);gap:48px;padding:36px 0 42px}.login-kicker,.panel-kicker{color:#00c8e8;font:10px 'JetBrains Mono';letter-spacing:.15em}.login-briefing h1{font:600 clamp(42px,5.1vw,76px)/.94 Rajdhani;color:#e2e8f0;letter-spacing:.02em;margin:17px 0 18px}.login-briefing h1 em{color:#00c8e8}.login-lead{max-width:680px;font-size:14px;line-height:1.7;color:#94a3b8}.login-pipeline{gap:10px;margin-top:25px}.pipeline-step{min-width:135px;padding:10px 12px;background:rgba(13,27,46,.72);border:1px solid rgba(0,200,232,.12);border-radius:4px}.pipeline-step b{color:#cbd5e1;font:600 10px 'JetBrains Mono'}.pipeline-step i{color:#00c8e8}.pipeline-step span{color:#475569}
        .station-stage{height:320px;max-width:none;margin-top:23px;border:1px solid rgba(0,200,232,.18);background:linear-gradient(180deg,rgba(10,30,48,.74),rgba(7,13,26,.88) 72%),repeating-linear-gradient(90deg,rgba(0,200,232,.05) 0 1px,transparent 1px 44px);box-shadow:inset 0 0 70px rgba(0,0,0,.25)}.stage-grid{border-top-color:rgba(0,200,232,.35);background:repeating-linear-gradient(90deg,rgba(0,200,232,.14) 0 1px,transparent 1px 48px),repeating-linear-gradient(0deg,rgba(0,200,232,.12) 0 1px,transparent 1px 34px)}.stage-label,.stage-readout{color:#64748b}.stage-readout b{color:#e2e8f0}.station-3d{filter:drop-shadow(0 20px 12px rgba(0,0,0,.7))}.station-module{background:linear-gradient(135deg,#183449,#0d1b2e);border-color:#287c92;box-shadow:inset 0 0 18px rgba(0,200,232,.14)}.station-module span{color:#00c8e8}.station-module i{background:#00c8e8;box-shadow:0 0 8px rgba(0,200,232,.55)}.station-dome{border-color:#5b9eb1;background:linear-gradient(90deg,#183f52,#0d1b2e)}.station-antenna{border-color:#00c8e8}.station-antenna i{border-color:#00c8e8}.station-leg{background:#557b8d}.stage-callout{color:#64748b;border-color:#00c8e8}.stage-callout b{color:#94a3b8}.login-disclaimer{color:#475569}
        .access-panel{background:rgba(13,27,46,.94);color:#e2e8f0;padding:28px 30px 22px;max-width:460px;border:1px solid rgba(0,200,232,.18);border-radius:8px;box-shadow:0 22px 55px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.035);backdrop-filter:blur(18px)}.access-heading{border-bottom-color:rgba(0,200,232,.14);padding-bottom:19px}.access-heading h2,.otp-panel h2{font:600 28px Rajdhani;color:#e2e8f0}.access-lock{color:#00c8e8;border-color:rgba(0,200,232,.25);background:rgba(0,200,232,.04)}.access-form{margin-top:22px;gap:15px}.access-form label{color:#64748b}.access-form input{margin-top:7px;padding:12px;background:#070d1a;color:#e2e8f0;border-color:rgba(148,163,184,.2);border-radius:4px;font:13px Inter}.access-form input::placeholder{color:#475569}.access-form input:focus,.otp-inputs input:focus{border-color:#00c8e8;box-shadow:0 0 0 2px rgba(0,200,232,.1)}.access-submit{background:linear-gradient(135deg,#00a8c2,#0ea5e9);color:#06111b;border-radius:4px;font:700 10px 'JetBrains Mono';box-shadow:0 0 20px rgba(0,200,232,.14)}.access-submit:hover{background:#00c8e8}.access-divider{color:#475569}.access-divider:before,.access-divider:after{background:rgba(0,200,232,.14)}.provider-grid button{padding:10px 12px;border-color:rgba(148,163,184,.16);background:rgba(7,13,26,.5);color:#94a3b8;border-radius:4px}.provider-grid button:hover{border-color:rgba(0,200,232,.35);background:rgba(0,200,232,.06)}.access-note{margin-top:18px;padding:11px;background:rgba(16,185,129,.05);border-color:#10b981}.access-note b{color:#10b981}.access-note span{color:#64748b}.access-footer{border-color:rgba(0,200,232,.12);color:#475569}.login-error{background:rgba(239,68,68,.08);color:#ff8d8d;border-color:#ef4444}.otp-inputs input{background:#070d1a;color:#e2e8f0;border-color:rgba(148,163,184,.2);border-radius:4px}.back-link{color:#00c8e8}.otp-panel p{color:#94a3b8}.otp-panel p b{color:#cbd5e1}.otp-panel small{color:#475569}
        @media(max-width:900px){.login-layout{grid-template-columns:1fr;gap:28px}.access-panel{max-width:none}.login-briefing h1{font-size:54px}}@media(max-width:560px){.login-header{padding:0 18px}.login-brand small{display:none}.login-header-meta{font-size:8px}.login-layout{width:calc(100% - 36px);padding:28px 0}.login-briefing h1{font-size:45px}.login-pipeline{display:grid;grid-template-columns:1fr 1fr;gap:7px}.pipeline-step{min-width:0}.pipeline-step i{display:none}.station-stage{height:255px}.station-3d{left:27%;top:92px}.access-panel{padding:24px 20px 18px}.provider-grid{grid-template-columns:1fr}.provider-grid .provider-full{grid-column:auto}}
        /* Final ANTARIS login contrast pass: clear hierarchy, no faded verification copy. */
        .login-page{
          background:#07131f;
          color:#eaf4f6;
          background-image:
            radial-gradient(circle at 18% 18%,rgba(0,200,232,.11),transparent 30%),
            radial-gradient(circle at 84% 12%,rgba(16,185,129,.07),transparent 25%),
            linear-gradient(135deg,#07131f 0%,#0a1b2a 55%,#08151f 100%);
        }
        .login-page:before{
          background-image:
            linear-gradient(rgba(54,183,205,.055) 1px,transparent 1px),
            linear-gradient(90deg,rgba(54,183,205,.055) 1px,transparent 1px);
        }
        .login-header{
          background:rgba(7,19,31,.96);
          border-bottom:1px solid rgba(96,198,216,.22);
        }
        .login-brand>span{color:#f1f7f8}
        .login-brand small{color:#7fa0aa;border-color:rgba(96,198,216,.28)}
        .login-header-meta{color:#91a7ae}
        .login-kicker,.panel-kicker{color:#20c7df;font-weight:700}
        .access-panel{
          background:#f8fbfc;
          color:#102a35;
          border:1px solid #b9d4da;
          box-shadow:0 24px 65px rgba(0,0,0,.38),0 0 0 1px rgba(0,200,232,.06);
          backdrop-filter:none;
        }
        .access-heading{border-bottom-color:#c7dadd}
        .access-heading h2,.otp-panel h2{
          color:#102a35 !important;
          font-family:Rajdhani,sans-serif;
          font-weight:700;
          letter-spacing:.015em;
          text-shadow:none;
        }
        .access-heading h2{font-size:30px}
        .otp-panel h2{font-size:30px}
        .access-lock{
          color:#087f94;
          border-color:#a7cdd4;
          background:#eef8fa;
          font-weight:700;
        }
        .access-form label{
          color:#46636c;
          font-weight:700;
        }
        .access-form input{
          background:#ffffff;
          color:#102a35;
          border-color:#b7ccd1;
        }
        .access-form input::placeholder{color:#78919a}
        .access-submit{
          background:linear-gradient(135deg,#078da5,#0b9ec0);
          color:#ffffff;
          border:1px solid #087d91;
          box-shadow:0 7px 18px rgba(7,141,165,.2);
        }
        .access-submit:hover{background:#087f94}
        .access-divider{color:#668089}
        .access-divider:before,.access-divider:after{background:#cadadd}
        .provider-grid button{
          background:#ffffff;
          color:#294d58;
          border-color:#c2d4d8;
        }
        .provider-grid button:hover{
          background:#eef8fa;
          color:#0b6578;
          border-color:#55aebb;
        }
        .access-note{
          background:#edf8f4;
          border-left-color:#10a47b;
        }
        .access-note b{color:#08775f}
        .access-note span{color:#526f76}
        .access-footer{
          color:#718890;
          border-color:#d0dfe2;
        }
        .login-error{
          background:#fff0ee;
          color:#a23d35;
          border-color:#d85a50;
        }
        .otp-panel{margin-top:26px}
        .otp-panel .panel-kicker{
          display:block;
          margin-bottom:4px;
          color:#078da5;
        }
        .otp-panel p{
          color:#506c75 !important;
          font-size:12px;
        }
        .otp-panel p b{color:#173f49 !important}
        .otp-inputs input{
          background:#ffffff;
          color:#102a35 !important;
          border-color:#a9c8cf;
          box-shadow:0 2px 6px rgba(16,42,53,.04);
        }
        .otp-inputs input:focus{
          border-color:#078da5;
          box-shadow:0 0 0 3px rgba(7,141,165,.12);
        }
        .back-link{color:#087f94;font-weight:600}
        .otp-panel small{color:#70888f}

        /* Viewport-fit command screen and a deeper station silhouette. */
        @media(min-width:901px){.login-page{height:100vh;overflow:hidden}.login-layout{height:calc(100vh - 64px);min-height:0;align-items:start;padding:20px 0 18px}.login-briefing h1{margin-top:14px;margin-bottom:14px}.login-lead{line-height:1.55}.login-pipeline{margin-top:18px}.station-stage{height:300px;margin-top:18px}.access-panel{margin-top:0}}
        .station-3d{width:300px;height:170px;left:36%;top:82px;transform:perspective(720px) rotateX(58deg) rotateZ(-9deg) scale(1.08);transform-style:preserve-3d}
        .station-3d:before{content:'';position:absolute;left:-32px;top:74px;width:350px;height:88px;background:linear-gradient(135deg,rgba(14,38,54,.98),rgba(5,16,28,.98));border:1px solid rgba(0,200,232,.55);transform:translateZ(-8px) skewX(-8deg);box-shadow:0 18px 18px rgba(0,0,0,.58),inset 0 0 20px rgba(0,200,232,.1)}
        .station-3d:after{content:'MAITRI / OPERATIONAL MODEL';position:absolute;left:22px;top:139px;color:#00c8e8;font:8px 'JetBrains Mono';letter-spacing:.16em;white-space:nowrap;transform:translateZ(5px) rotateX(-58deg) rotateZ(9deg)}
        .station-module-main{width:174px;height:86px;left:0;top:20px;padding:17px;transform:translateZ(12px)}.station-module-side{width:98px;height:62px;left:187px;top:34px;padding:9px;transform:translateZ(8px)}.station-module i{width:23px;height:10px;margin:21px 4px}.station-module-side i{width:15px;height:7px;margin:20px 3px}.station-dome{left:57px;top:-12px;width:84px;height:48px;transform:translateZ(18px)}.station-antenna{left:100px;top:-62px;height:53px;transform:translateZ(20px)}.station-leg{top:108px;height:31px}.leg-a{left:30px}.leg-b{left:150px}.leg-c{left:245px}
        @media(max-width:900px){.station-3d{width:270px;height:150px;left:34%;top:86px;transform:perspective(720px) rotateX(58deg) rotateZ(-9deg) scale(.9)}}
        .station-stage{background:radial-gradient(ellipse at 50% 58%,rgba(0,200,232,.08),transparent 48%),linear-gradient(180deg,#0b1b2b,#070d1a 76%);background-image:radial-gradient(ellipse at 50% 58%,rgba(0,200,232,.08),transparent 48%),linear-gradient(180deg,#0b1b2b,#070d1a 76%)}.station-3d{left:50%;transform:translateX(-50%) perspective(720px) rotateX(58deg) rotateZ(-9deg) scale(1.08)}
        @media(max-width:900px){.station-3d{left:50%;transform:translateX(-50%) perspective(720px) rotateX(58deg) rotateZ(-9deg) scale(.9)}}
        .login-layout{grid-template-columns:minmax(360px,460px);justify-content:center;gap:0}.access-panel{justify-self:center;width:100%}
        @media(max-width:560px){.login-layout{grid-template-columns:minmax(0,1fr);width:calc(100% - 36px)}}
      `}</style>
    </main>
  );
}
