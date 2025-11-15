import { useState, useEffect } from 'react';
import { ArrowLeft, Layout, Edit3, Save, Sparkles, MessageSquare } from 'lucide-react';
import { rdsApi } from '../../lib/rdsApi';
import { getCurrentUser } from '../../lib/auth';
import VisualETLCanvas from './VisualETLCanvas';
import ETLFormBuilder from './ETLFormBuilder';
import ETLAIChat from './ETLAIChat';

interface ETLPipelineCreatorProps {
  pipeline?: any;
  onBack: () => void;
}

export default function ETLPipelineCreator({ pipeline, onBack }: ETLPipelineCreatorProps) {
  const [mode, setMode] = useState<'visual' | 'form'>(pipeline?.mode || 'visual');
  const [pipelineName, setPipelineName] = useState(pipeline?.name || 'New ETL Pipeline');
  const [description, setDescription] = useState(pipeline?.description || '');
  const [workflowData, setWorkflowData] = useState(pipeline?.workflow_data || { nodes: [], edges: [] });
  const [formData, setFormData] = useState({
    sources: pipeline?.sources || [],
    targets: pipeline?.targets || [],
    transformations: pipeline?.transformations || [],
    cloudServices: pipeline?.cloud_services || [],
  });
  const [showChat, setShowChat] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);

  const handleSave = async (autoSave = false) => {
    setSaving(true);
    try {
      const { user, error: authError } = await getCurrentUser();
      if (authError || !user) throw new Error('Not authenticated');

      const pipelineData = {
        user_id: user.id,
        name: pipelineName,
        description,
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Pipelines</span>
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowChat(!showChat)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition shadow-lg shadow-purple-500/20"
          >
            <MessageSquare className="w-5 h-5" />
            <span>{showChat ? 'Hide' : 'Show'} AI Assistant</span>
          </button>
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

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Name</label>
            <input
              type="text"
              value={pipelineName}
              onChange={(e) => setPipelineName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="e.g., Customer Data ETL Pipeline"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
              <span className="text-xs text-gray-500 ml-2">(Supports multiple lines)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-y"
              placeholder="Describe the purpose of this ETL pipeline, data sources, transformations, and targets. You can write as much detail as needed..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length} characters
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <span className="text-sm font-medium text-gray-700">Builder Mode:</span>
          <button
            onClick={() => setMode('visual')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
              mode === 'visual'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>Visual Workflow</span>
          </button>
          <button
            onClick={() => setMode('form')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
              mode === 'form'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Form Builder</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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

        {showChat && (
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ETLAIChat
                onSendMessage={handleAIMessage}
                processing={aiProcessing}
                currentStage="building"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
