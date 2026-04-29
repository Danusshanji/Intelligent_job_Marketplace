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
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading job details...</p>
    </div>
  );

  if (!job) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Job not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💼</span>
          <h1 className="text-xl font-bold text-blue-700">Job Marketplace</h1>
        </div>
        <button
          onClick={() => navigate('/seeker-dashboard')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          Back to Jobs
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">

          {/* Job Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{job.title}</h1>
              <p className="text-gray-600">🏢 {job.company}</p>
            </div>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {job.job_type}
            </span>
          </div>

          {/* Job Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-gray-500 text-xs">Location</p>
              <p className="font-medium text-gray-800">📍 {job.location}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Salary</p>
              <p className="font-medium text-gray-800">💰 {job.salary || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Posted By</p>
              <p className="font-medium text-gray-800">👤 {job.employer_name}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Job Description</h2>
            <p className="text-gray-600 leading-relaxed">{job.description}</p>
          </div>

          {/* Requirements */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Requirements</h2>
            <p className="text-gray-600 leading-relaxed">{job.requirements}</p>
          </div>

          {/* Skills */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Skills Required</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills_required.split(',').map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Apply Section */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Apply for this Job</h2>

          {message && (
            <div className="bg-green-50 border border-green-300 text-green-600 px-4 py-3 rounded-lg mb-4">
              🎉 {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleApply}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Write why you are a good fit for this job..."
              />
            </div>
            <button
              type="submit"
              disabled={applying}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
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