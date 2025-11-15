import { useState, useEffect } from 'react';
import { Plus, Database, AlertCircle, CheckCircle, Trash2, ChevronRight } from 'lucide-react';
import AddDataSourceModal from './AddDataSourceModal';
import DataSourceDetailView from './DataSourceDetailView';

export default function DataSourcesTab() {
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
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

  const handleViewDataSource = (dataSource: any) => {
    setSelectedDataSource(dataSource);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedDataSource(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (viewMode === 'detail' && selectedDataSource) {
    return (
      <DataSourceDetailView
        dataSource={selectedDataSource}
        onBack={handleBackToList}
        onRefresh={fetchDataSources}
      />
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
        <div className="bg-white rounded-lg border border-gray-200">
          {dataSources.map((dataSource, idx) => (
            <div
              key={dataSource.id}
              className={`${idx !== 0 ? 'border-t border-gray-200' : ''}`}
            >
              <div className="p-6 hover:bg-gray-50 transition cursor-pointer">
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 flex items-start gap-4"
                    onClick={() => handleViewDataSource(dataSource)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Database className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{dataSource.name}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded uppercase">
                          {dataSource.type}
                        </span>
                        {dataSource.status === 'active' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {dataSource.description || dataSource.config?.filename || 'No description'}
                      </p>
                      {(dataSource.type === 'csv' || dataSource.type === 'excel') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDataSource(dataSource);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 border border-cyan-300 text-cyan-600 hover:bg-cyan-50 rounded-lg transition text-sm font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Add More Files
                        </button>
                      )}
                      {dataSource.last_tested && (
                        <p className="text-xs text-gray-400 mt-2">
                          Last tested: {new Date(dataSource.last_tested).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestDataSource(dataSource.id);
                      }}
                      className="px-3 py-1.5 text-sm text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                    >
                      Test
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDataSource(dataSource.id);
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
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

      {showAddModal && (
        <AddDataSourceModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddDataSource}
        />
      )}
    </div>
  );
}
