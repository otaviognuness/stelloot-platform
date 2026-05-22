import { useState } from 'react'
import logo from '../assets/logo1.png'
import { loginUser, registerUser } from '../services/authService'

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

function passwordStrength(password) {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  const levels = [
    { width: '25%', color: '#d84f4f', label: 'Muito fraca' },
    { width: '50%', color: '#b7791f', label: 'Fraca' },
    { width: '75%', color: '#3f8f5f', label: 'Boa' },
    { width: '100%', color: '#111113', label: 'Forte' },
  ]

  return levels[score - 1] ?? levels[0]
}

function PasswordInput({ value, onChange, placeholder }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="password-field">
      <input
        className="lc-input"
        onChange={onChange}
        placeholder={placeholder}
        type={visible ? 'text' : 'password'}
        value={value}
      />
      <button
        className="lc-eye"
        onClick={() => setVisible((current) => !current)}
        type="button"
      >
        {visible ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  )
}

function FieldError({ message }) {
  if (!message) return <span className="lc-error" />

  return <span className="lc-error">{message}</span>
}

export default function LoginCard({ onSuccess, onBack }) {
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginErrs, setLoginErrs] = useState({})

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')
  const [regPass2, setRegPass2] = useState('')
  const [regErrs, setRegErrs] = useState({})

  async function handleLogin() {
    const errors = {}
    if (!loginEmail) errors.email = 'Informe seu email'
    else if (!isValidEmail(loginEmail)) errors.email = 'Email invalido'
    if (!loginPass) errors.pass = 'Informe sua senha'
    else if (loginPass.length < 8) errors.pass = 'Minimo 8 caracteres'

    if (Object.keys(errors).length) {
      setLoginErrs(errors)
      return
    }

    setLoading(true)
    setLoginErrs({})

    try {
      const response = await loginUser({ email: loginEmail, password: loginPass })
      onSuccess?.(response)
    } catch (error) {
      setLoginErrs({ form: error.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister() {
    const errors = {}
    if (!regName) errors.name = 'Informe seu nome'
    if (!regEmail) errors.email = 'Informe seu email'
    else if (!isValidEmail(regEmail)) errors.email = 'Email invalido'
    if (!regPass) errors.pass = 'Crie uma senha'
    else if (regPass.length < 8) errors.pass = 'Minimo 8 caracteres'
    if (!regPass2) errors.pass2 = 'Confirme a senha'
    else if (regPass !== regPass2) errors.pass2 = 'As senhas nao coincidem'

    if (Object.keys(errors).length) {
      setRegErrs(errors)
      return
    }

    setLoading(true)
    setRegErrs({})

    try {
      const response = await registerUser({
        username: regName,
        email: regEmail,
        password: regPass,
      })
      onSuccess?.(response)
    } catch (error) {
      setRegErrs({ form: error.message })
    } finally {
      setLoading(false)
    }
  }

  function handleGoogle() {
    alert('Google Auth precisa de um Client ID do Google Cloud. O login com JWT ja esta pronto.')
  }

  function handleForgot() {
    setLoginErrs((errors) => ({
      ...errors,
      form: 'Recuperacao de senha fica para uma proxima etapa.',
    }))
  }

  const strength = regPass ? passwordStrength(regPass) : null

  return (
    <section className="login-page">
      <button className="back-button" onClick={onBack} type="button">
        Voltar
      </button>

      <div className="login-card">
        <img src={logo} alt="Logo StelLoot" />
        <h2>{tab === 'login' ? 'Entrar na StelLoot' : 'Criar sua conta'}</h2>
        <p>
          {tab === 'login'
            ? 'Acesse sua wishlist, precos alvo e dashboard gamer.'
            : 'Crie sua conta para salvar jogos e acompanhar oportunidades.'}
        </p>

        <div className="lc-tabs">
          <button
            className={`lc-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => setTab('login')}
            type="button"
          >
            Entrar
          </button>
          <button
            className={`lc-tab${tab === 'register' ? ' active' : ''}`}
            onClick={() => setTab('register')}
            type="button"
          >
            Cadastrar
          </button>
        </div>

        {tab === 'login' ? (
          <>
            <div className="lc-field">
              <label className="lc-label">Email</label>
              <input
                className={`lc-input${loginErrs.email ? ' error' : ''}`}
                onChange={(event) => {
                  setLoginEmail(event.target.value)
                  setLoginErrs((errors) => ({ ...errors, email: '', form: '' }))
                }}
                placeholder="seuemail@email.com"
                type="email"
                value={loginEmail}
              />
              <FieldError message={loginErrs.email} />
            </div>

            <div className="lc-field">
              <label className="lc-label">Senha</label>
              <PasswordInput
                onChange={(event) => {
                  setLoginPass(event.target.value)
                  setLoginErrs((errors) => ({ ...errors, pass: '', form: '' }))
                }}
                placeholder="Minimo 8 caracteres"
                value={loginPass}
              />
              <FieldError message={loginErrs.pass} />
            </div>

            <button className="lc-link" onClick={handleForgot} type="button">
              Esqueceu a senha?
            </button>

            <button disabled={loading} onClick={handleLogin} type="button">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <FieldError message={loginErrs.form} />

            <div className="lc-divider">ou</div>
            <button className="lc-google" onClick={handleGoogle} type="button">
              Entrar com Google
            </button>
          </>
        ) : (
          <>
            <div className="lc-field">
              <label className="lc-label">Nome completo</label>
              <input
                className={`lc-input${regErrs.name ? ' error' : ''}`}
                onChange={(event) => {
                  setRegName(event.target.value)
                  setRegErrs((errors) => ({ ...errors, name: '', form: '' }))
                }}
                placeholder="Seu nome"
                type="text"
                value={regName}
              />
              <FieldError message={regErrs.name} />
            </div>

            <div className="lc-field">
              <label className="lc-label">Email</label>
              <input
                className={`lc-input${regErrs.email ? ' error' : ''}`}
                onChange={(event) => {
                  setRegEmail(event.target.value)
                  setRegErrs((errors) => ({ ...errors, email: '', form: '' }))
                }}
                placeholder="seuemail@email.com"
                type="email"
                value={regEmail}
              />
              <FieldError message={regErrs.email} />
            </div>

            <div className="lc-field">
              <label className="lc-label">Senha</label>
              <PasswordInput
                onChange={(event) => {
                  setRegPass(event.target.value)
                  setRegErrs((errors) => ({ ...errors, pass: '', form: '' }))
                }}
                placeholder="Minimo 8 caracteres"
                value={regPass}
              />
              <FieldError message={regErrs.pass} />
              {strength && (
                <div className="password-strength">
                  <div style={{ width: strength.width, background: strength.color }} />
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            <div className="lc-field">
              <label className="lc-label">Confirmar senha</label>
              <PasswordInput
                onChange={(event) => {
                  setRegPass2(event.target.value)
                  setRegErrs((errors) => ({ ...errors, pass2: '', form: '' }))
                }}
                placeholder="Repita a senha"
                value={regPass2}
              />
              <FieldError message={regErrs.pass2} />
            </div>

            <button disabled={loading} onClick={handleRegister} type="button">
              {loading ? 'Criando...' : 'Criar conta'}
            </button>
            <FieldError message={regErrs.form} />

            <div className="lc-divider">ou</div>
            <button className="lc-google" onClick={handleGoogle} type="button">
              Cadastrar com Google
            </button>
          </>
        )}
      </div>
    </section>
  )
}
