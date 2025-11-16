import { useState, useEffect } from 'react';
import { X, Cloud, AlertCircle, ChevronDown, Settings } from 'lucide-react';
import { CloudIcon } from '../Common/CloudIcon';
import { rdsApi } from '../../lib/rdsApi';

interface CloudProfile {
  id: string;
  name: string;
  provider: 'aws' | 'azure' | 'gcp';
  region: string;
}

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Provider = 'aws' | 'azure' | 'gcp';

export function CreateWorkspaceModal({ isOpen, onClose, onSuccess }: CreateWorkspaceModalProps) {
  const [step, setStep] = useState<'select-method' | 'config'>('select-method');
  const [cloudProfiles, setCloudProfiles] = useState<CloudProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<CloudProfile | null>(null);
  const [manualProvider, setManualProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: [] as string[],
    icon: '🚀',
    color: '#3b82f6',
  });

  const [awsConfig, setAwsConfig] = useState({
    crossAccountRoleArn: '',
    region: 'us-east-1',
    vpcCidr: '10.0.0.0/16',
    rootS3Bucket: '',
  });

  const [azureConfig, setAzureConfig] = useState({
    subscriptionId: '',
    resourceGroup: '',
    region: 'eastus',
    vnetCidr: '10.0.0.0/16',
    storageAccountName: '',
  });

  const [gcpConfig, setGcpConfig] = useState({
    projectId: '',
    region: 'us-central1',
    network: '',
    subnetCidr: '10.0.0.0/16',
    gcsBucket: '',
    serviceAccountEmail: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchCloudProfiles();
    }
  }, [isOpen]);

  const fetchCloudProfiles = async () => {
    try {
      const profiles = await rdsApi.cloudProfiles.getAll();
      setCloudProfiles(profiles);
    } catch (err) {
      console.error('Failed to fetch cloud profiles:', err);
    }
  };

  if (!isOpen) return null;

  const handleProfileSelect = (profile: CloudProfile) => {
    setSelectedProfile(profile);
    setManualProvider(null);
    setStep('config');
  };

  const handleManualProviderSelect = (provider: Provider) => {
    setManualProvider(provider);
    setSelectedProfile(null);
    setStep('config');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const provider = selectedProfile?.provider || manualProvider;
      if (!provider) {
        throw new Error('Please select a provider');
      }

      let config = {};
      if (provider === 'aws') {
        if (!awsConfig.crossAccountRoleArn) {
          throw new Error('AWS Role ARN is required');
        }
        config = awsConfig;
      } else if (provider === 'azure') {
        if (!azureConfig.subscriptionId || !azureConfig.resourceGroup) {
          throw new Error('Azure Subscription ID and Resource Group are required');
        }
        config = azureConfig;
      } else if (provider === 'gcp') {
        if (!gcpConfig.projectId) {
          throw new Error('GCP Project ID is required');
        }
        config = gcpConfig;
      }

      await rdsApi.workspaces.create({
        ...formData,
        cloud_profile_id: selectedProfile?.id || null,
        provider,
        config,
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('select-method');
    setSelectedProfile(null);
    setManualProvider(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      tags: [],
      icon: '🚀',
      color: '#3b82f6',
    });
    setAwsConfig({
      crossAccountRoleArn: '',
      region: 'us-east-1',
      vpcCidr: '10.0.0.0/16',
      rootS3Bucket: '',
    });
    setAzureConfig({
      subscriptionId: '',
      resourceGroup: '',
      region: 'eastus',
      vnetCidr: '10.0.0.0/16',
      storageAccountName: '',
    });
    setGcpConfig({
      projectId: '',
      region: 'us-central1',
      network: '',
      subnetCidr: '10.0.0.0/16',
      gcsBucket: '',
      serviceAccountEmail: '',
    });
  };

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Choose Setup Method
        </h3>
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
          Use a saved cloud profile or manually configure credentials
        </p>

        {cloudProfiles.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
              Use Existing Cloud Profile
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {cloudProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleProfileSelect(profile)}
                  className="flex items-center space-x-4 p-4 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-lg hover:border-cyan-500 dark:hover:border-cyan-400 transition group"
                >
                  <CloudIcon provider={profile.provider} size="lg" />
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{profile.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      {profile.provider.toUpperCase()} • {profile.region}
                    </p>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90 group-hover:text-cyan-600" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400">
              Or configure manually
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
            Manual Configuration
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => handleManualProviderSelect('aws')}
              className="flex items-center space-x-4 p-4 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-lg hover:border-cyan-500 dark:hover:border-cyan-400 transition group"
            >
              <CloudIcon provider="aws" size="lg" />
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-900 dark:text-white">Amazon Web Services</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Configure with IAM Role ARN
                </p>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90 group-hover:text-cyan-600" />
            </button>

            <button
              onClick={() => handleManualProviderSelect('azure')}
              className="flex items-center space-x-4 p-4 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-lg hover:border-cyan-500 dark:hover:border-cyan-400 transition group"
            >
              <CloudIcon provider="azure" size="lg" />
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-900 dark:text-white">Microsoft Azure</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Configure with Subscription ID
                </p>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90 group-hover:text-cyan-600" />
            </button>

            <button
              onClick={() => handleManualProviderSelect('gcp')}
              className="flex items-center space-x-4 p-4 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-lg hover:border-cyan-500 dark:hover:border-cyan-400 transition group"
            >
              <CloudIcon provider="gcp" size="lg" />
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-900 dark:text-white">Google Cloud Platform</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Configure with Project ID
                </p>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90 group-hover:text-cyan-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAWSConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Cross-Account IAM Role ARN *
        </label>
        <input
          type="text"
          value={awsConfig.crossAccountRoleArn}
          onChange={(e) => setAwsConfig({ ...awsConfig, crossAccountRoleArn: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
          placeholder="arn:aws:iam::123456789012:role/DatabricksRole"
          required
        />
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          IAM role with permissions to create workspace resources
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          AWS Region *
        </label>
        <select
          value={awsConfig.region}
          onChange={(e) => setAwsConfig({ ...awsConfig, region: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
        >
          <option value="us-east-1">US East (N. Virginia)</option>
          <option value="us-west-2">US West (Oregon)</option>
          <option value="eu-west-1">EU (Ireland)</option>
          <option value="ap-south-1">Asia Pacific (Mumbai)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          VPC CIDR Block
        </label>
        <input
          type="text"
          value={awsConfig.vpcCidr}
          onChange={(e) => setAwsConfig({ ...awsConfig, vpcCidr: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
          placeholder="10.0.0.0/16"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Root S3 Bucket Name
        </label>
        <input
          type="text"
          value={awsConfig.rootS3Bucket}
          onChange={(e) => setAwsConfig({ ...awsConfig, rootS3Bucket: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
          placeholder="Leave empty to auto-generate"
        />
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          S3 bucket for metadata and Delta Lake storage
        </p>
      </div>

    </div>
  );

  const renderAzureConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Subscription ID *
        </label>
        <input
          type="text"
          value={azureConfig.subscriptionId}
          onChange={(e) => setAzureConfig({ ...azureConfig, subscriptionId: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Resource Group Name *
        </label>
        <input
          type="text"
          value={azureConfig.resourceGroup}
          onChange={(e) => setAzureConfig({ ...azureConfig, resourceGroup: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
          placeholder="my-databricks-rg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Azure Region *
        </label>
        <select
          value={azureConfig.region}
          onChange={(e) => setAzureConfig({ ...azureConfig, region: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
        >
          <option value="eastus">East US</option>
          <option value="westus2">West US 2</option>
          <option value="westeurope">West Europe</option>
          <option value="southeastasia">Southeast Asia</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          VNet CIDR Block
        </label>
        <input
          type="text"
          value={azureConfig.vnetCidr}
          onChange={(e) => setAzureConfig({ ...azureConfig, vnetCidr: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
          placeholder="10.0.0.0/16"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Storage Account Name
        </label>
        <input
          type="text"
          value={azureConfig.storageAccountName}
          onChange={(e) => setAzureConfig({ ...azureConfig, storageAccountName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
          placeholder="Leave empty to auto-generate"
        />
      </div>

    </div>
  );

  const renderGCPConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Project ID *
        </label>
        <input
          type="text"
          value={gcpConfig.projectId}
          onChange={(e) => setGcpConfig({ ...gcpConfig, projectId: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
          placeholder="my-gcp-project"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          GCP Region *
        </label>
        <select
          value={gcpConfig.region}
          onChange={(e) => setGcpConfig({ ...gcpConfig, region: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
        >
          <option value="us-central1">US Central 1</option>
          <option value="us-west1">US West 1</option>
          <option value="europe-west1">Europe West 1</option>
          <option value="asia-south1">Asia South 1</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          VPC Network Name
        </label>
        <input
          type="text"
          value={gcpConfig.network}
          onChange={(e) => setGcpConfig({ ...gcpConfig, network: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
          placeholder="Leave empty to auto-generate"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Subnet CIDR Block
        </label>
        <input
          type="text"
          value={gcpConfig.subnetCidr}
          onChange={(e) => setGcpConfig({ ...gcpConfig, subnetCidr: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
          placeholder="10.0.0.0/16"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          GCS Bucket Name
        </label>
        <input
          type="text"
          value={gcpConfig.gcsBucket}
          onChange={(e) => setGcpConfig({ ...gcpConfig, gcsBucket: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
          placeholder="Leave empty to auto-generate"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Service Account Email
        </label>
        <input
          type="email"
          value={gcpConfig.serviceAccountEmail}
          onChange={(e) => setGcpConfig({ ...gcpConfig, serviceAccountEmail: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
          placeholder="databricks@project.iam.gserviceaccount.com"
        />
      </div>

    </div>
  );

  const renderWorkspaceConfig = () => {
    const provider = selectedProfile?.provider || manualProvider;
    const providerName = selectedProfile?.name ||
      (provider === 'aws' ? 'Amazon Web Services' :
       provider === 'azure' ? 'Microsoft Azure' :
       'Google Cloud Platform');

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setStep('select-method')}
            className="text-cyan-600 dark:text-cyan-400 hover:underline text-sm"
          >
            ← Change Method
          </button>
          <div className="flex items-center space-x-2">
            {provider && <CloudIcon provider={provider} size="sm" />}
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
              {providerName}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Workspace Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
            placeholder="Production Workspace"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
            rows={3}
            placeholder="Describe your workspace..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Category
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
            placeholder="e.g., Production, Development, Testing"
          />
        </div>

        <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {provider?.toUpperCase()} Configuration
          </h3>
          {provider === 'aws' && renderAWSConfig()}
          {provider === 'azure' && renderAzureConfig()}
          {provider === 'gcp' && renderGCPConfig()}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Create Workspace</h2>
              <p className="text-white/80 text-sm">
                {step === 'select-method' ? 'Select cloud provider' : 'Configure workspace settings'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {step === 'select-method' ? renderMethodSelection() : renderWorkspaceConfig()}

          {step === 'config' && (
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-slate-700 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition flex items-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Workspace</span>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
