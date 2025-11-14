import { Database, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface DataSourceCardProps {
  dataSource: {
    id: string;
    name: string;
    type: string;
    status: string;
    description?: string;
    last_tested?: string;
    created_at: string;
  };
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
}

const DATA_SOURCE_ICONS: Record<string, string> = {
  s3: '🪣',
  azure_blob: '☁️',
  gcs: '🌐',
  athena: '🔍',
  hdfs: '🗄️',
  sap_hana: '💼',
  mysql: '🐬',
  postgresql: '🐘',
  mongodb: '🍃',
  snowflake: '❄️',
  redshift: '🔴',
  bigquery: '📊',
};

const DATA_SOURCE_NAMES: Record<string, string> = {
  s3: 'Amazon S3',
  azure_blob: 'Azure Blob Storage',
  gcs: 'Google Cloud Storage',
  athena: 'Amazon Athena',
  hdfs: 'Hadoop HDFS',
  sap_hana: 'SAP HANA',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  mongodb: 'MongoDB',
  snowflake: 'Snowflake',
  redshift: 'Amazon Redshift',
  bigquery: 'Google BigQuery',
};

export default function DataSourceCard({ dataSource, onDelete, onTest }: DataSourceCardProps) {
  const getStatusIcon = () => {
    switch (dataSource.status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (dataSource.status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg flex items-center justify-center text-2xl">
            {DATA_SOURCE_ICONS[dataSource.type] || <Database className="w-6 h-6 text-cyan-600" />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{dataSource.name}</h3>
            <p className="text-sm text-gray-500">{DATA_SOURCE_NAMES[dataSource.type] || dataSource.type}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
        </div>
      </div>

      {dataSource.description && (
        <p className="text-sm text-gray-600 mb-4">{dataSource.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
          {dataSource.status}
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onTest(dataSource.id)}
            className="px-3 py-1.5 text-sm text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
          >
            Test
          </button>
          <button
            onClick={() => onDelete(dataSource.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {dataSource.last_tested && (
        <p className="text-xs text-gray-400 mt-3">
          Last tested: {new Date(dataSource.last_tested).toLocaleString()}
        </p>
      )}
    </div>
  );
}
