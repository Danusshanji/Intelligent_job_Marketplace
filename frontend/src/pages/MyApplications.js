import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyApplications } from '../services/api';

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const response = await getMyApplications();
      setApplications(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'applied': return { bg: '#dbeafe', color: '#1d4ed8', label: 'Applied' };
      case 'shortlisted': return { bg: '#dcfce7', color: '#15803d', label: 'Shortlisted' };
      case 'hired': return { bg: '#ede9fe', color: '#6d28d9', label: 'Hired' };
      case 'rejected': return { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' };
      default: return { bg: '#f3f4f6', color: '#374151', label: status };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'applied': return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      );
      case 'shortlisted': return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      );
      case 'hired': return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
        </svg>
      );
      case 'rejected': return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      );
      default: return null;
    }
  };

  const stats = {
    all: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    hired: applications.filter(a => a.status === 'hired').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const filteredApplications = activeFilter === 'all'
    ? applications
    : applications.filter(a => a.status === activeFilter);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      fontFamily: "'Segoe UI', 'Inter', sans-serif",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .app-card { animation: fadeIn 0.3s ease forwards; transition: transform 0.2s, box-shadow 0.2s; }
        .app-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.09) !important; }
        .filter-btn { transition: all 0.2s; }
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

        {/* Nav Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => navigate('/seeker-dashboard')} style={{
            background: '#f5f3ff', color: '#6d28d9',
            border: '1px solid #e9d5ff', borderRadius: '8px',
            padding: '8px 16px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Jobs
          </button>

          {/* Avatar */}
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
              fontSize: '11px', fontWeight: 800, color: '#fff', flexShrink: 0,
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

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#111827', margin: '0 0 4px' }}>
              My Applications
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
              Track and manage all your job applications
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            borderRadius: '10px', padding: '10px 20px',
            color: '#fff', fontSize: '14px', fontWeight: 700,
            boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
          }}>
            {applications.length} Application{applications.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {[
            { label: 'Applied', value: stats.applied, bg: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' },
            { label: 'Shortlisted', value: stats.shortlisted, bg: 'linear-gradient(135deg, #059669, #10b981)' },
            { label: 'Hired', value: stats.hired, bg: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
            { label: 'Rejected', value: stats.rejected, bg: 'linear-gradient(135deg, #dc2626, #ef4444)' },
          ].map((s, i) => (
            <div key={i} style={{
              background: s.bg, borderRadius: '14px',
              padding: '18px 20px', flex: 1, minWidth: '120px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {s.label}
              </p>
              <p style={{ color: '#fff', fontSize: '28px', fontWeight: 800, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '24px',
          background: '#fff', borderRadius: '12px', padding: '4px',
          width: 'fit-content', boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
        }}>
          {[
            { key: 'all', label: `All (${stats.all})` },
            { key: 'applied', label: `Applied (${stats.applied})` },
            { key: 'shortlisted', label: `Shortlisted (${stats.shortlisted})` },
            { key: 'hired', label: `Hired (${stats.hired})` },
            { key: 'rejected', label: `Rejected (${stats.rejected})` },
          ].map(tab => (
            <button key={tab.key} className="filter-btn" onClick={() => setActiveFilter(tab.key)} style={{
              padding: '8px 16px', borderRadius: '9px', border: 'none',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              background: activeFilter === tab.key ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent',
              color: activeFilter === tab.key ? '#fff' : '#6b7280',
              boxShadow: activeFilter === tab.key ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              border: '4px solid #e5e7eb', borderTop: '4px solid #4f46e5',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 14px',
            }} />
            <p style={{ color: '#6b7280', fontWeight: 600 }}>Loading applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '14px',
              background: '#f5f3ff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <p style={{ color: '#111827', fontWeight: 700, fontSize: '16px', margin: '0 0 6px' }}>
              {activeFilter === 'all' ? 'No applications yet' : `No ${activeFilter} applications`}
            </p>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px' }}>
              {activeFilter === 'all' ? 'Start applying for jobs to track them here' : 'No applications with this status yet'}
            </p>
            {activeFilter === 'all' && (
              <button onClick={() => navigate('/seeker-dashboard')} style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#fff', border: 'none', borderRadius: '10px',
                padding: '11px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
              }}>Browse Jobs</button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredApplications.map((app, index) => {
              const statusStyle = getStatusStyle(app.status);
              return (
                <div key={app.id} className="app-card" style={{
                  background: '#fff', borderRadius: '16px',
                  padding: '22px 24px', border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                  animationDelay: `${index * 0.05}s`,
                }}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 800, color: '#111827' }}>
                        {app.job_details?.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: '14px', color: '#4f46e5', fontWeight: 600 }}>
                        {app.job_details?.company}
                      </p>
                    </div>
                    <span style={{
                      background: statusStyle.bg, color: statusStyle.color,
                      fontSize: '12px', fontWeight: 700, padding: '6px 14px',
                      borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '5px',
                    }}>
                      {getStatusIcon(app.status)}
                      {statusStyle.label}
                    </span>
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', background: '#f3f4f6', marginBottom: '14px' }} />

                  {/* Job Details */}
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span style={{ fontSize: '13px', color: '#4b5563' }}>{app.job_details?.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                      <span style={{ fontSize: '13px', color: '#4b5563' }}>{app.job_details?.salary || 'Not specified'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span style={{ fontSize: '13px', color: '#4b5563' }}>
                        Applied {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                      </svg>
                      <span style={{ fontSize: '13px', color: '#4b5563' }}>{app.job_details?.job_type?.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  {app.job_details?.skills_required && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                      {app.job_details.skills_required.split(',').map((skill, i) => (
                        <span key={i} style={{
                          background: '#f5f3ff', color: '#6d28d9',
                          border: '1px solid #e9d5ff', borderRadius: '6px',
                          padding: '3px 10px', fontSize: '11px', fontWeight: 600,
                        }}>{skill.trim()}</span>
                      ))}
                    </div>
                  )}

                  {/* Cover Letter */}
                  {app.cover_letter && (
                    <div style={{
                      background: '#f9fafb', borderRadius: '10px',
                      padding: '14px 16px', marginBottom: '14px',
                      border: '1px solid #e5e7eb',
                    }}>
                      <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        Your Cover Letter
                      </p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: 1.7 }}>
                        {app.cover_letter}
                      </p>
                    </div>
                  )}

                  {/* Status Timeline */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                    {['applied', 'shortlisted', 'hired'].map((step, i) => {
                      const isActive = app.status === step;
                      const isPast = ['applied', 'shortlisted', 'hired'].indexOf(app.status) > i;
                      const isRejected = app.status === 'rejected';
                      return (
                        <React.Fragment key={step}>
                          <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                          }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: isRejected ? '#fee2e2' : isActive ? '#4f46e5' : isPast ? '#10b981' : '#e5e7eb',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: isActive ? '2px solid #4f46e5' : 'none',
                            }}>
                              {(isActive || isPast) && !isRejected ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              ) : isRejected ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              ) : (
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9ca3af' }} />
                              )}
                            </div>
                            <span style={{ fontSize: '10px', color: isActive ? '#4f46e5' : isPast ? '#10b981' : '#9ca3af', fontWeight: 600, textTransform: 'capitalize' }}>
                              {step}
                            </span>
                          </div>
                          {i < 2 && (
                            <div style={{
                              flex: 1, height: '2px', marginBottom: '16px',
                              background: isPast && !isRejected ? '#10b981' : '#e5e7eb',
                            }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => navigate(`/job/${app.job_details?.id}`)} style={{
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      color: '#fff', border: 'none', borderRadius: '8px',
                      padding: '9px 20px', fontSize: '13px', fontWeight: 700,
                      cursor: 'pointer', boxShadow: '0 4px 10px rgba(79,70,229,0.3)',
                    }}>
                      View Job
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyApplications;