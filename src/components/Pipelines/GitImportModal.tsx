import { useState } from 'react';
import { X, GitBranch, Download } from 'lucide-react';

interface GitImportModalProps {
  onImport: (gitConfig: GitImportConfig) => void;
  onClose: () => void;
}

export interface GitImportConfig {
  name: string;
  description: string;
  gitRepoUrl: string;
  gitBranch: string;
  gitFilePath: string;
  gitSyncEnabled: boolean;
}

export default function GitImportModal({ onImport, onClose }: GitImportModalProps) {
  const [formData, setFormData] = useState<GitImportConfig>({
    name: '',
    description: '',
    gitRepoUrl: '',
    gitBranch: 'main',
    gitFilePath: '',
    gitSyncEnabled: false,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onImport(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Import Pipeline from Git</h3>
              <p className="text-sm text-gray-600">Connect your pipeline to a Git repository</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pipeline Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="My ETL Pipeline"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              rows={2}
              placeholder="Describe what this pipeline does..."
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Git Repository Configuration</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repository URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.gitRepoUrl}
                  onChange={(e) => setFormData({ ...formData, gitRepoUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
                  placeholder="https://github.com/username/repo.git"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Supports GitHub, GitLab, Bitbucket, and other Git providers
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.gitBranch}
                    onChange={(e) => setFormData({ ...formData, gitBranch: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="main"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Path <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.gitFilePath}
                    onChange={(e) => setFormData({ ...formData, gitFilePath: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
                    placeholder="workflows/pipeline.yaml"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.gitSyncEnabled}
                    onChange={(e) => setFormData({ ...formData, gitSyncEnabled: e.target.checked })}
                    className="mt-1 w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Enable Auto-Sync</span>
                    <p className="text-xs text-gray-600 mt-1">
                      Automatically sync pipeline changes from Git repository
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-600 transition font-medium flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Import Pipeline</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
