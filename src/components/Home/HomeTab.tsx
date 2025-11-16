import {
  BarChart3, Server, FileCode, Database, TrendingUp, Activity,
  Clock, CheckCircle2, AlertCircle, Play, Zap, Users,
  FolderOpen, GitBranch, Box, ArrowRight, Sparkles
} from 'lucide-react';

interface HomeTabProps {
  onNavigate?: (tab: string) => void;
}

export function HomeTab({ onNavigate }: HomeTabProps = {}) {
  const stats = [
    { label: 'Active Clusters', value: '12', change: '+3', trend: 'up', icon: Server, color: 'from-blue-500 to-cyan-600' },
    { label: 'Running Jobs', value: '8', change: '+2', trend: 'up', icon: Activity, color: 'from-green-500 to-emerald-600' },
    { label: 'Notebooks', value: '24', change: '+5', trend: 'up', icon: FileCode, color: 'from-violet-500 to-purple-600' },
    { label: 'Data Sources', value: '6', change: '+1', trend: 'up', icon: Database, color: 'from-orange-500 to-red-600' },
  ];

  const recentActivity = [
    { type: 'notebook', name: 'Customer Analytics Notebook', time: '5 min ago', status: 'completed', user: 'You', icon: FileCode },
    { type: 'job', name: 'Daily ETL Pipeline', time: '15 min ago', status: 'running', user: 'System', icon: Activity },
    { type: 'cluster', name: 'Spark Production Cluster', time: '1 hour ago', status: 'started', user: 'DevOps Team', icon: Server },
    { type: 'query', name: 'Sales Report Q4 2024', time: '2 hours ago', status: 'completed', user: 'Analytics Team', icon: Database },
    { type: 'pipeline', name: 'Data Ingestion Pipeline', time: '3 hours ago', status: 'completed', user: 'Data Eng', icon: GitBranch },
  ];

  const quickActions = [
    { title: 'New Notebook', desc: 'Create notebook', icon: FileCode, color: 'cyan', gradient: 'from-cyan-500 to-blue-600', navigate: 'notebooks' },
    { title: 'Launch Cluster', desc: 'Start compute', icon: Server, color: 'green', gradient: 'from-green-500 to-emerald-600', navigate: 'compute' },
    { title: 'Query Editor', desc: 'Run SQL queries', icon: Database, color: 'blue', gradient: 'from-blue-500 to-indigo-600', navigate: 'query-editor' },
    { title: 'Create Job', desc: 'Schedule workflow', icon: Zap, color: 'violet', gradient: 'from-violet-500 to-purple-600', navigate: 'jobs' },
    { title: 'Data Catalog', desc: 'Browse data', icon: FolderOpen, color: 'amber', gradient: 'from-amber-500 to-orange-600', navigate: 'data-catalog' },
    { title: 'Build Pipeline', desc: 'ETL workflow', icon: GitBranch, color: 'pink', gradient: 'from-pink-500 to-rose-600', navigate: 'igo-etl' },
  ];

  const recentNotebooks = [
    { name: 'Customer Segmentation Analysis', modified: '2 hours ago', type: 'Python' },
    { name: 'Sales Forecasting Model', modified: '5 hours ago', type: 'SQL' },
    { name: 'Product Performance Dashboard', modified: '1 day ago', type: 'Python' },
  ];

  const runningJobs = [
    { name: 'Nightly Data Sync', progress: 75, eta: '5 min' },
    { name: 'ML Model Training', progress: 45, eta: '15 min' },
    { name: 'Report Generation', progress: 90, eta: '2 min' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Your unified data analytics platform</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all">
          <Sparkles className="w-4 h-4" />
          What's New
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-green-600 dark:text-green-400 text-xs font-bold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">{stat.value}</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Actions - Takes full width on small, 1 col on large */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quick Actions</h2>
            <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => onNavigate?.(action.navigate)}
                  className="group p-4 border-2 border-gray-200 dark:border-slate-700 rounded-lg hover:border-transparent hover:shadow-md transition-all text-left relative overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <Icon className={`w-6 h-6 text-${action.color}-600 dark:text-${action.color}-400 mb-2 relative z-10`} />
                  <p className="font-semibold text-gray-900 dark:text-white text-sm relative z-10">{action.title}</p>
                  <p className="text-xs text-gray-600 dark:text-slate-400 relative z-10">{action.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Running Jobs */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Running Jobs</h2>
            <Activity className="w-5 h-5 text-green-600 dark:text-green-400 animate-pulse" />
          </div>
          <div className="space-y-4">
            {runningJobs.map((job, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{job.name}</p>
                  <span className="text-xs text-gray-500 dark:text-slate-400 ml-2">{job.progress}%</span>
                </div>
                <div className="relative h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">ETA: {job.eta}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate?.('jobs')}
            className="w-full mt-4 py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            View All Jobs
          </button>
        </div>
      </div>

      {/* Recent Activity & Notebooks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h2>
            <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activity.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                    activity.status === 'running' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    'bg-yellow-100 dark:bg-yellow-900/30'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      activity.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                      activity.status === 'running' ? 'text-blue-600 dark:text-blue-400' :
                      'text-yellow-600 dark:text-yellow-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{activity.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{activity.user} • {activity.time}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    activity.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    activity.status === 'running' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {activity.status}
                  </div>
                </div>
              );
            })}
          </div>
          <button className="w-full mt-4 py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2 group">
            View All Activity
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Recent Notebooks */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Notebooks</h2>
            <FileCode className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="space-y-3">
            {recentNotebooks.map((notebook, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileCode className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{notebook.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{notebook.type} • Modified {notebook.modified}</p>
                </div>
                <Play className="w-4 h-4 text-gray-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate?.('notebooks')}
            className="w-full mt-4 py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2 group"
          >
            Browse All Notebooks
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Platform Health Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold">All Systems Operational</h3>
              <p className="text-sm text-green-50">Platform running smoothly • Last updated: 2 min ago</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium text-sm transition-colors">
            View Status
          </button>
        </div>
      </div>
    </div>
  );
}
