import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginAdmin } from '../../store/adminSlice.js'
import { clearAuth } from '../../store/authSlice.js'
import { supabase } from '../../lib/supabaseClient.js'
import { showLoader, hideLoader } from '../../store/uiSlice.js'
import logoIcon from '../../assets/servora-logo-icon.png'

export default function AdminLogin() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@servora.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mockKey, setMockKey] = useState('')

  useEffect(() => {
    // Generate a fresh dynamic mock key on entry
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setMockKey(result)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    dispatch(showLoader('Authenticating with the Citadel...'))

    // Mock Admin Credentials Validation
    if (email === 'admin@servora.com' && password === mockKey) {
      try {
        // Mutual Exclusion: Purge standard user context
        if (supabase) {
          await supabase.auth.signOut()
        }
        dispatch(clearAuth())

        // Set Admin Session
        const mockAdmin = { id: 'admin_root', email, role: 'supreme_admin' }
        dispatch(loginAdmin(mockAdmin))
        
        setTimeout(() => {
          dispatch(hideLoader())
          navigate('/admin/dashboard')
        }, 1200)
      } catch (err) {
        dispatch(hideLoader())
        setError('Citadel Handshake Failure')
      }
    } else {
      setTimeout(() => {
        dispatch(hideLoader())
        setError('Unauthorized Access: Invalid Credentials')
      }, 800)
    }
  }

  return (
    <div className="sv-auth-page min-vh-100 d-flex align-items-center justify-content-center p-4" style={{ background: '#0b1510' }}>
      <div className="sv-card shadow-2xl p-5" style={{ maxWidth: '440px', width: '100%', borderRadius: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
        <div className="text-center mb-5">
          <img src={logoIcon} width="64" height="64" alt="Servora" className="mb-4" />
          <h2 className="text-white fw-bold" style={{ letterSpacing: '-0.5px' }}>Admin Citadel</h2>
          <p className="text-secondary small">Mocked Access Command Center</p>
        </div>

        <div className="sv-card mb-4 p-3 border-emerald-30" style={{ background: 'rgba(63, 191, 90, 0.04)', borderRadius: '16px' }}>
          <div className="text-center">
            <div className="text-emerald small fw-bold text-uppercase mb-2" style={{ letterSpacing: '1px' }}>Unauthorized Mock Access</div>
            <div className="d-flex flex-column gap-1">
              <div className="d-flex justify-content-between text-secondary extra-small px-2">
                <span>IDENTIFIER:</span>
                <span className="text-white fw-mono">{email}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary extra-small px-2">
                <span>SECURITY KEY:</span>
                <span className="text-emerald fw-bold fw-mono" style={{ fontSize: '1.1rem' }}>{mockKey}</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger border-0 mb-4" style={{ background: 'rgba(220, 53, 69, 0.1)', color: '#ff6b6b', borderRadius: '12px', fontSize: '0.85rem' }}>
            <i className="bi bi-shield-exclamation me-2"></i> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="form-label text-secondary small fw-bold text-uppercase mb-2">Citadel Identifier</label>
            <input 
              type="email" 
              className="form-control bg-transparent text-white border-white-10 py-3 rounded-3"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              placeholder="admin@servora.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-5">
            <label className="form-label text-secondary small fw-bold text-uppercase mb-2">Security Key</label>
            <input 
              type="password" 
              className="form-control bg-transparent text-white border-white-10 py-3 rounded-3"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-lg"
            style={{ borderRadius: '14px' }}
          >
            Authorize Access
          </button>
        </form>

        <div className="text-center mt-5">
          <button onClick={() => navigate('/')} className="btn p-0 text-secondary small hover-white transition">
            <i className="bi bi-arrow-left me-2"></i> Return to Landing
          </button>
        </div>
      </div>

      <style>{`
        .border-white-10 { border-color: rgba(255,255,255,0.1) !important; }
        .border-emerald-30 { border-color: rgba(63, 191, 90, 0.3) !important; }
        .text-emerald { color: #3fbf5a !important; }
        .hover-white:hover { color: white !important; }
        .transition { transition: all 0.2s; }
        .extra-small { font-size: 0.65rem; }
        .fw-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; letter-spacing: 0.5px; }
        .form-control:focus {
          background: transparent !important;
          border-color: #3fbf5a !important;
          box-shadow: 0 0 0 4px rgba(63, 191, 90, 0.1) !important;
          color: white !important;
        }
      `}</style>
    </div>
  )
}
