import { useState } from 'react';
import { X, Code } from 'lucide-react';
import { NODE_TYPES } from './nodeTypes';
import CodeEditorModal from './CodeEditorModal';

interface NodeConfigModalProps {
  node: any;
  onSave: (config: any) => void;
  onClose: () => void;
}

export default function NodeConfigModal({ node, onSave, onClose }: NodeConfigModalProps) {
  const nodeType = NODE_TYPES.find((n) => n.id === node.data.nodeType);
  const [config, setConfig] = useState(node.data.config || {});
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [currentCodeField, setCurrentCodeField] = useState<any>(null);

  if (!nodeType) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  const openCodeEditor = (field: any) => {
    setCurrentCodeField(field);
    setShowCodeEditor(true);
  };

  const handleCodeSave = () => {
    setShowCodeEditor(false);
    setCurrentCodeField(null);
  };

  const shouldShowField = (field: any) => {
    if (field.name === 'gitRepoUrl' || field.name === 'gitBranch' || field.name === 'gitFolder') {
      return config['useGitRepo'] === true;
    }
    if (field.name === 'scriptLocation') {
      return config['useGitRepo'] !== true;
    }
    return true;
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case 'code':
        return (
          <div>
            <button
              type="button"
              onClick={() => openCodeEditor(field)}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition flex items-center justify-center space-x-2 text-gray-600 hover:text-cyan-600"
            >
              <Code className="w-5 h-5" />
              <span className="font-medium">
                {config[field.name] ? 'Edit Code' : 'Open Code Editor'}
              </span>
            </button>
            {config[field.name] && (
              <div className="mt-2 p-3 bg-gray-900 rounded-lg">
                <pre className="text-xs text-green-400 font-mono overflow-x-auto max-h-20">
                  {config[field.name].substring(0, 200)}
                  {config[field.name].length > 200 && '...'}
                </pre>
              </div>
            )}
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={config[field.name] || ''}
            onChange={(e) => setConfig({ ...config, [field.name]: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
            placeholder={field.placeholder}
            rows={4}
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            value={config[field.name] || ''}
            onChange={(e) => setConfig({ ...config, [field.name]: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            required={field.required}
          >
            <option value="">Select...</option>
            {field.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={config[field.name] || ''}
            onChange={(e) => setConfig({ ...config, [field.name]: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config[field.name] || false}
              onChange={(e) => setConfig({ ...config, [field.name]: e.target.checked })}
              className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
            />
            <span className="text-sm text-gray-700">Enable</span>
          </label>
        );

      default:
        return (
          <input
            type="text"
            value={config[field.name] || ''}
            onChange={(e) => setConfig({ ...config, [field.name]: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder={field.placeholder}
            required={field.required}
          />
        );
    }
  };

  return (
    <>
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{nodeType.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{nodeType.label}</h3>
                <p className="text-sm text-gray-600">{nodeType.description}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {nodeType.configFields.map((field) => {
              if (!shouldShowField(field)) return null;

              return (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                  {field.name === 'useGitRepo' && config[field.name] && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        Git repository integration enabled. Configure your repository details below.
                      </p>
                    </div>
                  )}
                  {field.name === 'jobParameters' && (
                    <p className="mt-1 text-xs text-gray-500">
                      Add multiple parameters, one per line. Format: --key=value
                    </p>
                  )}
                  {field.name === 'gitRepoUrl' && (
                    <p className="mt-1 text-xs text-gray-500">
                      Supports GitHub, GitLab, Bitbucket, and AWS CodeCommit repositories
                    </p>
                  )}
                  {field.name === 'workerType' && (
                    <p className="mt-1 text-xs text-gray-500">
                      DPU = Data Processing Unit. Higher DPUs provide more compute power.
                    </p>
                  )}
                </div>
              );
            })}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-600 transition"
              >
                Save Configuration
              </button>
            </div>
          </form>
        </div>
      </div>

      {showCodeEditor && currentCodeField && (
        <CodeEditorModal
          title={currentCodeField.label}
          value={config[currentCodeField.name] || ''}
          onChange={(value) => setConfig({ ...config, [currentCodeField.name]: value })}
          onSave={handleCodeSave}
          onClose={() => {
            setShowCodeEditor(false);
            setCurrentCodeField(null);
          }}
          language={currentCodeField.language || 'text'}
          placeholder={currentCodeField.placeholder}
        />
      )}
    </>
  );
}
