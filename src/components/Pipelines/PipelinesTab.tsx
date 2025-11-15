import { useState, useEffect } from 'react';
import { Plus, GitBranch, Loader2, Play, Trash2, Calendar, Download, RefreshCw, Square, Settings } from 'lucide-react';
import PipelineWorkflowBuilder from './PipelineWorkflowBuilder';
import GitImportModal, { GitImportConfig } from './GitImportModal';
import { CloudIcon } from '../Common/CloudIcon';

interface Pipeline {
  id: string;
  name: string;
  description: string | null;
  pipeline_graph: any;
  airflow_yaml: string | null;
  status: string;
  schedule: string | null;
  last_run: string | null;
  cloud_provider: string;
  created_at: string;
  updated_at: string;
}

interface PipelineRun {
  id: string;
  pipeline_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
}

export function PipelinesTab() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [pipelineRuns, setPipelineRuns] = useState<Record<string, PipelineRun>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGitImportModal, setShowGitImportModal] = useState(false);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [currentPipeline, setCurrentPipeline] = useState<Pipeline | null>(null);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [newPipelineDesc, setNewPipelineDesc] = useState('');
  const [newCloudProvider, setNewCloudProvider] = useState('aws');
  const [scheduleExpression, setScheduleExpression] = useState('');

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = async () => {
    try {
      const { data } = await supabase
        .from('pipelines')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setPipelines(data);
        await fetchLatestRuns(data);
      }
    } catch (error) {
      console.error('Error fetching pipelines:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPipelines();
  };

  const fetchLatestRuns = async (pipelines: Pipeline[]) => {
    const runs: Record<string, PipelineRun> = {};

    for (const pipeline of pipelines) {
      const { data } = await supabase
        .from('pipeline_runs')
        .select('*')
        .eq('pipeline_id', pipeline.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        runs[pipeline.id] = data;
      }
    }

    setPipelineRuns(runs);
  };

  const handleCreatePipeline = async () => {
    if (!newPipelineName.trim()) {
      alert('Please enter a pipeline name');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: workspaces } = await supabase
        .from('workspaces')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (!workspaces || workspaces.length === 0) {
        const { data: newWorkspace } = await supabase
          .from('workspaces')
          .insert([{ user_id: user.id, name: 'Default Workspace' }])
          .select()
          .single();

        if (!newWorkspace) throw new Error('Failed to create workspace');
      }

      const workspaceId = workspaces?.[0]?.id || (await supabase
        .from('workspaces')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single()).data?.id;

      const { data: newPipeline, error } = await supabase
        .from('pipelines')
        .insert([
          {
            workspace_id: workspaceId,
            name: newPipelineName,
            description: newPipelineDesc,
            pipeline_graph: { nodes: [], edges: [] },
            status: 'draft',
            cloud_provider: newCloudProvider,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setCurrentPipeline(newPipeline);
      setShowCreateModal(false);
      setShowWorkflowBuilder(true);
      setNewPipelineName('');
      setNewPipelineDesc('');
      setNewCloudProvider('aws');
    } catch (error: any) {
      alert('Error creating pipeline: ' + error.message);
    }
  };

  const handleSaveWorkflow = async (workflow: any, yaml: string) => {
    if (!currentPipeline) return;

    try {
      const { error } = await supabase
        .from('pipelines')
        .update({
          pipeline_graph: workflow,
          airflow_yaml: yaml,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentPipeline.id);

      if (error) throw error;

      await fetchPipelines();
      setShowWorkflowBuilder(false);
      setCurrentPipeline(null);
      alert('Pipeline saved successfully!');
    } catch (error: any) {
      alert('Error saving pipeline: ' + error.message);
    }
  };

  const handleEditPipeline = (pipeline: Pipeline) => {
    setCurrentPipeline(pipeline);
    setShowWorkflowBuilder(true);
  };

  const handleDeletePipeline = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pipeline?')) return;

    try {
      const { error } = await supabase.from('pipelines').delete().eq('id', id);
      if (error) throw error;
      await fetchPipelines();
    } catch (error: any) {
      alert('Error deleting pipeline: ' + error.message);
    }
  };

  const handleRunPipeline = async (pipelineId: string) => {
    try {
      const { error } = await supabase
        .from('pipeline_runs')
        .insert([
          {
            pipeline_id: pipelineId,
            status: 'running',
            started_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      setTimeout(async () => {
        const duration = Math.floor(Math.random() * 120) + 30;
        const success = Math.random() > 0.3;

        await supabase
          .from('pipeline_runs')
          .update({
            status: success ? 'success' : 'failed',
            completed_at: new Date().toISOString(),
            duration_seconds: duration,
            error_message: success ? null : 'Simulated error for testing',
          })
          .eq('pipeline_id', pipelineId)
          .order('started_at', { ascending: false })
          .limit(1);

        await supabase
          .from('pipelines')
          .update({
            last_run: new Date().toISOString(),
            status: success ? 'active' : 'error',
          })
          .eq('id', pipelineId);

        await fetchPipelines();
      }, 3000);

      await fetchPipelines();
    } catch (error: any) {
      alert('Error running pipeline: ' + error.message);
    }
  };

  const handleStopPipeline = async (pipelineId: string) => {
    try {
      const { data: runningRun } = await supabase
        .from('pipeline_runs')
        .select('*')
        .eq('pipeline_id', pipelineId)
        .eq('status', 'running')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!runningRun) {
        alert('No running pipeline found to stop.');
        return;
      }

      const duration = Math.floor((new Date().getTime() - new Date(runningRun.started_at).getTime()) / 1000);

      await supabase
        .from('pipeline_runs')
        .update({
          status: 'cancelled',
          completed_at: new Date().toISOString(),
          duration_seconds: duration,
          error_message: 'Pipeline stopped by user',
        })
        .eq('id', runningRun.id);

      await supabase
        .from('pipelines')
        .update({
          status: 'draft',
        })
        .eq('id', pipelineId);

      await fetchPipelines();
    } catch (error: any) {
      alert('Error stopping pipeline: ' + error.message);
    }
  };

  const handleSchedulePipeline = (pipeline: Pipeline) => {
    setCurrentPipeline(pipeline);
    setScheduleExpression(pipeline.schedule || '');
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = async () => {
    if (!currentPipeline) return;

    try {
      const { error } = await supabase
        .from('pipelines')
        .update({
          schedule: scheduleExpression || null,
          status: scheduleExpression ? 'active' : 'draft',
        })
        .eq('id', currentPipeline.id);

      if (error) throw error;

      await fetchPipelines();
      setShowScheduleModal(false);
      setCurrentPipeline(null);
      setScheduleExpression('');
      alert('Schedule saved successfully!');
    } catch (error: any) {
      alert('Error saving schedule: ' + error.message);
    }
  };

  const handleGitImport = async (gitConfig: GitImportConfig) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: workspaces } = await supabase
        .from('workspaces')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      let workspaceId = workspaces?.[0]?.id;

      if (!workspaceId) {
        const { data: newWorkspace } = await supabase
          .from('workspaces')
          .insert([{ user_id: user.id, name: 'Default Workspace' }])
          .select()
          .single();
        workspaceId = newWorkspace?.id;
      }

      const { data: newPipeline, error } = await supabase
        .from('pipelines')
        .insert([
          {
            workspace_id: workspaceId,
            name: gitConfig.name,
            description: gitConfig.description,
            pipeline_graph: { nodes: [], edges: [] },
            status: 'draft',
            git_repo_url: gitConfig.gitRepoUrl,
            git_branch: gitConfig.gitBranch,
            git_file_path: gitConfig.gitFilePath,
            git_sync_enabled: gitConfig.gitSyncEnabled,
            last_git_sync: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      await fetchPipelines();
      setShowGitImportModal(false);
      alert(`Pipeline "${gitConfig.name}" imported successfully from Git!`);
    } catch (error: any) {
      alert('Error importing pipeline: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; dot: string }> = {
      draft: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' },
      active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
      paused: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
      error: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    };

    const style = styles[status] || styles.draft;

    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${style.bg} ${style.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
        <span>{status}</span>
      </span>
    );
  };

  const getRunStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; dot: string }> = {
      running: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
      success: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
      failed: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
      cancelled: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' },
      paused: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    };

    const style = styles[status] || styles.running;

    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${style.bg} ${style.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${status === 'running' ? 'animate-pulse' : ''}`}></span>
        <span>{status}</span>
      </span>
    );
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Pipelines</h1>
          <p className="text-sm text-gray-600 mt-1">Build and orchestrate complex data workflows with drag-and-drop</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowGitImportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-cyan-500 text-cyan-600 rounded-lg hover:bg-cyan-50 transition font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Import from Git</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Create Pipeline</span>
          </button>
        </div>
      </div>

      {pipelines.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GitBranch className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pipelines Yet</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            Design visual data workflows with drag-and-drop. Connect AWS, Azure, GCP services, and custom transformations.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Pipeline</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-3">
                    Pipeline
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-3">
                    Schedule
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-3">
                    Last Run
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-3">
                    Duration
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-3">
                    Run Status
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pipelines.map((pipeline) => {
                  const lastRun = pipelineRuns[pipeline.id];
                  const isRunning = lastRun?.status === 'running';

                  return (
                    <tr key={pipeline.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            pipeline.cloud_provider === 'aws' ? 'bg-orange-100 text-orange-600' :
                            pipeline.cloud_provider === 'azure' ? 'bg-blue-100 text-blue-600' :
                            pipeline.cloud_provider === 'gcp' ? 'bg-red-100 text-red-600' :
                            pipeline.cloud_provider === 'snowflake' ? 'bg-cyan-100 text-cyan-600' :
                            pipeline.cloud_provider === 'databricks' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <CloudIcon provider={pipeline.cloud_provider || 'other'} className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{pipeline.name}</p>
                            {pipeline.description && (
                              <p className="text-xs text-gray-500 truncate">{pipeline.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(pipeline.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {pipeline.schedule ? (
                          <code className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {pipeline.schedule}
                          </code>
                        ) : (
                          <span className="text-xs text-gray-400">Manual</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {pipeline.last_run ? new Date(pipeline.last_run).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDuration(lastRun?.duration_seconds || null)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lastRun ? getRunStatusBadge(lastRun.status) : <span className="text-xs text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          {isRunning ? (
                            <button
                              onClick={() => handleStopPipeline(pipeline.id)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                              title="Stop Pipeline"
                            >
                              <Square className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRunPipeline(pipeline.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Run Pipeline"
                            >
                              <Play className="w-4 h-4 fill-green-600" />
                            </button>
                          )}
                          <button
                            onClick={() => handleSchedulePipeline(pipeline)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Schedule Pipeline"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditPipeline(pipeline)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title="Edit Pipeline"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePipeline(pipeline.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Pipeline"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Pipeline</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pipeline Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPipelineName}
                  onChange={(e) => setNewPipelineName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="My ETL Pipeline"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newPipelineDesc}
                  onChange={(e) => setNewPipelineDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe what this pipeline does..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cloud Provider <span className="text-red-500">*</span>
                </label>
                <select
                  value={newCloudProvider}
                  onChange={(e) => setNewCloudProvider(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="aws">AWS</option>
                  <option value="azure">Azure</option>
                  <option value="gcp">Google Cloud Platform</option>
                  <option value="snowflake">Snowflake</option>
                  <option value="databricks">Databricks</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewPipelineName('');
                  setNewPipelineDesc('');
                  setNewCloudProvider('aws');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePipeline}
                className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
              >
                Create & Design
              </button>
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && currentPipeline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Schedule Pipeline</h3>
            <p className="text-sm text-gray-600 mb-4">{currentPipeline.name}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cron Expression
                </label>
                <input
                  type="text"
                  value={scheduleExpression}
                  onChange={(e) => setScheduleExpression(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
                  placeholder="0 0 * * * (Daily at midnight)"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Leave empty to disable scheduling (manual execution only)
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Common Schedules:</h4>
                <div className="space-y-1 text-xs text-gray-700">
                  <p><code className="bg-white px-2 py-0.5 rounded">0 0 * * *</code> - Daily at midnight</p>
                  <p><code className="bg-white px-2 py-0.5 rounded">0 */6 * * *</code> - Every 6 hours</p>
                  <p><code className="bg-white px-2 py-0.5 rounded">0 0 * * 1</code> - Weekly on Monday</p>
                  <p><code className="bg-white px-2 py-0.5 rounded">0 9 * * 1-5</code> - Weekdays at 9 AM</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setCurrentPipeline(null);
                  setScheduleExpression('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {showGitImportModal && (
        <GitImportModal
          onImport={handleGitImport}
          onClose={() => setShowGitImportModal(false)}
        />
      )}

      {showWorkflowBuilder && currentPipeline && (
        <PipelineWorkflowBuilder
          pipelineName={currentPipeline.name}
          onSave={handleSaveWorkflow}
          onClose={() => {
            setShowWorkflowBuilder(false);
            setCurrentPipeline(null);
          }}
          initialWorkflow={currentPipeline.pipeline_graph}
        />
      )}
    </div>
  );
}
