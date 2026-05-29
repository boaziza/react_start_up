import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    fetch('http://localhost:4000/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) { setError(data.error || 'Login failed'); return }
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/overview')
      })
      .catch(() => setError('Could not connect to server'))
      .finally(() => setLoading(false))
  }

  return (
    <div className="page">

      {/* Left side - login form */}
      <div className="left-panel">
        <div className="form-container">
          <h2>Sign in to continue</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            <div className="row">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
              <a href="#">Forgot Password?</a>
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{error}</p>}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>

            <div className="row">
              <span>Don't have an account?</span>
              <a href="#" onClick={() => navigate('/')}>Sign Up</a>
            </div>
          </form>
        </div>

        <p className="powered-by">Powered by Co-Creation Hub</p>
      </div>

      {/* Right side - banner */}
      <div className="right-panel">
        <div className="banner-text">
          <h3>Serving Patients During a Pandemic</h3>
          <p>
            Delivering essential medication to NIMR patients with adherence
            to quality of service, care and confidentiality.
          </p>
        </div>
      </div>

    </div>
  )
}
