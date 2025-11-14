import { useState } from 'react';

interface AzureBlobFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function AzureBlobForm({ onSubmit, onCancel }: AzureBlobFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    accountName: '',
    accountKey: '',
    containerName: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      type: 'azure_blob',
      description: formData.description,
      config: {
        accountName: formData.accountName,
        accountKey: formData.accountKey,
        containerName: formData.containerName,
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
          placeholder="My Azure Blob Connection"
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Storage Account Name</label>
        <input
          type="text"
          value={formData.accountName}
          onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
          placeholder="mystorageaccount"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Account Key</label>
        <input
          type="password"
          value={formData.accountKey}
          onChange={(e) => setFormData({ ...formData, accountKey: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Container Name (Optional)</label>
        <input
          type="text"
          value={formData.containerName}
          onChange={(e) => setFormData({ ...formData, containerName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="my-container"
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
