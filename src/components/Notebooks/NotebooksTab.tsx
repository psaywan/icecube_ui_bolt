import { useState, useEffect } from 'react';
import { Plus, FileCode, Play, Trash2, Loader2, FolderOpen, GitBranch, Eye } from 'lucide-react';
import { rdsApi } from '../../lib/rdsApi';
import { CreateNotebookModal } from './CreateNotebookModal';
import { NotebookEditor } from './NotebookEditor';
import { GitImportModal } from './GitImportModal';
import TestNotebook from './TestNotebook';

interface Notebook {
  id: string;
  name: string;
  language: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
  content?: any;
}

export function NotebooksTab() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGitModal, setShowGitModal] = useState(false);
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
  const [showTestNotebook, setShowTestNotebook] = useState(false);

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const fetchNotebooks = async () => {
    try {
      const data = await rdsApi.notebooks.getAll();
      setNotebooks(data);
    } catch (error) {
      console.error('Error fetching notebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotebook = async (data: {
    name: string;
    workspace_id: string;
    language: 'python' | 'sql' | 'scala' | 'r';
    cluster_id: string | null;
  }) => {
    try {
      await rdsApi.notebooks.create({
        ...data,
        content: { cells: [] },
      });
      await fetchNotebooks();
    } catch (error) {
      console.error('Error creating notebook:', error);
      throw error;
    }
  };

  const handleDeleteNotebook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notebook?')) return;

    try {
      await rdsApi.notebooks.delete(id);
      await fetchNotebooks();
    } catch (error) {
      console.error('Error deleting notebook:', error);
    }
  };

  const handleGitImport = async (data: { repoUrl: string; branch: string; path: string }) => {
    console.log('Importing from Git:', data);
    setShowGitModal(false);
    await fetchNotebooks();
  };

  const languageColors: Record<string, string> = {
    python: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    sql: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
    scala: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    r: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  };

  if (showTestNotebook) {
    return <TestNotebook onClose={() => setShowTestNotebook(false)} />;
  }

  if (selectedNotebook) {
    return (
      <NotebookEditor
        notebookId={selectedNotebook}
        onClose={() => {
          setSelectedNotebook(null);
          fetchNotebooks();
        }}
      />
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notebooks</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">Interactive data exploration and analysis</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowGitModal(true)}
            className="flex items-center space-x-2 px-5 py-3 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg font-semibold hover:border-cyan-500 hover:text-cyan-600 dark:hover:border-cyan-500 dark:hover:text-cyan-400 transition"
          >
            <GitBranch className="w-5 h-5" />
            <span>Import from Git</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow-lg shadow-green-500/30"
          >
            <Plus className="w-5 h-5" />
            <span>New Notebook</span>
          </button>
        </div>
      </div>

      {notebooks.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileCode className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Notebooks Yet</h3>
          <p className="text-gray-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Create your first notebook to start analyzing data interactively with Python, SQL, Scala, or R.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Create Notebook</span>
            </button>
            <button
              onClick={() => setShowTestNotebook(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition shadow-lg"
            >
              <Eye className="w-5 h-5" />
              <span>View Demo Notebook</span>
            </button>
            <button
              onClick={() => setShowGitModal(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg font-semibold hover:border-cyan-500 hover:text-cyan-600 dark:hover:border-cyan-500 dark:hover:text-cyan-400 transition"
            >
              <GitBranch className="w-5 h-5" />
              <span>Import from Git</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notebooks.map((notebook) => (
            <div
              key={notebook.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 dark:border-slate-700 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <FileCode className="w-5 h-5 text-white" />
                    </div>
                    <span className={`px-2 py-1 border rounded text-xs font-medium ${languageColors[notebook.language] || languageColors.python}`}>
                      {notebook.language.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{notebook.name}</h3>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                <div>Created: {new Date(notebook.created_at).toLocaleDateString()}</div>
                <div>Modified: {new Date(notebook.updated_at).toLocaleDateString()}</div>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                  onClick={() => setSelectedNotebook(notebook.id)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition text-sm font-medium shadow-lg"
                >
                  <Play className="w-4 h-4" />
                  <span>Open</span>
                </button>
                <button
                  onClick={() => handleDeleteNotebook(notebook.id)}
                  className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                  title="Delete notebook"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateNotebookModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateNotebook}
        />
      )}

      {showGitModal && (
        <GitImportModal
          onClose={() => setShowGitModal(false)}
          onImport={handleGitImport}
        />
      )}
    </div>
  );
}
