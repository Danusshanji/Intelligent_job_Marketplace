import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobApplications, updateApplicationStatus } from '../services/api';

function JobApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [updatingId, setUpdatingId] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [interviewData, setInterviewData] = useState({
  interview_link: '',
  interview_date: '',
  interview_date_only: '',
  interview_time: '10:00',
  interview_period: 'AM',
  interview_message: '',
});

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const response = await getJobApplications(jobId);
      setApplications(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      await updateApplicationStatus(id, { status });
      setMessage(`Application marked as ${status} successfully.`);
      setMessageType('success');
      fetchApplications();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('Failed to update status. Please try again.');
      setMessageType('error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleScheduleInterview = (app) => {
    setSelectedApp(app);
    setShowInterviewModal(true);
    setInterviewData({ interview_link: '', interview_date: '', interview_message: '' });
  };

  const handleSendInterview = async () => {
    if (!interviewData.interview_link || !interviewData.interview_date) {
      alert('Please provide interview link and date.');
      return;
    }
    setUpdatingId(selectedApp.id);
    try {
      await updateApplicationStatus(selectedApp.id, {
        status: 'interview_scheduled',
        ...interviewData,
      });
      setMessage('Interview scheduled and email sent to candidate successfully.');
      setMessageType('success');
      setShowInterviewModal(false);
      fetchApplications();
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setMessage('Failed to schedule interview.');
      setMessageType('error');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'applied': return { bg: '#dbeafe', color: '#1d4ed8' };
      case 'shortlisted': return { bg: '#dcfce7', color: '#15803d' };
      case 'interview_scheduled': return { bg: '#fef9c3', color: '#854d0e' };
      case 'hired': return { bg: '#ede9fe', color: '#6d28d9' };
      case 'rejected': return { bg: '#fee2e2', color: '#dc2626' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const stats = {
    total: applications.length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interview_scheduled: applications.filter(a => a.status === 'interview_scheduled').length,
    hired: applications.filter(a => a.status === 'hired').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #e5e7eb', borderRadius: '10px',
    fontSize: '14px', color: '#111827', background: '#f9fafb',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f3f4f6',
      fontFamily: "'Segoe UI', 'Inter', sans-serif",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        .app-card { transition: transform 0.2s, box-shadow 0.2s; animation: fadeIn 0.3s ease forwards; }
        .app-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.09) !important; }
        .action-btn { transition: opacity 0.15s, transform 0.15s; }
        .action-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        input:focus, textarea:focus { border-color: #4f46e5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); background: #fff !important; }
      `}</style>

      {/* Interview Modal */}
      {showInterviewModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px',
            padding: '32px', width: '100%', maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            animation: 'modalIn 0.3s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                  Schedule Interview
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                  For {selectedApp?.applicant_name}
                </p>
              </div>
              <button onClick={() => setShowInterviewModal(false)} style={{
                background: '#f3f4f6', border: 'none', borderRadius: '8px',
                width: 32, height: 32, cursor: 'pointer', fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280',
              }}>×</button>
            </div>

            {/* Candidate Info */}
            <div style={{
              background: '#f5f3ff', borderRadius: '12px',
              padding: '14px 16px', marginBottom: '20px',
              border: '1px solid #e9d5ff',
            }}>
              <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: 700, color: '#1e1b4b' }}>
                {selectedApp?.applicant_name}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                {selectedApp?.applicant_email}
              </p>
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#7c3aed', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Google Meet / Zoom Link
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  value={interviewData.interview_link}
                  onChange={e => setInterviewData({ ...interviewData, interview_link: e.target.value })}
                  style={inputStyle}
                />
              </div>
             <div>
  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#7c3aed', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
    Interview Date & Time
  </label>
  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
    <input
      type="date"
      value={interviewData.interview_date_only}
      min={new Date().toISOString().split('T')[0]}
      onChange={e => {
        const date = e.target.value;
        const time = interviewData.interview_time || '10:00';
        const period = interviewData.interview_period || 'AM';
        let hour = parseInt(time.split(':')[0]);
        const min = time.split(':')[1] || '00';
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        const fullDateTime = `${date}T${String(hour).padStart(2, '0')}:${min}`;
        setInterviewData({ 
          ...interviewData, 
          interview_date_only: date,
          interview_date: fullDateTime 
        });
      }}
      style={{ ...inputStyle, flex: 1, minWidth: '140px' }}
    />
    <input
      type="time"
      value={interviewData.interview_time || '10:00'}
      onChange={e => {
        const time = e.target.value;
        const date = interviewData.interview_date_only || '';
        const period = interviewData.interview_period || 'AM';
        let hour = parseInt(time.split(':')[0]);
        const min = time.split(':')[1] || '00';
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        const fullDateTime = date ? `${date}T${String(hour).padStart(2, '0')}:${min}` : '';
        setInterviewData({ 
          ...interviewData, 
          interview_time: time,
          interview_date: fullDateTime 
        });
      }}
      style={{ ...inputStyle, flex: 1, minWidth: '100px' }}
    />
    <select
      value={interviewData.interview_period || 'AM'}
      onChange={e => {
        const period = e.target.value;
        const time = interviewData.interview_time || '10:00';
        const date = interviewData.interview_date_only || '';
        let hour = parseInt(time.split(':')[0]);
        const min = time.split(':')[1] || '00';
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        const fullDateTime = date ? `${date}T${String(hour).padStart(2, '0')}:${min}` : '';
        setInterviewData({ 
          ...interviewData, 
          interview_period: period,
          interview_date: fullDateTime 
        });
      }}
      style={{ ...inputStyle, width: 'auto', minWidth: '80px' }}
    >
      <option value="AM">AM</option>
      <option value="PM">PM</option>
    </select>
  </div>
</div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#7c3aed', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Message to Candidate (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Any additional instructions for the candidate..."
                  value={interviewData.interview_message}
                  onChange={e => setInterviewData({ ...interviewData, interview_message: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Info note */}
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#15803d', fontWeight: 600 }}>
                An email with interview details will be automatically sent to the candidate.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowInterviewModal(false)} style={{
                flex: 1, background: '#f3f4f6', color: '#374151',
                border: 'none', borderRadius: '10px', padding: '12px',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleSendInterview} disabled={updatingId !== null} style={{
                flex: 1,
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#fff', border: 'none', borderRadius: '10px',
                padding: '12px', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
                opacity: updatingId !== null ? 0.75 : 1,
              }}>
                Send Interview Invitation
              </button>
            </div>
          </div>
        </div>
      )}

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
              background: '#ede9fe', color: '#6d28d9',
              fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
            }}>Employer</span>
          </div>
        </div>
        <button onClick={() => navigate('/employer-dashboard')} style={{
          background: '#f5f3ff', color: '#6d28d9',
          border: '1px solid #e9d5ff', borderRadius: '8px',
          padding: '8px 16px', fontSize: '13px', fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#111827', margin: '0 0 4px' }}>
              Job Applicants
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
              Review and manage applications for this position
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            borderRadius: '10px', padding: '10px 20px',
            color: '#fff', fontSize: '14px', fontWeight: 700,
            boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
          }}>
            {stats.total} Applicant{stats.total !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {[
            { label: 'Total', value: stats.total, bg: 'linear-gradient(135deg, #4f46e5, #6366f1)' },
            { label: 'Shortlisted', value: stats.shortlisted, bg: 'linear-gradient(135deg, #059669, #10b981)' },
            { label: 'Interview', value: stats.interview_scheduled, bg: 'linear-gradient(135deg, #d97706, #f59e0b)' },
            { label: 'Hired', value: stats.hired, bg: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
            { label: 'Rejected', value: stats.rejected, bg: 'linear-gradient(135deg, #dc2626, #ef4444)' },
          ].map((s, i) => (
            <div key={i} style={{
              background: s.bg, borderRadius: '12px',
              padding: '16px 20px', flex: 1, minWidth: '100px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {s.label}
              </p>
              <p style={{ color: '#fff', fontSize: '24px', fontWeight: 800, margin: 0 }}>{s.value}</p>
            </div>
          ))}
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

        {/* Applications */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              border: '4px solid #e5e7eb', borderTop: '4px solid #4f46e5',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 14px',
            }} />
            <p style={{ color: '#6b7280', fontWeight: 600 }}>Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p style={{ color: '#111827', fontWeight: 700, fontSize: '16px', margin: '0 0 6px' }}>No applications yet</p>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>Share the job listing to attract candidates</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {applications.map((app, index) => {
              const statusStyle = getStatusStyle(app.status);
              const initials = app.applicant_name
                ? app.applicant_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                : '?';
              return (
                <div key={app.id} className="app-card" style={{
                  background: '#fff', borderRadius: '16px',
                  padding: '22px 24px', border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                  animationDelay: `${index * 0.05}s`,
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', fontWeight: 800, color: '#fff', flexShrink: 0,
                      }}>{initials}</div>
                      <div>
                        <h3 style={{ margin: '0 0 3px', fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                          {app.applicant_name}
                        </h3>
                        <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                          {app.applicant_email} · Applied {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      background: statusStyle.bg, color: statusStyle.color,
                      fontSize: '12px', fontWeight: 700, padding: '5px 14px',
                      borderRadius: '999px', textTransform: 'capitalize',
                      whiteSpace: 'nowrap',
                    }}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ height: '1px', background: '#f3f4f6', marginBottom: '16px' }} />

                  {/* Info Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    {app.applicant_email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                          </svg>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</p>
                          <p style={{ margin: 0, fontSize: '13px', color: '#111827', fontWeight: 500 }}>{app.applicant_email}</p>
                        </div>
                      </div>
                    )}
                    {app.applicant_location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</p>
                          <p style={{ margin: 0, fontSize: '13px', color: '#111827', fontWeight: 500 }}>{app.applicant_location}</p>
                        </div>
                      </div>
                    )}
                    {app.resume_url && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resume</p>
                          <a href={app.resume_url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
                            View Resume
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {app.applicant_skills && app.applicant_skills.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Skills</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {app.applicant_skills.map((skill, i) => (
                          <span key={i} style={{
                            background: '#f5f3ff', color: '#6d28d9',
                            border: '1px solid #e9d5ff', borderRadius: '6px',
                            padding: '3px 10px', fontSize: '12px', fontWeight: 600,
                          }}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cover Letter */}
                  {app.cover_letter && (
                    <div style={{
                      background: '#f9fafb', borderRadius: '10px',
                      padding: '14px 16px', marginBottom: '16px', border: '1px solid #e5e7eb',
                    }}>
                      <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        Cover Letter
                      </p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: 1.7 }}>{app.cover_letter}</p>
                    </div>
                  )}

                  {/* Interview Details (if scheduled) */}
                  {app.status === 'interview_scheduled' && app.interview_link && (
                    <div style={{
                      background: '#fffbeb', border: '1px solid #fcd34d',
                      borderRadius: '10px', padding: '14px 16px', marginBottom: '16px',
                    }}>
                      <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        Interview Scheduled
                      </p>
                      <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#78350f' }}>
                        <strong>Date:</strong> {new Date(app.interview_date).toLocaleString('en-IN')}
                      </p>
                      <a href={app.interview_link} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#4f46e5', fontWeight: 600 }}>
                        Join Meeting
                      </a>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Shortlist */}
                    <button className="action-btn"
                      onClick={() => handleStatusUpdate(app.id, 'shortlisted')}
                      disabled={updatingId === app.id || app.status === 'shortlisted' || app.status === 'interview_scheduled' || app.status === 'hired'}
                      style={{
                        flex: 1, minWidth: '100px',
                        background: app.status === 'shortlisted' ? '#dcfce7' : 'linear-gradient(135deg, #059669, #10b981)',
                        color: app.status === 'shortlisted' ? '#15803d' : '#fff',
                        border: app.status === 'shortlisted' ? '1px solid #bbf7d0' : 'none',
                        borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 700,
                        cursor: (app.status === 'shortlisted' || app.status === 'interview_scheduled' || app.status === 'hired') ? 'default' : 'pointer',
                        opacity: updatingId === app.id ? 0.7 : 1,
                      }}>
                      {app.status === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
                    </button>

                    {/* Schedule Interview */}
                    <button className="action-btn"
                      onClick={() => handleScheduleInterview(app)}
                      disabled={updatingId === app.id || app.status === 'hired' || app.status === 'rejected'}
                      style={{
                        flex: 1, minWidth: '130px',
                        background: app.status === 'interview_scheduled' ? '#fef9c3' : 'linear-gradient(135deg, #d97706, #f59e0b)',
                        color: app.status === 'interview_scheduled' ? '#854d0e' : '#fff',
                        border: app.status === 'interview_scheduled' ? '1px solid #fde68a' : 'none',
                        borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 700,
                        cursor: (app.status === 'hired' || app.status === 'rejected') ? 'default' : 'pointer',
                        opacity: updatingId === app.id ? 0.7 : 1,
                      }}>
                      {app.status === 'interview_scheduled' ? 'Interview Sent' : 'Schedule Interview'}
                    </button>

                    {/* Hire */}
                    <button className="action-btn"
                      onClick={() => handleStatusUpdate(app.id, 'hired')}
                      disabled={updatingId === app.id || app.status === 'hired'}
                      style={{
                        flex: 1, minWidth: '80px',
                        background: app.status === 'hired' ? '#ede9fe' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        color: app.status === 'hired' ? '#6d28d9' : '#fff',
                        border: app.status === 'hired' ? '1px solid #c4b5fd' : 'none',
                        borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 700,
                        cursor: app.status === 'hired' ? 'default' : 'pointer',
                        opacity: updatingId === app.id ? 0.7 : 1,
                      }}>
                      {app.status === 'hired' ? 'Hired' : 'Hire'}
                    </button>

                    {/* Reject */}
                    <button className="action-btn"
                      onClick={() => handleStatusUpdate(app.id, 'rejected')}
                      disabled={updatingId === app.id || app.status === 'rejected'}
                      style={{
                        flex: 1, minWidth: '80px',
                        background: app.status === 'rejected' ? '#fee2e2' : '#fff',
                        color: '#dc2626', border: '1.5px solid #fecaca',
                        borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 700,
                        cursor: app.status === 'rejected' ? 'default' : 'pointer',
                        opacity: updatingId === app.id ? 0.7 : 1,
                      }}>
                      {app.status === 'rejected' ? 'Rejected' : 'Reject'}
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

export default JobApplications;