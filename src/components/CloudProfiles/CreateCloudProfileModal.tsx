import { useState } from 'react';
import { X, Cloud, ExternalLink } from 'lucide-react';

interface CreateCloudProfileModalProps {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    cloud_provider: 'aws' | 'azure' | 'gcp';
    region: string;
    credentials: Record<string, string>;
  }) => Promise<void>;
  onAWSSetup?: () => void;
}

const regions = {
  aws: [
    'us-east-1',
    'us-west-2',
    'eu-west-1',
    'eu-central-1',
    'ap-southeast-1',
    'ap-northeast-1',
  ],
  azure: [
    'eastus',
    'westus2',
    'northeurope',
    'westeurope',
    'southeastasia',
    'japaneast',
  ],
  gcp: [
    'us-central1',
    'us-east1',
    'europe-west1',
    'europe-west4',
    'asia-southeast1',
    'asia-northeast1',
  ],
};

const cloudFormationTemplates = {
  aws: 'https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?templateURL=https://icecube-templates.s3.amazonaws.com/iam-role.yaml',
  azure: 'https://portal.azure.com/#create/Microsoft.Template',
  gcp: 'https://console.cloud.google.com/dm/deployments',
};

export function CreateCloudProfileModal({ onClose, onSubmit, onAWSSetup }: CreateCloudProfileModalProps) {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<'aws' | 'azure' | 'gcp'>('aws');
  const [region, setRegion] = useState(regions.aws[0]);
  const [credentials, setCredentials] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    roleArn: '',
  });
  const [loading, setLoading] = useState(false);

  const handleProviderChange = (newProvider: 'aws' | 'azure' | 'gcp') => {
    setProvider(newProvider);
    setRegion(regions[newProvider][0]);
    setCredentials({
      accessKeyId: '',
      secretAccessKey: '',
      roleArn: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name,
        cloud_provider: provider,
        region,
        credentials,
      });
      onClose();
    } catch (error) {
      console.error('Error creating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCloudFormation = () => {
    window.open(cloudFormationTemplates[provider], '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create Cloud Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Production AWS Account"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Cloud Provider
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(['aws', 'azure', 'gcp'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleProviderChange(p)}
                  className={`p-4 border-2 rounded-lg transition ${
                    provider === p
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Cloud className={`w-8 h-8 mx-auto mb-2 ${
                    provider === p ? 'text-cyan-600' : 'text-gray-400'
                  }`} />
                  <div className="text-sm font-medium text-gray-900">
                    {p === 'aws' ? 'AWS' : p === 'azure' ? 'Azure' : 'GCP'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {regions[provider].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {provider === 'aws' && onAWSSetup ? (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg p-6">
              <h3 className="font-semibold text-orange-900 mb-2 text-lg">🚀 Recommended: AWS CloudFormation Setup</h3>
              <p className="text-sm text-orange-800 mb-4">
                Use our guided setup wizard to configure AWS with CloudFormation. This provides enterprise-grade security
                with IAM roles and custom domain support for easy resource identification.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAWSSetup();
                }}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition font-semibold shadow-lg"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Start AWS Setup Wizard</span>
              </button>
              <p className="text-xs text-orange-700 mt-3 text-center">
                Or continue below to manually enter AWS credentials
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Setup Cloud IAM Stack</h3>
              <p className="text-sm text-blue-700 mb-3">
                Click the button below to create an IAM role in your {provider.toUpperCase()} account.
                This will redirect you to your cloud provider's console.
              </p>
              <button
                type="button"
                onClick={openCloudFormation}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open {provider.toUpperCase()} Console</span>
              </button>
            </div>
          )}

          {provider === 'aws' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Key ID
                </label>
                <input
                  type="text"
                  value={credentials.accessKeyId}
                  onChange={(e) => setCredentials({ ...credentials, accessKeyId: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Access Key
                </label>
                <input
                  type="password"
                  value={credentials.secretAccessKey}
                  onChange={(e) => setCredentials({ ...credentials, secretAccessKey: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role ARN (Optional)
                </label>
                <input
                  type="text"
                  value={credentials.roleArn}
                  onChange={(e) => setCredentials({ ...credentials, roleArn: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="arn:aws:iam::123456789012:role/IcecubeRole"
                />
              </div>
            </>
          )}

          {provider === 'azure' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant ID
                </label>
                <input
                  type="text"
                  value={credentials.accessKeyId}
                  onChange={(e) => setCredentials({ ...credentials, accessKeyId: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  value={credentials.secretAccessKey}
                  onChange={(e) => setCredentials({ ...credentials, secretAccessKey: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={credentials.roleArn}
                  onChange={(e) => setCredentials({ ...credentials, roleArn: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </>
          )}

          {provider === 'gcp' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Account Key (JSON)
              </label>
              <textarea
                value={credentials.accessKeyId}
                onChange={(e) => setCredentials({ ...credentials, accessKeyId: e.target.value })}
                required
                rows={6}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                placeholder='{"type": "service_account", "project_id": "..."}'
              />
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
