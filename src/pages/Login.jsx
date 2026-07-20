import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ShoppingBasket, Mail, Lock, ArrowRight } from 'lucide-react'
import { useInventory } from '../context/InventoryContext'

export default function Login() {
  const { isAuthenticated, login } = useInventory()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@groceryhub.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const result = login(email, password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <ShoppingBasket size={28} />
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to manage your grocery inventory</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <label className="form-field">
            <span>Email</span>
            <div className="input-with-icon">
              <Mail size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </label>

          <label className="form-field">
            <span>Password</span>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </label>

          <button type="submit" className="btn btn-primary btn-full">
            Sign In
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="login-hint">
          Demo mode — use any email and password to sign in
        </p>
      </div>

      <div className="login-hero">
        <div className="login-hero-content">
          <h2>Track stock. Reduce waste. Grow profits.</h2>
          <p>
            A modern inventory dashboard built for grocery stores — monitor
            stock levels, expiry dates, and pricing in one place.
          </p>
          <ul className="login-features">
            <li>Real-time low stock alerts</li>
            <li>Expiry date tracking</li>
            <li>Purchase & selling price management</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
