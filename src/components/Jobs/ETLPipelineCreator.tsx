import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Layout, Edit3, Save, GripVertical } from 'lucide-react';
import { getCurrentUser } from '../../lib/auth';
import VisualETLCanvas from './VisualETLCanvas';
import ETLFormBuilder from './ETLFormBuilder';
import ETLAIChat from './ETLAIChat';

import { rdsApi } from '../../lib/rdsApi';
interface ETLPipelineCreatorProps {
  pipeline?: any;
  onBack: () => void;
}

export default function ETLPipelineCreator({ pipeline, onBack }: ETLPipelineCreatorProps) {
  const [mode, setMode] = useState<'visual' | 'form'>(pipeline?.mode || 'visual');
  const [pipelineName, setPipelineName] = useState(pipeline?.name || 'New ETL Pipeline');
  const [workflowData, setWorkflowData] = useState(pipeline?.workflow_data || { nodes: [], edges: [] });
  const [formData, setFormData] = useState({
    sources: pipeline?.sources || [],
    targets: pipeline?.targets || [],
    transformations: pipeline?.transformations || [],
    cloudServices: pipeline?.cloud_services || [],
  });
  const [saving, setSaving] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [leftWidth, setLeftWidth] = useState(60);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      if (newLeftWidth >= 30 && newLeftWidth <= 70) {
        setLeftWidth(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  const handleSave = async (autoSave = false) => {
    setSaving(true);
    try {
      const { user, error: authError } = await getCurrentUser();
      if (authError || !user) throw new Error('Not authenticated');

      const pipelineData = {
        user_id: user.id,
        name: pipelineName,
        description: '',
        mode,
        workflow_data: mode === 'visual' ? workflowData : { nodes: [], edges: [] },
        sources: mode === 'form' ? formData.sources : extractSourcesFromWorkflow(),
        targets: mode === 'form' ? formData.targets : extractTargetsFromWorkflow(),
        transformations: mode === 'form' ? formData.transformations : extractTransformationsFromWorkflow(),
        cloud_services: formData.cloudServices,
        status: 'draft',
      };

      if (pipeline?.id) {
        await rdsApi.etlPipelines.update(pipeline.id, pipelineData);
      } else {
        await rdsApi.etlPipelines.create(pipelineData);
      }

      if (!autoSave) {
        alert('Pipeline saved successfully!');
      }
    } catch (error: any) {
      console.error('Error saving pipeline:', error);
      alert('Error saving pipeline: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const extractSourcesFromWorkflow = () => {
    return workflowData.nodes
      .filter((node: any) => node.type === 'source')
      .map((node: any) => ({
        type: node.data.sourceType,
        label: node.data.label,
        config: node.data.config,
      }));
  };

  const extractTargetsFromWorkflow = () => {
    return workflowData.nodes
      .filter((node: any) => node.type === 'target')
      .map((node: any) => ({
        type: node.data.targetType,
        label: node.data.label,
        config: node.data.config,
      }));
  };

  const extractTransformationsFromWorkflow = () => {
    return workflowData.nodes
      .filter((node: any) => node.type === 'transform')
      .map((node: any) => ({
        type: node.data.transformType,
        label: node.data.label,
        description: node.data.description,
        config: node.data.config,
      }));
  };

  const handleAIMessage = async (message: string) => {
    setAiProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAiProcessing(false);
  };

  const handleGenerateCode = () => {
    alert('Code generation will be implemented here');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Pipelines</span>
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Pipeline'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-slate-700 dark:text-white text-sm"
                placeholder="Pipeline name"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMode('visual')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition text-sm ${
                  mode === 'visual'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                <Layout className="w-4 h-4" />
                <span>Visual Workflow</span>
              </button>
              <button
                onClick={() => setMode('form')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition text-sm ${
                  mode === 'form'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Form Builder</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 flex gap-0 relative overflow-hidden">
        <div
          className="flex flex-col overflow-hidden"
          style={{ width: `${leftWidth}%` }}
        >
          {mode === 'visual' ? (
            <VisualETLCanvas
              pipelineName={pipelineName}
              onSave={(data) => {
                setWorkflowData(data);
                handleSave(true);
              }}
              onGenerate={handleGenerateCode}
              initialNodes={workflowData.nodes}
              initialEdges={workflowData.edges}
            />
          ) : (
            <ETLFormBuilder
              formData={formData}
              onChange={setFormData}
              onSave={() => handleSave(false)}
            />
          )}
        </div>

        <div
          className="w-1 bg-gray-300 dark:bg-slate-600 hover:bg-cyan-500 dark:hover:bg-cyan-500 cursor-col-resize relative group transition-colors flex items-center justify-center"
          onMouseDown={() => setIsDragging(true)}
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
          <GripVertical className="w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 pointer-events-none" />
        </div>

        <div
          className="flex flex-col overflow-hidden"
          style={{ width: `${100 - leftWidth}%` }}
        >
          <ETLAIChat
            onSendMessage={handleAIMessage}
            processing={aiProcessing}
            currentStage="building"
          />
        </div>
      </div>
    </div>
  );
}
