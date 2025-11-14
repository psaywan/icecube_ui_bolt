import { useState, useRef } from 'react';
import { Play, Save, Database, X, Plus, ChevronUp, ChevronDown, Folder } from 'lucide-react';
import { DataCatalogSidebar } from './DataCatalogSidebar';
import { supabase } from '../../lib/supabase';

interface QueryTab {
  id: string;
  name: string;
  query: string;
  results: any[];
  executing: boolean;
}

interface SaveQueryModalProps {
  query: string;
  onClose: () => void;
  onSave: (name: string, description: string, tags: string[]) => Promise<void>;
}

function SaveQueryModal({ query, onClose, onSave }: SaveQueryModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a query name');
      return;
    }

    setSaving(true);
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      await onSave(name, description, tagArray);
      onClose();
    } catch (err: any) {
      alert('Error saving query: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Save Query</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Query Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="My Query"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="What does this query do?"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="analytics, reporting, sales"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-600 mb-2">Query Preview:</p>
            <pre className="text-xs text-gray-700 overflow-auto max-h-32 font-mono">
              {query}
            </pre>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-600 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Query'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function QueryEditorTab() {
  const [tabs, setTabs] = useState<QueryTab[]>([
    { id: '1', name: 'Query 1', query: 'SELECT * FROM users LIMIT 10;', results: [], executing: false }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [previewData, setPreviewData] = useState<any>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [editorHeight, setEditorHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const addNewTab = () => {
    const newId = Date.now().toString();
    const newTab: QueryTab = {
      id: newId,
      name: `Query ${tabs.length + 1}`,
      query: '-- New query',
      results: [],
      executing: false
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;

    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const updateTabQuery = (query: string) => {
    setTabs(tabs.map(t => t.id === activeTabId ? { ...t, query } : t));
  };

  const executeQuery = async () => {
    setTabs(tabs.map(t => t.id === activeTabId ? { ...t, executing: true } : t));

    setTimeout(() => {
      const mockResults = [
        { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-16' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', created_at: '2024-01-17' },
      ];

      setTabs(tabs.map(t => t.id === activeTabId ? { ...t, results: mockResults, executing: false } : t));
    }, 1000);
  };

  const handleInsertText = (text: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newQuery = activeTab.query.substring(0, start) + text + activeTab.query.substring(end);
      updateTabQuery(newQuery);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newCursorPos = start + text.length;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  const handlePreviewTable = async (dataSourceId: string, database: string, tableName: string) => {
    try {
      const { data: catalogData, error: catalogError } = await supabase
        .from('catalog_metadata')
        .select('*')
        .eq('data_source_id', dataSourceId)
        .eq('database_name', database)
        .eq('table_name', tableName)
        .order('column_order');

      if (catalogError) throw catalogError;

      const columns = (catalogData || []).map(row => ({
        name: row.column_name,
        type: row.data_type
      }));

      const sampleRows = Array.from({ length: 5 }, (_, i) => {
        const row: any = {};
        columns.forEach(col => {
          row[col.name] = `Sample ${i + 1}`;
        });
        return row;
      });

      setPreviewData({
        tableName: `${database !== 'default' ? database + '.' : ''}${tableName}`,
        columns,
        rows: sampleRows,
        rowCount: 5
      });
    } catch (err: any) {
      console.error('Error loading preview:', err);
      alert('Failed to load table preview: ' + err.message);
    }
  };

  const handleSaveQuery = async (name: string, description: string, tags: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('saved_queries')
        .insert([{
          user_id: user.id,
          name,
          description,
          query_text: activeTab.query,
          tags
        }]);

      if (error) throw error;

      alert('Query saved successfully!');
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isResizing) {
      const container = e.currentTarget.getBoundingClientRect();
      const newHeight = e.clientY - container.top;
      if (newHeight >= 150 && newHeight <= 600) {
        setEditorHeight(newHeight);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  return (
    <div className="h-full flex" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <DataCatalogSidebar onInsertText={handleInsertText} onPreviewTable={handlePreviewTable} />

      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Query Editor</h1>
            <p className="text-gray-600 mt-2">Write and execute SQL queries</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Query</span>
            </button>
            <button
              onClick={executeQuery}
              disabled={activeTab.executing}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{activeTab.executing ? 'Executing...' : 'Run Query'}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white rounded-t-xl shadow-md border border-gray-200 flex flex-col">
            <div className="flex items-center bg-gray-50 border-b border-gray-200 overflow-x-auto">
              {tabs.map(tab => (
                <div
                  key={tab.id}
                  className={`flex items-center gap-2 px-4 py-2 border-r border-gray-200 cursor-pointer min-w-[150px] ${
                    activeTabId === tab.id ? 'bg-white border-b-2 border-b-cyan-500' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTabId(tab.id)}
                >
                  <Database className="w-3 h-3 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900 flex-1 truncate">{tab.name}</span>
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addNewTab}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100"
                title="New query tab"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div style={{ height: `${editorHeight}px` }} className="p-4 relative">
              <textarea
                ref={textareaRef}
                value={activeTab.query}
                onChange={(e) => updateTabQuery(e.target.value)}
                className="w-full h-full font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                placeholder="-- Write your SQL query here...&#10;-- Click on tables/columns in the catalog to insert them"
              />
            </div>

            <div
              onMouseDown={handleMouseDown}
              className="h-2 bg-gray-100 hover:bg-gray-200 cursor-ns-resize flex items-center justify-center border-t border-gray-200 group"
            >
              <div className="flex flex-col gap-0.5 opacity-50 group-hover:opacity-100">
                <ChevronUp className="w-3 h-3 text-gray-600" />
                <ChevronDown className="w-3 h-3 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto mt-4 space-y-4">
            {previewData && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-blue-900">Table Preview: {previewData.tableName}</span>
                    <span className="text-sm text-blue-600 ml-3">({previewData.rowCount} sample rows)</span>
                  </div>
                  <button
                    onClick={() => setPreviewData(null)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        {previewData.columns.map((col: any) => (
                          <th key={col.name} className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                            <div className="flex flex-col">
                              <span>{col.name}</span>
                              <span className="text-xs text-gray-500 font-normal">{col.type}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {previewData.rows.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          {previewData.columns.map((col: any) => (
                            <td key={col.name} className="px-4 py-3 text-sm text-gray-700">
                              {row[col.name] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab.results.length > 0 && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <span className="font-semibold text-gray-900">Results ({activeTab.results.length} rows)</span>
                </div>
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        {Object.keys(activeTab.results[0]).map((key) => (
                          <th key={key} className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {activeTab.results.map((row, idx) => (
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

      {showSaveModal && (
        <SaveQueryModal
          query={activeTab.query}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveQuery}
        />
      )}
    </div>
  );
}
