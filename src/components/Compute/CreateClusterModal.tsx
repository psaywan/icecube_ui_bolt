import { useState, useEffect } from 'react';
import { X, Server, Zap, Info, Settings2, HardDrive, Clock } from 'lucide-react';

interface CloudProfile { id: string; user_id: string; provider: string; profile_name: string; credentials: any; region?: string; created_at: string; updated_at: string; }

interface CreateClusterModalProps {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    cloud_profile_id: string;
    compute_type: 'spark' | 'dask' | 'ray';
    node_type: string;
    num_workers: number;
    auto_scaling: boolean;
    min_workers: number;
    max_workers: number;
  }) => Promise<void>;
}

const nodeTypes = {
  aws: [
    { name: 't3.medium', cores: 2, memory: '4 GB', price: '$0.0416/hr' },
    { name: 't3.large', cores: 2, memory: '8 GB', price: '$0.0832/hr' },
    { name: 't3.xlarge', cores: 4, memory: '16 GB', price: '$0.1664/hr' },
    { name: 'r5.xlarge', cores: 4, memory: '32 GB', price: '$0.252/hr' },
    { name: 'r5.2xlarge', cores: 8, memory: '64 GB', price: '$0.504/hr' },
    { name: 'c5.2xlarge', cores: 8, memory: '16 GB', price: '$0.34/hr' },
  ],
  azure: [
    { name: 'Standard_D2s_v3', cores: 2, memory: '8 GB', price: '$0.096/hr' },
    { name: 'Standard_D4s_v3', cores: 4, memory: '16 GB', price: '$0.192/hr' },
    { name: 'Standard_E4s_v3', cores: 4, memory: '32 GB', price: '$0.252/hr' },
    { name: 'Standard_E8s_v3', cores: 8, memory: '64 GB', price: '$0.504/hr' },
  ],
  gcp: [
    { name: 'n1-standard-2', cores: 2, memory: '7.5 GB', price: '$0.095/hr' },
    { name: 'n1-standard-4', cores: 4, memory: '15 GB', price: '$0.190/hr' },
    { name: 'n1-highmem-4', cores: 4, memory: '26 GB', price: '$0.237/hr' },
    { name: 'n1-highmem-8', cores: 8, memory: '52 GB', price: '$0.474/hr' },
  ],
};

const sparkVersions = ['3.5.0', '3.4.1', '3.3.2'];
const daskVersions = ['2024.1.0', '2023.12.1', '2023.11.0'];
const rayVersions = ['2.9.0', '2.8.1', '2.7.2'];

const runtimeVersions = {
  spark: sparkVersions,
  dask: daskVersions,
  ray: rayVersions,
};

export function CreateClusterModal({ onClose, onSubmit }: CreateClusterModalProps) {
  const [step, setStep] = useState(1);
  const [cloudProfiles, setCloudProfiles] = useState<CloudProfile[]>([]);
  const [name, setName] = useState('');
  const [cloudProfileId, setCloudProfileId] = useState('');
  const [computeType, setComputeType] = useState<'spark' | 'dask' | 'ray'>('spark');
  const [runtimeVersion, setRuntimeVersion] = useState(sparkVersions[0]);
  const [nodeType, setNodeType] = useState('');
  const [numWorkers, setNumWorkers] = useState(2);
  const [autoScaling, setAutoScaling] = useState(false);
  const [minWorkers, setMinWorkers] = useState(1);
  const [maxWorkers, setMaxWorkers] = useState(10);
  const [autoTermination, setAutoTermination] = useState(true);
  const [terminationMinutes, setTerminationMinutes] = useState(120);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCloudProfiles();
  }, []);

  useEffect(() => {
    if (cloudProfiles.length > 0 && !cloudProfileId) {
      setCloudProfileId(cloudProfiles[0].id);
      setNodeType(nodeTypes[cloudProfiles[0].cloud_provider][0].name);
    }
  }, [cloudProfiles]);

  useEffect(() => {
    const profile = cloudProfiles.find(p => p.id === cloudProfileId);
    if (profile) {
      setNodeType(nodeTypes[profile.cloud_provider][0].name);
    }
  }, [cloudProfileId, cloudProfiles]);

  useEffect(() => {
    setRuntimeVersion(runtimeVersions[computeType][0]);
  }, [computeType]);

  const fetchCloudProfiles = async () => {
    const { data, error } = await supabase
      .from('cloud_profiles')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }

    setCloudProfiles(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name,
        cloud_profile_id: cloudProfileId,
        compute_type: computeType,
        node_type: nodeType,
        num_workers: numWorkers,
        auto_scaling: autoScaling,
        min_workers: minWorkers,
        max_workers: maxWorkers,
      });
      onClose();
    } catch (error) {
      console.error('Error creating cluster:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedProfile = cloudProfiles.find(p => p.id === cloudProfileId);
  const availableNodeTypes = selectedProfile ? nodeTypes[selectedProfile.cloud_provider] : [];
  const selectedNodeType = availableNodeTypes.find(n => n.name === nodeType);

  const estimatedCost = selectedNodeType
    ? parseFloat(selectedNodeType.price.replace(/[^0-9.]/g, '')) * (numWorkers + 1)
    : 0;

  if (cloudProfiles.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Cloud Profiles</h3>
            <p className="text-gray-600 mb-6">
              Please create and activate a cloud profile first before creating compute clusters.
            </p>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Create Compute Cluster</h2>
            <p className="text-cyan-50 text-sm mt-1">Configure your distributed compute environment</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {[
              { num: 1, label: 'Cluster Type' },
              { num: 2, label: 'Configuration' },
              { num: 3, label: 'Review' },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step === s.num
                      ? 'bg-cyan-600 text-white'
                      : step > s.num
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {s.num}
                  </div>
                  <span className={`text-sm font-medium ${
                    step === s.num ? 'text-cyan-600' : 'text-gray-600'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`w-12 h-0.5 mx-3 ${
                    step > s.num ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cluster Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., Production Analytics Cluster"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cloud Profile
                </label>
                <select
                  value={cloudProfileId}
                  onChange={(e) => setCloudProfileId(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {cloudProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name} ({profile.cloud_provider.toUpperCase()} - {profile.region})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Compute Framework
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(['spark', 'dask', 'ray'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setComputeType(type)}
                      className={`p-6 border-2 rounded-xl transition-all ${
                        computeType === type
                          ? 'border-cyan-500 bg-cyan-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <Server className={`w-12 h-12 mx-auto mb-3 ${
                        computeType === type ? 'text-cyan-600' : 'text-gray-400'
                      }`} />
                      <div className="text-base font-bold text-gray-900 capitalize mb-1">
                        Apache {type === 'spark' ? 'Spark' : type === 'dask' ? 'Dask' : 'Ray'}
                      </div>
                      <p className="text-xs text-gray-600">
                        {type === 'spark' && 'Big Data Processing'}
                        {type === 'dask' && 'Parallel Computing'}
                        {type === 'ray' && 'ML & AI Workloads'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Runtime Version
                </label>
                <select
                  value={runtimeVersion}
                  onChange={(e) => setRuntimeVersion(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {runtimeVersions[computeType].map((version) => (
                    <option key={version} value={version}>
                      {computeType.charAt(0).toUpperCase() + computeType.slice(1)} {version}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Worker Node Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {availableNodeTypes.map((node) => (
                    <button
                      key={node.name}
                      type="button"
                      onClick={() => setNodeType(node.name)}
                      className={`p-4 border-2 rounded-lg transition text-left ${
                        nodeType === node.name
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-gray-900">{node.name}</div>
                        <div className="text-xs font-medium text-green-600">{node.price}</div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-2">
                          <HardDrive className="w-3 h-3" />
                          <span>{node.cores} Cores</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap className="w-3 h-3" />
                          <span>{node.memory} Memory</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Cluster Configuration</p>
                    <p>Your cluster will have 1 driver node and your specified number of worker nodes. All nodes will use the selected instance type.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={autoScaling}
                    onChange={(e) => setAutoScaling(e.target.checked)}
                    className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Enable Auto-scaling
                  </span>
                </label>

                {autoScaling ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Workers
                      </label>
                      <input
                        type="number"
                        value={minWorkers}
                        onChange={(e) => setMinWorkers(Number(e.target.value))}
                        min="1"
                        max={maxWorkers}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Workers
                      </label>
                      <input
                        type="number"
                        value={maxWorkers}
                        onChange={(e) => setMaxWorkers(Number(e.target.value))}
                        min={minWorkers}
                        max="100"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Workers
                    </label>
                    <input
                      type="number"
                      value={numWorkers}
                      onChange={(e) => setNumWorkers(Number(e.target.value))}
                      min="1"
                      max="100"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center space-x-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={autoTermination}
                    onChange={(e) => setAutoTermination(e.target.checked)}
                    className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Enable Auto-termination
                  </span>
                </label>

                {autoTermination && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Terminate after (minutes of inactivity)
                    </label>
                    <input
                      type="number"
                      value={terminationMinutes}
                      onChange={(e) => setTerminationMinutes(Number(e.target.value))}
                      min="10"
                      max="10080"
                      step="10"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Cluster Summary</h3>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-cyan-200">
                    <span className="text-gray-700 font-medium">Cluster Name:</span>
                    <span className="text-gray-900 font-semibold">{name}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-cyan-200">
                    <span className="text-gray-700 font-medium">Compute Type:</span>
                    <span className="text-gray-900 font-semibold capitalize">{computeType}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-cyan-200">
                    <span className="text-gray-700 font-medium">Runtime Version:</span>
                    <span className="text-gray-900 font-semibold">{runtimeVersion}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-cyan-200">
                    <span className="text-gray-700 font-medium">Node Type:</span>
                    <span className="text-gray-900 font-semibold">{nodeType}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-cyan-200">
                    <span className="text-gray-700 font-medium">Configuration:</span>
                    <span className="text-gray-900 font-semibold">
                      {autoScaling
                        ? `Auto-scaling (${minWorkers}-${maxWorkers} workers)`
                        : `${numWorkers} workers`
                      }
                    </span>
                  </div>

                  {selectedProfile && (
                    <div className="flex justify-between py-2 border-b border-cyan-200">
                      <span className="text-gray-700 font-medium">Cloud Profile:</span>
                      <span className="text-gray-900 font-semibold">
                        {selectedProfile.name} ({selectedProfile.cloud_provider.toUpperCase()})
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-3 bg-white rounded-lg px-4 mt-4">
                    <span className="text-gray-700 font-medium">Estimated Cost:</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cyan-600">
                        ${estimatedCost.toFixed(2)}/hr
                      </div>
                      <div className="text-sm text-gray-500">
                        ~${(estimatedCost * 730).toFixed(2)}/month
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Auto-termination</p>
                    <p>
                      {autoTermination
                        ? `Cluster will automatically terminate after ${terminationMinutes} minutes of inactivity to save costs.`
                        : 'Cluster will run until manually terminated. Remember to stop it when not in use.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (step === 1) {
                onClose();
              } else {
                setStep(step - 1);
              }
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !name}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Creating Cluster...' : 'Create Cluster'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
