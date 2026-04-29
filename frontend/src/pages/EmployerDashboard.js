import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobs, createJob, getJobApplications, rankCandidates } from '../services/api';

function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [showCandidates, setShowCandidates] = useState(false);
  const [formData, setFormData] = useState({
    title: '', company: '', location: '',
    job_type: 'full_time', description: '',
    requirements: '', skills_required: '', salary: ''
  });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const response = await getJobs();
      const myJobs = response.data.filter(job => job.employer_name === user?.username);
      setJobs(myJobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await createJob(formData);
      setMessage('Job posted successfully!');
      setMessageType('success');
      setShowForm(false);
      setFormData({
        title: '', company: '', location: '', job_type: 'full_time',
        description: '', requirements: '', skills_required: '', salary: ''
      });
      fetchJobs();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('Failed to post job. Please try again.');
      setMessageType('error');
    }
  };

  const handleViewCandidates = async (job) => {
    setSelectedJob(job);
    setShowCandidates(true);
    setCandidatesLoading(true);
    setCandidates([]);
    try {
      const response = await rankCandidates(job.id);
      setCandidates(response.data.ranked_candidates || []);
    } catch (err) {
      console.error(err);
      setCandidates([]);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getMatchStyle = (score) => {
    if (score >= 15) return { bg: '#dcfce7', color: '#15803d', label: 'Strong Match', dot: '#16a34a' };
    if (score >= 8) return { bg: '#fef9c3', color: '#854d0e', label: 'Good Match', dot: '#ca8a04' };
    return { bg: '#fee2e2', color: '#991b1b', label: 'Partial Match', dot: '#dc2626' };
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #e5e7eb', borderRadius: '10px',
    fontSize: '14px', color: '#111827', background: '#f9fafb',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  };

  const totalApplications = jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      fontFamily: "'Segoe UI', 'Inter', sans-serif",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .job-card { transition: transform 0.2s, box-shadow 0.2s; }
        .job-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        input:focus, textarea:focus, select:focus { border-color: #4f46e5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); background: #fff !important; }
        .candidate-row:hover { background: #f8fafc !important; }
      `}</style>

      {/* ── NAVBAR ── */}
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '17px', fontWeight: 800, color: '#1e1b4b' }}>
        Job<span style={{ color: '#7c3aed' }}>Marketplace</span>
      </span>
      <span style={{
        background: '#ede9fe', color: '#6d28d9',
        fontSize: '11px', fontWeight: 700, padding: '2px 8px',
        borderRadius: '999px',
      }}>Employer</span>
    </div>
  </div>

  {/* Right side */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

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
        {user?.username?.[0]?.toUpperCase() || 'E'}
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

      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto' }}>

        {/* ── MAIN CONTENT ── */}
        <div style={{
          flex: 1, padding: '32px 24px',
          transition: 'all 0.3s',
          maxWidth: showCandidates ? '55%' : '100%',
        }}>

          {/* Page Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#111827', margin: '0 0 4px' }}>
                Employer Dashboard
              </h1>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                Manage your job postings and find the best talent
              </p>
            </div>
            <button onClick={() => { setShowForm(!showForm); setShowCandidates(false); }} style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: '#fff', border: 'none', borderRadius: '10px',
              padding: '11px 22px', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
              Post New Job
            </button>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
            {[
              { label: 'Jobs Posted', value: jobs.length, bg: 'linear-gradient(135deg, #4f46e5, #6366f1)' },
              { label: 'Active Listings', value: jobs.filter(j => j.is_active).length, bg: 'linear-gradient(135deg, #059669, #10b981)' },
              { label: 'Total Applications', value: totalApplications, bg: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
              { label: 'Company', value: jobs[0]?.company || '—', bg: 'linear-gradient(135deg, #d97706, #f59e0b)', small: true },
            ].map((stat, i) => (
              <div key={i} style={{
                background: stat.bg, borderRadius: '14px',
                padding: '20px 22px', flex: 1, minWidth: '140px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              }}>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {stat.label}
                </p>
                <p style={{ color: '#fff', fontSize: stat.small ? '16px' : '28px', fontWeight: 800, margin: 0 }}>
                  {stat.value}
                </p>
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
              <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'inherit' }}>×</button>
            </div>
          )}

          {/* Post Job Form */}
          {showForm && (
            <div style={{
              background: '#fff', borderRadius: '18px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
              padding: '28px', marginBottom: '28px',
              border: '1px solid #e5e7eb',
              animation: 'fadeIn 0.3s ease',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                  Post a New Job
                </h3>
                <button onClick={() => setShowForm(false)} style={{
                  background: '#f3f4f6', border: 'none', borderRadius: '8px',
                  padding: '6px 12px', cursor: 'pointer', color: '#6b7280', fontWeight: 600, fontSize: '13px',
                }}>Cancel</button>
              </div>

              <form onSubmit={handlePostJob}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  {[
                    { label: 'Job Title', name: 'title', placeholder: 'e.g. React Developer' },
                    { label: 'Company Name', name: 'company', placeholder: 'e.g. Tech Solutions' },
                    { label: 'Location', name: 'location', placeholder: 'e.g. Bangalore' },
                    { label: 'Salary', name: 'salary', placeholder: 'e.g. 5 LPA' },
                    { label: 'Skills Required', name: 'skills_required', placeholder: 'e.g. React, Django, Python' },
                  ].map(field => (
                    <div key={field.name}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7c3aed', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        {field.label}
                      </label>
                      <input
                        type="text" name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        style={inputStyle}
                        required={field.name !== 'salary'}
                      />
                    </div>
                  ))}

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7c3aed', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      Job Type
                    </label>
                    <select name="job_type" value={formData.job_type} onChange={handleChange} style={{ ...inputStyle }}>
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="internship">Internship</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7c3aed', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      Job Description
                    </label>
                    <textarea name="description" value={formData.description} onChange={handleChange}
                      rows={4} placeholder="Describe the job role..."
                      style={{ ...inputStyle, resize: 'vertical' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7c3aed', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      Requirements
                    </label>
                    <textarea name="requirements" value={formData.requirements} onChange={handleChange}
                      rows={4} placeholder="List the requirements..."
                      style={{ ...inputStyle, resize: 'vertical' }} required />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" style={{
                    flex: 1, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    color: '#fff', border: 'none', borderRadius: '10px',
                    padding: '12px', fontSize: '14px', fontWeight: 700,
                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
                  }}>Post Job</button>
                  <button type="button" onClick={() => setShowForm(false)} style={{
                    flex: 1, background: '#f3f4f6', color: '#374151',
                    border: 'none', borderRadius: '10px', padding: '12px',
                    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Job Listings */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
              Your Job Postings
            </h2>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} posted
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                border: '4px solid #e5e7eb', borderTop: '4px solid #4f46e5',
                animation: 'spin 0.8s linear infinite', margin: '0 auto 14px',
              }} />
              <p style={{ color: '#6b7280', fontWeight: 600 }}>Loading your jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 24px',
              background: '#fff', borderRadius: '16px',
              border: '1px solid #e5e7eb',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '14px',
                background: '#f5f3ff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                </svg>
              </div>
              <p style={{ color: '#111827', fontWeight: 700, fontSize: '15px', margin: '0 0 6px' }}>No jobs posted yet</p>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px' }}>Click "Post New Job" to get started</p>
              <button onClick={() => setShowForm(true)} style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#fff', border: 'none', borderRadius: '10px',
                padding: '10px 22px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              }}>Post Your First Job</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {jobs.map((job) => (
                <div key={job.id} className="job-card" style={{
                  background: selectedJob?.id === job.id ? '#faf5ff' : '#fff',
                  borderRadius: '14px', padding: '20px',
                  border: selectedJob?.id === job.id ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                }}>
                  {/* Job Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: 800, color: '#111827' }}>{job.title}</h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{job.company}</p>
                    </div>
                    <span style={{
                      background: job.is_active ? '#dcfce7' : '#fee2e2',
                      color: job.is_active ? '#15803d' : '#dc2626',
                      fontSize: '11px', fontWeight: 700, padding: '3px 10px',
                      borderRadius: '999px', whiteSpace: 'nowrap', marginLeft: '8px',
                    }}>
                      {job.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Job Meta */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span style={{ fontSize: '12px', color: '#4b5563' }}>{job.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                      <span style={{ fontSize: '12px', color: '#4b5563' }}>{job.salary || 'Not specified'}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
                    {job.skills_required?.split(',').map((skill, i) => (
                      <span key={i} style={{
                        background: '#f5f3ff', color: '#6d28d9',
                        border: '1px solid #e9d5ff', borderRadius: '5px',
                        padding: '2px 8px', fontSize: '11px', fontWeight: 600,
                      }}>{skill.trim()}</span>
                    ))}
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleViewCandidates(job)} style={{
                      flex: 1, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      color: '#fff', border: 'none', borderRadius: '8px',
                      padding: '9px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    }}>
                      View Candidates
                    </button>
                    <button onClick={() => navigate(`/job-applications/${job.id}`)} style={{
                      flex: 1, background: '#f5f3ff', color: '#6d28d9',
                      border: '1px solid #e9d5ff', borderRadius: '8px',
                      padding: '9px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    }}>
                      Applications
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CANDIDATE RANKING PANEL ── */}
        {showCandidates && (
          <div style={{
            width: '420px', minWidth: '380px',
            background: '#fff', borderLeft: '1px solid #e5e7eb',
            padding: '28px 24px', overflowY: 'auto',
            maxHeight: '100vh', position: 'sticky', top: 64,
            animation: 'slideIn 0.3s ease',
          }}>
            {/* Panel Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                  AI Ranked Candidates
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                  {selectedJob?.title} — {selectedJob?.company}
                </p>
              </div>
              <button onClick={() => { setShowCandidates(false); setSelectedJob(null); }} style={{
                background: '#f3f4f6', border: 'none', borderRadius: '8px',
                width: 32, height: 32, cursor: 'pointer', fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280',
              }}>×</button>
            </div>

            {/* AI Info Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
              border: '1px solid #c4b5fd', borderRadius: '10px',
              padding: '12px 14px', marginBottom: '20px',
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#6d28d9', fontWeight: 600 }}>
                Candidates ranked by AI based on resume match with job description and required skills.
              </p>
            </div>

            {candidatesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  border: '3px solid #ede9fe', borderTop: '3px solid #7c3aed',
                  animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
                }} />
                <p style={{ color: '#7c3aed', fontWeight: 600, fontSize: '13px' }}>Ranking candidates...</p>
              </div>
            ) : candidates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '12px',
                  background: '#f5f3ff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 12px',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <p style={{ color: '#374151', fontWeight: 700, fontSize: '14px', margin: '0 0 4px' }}>No applicants yet</p>
                <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>Candidates will appear here once they apply</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {candidates.map((candidate, index) => {
                  const matchStyle = getMatchStyle(candidate.match_score);
                  return (
                    <div key={candidate.id} className="candidate-row" style={{
                      background: '#f9fafb', borderRadius: '12px',
                      padding: '14px 16px', border: '1px solid #e5e7eb',
                      transition: 'background 0.15s',
                    }}>
                      {/* Rank + Name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: index === 0
                            ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                            : index === 1
                            ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                            : index === 2
                            ? 'linear-gradient(135deg, #b45309, #92400e)'
                            : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: 800, color: '#fff', flexShrink: 0,
                        }}>
                          #{index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                            {candidate.applicant_name}
                          </p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                            {candidate.applicant_email}
                          </p>
                        </div>
                        <span style={{
                          background: candidate.status === 'accepted' ? '#dcfce7'
                            : candidate.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                          color: candidate.status === 'accepted' ? '#15803d'
                            : candidate.status === 'rejected' ? '#dc2626' : '#854d0e',
                          fontSize: '10px', fontWeight: 700, padding: '3px 8px',
                          borderRadius: '999px', textTransform: 'uppercase',
                        }}>
                          {candidate.status}
                        </span>
                      </div>

                      {/* Match Score Bar */}
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>AI Match Score</span>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: matchStyle.color }}>
                            {candidate.match_score}% — {matchStyle.label}
                          </span>
                        </div>
                        <div style={{ background: '#e5e7eb', borderRadius: '999px', height: '6px' }}>
                          <div style={{
                            width: `${Math.min(candidate.match_score * 5, 100)}%`,
                            height: '100%', borderRadius: '999px',
                            background: matchStyle.dot,
                            transition: 'width 0.6s ease',
                          }} />
                        </div>
                      </div>

                      {/* Applied Date */}
                      <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
                        Applied: {new Date(candidate.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployerDashboard;