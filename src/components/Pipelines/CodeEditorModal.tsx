import { useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface CodeEditorModalProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
  language: string;
  placeholder?: string;
}

export default function CodeEditorModal({
  title,
  value,
  onChange,
  onSave,
  onClose,
  language,
  placeholder,
}: CodeEditorModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getLanguageColor = () => {
    switch (language) {
      case 'python':
        return 'bg-blue-500';
      case 'sql':
        return 'bg-purple-500';
      case 'scala':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const containerClass = isFullscreen
    ? 'fixed inset-0 z-50 rounded-none'
    : 'w-[95vw] max-w-[1400px] h-[90vh]';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-xl shadow-2xl flex flex-col ${containerClass}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 ${getLanguageColor()} text-white text-xs font-bold rounded uppercase`}>
              {language}
            </span>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-gray-700" />
              ) : (
                <Maximize2 className="w-5 h-5 text-gray-700" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 p-4 bg-gray-900">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-full bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder={placeholder}
              spellCheck={false}
              style={{
                lineHeight: '1.5',
                tabSize: 4,
              }}
            />
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Lines:</span> {value.split('\n').length} |
              <span className="font-medium ml-3">Characters:</span> {value.length}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-600 transition font-medium"
              >
                Save Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
