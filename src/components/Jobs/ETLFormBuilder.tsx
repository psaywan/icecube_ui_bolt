import { useState } from 'react';
import { Plus, Trash2, Database, Cog, Target, Cloud, ChevronDown, ChevronUp } from 'lucide-react';

interface ETLFormBuilderProps {
  formData: {
    sources: any[];
    targets: any[];
    transformations: any[];
    cloudServices: any[];
  };
  onChange: (data: any) => void;
  onSave: () => void;
}

export default function ETLFormBuilder({ formData, onChange, onSave }: ETLFormBuilderProps) {
  const [expandedSections, setExpandedSections] = useState({
    sources: true,
    transforms: true,
    targets: true,
    cloudServices: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section as keyof typeof prev] }));
  };

  const addSource = () => {
    onChange({
      ...formData,
      sources: [
        ...formData.sources,
        { type: 'postgresql', label: 'New Source', config: {} },
      ],
    });
  };

  const addTarget = () => {
    onChange({
      ...formData,
      targets: [
        ...formData.targets,
        { type: 'snowflake', label: 'New Target', config: {} },
      ],
    });
  };

  const addTransformation = () => {
    onChange({
      ...formData,
      transformations: [
        ...formData.transformations,
        { type: 'filter', label: 'New Transformation', config: {} },
      ],
    });
  };

  const addCloudService = () => {
    onChange({
      ...formData,
      cloudServices: [
        ...formData.cloudServices,
        { type: 'glue', label: 'AWS Glue', config: {} },
      ],
    });
  };

  const removeItem = (type: string, index: number) => {
    onChange({
      ...formData,
      [type]: formData[type as keyof typeof formData].filter((_, i) => i !== index),
    });
  };

  const updateItem = (type: string, index: number, field: string, value: any) => {
    const updated = [...formData[type as keyof typeof formData]];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...formData, [type]: updated });
  };

  const sourceTypes = [
    'PostgreSQL', 'MySQL', 'MongoDB', 'AWS S3', 'Google Cloud Storage',
    'Azure Blob', 'Snowflake', 'Redshift', 'BigQuery', 'REST API', 'CSV File'
  ];

  const targetTypes = [
    'Snowflake', 'Redshift', 'BigQuery', 'Delta Lake', 'PostgreSQL',
    'AWS S3', 'Google Cloud Storage', 'Azure Blob', 'MongoDB'
  ];

  const transformTypes = [
    'Filter Rows', 'Transform Columns', 'Join Data', 'Aggregate',
    'Deduplicate', 'Validate', 'Sort', 'Union', 'Pivot'
  ];

  const cloudServiceTypes = [
    { value: 'glue', label: 'AWS Glue' },
    { value: 'data-factory', label: 'Azure Data Factory' },
    { value: 'dataflow', label: 'Google Dataflow' },
    { value: 'emr', label: 'AWS EMR' },
    { value: 'databricks', label: 'Databricks' },
    { value: 'airflow', label: 'Apache Airflow' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('sources')}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-cyan-600" />
            <h3 className="text-lg font-bold text-gray-900">Data Sources ({formData.sources.length})</h3>
          </div>
          {expandedSections.sources ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.sources && (
          <div className="mt-4 space-y-4">
            {formData.sources.map((source, index) => (
              <div key={index} className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Source #{index + 1}</h4>
                  <button
                    onClick={() => removeItem('sources', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Source Type</label>
                    <select
                      value={source.type}
                      onChange={(e) => updateItem('sources', index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {sourceTypes.map(type => (
                        <option key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                    <input
                      type="text"
                      value={source.label}
                      onChange={(e) => updateItem('sources', index, 'label', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addSource}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-cyan-300 rounded-lg text-cyan-600 hover:bg-cyan-50 transition"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Data Source</span>
            </button>
          </div>
        )}
      </div>

      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('transforms')}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-3">
            <Cog className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Transformations ({formData.transformations.length})</h3>
          </div>
          {expandedSections.transforms ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.transforms && (
          <div className="mt-4 space-y-4">
            {formData.transformations.map((transform, index) => (
              <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Transform #{index + 1}</h4>
                  <button
                    onClick={() => removeItem('transformations', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Transform Type</label>
                    <select
                      value={transform.type}
                      onChange={(e) => updateItem('transformations', index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {transformTypes.map(type => (
                        <option key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                    <input
                      type="text"
                      value={transform.label}
                      onChange={(e) => updateItem('transformations', index, 'label', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addTransformation}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 transition"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Transformation</span>
            </button>
          </div>
        )}
      </div>

      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('targets')}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Data Targets ({formData.targets.length})</h3>
          </div>
          {expandedSections.targets ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.targets && (
          <div className="mt-4 space-y-4">
            {formData.targets.map((target, index) => (
              <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Target #{index + 1}</h4>
                  <button
                    onClick={() => removeItem('targets', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Target Type</label>
                    <select
                      value={target.type}
                      onChange={(e) => updateItem('targets', index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {targetTypes.map(type => (
                        <option key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                    <input
                      type="text"
                      value={target.label}
                      onChange={(e) => updateItem('targets', index, 'label', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addTarget}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:bg-green-50 transition"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Data Target</span>
            </button>
          </div>
        )}
      </div>

      <div className="pb-4">
        <button
          onClick={() => toggleSection('cloudServices')}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-3">
            <Cloud className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-bold text-gray-900">Cloud Services ({formData.cloudServices.length})</h3>
          </div>
          {expandedSections.cloudServices ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.cloudServices && (
          <div className="mt-4 space-y-4">
            {formData.cloudServices.map((service, index) => (
              <div key={index} className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Service #{index + 1}</h4>
                  <button
                    onClick={() => removeItem('cloudServices', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Service Type</label>
                    <select
                      value={service.type}
                      onChange={(e) => updateItem('cloudServices', index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {cloudServiceTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                    <input
                      type="text"
                      value={service.label}
                      onChange={(e) => updateItem('cloudServices', index, 'label', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addCloudService}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-orange-300 rounded-lg text-orange-600 hover:bg-orange-50 transition"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Cloud Service</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
