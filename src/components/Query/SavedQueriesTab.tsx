import { useState, useEffect } from 'react';
import { Search, Star, Trash2, Play, Copy, Calendar, Tag, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SavedQuery {
  id: string;
  name: string;
  description: string;
  query_text: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

interface SavedQueriesTabProps {
  onLoadQuery?: (query: string) => void;
}

export function SavedQueriesTab({ onLoadQuery }: SavedQueriesTabProps) {
  const [queries, setQueries] = useState<SavedQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_queries')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setQueries(data || []);
    } catch (err) {
      console.error('Error fetching queries:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (queryId: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('saved_queries')
        .update({ is_favorite: !currentFavorite, updated_at: new Date().toISOString() })
        .eq('id', queryId);

      if (error) throw error;

      setQueries(queries.map(q =>
        q.id === queryId ? { ...q, is_favorite: !currentFavorite } : q
      ));
    } catch (err: any) {
      alert('Error updating favorite: ' + err.message);
    }
  };

  const deleteQuery = async (queryId: string) => {
    if (!confirm('Are you sure you want to delete this query?')) return;

    try {
      const { error } = await supabase
        .from('saved_queries')
        .delete()
        .eq('id', queryId);

      if (error) throw error;

      setQueries(queries.filter(q => q.id !== queryId));
      alert('Query deleted successfully');
    } catch (err: any) {
      alert('Error deleting query: ' + err.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Query copied to clipboard!');
  };

  const allTags = Array.from(new Set(queries.flatMap(q => q.tags)));

  const filteredQueries = queries.filter(q => {
    if (showFavoritesOnly && !q.is_favorite) return false;
    if (filterTag && !q.tags.includes(filterTag)) return false;
    if (searchTerm && !q.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !q.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Saved Queries</h2>
        <p className="text-gray-600 mt-1">Your stored SQL queries</p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search queries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            showFavoritesOnly
              ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
              : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-yellow-500' : ''}`} />
          Favorites
        </button>

        {allTags.length > 0 && (
          <select
            value={filterTag || ''}
            onChange={(e) => setFilterTag(e.target.value || null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        )}
      </div>

      {filteredQueries.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {queries.length === 0 ? 'No saved queries yet' : 'No queries match your filters'}
          </h3>
          <p className="text-gray-600">
            {queries.length === 0
              ? 'Save queries from the Query Editor to access them here'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQueries.map(query => (
            <div key={query.id} className="bg-white rounded-lg border border-gray-200 hover:border-cyan-300 transition">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{query.name}</h3>
                      <button
                        onClick={() => toggleFavorite(query.id, query.is_favorite)}
                        className="text-gray-400 hover:text-yellow-500 transition"
                      >
                        <Star className={`w-5 h-5 ${query.is_favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      </button>
                    </div>
                    {query.description && (
                      <p className="text-sm text-gray-600 mb-3">{query.description}</p>
                    )}
                    {query.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag className="w-3 h-3 text-gray-400" />
                        {query.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {onLoadQuery && (
                      <button
                        onClick={() => onLoadQuery(query.query_text)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Load in editor"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => copyToClipboard(query.query_text)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Copy query"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteQuery(query.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete query"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <pre className="text-xs text-gray-700 overflow-auto max-h-32 font-mono whitespace-pre-wrap">
                    {query.query_text}
                  </pre>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Created {new Date(query.created_at).toLocaleDateString()}
                  </div>
                  {query.updated_at !== query.created_at && (
                    <div className="flex items-center gap-1">
                      Updated {new Date(query.updated_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
