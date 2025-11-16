import { Database, Repeat, Upload, Zap, FileCode, GitBranch, BarChart3, Brain } from 'lucide-react';

export interface NotebookBlockTemplate {
  id: string;
  name: string;
  category: 'loader' | 'transformer' | 'exporter' | 'sensor' | 'api' | 'analytics' | 'functions';
  subcategory?: string;
  description: string;
  language: 'python' | 'sql' | 'r';
  code: string;
  icon: any;
  tags: string[];
}

export const notebookTemplates: NotebookBlockTemplate[] = [
  {
    id: 'postgres_loader',
    name: 'Load from PostgreSQL',
    category: 'loader',
    subcategory: 'Databases',
    description: 'Load data from PostgreSQL database',
    language: 'python',
    icon: Database,
    tags: ['sql', 'database', 'postgres'],
    code: `import psycopg2
import pandas as pd

# Database connection configuration
config = {
    'host': 'your-host.rds.amazonaws.com',
    'port': 5432,
    'database': 'your_database',
    'user': 'your_username',
    'password': 'your_password'
}

# SQL query
query = """
SELECT *
FROM your_table
WHERE created_at >= '2024-01-01'
LIMIT 1000
"""

# Connect and load data
conn = psycopg2.connect(**config)
df = pd.read_sql(query, conn)
conn.close()

print(f"Loaded {len(df)} rows")
df.head()`
  },
  {
    id: 's3_loader',
    name: 'Load from S3',
    category: 'loader',
    subcategory: 'Data Lakes',
    description: 'Load CSV/Parquet files from AWS S3',
    language: 'python',
    icon: Upload,
    tags: ['aws', 's3', 'cloud'],
    code: `import boto3
import pandas as pd
from io import StringIO, BytesIO

# S3 Configuration
s3_client = boto3.client('s3',
    aws_access_key_id='YOUR_ACCESS_KEY',
    aws_secret_access_key='YOUR_SECRET_KEY',
    region_name='us-east-1'
)

bucket_name = 'your-bucket-name'
file_key = 'path/to/your/file.csv'

# Load CSV from S3
obj = s3_client.get_object(Bucket=bucket_name, Key=file_key)
df = pd.read_csv(StringIO(obj['Body'].read().decode('utf-8')))

# For Parquet files, use:
# obj = s3_client.get_object(Bucket=bucket_name, Key=file_key)
# df = pd.read_parquet(BytesIO(obj['Body'].read()))

print(f"Loaded {len(df)} rows from S3")
df.head()`
  },
  {
    id: 'api_loader',
    name: 'Load from REST API',
    category: 'loader',
    subcategory: 'API',
    description: 'Fetch data from REST API with pagination',
    language: 'python',
    icon: GitBranch,
    tags: ['api', 'rest', 'http'],
    code: `import requests
import pandas as pd

# API Configuration
api_url = 'https://api.example.com/data'
headers = {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
}

params = {
    'page': 1,
    'limit': 100
}

# Fetch data with pagination
all_data = []
while True:
    response = requests.get(api_url, headers=headers, params=params)
    response.raise_for_status()

    data = response.json()
    if not data.get('results'):
        break

    all_data.extend(data['results'])
    params['page'] += 1

    if params['page'] > 10:  # Safety limit
        break

# Convert to DataFrame
df = pd.DataFrame(all_data)
print(f"Loaded {len(df)} records from API")
df.head()`
  },
  {
    id: 'clean_data',
    name: 'Clean & Standardize Data',
    category: 'transformer',
    subcategory: 'Data Cleaning',
    description: 'Clean missing values, duplicates, and standardize formats',
    language: 'python',
    icon: Repeat,
    tags: ['cleaning', 'preprocessing'],
    code: `import pandas as pd
import numpy as np

# Assume 'df' is your input DataFrame

# 1. Remove duplicates
print(f"Original rows: {len(df)}")
df = df.drop_duplicates()
print(f"After deduplication: {len(df)}")

# 2. Handle missing values
# Drop columns with >50% missing data
missing_pct = df.isnull().sum() / len(df)
df = df.drop(columns=missing_pct[missing_pct > 0.5].index)

# Fill numeric columns with median
numeric_cols = df.select_dtypes(include=[np.number]).columns
df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

# Fill categorical with mode
categorical_cols = df.select_dtypes(include=['object']).columns
for col in categorical_cols:
    if df[col].mode().shape[0] > 0:
        df[col].fillna(df[col].mode()[0], inplace=True)

# 3. Standardize string columns
for col in categorical_cols:
    df[col] = df[col].str.strip().str.lower()

# 4. Remove outliers (optional)
# Using IQR method for numeric columns
for col in numeric_cols:
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1
    df = df[(df[col] >= Q1 - 1.5*IQR) & (df[col] <= Q3 + 1.5*IQR)]

print(f"Final rows: {len(df)}")
df.head()`
  },
  {
    id: 'feature_engineering',
    name: 'Feature Engineering',
    category: 'transformer',
    subcategory: 'ML Preparation',
    description: 'Create new features from existing data',
    language: 'python',
    icon: Brain,
    tags: ['ml', 'features', 'engineering'],
    code: `import pandas as pd
import numpy as np
from datetime import datetime

# Assume 'df' is your input DataFrame

# 1. Date/Time Features
if 'timestamp' in df.columns:
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['year'] = df['timestamp'].dt.year
    df['month'] = df['timestamp'].dt.month
    df['day'] = df['timestamp'].dt.day
    df['dayofweek'] = df['timestamp'].dt.dayofweek
    df['hour'] = df['timestamp'].dt.hour
    df['is_weekend'] = df['dayofweek'].isin([5, 6]).astype(int)
    df['quarter'] = df['timestamp'].dt.quarter

# 2. Numeric Transformations
numeric_cols = df.select_dtypes(include=[np.number]).columns[:5]

# Log transformation (handle zeros)
for col in numeric_cols:
    if (df[col] > 0).all():
        df[f'{col}_log'] = np.log1p(df[col])

# Polynomial features
for col in numeric_cols[:3]:
    df[f'{col}_squared'] = df[col] ** 2
    df[f'{col}_sqrt'] = np.sqrt(np.abs(df[col]))

# 3. Interaction Features
if len(numeric_cols) >= 2:
    df['interaction_1'] = df[numeric_cols[0]] * df[numeric_cols[1]]
    df['ratio_1'] = df[numeric_cols[0]] / (df[numeric_cols[1]] + 1e-8)

# 4. Binning
for col in numeric_cols[:2]:
    df[f'{col}_binned'] = pd.qcut(df[col], q=5, labels=['very_low', 'low', 'medium', 'high', 'very_high'], duplicates='drop')

# 5. One-Hot Encoding
categorical_cols = df.select_dtypes(include=['object']).columns[:3]
df = pd.get_dummies(df, columns=categorical_cols, prefix=categorical_cols)

print(f"Features created! Total columns: {len(df.columns)}")
df.head()`
  },
  {
    id: 'aggregation',
    name: 'Aggregate & Group Data',
    category: 'transformer',
    subcategory: 'Analytics',
    description: 'Perform group by aggregations',
    language: 'python',
    icon: BarChart3,
    tags: ['aggregation', 'groupby', 'analytics'],
    code: `import pandas as pd
import numpy as np

# Assume 'df' is your input DataFrame

# Define grouping columns
group_cols = ['category', 'region']  # Modify as needed

# Aggregate metrics
aggregated = df.groupby(group_cols).agg({
    'sales': ['sum', 'mean', 'median', 'count'],
    'quantity': ['sum', 'mean'],
    'price': ['mean', 'min', 'max'],
}).reset_index()

# Flatten column names
aggregated.columns = ['_'.join(col).strip('_') for col in aggregated.columns.values]

# Calculate additional metrics
aggregated['avg_transaction_value'] = aggregated['sales_sum'] / aggregated['sales_count']

# Add percentage columns
total_sales = aggregated['sales_sum'].sum()
aggregated['sales_pct'] = (aggregated['sales_sum'] / total_sales) * 100

# Sort by sales
aggregated = aggregated.sort_values('sales_sum', ascending=False)

print(f"Aggregated to {len(aggregated)} groups")
aggregated.head()`
  },
  {
    id: 'export_postgres',
    name: 'Export to PostgreSQL',
    category: 'exporter',
    subcategory: 'Databases',
    description: 'Export data to PostgreSQL database',
    language: 'python',
    icon: Database,
    tags: ['sql', 'database', 'export'],
    code: `import psycopg2
from psycopg2.extras import execute_values
import pandas as pd

# Assume 'df' is your output DataFrame

# Database connection configuration
config = {
    'host': 'your-host.rds.amazonaws.com',
    'port': 5432,
    'database': 'your_database',
    'user': 'your_username',
    'password': 'your_password'
}

table_name = 'output_table'
if_exists = 'replace'  # 'replace', 'append', or 'fail'

# Connect and export
conn = psycopg2.connect(**config)

# Use pandas to_sql for simplicity
from sqlalchemy import create_engine
engine = create_engine(f"postgresql://{config['user']}:{config['password']}@{config['host']}:{config['port']}/{config['database']}")

df.to_sql(table_name, engine, if_exists=if_exists, index=False)

print(f"Exported {len(df)} rows to {table_name}")
conn.close()`
  },
  {
    id: 'export_s3',
    name: 'Export to S3',
    category: 'exporter',
    subcategory: 'Data Lakes',
    description: 'Export data to AWS S3 as CSV or Parquet',
    language: 'python',
    icon: Upload,
    tags: ['aws', 's3', 'export'],
    code: `import boto3
import pandas as pd
from io import StringIO, BytesIO
from datetime import datetime

# Assume 'df' is your output DataFrame

# S3 Configuration
s3_client = boto3.client('s3',
    aws_access_key_id='YOUR_ACCESS_KEY',
    aws_secret_access_key='YOUR_SECRET_KEY',
    region_name='us-east-1'
)

bucket_name = 'your-bucket-name'
timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

# Export as CSV
csv_key = f'exports/data_{timestamp}.csv'
csv_buffer = StringIO()
df.to_csv(csv_buffer, index=False)
s3_client.put_object(Bucket=bucket_name, Key=csv_key, Body=csv_buffer.getvalue())
print(f"Exported CSV to s3://{bucket_name}/{csv_key}")

# Export as Parquet (more efficient)
parquet_key = f'exports/data_{timestamp}.parquet'
parquet_buffer = BytesIO()
df.to_parquet(parquet_buffer, index=False)
s3_client.put_object(Bucket=bucket_name, Key=parquet_key, Body=parquet_buffer.getvalue())
print(f"Exported Parquet to s3://{bucket_name}/{parquet_key}")

print(f"Exported {len(df)} rows to S3")`
  },
  {
    id: 'data_quality_test',
    name: 'Data Quality Tests',
    category: 'sensor',
    subcategory: 'Testing',
    description: 'Validate data quality and integrity',
    language: 'python',
    icon: Zap,
    tags: ['testing', 'quality', 'validation'],
    code: `import pandas as pd
import numpy as np

# Assume 'df' is your DataFrame to test

def run_data_quality_tests(df):
    """Run comprehensive data quality checks"""
    results = {'passed': True, 'tests': []}

    # Test 1: Non-empty DataFrame
    test = {'name': 'Non-empty DataFrame', 'passed': len(df) > 0}
    if not test['passed']:
        test['message'] = f"DataFrame is empty"
    results['tests'].append(test)

    # Test 2: No duplicate rows
    duplicates = df.duplicated().sum()
    test = {'name': 'No duplicate rows', 'passed': duplicates == 0}
    if not test['passed']:
        test['message'] = f"Found {duplicates} duplicate rows"
    results['tests'].append(test)

    # Test 3: Required columns exist
    required_cols = ['id', 'created_at']  # Modify as needed
    missing_cols = [col for col in required_cols if col not in df.columns]
    test = {'name': 'Required columns present', 'passed': len(missing_cols) == 0}
    if not test['passed']:
        test['message'] = f"Missing columns: {missing_cols}"
    results['tests'].append(test)

    # Test 4: No excessive nulls
    null_pct = (df.isnull().sum() / len(df) * 100)
    high_null_cols = null_pct[null_pct > 10].index.tolist()
    test = {'name': 'Acceptable null percentage', 'passed': len(high_null_cols) == 0}
    if not test['passed']:
        test['message'] = f"Columns with >10% nulls: {high_null_cols}"
    results['tests'].append(test)

    # Test 5: Data types as expected
    expected_types = {
        'id': ['int64', 'object'],
        'amount': ['float64', 'int64']
    }
    for col, expected in expected_types.items():
        if col in df.columns:
            actual = str(df[col].dtype)
            test = {'name': f'Type check: {col}', 'passed': actual in expected}
            if not test['passed']:
                test['message'] = f"Expected {expected}, got {actual}"
            results['tests'].append(test)

    # Test 6: Value ranges
    if 'amount' in df.columns:
        invalid = df[(df['amount'] < 0) | (df['amount'] > 1000000)]
        test = {'name': 'Valid value ranges', 'passed': len(invalid) == 0}
        if not test['passed']:
            test['message'] = f"Found {len(invalid)} rows with invalid amounts"
        results['tests'].append(test)

    # Overall result
    results['passed'] = all(t['passed'] for t in results['tests'])

    return results

# Run tests
test_results = run_data_quality_tests(df)

# Print results
print("\\n" + "="*50)
print("DATA QUALITY TEST RESULTS")
print("="*50)
for test in test_results['tests']:
    status = "✓ PASS" if test['passed'] else "✗ FAIL"
    print(f"{status}: {test['name']}")
    if not test['passed']:
        print(f"  → {test.get('message', 'No details')}")

print("="*50)
print(f"Overall: {'PASSED' if test_results['passed'] else 'FAILED'}")
print("="*50 + "\\n")

# Raise error if tests failed
assert test_results['passed'], "Data quality tests failed!"`
  },
  {
    id: 'sql_query',
    name: 'SQL Query Block',
    category: 'loader',
    subcategory: 'SQL',
    description: 'Execute SQL query directly',
    language: 'sql',
    icon: Database,
    tags: ['sql', 'query'],
    code: `-- SQL Query Block
-- Connect to your data warehouse and run queries

SELECT
    customer_id,
    customer_name,
    email,
    SUM(order_amount) as total_spent,
    COUNT(*) as order_count,
    AVG(order_amount) as avg_order_value,
    MAX(order_date) as last_order_date
FROM
    orders o
    JOIN customers c ON o.customer_id = c.id
WHERE
    order_date >= CURRENT_DATE - INTERVAL '90 days'
    AND order_status = 'completed'
GROUP BY
    customer_id, customer_name, email
HAVING
    SUM(order_amount) > 1000
ORDER BY
    total_spent DESC
LIMIT 100;`
  }
];

export const getTemplatesByCategory = (category: string) => {
  return notebookTemplates.filter(t => t.category === category);
};

export const getTemplateById = (id: string) => {
  return notebookTemplates.find(t => t.id === id);
};

export const getAllCategories = () => {
  return Array.from(new Set(notebookTemplates.map(t => t.category)));
};
