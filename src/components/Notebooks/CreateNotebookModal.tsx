import { useState, useEffect } from 'react';
import { X, FileCode, Server } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CreateNotebookModalProps {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    workspace_id: string;
    language: 'python' | 'sql' | 'scala' | 'r';
    cluster_id: string | null;
  }) => Promise<void>;
}

interface Workspace {
  id: string;
  name: string;
}

interface ComputeCluster {
  id: string;
  name: string;
  status: string;
  compute_type: string;
}

const languages = [
  { value: 'python' as const, label: 'Python', color: 'from-blue-500 to-blue-600', desc: 'Data analysis & ML' },
  { value: 'sql' as const, label: 'SQL', color: 'from-green-500 to-green-600', desc: 'Data queries' },
  { value: 'scala' as const, label: 'Scala', color: 'from-red-500 to-red-600', desc: 'Spark workloads' },
  { value: 'r' as const, label: 'R', color: 'from-purple-500 to-purple-600', desc: 'Statistical computing' },
];

export function CreateNotebookModal({ onClose, onSubmit }: CreateNotebookModalProps) {
  const [name, setName] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [language, setLanguage] = useState<'python' | 'sql' | 'scala' | 'r'>('python');
  const [clusterId, setClusterId] = useState<string>('');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [clusters, setClusters] = useState<ComputeCluster[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
    fetchClusters();
  }, []);

  const fetchWorkspaces = async () => {
    const { data } = await supabase
      .from('workspaces')
      .select('id, name')
      .order('created_at', { ascending: false });

    if (data) {
      setWorkspaces(data);
      if (data.length > 0) {
        setWorkspaceId(data[0].id);
      }
    }
  };

  const fetchClusters = async () => {
    const { data } = await supabase
      .from('compute_clusters')
      .select('id, name, status, compute_type')
      .eq('status', 'running')
      .order('created_at', { ascending: false });

    if (data) {
      setClusters(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name,
        workspace_id: workspaceId,
        language,
        cluster_id: clusterId || null,
      });
      onClose();
    } catch (error) {
      console.error('Error creating notebook:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Create Notebook</h2>
            <p className="text-green-50 text-sm mt-1">Start your interactive data exploration</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notebook Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Customer Analytics"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workspace
            </label>
            {workspaces.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
                Please create a workspace first. Workspaces help organize your notebooks and data projects.
              </div>
            ) : (
              <select
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Language
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => setLanguage(lang.value)}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    language === lang.value
                      ? 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <FileCode className={`w-8 h-8 mx-auto mb-2 ${
                    language === lang.value ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <div className="text-sm font-bold text-gray-900">{lang.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{lang.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach to Cluster (Optional)
            </label>
            {clusters.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
                <p className="font-semibold mb-1">No running clusters available</p>
                <p>You can attach a cluster later or create a new one from the Compute Clusters page.</p>
              </div>
            ) : (
              <select
                value={clusterId}
                onChange={(e) => setClusterId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select a cluster (optional)</option>
                {clusters.map((cluster) => (
                  <option key={cluster.id} value={cluster.id}>
                    {cluster.name} ({cluster.compute_type})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Your notebook will be created with an empty code cell</li>
              <li>• You can add more cells and write code interactively</li>
              <li>• Results will be displayed inline as you execute cells</li>
              <li>• All changes are automatically saved</li>
            </ul>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || workspaces.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Creating...' : 'Create Notebook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
