import { useState } from 'react';

interface S3FormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function S3Form({ onSubmit, onCancel }: S3FormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
    bucket: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      type: 's3',
      description: formData.description,
      config: {
        accessKeyId: formData.accessKeyId,
        secretAccessKey: formData.secretAccessKey,
        region: formData.region,
        bucket: formData.bucket,
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
          placeholder="My S3 Connection"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Production S3 bucket for analytics"
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
          placeholder="AKIAIOSFODNN7EXAMPLE"
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
          placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
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
          <option value="eu-central-1">EU (Frankfurt)</option>
          <option value="ap-south-1">Asia Pacific (Mumbai)</option>
          <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bucket Name (Optional)</label>
        <input
          type="text"
          value={formData.bucket}
          onChange={(e) => setFormData({ ...formData, bucket: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="my-data-bucket"
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
