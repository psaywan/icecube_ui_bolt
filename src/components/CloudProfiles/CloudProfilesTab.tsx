import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/RDSAuthContext';
import { rdsApi } from '../../lib/rdsApi';
import { CloudProfileCard } from './CloudProfileCard';
import { CreateCloudProfileModal } from './CreateCloudProfileModal';
import AWSSetupPage from './AWSSetupPage';

interface CloudProfile {
  id: string;
  user_id: string;
  provider: string;
  profile_name: string;
  credentials: any;
  region?: string;
  created_at: string;
  updated_at: string;
}

export function CloudProfilesTab() {
  const [profiles, setProfiles] = useState<CloudProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAWSSetup, setShowAWSSetup] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('cloud_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (data: {
    name: string;
    cloud_provider: 'aws' | 'azure' | 'gcp';
    region: string;
    credentials: Record<string, string>;
    category?: string;
  }) => {
    if (!user) return;

    const { error } = await supabase
      .from('cloud_profiles')
      .insert({
        user_id: user.id,
        name: data.name,
        provider: data.cloud_provider,
        region: data.region,
        category: data.category || 'General',
        status: 'inactive',
      });

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }

    await fetchProfiles();
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cloud profile?')) return;

    const { error } = await supabase
      .from('cloud_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting profile:', error);
      return;
    }

    await fetchProfiles();
  };

  const handleToggleStatus = async (id: string, status: 'active' | 'inactive') => {
    const { error } = await supabase
      .from('cloud_profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating profile:', error);
      return;
    }

    await fetchProfiles();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  if (showAWSSetup) {
    return <AWSSetupPage onBack={() => setShowAWSSetup(false)} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cloud Profiles</h1>
          <p className="text-gray-600 mt-2">Manage your multi-cloud connections</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition shadow-lg shadow-cyan-500/30"
        >
          <Plus className="w-5 h-5" />
          <span>Add Cloud Profile</span>
        </button>
      </div>

      {profiles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-10 h-10 text-cyan-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Cloud Profiles Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get started by connecting your AWS, Azure, or GCP account to begin managing your data infrastructure.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Profile</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <CloudProfileCard
              key={profile.id}
              profile={profile}
              onDelete={handleDeleteProfile}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {showModal && (
        <CreateCloudProfileModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateProfile}
          onAWSSetup={() => setShowAWSSetup(true)}
        />
      )}
    </div>
  );
}
