import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await loginUser({ username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      const role = response.data.user.role;
      if (role === 'seeker') navigate('/seeker-dashboard');
      else if (role === 'employer') navigate('/employer-dashboard');
      else navigate('/admin');
    } catch (err) {
      setError('Invalid username or password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(160deg, #f5f3ff 0%, #ede9fe 30%, #e0f2fe 70%, #f0fdf4 100%)',
      fontFamily: "'Segoe UI', 'Inter', sans-serif",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
        .login-input:focus { border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important; outline: none; }
        .login-input { transition: border-color 0.2s, box-shadow 0.2s; }
        .feature-item { animation: slideIn 0.4s ease forwards; }
      `}</style>

      {/* Left Panel */}
      <div style={{
        width: '45%', minHeight: '100vh',
        background: 'linear-gradient(160deg, #312e81 0%, #4f46e5 45%, #7c3aed 80%, #a855f7 100%)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '60px 48px', position: 'relative', overflow: 'hidden',
      }} className="hidden-mobile">
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: '40%', left: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px', alignSelf: 'flex-start' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.3)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
            <span style={{ color: '#c4b5fd' }}>Job Marketplace</span>
          </span>
        </div>

        {/* Headline */}
        <div style={{ alignSelf: 'flex-start', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', margin: '0 0 12px', lineHeight: 1.2 }}>
            Find Your Dream Job with AI
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
            Our intelligent platform matches you with the perfect opportunity based on your skills and experience.
          </p>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          {[
            { title: 'AI-Powered Job Matching', desc: 'Get personalized recommendations based on your resume' },
            { title: 'Smart Resume Analysis', desc: 'Automatic skill extraction and profile completion' },
            { title: 'Real-time Application Tracking', desc: 'Monitor your applications from one place' },
          ].map((f, i) => (
            <div key={i} className="feature-item" style={{
              display: 'flex', alignItems: 'flex-start', gap: '14px',
              background: 'rgba(255,255,255,0.1)', borderRadius: '12px',
              padding: '14px 16px', border: '1px solid rgba(255,255,255,0.15)',
              animationDelay: `${i * 0.1}s`,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '8px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {i === 0 && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                  </svg>
                )}
                {i === 1 && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                )}
                {i === 2 && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                )}
              </div>
              <div>
                <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: 700, color: '#fff' }}>{f.title}</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '40px 24px',
      }}>
        <div style={{
          width: '100%', maxWidth: '420px',
          animation: 'fadeIn 0.4s ease forwards',
        }}>

          {/* Mobile Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', justifyContent: 'center' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#1e1b4b' }}>
              <span style={{ color: '#7c3aed' }}>Job Marketplace</span>
            </span>
          </div>

          {/* Form Card */}
          <div style={{
            background: '#fff', borderRadius: '20px',
            padding: '40px 36px',
            boxShadow: '0 8px 40px rgba(79,70,229,0.12)',
            border: '1px solid #ede9fe',
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1e1b4b', margin: '0 0 6px' }}>
              Welcome back
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 28px' }}>
              Sign in to continue to your account
            </p>

            {/* Error */}
            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#dc2626', borderRadius: '10px',
                padding: '12px 16px', marginBottom: '20px',
                fontSize: '13px', fontWeight: 600,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>

              {/* Username */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{
                  display: 'block', fontSize: '11px', fontWeight: 800,
                  color: '#7c3aed', marginBottom: '7px',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>Username</label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
                    display: 'flex', alignItems: 'center',
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="login-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    style={{
                      width: '100%', padding: '11px 14px 11px 38px',
                      border: '2px solid #e8eaf6', borderRadius: '10px',
                      fontSize: '14px', color: '#1a237e', background: '#f8fafc',
                      boxSizing: 'border-box', fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block', fontSize: '11px', fontWeight: 800,
                  color: '#7c3aed', marginBottom: '7px',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
                    display: 'flex', alignItems: 'center',
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="login-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={{
                      width: '100%', padding: '11px 40px 11px 38px',
                      border: '2px solid #e8eaf6', borderRadius: '10px',
                      fontSize: '14px', color: '#1a237e', background: '#f8fafc',
                      boxSizing: 'border-box', fontFamily: 'inherit',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: '0',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPassword ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  color: '#fff', border: 'none', borderRadius: '10px',
                  padding: '13px', fontSize: '15px', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(79,70,229,0.4)',
                  fontFamily: 'inherit', transition: 'all 0.2s',
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Register Link */}
            <p style={{
              textAlign: 'center', fontSize: '13px',
              color: '#6b7280', margin: '20px 0 0',
            }}>
              Don't have an account?{' '}
              <a href="/register" style={{
                color: '#7c3aed', fontWeight: 700, textDecoration: 'none',
              }}>Create Account</a>
            </p>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '20px' }}>
            Intelligent Job Marketplace — AI Powered Platform
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;