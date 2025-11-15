import { Server, Play, Square, Trash2, Cpu, Activity } from 'lucide-react';

interface ComputeCluster { id: string; user_id: string; cluster_name: string; cluster_type: string; cloud_profile_id: string; instance_type?: string; instance_count?: number; status: string; config: any; created_at: string; updated_at: string; }

interface ComputeClusterCardProps {
  cluster: ComputeCluster & { cloud_profile_name?: string };
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
}

const computeColors = {
  spark: 'from-orange-500 to-red-600',
  dask: 'from-blue-500 to-indigo-600',
  ray: 'from-purple-500 to-pink-600',
};

const statusColors = {
  starting: 'bg-yellow-100 text-yellow-800',
  running: 'bg-green-100 text-green-800',
  stopped: 'bg-gray-100 text-gray-800',
  terminated: 'bg-red-100 text-red-800',
  error: 'bg-red-100 text-red-800',
};

export function ComputeClusterCard({ cluster, onDelete, onStart, onStop }: ComputeClusterCardProps) {
  const gradientClass = computeColors[cluster.compute_type];
  const statusClass = statusColors[cluster.status];

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className={`h-2 bg-gradient-to-r ${gradientClass}`} />

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${gradientClass} rounded-lg flex items-center justify-center`}>
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{cluster.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{cluster.compute_type} Cluster</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {cluster.status === 'running' ? (
              <button
                onClick={() => onStop(cluster.id)}
                className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition"
                title="Stop cluster"
              >
                <Square className="w-4 h-4" />
              </button>
            ) : cluster.status === 'stopped' ? (
              <button
                onClick={() => onStart(cluster.id)}
                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                title="Start cluster"
              >
                <Play className="w-4 h-4" />
              </button>
            ) : null}
            <button
              onClick={() => onDelete(cluster.id)}
              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
              title="Delete cluster"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Cpu className="w-4 h-4 mr-2" />
              <span>{cluster.node_type}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Activity className="w-4 h-4 mr-2" />
              <span>{cluster.num_workers} workers</span>
            </div>
          </div>

          {cluster.auto_scaling && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-700">
              Auto-scaling: {cluster.min_workers} - {cluster.max_workers} workers
            </div>
          )}

          {cluster.cloud_profile_name && (
            <div className="text-sm text-gray-500">
              Profile: {cluster.cloud_profile_name}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
              {cluster.status.charAt(0).toUpperCase() + cluster.status.slice(1)}
            </span>

            {cluster.endpoint_url && (
              <a
                href={cluster.endpoint_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
              >
                View UI
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
