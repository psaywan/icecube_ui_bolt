import yaml from 'js-yaml';

export interface WorkflowNode {
  id: string;
  type: string;
  data: {
    label: string;
    config: Record<string, any>;
  };
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export function generateAirflowYAML(nodes: WorkflowNode[], edges: WorkflowEdge[], pipelineName: string): string {
  const dag: any = {
    dag_id: pipelineName.toLowerCase().replace(/\s+/g, '_'),
    description: `Auto-generated pipeline: ${pipelineName}`,
    schedule_interval: null,
    start_date: new Date().toISOString().split('T')[0],
    catchup: false,
    default_args: {
      owner: 'icecube',
      retries: 1,
      retry_delay: '5m',
    },
    tasks: [],
  };

  nodes.forEach((node) => {
    const task: any = {
      task_id: node.id,
      operator: getOperatorType(node.type),
      ...generateTaskConfig(node),
    };

    const upstreamTasks = edges
      .filter((edge) => edge.target === node.id)
      .map((edge) => edge.source);

    if (upstreamTasks.length > 0) {
      task.depends_on = upstreamTasks;
    }

    dag.tasks.push(task);
  });

  return yaml.dump(dag, { indent: 2, lineWidth: -1 });
}

function getOperatorType(nodeType: string): string {
  const operatorMap: Record<string, string> = {
    'aws-s3-read': 'S3ToDataFrameOperator',
    'aws-s3-write': 'DataFrameToS3Operator',
    'aws-dynamodb-read': 'DynamoDBToDataFrameOperator',
    'aws-dynamodb-write': 'DataFrameToDynamoDBOperator',
    'aws-rds-read': 'RDSToDataFrameOperator',
    'aws-redshift-read': 'RedshiftToDataFrameOperator',
    'aws-redshift-write': 'DataFrameToRedshiftOperator',
    'aws-glue': 'GlueJobOperator',
    'aws-glue-crawler': 'GlueCrawlerOperator',
    'azure-blob-read': 'BlobToDataFrameOperator',
    'azure-blob-write': 'DataFrameToBlobOperator',
    'azure-sql-read': 'AzureSQLToDataFrameOperator',
    'azure-data-factory': 'DataFactoryPipelineRunOperator',
    'gcp-gcs-read': 'GCSToDataFrameOperator',
    'gcp-gcs-write': 'DataFrameToGCSOperator',
    'gcp-bigquery-read': 'BigQueryToDataFrameOperator',
    'gcp-bigquery-write': 'DataFrameToBigQueryOperator',
    'gcp-dataflow': 'DataflowTemplatedJobStartOperator',
    'transform-filter': 'FilterOperator',
    'transform-aggregate': 'AggregateOperator',
    'transform-join': 'JoinOperator',
    'transform-select': 'SelectOperator',
    'custom-sql': 'SQLTransformOperator',
    'custom-python': 'PythonOperator',
    'custom-pyspark': 'PySparkOperator',
    'custom-scala': 'ScalaSparkOperator',
  };

  return operatorMap[nodeType] || 'BaseOperator';
}

function generateTaskConfig(node: WorkflowNode): Record<string, any> {
  const config: Record<string, any> = {};

  if (node.data.config) {
    Object.entries(node.data.config).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'jobParameters' && typeof value === 'string') {
          const params: Record<string, string> = {};
          value.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && trimmed.startsWith('--')) {
              const parts = trimmed.substring(2).split('=');
              if (parts.length === 2) {
                params[`--${parts[0].trim()}`] = parts[1].trim();
              }
            }
          });
          if (Object.keys(params).length > 0) {
            config['job_arguments'] = params;
          }
        } else if (key === 'useGitRepo') {
          config['use_git_repo'] = value;
        } else {
          config[key] = value;
        }
      }
    });
  }

  return config;
}

export function generatePipelinePreview(nodes: WorkflowNode[], edges: WorkflowEdge[]): string {
  if (nodes.length === 0) {
    return 'No nodes in pipeline';
  }

  let preview = 'Pipeline Flow:\n\n';

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const rootNodes = nodes.filter(
    (node) => !edges.some((edge) => edge.target === node.id)
  );

  rootNodes.forEach((node) => {
    preview += buildNodeTree(node, edges, nodeMap, 0);
  });

  return preview;
}

function buildNodeTree(
  node: WorkflowNode,
  edges: WorkflowEdge[],
  nodeMap: Map<string, WorkflowNode>,
  depth: number
): string {
  const indent = '  '.repeat(depth);
  let tree = `${indent}└─ ${node.data.label}\n`;

  const childEdges = edges.filter((edge) => edge.source === node.id);
  childEdges.forEach((edge) => {
    const childNode = nodeMap.get(edge.target);
    if (childNode) {
      tree += buildNodeTree(childNode, edges, nodeMap, depth + 1);
    }
  });

  return tree;
}
