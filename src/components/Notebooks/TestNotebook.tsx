import { useState } from 'react';
import { ArrowLeft, Play, Sparkles, Download, CheckCircle, AlertCircle, Loader2, Link, Server, Plus, Trash2, Code, Database, FileText, ChevronDown } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface Cell {
  id: string;
  type: 'code' | 'sql' | 'markdown';
  content: string;
  output?: string;
  executing?: boolean;
  executed?: boolean;
  error?: string;
}

const sampleCells: Cell[] = [
  {
    id: '1',
    type: 'markdown',
    content: '# Data Analysis Pipeline Demo\n\nThis notebook demonstrates a complete ETL workflow using AI-powered templates.',
  },
  {
    id: '2',
    type: 'code',
    content: `import pandas as pd
import numpy as np
from datetime import datetime

# Load sample data
data = {
    'id': range(1, 101),
    'name': [f'Customer {i}' for i in range(1, 101)],
    'email': [f'customer{i}@example.com' for i in range(1, 101)],
    'age': np.random.randint(18, 70, 100),
    'purchase_amount': np.random.uniform(10, 1000, 100).round(2),
    'created_at': pd.date_range('2024-01-01', periods=100, freq='D')
}

df = pd.DataFrame(data)
print(f"Loaded {len(df)} rows")
df.head()`,
    executed: true,
    output: `Loaded 100 rows
   id         name                    email  age  purchase_amount  created_at
0   1  Customer 1   customer1@example.com   45           456.23  2024-01-01
1   2  Customer 2   customer2@example.com   32           789.45  2024-01-02
2   3  Customer 3   customer3@example.com   58           234.67  2024-01-03
3   4  Customer 4   customer4@example.com   41           567.89  2024-01-04
4   5  Customer 5   customer5@example.com   29           890.12  2024-01-05`
  },
  {
    id: '3',
    type: 'code',
    content: `# Data Cleaning & Preprocessing
print("Data Quality Report:")
print(f"Total rows: {len(df)}")
print(f"Null values: {df.isnull().sum().sum()}")
print(f"Duplicates: {df.duplicated().sum()}")
print(f"\\nData types:")
print(df.dtypes)`,
    executed: true,
    output: `Data Quality Report:
Total rows: 100
Null values: 0
Duplicates: 0

Data types:
id                   int64
name                object
email               object
age                  int64
purchase_amount    float64
created_at  datetime64[ns]
dtype: object`
  },
  {
    id: '4',
    type: 'code',
    content: `# Feature Engineering
df['year'] = df['created_at'].dt.year
df['month'] = df['created_at'].dt.month
df['age_group'] = pd.cut(df['age'], bins=[0, 30, 50, 100], labels=['Young', 'Middle', 'Senior'])
df['high_value'] = (df['purchase_amount'] > df['purchase_amount'].median()).astype(int)

print("New features created:")
print(df[['age', 'age_group', 'purchase_amount', 'high_value']].head())`,
    executed: true,
    output: `New features created:
   age age_group  purchase_amount  high_value
0   45    Middle           456.23           1
1   32    Middle           789.45           1
2   58    Senior           234.67           0
3   41    Middle           567.89           1
4   29     Young           890.12           1`
  },
  {
    id: '5',
    type: 'sql',
    content: `-- SQL Query to analyze customer segments
SELECT
    age_group,
    COUNT(*) as customer_count,
    AVG(purchase_amount) as avg_purchase,
    SUM(purchase_amount) as total_revenue,
    MIN(purchase_amount) as min_purchase,
    MAX(purchase_amount) as max_purchase
FROM customers
WHERE created_at >= '2024-01-01'
GROUP BY age_group
ORDER BY total_revenue DESC;`,
    executed: true,
    output: `age_group  customer_count  avg_purchase  total_revenue  min_purchase  max_purchase
Middle              45        512.34      23055.30         23.45         998.76
Young               33        487.92      16101.36         15.67         989.23
Senior              22        445.67       9804.74         34.89         956.45`
  },
  {
    id: '6',
    type: 'code',
    content: `# Statistical Analysis
print("Summary Statistics by Age Group:")
summary = df.groupby('age_group')['purchase_amount'].agg(['count', 'mean', 'median', 'std'])
print(summary)

print("\\nCorrelation Analysis:")
print(df[['age', 'purchase_amount']].corr())`,
    executed: true,
    output: `Summary Statistics by Age Group:
           count       mean    median        std
age_group
Young         33     487.92    475.34     245.67
Middle        45     512.34    498.23     267.89
Senior        22     445.67    432.10     198.45

Correlation Analysis:
                    age  purchase_amount
age            1.000000        -0.123456
purchase_amount -0.123456        1.000000`
  },
  {
    id: '7',
    type: 'code',
    content: `# Export processed data
export_path = 's3://my-bucket/processed/customers.parquet'
df.to_parquet(export_path, index=False)
print(f"✓ Exported {len(df)} rows to {export_path}")

# Data Quality Validation
assert len(df) > 0, "DataFrame is empty"
assert df.isnull().sum().sum() == 0, "Found null values"
print("✓ All data quality checks passed!")`,
  }
];

