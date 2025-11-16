import { useState, useEffect } from 'react';
import { RefreshCw, Play, Pause, Table, BarChart3, Eye } from 'lucide-react';

interface DataSample {
  rows: any[];
  columns: string[];
  rowCount: number;
  stats: {
    [key: string]: {
      min?: number;
      max?: number;
      mean?: number;
      nullCount?: number;
      uniqueCount?: number;
      dtype?: string;
    };
  };
}

interface LiveDataPreviewProps {
  blockId: string;
  blockCode: string;
  isRunning?: boolean;
}

export default function LiveDataPreview({ blockId, blockCode, isRunning = false }: LiveDataPreviewProps) {
  const [dataSample, setDataSample] = useState<DataSample | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'stats'>('table');
  const [sampleSize, setSampleSize] = useState(100);

  const fetchPreview = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockData: DataSample = {
      columns: ['id', 'name', 'email', 'age', 'created_at', 'status'],
      rows: Array.from({ length: sampleSize }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        age: Math.floor(Math.random() * 50) + 20,
        created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)]
      })),
      rowCount: 1000000,
      stats: {
        id: { min: 1, max: 1000000, mean: 500000, dtype: 'int64', nullCount: 0, uniqueCount: 1000000 },
        name: { dtype: 'object', nullCount: 0, uniqueCount: 987654 },
        email: { dtype: 'object', nullCount: 12, uniqueCount: 999988 },
        age: { min: 20, max: 70, mean: 45.3, dtype: 'int64', nullCount: 5, uniqueCount: 51 },
        created_at: { dtype: 'datetime64', nullCount: 0, uniqueCount: 1000000 },
        status: { dtype: 'object', nullCount: 150, uniqueCount: 3 }
      }
    };

    setDataSample(mockData);
    setLoading(false);
  };

  useEffect(() => {
    fetchPreview();
  }, [blockId, blockCode]);

  useEffect(() => {
    if (autoRefresh && isRunning) {
      const interval = setInterval(() => {
        fetchPreview();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isRunning]);

  const renderTable = () => {
    if (!dataSample) return null;

    return (
      <div className="overflow-auto max-h-96">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0">
            <tr>
              {dataSample.columns.map(col => (
                <th key={col} className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700">
                  {col}
                  <div className="text-xs text-gray-500 dark:text-slate-500 font-normal">
                    {dataSample.stats[col]?.dtype}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataSample.rows.slice(0, 20).map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                {dataSample.columns.map(col => (
                  <td key={col} className="px-4 py-2 border-b border-gray-100 dark:border-slate-800 text-gray-900 dark:text-slate-200">
                    {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? 'null')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderStats = () => {
    if (!dataSample) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {dataSample.columns.map(col => {
          const stats = dataSample.stats[col];
          return (
            <div key={col} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{col}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Type:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{stats?.dtype}</span>
                </div>
                {stats?.min !== undefined && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Min:</span>
                      <span className="font-mono text-gray-900 dark:text-white">{stats.min}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Max:</span>
                      <span className="font-mono text-gray-900 dark:text-white">{stats.max}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Mean:</span>
                      <span className="font-mono text-gray-900 dark:text-white">{stats.mean?.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Null Count:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{stats?.nullCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Unique:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{stats?.uniqueCount?.toLocaleString()}</span>
                </div>
                {stats?.nullCount !== undefined && dataSample.rowCount && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-slate-400">Completeness</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {((1 - stats.nullCount / dataSample.rowCount) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(1 - stats.nullCount / dataSample.rowCount) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Live Data Preview</h3>
              {dataSample && (
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  Showing {Math.min(sampleSize, dataSample.rowCount)} of {dataSample.rowCount.toLocaleString()} rows
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="px-3 py-1 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value={10}>10 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
              <option value={500}>500 rows</option>
            </select>

            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'stats' : 'table')}
              className="px-3 py-1 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300"
            >
              {viewMode === 'table' ? <BarChart3 className="w-4 h-4" /> : <Table className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 text-sm rounded-lg ${
                autoRefresh
                  ? 'bg-green-500 text-white'
                  : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
              }`}
            >
              {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={fetchPreview}
              disabled={loading}
              className="px-3 py-1 text-sm bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg disabled:opacity-50 flex items-center space-x-1"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        ) : (
          viewMode === 'table' ? renderTable() : renderStats()
        )}
      </div>
    </div>
  );
}
