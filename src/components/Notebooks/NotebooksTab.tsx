import { useState, useEffect } from 'react';
import { Plus, FileCode, Play, Trash2, Loader2, FolderOpen } from 'lucide-react';
import { useAuth } from '../../contexts/RDSAuthContext';
import { CreateNotebookModal } from './CreateNotebookModal';
import { NotebookEditor } from './NotebookEditor';

interface Notebook {
  id: string;
  name: string;
  language: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
  workspaces?: {
    name: string;
  };
}

export function NotebooksTab() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const fetchNotebooks = async () => {
    const { data } = await supabase
      .from('notebooks')
      .select(`
        *,
        workspaces (name)
      `)
      .order('updated_at', { ascending: false });

    if (data) {
      setNotebooks(data as any);
    }
    setLoading(false);
  };

  const handleCreateNotebook = async (data: {
    name: string;
    workspace_id: string;
    language: 'python' | 'sql' | 'scala' | 'r';
    cluster_id: string | null;
  }) => {
    const { error } = await supabase
      .from('notebooks')
      .insert({
        ...data,
        content: { cells: [] },
      });

    if (error) {
      console.error('Error creating notebook:', error);
      throw error;
    }

    await fetchNotebooks();
  };

  const handleDeleteNotebook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notebook?')) return;

    const { error } = await supabase
      .from('notebooks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notebook:', error);
      return;
    }

    await fetchNotebooks();
  };

  const languageColors: Record<string, string> = {
    python: 'bg-blue-100 text-blue-700 border-blue-200',
    sql: 'bg-green-100 text-green-700 border-green-200',
    scala: 'bg-red-100 text-red-700 border-red-200',
    r: 'bg-purple-100 text-purple-700 border-purple-200',
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Notebooks</h1>
          <p className="text-gray-600 mt-2">Interactive data exploration and analysis</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow-lg shadow-green-500/30"
        >
          <Plus className="w-5 h-5" />
          <span>New Notebook</span>
        </button>
      </div>

      {notebooks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileCode className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notebooks Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your first notebook to start analyzing data interactively with Python, SQL, Scala, or R.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Notebook</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notebooks.map((notebook) => (
            <div
              key={notebook.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <FileCode className="w-5 h-5 text-white" />
                    </div>
                    <span className={`px-2 py-1 border rounded text-xs font-medium ${languageColors[notebook.language]}`}>
                      {notebook.language.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{notebook.name}</h3>
                  {notebook.workspaces && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <FolderOpen className="w-3 h-3" />
                      <span>{notebook.workspaces.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                <div>Created: {new Date(notebook.created_at).toLocaleDateString()}</div>
                <div>Modified: {new Date(notebook.updated_at).toLocaleDateString()}</div>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setSelectedNotebook(notebook.id)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition text-sm font-medium shadow-lg"
                >
                  <Play className="w-4 h-4" />
                  <span>Open</span>
                </button>
                <button
                  onClick={() => handleDeleteNotebook(notebook.id)}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
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
    </div>
  );
}
