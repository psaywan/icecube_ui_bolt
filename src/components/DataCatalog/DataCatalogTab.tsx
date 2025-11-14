import { useState, useEffect } from 'react';
import { Database, Table, Eye, Search, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CatalogEntry {
  id: string;
  name: string;
  catalog_type: 'database' | 'table' | 'view';
  schema_info: any;
  location: string | null;
}

export function DataCatalogTab() {
  const [entries, setEntries] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data } = await supabase
      .from('data_catalogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setEntries(data);
    setLoading(false);
  };

  const filteredEntries = entries.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Catalog</h1>
        <p className="text-gray-600">Browse and search your data assets</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search databases, tables, and views..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Catalog Entries</h3>
          <p className="text-gray-600">Connect your data sources to populate the catalog</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {entry.catalog_type === 'database' ? (
                        <Database className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Table className="w-5 h-5 text-green-600" />
                      )}
                      <span className="font-medium text-gray-900">{entry.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                      {entry.catalog_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {entry.location || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex items-center space-x-1 text-cyan-600 hover:text-cyan-700 font-medium text-sm">
                      <Eye className="w-4 h-4" />
                      <span>View Schema</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
