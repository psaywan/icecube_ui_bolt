import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { rdsApi } from '../../lib/rdsApi';
import { ComputeClusterCard } from './ComputeClusterCard';
import { CreateClusterModal } from './CreateClusterModal';
import { rdsApi } from '../../lib/rdsApi';

type ComputeCluster = Database['public']['Tables']['compute_clusters']['Row'];

export function ComputeClustersTab() {
  const [clusters, setClusters] = useState<(ComputeCluster & { cloud_profile_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchClusters();
  }, []);

  const fetchClusters = async () => {
    try {
      const { data: clustersData, error } = await supabase
        .from('compute_clusters')
        .select(`
          *,
          cloud_profiles (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedClusters = clustersData?.map((cluster: any) => ({
        ...cluster,
        cloud_profile_name: cluster.cloud_profiles?.name,
      })) || [];

      setClusters(formattedClusters);
    } catch (error) {
      console.error('Error fetching clusters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCluster = async (data: {
    name: string;
    cloud_profile_id: string;
    compute_type: 'spark' | 'dask' | 'ray';
    node_type: string;
    num_workers: number;
    auto_scaling: boolean;
    min_workers: number;
    max_workers: number;
  }) => {
    const { error } = await supabase
      .from('compute_clusters')
      .insert({
        ...data,
        status: 'stopped',
      });

    if (error) {
      console.error('Error creating cluster:', error);
      throw error;
    }

    await fetchClusters();
  };

  const handleDeleteCluster = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cluster?')) return;

    const { error } = await supabase
      .from('compute_clusters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting cluster:', error);
      return;
    }

    await fetchClusters();
  };

  const handleStartCluster = async (id: string) => {
    const { error } = await supabase
      .from('compute_clusters')
      .update({ status: 'starting', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error starting cluster:', error);
      return;
    }

    setTimeout(async () => {
      await supabase
        .from('compute_clusters')
        .update({
          status: 'running',
          endpoint_url: `https://cluster-${id.substring(0, 8)}.icecube.io`,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      await fetchClusters();
    }, 2000);

    await fetchClusters();
  };

  const handleStopCluster = async (id: string) => {
    const { error } = await supabase
      .from('compute_clusters')
      .update({
        status: 'stopped',
        endpoint_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error stopping cluster:', error);
      return;
    }

    await fetchClusters();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compute Clusters</h1>
          <p className="text-gray-600 mt-2">Manage Spark, Dask, and Ray compute resources</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition shadow-lg shadow-cyan-500/30"
        >
          <Plus className="w-5 h-5" />
          <span>Create Cluster</span>
        </button>
      </div>

      {clusters.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-10 h-10 text-cyan-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Compute Clusters</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your first compute cluster to start processing data with Spark, Dask, or Ray.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Cluster</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clusters.map((cluster) => (
            <ComputeClusterCard
              key={cluster.id}
              cluster={cluster}
              onDelete={handleDeleteCluster}
              onStart={handleStartCluster}
              onStop={handleStopCluster}
            />
          ))}
        </div>
      )}

      {showModal && (
        <CreateClusterModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateCluster}
        />
      )}
    </div>
  );
}
