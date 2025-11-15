import { useState } from 'react';
import { Sparkles, Database, Cloud, BarChart3, Code, Play, Download, Settings, MessageSquare, Wand2, CheckCircle, Loader2 } from 'lucide-react';
import ETLAIChat from './ETLAIChat';
import ETLPipelineBuilder from './ETLPipelineBuilder';
import DataProfileView from './DataProfileView';
import ETLDeploymentConfig from './ETLDeploymentConfig';

type ETLStage = 'configure' | 'profiling' | 'building' | 'analytics' | 'deployment' | 'complete';

interface ETLProject {
  id: string;
  name: string;
  sourceType: string;
  targetType: string;
  stage: ETLStage;
  generatedCode?: string;
  dataProfile?: any;
  analytics?: any;
  deploymentConfig?: any;
}

export function IGOETLTab() {
  const [projects, setProjects] = useState<ETLProject[]>([]);
  const [currentProject, setCurrentProject] = useState<ETLProject | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [stage, setStage] = useState<ETLStage>('configure');

  const startNewProject = () => {
    const newProject: ETLProject = {
      id: `etl-${Date.now()}`,
      name: 'New ETL Pipeline',
      sourceType: '',
      targetType: '',
      stage: 'configure',
    };
    setCurrentProject(newProject);
    setStage('configure');
    setShowChat(true);
  };

  const handleAIGeneration = async (prompt: string) => {
    setAiProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        generatedCode: `# AI-Generated ETL Pipeline\n# Based on: ${prompt}\n\nimport pandas as pd\nfrom pyspark.sql import SparkSession\n\ndef extract_data(source_config):\n    # Extract from source\n    pass\n\ndef transform_data(df):\n    # Apply transformations\n    pass\n\ndef load_data(df, target_config):\n    # Load to target\n    pass\n\nif __name__ == "__main__":\n    spark = SparkSession.builder.appName("IGO_ETL").getOrCreate()\n    extract_data({})\n`,
        dataProfile: {
          rowCount: 150000,
          columnCount: 12,
          nullPercentage: 2.5,
          duplicates: 45,
        },
        analytics: {
          dataQuality: 95,
          completeness: 97.5,
          consistency: 98,
        },
        stage: 'building',
      };
      setCurrentProject(updatedProject);
      setStage('building');
    }
    setAiProcessing(false);
  };

  const renderStageIndicator = () => {
    const stages = [
      { id: 'configure', label: 'Configure', icon: Settings },
      { id: 'profiling', label: 'Profile', icon: BarChart3 },
      { id: 'building', label: 'Build', icon: Code },
      { id: 'analytics', label: 'Analyze', icon: BarChart3 },
      { id: 'deployment', label: 'Deploy', icon: Cloud },
    ];

    return (
      <div className="flex items-center justify-between mb-8 bg-white rounded-xl p-6 shadow-md">
        {stages.map((s, idx) => {
          const Icon = s.icon;
          const isActive = s.id === stage;
          const isCompleted = stages.findIndex(st => st.id === stage) > idx;

          return (
            <div key={s.id} className="flex items-center">
              <div className={`flex flex-col items-center ${isActive ? 'scale-110' : ''} transition-transform`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <span className={`text-sm font-medium ${isActive ? 'text-cyan-600' : 'text-gray-600'}`}>
                  {s.label}
                </span>
              </div>
              {idx < stages.length - 1 && (
                <div className={`w-24 h-1 mx-2 mb-8 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (!currentProject) {
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
            <p className="text-gray-600">AI-Powered ETL Pipeline Generation & Deployment</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 rounded-2xl shadow-xl p-12 text-center border border-cyan-100">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered ETL Pipeline Builder</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Let our AI agents create, optimize, and deploy production-ready ETL pipelines in minutes.
            Simply describe your data flow, and watch the magic happen.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Code className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Auto Code Generation</h3>
              <p className="text-sm text-gray-600">AI generates optimized Python/Spark ETL code tailored to your requirements</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Data Profiling</h3>
              <p className="text-sm text-gray-600">Automatic data quality analysis and comprehensive profiling insights</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Cloud className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Cloud Deployment</h3>
              <p className="text-sm text-gray-600">One-click deployment to AWS, GCP, or Azure with full automation</p>
            </div>
          </div>

          <button
            onClick={startNewProject}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition shadow-lg shadow-purple-500/30 text-lg"
          >
            <Wand2 className="w-6 h-6" />
            <span>Create AI-Powered ETL Pipeline</span>
          </button>
        </div>

        {projects.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => setCurrentProject(project)}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition cursor-pointer border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{project.name}</h4>
                    <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs font-medium">
                      {project.stage}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {project.sourceType} → {project.targetType}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentProject(null)}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentProject.name}</h1>
            <p className="text-sm text-gray-600">AI-Powered ETL Pipeline</p>
          </div>
        </div>
        <button
          onClick={() => setShowChat(!showChat)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition shadow-lg shadow-purple-500/20"
        >
          <MessageSquare className="w-5 h-5" />
          <span>{showChat ? 'Hide' : 'Show'} AI Assistant</span>
        </button>
      </div>

      {renderStageIndicator()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {stage === 'configure' && (
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Configure Your ETL Pipeline</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Name</label>
                  <input
                    type="text"
                    value={currentProject.name}
                    onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="e.g., Customer Data ETL"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Source Type</label>
                    <select
                      value={currentProject.sourceType}
                      onChange={(e) => setCurrentProject({ ...currentProject, sourceType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    >
                      <option value="">Select source...</option>
                      <option value="postgresql">PostgreSQL</option>
                      <option value="mysql">MySQL</option>
                      <option value="s3">AWS S3</option>
                      <option value="gcs">Google Cloud Storage</option>
                      <option value="azure-blob">Azure Blob</option>
                      <option value="mongodb">MongoDB</option>
                      <option value="api">REST API</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Type</label>
                    <select
                      value={currentProject.targetType}
                      onChange={(e) => setCurrentProject({ ...currentProject, targetType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    >
                      <option value="">Select target...</option>
                      <option value="snowflake">Snowflake</option>
                      <option value="redshift">Amazon Redshift</option>
                      <option value="bigquery">Google BigQuery</option>
                      <option value="delta-lake">Delta Lake</option>
                      <option value="postgresql">PostgreSQL</option>
                      <option value="s3">AWS S3</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setStage('building')}
                  disabled={!currentProject.sourceType || !currentProject.targetType}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wand2 className="w-5 h-5" />
                  <span>Generate ETL Pipeline with AI</span>
                </button>
              </div>
            </div>
          )}

          {stage === 'building' && <ETLPipelineBuilder project={currentProject} onStageChange={setStage} />}
          {stage === 'profiling' && <DataProfileView project={currentProject} onStageChange={setStage} />}
          {stage === 'deployment' && <ETLDeploymentConfig project={currentProject} onStageChange={setStage} />}
        </div>

        <div className="lg:col-span-1">
          {showChat && (
            <div className="sticky top-8">
              <ETLAIChat
                onSendMessage={handleAIGeneration}
                processing={aiProcessing}
                currentStage={stage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
