import { useState } from 'react';
import { X } from 'lucide-react';
import S3Form from './Forms/S3Form';
import AzureBlobForm from './Forms/AzureBlobForm';
import GCSForm from './Forms/GCSForm';
import AthenaForm from './Forms/AthenaForm';
import HDFSForm from './Forms/HDFSForm';
import SAPHanaForm from './Forms/SAPHanaForm';
import MySQLForm from './Forms/MySQLForm';
import PostgreSQLForm from './Forms/PostgreSQLForm';
import MongoDBForm from './Forms/MongoDBForm';
import SnowflakeForm from './Forms/SnowflakeForm';
import RedshiftForm from './Forms/RedshiftForm';
import BigQueryForm from './Forms/BigQueryForm';
import CSVUploadForm from './Forms/CSVUploadForm';
import ExcelUploadForm from './Forms/ExcelUploadForm';

interface AddDataSourceModalProps {
  onClose: () => void;
  onAdd: (dataSource: any) => void;
}

const DATA_SOURCE_TYPES = [
  { id: 'csv', name: 'CSV File', icon: '📄', category: 'File Upload' },
  { id: 'excel', name: 'Excel File', icon: '📊', category: 'File Upload' },
  { id: 's3', name: 'Amazon S3', icon: '🪣', category: 'Object Storage' },
  { id: 'azure_blob', name: 'Azure Blob Storage', icon: '☁️', category: 'Object Storage' },
  { id: 'gcs', name: 'Google Cloud Storage', icon: '🌐', category: 'Object Storage' },
  { id: 'athena', name: 'Amazon Athena', icon: '🔍', category: 'Query Engine' },
  { id: 'hdfs', name: 'Hadoop HDFS', icon: '🗄️', category: 'Distributed Storage' },
  { id: 'sap_hana', name: 'SAP HANA', icon: '💼', category: 'Enterprise Database' },
  { id: 'mysql', name: 'MySQL', icon: '🐬', category: 'Relational Database' },
  { id: 'postgresql', name: 'PostgreSQL', icon: '🐘', category: 'Relational Database' },
  { id: 'mongodb', name: 'MongoDB', icon: '🍃', category: 'NoSQL Database' },
  { id: 'snowflake', name: 'Snowflake', icon: '❄️', category: 'Data Warehouse' },
  { id: 'redshift', name: 'Amazon Redshift', icon: '🔴', category: 'Data Warehouse' },
  { id: 'bigquery', name: 'Google BigQuery', icon: '📊', category: 'Data Warehouse' },
];

export default function AddDataSourceModal({ onClose, onAdd }: AddDataSourceModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const renderForm = () => {
    switch (selectedType) {
      case 'csv':
        return <CSVUploadForm onSubmit={onAdd} onCancel={() => setSelectedType(null)} />;
      case 'excel':
        return <ExcelUploadForm onSubmit={onAdd} onCancel={() => setSelectedType(null)} />;
      case 's3':
        return <S3Form onSubmit={onAdd} onCancel={() => setSelectedType(null)} />;
      case 'azure_blob':
        return <AzureBlobForm onSubmit={onAdd} onCancel={() => setSelectedType(null)} />;
      case 'gcs':
        return <GCSForm onSubmit={onAdd} onCancel={() => setSelectedType(null)} />;
      case 'athena':
        return <AthenaForm onSubmit={onAdd} onCancel={() => setSelectedType(null)} />;
      case 'hdfs':
        return <HDFSForm onSubmit={onAdd} onCancel={() => setSelectedType(null)} />;
      case 'sap_hana':
        return <SAPHanaForm onSubmit={onAdd} onCancel={() => setSelectedType(null)} />;
      case 'mysql':
        return <MySQLForm onSubmit={onAdd} onCancel={() => setSelectedType(null)} />;
      case 'postgresql':
        return <PostgreSQLForm onSubmit={onAdd} onCancel={() => setSelectedType(null)} />;
      case 'mongodb':
        return <MongoDBForm onSubmit={onAdd} onCancel={() => setSelectedType(null)} />;
      case 'snowflake':
        return <SnowflakeForm onSubmit={onAdd} onCancel={() => setSelectedType(null)} />;
      case 'redshift':
        return <RedshiftForm onSubmit={onAdd} onCancel={() => setSelectedType(null)} />;
      case 'bigquery':
        return <BigQueryForm onSubmit={onAdd} onCancel={() => setSelectedType(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedType ? 'Configure Data Source' : 'Add Data Source'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {!selectedType ? (
            <div className="p-6">
              <p className="text-gray-600 mb-6">Select a data source type to configure</p>

              {['File Upload', 'Object Storage', 'Query Engine', 'Distributed Storage', 'Enterprise Database', 'Relational Database', 'NoSQL Database', 'Data Warehouse'].map((category) => {
                const sources = DATA_SOURCE_TYPES.filter(s => s.category === category);
                if (sources.length === 0) return null;

                return (
                  <div key={category} className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">{category}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {sources.map((source) => (
                        <button
                          key={source.id}
                          onClick={() => setSelectedType(source.id)}
                          className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-cyan-400 hover:bg-cyan-50 transition text-left"
                        >
                          <span className="text-3xl">{source.icon}</span>
                          <span className="font-medium text-gray-900">{source.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6">
              {renderForm()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
