import { useState, useEffect } from 'react';
import { X, Database, Key, Shield, List, Plus } from 'lucide-react';
import { getCurrentUser } from '../../lib/auth';

import { rdsApi } from '../../lib/rdsApi';
interface NodeConfigModalProps {
  node: any;
  onClose: () => void;
  onSave: (config: any) => void;
}

export default function NodeConfigModal({ node, onClose, onSave }: NodeConfigModalProps) {
  const [configMode, setConfigMode] = useState<'new' | 'existing'>('new');
  const [authMethod, setAuthMethod] = useState<'access-key' | 'role-arn' | 'existing'>('access-key');
  const [savedDataSources, setSavedDataSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [config, setConfig] = useState(node.data.config || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (configMode === 'existing') {
      fetchSavedDataSources();
    }
  }, [configMode, node.data.sourceType]);

  const fetchSavedDataSources = async () => {
    setLoading(true);
    try {
      const { user, error: authError } = await getCurrentUser();
      if (authError || !user) return;

      const data = await rdsApi.dataSources.getAll();
      const filtered = data.filter((ds: any) => ds.type === (node.data.sourceType || node.data.targetType));
      setSavedDataSources(filtered || []);
    } catch (error) {
      console.error('Error fetching data sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    let finalConfig = { ...config };

    if (configMode === 'existing' && selectedSource) {
      const source = savedDataSources.find(s => s.id === selectedSource);
      if (source) {
        finalConfig = {
          ...finalConfig,
          dataSourceId: source.id,
          dataSourceName: source.name,
          ...source.config,
        };
      }
    }

    onSave(finalConfig);
    onClose();
  };

  const renderS3Config = () => {
    if (authMethod === 'access-key') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">AWS Access Key ID</label>
            <input
              type="text"
              value={config.accessKeyId || ''}
              onChange={(e) => setConfig({ ...config, accessKeyId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="AKIAIOSFODNN7EXAMPLE"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">AWS Secret Access Key</label>
            <input
              type="password"
              value={config.secretAccessKey || ''}
              onChange={(e) => setConfig({ ...config, secretAccessKey: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">S3 Bucket Name</label>
            <input
              type="text"
              value={config.bucketName || ''}
              onChange={(e) => setConfig({ ...config, bucketName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="my-data-bucket"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
            <select
              value={config.region || 'us-east-1'}
              onChange={(e) => setConfig({ ...config, region: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">EU (Ireland)</option>
              <option value="ap-south-1">Asia Pacific (Mumbai)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Path/Prefix (Optional)</label>
            <input
              type="text"
              value={config.path || ''}
              onChange={(e) => setConfig({ ...config, path: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="data/raw/"
            />
          </div>
        </div>
      );
    } else if (authMethod === 'role-arn') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">IAM Role ARN</label>
            <input
              type="text"
              value={config.roleArn || ''}
              onChange={(e) => setConfig({ ...config, roleArn: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="arn:aws:iam::123456789012:role/MyRole"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">S3 Bucket Name</label>
            <input
              type="text"
              value={config.bucketName || ''}
              onChange={(e) => setConfig({ ...config, bucketName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="my-data-bucket"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
            <select
              value={config.region || 'us-east-1'}
              onChange={(e) => setConfig({ ...config, region: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">EU (Ireland)</option>
              <option value="ap-south-1">Asia Pacific (Mumbai)</option>
            </select>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderDatabaseConfig = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Host</label>
          <input
            type="text"
            value={config.host || ''}
            onChange={(e) => setConfig({ ...config, host: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="localhost or db.example.com"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Port</label>
            <input
              type="number"
              value={config.port || '5432'}
              onChange={(e) => setConfig({ ...config, port: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Database Name</label>
            <input
              type="text"
              value={config.database || ''}
              onChange={(e) => setConfig({ ...config, database: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="mydb"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <input
            type="text"
            value={config.username || ''}
            onChange={(e) => setConfig({ ...config, username: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={config.password || ''}
            onChange={(e) => setConfig({ ...config, password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Schema (Optional)</label>
          <input
            type="text"
            value={config.schema || ''}
            onChange={(e) => setConfig({ ...config, schema: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="public"
          />
        </div>
      </div>
    );
  };

  const renderExistingSourceSelector = () => {
    if (loading) {
      return <div className="text-center py-8">Loading saved data sources...</div>;
    }

    if (savedDataSources.length === 0) {
      return (
        <div className="text-center py-8">
          <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No saved data sources of this type</p>
          <button
            onClick={() => setConfigMode('new')}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Configuration</span>
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {savedDataSources.map((source) => (
          <button
            key={source.id}
            onClick={() => setSelectedSource(source.id)}
            className={`w-full p-4 border-2 rounded-lg text-left transition ${
              selectedSource === source.id
                ? 'border-cyan-500 bg-cyan-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{source.name}</h4>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                {source.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">{source.description || 'No description'}</p>
            {source.config && (
              <p className="text-xs text-gray-500 mt-2">
                {source.config.host || source.config.bucketName || 'Configured'}
              </p>
            )}
          </button>
        ))}
      </div>
    );
  };

  const isS3Type = node.data.sourceType === 's3' || node.data.targetType === 's3';
  const isDatabaseType = ['postgresql', 'mysql', 'mongodb'].includes(
    node.data.sourceType || node.data.targetType
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Configure {node.data.label}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {node.type === 'source' ? 'Data Source' : node.type === 'target' ? 'Data Target' : 'Transform'} Configuration
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center space-x-2 mb-6">
            <button
              onClick={() => setConfigMode('new')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                configMode === 'new'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>New Configuration</span>
            </button>
            <button
              onClick={() => setConfigMode('existing')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                configMode === 'existing'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Use Saved Source</span>
            </button>
          </div>

          {configMode === 'new' ? (
            <>
              {isS3Type && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Authentication Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setAuthMethod('access-key')}
                      className={`p-4 border-2 rounded-lg transition ${
                        authMethod === 'access-key'
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Key className="w-6 h-6 text-cyan-600 mb-2" />
                      <div className="text-sm font-semibold">Access Keys</div>
                      <div className="text-xs text-gray-600">Use AWS access keys</div>
                    </button>
                    <button
                      onClick={() => setAuthMethod('role-arn')}
                      className={`p-4 border-2 rounded-lg transition ${
                        authMethod === 'role-arn'
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Shield className="w-6 h-6 text-cyan-600 mb-2" />
                      <div className="text-sm font-semibold">IAM Role</div>
                      <div className="text-xs text-gray-600">Use IAM role ARN</div>
                    </button>
                  </div>
                </div>
              )}

              {isS3Type && renderS3Config()}
              {isDatabaseType && renderDatabaseConfig()}
            </>
          ) : (
            renderExistingSourceSelector()
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={configMode === 'existing' && !selectedSource}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
