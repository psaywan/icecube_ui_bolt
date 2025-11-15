import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, FileText, Calendar, Database } from 'lucide-react';
import AddFileToSourceModal from './AddFileToSourceModal';

interface DataSourceDetailViewProps {
  dataSource: any;
  onBack: () => void;
  onRefresh: () => void;
}

interface FileMetadata {
  table_name: string;
  column_count: number;
  created_at: string;
}

export default function DataSourceDetailView({ dataSource, onBack, onRefresh }: DataSourceDetailViewProps) {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, [dataSource.id]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('catalog_metadata')
        .select('table_name, created_at')
        .eq('data_source_id', dataSource.id)
        .order('table_name');

      if (error) throw error;

      const fileMap = new Map<string, FileMetadata>();
      (data || []).forEach(row => {
        if (!fileMap.has(row.table_name)) {
          fileMap.set(row.table_name, {
            table_name: row.table_name,
            column_count: 1,
            created_at: row.created_at
          });
        } else {
          const existing = fileMap.get(row.table_name)!;
          existing.column_count++;
        }
      });

      setFiles(Array.from(fileMap.values()));
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFile = async (file: File, tableName: string) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        throw new Error('File is empty');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));

      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
        const row: any = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || null;
        });
        return row;
      });

      const inferType = (values: any[]): string => {
        const sample = values.filter(v => v !== null && v !== '').slice(0, 100);
        if (sample.length === 0) return 'varchar';

        const allNumbers = sample.every(v => !isNaN(Number(v)));
        if (allNumbers) {
          const allIntegers = sample.every(v => Number.isInteger(Number(v)));
          return allIntegers ? 'integer' : 'decimal';
        }

        const allDates = sample.every(v => !isNaN(Date.parse(v)));
        if (allDates) return 'date';

        return 'varchar';
      };

      const catalogEntries = headers.map((col, idx) => ({
        data_source_id: dataSource.id,
        database_name: 'default',
        table_name: tableName,
        column_name: col,
        data_type: inferType(rows.map(r => r[col])),
        is_nullable: true,
        column_order: idx + 1,
      }));

      const { error: catalogError } = await supabase
        .from('catalog_metadata')
        .insert(catalogEntries);

      if (catalogError) throw catalogError;

      alert(`File added successfully! Table: ${tableName}`);
      setShowAddFileModal(false);
      await fetchFiles();
      onRefresh();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to add file');
    }
  };

  const handleDeleteFile = async (tableName: string) => {
    if (!confirm(`Are you sure you want to delete table "${tableName}"?`)) return;

    try {
      const { error } = await supabase
        .from('catalog_metadata')
        .delete()
        .eq('data_source_id', dataSource.id)
        .eq('table_name', tableName);

      if (error) throw error;

      alert('File deleted successfully');
      await fetchFiles();
      onRefresh();
    } catch (err: any) {
      alert('Error deleting file: ' + err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Data Sources
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{dataSource.name}</h2>
            <p className="text-gray-600 mt-1">
              {dataSource.type.toUpperCase()} Data Source • {files.length} {files.length === 1 ? 'file' : 'files'}
            </p>
          </div>
          <button
            onClick={() => setShowAddFileModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-600 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add More Files</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No files yet</h3>
          <p className="text-gray-600 mb-6">
            Add your first file to this data source
          </p>
          <button
            onClick={() => setShowAddFileModal(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-600 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add File</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Table Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Columns
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Added On
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file.table_name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Database className="w-4 h-4 text-cyan-600 mr-2" />
                        <span className="font-medium text-gray-900">{file.table_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {file.column_count} columns
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(file.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDeleteFile(file.table_name)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddFileModal && (
        <AddFileToSourceModal
          dataSource={dataSource}
          onClose={() => setShowAddFileModal(false)}
          onAdd={handleAddFile}
        />
      )}
    </div>
  );
}
