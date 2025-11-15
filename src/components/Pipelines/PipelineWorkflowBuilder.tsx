import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Save, Play, Eye, X, Edit3, Check } from 'lucide-react';
import { NODE_TYPES, NODE_CATEGORIES } from './nodeTypes';
import { generateAirflowYAML, generatePipelinePreview } from './yamlGenerator';
import NodeConfigModal from './NodeConfigModal';

interface PipelineWorkflowBuilderProps {
  pipelineName: string;
  onSave: (workflow: any, yaml: string) => void;
  onClose: () => void;
  initialWorkflow?: any;
}

export default function PipelineWorkflowBuilder({
  pipelineName,
  onSave,
  onClose,
  initialWorkflow,
}: PipelineWorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialWorkflow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialWorkflow?.edges || []);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showYamlPreview, setShowYamlPreview] = useState(false);
  const [generatedYaml, setGeneratedYaml] = useState('');
  const [isEditingYaml, setIsEditingYaml] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      const nodeType = NODE_TYPES.find((n) => n.id === type);
      if (!nodeType) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'default',
        position,
        data: {
          label: nodeType.label,
          config: {},
          nodeType: type,
        },
        style: {
          background: nodeType.color,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px',
          fontWeight: 'bold',
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setSelectedNode(newNode);
      setShowConfigModal(true);
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      setShowConfigModal(true);
    },
    []
  );

  const handleNodeConfigSave = (config: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, config } }
          : node
      )
    );
    setShowConfigModal(false);
    setSelectedNode(null);
  };

  const handleGenerateYAML = () => {
    const yaml = generateAirflowYAML(nodes as any, edges, pipelineName);
    setGeneratedYaml(yaml);
    setIsEditingYaml(false);
    setShowYamlPreview(true);
  };

  const handleSavePipeline = () => {
    const yaml = isEditingYaml ? generatedYaml : generateAirflowYAML(nodes as any, edges, pipelineName);
    onSave({ nodes, edges }, yaml);
  };

  const handleSaveYamlFromPreview = () => {
    onSave({ nodes, edges }, generatedYaml);
    setShowYamlPreview(false);
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{pipelineName} - Workflow Builder</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleGenerateYAML}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Preview YAML</span>
            </button>
            <button
              onClick={handleSavePipeline}
              className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-600 transition flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Pipeline</span>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 border-r border-gray-200 overflow-y-auto p-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Node Types</h3>
            {NODE_CATEGORIES.map((category) => (
              <div key={category.id} className="mb-4">
                <button
                  onClick={() =>
                    setSelectedCategory(selectedCategory === category.id ? null : category.id)
                  }
                  className="w-full text-left px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition"
                >
                  {category.label}
                </button>
                {selectedCategory === category.id && (
                  <div className="mt-2 space-y-1 pl-2">
                    {NODE_TYPES.filter((node) => node.category === category.id).map((nodeType) => (
                      <div
                        key={nodeType.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, nodeType.id)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg cursor-move hover:shadow-md transition"
                        style={{ borderLeftWidth: '4px', borderLeftColor: nodeType.color }}
                      >
                        <span className="text-lg">{nodeType.icon}</span>
                        <span className="text-gray-900 font-medium">{nodeType.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex-1" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeDoubleClick={onNodeDoubleClick}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          </div>
        </div>

        {showConfigModal && selectedNode && (
          <NodeConfigModal
            node={selectedNode}
            onSave={handleNodeConfigSave}
            onClose={() => {
              setShowConfigModal(false);
              setSelectedNode(null);
            }}
          />
        )}

        {showYamlPreview && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-bold">
                    {isEditingYaml ? 'Edit YAML Configuration' : 'Generated Airflow YAML'}
                  </h3>
                  {isEditingYaml && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      Editing Mode
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {!isEditingYaml ? (
                    <button
                      onClick={() => setIsEditingYaml(true)}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center space-x-2 text-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveYamlFromPreview}
                      className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center space-x-2 text-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowYamlPreview(false);
                      setIsEditingYaml(false);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {isEditingYaml ? (
                <textarea
                  value={generatedYaml}
                  onChange={(e) => setGeneratedYaml(e.target.value)}
                  className="p-4 bg-gray-900 text-green-400 flex-1 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  spellCheck={false}
                />
              ) : (
                <pre className="p-4 bg-gray-900 text-green-400 overflow-auto flex-1 text-sm font-mono">
                  {generatedYaml}
                </pre>
              )}
              {isEditingYaml && (
                <div className="p-3 bg-yellow-50 border-t border-yellow-200 text-xs text-yellow-800">
                  <strong>Note:</strong> Manual edits will be saved with the pipeline. Make sure your YAML is valid.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
