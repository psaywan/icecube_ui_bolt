export interface NodeTypeDefinition {
  id: string;
  label: string;
  category: 'aws' | 'azure' | 'gcp' | 'transform' | 'custom';
  icon: string;
  color: string;
  description: string;
  config Fields: ConfigField[];
}

export interface ConfigField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'code';
  required: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: any;
  language?: string;
}

export const NODE_TYPES: NodeTypeDefinition[] = [
  {
    id: 'aws-s3-read',
    label: 'S3 Read',
    category: 'aws',
    icon: '🪣',
    color: '#FF9900',
    description: 'Read data from Amazon S3',
    configFields: [
      { name: 'bucket', label: 'S3 Bucket', type: 'text', required: true, placeholder: 'my-bucket' },
      { name: 'prefix', label: 'Prefix/Path', type: 'text', required: false, placeholder: 'data/' },
      { name: 'format', label: 'File Format', type: 'select', required: true, options: [
        { value: 'csv', label: 'CSV' },
        { value: 'json', label: 'JSON' },
        { value: 'parquet', label: 'Parquet' },
        { value: 'avro', label: 'Avro' },
      ]},
    ],
  },
  {
    id: 'aws-s3-write',
    label: 'S3 Write',
    category: 'aws',
    icon: '🪣',
    color: '#FF9900',
    description: 'Write data to Amazon S3',
    configFields: [
      { name: 'bucket', label: 'S3 Bucket', type: 'text', required: true, placeholder: 'my-bucket' },
      { name: 'prefix', label: 'Prefix/Path', type: 'text', required: false, placeholder: 'output/' },
      { name: 'format', label: 'File Format', type: 'select', required: true, options: [
        { value: 'csv', label: 'CSV' },
        { value: 'json', label: 'JSON' },
        { value: 'parquet', label: 'Parquet' },
        { value: 'avro', label: 'Avro' },
      ]},
      { name: 'mode', label: 'Write Mode', type: 'select', required: true, options: [
        { value: 'overwrite', label: 'Overwrite' },
        { value: 'append', label: 'Append' },
      ]},
    ],
  },
  {
    id: 'aws-dynamodb-read',
    label: 'DynamoDB Read',
    category: 'aws',
    icon: '🔷',
    color: '#527FFF',
    description: 'Read data from DynamoDB',
    configFields: [
      { name: 'table', label: 'Table Name', type: 'text', required: true, placeholder: 'my-table' },
      { name: 'region', label: 'AWS Region', type: 'text', required: true, placeholder: 'us-east-1' },
      { name: 'limit', label: 'Limit', type: 'number', required: false, placeholder: '1000' },
    ],
  },
  {
    id: 'aws-dynamodb-write',
    label: 'DynamoDB Write',
    category: 'aws',
    icon: '🔷',
    color: '#527FFF',
    description: 'Write data to DynamoDB',
    configFields: [
      { name: 'table', label: 'Table Name', type: 'text', required: true, placeholder: 'my-table' },
      { name: 'region', label: 'AWS Region', type: 'text', required: true, placeholder: 'us-east-1' },
    ],
  },
  {
    id: 'aws-rds-read',
    label: 'RDS Read',
    category: 'aws',
    icon: '🗄️',
    color: '#3B48CC',
    description: 'Read data from Amazon RDS',
    configFields: [
      { name: 'host', label: 'Host', type: 'text', required: true, placeholder: 'database.us-east-1.rds.amazonaws.com' },
      { name: 'port', label: 'Port', type: 'number', required: true, defaultValue: 5432 },
      { name: 'database', label: 'Database', type: 'text', required: true },
      { name: 'query', label: 'SQL Query', type: 'textarea', required: true, placeholder: 'SELECT * FROM table' },
    ],
  },
  {
    id: 'aws-redshift-read',
    label: 'Redshift Read',
    category: 'aws',
    icon: '🔴',
    color: '#8C4FFF',
    description: 'Read data from Amazon Redshift',
    configFields: [
      { name: 'host', label: 'Cluster Endpoint', type: 'text', required: true },
      { name: 'database', label: 'Database', type: 'text', required: true },
      { name: 'query', label: 'SQL Query', type: 'textarea', required: true, placeholder: 'SELECT * FROM table' },
    ],
  },
  {
    id: 'aws-redshift-write',
    label: 'Redshift Write',
    category: 'aws',
    icon: '🔴',
    color: '#8C4FFF',
    description: 'Write data to Amazon Redshift',
    configFields: [
      { name: 'host', label: 'Cluster Endpoint', type: 'text', required: true },
      { name: 'database', label: 'Database', type: 'text', required: true },
      { name: 'table', label: 'Table Name', type: 'text', required: true },
      { name: 'mode', label: 'Write Mode', type: 'select', required: true, options: [
        { value: 'overwrite', label: 'Overwrite' },
        { value: 'append', label: 'Append' },
      ]},
    ],
  },
  {
    id: 'aws-glue',
    label: 'AWS Glue Job',
    category: 'aws',
    icon: '🔗',
    color: '#DD344C',
    description: 'Run AWS Glue ETL Job with Git integration, custom parameters, and full resource configuration',
    configFields: [
      { name: 'jobName', label: 'Glue Job Name', type: 'text', required: true, placeholder: 'my-etl-job' },
      { name: 'jobDescription', label: 'Job Description', type: 'text', required: false, placeholder: 'ETL job description' },
      { name: 'glueVersion', label: 'Glue Version', type: 'select', required: true, options: [
        { value: '4.0', label: 'Glue 4.0' },
        { value: '3.0', label: 'Glue 3.0' },
        { value: '2.0', label: 'Glue 2.0' },
        { value: '1.0', label: 'Glue 1.0' },
      ], defaultValue: '4.0' },
      { name: 'workerType', label: 'Worker Type', type: 'select', required: true, options: [
        { value: 'G.1X', label: 'G.1X - 1 DPU (4 vCPU, 16 GB memory)' },
        { value: 'G.2X', label: 'G.2X - 2 DPU (8 vCPU, 32 GB memory)' },
        { value: 'G.4X', label: 'G.4X - 4 DPU (16 vCPU, 64 GB memory)' },
        { value: 'G.8X', label: 'G.8X - 8 DPU (32 vCPU, 128 GB memory)' },
        { value: 'Z.2X', label: 'Z.2X - 2 DPU with Ray (8 vCPU, 64 GB memory)' },
      ], defaultValue: 'G.1X' },
      { name: 'numberOfWorkers', label: 'Number of Workers', type: 'number', required: true, placeholder: '2', defaultValue: 2 },
      { name: 'maxRetries', label: 'Max Retries', type: 'number', required: false, placeholder: '0', defaultValue: 0 },
      { name: 'timeout', label: 'Timeout (minutes)', type: 'number', required: false, placeholder: '2880' },
      { name: 'useGitRepo', label: 'Use Git Repository', type: 'boolean', required: false, defaultValue: false },
      { name: 'gitRepoUrl', label: 'Git Repository URL', type: 'text', required: false, placeholder: 'https://github.com/username/repo.git' },
      { name: 'gitBranch', label: 'Git Branch', type: 'text', required: false, placeholder: 'main', defaultValue: 'main' },
      { name: 'gitFolder', label: 'Git Folder Path', type: 'text', required: false, placeholder: 'src/etl/' },
      { name: 'scriptLocation', label: 'Script Location (S3)', type: 'text', required: false, placeholder: 's3://bucket/scripts/job.py' },
      { name: 'pythonVersion', label: 'Python Version', type: 'select', required: false, options: [
        { value: '3', label: 'Python 3' },
        { value: '3.9', label: 'Python 3.9' },
      ], defaultValue: '3' },
      { name: 'extraPyFiles', label: 'Extra Python Files (S3)', type: 'text', required: false, placeholder: 's3://bucket/libs/module.zip' },
      { name: 'extraJars', label: 'Extra Jars (S3)', type: 'text', required: false, placeholder: 's3://bucket/jars/library.jar' },
      { name: 'sparkEventLogs', label: 'Spark Event Logs Path (S3)', type: 'text', required: false, placeholder: 's3://bucket/spark-logs/' },
      { name: 'tempDir', label: 'Temporary Directory (S3)', type: 'text', required: false, placeholder: 's3://bucket/temp/' },
      { name: 'jobParameters', label: 'Job Parameters (one per line: --key=value)', type: 'textarea', required: false, placeholder: '--input_path=s3://bucket/input/\n--output_path=s3://bucket/output/\n--date=2024-01-01\n--batch_size=1000' },
    ],
  },
  {
    id: 'aws-glue-crawler',
    label: 'AWS Glue Crawler',
    category: 'aws',
    icon: '🕷️',
    color: '#DD344C',
    description: 'Run AWS Glue Crawler to catalog data',
    configFields: [
      { name: 'crawlerName', label: 'Crawler Name', type: 'text', required: true, placeholder: 'my-data-crawler' },
      { name: 'databaseName', label: 'Glue Database Name', type: 'text', required: true, placeholder: 'my_database' },
      { name: 'dataSource', label: 'Data Source (S3 Path)', type: 'text', required: true, placeholder: 's3://bucket/data/' },
      { name: 'tablePrefix', label: 'Table Prefix', type: 'text', required: false, placeholder: 'raw_' },
      { name: 'recrawlPolicy', label: 'Recrawl Policy', type: 'select', required: true, options: [
        { value: 'CRAWL_EVERYTHING', label: 'Crawl Everything' },
        { value: 'CRAWL_NEW_FOLDERS_ONLY', label: 'Crawl New Folders Only' },
      ], defaultValue: 'CRAWL_NEW_FOLDERS_ONLY' },
      { name: 'schemaChangePolicy', label: 'Schema Change Policy', type: 'select', required: true, options: [
        { value: 'UPDATE_IN_DATABASE', label: 'Update in Database' },
        { value: 'LOG', label: 'Log Changes' },
      ], defaultValue: 'UPDATE_IN_DATABASE' },
    ],
  },
  {
    id: 'azure-blob-read',
    label: 'Blob Storage Read',
    category: 'azure',
    icon: '☁️',
    color: '#0078D4',
    description: 'Read data from Azure Blob Storage',
    configFields: [
      { name: 'container', label: 'Container Name', type: 'text', required: true },
      { name: 'path', label: 'Blob Path', type: 'text', required: false, placeholder: 'data/' },
      { name: 'format', label: 'File Format', type: 'select', required: true, options: [
        { value: 'csv', label: 'CSV' },
        { value: 'json', label: 'JSON' },
        { value: 'parquet', label: 'Parquet' },
      ]},
    ],
  },
  {
    id: 'azure-blob-write',
    label: 'Blob Storage Write',
    category: 'azure',
    icon: '☁️',
    color: '#0078D4',
    description: 'Write data to Azure Blob Storage',
    configFields: [
      { name: 'container', label: 'Container Name', type: 'text', required: true },
      { name: 'path', label: 'Blob Path', type: 'text', required: false, placeholder: 'output/' },
      { name: 'format', label: 'File Format', type: 'select', required: true, options: [
        { value: 'csv', label: 'CSV' },
        { value: 'json', label: 'JSON' },
        { value: 'parquet', label: 'Parquet' },
      ]},
    ],
  },
  {
    id: 'azure-sql-read',
    label: 'Azure SQL Read',
    category: 'azure',
    icon: '💾',
    color: '#00BCF2',
    description: 'Read data from Azure SQL Database',
    configFields: [
      { name: 'server', label: 'Server', type: 'text', required: true },
      { name: 'database', label: 'Database', type: 'text', required: true },
      { name: 'query', label: 'SQL Query', type: 'textarea', required: true },
    ],
  },
  {
    id: 'azure-data-factory',
    label: 'Data Factory',
    category: 'azure',
    icon: '🏭',
    color: '#0078D4',
    description: 'Trigger Azure Data Factory Pipeline',
    configFields: [
      { name: 'pipelineName', label: 'Pipeline Name', type: 'text', required: true },
      { name: 'resourceGroup', label: 'Resource Group', type: 'text', required: true },
      { name: 'factoryName', label: 'Factory Name', type: 'text', required: true },
    ],
  },
  {
    id: 'gcp-gcs-read',
    label: 'GCS Read',
    category: 'gcp',
    icon: '🌐',
    color: '#4285F4',
    description: 'Read data from Google Cloud Storage',
    configFields: [
      { name: 'bucket', label: 'GCS Bucket', type: 'text', required: true },
      { name: 'prefix', label: 'Prefix/Path', type: 'text', required: false },
      { name: 'format', label: 'File Format', type: 'select', required: true, options: [
        { value: 'csv', label: 'CSV' },
        { value: 'json', label: 'JSON' },
        { value: 'parquet', label: 'Parquet' },
      ]},
    ],
  },
  {
    id: 'gcp-gcs-write',
    label: 'GCS Write',
    category: 'gcp',
    icon: '🌐',
    color: '#4285F4',
    description: 'Write data to Google Cloud Storage',
    configFields: [
      { name: 'bucket', label: 'GCS Bucket', type: 'text', required: true },
      { name: 'prefix', label: 'Prefix/Path', type: 'text', required: false },
      { name: 'format', label: 'File Format', type: 'select', required: true, options: [
        { value: 'csv', label: 'CSV' },
        { value: 'json', label: 'JSON' },
        { value: 'parquet', label: 'Parquet' },
      ]},
    ],
  },
  {
    id: 'gcp-bigquery-read',
    label: 'BigQuery Read',
    category: 'gcp',
    icon: '📊',
    color: '#669DF6',
    description: 'Read data from Google BigQuery',
    configFields: [
      { name: 'project', label: 'Project ID', type: 'text', required: true },
      { name: 'dataset', label: 'Dataset', type: 'text', required: true },
      { name: 'query', label: 'SQL Query', type: 'textarea', required: true },
    ],
  },
  {
    id: 'gcp-bigquery-write',
    label: 'BigQuery Write',
    category: 'gcp',
    icon: '📊',
    color: '#669DF6',
    description: 'Write data to Google BigQuery',
    configFields: [
      { name: 'project', label: 'Project ID', type: 'text', required: true },
      { name: 'dataset', label: 'Dataset', type: 'text', required: true },
      { name: 'table', label: 'Table', type: 'text', required: true },
      { name: 'mode', label: 'Write Mode', type: 'select', required: true, options: [
        { value: 'overwrite', label: 'Overwrite' },
        { value: 'append', label: 'Append' },
      ]},
    ],
  },
  {
    id: 'gcp-dataflow',
    label: 'Dataflow',
    category: 'gcp',
    icon: '🌊',
    color: '#4285F4',
    description: 'Run Google Dataflow Job',
    configFields: [
      { name: 'jobName', label: 'Job Name', type: 'text', required: true },
      { name: 'template', label: 'Template Path', type: 'text', required: true },
      { name: 'parameters', label: 'Parameters (JSON)', type: 'textarea', required: false },
    ],
  },
  {
    id: 'transform-filter',
    label: 'Filter',
    category: 'transform',
    icon: '🔍',
    color: '#10B981',
    description: 'Filter rows based on condition',
    configFields: [
      { name: 'condition', label: 'Filter Condition', type: 'textarea', required: true, placeholder: 'column > 100' },
    ],
  },
  {
    id: 'transform-aggregate',
    label: 'Aggregate',
    category: 'transform',
    icon: '📊',
    color: '#10B981',
    description: 'Aggregate data (GROUP BY)',
    configFields: [
      { name: 'groupBy', label: 'Group By Columns', type: 'text', required: true, placeholder: 'col1, col2' },
      { name: 'aggregations', label: 'Aggregations', type: 'textarea', required: true, placeholder: 'SUM(amount), COUNT(*)' },
    ],
  },
  {
    id: 'transform-join',
    label: 'Join',
    category: 'transform',
    icon: '🔗',
    color: '#10B981',
    description: 'Join two datasets',
    configFields: [
      { name: 'joinType', label: 'Join Type', type: 'select', required: true, options: [
        { value: 'inner', label: 'Inner Join' },
        { value: 'left', label: 'Left Join' },
        { value: 'right', label: 'Right Join' },
        { value: 'outer', label: 'Full Outer Join' },
      ]},
      { name: 'leftKey', label: 'Left Key', type: 'text', required: true },
      { name: 'rightKey', label: 'Right Key', type: 'text', required: true },
    ],
  },
  {
    id: 'transform-select',
    label: 'Select Columns',
    category: 'transform',
    icon: '✅',
    color: '#10B981',
    description: 'Select specific columns',
    configFields: [
      { name: 'columns', label: 'Columns', type: 'text', required: true, placeholder: 'col1, col2, col3' },
    ],
  },
  {
    id: 'custom-sql',
    label: 'SQL Transform',
    category: 'custom',
    icon: '💻',
    color: '#8B5CF6',
    description: 'Custom SQL transformation',
    configFields: [
      { name: 'sql', label: 'SQL Query', type: 'code', required: true, placeholder: 'SELECT * FROM input_table WHERE...', language: 'sql' },
    ],
  },
  {
    id: 'custom-python',
    label: 'Python Script',
    category: 'custom',
    icon: '🐍',
    color: '#3776AB',
    description: 'Custom Python transformation',
    configFields: [
      { name: 'code', label: 'Python Code', type: 'code', required: true, placeholder: 'def transform(df):\n    # Your code here\n    return df', language: 'python' },
    ],
  },
  {
    id: 'custom-pyspark',
    label: 'PySpark Script',
    category: 'custom',
    icon: '⚡',
    color: '#E25A1C',
    description: 'Custom PySpark transformation',
    configFields: [
      { name: 'code', label: 'PySpark Code', type: 'code', required: true, placeholder: 'from pyspark.sql import functions as F\n\ndef transform(spark, df):\n    # Your PySpark code here\n    result = df.filter(F.col("status") == "active")\n    return result', language: 'python' },
    ],
  },
  {
    id: 'custom-scala',
    label: 'Scala Script',
    category: 'custom',
    icon: '🔴',
    color: '#DC322F',
    description: 'Custom Scala/Spark transformation',
    configFields: [
      { name: 'code', label: 'Scala Code', type: 'code', required: true, placeholder: 'import org.apache.spark.sql.functions._\n\ndef transform(df: DataFrame): DataFrame = {\n  // Your Scala/Spark code here\n  df.filter(col("status") === "active")\n}', language: 'scala' },
    ],
  },
];

export const NODE_CATEGORIES = [
  { id: 'aws', label: 'AWS Services', color: '#FF9900' },
  { id: 'azure', label: 'Azure Services', color: '#0078D4' },
  { id: 'gcp', label: 'GCP Services', color: '#4285F4' },
  { id: 'transform', label: 'Transformations', color: '#10B981' },
  { id: 'custom', label: 'Custom Code', color: '#8B5CF6' },
];
