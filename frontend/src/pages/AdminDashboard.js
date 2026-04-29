import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AUTHAPI from '../services/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, jobsRes, appsRes] = await Promise.all([
        AUTHAPI.get('/accounts/admin/users/'),
        AUTHAPI.get('/jobs/'),
        AUTHAPI.get('/applications/all/'),
      ]);
      setUsers(usersRes.data);
      setJobs(jobsRes.data);
      setApplications(appsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await AUTHAPI.delete(`/accounts/admin/users/${userId}/delete/`);
      setMessage('User deleted successfully.');
      setMessageType('success');
      setUsers(users.filter(u => u.id !== userId));
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to delete user.');
      setMessageType('error');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await AUTHAPI.delete(`/jobs/${jobId}/delete/`);
      setMessage('Job deleted successfully.');
      setMessageType('success');
      setJobs(jobs.filter(j => j.id !== jobId));
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to delete job.');
      setMessageType('error');
    }
  };

  const handleToggleUser = async (userId, isActive) => {
    try {
      await AUTHAPI.patch(`/accounts/admin/users/${userId}/toggle/`, { is_active: !isActive });
      setMessage(`User ${isActive ? 'deactivated' : 'activated'} successfully.`);
      setMessageType('success');
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !isActive } : u));
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update user status.');
      setMessageType('error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const stats = {
    totalUsers: users.length,
    seekers: users.filter(u => u.role === 'seeker').length,
    employers: users.filter(u => u.role === 'employer').length,
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.is_active).length,
    totalApplications: applications.length,
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case 'seeker': return { bg: '#dbeafe', color: '#1d4ed8' };
      case 'employer': return { bg: '#dcfce7', color: '#15803d' };
      case 'admin': return { bg: '#ede9fe', color: '#6d28d9' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const tabStyle = (tab) => ({
    padding: '9px 20px', borderRadius: '8px', border: 'none',
    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
    background: activeTab === tab ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent',
    color: activeTab === tab ? '#fff' : '#6b7280',
    boxShadow: activeTab === tab ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
    transition: 'all 0.2s',
  });

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#f3f4f6',
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '4px solid #e5e7eb', borderTop: '4px solid #4f46e5',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 14px',
          }} />
          <p style={{ color: '#4f46e5', fontWeight: 700 }}>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f3f4f6',
      fontFamily: "'Segoe UI', 'Inter', sans-serif",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .row-hover:hover { background: #f8fafc !important; }
        .action-btn { transition: opacity 0.15s; }
        .action-btn:hover { opacity: 0.8; }
      `}</style>

      {/* Navbar */}
      <nav style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: '0 32px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '17px', fontWeight: 800, color: '#1e1b4b' }}>
              Job<span style={{ color: '#7c3aed' }}>Marketplace</span>
            </span>
            <span style={{
              background: '#fef3c7', color: '#92400e',
              fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
            }}>Admin</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#f9fafb', borderRadius: '8px', padding: '6px 12px',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #d97706, #f59e0b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 800, color: '#fff', flexShrink: 0,
            }}>
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <span style={{ fontSize: '13px', color: '#374151', fontWeight: 600 }}>
              {user?.username}
            </span>
          </div>
          <button onClick={handleLogout} style={{
            background: '#fff', color: '#dc2626',
            border: '1.5px solid #fecaca', borderRadius: '8px',
            padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#111827', margin: '0 0 4px' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Monitor and manage the entire platform
          </p>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            background: messageType === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${messageType === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: messageType === 'success' ? '#15803d' : '#dc2626',
            borderRadius: '10px', padding: '12px 18px', marginBottom: '20px',
            fontWeight: 600, fontSize: '14px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            {message}
            <button onClick={() => setMessage('')} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'inherit',
            }}>×</button>
          </div>
        )}

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {[
            { label: 'Total Users', value: stats.totalUsers, bg: 'linear-gradient(135deg, #4f46e5, #6366f1)' },
            { label: 'Job Seekers', value: stats.seekers, bg: 'linear-gradient(135deg, #0891b2, #06b6d4)' },
            { label: 'Employers', value: stats.employers, bg: 'linear-gradient(135deg, #059669, #10b981)' },
            { label: 'Total Jobs', value: stats.totalJobs, bg: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
            { label: 'Active Jobs', value: stats.activeJobs, bg: 'linear-gradient(135deg, #d97706, #f59e0b)' },
            { label: 'Applications', value: stats.totalApplications, bg: 'linear-gradient(135deg, #dc2626, #ef4444)' },
          ].map((s, i) => (
            <div key={i} style={{
              background: s.bg, borderRadius: '14px',
              padding: '18px 20px', flex: 1, minWidth: '140px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              animation: 'fadeIn 0.3s ease forwards',
              animationDelay: `${i * 0.05}s`,
            }}>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {s.label}
              </p>
              <p style={{ color: '#fff', fontSize: '28px', fontWeight: 800, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '24px',
          background: '#fff', borderRadius: '12px', padding: '4px',
          width: 'fit-content', boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
        }}>
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'users', label: `Users (${users.length})` },
            { key: 'jobs', label: `Jobs (${jobs.length})` },
            { key: 'applications', label: `Applications (${applications.length})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={tabStyle(tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', animation: 'fadeIn 0.3s ease' }}>

            {/* Recent Users */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '22px', border: '1px solid #e5e7eb', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 800, color: '#111827' }}>Recent Users</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {users.slice(0, 5).map(u => {
                  const rs = getRoleStyle(u.role);
                  return (
                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 800, color: '#fff', flexShrink: 0,
                        }}>{u.username?.[0]?.toUpperCase()}</div>
                        <div>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827' }}>{u.username}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>{u.email}</p>
                        </div>
                      </div>
                      <span style={{ background: rs.bg, color: rs.color, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>
                        {u.role}
                      </span>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setActiveTab('users')} style={{
                width: '100%', marginTop: '16px', background: '#f5f3ff', color: '#6d28d9',
                border: '1px solid #e9d5ff', borderRadius: '8px', padding: '9px',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              }}>View All Users</button>
            </div>

            {/* Recent Jobs */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '22px', border: '1px solid #e5e7eb', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 800, color: '#111827' }}>Recent Jobs</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {jobs.slice(0, 5).map(j => (
                  <div key={j.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827' }}>{j.title}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>{j.company} · {j.location}</p>
                    </div>
                    <span style={{
                      background: j.is_active ? '#dcfce7' : '#fee2e2',
                      color: j.is_active ? '#15803d' : '#dc2626',
                      fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px',
                    }}>{j.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveTab('jobs')} style={{
                width: '100%', marginTop: '16px', background: '#f5f3ff', color: '#6d28d9',
                border: '1px solid #e9d5ff', borderRadius: '8px', padding: '9px',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              }}>View All Jobs</button>
            </div>

          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden', animation: 'fadeIn 0.3s ease' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['User', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const rs = getRoleStyle(u.role);
                  return (
                    <tr key={u.id} className="row-hover" style={{ borderBottom: '1px solid #f3f4f6', background: '#fff', transition: 'background 0.15s' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 800, color: '#fff', flexShrink: 0,
                          }}>{u.username?.[0]?.toUpperCase()}</div>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{u.username}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#6b7280' }}>{u.email}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ background: rs.bg, color: rs.color, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          background: u.is_active ? '#dcfce7' : '#fee2e2',
                          color: u.is_active ? '#15803d' : '#dc2626',
                          fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px',
                        }}>{u.is_active ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="action-btn" onClick={() => handleToggleUser(u.id, u.is_active)} style={{
                            background: u.is_active ? '#fef9c3' : '#dcfce7',
                            color: u.is_active ? '#854d0e' : '#15803d',
                            border: 'none', borderRadius: '6px',
                            padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                          }}>{u.is_active ? 'Deactivate' : 'Activate'}</button>
                          <button className="action-btn" onClick={() => handleDeleteUser(u.id)} style={{
                            background: '#fee2e2', color: '#dc2626',
                            border: 'none', borderRadius: '6px',
                            padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                          }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── JOBS TAB ── */}
        {activeTab === 'jobs' && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden', animation: 'fadeIn 0.3s ease' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Job Title', 'Company', 'Location', 'Type', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j.id} className="row-hover" style={{ borderBottom: '1px solid #f3f4f6', background: '#fff', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 18px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>{j.title}</td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: '#6b7280' }}>{j.company}</td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: '#6b7280' }}>{j.location}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>
                        {j.job_type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        background: j.is_active ? '#dcfce7' : '#fee2e2',
                        color: j.is_active ? '#15803d' : '#dc2626',
                        fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px',
                      }}>{j.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <button className="action-btn" onClick={() => handleDeleteJob(j.id)} style={{
                        background: '#fee2e2', color: '#dc2626',
                        border: 'none', borderRadius: '6px',
                        padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                      }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── APPLICATIONS TAB ── */}
        {activeTab === 'applications' && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden', animation: 'fadeIn 0.3s ease' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Applicant', 'Job', 'Company', 'Status', 'Applied On'].map(h => (
                    <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map(app => {
                  const statusColors = {
                    applied: { bg: '#dbeafe', color: '#1d4ed8' },
                    shortlisted: { bg: '#dcfce7', color: '#15803d' },
                    hired: { bg: '#ede9fe', color: '#6d28d9' },
                    rejected: { bg: '#fee2e2', color: '#dc2626' },
                  };
                  const sc = statusColors[app.status] || { bg: '#f3f4f6', color: '#374151' };
                  return (
                    <tr key={app.id} className="row-hover" style={{ borderBottom: '1px solid #f3f4f6', background: '#fff', transition: 'background 0.15s' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 800, color: '#fff', flexShrink: 0,
                          }}>{app.applicant_name?.[0]?.toUpperCase()}</div>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{app.applicant_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>{app.job_title}</td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#6b7280' }}>{app.company}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ background: sc.bg, color: sc.color, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', textTransform: 'capitalize' }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#6b7280' }}>
                        {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;