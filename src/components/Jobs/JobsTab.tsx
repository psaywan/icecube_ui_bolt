import { useState, useEffect } from 'react';
import { Plus, Calendar, Play, Pause, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Job {
  id: string;
  name: string;
  job_type: string;
  schedule: string | null;
  enabled: boolean;
  created_at: string;
}

export function JobsTab() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setJobs(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600 mt-2">Schedule and orchestrate your data workflows</p>
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition shadow-lg shadow-cyan-500/30">
          <Plus className="w-5 h-5" />
          <span>Create Job</span>
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Configured</h3>
          <p className="text-gray-600 mb-6">Create scheduled jobs to automate your data pipelines</p>
          <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition">
            <Plus className="w-5 h-5" />
            <span>Create First Job</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Job Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Schedule</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-cyan-600" />
                      <span className="font-medium text-gray-900">{job.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                      {job.job_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                    {job.schedule || 'Manual'}
                  </td>
                  <td className="px-6 py-4">
                    {job.enabled ? (
                      <span className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Enabled</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-gray-500">
                        <Pause className="w-4 h-4" />
                        <span className="text-sm font-medium">Disabled</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex items-center space-x-1 text-cyan-600 hover:text-cyan-700 font-medium text-sm">
                      <Play className="w-4 h-4" />
                      <span>Run Now</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
