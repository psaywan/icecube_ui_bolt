import { useState } from 'react';

interface RedshiftFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function RedshiftForm({ onSubmit, onCancel }: RedshiftFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    host: '',
    port: '5439',
    database: '',
    username: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      type: 'redshift',
      description: formData.description,
      config: {
        host: formData.host,
        port: formData.port,
        database: formData.database,
        username: formData.username,
        password: formData.password,
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
          placeholder="My Redshift Connection"
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
          <input
            type="text"
            value={formData.host}
            onChange={(e) => setFormData({ ...formData, host: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
            placeholder="cluster.abc123.us-east-1.redshift.amazonaws.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
          <input
            type="text"
            value={formData.port}
            onChange={(e) => setFormData({ ...formData, port: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="5439"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Database</label>
        <input
          type="text"
          value={formData.database}
          onChange={(e) => setFormData({ ...formData, database: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="dev"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          required
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
