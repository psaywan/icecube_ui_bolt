import { useState, useEffect } from 'react';
import { X, Cloud, AlertCircle, ChevronDown } from 'lucide-react';
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

export function CreateWorkspaceModal({ isOpen, onClose, onSuccess }: CreateWorkspaceModalProps) {
  const [step, setStep] = useState<'profile' | 'config'>('profile');
  const [cloudProfiles, setCloudProfiles] = useState<CloudProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<CloudProfile | null>(null);
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
    vpcCidr: '10.0.0.0/16',
    rootS3Bucket: '',
    createVpc: true,
    createSubnets: true,
    createSecurityGroups: true,
    enableEfs: false,
    enableEbs: true,
  });

  const [azureConfig, setAzureConfig] = useState({
    subscriptionId: '',
    resourceGroup: '',
    vnetCidr: '10.0.0.0/16',
    createVnet: true,
    storageAccountName: '',
    enableManagedIdentity: true,
  });

  const [gcpConfig, setGcpConfig] = useState({
    projectId: '',
    network: '',
    subnetCidr: '10.0.0.0/16',
    createNetwork: true,
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
    setStep('config');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!selectedProfile) {
        throw new Error('Please select a cloud profile');
      }

      let config = {};
      if (selectedProfile.provider === 'aws') {
        config = awsConfig;
      } else if (selectedProfile.provider === 'azure') {
        config = azureConfig;
      } else if (selectedProfile.provider === 'gcp') {
        config = gcpConfig;
      }

      await rdsApi.workspaces.create({
        ...formData,
        cloud_profile_id: selectedProfile.id,
        provider: selectedProfile.provider,
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
    setStep('profile');
    setSelectedProfile(null);
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
      vpcCidr: '10.0.0.0/16',
      rootS3Bucket: '',
      createVpc: true,
      createSubnets: true,
      createSecurityGroups: true,
      enableEfs: false,
      enableEbs: true,
    });
  };

  const renderProfileSelection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Select Cloud Profile
        </h3>
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
          Choose the cloud profile where you want to deploy your workspace
        </p>

        {cloudProfiles.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">No Cloud Profiles Found</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              You need to create a cloud profile before creating a workspace.
            </p>
            <button
              onClick={() => {
                onClose();
              }}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
            >
              Go to Cloud Profiles
            </button>
          </div>
        ) : (
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
        )}
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

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-3">Auto-Create Resources</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={awsConfig.createVpc}
              onChange={(e) => setAwsConfig({ ...awsConfig, createVpc: e.target.checked })}
              className="w-4 h-4 text-cyan-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-slate-300">Create VPC automatically</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={awsConfig.createSubnets}
              onChange={(e) => setAwsConfig({ ...awsConfig, createSubnets: e.target.checked })}
              className="w-4 h-4 text-cyan-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-slate-300">Create Subnets automatically</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={awsConfig.createSecurityGroups}
              onChange={(e) => setAwsConfig({ ...awsConfig, createSecurityGroups: e.target.checked })}
              className="w-4 h-4 text-cyan-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-slate-300">Create Security Groups</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={awsConfig.enableEfs}
              onChange={(e) => setAwsConfig({ ...awsConfig, enableEfs: e.target.checked })}
              className="w-4 h-4 text-cyan-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-slate-300">Enable EFS</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={awsConfig.enableEbs}
              onChange={(e) => setAwsConfig({ ...awsConfig, enableEbs: e.target.checked })}
              className="w-4 h-4 text-cyan-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-slate-300">Enable EBS volumes</span>
          </label>
        </div>
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

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-3">Configuration Options</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={azureConfig.createVnet}
              onChange={(e) => setAzureConfig({ ...azureConfig, createVnet: e.target.checked })}
              className="w-4 h-4 text-cyan-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-slate-300">Create VNet automatically</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={azureConfig.enableManagedIdentity}
              onChange={(e) => setAzureConfig({ ...azureConfig, enableManagedIdentity: e.target.checked })}
              className="w-4 h-4 text-cyan-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-slate-300">Enable Managed Identity</span>
          </label>
        </div>
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

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={gcpConfig.createNetwork}
            onChange={(e) => setGcpConfig({ ...gcpConfig, createNetwork: e.target.checked })}
            className="w-4 h-4 text-cyan-600 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-slate-300">Create VPC Network automatically</span>
        </label>
      </div>
    </div>
  );

  const renderWorkspaceConfig = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-slate-700">
        <button
          onClick={() => setStep('profile')}
          className="text-cyan-600 dark:text-cyan-400 hover:underline text-sm"
        >
          ← Change Profile
        </button>
        {selectedProfile && (
          <div className="flex items-center space-x-2">
            <CloudIcon provider={selectedProfile.provider} size="sm" />
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
              {selectedProfile.name}
            </span>
          </div>
        )}
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
          {selectedProfile?.provider.toUpperCase()} Configuration
        </h3>
        {selectedProfile?.provider === 'aws' && renderAWSConfig()}
        {selectedProfile?.provider === 'azure' && renderAzureConfig()}
        {selectedProfile?.provider === 'gcp' && renderGCPConfig()}
      </div>
    </div>
  );

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
                {step === 'profile' ? 'Select cloud profile' : 'Configure workspace settings'}
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

          {step === 'profile' ? renderProfileSelection() : renderWorkspaceConfig()}

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
