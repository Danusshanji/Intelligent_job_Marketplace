import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobApplications, updateApplicationStatus } from '../services/api';

function JobApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const response = await getJobApplications(jobId);
      setApplications(response.data);
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateApplicationStatus(id, { status });
      setMessage(`Application ${status} successfully!`);
      fetchApplications();
    } catch (err) {
      setMessage('Failed to update status.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-700';
      case 'shortlisted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'hired': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-gradient-to-r from-indigo-700 to-purple-700 px-8 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏢</span>
          <div>
            <h1 className="text-xl font-bold text-white">Job Marketplace</h1>
            <p className="text-indigo-200 text-xs">Employer Portal</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/employer-dashboard')}
          className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition">
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Job Applicants</h2>
            <p className="text-gray-500 mt-1">Review and manage applications for this job</p>
          </div>
          <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-semibold">
            {applications.length} Applicant{applications.length !== 1 ? 's' : ''}
          </div>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-6">
            ✅ {message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-500 text-lg">No applications yet for this job.</p>
            <p className="text-gray-400 text-sm mt-2">Share the job listing to attract candidates!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                      {app.applicant_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{app.applicant_name}</h3>
                      <p className="text-gray-500 text-sm">Applied on {new Date(app.applied_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(app.status)}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>

                {app.cover_letter && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{app.cover_letter}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleStatusUpdate(app.id, 'shortlisted')}
                    className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition">
                    ✅ Shortlist
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(app.id, 'hired')}
                    className="flex-1 bg-purple-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-purple-600 transition">
                    🏆 Hire
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(app.id, 'rejected')}
                    className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition">
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobApplications;