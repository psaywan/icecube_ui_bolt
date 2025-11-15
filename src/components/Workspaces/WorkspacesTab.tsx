import { useState, useEffect } from 'react';
import { Plus, Loader2, FolderOpen, Trash2, Edit2, Tag, Filter } from 'lucide-react';
import { rdsApi } from '../../lib/rdsApi';
import { useAuth } from '../../contexts/RDSAuthContext';

interface Workspace {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  icon: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

const DEFAULT_COLORS = [
  '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f59e0b', '#06b6d4', '#10b981', '#6b7280', '#f97316',
  '#8b5cf6', '#ec4899', '#06b6d4', '#a855f7', '#84cc16'
];

const DEFAULT_ICONS = [
  '📁', '🔧', '🚀', '📊', '🤖', '🔄', '📈', '🔬', '👥',
  '💼', '🎯', '⚡', '🌟', '💡', '🎨', '📱', '🖥️', '⚙️'
];

export function WorkspacesTab() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: [] as string[],
    icon: '📁',
    color: '#6b7280',
  });
  const [tagInput, setTagInput] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkspaces(data || []);
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('workspaces')
        .insert([{
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          tags: formData.tags,
          icon: formData.icon,
          color: formData.color,
        }]);

      if (error) throw error;

      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        category: '',
        tags: [],
        icon: '📁',
        color: '#6b7280',
      });
      setTagInput('');
      setCustomCategory('');
      setShowIconPicker(false);
      setShowColorPicker(false);
      fetchWorkspaces();
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workspace?')) return;
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchWorkspaces();
    } catch (error) {
      console.error('Failed to delete workspace:', error);
    }
  };

  const getUniqueCategories = () => {
    const categories = workspaces.map(w => w.category);
    return Array.from(new Set(categories)).filter(Boolean);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const filteredWorkspaces = selectedCategory
    ? workspaces.filter(w => w.category === selectedCategory)
    : workspaces;

  const uniqueCategories = getUniqueCategories();

  const categoryCounts = uniqueCategories.map(cat => ({
    name: cat,
    count: workspaces.filter(w => w.category === cat).length,
  }));

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
          <p className="text-gray-600 mt-2">Organize your data projects by category</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition shadow-lg shadow-cyan-500/30"
        >
          <Plus className="w-5 h-5" />
          <span>New Workspace</span>
        </button>
      </div>

      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
              <Filter className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${
                  selectedCategory === null
                    ? 'bg-cyan-50 text-cyan-700 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-sm">All Workspaces</span>
                <span className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded-full">{workspaces.length}</span>
              </button>
              {categoryCounts.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${
                    selectedCategory === cat.name
                      ? 'bg-cyan-50 text-cyan-700 font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="text-sm truncate">{cat.name}</span>
                  <span className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded-full ml-2">{cat.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {filteredWorkspaces.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No workspaces found</h3>
              <p className="text-gray-600 mb-6">
                {selectedCategory
                  ? `No workspaces in ${selectedCategory} category`
                  : 'Create your first workspace to get started'}
              </p>
              {!selectedCategory && (
                <button
                  onClick={() => setShowModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition"
                >
                  Create Workspace
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWorkspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-cyan-200"
                  style={{ borderLeftWidth: '4px', borderLeftColor: workspace.color }}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ backgroundColor: `${workspace.color}20` }}
                        >
                          {workspace.icon || '📁'}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{workspace.name}</h3>
                            <span
                              className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: `${workspace.color}20`,
                                color: workspace.color,
                              }}
                            >
                              {workspace.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {workspace.description || 'No description'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        {workspace.tags && workspace.tags.length > 0 && (
                          <div className="flex items-center gap-1 mr-2">
                            {workspace.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {workspace.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                                +{workspace.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <button
                          className="px-4 py-2 bg-cyan-50 text-cyan-600 hover:bg-cyan-100 rounded-lg font-medium text-sm transition flex items-center gap-2"
                        >
                          <FolderOpen className="w-4 h-4" />
                          Open
                        </button>

                        <button
                          onClick={() => handleDelete(workspace.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Workspace</h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="My Data Science Project"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Describe your workspace..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  placeholder="e.g., Data Science, Production, Development"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {uniqueCategories.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-2">Existing categories:</p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat })}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowIconPicker(!showIconPicker)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-2xl text-center hover:bg-gray-100 transition"
                    >
                      {formData.icon}
                    </button>
                    {showIconPicker && (
                      <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3 grid grid-cols-6 gap-2">
                        {DEFAULT_ICONS.map((icon, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, icon });
                              setShowIconPicker(false);
                            }}
                            className="text-2xl p-2 hover:bg-gray-100 rounded transition"
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: formData.color }}
                        />
                        <span className="text-sm font-mono">{formData.color}</span>
                      </div>
                    </button>
                    {showColorPicker && (
                      <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3 grid grid-cols-5 gap-2">
                        {DEFAULT_COLORS.map((color, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, color });
                              setShowColorPicker(false);
                            }}
                            className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tags (press Enter)"
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Add
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1 px-3 py-1 bg-cyan-100 text-cyan-700 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-cyan-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      name: '',
                      description: '',
                      category: '',
                      tags: [],
                      icon: '📁',
                      color: '#6b7280',
                    });
                    setTagInput('');
                    setShowIconPicker(false);
                    setShowColorPicker(false);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
