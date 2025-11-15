import { Cloud, MapPin, Trash2, Power, AlertCircle } from 'lucide-react';

interface CloudProfile { id: string; user_id: string; provider: string; profile_name: string; credentials: any; region?: string; created_at: string; updated_at: string; }

interface CloudProfileCardProps {
  profile: CloudProfile;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: 'active' | 'inactive') => void;
}

const providerColors = {
  aws: 'from-orange-500 to-amber-600',
  azure: 'from-blue-500 to-cyan-600',
  gcp: 'from-green-500 to-emerald-600',
};

const providerNames = {
  aws: 'Amazon AWS',
  azure: 'Microsoft Azure',
  gcp: 'Google Cloud',
};

export function CloudProfileCard({ profile, onDelete, onToggleStatus }: CloudProfileCardProps) {
  const gradientClass = providerColors[profile.cloud_provider];
  const providerName = providerNames[profile.cloud_provider];

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className={`h-2 bg-gradient-to-r ${gradientClass}`} />

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${gradientClass} rounded-lg flex items-center justify-center`}>
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
              <p className="text-sm text-gray-500">{providerName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleStatus(
                profile.id,
                profile.status === 'active' ? 'inactive' : 'active'
              )}
              className={`p-2 rounded-lg transition ${
                profile.status === 'active'
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={profile.status === 'active' ? 'Deactivate' : 'Activate'}
            >
              <Power className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(profile.id)}
              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
              title="Delete profile"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>Region: {profile.region}</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              profile.status === 'active'
                ? 'bg-green-100 text-green-800'
                : profile.status === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {profile.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
              {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
            </span>

            {profile.stack_id && (
              <span className="text-xs text-gray-500">
                Stack: {profile.stack_id.substring(0, 12)}...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
