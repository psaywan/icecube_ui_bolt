import { useState, useRef } from 'react';
import { Play, Save, Database, Clock } from 'lucide-react';
import { DataCatalogSidebar } from './DataCatalogSidebar';

export function QueryEditorTab() {
  const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [results, setResults] = useState<any[]>([]);
  const [executing, setExecuting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const executeQuery = async () => {
    setExecuting(true);
    setTimeout(() => {
      setResults([
        { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-16' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', created_at: '2024-01-17' },
      ]);
      setExecuting(false);
    }, 1000);
  };

  const handleInsertText = (text: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newQuery = query.substring(0, start) + text + query.substring(end);
      setQuery(newQuery);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newCursorPos = start + text.length;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  return (
    <div className="h-full flex">
      <DataCatalogSidebar onInsertText={handleInsertText} />

      <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Query Editor</h1>
          <p className="text-gray-600 mt-2">Write and execute SQL queries</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <Save className="w-4 h-4" />
            <span>Save Query</span>
          </button>
          <button
            onClick={executeQuery}
            disabled={executing}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>{executing ? 'Executing...' : 'Run Query'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 gap-4">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-gray-900">SQL Query</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>PostgreSQL</span>
            </div>
          </div>
          <div className="flex-1 p-4">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-full font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              placeholder="-- Write your SQL query here...&#10;-- Click on tables/columns in the catalog to insert them"
            />
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <span className="font-semibold text-gray-900">Results ({results.length} rows)</span>
            </div>
            <div className="overflow-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    {Object.keys(results[0]).map((key) => (
                      <th key={key} className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {Object.values(row).map((value: any, vidx) => (
                        <td key={vidx} className="px-4 py-3 text-sm text-gray-700">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