interface TestNotebookProps {
  onClose?: () => void;
}

export default function TestNotebook({ onClose }: TestNotebookProps) {
  const [cells, setCells] = useState<Cell[]>(sampleCells);
  const [executing, setExecuting] = useState<string | null>(null);
  const [clusterConnected] = useState(true);
  const [showCellTypeMenu, setShowCellTypeMenu] = useState<number | null>(null);

  const executeCell = async (cellId: string) => {
    setExecuting(cellId);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setCells(cells.map(cell =>
      cell.id === cellId
        ? { ...cell, executed: true, executing: false, output: cell.output || 'Cell executed successfully!' }
        : cell
    ));
    setExecuting(null);
  };

  const addNewCell = (type: 'code' | 'sql' | 'markdown' = 'code') => {
    const newCell: Cell = {
      id: String(cells.length + 1),
      type,
      content: type === 'sql'
        ? '-- Write your SQL query here\nSELECT * FROM table_name LIMIT 10;'
        : type === 'markdown'
        ? '# New Section\n\nWrite your markdown here...'
        : '# Write your Python code here\nimport pandas as pd\n\nprint("Hello World!")',
    };
    setCells([...cells, newCell]);
  };

  const deleteCell = (index: number) => {
    if (cells.length === 1) return;
    setCells(cells.filter((_, i) => i !== index));
  };

  const changeCellType = (index: number, type: 'code' | 'sql' | 'markdown') => {
    const newCells = [...cells];
    newCells[index].type = type;
    newCells[index].output = undefined;
    setCells(newCells);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header - Glassmorphism */}
      <div className="relative bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-all duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 group-hover:-translate-x-1 transition-all" />
              <span className="font-medium text-cyan-400 group-hover:text-cyan-300">Back</span>
            </button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Data Analysis Demo Notebook</h1>
              <div className="flex items-center space-x-2 text-sm text-cyan-300/70 mt-0.5">
                <span className="px-2 py-0.5 bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 rounded text-xs font-medium backdrop-blur-sm border border-green-400/20">
                  Python
                </span>
                <span className="text-xs">•</span>
                <span className="text-xs">Test Environment</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg shadow-lg shadow-green-500/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <Link className="w-4 h-4 text-green-300" />
              <span className="text-sm font-medium text-green-300">
                Demo Cluster Connected
              </span>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-lg transition-all duration-300 text-sm font-medium text-white shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/60 hover:scale-105">
              <Sparkles className="w-4 h-4" />
              <span>AI Templates</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 rounded-lg transition-all duration-300 text-sm font-medium text-cyan-300 hover:text-cyan-200 hover:scale-105">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cells */}
      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto py-6 px-6 space-y-6">
          {cells.map((cell, index) => (
            <div
              key={cell.id}
              className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-[1.01] group"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Cell Header */}
              <div className="relative bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-mono text-cyan-400 font-bold">
                    [{index + 1}]
                  </span>

                  <div className="relative">
                    <button
                      onClick={() => setShowCellTypeMenu(showCellTypeMenu === index ? null : index)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-white/10 backdrop-blur-sm border border-cyan-500/30 hover:bg-white/20 hover:border-cyan-400/50 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/10"
                    >
                      {cell.type === 'code' && <Code className="w-3 h-3" />}
                      {cell.type === 'sql' && <Database className="w-3 h-3" />}
                      {cell.type === 'markdown' && <FileText className="w-3 h-3" />}
                      <span>{cell.type.toUpperCase()}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {showCellTypeMenu === index && (
                      <div className="absolute top-full left-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 z-10 min-w-[160px] overflow-hidden">
                        <button
                          onClick={() => {
                            changeCellType(index, 'code');
                            setShowCellTypeMenu(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-200 transition-all duration-200"
                        >
                          <Code className="w-4 h-4" />
                          <span>Code</span>
                        </button>
                        <button
                          onClick={() => {
                            changeCellType(index, 'sql');
                            setShowCellTypeMenu(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-green-300 hover:bg-green-500/20 hover:text-green-200 transition-all duration-200"
                        >
                          <Database className="w-4 h-4" />
                          <span>SQL</span>
                        </button>
                        <button
                          onClick={() => {
                            changeCellType(index, 'markdown');
                            setShowCellTypeMenu(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 transition-all duration-200"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Markdown</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {cell.executed && (
                    <CheckCircle className="w-4 h-4 text-green-400 animate-pulse" />
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => executeCell(cell.id)}
                    disabled={executing === cell.id}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-lg transition-all duration-300 text-xs font-medium disabled:opacity-50 shadow-lg shadow-green-500/30 hover:shadow-green-400/40 hover:scale-105"
                  >
                    {executing === cell.id ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        <span>Run</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => deleteCell(index)}
                    disabled={cells.length === 1}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-red-500/0 hover:shadow-red-500/20"
                    title="Delete cell"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cell Content */}
              <div className="relative monaco-cell-wrapper">
                {cell.type === 'markdown' ? (
                  <div className="p-6 prose prose-invert max-w-none">
                    <div className="text-cyan-100" dangerouslySetInnerHTML={{ __html: cell.content.replace(/\n/g, '<br>').replace(/^# /gm, '<h1 class="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">').replace(/<h1 class="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">([^<]+)<br>/, '<h1 class="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">$1</h1>') }} />
                  </div>
                ) : (
                  <Editor
                    height={Math.max(cell.content.split('\n').length * 19 + 20, 120)}
                    defaultLanguage={cell.type === 'sql' ? 'sql' : 'python'}
                    value={cell.content}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      readOnly: true,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on',
                      padding: { top: 10, bottom: 10 },
                      scrollbar: {
                        vertical: 'hidden',
                        horizontal: 'auto',
                      }
                    }}
                  />
                )}
              </div>

              {/* Cell Output */}
              {cell.output && (
                <div className="relative border-t border-white/10">
                  <div className="px-4 py-3">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                      <span className="text-xs font-semibold text-cyan-400 tracking-wider">OUTPUT</span>
                    </div>
                    <pre className="font-mono text-xs bg-gradient-to-br from-slate-900 to-slate-950 text-green-300 p-4 rounded-xl overflow-x-auto border border-green-500/20 shadow-inner shadow-green-500/10">
{cell.output}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Cell Button */}
          <button
            onClick={() => addNewCell('code')}
            className="relative w-full py-5 border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/60 bg-white/5 hover:bg-cyan-500/10 backdrop-blur-sm rounded-2xl transition-all duration-500 text-cyan-400 hover:text-cyan-300 font-medium text-sm flex items-center justify-center space-x-3 group shadow-lg shadow-cyan-500/0 hover:shadow-cyan-500/20 hover:scale-[1.01]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <Plus className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
            <span className="relative z-10">Add Cell</span>
          </button>

          {/* Info Box */}
          <div className="relative bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-6 mt-6 shadow-2xl shadow-cyan-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 animate-pulse"></div>
            <div className="relative flex items-start space-x-3">
              <Sparkles className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1 animate-pulse" />
              <div>
                <h3 className="font-semibold text-cyan-300 mb-2">
                  Monaco Editor + AI Templates
                </h3>
                <p className="text-sm text-cyan-300/80 mb-3">
                  This notebook showcases VS Code-style editing with syntax highlighting, autocomplete, and AI-powered code templates.
                </p>
                <ul className="text-sm text-cyan-300/80 space-y-1">
                  <li>✓ Full Python & SQL syntax highlighting</li>
                  <li>✓ IntelliSense autocomplete</li>
                  <li>✓ Keyboard shortcuts (Shift+Enter, Ctrl+Enter)</li>
                  <li>✓ Pre-built AI templates for common operations</li>
                  <li>✓ Real-time execution & output display</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 px-6 py-2 flex items-center justify-between text-xs text-gray-600 dark:text-slate-400">
        <div className="flex items-center space-x-4">
          <span>{cells.length} cells</span>
          <span>•</span>
          <span>{cells.filter(c => c.executed).length} executed</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded font-medium">
            Ready
          </span>
        </div>
      </div>
    </div>
  );
}
