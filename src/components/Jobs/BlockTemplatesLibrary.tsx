import { Database, Repeat, Upload, FileText, Brain, Check, TrendingUp, AlertTriangle } from 'lucide-react';

interface BlockTemplate {
  id: string;
  name: string;
  type: 'data_loader' | 'transformer' | 'data_exporter' | 'sensor' | 'conditional';
  category: string;
  description: string;
  code: string;
  icon: any;
  tags: string[];
  language: 'python' | 'sql' | 'r';
}

const blockTemplates: BlockTemplate[] = [
  {
    id: 'postgres_loader',
    name: 'PostgreSQL Data Loader',
    type: 'data_loader',
    category: 'Database',
    description: 'Load data from PostgreSQL with automatic connection pooling',
    icon: Database,
    tags: ['sql', 'database', 'postgres'],
    language: 'python',
    code: `import psycopg2
import pandas as pd

@data_loader
def load_from_postgres(*args, **kwargs):
    """
    Load data from PostgreSQL database
    """
    config = {
        'host': kwargs.get('host', 'localhost'),
        'port': kwargs.get('port', 5432),
        'database': kwargs.get('database'),
        'user': kwargs.get('user'),
        'password': kwargs.get('password'),
    }

    query = kwargs.get('query', 'SELECT * FROM table_name')

    conn = psycopg2.connect(**config)
    df = pd.read_sql(query, conn)
    conn.close()

    return df`
  },
  {
    id: 's3_loader',
    name: 'S3 Data Loader',
    type: 'data_loader',
    category: 'Cloud Storage',
    description: 'Load data from AWS S3 with automatic pagination',
    icon: Upload,
    tags: ['aws', 's3', 'cloud'],
    language: 'python',
    code: `import boto3
import pandas as pd
from io import StringIO

@data_loader
def load_from_s3(*args, **kwargs):
    """
    Load data from S3 bucket
    """
    s3_client = boto3.client('s3',
        aws_access_key_id=kwargs.get('access_key'),
        aws_secret_access_key=kwargs.get('secret_key'),
        region_name=kwargs.get('region', 'us-east-1')
    )

    bucket = kwargs.get('bucket')
    key = kwargs.get('key')

    obj = s3_client.get_object(Bucket=bucket, Key=key)
    data = obj['Body'].read().decode('utf-8')
    df = pd.read_csv(StringIO(data))

    return df`
  },
  {
    id: 'clean_missing',
    name: 'Clean Missing Values',
    type: 'transformer',
    category: 'Data Cleaning',
    description: 'Handle missing values with multiple strategies',
    icon: Repeat,
    tags: ['cleaning', 'null', 'imputation'],
    language: 'python',
    code: `import pandas as pd
import numpy as np

@transformer
def clean_missing_values(df, *args, **kwargs):
    """
    Clean missing values using specified strategy
    """
    strategy = kwargs.get('strategy', 'drop')
    threshold = kwargs.get('threshold', 0.5)

    if strategy == 'drop':
        # Drop columns with >threshold missing
        missing_pct = df.isnull().sum() / len(df)
        df = df.drop(columns=missing_pct[missing_pct > threshold].index)
        # Drop rows with any missing
        df = df.dropna()

    elif strategy == 'mean':
        # Fill numeric with mean
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())

    elif strategy == 'median':
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

    elif strategy == 'mode':
        # Fill with mode
        for col in df.columns:
            if df[col].isnull().any():
                df[col].fillna(df[col].mode()[0], inplace=True)

    return df`
  },
  {
    id: 'deduplicate',
    name: 'Remove Duplicates',
    type: 'transformer',
    category: 'Data Cleaning',
    description: 'Remove duplicate rows based on key columns',
    icon: Check,
    tags: ['deduplication', 'unique', 'cleaning'],
    language: 'python',
    code: `import pandas as pd

@transformer
def remove_duplicates(df, *args, **kwargs):
    """
    Remove duplicate rows
    """
    subset = kwargs.get('key_columns', None)
    keep = kwargs.get('keep', 'first')

    original_count = len(df)
    df = df.drop_duplicates(subset=subset, keep=keep)
    removed_count = original_count - len(df)

    print(f"Removed {removed_count} duplicate rows")

    return df`
  },
  {
    id: 'feature_engineering',
    name: 'Auto Feature Engineering',
    type: 'transformer',
    category: 'ML',
    description: 'Automatically generate useful features from existing data',
    icon: Brain,
    tags: ['ml', 'features', 'engineering'],
    language: 'python',
    code: `import pandas as pd
import numpy as np
from datetime import datetime

@transformer
def auto_feature_engineering(df, *args, **kwargs):
    """
    Auto-generate features
    """
    # Datetime features
    for col in df.select_dtypes(include=['datetime64']).columns:
        df[f'{col}_year'] = df[col].dt.year
        df[f'{col}_month'] = df[col].dt.month
        df[f'{col}_day'] = df[col].dt.day
        df[f'{col}_dayofweek'] = df[col].dt.dayofweek
        df[f'{col}_quarter'] = df[col].dt.quarter

    # Numeric interactions
    numeric_cols = df.select_dtypes(include=[np.number]).columns[:5]
    for i, col1 in enumerate(numeric_cols):
        for col2 in numeric_cols[i+1:]:
            df[f'{col1}_x_{col2}'] = df[col1] * df[col2]
            df[f'{col1}_div_{col2}'] = df[col1] / (df[col2] + 1e-8)

    return df`
  },
  {
    id: 'data_quality_check',
    name: 'Data Quality Tests',
    type: 'sensor',
    category: 'Testing',
    description: 'Comprehensive data quality checks and validation',
    icon: AlertTriangle,
    tags: ['testing', 'quality', 'validation'],
    language: 'python',
    code: `import pandas as pd
import numpy as np

@test
def test_data_quality(df, *args, **kwargs):
    """
    Run comprehensive data quality checks
    """
    results = {
        'passed': True,
        'checks': []
    }

    # Check 1: No null values in key columns
    key_cols = kwargs.get('key_columns', [])
    for col in key_cols:
        null_count = df[col].isnull().sum()
        results['checks'].append({
            'name': f'No nulls in {col}',
            'passed': null_count == 0,
            'message': f'Found {null_count} null values'
        })

    # Check 2: Expected row count
    min_rows = kwargs.get('min_rows', 0)
    row_count = len(df)
    results['checks'].append({
        'name': 'Row count check',
        'passed': row_count >= min_rows,
        'message': f'Found {row_count} rows, expected at least {min_rows}'
    })

    # Check 3: Column data types
    expected_types = kwargs.get('expected_types', {})
    for col, expected_type in expected_types.items():
        actual_type = str(df[col].dtype)
        results['checks'].append({
            'name': f'Type check for {col}',
            'passed': actual_type == expected_type,
            'message': f'Expected {expected_type}, got {actual_type}'
        })

    # Check 4: Value ranges
    value_ranges = kwargs.get('value_ranges', {})
    for col, (min_val, max_val) in value_ranges.items():
        in_range = df[col].between(min_val, max_val).all()
        results['checks'].append({
            'name': f'Range check for {col}',
            'passed': in_range,
            'message': f'All values should be between {min_val} and {max_val}'
        })

    results['passed'] = all(check['passed'] for check in results['checks'])

    return results`
  },
  {
    id: 'postgres_exporter',
    name: 'PostgreSQL Data Exporter',
    type: 'data_exporter',
    category: 'Database',
    description: 'Export data to PostgreSQL with upsert support',
    icon: Database,
    tags: ['sql', 'database', 'export'],
    language: 'python',
    code: `import psycopg2
from psycopg2.extras import execute_values
import pandas as pd

@data_exporter
def export_to_postgres(df, *args, **kwargs):
    """
    Export data to PostgreSQL
    """
    config = {
        'host': kwargs.get('host', 'localhost'),
        'port': kwargs.get('port', 5432),
        'database': kwargs.get('database'),
        'user': kwargs.get('user'),
        'password': kwargs.get('password'),
    }

    table_name = kwargs.get('table_name')
    if_exists = kwargs.get('if_exists', 'append')

    conn = psycopg2.connect(**config)

    df.to_sql(table_name, conn, if_exists=if_exists, index=False)

    conn.close()

    print(f"Exported {len(df)} rows to {table_name}")`
  },
  {
    id: 'snowflake_exporter',
    name: 'Snowflake Data Exporter',
    type: 'data_exporter',
    category: 'Data Warehouse',
    description: 'Export data to Snowflake with optimized bulk loading',
    icon: Upload,
    tags: ['snowflake', 'warehouse', 'export'],
    language: 'python',
    code: `import snowflake.connector
import pandas as pd

@data_exporter
def export_to_snowflake(df, *args, **kwargs):
    """
    Export data to Snowflake
    """
    conn = snowflake.connector.connect(
        user=kwargs.get('user'),
        password=kwargs.get('password'),
        account=kwargs.get('account'),
        warehouse=kwargs.get('warehouse'),
        database=kwargs.get('database'),
        schema=kwargs.get('schema')
    )

    table_name = kwargs.get('table_name')

    # Use COPY INTO for bulk loading
    cursor = conn.cursor()

    # Create temp file
    temp_file = '/tmp/data.csv'
    df.to_csv(temp_file, index=False)

    # Upload and copy
    cursor.execute(f"PUT file://{temp_file} @%{table_name}")
    cursor.execute(f"COPY INTO {table_name} FILE_FORMAT = (TYPE = CSV SKIP_HEADER = 1)")

    conn.close()

    print(f"Exported {len(df)} rows to {table_name}")`
  }
];

