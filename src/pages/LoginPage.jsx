import { useState } from 'react'
import '../styles/LoginPage.css'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    console.log('Login:', { email, password })
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

            <button type="submit" className="login-btn">Login</button>
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
