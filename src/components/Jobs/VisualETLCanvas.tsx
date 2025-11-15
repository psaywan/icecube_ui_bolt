import { useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Save, Play, FileJson } from 'lucide-react';
import NodePalette from './NodePalette';
import CustomSourceNode from './nodes/CustomSourceNode';
import CustomTransformNode from './nodes/CustomTransformNode';
import CustomTargetNode from './nodes/CustomTargetNode';
import CustomCloudServiceNode from './nodes/CustomCloudServiceNode';

const nodeTypes = {
  source: CustomSourceNode,
  transform: CustomTransformNode,
  target: CustomTargetNode,
  cloudService: CustomCloudServiceNode,
};

interface VisualETLCanvasProps {
  pipelineName: string;
  onSave: (data: any) => void;
  onGenerate: () => void;
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

export default function VisualETLCanvas({
  pipelineName,
  onSave,
  onGenerate,
  initialNodes = [],
  initialEdges = [],
}: VisualETLCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showPalette, setShowPalette] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const addNode = useCallback(
    (type: string, nodeData: any) => {
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 300 + 100,
        },
        data: nodeData,
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const handleSave = () => {
    const workflowData = {
      nodes,
      edges,
      name: pipelineName,
      timestamp: new Date().toISOString(),
    };
    onSave(workflowData);
  };

  const handleExportJSON = () => {
    const workflowData = { nodes, edges };
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pipelineName.replace(/\s+/g, '_')}_workflow.json`;
    a.click();
  };

  return (
    <div className="h-[700px] bg-gray-50 rounded-xl border-2 border-gray-200 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <button
          onClick={() => setShowPalette(!showPalette)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add Nodes</span>
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-700 transition flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span className="text-sm font-medium">Save</span>
        </button>
        <button
          onClick={onGenerate}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-md hover:from-purple-600 hover:to-pink-600 transition flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span className="text-sm font-medium">Generate Code</span>
        </button>
        <button
          onClick={handleExportJSON}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition flex items-center space-x-2"
        >
          <FileJson className="w-4 h-4" />
          <span className="text-sm font-medium">Export JSON</span>
        </button>
      </div>

      {showPalette && (
        <div className="absolute top-4 right-4 z-10">
          <NodePalette onAddNode={addNode} />
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Controls className="bg-white border border-gray-300 rounded-lg shadow-md" />
        <MiniMap
          className="bg-white border border-gray-300 rounded-lg shadow-md"
          zoomable
          pannable
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#cbd5e1" />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-12 h-12 text-cyan-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Build Your ETL Workflow</h3>
            <p className="text-gray-600">
              Click "Add Nodes" to start adding sources, transformations, and targets
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
