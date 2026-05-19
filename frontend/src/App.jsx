import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Dynamic production URL configuration matching network environments
const BACKEND_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://swiftlink-backend-api.vercel.app'; // We will lock this domain name in Vercel right next! 

function App() {
  // --- Core Application States ---
  const [view, setView] = useState('guest'); 
  const [user, setUser] = useState(null);    

  // --- Form Input States ---
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  
  // --- History & Operational States ---
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Custom Pastel Pink Palette Constants
  const pastelPinkBg = "linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 100%)";
  const primaryPink = "#FFB6C1"; 
  const darkPinkText = "#C71585"; 

  // --- Fetch User's Link History (UPDATED WITH PRODUCTION PATH) ---
  const fetchUserHistory = async (userId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/urls/user/${userId}`);
      setHistory(response.data);
    } catch (err) {
      console.error('Error gathering dashboard records:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserHistory(user.id);
    }
  }, [user, view]);

  // --- Handle URL Shortening (UPDATED WITH PRODUCTION PATH) ---
  const handleShorten = async (e) => {
    e.preventDefault();
    setError('');
    setShortUrl('');
    if (!longUrl) return setError('Please paste a valid URL link first!');

    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/shorten`, {
        originalUrl: longUrl,
        userId: user ? user.id : null
      });

      // Point the visible shortened link directly to our live backend handler
      setShortUrl(`${BACKEND_URL}/${response.data.shortCode}`);
      setLongUrl('');
      if (user) fetchUserHistory(user.id);
    } catch (err) {
      setError('Unable to process link. Double-check your server terminal.');
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Registration & Authentication (UPDATED WITH PRODUCTION PATH) ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const endpoint = view === 'signup' ? 'signup' : 'login';
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/${endpoint}`, authForm);

      if (view === 'signup') {
        setSuccess(response.data.message);
        setView('login');
      } else {
        setUser(response.data.user);
        setView('dashboard');
      }
      setAuthForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication handling failure.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setShortUrl('');
    setView('guest');
  };

  return (
    <div className="container-fluid min-vh-100 py-5" style={{ background: pastelPinkBg, fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      
      {/* Dynamic CSS Injector for Hover Effects, Glows, and Card Outlines */}
      <style>{`
        .premium-card {
          background: rgba(255, 255, 255, 0.7) !important;
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.6) !important;
          box-shadow: 0 8px 32px 0 rgba(220, 170, 180, 0.15) !important;
          transition: all 0.3s ease-in-out;
        }
        .premium-btn {
          background-color: ${primaryPink} !important;
          border: none !important;
          color: white !important;
          box-shadow: 0 4px 14px 0 rgba(255, 182, 193, 0.4) !important;
          transition: all 0.25s ease-in-out !important;
        }
        .premium-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px 0 rgba(255, 182, 193, 0.7), 0 0 12px 2px rgba(255, 255, 255, 0.5) !important;
          opacity: 0.95;
        }
        .premium-btn:active {
          transform: translateY(1px);
        }
        .premium-input {
          border: 2px solid transparent !important;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02) !important;
          transition: all 0.3s ease !important;
        }
        .premium-input:focus {
          border-color: ${primaryPink} !important;
          box-shadow: 0 0 10px rgba(255, 182, 193, 0.3) !important;
          background-color: #fff !important;
        }
        .logo-text {
          color: ${darkPinkText};
          text-shadow: 1px 1px 2px rgba(220, 100, 150, 0.1);
          letter-spacing: 2px;
          font-weight: 800;
        }
        .glow-box {
          background-color: rgba(232, 248, 245, 0.8);
          border: 1px solid rgba(17, 122, 101, 0.2);
          box-shadow: 0 0 15px rgba(24, 188, 156, 0.15);
        }
      `}</style>
      
      {/* Top Premium Frosted Navbar */}
      <nav className="navbar navbar-expand-lg premium-card mb-5 p-3 max-w-4xl mx-auto rounded-4">
        <div className="container-fluid">
          <span className="navbar-brand fs-2 logo-text" style={{ cursor: 'pointer' }} onClick={() => setView(user ? 'dashboard' : 'guest')}>
            swiftlink
          </span>
          <div className="d-flex">
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <span className="fw-semibold" style={{ color: darkPinkText }}>Hello, {user.name}</span>
                <button className="btn btn-sm rounded-3 px-3 fw-bold btn-outline-danger shadow-sm" style={{ borderRadius: '10px' }} onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              view === 'guest' ? (
                <button className="btn btn-sm premium-btn rounded-3 px-4 fw-bold text-white fs-6" style={{ borderRadius: '10px' }} onClick={() => setView('login')}>Sign In</button>
              ) : (
                <button className="btn btn-outline-secondary btn-sm rounded-3 px-4 fw-medium shadow-sm" style={{ borderRadius: '10px' }} onClick={() => setView('guest')}>Back Home</button>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Main Workspace Layout Container */}
      <div className="row justify-content-center mx-1">
        <div className="col-12 col-md-8 col-lg-6">

          {/* STATUS NOTIFICATIONS */}
          {error && <div className="alert alert-danger rounded-3 text-center border-0 shadow-sm mb-4 fw-medium" style={{ backgroundColor: '#FADBD8', color: '#C0392B' }}>{error}</div>}
          {success && <div className="alert alert-success rounded-3 text-center border-0 shadow-sm mb-4 fw-medium" style={{ backgroundColor: '#D4EFDF', color: '#196F3D' }}>{success}</div>}

          {/* CARD 1: WORKSPACE OR GUEST WARNING GATEWAY */}
          {(view === 'guest' || view === 'dashboard') && (
            <div className="card premium-card rounded-4 p-4 p-md-5 mb-4 text-dark">
              <h2 className="fw-bold text-center mb-2" style={{ color: darkPinkText, letterSpacing: '0.5px' }}>Shorten Your Links</h2>
              <p className="text-muted text-center mb-4 small fw-medium">Clean, minimal pastel design equipped with real-time tracking metrics.</p>
              
              {user ? (
                // IF AUTHENTICATED: Present Input Core
                <form onSubmit={handleShorten} className="mb-3">
                  <div className="input-group input-group-lg mb-3 shadow-sm rounded-3 overflow-hidden border">
                    <input
                      type="url"
                      className="form-control premium-input border-0 fs-6 py-3"
                      placeholder="Paste a long destination URL path..."
                      value={longUrl}
                      onChange={(e) => setLongUrl(e.target.value)}
                    />
                    <button className="btn premium-btn fw-bold px-4 fs-6 text-white" type="submit" disabled={loading}>
                      {loading ? 'Processing...' : 'Shorten'}
                    </button>
                  </div>
                </form>
              ) : (
                // IF GUEST: Prompt Authentication Gate
                <div className="text-center py-3">
                  <div className="alert rounded-3 fs-6 mb-4 border-0 fw-medium shadow-sm" style={{ backgroundColor: 'rgba(199, 21, 133, 0.08)', color: darkPinkText }}>
                    🔒 Secure Access Hub: Please sign in to create custom short links.
                  </div>
                  <button className="btn btn-lg rounded-3 fw-bold px-5 text-white" onClick={() => setView('login')}>
                    Get Started — Sign In
                  </button>
                </div>
              )}

              {/* Glowing Output Result Anchor Display Block */}
              {shortUrl && (
                <div className="p-4 mt-4 rounded-3 text-center glow-box">
                  <span className="d-block small fw-bold mb-2 text-uppercase tracking-wider" style={{ color: '#117A65' }}>✨ Your Shortened Link is Live:</span>
                  <a href={shortUrl} target="_blank" rel="noreferrer" className="fw-bold text-decoration-none break-all fs-4" style={{ color: '#117A65', transition: 'opacity 0.2s' }}>{shortUrl}</a>
                </div>
              )}
            </div>
          )}

          {/* CARD 2: LOGIN / SIGNUP PASTEL PANELS */}
          {(view === 'login' || view === 'signup') && (
            <div className="card premium-card rounded-4 p-4 text-dark">
              <h3 className="fw-bold text-center mb-4 tracking-wide" style={{ color: darkPinkText }}>{view === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
              <form onSubmit={handleAuthSubmit}>
                {view === 'signup' && (
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Full Name</label>
                    <input type="text" className="form-control premium-input rounded-3 py-2" required value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} />
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Email Address</label>
                  <input type="email" className="form-control premium-input rounded-3 py-2" required value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} />
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-muted">Password</label>
                  <input type="password" className="form-control premium-input rounded-3 py-2" required value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} />
                </div>
                <button type="submit" className="btn w-100 premium-btn rounded-3 fw-bold py-2.5 mb-3 text-white" style={{ fontSize: '1.05rem' }}>
                  {view === 'login' ? 'Log In' : 'Sign Up'}
                </button>
                <div className="text-center small mt-2">
                  {view === 'login' ? (
                    <span className="text-muted">New to SwiftLink? <span className="fw-bold" style={{ color: darkPinkText, cursor: 'pointer' }} onClick={() => setView('signup')}>Register here</span></span>
                  ) : (
                    <span className="text-muted">Already registered? <span className="fw-bold" style={{ color: darkPinkText, cursor: 'pointer' }} onClick={() => setView('login')}>Sign in here</span></span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* CARD 3: REAL-TIME ANALYTICS METRICS HISTORY DASHBOARD (UPDATED WITH PRODUCTION PATH) */}
          {user && view === 'dashboard' && (
            <div className="card premium-card rounded-4 p-4 text-dark mt-4">
              <h4 className="fw-bold mb-3 text-start tracking-wider fs-5" style={{ color: darkPinkText }}>Your Dashboard Links</h4>
              {history.length === 0 ? (
                <p className="text-muted text-center py-4 my-0">No active links generated yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle my-0 bg-transparent">
                    <thead className="small text-uppercase tracking-wider">
                      <tr>
                        <th className="bg-transparent border-light opacity-75" style={{ color: darkPinkText }}>Short URL</th>
                        <th className="bg-transparent border-light opacity-75" style={{ color: darkPinkText }}>Original URL</th>
                        <th className="text-center bg-transparent border-light opacity-75" style={{ color: darkPinkText }}>Clicks</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {history.map((item) => (
                        <tr key={item._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                          <td className="bg-transparent border-0">
                            <a href={`${BACKEND_URL}/${item.shortCode}`} target="_blank" rel="noreferrer" className="fw-bold text-decoration-none" style={{ color: darkPinkText }}>
                              {item.shortCode}
                            </a>
                          </td>
                          <td className="text-truncate bg-transparent border-0 text-muted" style={{ maxWidth: '200px' }}>
                            {item.originalUrl}
                          </td>
                          <td className="text-center fw-bold bg-transparent border-0">
                            <span className="badge rounded-pill px-3 py-2 text-white shadow-sm" style={{ backgroundColor: primaryPink, fontSize: '0.85rem' }}>
                              {item.clicks}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;