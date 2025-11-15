import { Database, Cog, Target, Cloud, FileText, Code, Filter, GitMerge, Zap } from 'lucide-react';
import { CloudIcon } from '../Common/CloudIcon';

interface NodePaletteProps {
  onAddNode: (type: string, data: any) => void;
}

export default function NodePalette({ onAddNode }: NodePaletteProps) {
  const sources = [
    { id: 'postgresql', label: 'PostgreSQL', icon: Database, color: 'bg-blue-50 border-blue-200' },
    { id: 'mysql', label: 'MySQL', icon: Database, color: 'bg-orange-50 border-orange-200' },
    { id: 's3', label: 'AWS S3', icon: Cloud, color: 'bg-yellow-50 border-yellow-200' },
    { id: 'gcs', label: 'Google Cloud Storage', icon: Cloud, color: 'bg-green-50 border-green-200' },
    { id: 'azure-blob', label: 'Azure Blob', icon: Cloud, color: 'bg-cyan-50 border-cyan-200' },
    { id: 'mongodb', label: 'MongoDB', icon: Database, color: 'bg-green-50 border-green-200' },
    { id: 'api', label: 'REST API', icon: Zap, color: 'bg-purple-50 border-purple-200' },
    { id: 'csv', label: 'CSV File', icon: FileText, color: 'bg-gray-50 border-gray-200' },
  ];

  const transforms = [
    { id: 'filter', label: 'Filter Rows', icon: Filter, description: 'Filter data by conditions' },
    { id: 'map', label: 'Transform Columns', icon: Code, description: 'Map and transform columns' },
    { id: 'join', label: 'Join Data', icon: GitMerge, description: 'Join multiple data sources' },
    { id: 'aggregate', label: 'Aggregate', icon: Cog, description: 'Group and aggregate data' },
    { id: 'dedupe', label: 'Deduplicate', icon: Filter, description: 'Remove duplicate rows' },
    { id: 'validate', label: 'Validate', icon: Cog, description: 'Data quality validation' },
  ];

  const targets = [
    { id: 'snowflake', label: 'Snowflake', color: 'bg-blue-50 border-blue-200' },
    { id: 'redshift', label: 'Redshift', color: 'bg-red-50 border-red-200' },
    { id: 'bigquery', label: 'BigQuery', color: 'bg-blue-50 border-blue-200' },
    { id: 'delta-lake', label: 'Delta Lake', color: 'bg-orange-50 border-orange-200' },
    { id: 'postgresql', label: 'PostgreSQL', color: 'bg-blue-50 border-blue-200' },
    { id: 's3', label: 'AWS S3', color: 'bg-yellow-50 border-yellow-200' },
  ];

  const cloudServices = [
    { id: 'glue', label: 'AWS Glue', provider: 'aws', description: 'Serverless ETL' },
    { id: 'data-factory', label: 'Azure Data Factory', provider: 'azure', description: 'Cloud ETL service' },
    { id: 'dataflow', label: 'Google Dataflow', provider: 'gcp', description: 'Stream & batch processing' },
    { id: 'emr', label: 'AWS EMR', provider: 'aws', description: 'Managed Spark/Hadoop' },
    { id: 'databricks', label: 'Databricks', provider: 'databricks', description: 'Unified analytics' },
    { id: 'airflow', label: 'Apache Airflow', provider: 'aws', description: 'Workflow orchestration' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 max-w-xs max-h-[600px] overflow-y-auto">
      <h3 className="text-sm font-bold text-gray-900 mb-3">Data Sources</h3>
      <div className="space-y-2 mb-4">
        {sources.map((source) => {
          const Icon = source.icon;
          return (
            <button
              key={source.id}
              onClick={() =>
                onAddNode('source', {
                  label: source.label,
                  sourceType: source.id,
                  config: {},
                })
              }
              className={`w-full p-2 border rounded-lg hover:shadow-md transition text-left flex items-center space-x-2 ${source.color}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{source.label}</span>
            </button>
          );
        })}
      </div>

      <h3 className="text-sm font-bold text-gray-900 mb-3 mt-4">Transformations</h3>
      <div className="space-y-2 mb-4">
        {transforms.map((transform) => {
          const Icon = transform.icon;
          return (
            <button
              key={transform.id}
              onClick={() =>
                onAddNode('transform', {
                  label: transform.label,
                  transformType: transform.id,
                  description: transform.description,
                  config: {},
                })
              }
              className="w-full p-2 border border-purple-200 bg-purple-50 rounded-lg hover:shadow-md transition text-left"
            >
              <div className="flex items-center space-x-2 mb-1">
                <Icon className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-gray-900">{transform.label}</span>
              </div>
              <p className="text-[10px] text-gray-600">{transform.description}</p>
            </button>
          );
        })}
      </div>

      <h3 className="text-sm font-bold text-gray-900 mb-3 mt-4">Data Targets</h3>
      <div className="space-y-2 mb-4">
        {targets.map((target) => (
          <button
            key={target.id}
            onClick={() =>
              onAddNode('target', {
                label: target.label,
                targetType: target.id,
                config: {},
              })
            }
            className={`w-full p-2 border rounded-lg hover:shadow-md transition text-left flex items-center space-x-2 ${target.color}`}
          >
            <Target className="w-4 h-4" />
            <span className="text-xs font-medium">{target.label}</span>
          </button>
        ))}
      </div>

      <h3 className="text-sm font-bold text-gray-900 mb-3 mt-4">Cloud Services</h3>
      <div className="space-y-2">
        {cloudServices.map((service) => (
          <button
            key={service.id}
            onClick={() =>
              onAddNode('cloudService', {
                label: service.label,
                serviceType: service.id,
                provider: service.provider,
                description: service.description,
                config: {},
              })
            }
            className="w-full p-2 border border-green-200 bg-green-50 rounded-lg hover:shadow-md transition text-left"
          >
            <div className="flex items-center space-x-2 mb-1">
              <Cloud className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-gray-900">{service.label}</span>
            </div>
            <p className="text-[10px] text-gray-600">{service.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
