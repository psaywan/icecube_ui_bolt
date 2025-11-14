import { useState } from 'react';

interface HDFSFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function HDFSForm({ onSubmit, onCancel }: HDFSFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    nameNodeHost: '',
    nameNodePort: '9000',
    username: 'hdfs',
    path: '/',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      type: 'hdfs',
      description: formData.description,
      config: {
        nameNodeHost: formData.nameNodeHost,
        nameNodePort: formData.nameNodePort,
        username: formData.username,
        path: formData.path,
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
          placeholder="My HDFS Connection"
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
        <label className="block text-sm font-medium text-gray-700 mb-1">NameNode Host</label>
        <input
          type="text"
          value={formData.nameNodeHost}
          onChange={(e) => setFormData({ ...formData, nameNodeHost: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
          placeholder="namenode.example.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">NameNode Port</label>
        <input
          type="text"
          value={formData.nameNodePort}
          onChange={(e) => setFormData({ ...formData, nameNodePort: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="9000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="hdfs"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Default Path</label>
        <input
          type="text"
          value={formData.path}
          onChange={(e) => setFormData({ ...formData, path: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="/"
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
