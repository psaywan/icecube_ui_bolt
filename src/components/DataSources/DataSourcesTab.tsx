import { useState, useEffect } from 'react';
import { Plus, Database, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import DataSourceCard from './DataSourceCard';
import AddDataSourceModal from './AddDataSourceModal';

export default function DataSourcesTab() {
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDataSources();
  }, []);

  const fetchDataSources = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('data_sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDataSources(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDataSource = async (dataSource: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: insertedData, error } = await supabase
        .from('data_sources')
        .insert([
          {
            user_id: user.id,
            name: dataSource.name,
            type: dataSource.type,
            config: dataSource.config,
            status: 'active',
            description: dataSource.description,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (dataSource.metadata?.columns && insertedData) {
        const catalogEntries = dataSource.metadata.columns.map((col: any) => ({
          data_source_id: insertedData.id,
          database_name: 'default',
          table_name: dataSource.name.toLowerCase().replace(/\s+/g, '_'),
          column_name: col.name,
          data_type: col.type,
          is_nullable: true,
          column_order: col.order,
        }));

        const { error: catalogError } = await supabase
          .from('catalog_metadata')
          .insert(catalogEntries);

        if (catalogError) console.error('Error creating catalog:', catalogError);
      }

      await fetchDataSources();
      setShowAddModal(false);
    } catch (err: any) {
      alert('Error adding data source: ' + err.message);
    }
  };

  const handleDeleteDataSource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this data source?')) return;

    try {
      const { error } = await supabase.from('data_sources').delete().eq('id', id);
      if (error) throw error;
      await fetchDataSources();
    } catch (err: any) {
      alert('Error deleting data source: ' + err.message);
    }
  };

  const handleTestDataSource = async (id: string) => {
    try {
      const { error } = await supabase
        .from('data_sources')
        .update({ last_tested: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      alert('Connection test successful!');
      await fetchDataSources();
    } catch (err: any) {
      alert('Connection test failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Sources</h2>
          <p className="text-gray-600 mt-1">Manage your data source connections</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-600 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Add Data Source</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {dataSources.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No data sources yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first data source connection
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-600 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Data Source</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataSources.map((dataSource) => (
            <DataSourceCard
              key={dataSource.id}
              dataSource={dataSource}
              onDelete={handleDeleteDataSource}
              onTest={handleTestDataSource}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddDataSourceModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddDataSource}
        />
      )}
    </div>
  );
}
