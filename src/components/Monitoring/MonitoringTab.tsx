import { BarChart3, Activity, Cpu, HardDrive, TrendingUp } from 'lucide-react';

export function MonitoringTab() {
  const metrics = [
    { label: 'Active Clusters', value: '4', change: '+2', icon: Activity, color: 'from-green-500 to-emerald-600' },
    { label: 'CPU Usage', value: '64%', change: '+12%', icon: Cpu, color: 'from-blue-500 to-cyan-600' },
    { label: 'Memory Usage', value: '78%', change: '+5%', icon: HardDrive, color: 'from-orange-500 to-red-600' },
    { label: 'Jobs Run Today', value: '24', change: '+8', icon: TrendingUp, color: 'from-purple-500 to-pink-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Monitoring</h1>
        <p className="text-gray-600 mt-2">Real-time metrics and performance analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-600 text-sm font-semibold bg-green-100 px-2 py-1 rounded">
                  {metric.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
              <p className="text-sm text-gray-600">{metric.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="w-6 h-6 text-cyan-600" />
            <h2 className="text-xl font-bold text-gray-900">Cluster Activity</h2>
          </div>
          <div className="space-y-4">
            {['Spark Production', 'Dask Analytics', 'Ray ML Training'].map((cluster, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{cluster}</span>
                  <span className="text-gray-500">{85 - index * 15}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all"
                    style={{ width: `${85 - index * 15}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Recent Job Runs</h2>
          </div>
          <div className="space-y-3">
            {[
              { name: 'ETL Pipeline', status: 'success', time: '2m ago' },
              { name: 'Data Validation', status: 'success', time: '15m ago' },
              { name: 'ML Training Job', status: 'running', time: '1h ago' },
              { name: 'Report Generation', status: 'success', time: '2h ago' },
            ].map((job, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    job.status === 'success' ? 'bg-green-500' :
                    job.status === 'running' ? 'bg-blue-500 animate-pulse' :
                    'bg-red-500'
                  }`} />
                  <span className="font-medium text-gray-900">{job.name}</span>
                </div>
                <span className="text-sm text-gray-500">{job.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
