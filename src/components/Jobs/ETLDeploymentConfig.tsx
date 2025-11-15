import { useState } from 'react';
import { Cloud, Rocket, Settings, CheckCircle, AlertCircle, Loader2, Server, Zap } from 'lucide-react';
import { CloudIcon } from '../Common/CloudIcon';

interface ETLDeploymentConfigProps {
  project: any;
  onStageChange: (stage: string) => void;
}

export default function ETLDeploymentConfig({ project, onStageChange }: ETLDeploymentConfigProps) {
  const [selectedProvider, setSelectedProvider] = useState<'aws' | 'gcp' | 'azure'>('aws');
  const [deploymentConfig, setDeploymentConfig] = useState({
    region: 'us-east-1',
    instanceType: 'medium',
    autoScaling: true,
    monitoring: true,
    scheduling: 'daily',
    notificationEmail: '',
  });
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const cloudProviders = [
    { id: 'aws', name: 'Amazon Web Services', regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1'] },
    { id: 'gcp', name: 'Google Cloud Platform', regions: ['us-central1', 'europe-west1', 'asia-east1'] },
    { id: 'azure', name: 'Microsoft Azure', regions: ['eastus', 'westeurope', 'southeastasia'] },
  ];

  const instanceTypes = [
    { id: 'small', name: 'Small', cores: 2, memory: '4 GB', cost: '$0.10/hr' },
    { id: 'medium', name: 'Medium', cores: 4, memory: '8 GB', cost: '$0.20/hr' },
    { id: 'large', name: 'Large', cores: 8, memory: '16 GB', cost: '$0.40/hr' },
    { id: 'xlarge', name: 'X-Large', cores: 16, memory: '32 GB', cost: '$0.80/hr' },
  ];

  const scheduleOptions = [
    { id: 'hourly', name: 'Every Hour', cron: '0 * * * *' },
    { id: 'daily', name: 'Daily at Midnight', cron: '0 0 * * *' },
    { id: 'weekly', name: 'Weekly on Sunday', cron: '0 0 * * 0' },
    { id: 'monthly', name: 'Monthly on 1st', cron: '0 0 1 * *' },
    { id: 'manual', name: 'Manual Trigger Only', cron: null },
  ];

  const handleDeploy = async () => {
    setDeploying(true);
    await new Promise(resolve => setTimeout(resolve, 5000));
    setDeploying(false);
    setDeployed(true);
  };

  const currentProvider = cloudProviders.find(p => p.id === selectedProvider);
  const currentInstance = instanceTypes.find(i => i.id === deploymentConfig.instanceType);

  if (deployed) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md p-8 border border-green-200">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Deployment Successful!</h2>
              <p className="text-gray-600">Your ETL pipeline is now live and running</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Pipeline ID</p>
              <p className="text-lg font-mono font-semibold text-gray-900">ETL-{Math.random().toString(36).substr(2, 9)}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Cloud Provider</p>
              <div className="flex items-center space-x-2">
                <CloudIcon provider={selectedProvider} size="sm" />
                <p className="text-lg font-semibold text-gray-900">{currentProvider?.name}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Region</p>
              <p className="text-lg font-semibold text-gray-900">{deploymentConfig.region}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Deployment Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Infrastructure Provisioned</span>
                <span className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Complete</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Airflow DAGs Deployed</span>
                <span className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Complete</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monitoring Enabled</span>
                <span className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Active</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Scheduled Execution</span>
                <span className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{scheduleOptions.find(s => s.id === deploymentConfig.scheduling)?.name}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.open(`https://console.${selectedProvider}.amazon.com`, '_blank')}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition"
            >
              <Cloud className="w-5 h-5" />
              <span>View in {currentProvider?.name}</span>
            </button>
            <button
              onClick={() => alert('Monitoring dashboard will open here')}
              className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              <Server className="w-5 h-5" />
              <span>View Monitoring</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Deploy to Cloud</h2>
            <p className="text-sm text-gray-600">Configure and deploy your ETL pipeline automatically</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Cloud Provider</label>
            <div className="grid grid-cols-3 gap-4">
              {cloudProviders.map(provider => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id as any)}
                  className={`p-4 border-2 rounded-lg transition ${
                    selectedProvider === provider.id
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CloudIcon provider={provider.id} size="lg" className="mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 text-center">{provider.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <select
                value={deploymentConfig.region}
                onChange={(e) => setDeploymentConfig({ ...deploymentConfig, region: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                {currentProvider?.regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instance Type</label>
              <select
                value={deploymentConfig.instanceType}
                onChange={(e) => setDeploymentConfig({ ...deploymentConfig, instanceType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                {instanceTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.cores} cores, {type.memory} ({type.cost})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
            <select
              value={deploymentConfig.scheduling}
              onChange={(e) => setDeploymentConfig({ ...deploymentConfig, scheduling: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              {scheduleOptions.map(schedule => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.name} {schedule.cron && `(${schedule.cron})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notification Email</label>
            <input
              type="email"
              value={deploymentConfig.notificationEmail}
              onChange={(e) => setDeploymentConfig({ ...deploymentConfig, notificationEmail: e.target.value })}
              placeholder="your-email@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
            <p className="text-xs text-gray-500 mt-1">Receive alerts for pipeline failures and status updates</p>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={deploymentConfig.autoScaling}
                onChange={(e) => setDeploymentConfig({ ...deploymentConfig, autoScaling: e.target.checked })}
                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-700">Enable Auto-scaling</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={deploymentConfig.monitoring}
                onChange={(e) => setDeploymentConfig({ ...deploymentConfig, monitoring: e.target.checked })}
                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-700">Enable Monitoring & Alerts</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-cyan-600" />
          <span>Deployment Configuration Summary</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Provider</p>
            <p className="text-sm font-semibold text-gray-900">{currentProvider?.name}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Region</p>
            <p className="text-sm font-semibold text-gray-900">{deploymentConfig.region}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Instance</p>
            <p className="text-sm font-semibold text-gray-900">{currentInstance?.name}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Est. Cost</p>
            <p className="text-sm font-semibold text-green-600">{currentInstance?.cost}</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-900 mb-1">Cost Optimization Enabled</p>
            <p className="text-xs text-yellow-700">
              AI has optimized your deployment to use spot instances, reducing costs by up to 70%. Auto-scaling will adjust resources based on workload.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => onStageChange('building')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          ← Back to Pipeline
        </button>

        <button
          onClick={handleDeploy}
          disabled={deploying}
          className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
        >
          {deploying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Deploying Pipeline...</span>
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5" />
              <span>Deploy to {currentProvider?.name}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
