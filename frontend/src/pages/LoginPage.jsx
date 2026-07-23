import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap');
.login-root{font-family:'Tajawal',system-ui,sans-serif;min-height:100vh;
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#0C3B2E 0%,#1A5C42 50%,#0C3B2E 100%);
  position:relative;overflow:hidden;}
.login-root::before{content:'';position:absolute;inset:0;
  background-image:radial-gradient(circle at 25% 25%,rgba(197,160,40,.08) 0%,transparent 50%),
    radial-gradient(circle at 75% 75%,rgba(197,160,40,.06) 0%,transparent 50%);}
.login-card{background:rgba(255,255,255,.97);border-radius:20px;padding:40px 36px;
  width:100%;max-width:420px;position:relative;z-index:1;
  box-shadow:0 24px 80px rgba(0,0,0,.35);}
.login-logo{text-align:center;margin-bottom:28px;}
.login-title{font-size:26px;font-weight:800;color:#0C3B2E;margin:8px 0 4px;}
.login-sub{font-size:13px;color:#6B8070;}
.lfi{display:flex;flex-direction:column;gap:6px;margin-bottom:18px;}
.lfi label{font-size:13px;font-weight:700;color:#1A2B22;}
.lfi input{padding:12px 14px;border:1.5px solid #DDD5C0;border-radius:10px;
  font-family:inherit;font-size:15px;outline:none;transition:border .15s;background:#fff;}
.lfi input:focus{border-color:#0C3B2E;box-shadow:0 0 0 3px rgba(12,59,46,.08);}
.lfi input.err{border-color:#E53935;}
.btn-login{width:100%;padding:14px;background:linear-gradient(135deg,#0C3B2E,#1A5C42);
  color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:16px;font-weight:700;
  cursor:pointer;transition:opacity .15s;margin-top:4px;}
.btn-login:hover{opacity:.9;}
.btn-login:disabled{opacity:.6;cursor:not-allowed;}
.login-err{background:#FFF0F0;border:1px solid #FFCDD2;border-radius:8px;
  padding:10px 14px;font-size:13px;color:#C62828;margin-bottom:16px;text-align:center;}
.lang-row{display:flex;justify-content:center;gap:8px;margin-bottom:24px;}
.llb{padding:5px 14px;border-radius:20px;border:1.5px solid #DDD5C0;background:transparent;
  font-family:inherit;font-size:12px;font-weight:700;color:#6B8070;cursor:pointer;}
.llb.a{background:#0C3B2E;border-color:#0C3B2E;color:#fff;}
`;

const LABELS = {
  fr: { title:'Daara de Touba', sub:'Système de gestion — Administration', email:'Adresse email',
        pwd:'Mot de passe', btn:'Se connecter', logging:'Connexion…',
        err:'Identifiants invalides. Veuillez réessayer.', hint:'Connectez-vous pour gérer les daara' },
  ar: { title:'دارات طوبى', sub:'نظام الإدارة', email:'البريد الإلكتروني',
        pwd:'كلمة المرور', btn:'تسجيل الدخول', logging:'جارٍ التحقق…',
        err:'بيانات الدخول غير صحيحة.', hint:'سجّل دخولك لإدارة الدارات' },
};

export default function LoginPage({ lang: propLang = 'fr', onLangChange }) {
  const { login, setError } = useAuth();
  const [lang, setLang]   = useState(propLang);
  const [email, setEmail] = useState('');
  const [pwd, setPwd]     = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr]     = useState('');
  const L = LABELS[lang];

  const handleLang = (l) => { setLang(l); onLangChange?.(l); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !pwd) { setErr(L.err); return; }
    setErr(''); setLoading(true);
    try {
      await login(email, pwd);
    } catch (ex) {
      setErr(ex.message || L.err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="login-root">
        <div className="login-card" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {/* Lang toggle */}
          <div className="lang-row">
            {['fr','ar'].map(l => (
              <button key={l} className={`llb ${lang===l?'a':''}`} onClick={() => handleLang(l)}>
                {l === 'fr' ? '🇫🇷 Français' : '🇸🇳 العربية'}
              </button>
            ))}
          </div>

          {/* Logo */}
          <div className="login-logo">
            <div style={{ fontSize: 52, lineHeight: 1 }}>🕌</div>
            <div className="login-title">{L.title}</div>
            <div className="login-sub">{L.sub}</div>
          </div>

          {/* Error */}
          {err && <div className="login-err">⚠ {err}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="lfi">
              <label>{L.email}</label>
              <input
                type="email" value={email} className={err ? 'err' : ''}
                onChange={e => setEmail(e.target.value)} autoComplete="email"
                placeholder="admin@daara-touba.sn" dir="ltr"
              />
            </div>
            <div className="lfi">
              <label>{L.pwd}</label>
              <input
                type="password" value={pwd} className={err ? 'err' : ''}
                onChange={e => setPwd(e.target.value)} autoComplete="current-password"
                placeholder="••••••••" dir="ltr"
              />
            </div>
            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? `⏳ ${L.logging}` : L.btn}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#B0B8B2' }}>
            {L.hint}
          </div>
        </div>
      </div>
    </>
  );
}
