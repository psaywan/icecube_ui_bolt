import { useState } from 'react';

interface AthenaFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function AthenaForm({ onSubmit, onCancel }: AthenaFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
    outputLocation: '',
    workgroup: 'primary',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      type: 'athena',
      description: formData.description,
      config: {
        accessKeyId: formData.accessKeyId,
        secretAccessKey: formData.secretAccessKey,
        region: formData.region,
        outputLocation: formData.outputLocation,
        workgroup: formData.workgroup,
      },
      status: 'active',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Connection Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="My Athena Connection"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">AWS Access Key ID</label>
        <input
          type="text"
          value={formData.accessKeyId}
          onChange={(e) => setFormData({ ...formData, accessKeyId: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">AWS Secret Access Key</label>
        <input
          type="password"
          value={formData.secretAccessKey}
          onChange={(e) => setFormData({ ...formData, secretAccessKey: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">AWS Region</label>
        <select
          value={formData.region}
          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
          <option value="us-east-1">US East (N. Virginia)</option>
          <option value="us-east-2">US East (Ohio)</option>
          <option value="us-west-1">US West (N. California)</option>
          <option value="us-west-2">US West (Oregon)</option>
          <option value="eu-west-1">EU (Ireland)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Output Location (S3)</label>
        <input
          type="text"
          value={formData.outputLocation}
          onChange={(e) => setFormData({ ...formData, outputLocation: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
          placeholder="s3://my-bucket/athena-results/"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Workgroup</label>
        <input
          type="text"
          value={formData.workgroup}
          onChange={(e) => setFormData({ ...formData, workgroup: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="primary"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-600 transition"
        >
          Add Data Source
        </button>
      </div>
    </form>
  );
}