interface BlockTemplatesLibraryProps {
  onSelectTemplate: (template: BlockTemplate) => void;
  onClose: () => void;
}

export default function BlockTemplatesLibrary({ onSelectTemplate, onClose }: BlockTemplatesLibraryProps) {
  const categories = Array.from(new Set(blockTemplates.map(t => t.category)));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Block Templates Library</h2>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Pre-built blocks for common data operations</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-slate-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {categories.map(category => (
            <div key={category} className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blockTemplates.filter(t => t.category === category).map(template => {
                  const Icon = template.icon;
                  const typeColors = {
                    data_loader: 'bg-green-100 text-green-700 border-green-300',
                    transformer: 'bg-blue-100 text-blue-700 border-blue-300',
                    data_exporter: 'bg-purple-100 text-purple-700 border-purple-300',
                    sensor: 'bg-orange-100 text-orange-700 border-orange-300',
                    conditional: 'bg-yellow-100 text-yellow-700 border-yellow-300'
                  };

                  return (
                    <div
                      key={template.id}
                      onClick={() => onSelectTemplate(template)}
                      className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-lg hover:border-cyan-400 dark:hover:border-cyan-600 transition-all cursor-pointer bg-white dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${typeColors[template.type]}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
                          {template.language}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{template.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">{template.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-1 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
