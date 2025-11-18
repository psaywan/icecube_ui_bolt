import { useState } from 'react';
import { ArrowLeft, Play, Sparkles, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-slate-300" />
              <span className="font-medium text-gray-700 dark:text-slate-300">Back</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Data Analysis Demo Notebook</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-slate-400 mt-0.5">
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                  Python
                </span>
                <span className="text-xs">•</span>
                <span className="text-xs">Test Environment</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>AI Templates</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition text-sm font-medium text-gray-700 dark:text-slate-300">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cells */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto py-6 px-6 space-y-4">
          {cells.map((cell, index) => (
            <div
              key={cell.id}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Cell Header */}
              <div className="bg-gray-50 dark:bg-slate-900/50 px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono text-gray-500 dark:text-slate-500">
                    [{index + 1}]
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    cell.type === 'code'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : cell.type === 'sql'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                  }`}>
                    {cell.type.toUpperCase()}
                  </span>
                  {cell.executed && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <button
                  onClick={() => executeCell(cell.id)}
                  disabled={executing === cell.id}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded transition text-xs font-medium disabled:opacity-50"
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
              </div>

              {/* Cell Content */}
              <div className="monaco-cell-wrapper">
                {cell.type === 'markdown' ? (
                  <div className="p-4 prose dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: cell.content.replace(/\n/g, '<br>').replace(/^# /gm, '<h1 class="text-2xl font-bold mb-2">').replace(/<h1 class="text-2xl font-bold mb-2">([^<]+)<br>/, '<h1 class="text-2xl font-bold mb-4">$1</h1>') }} />
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
                <div className="border-t border-gray-200 dark:border-slate-700">
                  <div className="px-4 py-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-slate-500">OUTPUT</span>
                    </div>
                    <pre className="font-mono text-xs bg-gray-900 dark:bg-black text-gray-100 p-3 rounded overflow-x-auto">
{cell.output}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Info Box */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-6 h-6 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-cyan-900 dark:text-cyan-200 mb-2">
                  Monaco Editor + AI Templates
                </h3>
                <p className="text-sm text-cyan-800 dark:text-cyan-300 mb-3">
                  This notebook showcases VS Code-style editing with syntax highlighting, autocomplete, and AI-powered code templates.
                </p>
                <ul className="text-sm text-cyan-800 dark:text-cyan-300 space-y-1">
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
