import { useState } from 'react';

interface BigQueryFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function BigQueryForm({ onSubmit, onCancel }: BigQueryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectId: '',
    serviceAccountKey: '',
    dataset: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      type: 'bigquery',
      description: formData.description,
      config: {
        projectId: formData.projectId,
        serviceAccountKey: formData.serviceAccountKey,
        dataset: formData.dataset,
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
          placeholder="My BigQuery Connection"
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
        <label className="block text-sm font-medium text-gray-700 mb-1">GCP Project ID</label>
        <input
          type="text"
          value={formData.projectId}
          onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
          placeholder="my-project-id"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Service Account Key (JSON)</label>
        <textarea
          value={formData.serviceAccountKey}
          onChange={(e) => setFormData({ ...formData, serviceAccountKey: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-xs"
          placeholder='{"type": "service_account", "project_id": "..."}'
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dataset (Optional)</label>
        <input
          type="text"
          value={formData.dataset}
          onChange={(e) => setFormData({ ...formData, dataset: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="my_dataset"
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
