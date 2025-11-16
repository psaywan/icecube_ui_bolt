import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FileCode, Play, Zap, Database, Repeat } from 'lucide-react';

interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'pipeline' | 'block';
  blockType?: 'data_loader' | 'transformer' | 'data_exporter' | 'sensor';
  children?: TreeNode[];
  language?: string;
  status?: 'idle' | 'running' | 'success' | 'error';
  lastRun?: Date;
}

interface TreePipelineNavigatorProps {
  onSelectNode: (node: TreeNode) => void;
  selectedNodeId?: string;
}

export default function TreePipelineNavigator({ onSelectNode, selectedNodeId }: TreePipelineNavigatorProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root', 'pipeline-1', 'pipeline-2']));

  const treeData: TreeNode[] = [
    {
      id: 'root',
      name: 'Pipelines',
      type: 'folder',
      children: [
        {
          id: 'pipeline-1',
          name: 'customer_data_etl',
          type: 'pipeline',
          status: 'success',
          lastRun: new Date('2024-11-16T10:30:00'),
          children: [
            {
              id: 'block-1-1',
              name: 'load_from_postgres',
              type: 'block',
              blockType: 'data_loader',
              language: 'python',
              status: 'success'
            },
            {
              id: 'block-1-2',
              name: 'clean_customer_data',
              type: 'block',
              blockType: 'transformer',
              language: 'python',
              status: 'success'
            },
            {
              id: 'block-1-3',
              name: 'enrich_with_demographics',
              type: 'block',
              blockType: 'transformer',
              language: 'python',
              status: 'success'
            },
            {
              id: 'block-1-4',
              name: 'export_to_snowflake',
              type: 'block',
              blockType: 'data_exporter',
              language: 'python',
              status: 'success'
            }
          ]
        },
        {
          id: 'pipeline-2',
          name: 'sales_analytics',
          type: 'pipeline',
          status: 'running',
          lastRun: new Date(),
          children: [
            {
              id: 'block-2-1',
              name: 'load_sales_data',
              type: 'block',
              blockType: 'data_loader',
              language: 'sql',
              status: 'success'
            },
            {
              id: 'block-2-2',
              name: 'aggregate_metrics',
              type: 'block',
              blockType: 'transformer',
              language: 'python',
              status: 'running'
            },
            {
              id: 'block-2-3',
              name: 'calculate_kpis',
              type: 'block',
              blockType: 'transformer',
              language: 'python',
              status: 'idle'
            }
          ]
        },
        {
          id: 'pipeline-3',
          name: 'ml_feature_pipeline',
          type: 'pipeline',
          status: 'error',
          lastRun: new Date('2024-11-16T09:00:00'),
          children: [
            {
              id: 'block-3-1',
              name: 'load_raw_features',
              type: 'block',
              blockType: 'data_loader',
              language: 'python',
              status: 'success'
            },
            {
              id: 'block-3-2',
              name: 'feature_engineering',
              type: 'block',
              blockType: 'transformer',
              language: 'python',
              status: 'error'
            }
          ]
        },
        {
          id: 'folder-1',
          name: 'archived',
          type: 'folder',
          children: [
            {
              id: 'pipeline-4',
              name: 'legacy_etl',
              type: 'pipeline',
              status: 'idle',
              lastRun: new Date('2024-10-01T12:00:00'),
              children: []
            }
          ]
        }
      ]
    }
  ];

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getBlockIcon = (blockType?: string) => {
    switch (blockType) {
      case 'data_loader':
        return <Database className="w-4 h-4 text-green-500" />;
      case 'transformer':
        return <Repeat className="w-4 h-4 text-blue-500" />;
      case 'data_exporter':
        return <Upload className="w-4 h-4 text-purple-500" />;
      case 'sensor':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      default:
        return <FileCode className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusIndicator = (status?: string) => {
    switch (status) {
      case 'running':
        return <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />;
      case 'success':
        return <span className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'error':
        return <span className="w-2 h-2 bg-red-500 rounded-full" />;
      default:
        return <span className="w-2 h-2 bg-gray-300 dark:bg-slate-600 rounded-full" />;
    }
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = node.id === selectedNodeId;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center space-x-2 px-3 py-2 cursor-pointer rounded-lg transition-colors ${
            isSelected
              ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
              : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300'
          }`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.id);
            }
            onSelectNode(node);
          }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          {!hasChildren && <div className="w-4" />}

          <div className="flex-shrink-0">
            {node.type === 'folder' && <Folder className="w-4 h-4 text-yellow-500" />}
            {node.type === 'pipeline' && <Play className="w-4 h-4 text-cyan-500" />}
            {node.type === 'block' && getBlockIcon(node.blockType)}
          </div>

          <span className="flex-1 text-sm truncate">{node.name}</span>

          {node.language && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
              {node.language}
            </span>
          )}

          {node.status && (
            <div className="flex-shrink-0">
              {getStatusIndicator(node.status)}
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Pipeline Navigator</h3>
        <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Browse and select pipelines and blocks</p>
      </div>

      <div className="p-3 max-h-[600px] overflow-y-auto">
        {treeData.map((node) => renderNode(node))}
      </div>

      <div className="bg-gray-50 dark:bg-slate-800 px-4 py-3 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Success</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Running</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              <span>Error</span>
            </div>
          </div>
          <span>3 pipelines</span>
        </div>
      </div>
    </div>
  );
}

function Upload({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}
