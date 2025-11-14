import { useState, useEffect } from 'react';
import { Plus, Loader2, Layers, Trash2, FolderOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Database } from '../../lib/supabase';

type Workspace = Database['public']['Tables']['workspaces']['Row'];

export function WorkspacesTab() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWorkspaces(data);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase
      .from('workspaces')
      .insert({ user_id: user.id, name, description });

    if (!error) {
      setShowModal(false);
      setName('');
      setDescription('');
      fetchWorkspaces();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workspace?')) return;
    await supabase.from('workspaces').delete().eq('id', id);
    fetchWorkspaces();
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
          <h1 className="text-3xl font-bold text-gray-900">Workspaces</h1>
          <p className="text-gray-600 mt-2">Organize your data projects</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition shadow-lg shadow-cyan-500/30"
        >
          <Plus className="w-5 h-5" />
          <span>New Workspace</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={() => handleDelete(workspace.id)}
                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{workspace.name}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{workspace.description || 'No description'}</p>
            <button className="flex items-center space-x-2 text-cyan-600 hover:text-cyan-700 font-medium text-sm">
              <FolderOpen className="w-4 h-4" />
              <span>Open Workspace</span>
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Workspace</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
