import { useState } from 'react';
import { X, Github, GitBranch, AlertCircle } from 'lucide-react';
import { rdsApi } from '../../lib/rdsApi';

interface ConnectRepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: 'github' | 'gitlab' | 'bitbucket' | 'generic';
  onSuccess: () => void;
}

export function ConnectRepositoryModal({ isOpen, onClose, provider, onSuccess }: ConnectRepositoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    branch: 'main',
    username: '',
    accessToken: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const getProviderInfo = () => {
    switch (provider) {
      case 'github':
        return {
          name: 'GitHub',
          icon: <Github className="w-6 h-6" />,
          color: 'bg-gray-900 dark:bg-gray-800',
          urlPlaceholder: 'https://github.com/username/repository',
          tokenHelp: 'Generate a Personal Access Token from GitHub Settings → Developer Settings → Personal Access Tokens',
          tokenUrl: 'https://github.com/settings/tokens',
        };
      case 'gitlab':
        return {
          name: 'GitLab',
          icon: <GitBranch className="w-6 h-6" />,
          color: 'bg-orange-600',
          urlPlaceholder: 'https://gitlab.com/username/repository',
          tokenHelp: 'Generate an Access Token from GitLab User Settings → Access Tokens',
          tokenUrl: 'https://gitlab.com/-/profile/personal_access_tokens',
        };
      case 'bitbucket':
        return {
          name: 'Bitbucket',
          icon: <GitBranch className="w-6 h-6" />,
          color: 'bg-blue-600',
          urlPlaceholder: 'https://bitbucket.org/workspace/repository',
          tokenHelp: 'Generate an App Password from Bitbucket Personal Settings → App Passwords',
          tokenUrl: 'https://bitbucket.org/account/settings/app-passwords/',
        };
      case 'generic':
        return {
          name: 'Generic Git',
          icon: <GitBranch className="w-6 h-6" />,
          color: 'bg-slate-700',
          urlPlaceholder: 'https://git.example.com/repository.git',
          tokenHelp: 'Provide credentials for your Git server',
          tokenUrl: null,
        };
    }
  };

  const providerInfo = getProviderInfo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await rdsApi.repositories.create({
        provider,
        name: formData.name,
        url: formData.url,
        branch: formData.branch,
        username: formData.username,
        access_token: formData.accessToken,
        description: formData.description,
      });

      onSuccess();
      onClose();

      setFormData({
        name: '',
        url: '',
        branch: 'main',
        username: '',
        accessToken: '',
        description: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to connect repository');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className={`${providerInfo.color} text-white p-6 rounded-t-2xl flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              {providerInfo.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Connect {providerInfo.name}</h2>
              <p className="text-white/80 text-sm">Add a new repository connection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Repository Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
              placeholder="my-awesome-project"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Repository URL *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
              placeholder={providerInfo.urlPlaceholder}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Branch *
            </label>
            <input
              type="text"
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
              placeholder="main"
              required
            />
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Default branch to track</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Username {provider !== 'github' && '*'}
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
              placeholder="your-username"
              required={provider !== 'github'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Access Token / Password *
            </label>
            <input
              type="password"
              value={formData.accessToken}
              onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
              placeholder="ghp_xxxxxxxxxxxx"
              required
            />
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                {providerInfo.tokenHelp}
                {providerInfo.tokenUrl && (
                  <>
                    {' '}
                    <a
                      href={providerInfo.tokenUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      Get Token →
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
              rows={3}
              placeholder="Brief description of this repository..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 ${providerInfo.color} text-white rounded-lg hover:opacity-90 transition flex items-center space-x-2`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Connect Repository</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
