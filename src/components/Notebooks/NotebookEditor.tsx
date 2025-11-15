import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Plus, Trash2, Save, Download, Server, ChevronDown, Loader2, CheckCircle, AlertCircle, Code, FileText, Database, MoveUp, MoveDown, Link } from 'lucide-react';

interface NotebookEditorProps {
  notebookId: string;
  onClose: () => void;
}

interface Cell {
  id: string;
  type: 'code' | 'markdown' | 'sql';
  content: string;
  output?: string;
  executing?: boolean;
  error?: string;
  executionTime?: number;
}

interface Notebook {
  id: string;
  name: string;
  language: string;
  content: {
    cells: Cell[];
  };
  cluster_id: string | null;
}

interface Cluster {
  id: string;
  name: string;
  status: string;
}

export function NotebookEditor({ notebookId, onClose }: NotebookEditorProps) {
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [showCellTypeMenu, setShowCellTypeMenu] = useState<number | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [showClusterMenu, setShowClusterMenu] = useState(false);
  const textAreaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  useEffect(() => {
    fetchNotebook();
    fetchClusters();
  }, [notebookId]);

  const fetchNotebook = async () => {
    const { data, error } = await supabase
      .from('notebooks')
      .select('*')
      .eq('id', notebookId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching notebook:', error);
      return;
    }

    if (data) {
      setNotebook(data);
      const notebookCells = data.content?.cells || [];
      if (notebookCells.length === 0) {
        setCells([{
          id: crypto.randomUUID(),
          type: 'code',
          content: '',
        }]);
      } else {
        setCells(notebookCells);
      }
    }
    setLoading(false);
  };

  const fetchClusters = async () => {
    const { data } = await supabase
      .from('clusters')
      .select('id, name, status')
      .order('name');

    if (data) {
      setClusters(data);
    }
  };

  const saveNotebook = async () => {
    if (!notebook) return;

    setSaving(true);
    const { error } = await supabase
      .from('notebooks')
      .update({
        content: { cells },
        updated_at: new Date().toISOString(),
      })
      .eq('id', notebookId);

    if (error) {
      console.error('Error saving notebook:', error);
    } else {
      setLastSaved(new Date());
    }
    setSaving(false);
  };

  const addCell = (index: number, type: 'code' | 'markdown' | 'sql' = 'code') => {
    const newCell: Cell = {
      id: crypto.randomUUID(),
      type,
      content: '',
    };
    const newCells = [...cells];
    newCells.splice(index + 1, 0, newCell);
    setCells(newCells);

    // Focus on the new cell after state update
    setTimeout(() => {
      const newTextarea = textAreaRefs.current[newCell.id];
      if (newTextarea) {
        newTextarea.focus();
      }
    }, 50);

    return newCell.id;
  };

  const deleteCell = (index: number) => {
    if (cells.length === 1) return;
    const newCells = cells.filter((_, i) => i !== index);
    setCells(newCells);
  };

  const updateCell = (index: number, content: string) => {
    const newCells = [...cells];
    newCells[index].content = content;
    setCells(newCells);
    autoResizeTextarea(cells[index].id);
  };

  const autoResizeTextarea = (cellId: string) => {
    const textarea = textAreaRefs.current[cellId];
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(textarea.scrollHeight, 80) + 'px';
    }
  };

  const connectToCluster = async (clusterId: string | null) => {
    if (!notebook) return;

    const { error } = await supabase
      .from('notebooks')
      .update({ cluster_id: clusterId })
      .eq('id', notebookId);

    if (!error) {
      setNotebook({ ...notebook, cluster_id: clusterId });
      setShowClusterMenu(false);
    }
  };

  const changeCellType = (index: number, type: 'code' | 'markdown' | 'sql') => {
    const newCells = [...cells];
    newCells[index].type = type;
    newCells[index].output = undefined;
    newCells[index].error = undefined;
    setCells(newCells);
    setShowCellTypeMenu(null);
  };

  const moveCell = (index: number, direction: 'up' | 'down') => {
    const newCells = [...cells];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= cells.length) return;

    [newCells[index], newCells[targetIndex]] = [newCells[targetIndex], newCells[index]];
    setCells(newCells);
  };

  const executeCell = async (index: number) => {
    if (!notebook) return;

    const newCells = [...cells];
    newCells[index].executing = true;
    newCells[index].error = undefined;
    newCells[index].output = undefined;
    setCells([...newCells]);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const { data: sessionData } = await supabase.auth.getSession();

      let endpoint = '';
      let payload: any = {
        notebookId,
        cellId: cells[index].id,
      };

      const cellType = cells[index].type;
      const language = cellType === 'sql' ? 'sql' : notebook.language;

      switch (language) {
        case 'sql':
          endpoint = `${supabaseUrl}/functions/v1/execute-sql`;
          payload.query = cells[index].content;
          break;
        case 'python':
          endpoint = `${supabaseUrl}/functions/v1/execute-python`;
          payload.code = cells[index].content;
          break;
        case 'scala':
          endpoint = `${supabaseUrl}/functions/v1/execute-scala`;
          payload.code = cells[index].content;
          break;
        case 'r':
          endpoint = `${supabaseUrl}/functions/v1/execute-r`;
          payload.code = cells[index].content;
          break;
        default:
          throw new Error(`Unsupported language: ${language}`);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session?.access_token || supabaseAnonKey}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      newCells[index].executing = false;

      if (result.success) {
        if (language === 'sql') {
          const data = result.data;
          if (data.simulated) {
            newCells[index].output = formatSQLOutput(data.rows);
          } else if (data.rows && data.rows.length > 0) {
            newCells[index].output = formatSQLOutput(data.rows);
          } else {
            newCells[index].output = `Query executed successfully.\nRows affected: ${data.rowCount || 0}`;
          }
        } else {
          newCells[index].output = result.output || 'Execution completed successfully';
        }
        newCells[index].executionTime = result.executionTime;
      } else {
        newCells[index].error = result.error || 'Execution failed';
        newCells[index].output = result.output || result.error;
      }

      setCells([...newCells]);
    } catch (error: any) {
      newCells[index].executing = false;
      newCells[index].error = error.message || 'Execution failed';
      newCells[index].output = `Error: ${error.message}\n\nPlease check your code and try again.`;
      setCells([...newCells]);
    }
  };

  const formatSQLOutput = (rows: any[]) => {
    if (!rows || rows.length === 0) {
      return 'No rows returned';
    }

    const headers = Object.keys(rows[0]);
    const maxWidths = headers.map(header => {
      const values = rows.map(row => String(row[header] || ''));
      return Math.max(header.length, ...values.map(v => v.length));
    });

    const separator = '+-' + maxWidths.map(w => '-'.repeat(w)).join('-+-') + '-+';
    const headerRow = '| ' + headers.map((h, i) => h.padEnd(maxWidths[i])).join(' | ') + ' |';
    const dataRows = rows.slice(0, 100).map(row =>
      '| ' + headers.map((h, i) => String(row[h] || '').padEnd(maxWidths[i])).join(' | ') + ' |'
    );

    const output = [
      separator,
      headerRow,
      separator,
      ...dataRows,
      separator,
      `\n${rows.length} row(s) returned${rows.length > 100 ? ' (showing first 100)' : ''}`,
    ].join('\n');

    return output;
  };

  const executeAllCells = async () => {
    for (let i = 0; i < cells.length; i++) {
      if ((cells[i].type === 'code' || cells[i].type === 'sql') && cells[i].content.trim()) {
        await executeCell(i);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const getLanguageName = () => {
    return notebook?.language.toUpperCase() || 'CODE';
  };

  const getCellTypeIcon = (type: string) => {
    switch (type) {
      case 'sql':
        return <Database className="w-3.5 h-3.5" />;
      case 'markdown':
        return <FileText className="w-3.5 h-3.5" />;
      default:
        return <Code className="w-3.5 h-3.5" />;
    }
  };

  const getCellTypeName = (type: string) => {
    switch (type) {
      case 'sql':
        return 'SQL';
      case 'markdown':
        return 'Markdown';
      default:
        return 'Code';
    }
  };

  const getPlaceholder = (cell: Cell) => {
    if (cell.type === 'sql') {
      return '-- Write your SQL query here...\n-- Shift+Enter to run and create new cell | Ctrl/Cmd+Enter to run only';
    } else if (cell.type === 'markdown') {
      return '# Markdown\nWrite documentation, notes, or descriptions here...';
    } else {
      return `# Write your ${notebook?.language || 'code'} here...\n# Shift+Enter to run and create new cell | Ctrl/Cmd+Enter to run only`;
    }
  };

  const getConnectedCluster = () => {
    if (!notebook?.cluster_id) return null;
    return clusters.find(c => c.id === notebook.cluster_id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notebook...</p>
        </div>
      </div>
    );
  }

  if (!notebook) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-gray-700">Back</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{notebook.name}</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-0.5">
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                {getLanguageName()}
              </span>
            </div>
          </div>

          <div className="ml-6 relative">
            <button
              onClick={() => setShowClusterMenu(!showClusterMenu)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition text-sm font-medium ${
                notebook.cluster_id
                  ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Link className="w-4 h-4" />
              <span>
                {notebook.cluster_id
                  ? getConnectedCluster()?.name || 'Connected'
                  : 'Connect to Cluster'}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showClusterMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 min-w-[280px]">
                <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-700">Attach to Cluster</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notebook.cluster_id && (
                    <button
                      onClick={() => connectToCluster(null)}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 border-b border-gray-100"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Detach Cluster</div>
                        <div className="text-xs text-gray-500">Run without cluster</div>
                      </div>
                    </button>
                  )}
                  {clusters.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      <Server className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No clusters available</p>
                      <p className="text-xs mt-1">Create a cluster first</p>
                    </div>
                  ) : (
                    clusters.map((cluster) => (
                      <button
                        key={cluster.id}
                        onClick={() => connectToCluster(cluster.id)}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 ${
                          notebook.cluster_id === cluster.id ? 'bg-green-50' : ''
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            cluster.status === 'running'
                              ? 'bg-green-500'
                              : cluster.status === 'starting'
                              ? 'bg-yellow-500'
                              : 'bg-gray-400'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{cluster.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{cluster.status}</div>
                        </div>
                        {notebook.cluster_id === cluster.id && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={saveNotebook}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-medium disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition text-sm font-medium">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            onClick={executeAllCells}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition text-sm font-medium shadow-lg"
          >
            <Play className="w-4 h-4" />
            <span>Run All</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50" style={{ height: 'calc(100vh - 180px)' }}>
        <div className="max-w-6xl mx-auto py-4 px-4">
          {cells.map((cell, index) => (
            <div
              key={cell.id}
              className="mb-2 group"
            >
              <div className="bg-white rounded-lg border border-gray-200 hover:border-cyan-400 hover:shadow-md transition-all">
                <div className="flex items-center px-3 py-2 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-xs font-mono text-gray-400 min-w-[32px]">
                      [{index + 1}]
                    </span>
                    <div className="relative">
                      <button
                        onClick={() => setShowCellTypeMenu(showCellTypeMenu === index ? null : index)}
                        className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded transition"
                      >
                        {getCellTypeIcon(cell.type)}
                        <span>{getCellTypeName(cell.type)}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>

                      {showCellTypeMenu === index && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                          <button
                            onClick={() => changeCellType(index, 'code')}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Code className="w-4 h-4" />
                            <span>Code</span>
                          </button>
                          <button
                            onClick={() => changeCellType(index, 'sql')}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Database className="w-4 h-4" />
                            <span>SQL</span>
                          </button>
                          <button
                            onClick={() => changeCellType(index, 'markdown')}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Markdown</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => executeCell(index)}
                      disabled={cell.executing || cell.type === 'markdown'}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Run cell (Shift+Enter: run & create new | Ctrl/Cmd+Enter: run only)"
                    >
                      {cell.executing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => moveCell(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition disabled:opacity-30"
                      title="Move up"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveCell(index, 'down')}
                      disabled={index === cells.length - 1}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition disabled:opacity-30"
                      title="Move down"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => addCell(index, cell.type)}
                      className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded transition"
                      title="Add cell below"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCell(index)}
                      disabled={cells.length === 1}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Delete cell"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  <textarea
                    ref={(el) => {
                      textAreaRefs.current[cell.id] = el;
                      if (el) {
                        el.style.height = 'auto';
                        el.style.height = Math.max(el.scrollHeight, 80) + 'px';
                      }
                    }}
                    value={cell.content}
                    onChange={(e) => updateCell(index, e.target.value)}
                    onKeyDown={async (e) => {
                      if (cell.type === 'markdown') return;

                      if (e.shiftKey && e.key === 'Enter') {
                        e.preventDefault();
                        await executeCell(index);
                        addCell(index, cell.type);
                      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        executeCell(index);
                      }
                    }}
                    placeholder={getPlaceholder(cell)}
                    className="w-full min-h-[80px] font-mono text-sm bg-transparent border-none outline-none resize-y text-gray-800 placeholder-gray-400"
                    style={{ lineHeight: '1.5', overflow: 'hidden' }}
                  />
                </div>

                {cell.executing && (
                  <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-sm text-blue-700 font-medium">Executing...</span>
                  </div>
                )}

                {cell.error && !cell.executing && (
                  <div className="border-t border-red-200 bg-red-50">
                    <div className="px-4 py-2 flex items-center space-x-2 border-b border-red-200">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-800">Error</span>
                    </div>
                    <div className="px-4 py-3 max-h-64 overflow-auto">
                      <pre className="text-xs font-mono text-red-700 whitespace-pre-wrap">{cell.output}</pre>
                    </div>
                  </div>
                )}

                {cell.output && !cell.executing && !cell.error && (
                  <div className="border-t border-gray-200">
                    <div className="px-4 py-2 bg-gray-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-semibold text-green-400">Output</span>
                      </div>
                      {cell.executionTime && (
                        <span className="text-xs text-gray-400">
                          {cell.executionTime}ms
                        </span>
                      )}
                    </div>
                    <div className="px-4 py-3 bg-gray-900 max-h-80 overflow-auto">
                      <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap leading-relaxed">
                        {cell.output}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={() => addCell(cells.length - 1)}
            className="w-full py-4 mt-2 border-2 border-dashed border-gray-300 hover:border-cyan-400 hover:bg-cyan-50 rounded-lg transition text-gray-500 hover:text-cyan-600 font-medium text-sm"
          >
            + Add Cell
          </button>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          <span>{cells.length} cells</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
            Ready
          </span>
        </div>
      </div>
    </div>
  );
}
