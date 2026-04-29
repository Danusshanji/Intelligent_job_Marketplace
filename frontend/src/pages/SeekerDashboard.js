import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobs, getRecommendations } from '../services/api';

function SeekerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'recommended'
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchJobs();
    fetchRecommendations();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await getJobs();
      setJobs(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await getRecommendations();
      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setRecLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getMatchColor = (score) => {
    if (score >= 15) return { bg: '#dcfce7', color: '#15803d', label: 'Strong Match' };
    if (score >= 8) return { bg: '#fef9c3', color: '#854d0e', label: 'Good Match' };
    return { bg: '#fee2e2', color: '#991b1b', label: 'Partial Match' };
  };

  const displayJobs = activeTab === 'recommended' ? recommendations : jobs;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #f5f3ff 0%, #ede9fe 30%, #e0f2fe 70%, #f0fdf4 100%)',
      fontFamily: "'Segoe UI', 'Inter', sans-serif",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .job-card { animation: fadeIn 0.3s ease forwards; transition: transform 0.2s, box-shadow 0.2s; }
        .job-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(79,70,229,0.15) !important; }
        .nav-btn:hover { opacity: 0.85; }
        .tab-btn { transition: all 0.2s; }
      `}</style>

      {/* Navbar */}
      <nav style={{
  background: '#fff', borderBottom: '1px solid #e5e7eb',
  padding: '0 32px', height: '64px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  position: 'sticky', top: 0, zIndex: 100,
  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
}}>
  {/* Logo */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div style={{
      width: 36, height: 36, borderRadius: '10px',
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    </div>
    <span style={{ fontSize: '17px', fontWeight: 800, color: '#1e1b4b' }}>
      Job<span style={{ color: '#7c3aed' }}>Marketplace</span>
    </span>
  </div>

  {/* Right side */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

    <button onClick={() => navigate('/my-applications')} style={{
      background: '#eff6ff', color: '#1d4ed8', border: 'none',
      borderRadius: '8px', padding: '8px 16px', fontSize: '13px',
      fontWeight: 600, cursor: 'pointer',
    }}>My Applications</button>

    {/* Clickable avatar */}
    <div
      onClick={() => navigate('/profile')}
      onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
      onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#f9fafb', borderRadius: '8px', padding: '6px 12px',
        border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'background 0.15s',
      }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: 800, color: '#fff',
        flexShrink: 0,
      }}>
        {user?.username?.[0]?.toUpperCase() || 'U'}
      </div>
      <span style={{ fontSize: '13px', color: '#374151', fontWeight: 600 }}>
        {user?.username || 'User'}
      </span>
    </div>

    <button onClick={handleLogout} style={{
      background: '#fff', color: '#dc2626',
      border: '1.5px solid #fecaca', borderRadius: '8px',
      padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
    }}>Logout</button>

  </div>
</nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 24px 64px' }}>

        {/* Welcome Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px', fontWeight: 900, margin: '0 0 6px',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Welcome back, {user?.username}
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Find your next opportunity — AI matched just for you
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
            borderRadius: '16px', padding: '22px 24px', flex: 1, minWidth: '160px',
            boxShadow: '0 4px 16px rgba(79,70,229,0.25)',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Available Jobs
            </p>
            <h2 style={{ color: '#fff', fontSize: '32px', fontWeight: 800, margin: 0 }}>{jobs.length}</h2>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            borderRadius: '16px', padding: '22px 24px', flex: 1, minWidth: '160px',
            boxShadow: '0 4px 16px rgba(124,58,237,0.25)',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              AI Recommended
            </p>
            <h2 style={{ color: '#fff', fontSize: '32px', fontWeight: 800, margin: 0 }}>{recommendations.length}</h2>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #059669, #10b981)',
            borderRadius: '16px', padding: '22px 24px', flex: 1, minWidth: '160px',
            boxShadow: '0 4px 16px rgba(5,150,105,0.25)',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Profile Status
            </p>
            <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, margin: 0 }}>
              {user?.role === 'seeker' ? 'Job Seeker' : 'Active'}
            </h2>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #d97706, #f59e0b)',
            borderRadius: '16px', padding: '22px 24px', flex: 1, minWidth: '160px',
            boxShadow: '0 4px 16px rgba(217,119,6,0.25)',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Top Match Score
            </p>
            <h2 style={{ color: '#fff', fontSize: '32px', fontWeight: 800, margin: 0 }}>
              {recommendations.length > 0 ? `${recommendations[0].match_score}%` : '—'}
            </h2>
          </div>
        </div>

        {/* AI Recommendation Banner */}
        {recommendations.length > 0 && activeTab === 'all' && (
          <div style={{
            background: 'linear-gradient(135deg, #312e81, #4f46e5, #7c3aed)',
            borderRadius: '16px', padding: '20px 24px', marginBottom: '24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '12px',
            boxShadow: '0 4px 20px rgba(79,70,229,0.3)',
          }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                AI Engine
              </p>
              <p style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: 0 }}>
                {recommendations.length} jobs matched to your resume — view your personalized recommendations
              </p>
            </div>
            <button onClick={() => setActiveTab('recommended')} style={{
              background: '#fff', color: '#4f46e5', border: 'none',
              borderRadius: '10px', padding: '10px 20px', fontSize: '13px',
              fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              View Recommendations
            </button>
          </div>
        )}

        {/* No Resume Warning */}
        {recommendations.length === 0 && !recLoading && (
          <div style={{
            background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
            border: '1px solid #fcd34d', borderRadius: '14px',
            padding: '18px 24px', marginBottom: '24px',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: '10px',
          }}>
            <div>
              <p style={{ color: '#92400e', fontWeight: 700, margin: '0 0 3px', fontSize: '14px' }}>
                Upload your resume to get AI job recommendations
              </p>
              <p style={{ color: '#b45309', margin: 0, fontSize: '13px' }}>
                Our AI engine will match you with the best jobs based on your skills
              </p>
            </div>
            <button onClick={() => navigate('/profile')} style={{
              background: '#d97706', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '9px 18px', fontSize: '13px',
              fontWeight: 700, cursor: 'pointer',
            }}>
              Upload Resume
            </button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#fff', borderRadius: '12px', padding: '4px', width: 'fit-content', boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
          <button className="tab-btn" onClick={() => setActiveTab('all')} style={{
            padding: '9px 22px', borderRadius: '9px', border: 'none',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'all' ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent',
            color: activeTab === 'all' ? '#fff' : '#6b7280',
            boxShadow: activeTab === 'all' ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
          }}>
            All Jobs ({jobs.length})
          </button>
          <button className="tab-btn" onClick={() => setActiveTab('recommended')} style={{
            padding: '9px 22px', borderRadius: '9px', border: 'none',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'recommended' ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent',
            color: activeTab === 'recommended' ? '#fff' : '#6b7280',
            boxShadow: activeTab === 'recommended' ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
          }}>
            AI Recommended ({recommendations.length})
          </button>
        </div>

        {/* Section Title */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e1b4b', margin: '0 0 4px' }}>
            {activeTab === 'recommended' ? 'AI Recommended Jobs' : 'All Available Jobs'}
          </h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>
            {activeTab === 'recommended'
              ? 'Ranked by how well they match your resume and skills'
              : 'Browse all active job listings'}
          </p>
        </div>

        {/* Job Cards */}
        {loading || (activeTab === 'recommended' && recLoading) ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '4px solid #ede9fe', borderTop: '4px solid #7c3aed',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: '#7c3aed', fontWeight: 600 }}>Loading jobs...</p>
          </div>
        ) : displayJobs.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 0',
            background: '#fff', borderRadius: '16px',
            boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '14px',
              background: '#f5f3ff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <p style={{ color: '#374151', fontWeight: 700, fontSize: '15px', margin: '0 0 6px' }}>
              {activeTab === 'recommended' ? 'No recommendations yet' : 'No jobs available'}
            </p>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
              {activeTab === 'recommended' ? 'Upload your resume to get AI matched jobs' : 'Check back later for new listings'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {displayJobs.map((job, index) => {
              const matchInfo = job.match_score ? getMatchColor(job.match_score) : null;
              return (
                <div key={job.id} className="job-card" style={{
                  background: '#fff', borderRadius: '16px',
                  boxShadow: '0 2px 12px rgba(79,70,229,0.08)',
                  border: '1px solid #ede9fe', padding: '22px',
                  animationDelay: `${index * 0.05}s`,
                }}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: '#1e1b4b' }}>
                        {job.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
                        {job.company}
                      </p>
                    </div>
                    <span style={{
                      background: '#eff6ff', color: '#1d4ed8',
                      borderRadius: '6px', padding: '4px 10px',
                      fontSize: '11px', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      whiteSpace: 'nowrap', marginLeft: '8px',
                    }}>
                      {job.job_type?.replace('_', ' ')}
                    </span>
                  </div>

                  {/* AI Match Score Badge */}
                  {matchInfo && (
                    <div style={{
                      background: matchInfo.bg, color: matchInfo.color,
                      borderRadius: '8px', padding: '8px 12px',
                      marginBottom: '14px', display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span style={{ fontSize: '12px', fontWeight: 700 }}>
                        AI Match Score
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 800 }}>
                        {job.match_score}% — {matchInfo.label}
                      </span>
                    </div>
                  )}

                  {/* Job Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span style={{ fontSize: '13px', color: '#4b5563' }}>{job.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                      <span style={{ fontSize: '13px', color: '#4b5563' }}>{job.salary || 'Not specified'}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                    {job.skills_required?.split(',').map((skill, i) => (
                      <span key={i} style={{
                        background: '#f5f3ff', color: '#6d28d9',
                        border: '1px solid #e9d5ff', borderRadius: '6px',
                        padding: '3px 10px', fontSize: '11px', fontWeight: 600,
                      }}>
                        {skill.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Apply Button */}
                  <button onClick={() => navigate(`/job/${job.id}`)} style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    color: '#fff', border: 'none', borderRadius: '10px',
                    padding: '11px', fontSize: '13px', fontWeight: 700,
                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
                  }}>
                    View & Apply
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SeekerDashboard;