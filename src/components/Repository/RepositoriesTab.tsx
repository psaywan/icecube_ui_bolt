import { useState, useEffect } from 'react';
import { Plus, GitBranch, Trash2, Loader2, Github, GitlabIcon as Gitlab, ExternalLink, RefreshCw, Settings } from 'lucide-react';
import { rdsApi } from '../../lib/rdsApi';

interface Repository {
  id: string;
  name: string;
  provider: 'github' | 'gitlab' | 'bitbucket' | 'generic';
  url: string;
  branch: string;
  status: 'connected' | 'disconnected' | 'error';
  last_sync: string;
  created_at: string;
}

export function RepositoriesTab() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      // const data = await rdsApi.repositories.getAll();
      // Placeholder data for now
      const data = [
        {
          id: '1',
          name: 'data-platform-notebooks',
          provider: 'github' as const,
          url: 'https://github.com/company/data-platform-notebooks',
          branch: 'main',
          status: 'connected' as const,
          last_sync: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'ml-pipelines',
          provider: 'gitlab' as const,
          url: 'https://gitlab.com/company/ml-pipelines',
          branch: 'develop',
          status: 'connected' as const,
          last_sync: new Date(Date.now() - 3600000).toISOString(),
          created_at: new Date().toISOString(),
        },
      ];
      setRepositories(data);
    } catch (error) {
      console.error('Error fetching repositories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (id: string) => {
    console.log('Syncing repository:', id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this repository?')) return;

    try {
      // await rdsApi.repositories.delete(id);
      await fetchRepositories();
    } catch (error) {
      console.error('Error deleting repository:', error);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'github':
        return <Github className="w-5 h-5" />;
      case 'gitlab':
        return <Gitlab className="w-5 h-5" />;
      case 'bitbucket':
        return <GitBranch className="w-5 h-5" />;
      default:
        return <GitBranch className="w-5 h-5" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'github':
        return 'bg-gray-900 dark:bg-gray-800 text-white';
      case 'gitlab':
        return 'bg-orange-600 text-white';
      case 'bitbucket':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'disconnected':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Connected Repositories</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">Manage your version control integrations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-gray-900 dark:hover:border-slate-400 transition-all group">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-gray-900 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Github className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">GitHub</h3>
              <p className="text-xs text-gray-600 dark:text-slate-400">Connect GitHub repo</p>
            </div>
          </div>
        </button>

        <button className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-orange-600 dark:hover:border-orange-500 transition-all group">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gitlab className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">GitLab</h3>
              <p className="text-xs text-gray-600 dark:text-slate-400">Connect GitLab repo</p>
            </div>
          </div>
        </button>

        <button className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-600 dark:hover:border-blue-500 transition-all group">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">Bitbucket</h3>
              <p className="text-xs text-gray-600 dark:text-slate-400">Connect Bitbucket repo</p>
            </div>
          </div>
        </button>

        <button className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-cyan-600 dark:hover:border-cyan-500 transition-all group">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-slate-700 dark:bg-slate-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">Generic Git</h3>
              <p className="text-xs text-gray-600 dark:text-slate-400">Connect any Git repo</p>
            </div>
          </div>
        </button>
      </div>

      {repositories.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <GitBranch className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Repositories Connected</h3>
          <p className="text-gray-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Connect your version control repositories to sync notebooks, scripts, and pipelines with your platform.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {repositories.map((repo) => (
            <div
              key={repo.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 dark:border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-12 h-12 ${getProviderColor(repo.provider)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {getProviderIcon(repo.provider)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{repo.name}</h3>
                      <span className={`px-2 py-1 border rounded text-xs font-medium ${getStatusColor(repo.status)}`}>
                        {repo.status}
                      </span>
                    </div>

                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline flex items-center space-x-1 mb-3"
                    >
                      <span>{repo.url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <GitBranch className="w-4 h-4" />
                        <span>Branch: {repo.branch}</span>
                      </div>
                      <div>
                        Last sync: {new Date(repo.last_sync).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSync(repo.id)}
                    className="p-2 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 rounded-lg transition"
                    title="Sync repository"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition"
                    title="Configure"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(repo.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                    title="Disconnect repository"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
