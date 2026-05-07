// JobDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, applyJob } from '../services/api';

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJob();
  }, []);

  const fetchJob = async () => {
    try {
      const response = await getJob(id);
      setJob(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await applyJob(id, { cover_letter: coverLetter });
      setMessage('Applied successfully!');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to apply. Please try again.');
      setMessage('');
    }
    setApplying(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
      <p className="text-gray-500 animate-pulse text-lg">Loading job details...</p>
    </div>
  );

  if (!job) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-500 text-lg">Job not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">

      {/* Navbar */}
      <nav className="backdrop-blur-md bg-white/70 shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💼</span>
          <h1 className="text-xl font-semibold text-gray-800 tracking-wide">Job Marketplace</h1>
        </div>
        <button
          onClick={() => navigate('/seeker-dashboard')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform shadow-md"
        >
          ← Back
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Job Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-gray-600 text-sm">🏢 {job.company}</p>
            </div>
            <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-1 rounded-full text-sm font-semibold shadow-sm">
              {job.job_type}
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-white shadow-sm border hover:shadow-md transition">
              <p className="text-xs text-gray-400">Location</p>
              <p className="font-medium text-gray-800">📍 {job.location}</p>
            </div>
            <div className="p-4 rounded-xl bg-white shadow-sm border hover:shadow-md transition">
              <p className="text-xs text-gray-400">Salary</p>
              <p className="font-medium text-gray-800">💰 {job.salary || 'Not specified'}</p>
            </div>
            <div className="p-4 rounded-xl bg-white shadow-sm border hover:shadow-md transition">
              <p className="text-xs text-gray-400">Posted By</p>
              <p className="font-medium text-gray-800">👤 {job.employer_name}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Job Description</h2>
            <p className="text-gray-600 leading-relaxed">{job.description}</p>
          </div>

          {/* Requirements */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h2>
            <p className="text-gray-600 leading-relaxed">{job.requirements}</p>
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills Required</h2>
            <div className="flex flex-wrap gap-3">
              {job.skills_required.split(',').map((skill, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full text-xs font-medium shadow-md hover:scale-105 transition-transform"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
          {/* Company Profile Section */}
      {(job.company_description || job.company_industry || job.company_size || job.company_website) && (
      <div className="detail-card" style={{
    background: '#fff', borderRadius: '18px',
    padding: '26px 28px', marginBottom: '20px',
    boxShadow: '0 2px 16px rgba(79,70,229,0.07)',
    border: '1px solid #ede9fe', animationDelay: '0.18s'
  }}>
    {/* Section Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #059669' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669', boxShadow: '0 0 6px #059669' }} />
      <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1e1b4b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>About the Company</h2>
    </div>

    {/* Company Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
      {/* Company Logo or Initial */}
      {job.company_logo_url ? (
        <img src={job.company_logo_url} alt={job.company} style={{ width: 60, height: 60, borderRadius: '12px', objectFit: 'cover', border: '2px solid #e5e7eb' }} />
      ) : (
        <div style={{
          width: 60, height: 60, borderRadius: '12px',
          background: 'linear-gradient(135deg, #059669, #10b981)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', fontWeight: 900, color: '#fff',
          flexShrink: 0,
        }}>
          {job.company?.[0]?.toUpperCase()}
        </div>
      )}
      <div>
        <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800, color: '#1e1b4b' }}>
          {job.company}
        </h3>
        {job.company_website && (
          <a href={job.company_website} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
            {job.company_website}
          </a>
        )}
      </div>
    </div>

    {/* Company Info Pills */}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
      {job.company_industry && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#d1fae5', color: '#065f46', borderRadius: '999px', padding: '6px 14px', fontSize: '13px', fontWeight: 600 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          </svg>
          {job.company_industry}
        </div>
      )}
      {job.company_size && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#dbeafe', color: '#1d4ed8', borderRadius: '999px', padding: '6px 14px', fontSize: '13px', fontWeight: 600 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          {job.company_size}
        </div>
      )}
    </div>

    {/* Company Description */}
    {job.company_description && (
      <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.8 }}>
        {job.company_description}
      </p>
    )}
  </div>
)}
        {/* Apply Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Apply for this Job</h2>

          {message && (
            <div className="bg-green-50 border border-green-300 text-green-600 px-4 py-3 rounded-lg mb-4 animate-fade-in">
              🎉 {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleApply}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm transition"
                placeholder="Write why you are a good fit for this job..."
              />
            </div>
            <button
              type="submit"
              disabled={applying}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition-transform shadow-lg"
            >
              {applying ? 'Applying...' : 'Submit Application'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default JobDetail;