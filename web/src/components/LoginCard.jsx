import { useState } from 'react'
import logo from '../assets/logo1.png'

// ── helpers ──────────────────────────────────────────────────────────────────
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

function passwordStrength(pass) {
  let score = 0
  if (pass.length >= 8) score++
  if (/[A-Z]/.test(pass)) score++
  if (/[0-9]/.test(pass)) score++
  if (/[^A-Za-z0-9]/.test(pass)) score++
  const levels = [
    { width: '25%', color: '#ff6b6b', label: 'Muito fraca' },
    { width: '50%', color: '#ffaa5b', label: 'Fraca' },
    { width: '75%', color: '#20f5b7', label: 'Boa' },
    { width: '100%', color: '#00d4ff', label: 'Forte' },
  ]
  return levels[score - 1] ?? levels[0]
}

// ── sub-components ────────────────────────────────────────────────────────────
function PasswordInput({ id, value, onChange, placeholder }) {
  const [visible, setVisible] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="lc-input"
        style={{ paddingRight: 44 }}
      />
      <button
        type="button"
        className="lc-eye"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {visible ? '🙈' : '👁'}
      </button>
    </div>
  )
}

function FieldError({ msg }) {
  return (
    <span style={{ fontSize: 12, color: '#ff6b6b', minHeight: 16, display: 'block', marginTop: 4 }}>
      {msg}
    </span>
  )
}

// ── main component ────────────────────────────────────────────────────────────
export default function LoginCard({ onSuccess, onBack }) {
  const [tab, setTab] = useState('login')   // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass]   = useState('')
  const [loginErrs, setLoginErrs]   = useState({})

  // register fields
  const [regName, setRegName]   = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass]   = useState('')
  const [regPass2, setRegPass2] = useState('')
  const [regErrs, setRegErrs]   = useState({})

  // ── handlers ────────────────────────────────────────────────────────────────
  function handleLogin() {
    const errs = {}
    if (!loginEmail) errs.email = 'Informe seu email'
    else if (!isValidEmail(loginEmail)) errs.email = 'Email inválido'
    if (!loginPass) errs.pass = 'Informe sua senha'
    else if (loginPass.length < 6) errs.pass = 'Mínimo 6 caracteres'
    if (Object.keys(errs).length) { setLoginErrs(errs); return }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccessMsg('Login realizado com sucesso!\nRedirecionando para a plataforma...')
      setDone(true)
      onSuccess?.({ email: loginEmail })
    }, 1800)
  }

  function handleRegister() {
    const errs = {}
    if (!regName) errs.name = 'Informe seu nome'
    if (!regEmail) errs.email = 'Informe seu email'
    else if (!isValidEmail(regEmail)) errs.email = 'Email inválido'
    if (!regPass) errs.pass = 'Crie uma senha'
    else if (regPass.length < 8) errs.pass = 'Mínimo 8 caracteres'
    if (!regPass2) errs.pass2 = 'Confirme a senha'
    else if (regPass !== regPass2) errs.pass2 = 'As senhas não coincidem'
    if (Object.keys(errs).length) { setRegErrs(errs); return }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccessMsg('Conta criada com sucesso!\nBem-vindo à StelLoot')
      setDone(true)
      onSuccess?.({ email: regEmail, name: regName })
    }, 2000)
  }

  function handleGoogle() {
    setSuccessMsg('Autenticado com Google.\nBem-vindo à StelLoot ')
    setDone(true)
    onSuccess?.({ provider: 'google' })
  }

  function handleForgot() {
    if (loginEmail && isValidEmail(loginEmail)) {
      alert(`Link de recuperação enviado para ${loginEmail}`)
    } else {
      setLoginErrs((e) => ({ ...e, email: 'Digite um email válido primeiro' }))
    }
  }

  const strength = regPass ? passwordStrength(regPass) : null

  // ── success screen ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <section className="login-page">
        <button className="back-button" onClick={() => { setDone(false); onBack?.() }}>
          ← Voltar
        </button>
        <div className="login-card" style={{ textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 10px' }}>Tudo certo!</h2>
          <p style={{ whiteSpace: 'pre-line' }}>{successMsg}</p>
          <button type="button" onClick={onBack} style={{ width: '100%', marginTop: 8 }}>
            Ir para página inicial
          </button>
        </div>
      </section>
    )
  }

  // ── form ────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .lc-tabs {
          display: flex;
          gap: 0;
          background: rgba(255,255,255,.05);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 22px;
        }
        .lc-tab {
          flex: 1;
          height: 36px;
          border: none;
          border-radius: 9px;
          font: 600 13px/1 Inter, sans-serif;
          cursor: pointer;
          transition: background .2s, color .2s;
          background: transparent;
          color: #9ca8c7;
        }
        .lc-tab.active {
          background: linear-gradient(135deg, #7c3cff, #00d4ff);
          color: #fff;
        }
        .lc-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }
        .lc-label {
          font-size: 13px;
          font-weight: 700;
          color: #c8d4ff;
        }
        .lc-input {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 14px;
          color: #fff;
          font: 14px Inter, sans-serif;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          box-sizing: border-box;
        }
        .lc-input:focus {
          border-color: rgba(0,212,255,.5);
          box-shadow: 0 0 0 3px rgba(0,212,255,.08);
        }
        .lc-input.error { border-color: rgba(255,80,80,.6); }
        .lc-input::placeholder { color: #4d5b7a; }
        .lc-eye {
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #4d5b7a;
          font-size: 16px;
          background: none;
          border: none;
          padding: 0;
          line-height: 1;
          transition: color .2s;
        }
        .lc-eye:hover { color: #9ca8c7; }
        .lc-divider {
          display: flex; align-items: center; gap: 10px;
          margin: 18px 0 4px;
          color: #4d5b7a;
          font-size: 12px;
        }
        .lc-divider::before, .lc-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,.08);
        }
        .lc-google {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.14);
          color: #fff;
          margin-top: 10px;
        }
        .lc-forgot {
          text-align: right;
          margin: -6px 0 10px;
        }
        .lc-link {
          color: #20f5b7;
          font-weight: 700;
          font-size: 13px;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
        }
        .lc-link:hover { text-decoration: underline; }
        .lc-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lc-spin .7s linear infinite;
          display: inline-block;
        }
        @keyframes lc-spin { to { transform: rotate(360deg); } }
      `}</style>

      <section className="login-page">
        <button className="back-button" onClick={onBack}>← Voltar</button>

        <div className="login-card">
          <img src={logo} alt="Logo StelLoot" />
          <h2>
            {tab === 'login' ? 'Entrar na StelLoot' : 'Criar sua conta'}
          </h2>
          <p>
            {tab === 'login'
              ? 'Acesse sua wishlist, alertas de preço e dashboard gamer.'
              : 'Junte-se à plataforma e nunca pague caro em jogos.'}
          </p>

          {/* tabs */}
          <div className="lc-tabs">
            <button
              className={`lc-tab${tab === 'login' ? ' active' : ''}`}
              onClick={() => setTab('login')}
            >
              Entrar
            </button>
            <button
              className={`lc-tab${tab === 'register' ? ' active' : ''}`}
              onClick={() => setTab('register')}
            >
              Cadastrar
            </button>
          </div>

          {tab === 'login' ? (
            /* ── LOGIN ── */
            <>
              <div className="lc-field">
                <label className="lc-label">Email</label>
                <input
                  className={`lc-input${loginErrs.email ? ' error' : ''}`}
                  type="email"
                  placeholder="seuemail@email.com"
                  value={loginEmail}
                  onChange={(e) => { setLoginEmail(e.target.value); setLoginErrs((x) => ({ ...x, email: '' })) }}
                />
                <FieldError msg={loginErrs.email} />
              </div>

              <div className="lc-field">
                <label className="lc-label">Senha</label>
                <PasswordInput
                  id="loginPass"
                  value={loginPass}
                  placeholder="Digite sua senha"
                  onChange={(e) => { setLoginPass(e.target.value); setLoginErrs((x) => ({ ...x, pass: '' })) }}
                />
                <FieldError msg={loginErrs.pass} />
              </div>

              <div className="lc-forgot">
                <button type="button" className="lc-link" onClick={handleForgot}>
                  Esqueceu a senha?
                </button>
              </div>

              <button type="button" onClick={handleLogin} disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                {loading ? <span className="lc-spinner" /> : 'Entrar'}
              </button>

              <div className="lc-divider">ou</div>

              <button type="button" className="lc-google" onClick={handleGoogle}>
                <GoogleIcon /> Entrar com Google
              </button>
            </>
          ) : (
            /* ── REGISTER ── */
            <>
              <div className="lc-field">
                <label className="lc-label">Nome completo</label>
                <input
                  className={`lc-input${regErrs.name ? ' error' : ''}`}
                  type="text"
                  placeholder="Seu nome"
                  value={regName}
                  onChange={(e) => { setRegName(e.target.value); setRegErrs((x) => ({ ...x, name: '' })) }}
                />
                <FieldError msg={regErrs.name} />
              </div>

              <div className="lc-field">
                <label className="lc-label">Email</label>
                <input
                  className={`lc-input${regErrs.email ? ' error' : ''}`}
                  type="email"
                  placeholder="seuemail@email.com"
                  value={regEmail}
                  onChange={(e) => { setRegEmail(e.target.value); setRegErrs((x) => ({ ...x, email: '' })) }}
                />
                <FieldError msg={regErrs.email} />
              </div>

              <div className="lc-field">
                <label className="lc-label">Senha</label>
                <PasswordInput
                  id="regPass"
                  value={regPass}
                  placeholder="Mínimo 8 caracteres"
                  onChange={(e) => { setRegPass(e.target.value); setRegErrs((x) => ({ ...x, pass: '' })) }}
                />
                <FieldError msg={regErrs.pass} />
                {regPass && strength && (
                  <>
                    <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,.08)', marginTop: 6 }}>
                      <div style={{ height: '100%', borderRadius: 4, width: strength.width, background: strength.color, transition: 'width .3s, background .3s' }} />
                    </div>
                    <span style={{ fontSize: 11, color: strength.color, marginTop: 4, display: 'block' }}>
                      {strength.label}
                    </span>
                  </>
                )}
              </div>

              <div className="lc-field">
                <label className="lc-label">Confirmar senha</label>
                <PasswordInput
                  id="regPass2"
                  value={regPass2}
                  placeholder="Repita a senha"
                  onChange={(e) => { setRegPass2(e.target.value); setRegErrs((x) => ({ ...x, pass2: '' })) }}
                />
                <FieldError msg={regErrs.pass2} />
              </div>

              <button type="button" onClick={handleRegister} disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                {loading ? <span className="lc-spinner" /> : 'Criar conta'}
              </button>

              <div className="lc-divider">ou</div>

              <button type="button" className="lc-google" onClick={handleGoogle}>
                <GoogleIcon /> Cadastrar com Google
              </button>
            </>
          )}
        </div>
      </section>
    </>
  )
}

// ── Google icon ───────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}