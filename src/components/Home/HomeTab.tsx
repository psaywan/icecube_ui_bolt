import { BarChart3, Server, FileCode, Database, TrendingUp, Activity } from 'lucide-react';

export function HomeTab() {
  const stats = [
    { label: 'Active Clusters', value: '12', change: '+3', icon: Server, color: 'from-blue-500 to-cyan-600' },
    { label: 'Running Jobs', value: '8', change: '+2', icon: Activity, color: 'from-green-500 to-emerald-600' },
    { label: 'Notebooks', value: '24', change: '+5', icon: FileCode, color: 'from-purple-500 to-pink-600' },
    { label: 'Data Sources', value: '6', change: '+1', icon: Database, color: 'from-orange-500 to-red-600' },
  ];

  const recentActivity = [
    { type: 'notebook', name: 'Customer Analytics', time: '5 min ago', status: 'completed' },
    { type: 'job', name: 'ETL Pipeline', time: '15 min ago', status: 'running' },
    { type: 'cluster', name: 'Spark Production', time: '1 hour ago', status: 'started' },
    { type: 'query', name: 'Sales Report', time: '2 hours ago', status: 'completed' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Icecube</h1>
        <p className="text-gray-600 mt-2">Your multi-cloud data platform dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-600 text-sm font-semibold bg-green-100 px-2 py-1 rounded">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="w-6 h-6 text-cyan-600" />
            <h2 className="text-xl font-bold text-gray-900">Platform Activity</h2>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'running' ? 'bg-blue-500 animate-pulse' :
                    'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{activity.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{activity.type}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition text-left">
              <FileCode className="w-6 h-6 text-cyan-600 mb-2" />
              <p className="font-semibold text-gray-900">New Notebook</p>
              <p className="text-xs text-gray-600">Create interactive notebook</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-left">
              <Server className="w-6 h-6 text-green-600 mb-2" />
              <p className="font-semibold text-gray-900">Start Cluster</p>
              <p className="text-xs text-gray-600">Launch compute resources</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left">
              <Database className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-semibold text-gray-900">Query Data</p>
              <p className="text-xs text-gray-600">Run SQL queries</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-left">
              <Activity className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-semibold text-gray-900">Create Job</p>
              <p className="text-xs text-gray-600">Schedule workflows</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
