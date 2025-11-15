import { useState, useEffect } from 'react';
import { Sparkles, Wand2, List, Plus, Layout, Edit3, Trash2, Play, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ETLPipelineCreator from './ETLPipelineCreator';

interface SavedPipeline {
  id: string;
  name: string;
  description: string;
  mode: 'visual' | 'form';
  status: string;
  created_at: string;
  updated_at: string;
  last_run: string | null;
}

export function IGOETLTab() {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [pipelines, setPipelines] = useState<SavedPipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPipeline, setSelectedPipeline] = useState<SavedPipeline | null>(null);

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('etl_pipelines')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPipelines(data || []);
    } catch (error: any) {
      console.error('Error fetching pipelines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pipeline?')) return;

    try {
      const { error } = await supabase
        .from('etl_pipelines')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchPipelines();
    } catch (error: any) {
      alert('Error deleting pipeline: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (view === 'create') {
    return (
      <ETLPipelineCreator
        pipeline={selectedPipeline}
        onBack={() => {
          setView('list');
          setSelectedPipeline(null);
          fetchPipelines();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">IGO ETL</h1>
          </div>
          <p className="text-gray-600">AI-Powered ETL Pipeline Builder & Orchestrator</p>
        </div>
        <button
          onClick={() => {
            setSelectedPipeline(null);
            setView('create');
          }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition shadow-lg shadow-purple-500/30"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Pipeline</span>
        </button>
      </div>

      {pipelines.length === 0 ? (
        <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 rounded-2xl shadow-xl p-12 text-center border border-cyan-100">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to IGO ETL</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Build production-ready ETL pipelines with AI assistance. Choose between visual workflow builder or guided forms, connect multiple sources and targets, and deploy to any cloud.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Layout className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Visual Builder</h3>
              <p className="text-sm text-gray-600">Drag-and-drop workflow canvas like n8n and AWS Glue</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <List className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Multi-Source/Target</h3>
              <p className="text-sm text-gray-600">Connect unlimited sources and targets in one pipeline</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Wand2 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-sm text-gray-600">Auto-generate optimized code and transformations</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Cloud Services</h3>
              <p className="text-sm text-gray-600">Integrate Glue, Dataflow, Databricks and more</p>
            </div>
          </div>

          <button
            onClick={() => setView('create')}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition shadow-lg shadow-purple-500/30 text-lg"
          >
            <Wand2 className="w-6 h-6" />
            <span>Create Your First Pipeline</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pipelines.map((pipeline) => (
            <div
              key={pipeline.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{pipeline.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pipeline.status)}`}>
                      {pipeline.status}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium uppercase">
                      {pipeline.mode}
                    </span>
                  </div>
                  {pipeline.description && (
                    <p className="text-gray-600 mb-3">{pipeline.description}</p>
                  )}
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Updated {new Date(pipeline.updated_at).toLocaleDateString()}</span>
                    </div>
                    {pipeline.last_run && (
                      <div className="flex items-center space-x-2">
                        <Play className="w-4 h-4" />
                        <span>Last run {new Date(pipeline.last_run).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedPipeline(pipeline);
                      setView('create');
                    }}
                    className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                    title="Edit pipeline"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => alert('Pipeline execution will be implemented here')}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                    title="Run pipeline"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(pipeline.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete pipeline"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
