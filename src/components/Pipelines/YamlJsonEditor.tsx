import { useState, useEffect } from 'react';
import { X, Check, FileJson, FileCode } from 'lucide-react';
import Editor from '@monaco-editor/react';
import yaml from 'js-yaml';

interface YamlJsonEditorProps {
  initialYaml: string;
  pipelineName: string;
  onSave: (content: string) => void;
  onClose: () => void;
}

export default function YamlJsonEditor({
  initialYaml,
  pipelineName,
  onSave,
  onClose,
}: YamlJsonEditorProps) {
  const [format, setFormat] = useState<'yaml' | 'json'>('yaml');
  const [content, setContent] = useState(initialYaml);
  const [jsonContent, setJsonContent] = useState('');
  const [yamlContent, setYamlContent] = useState(initialYaml);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const parsed = yaml.load(initialYaml);
      setJsonContent(JSON.stringify(parsed, null, 2));
      setYamlContent(initialYaml);
      setContent(initialYaml);
      setError(null);
    } catch (err) {
      setError('Invalid YAML format');
    }
  }, [initialYaml]);

  const handleFormatSwitch = (newFormat: 'yaml' | 'json') => {
    try {
      if (newFormat === 'json' && format === 'yaml') {
        const parsed = yaml.load(yamlContent);
        const jsonStr = JSON.stringify(parsed, null, 2);
        setJsonContent(jsonStr);
        setContent(jsonStr);
      } else if (newFormat === 'yaml' && format === 'json') {
        const parsed = JSON.parse(jsonContent);
        const yamlStr = yaml.dump(parsed, { indent: 2, lineWidth: -1 });
        setYamlContent(yamlStr);
        setContent(yamlStr);
      }
      setFormat(newFormat);
      setError(null);
    } catch (err) {
      setError(`Invalid ${format.toUpperCase()} format. Please fix errors before switching.`);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;

    setContent(value);
    if (format === 'yaml') {
      setYamlContent(value);
    } else {
      setJsonContent(value);
    }

    try {
      if (format === 'yaml') {
        yaml.load(value);
      } else {
        JSON.parse(value);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSave = () => {
    try {
      let finalYaml = '';
      if (format === 'yaml') {
        yaml.load(yamlContent);
        finalYaml = yamlContent;
      } else {
        const parsed = JSON.parse(jsonContent);
        finalYaml = yaml.dump(parsed, { indent: 2, lineWidth: -1 });
      }
      onSave(finalYaml);
    } catch (err: any) {
      setError(`Cannot save: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full h-full max-w-[90vw] max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Pipeline Configuration Editor</h3>
              <p className="text-sm text-gray-600">{pipelineName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => handleFormatSwitch('yaml')}
                className={`px-4 py-2 text-sm font-medium transition flex items-center space-x-2 ${
                  format === 'yaml'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileCode className="w-4 h-4" />
                <span>YAML</span>
              </button>
              <button
                onClick={() => handleFormatSwitch('json')}
                className={`px-4 py-2 text-sm font-medium transition flex items-center space-x-2 ${
                  format === 'json'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileJson className="w-4 h-4" />
                <span>JSON</span>
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={!!error}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-gray-900">
          <Editor
            height="100%"
            language={format}
            value={content}
            onChange={handleEditorChange}
            theme="vs-dark"
            loading={
              <div className="flex items-center justify-center h-full bg-gray-900">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading Monaco Editor...</p>
                </div>
              </div>
            }
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
              tabSize: 2,
              insertSpaces: true,
              renderWhitespace: 'selection',
              bracketPairColorization: { enabled: true },
              guides: {
                indentation: true,
                bracketPairs: true,
              },
            }}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border-t border-red-200 flex items-start space-x-2">
            <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Validation Error</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="p-3 bg-blue-50 border-t border-blue-200">
          <div className="flex items-start space-x-2 text-xs text-blue-800">
            <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">i</span>
            </div>
            <div className="flex-1">
              <p>
                <strong>Editor Tips:</strong> Use Ctrl+F to search, Ctrl+H to find & replace,
                Alt+Shift+F to format. Switch between YAML and JSON formats using the toggle above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
