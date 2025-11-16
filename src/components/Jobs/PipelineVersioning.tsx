import { useState } from 'react';
import { GitBranch, Clock, Tag, Play, RotateCcw, Calendar, CheckCircle2, XCircle } from 'lucide-react';

interface PipelineVersion {
  id: string;
  version: string;
  createdAt: Date;
  createdBy: string;
  description: string;
  status: 'active' | 'deployed' | 'archived';
  changes: string[];
  blocksCount: number;
}

interface BackfillRun {
  id: string;
  versionId: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  rowsProcessed: number;
  totalRows: number;
  createdAt: Date;
}

interface PipelineVersioningProps {
  pipelineId: string;
  currentVersion: string;
  onSwitchVersion: (versionId: string) => void;
  onCreateBackfill: (startDate: Date, endDate: Date) => void;
}

export default function PipelineVersioning({
  pipelineId,
  currentVersion,
  onSwitchVersion,
  onCreateBackfill
}: PipelineVersioningProps) {
  const [activeTab, setActiveTab] = useState<'versions' | 'backfills'>('versions');
  const [showBackfillModal, setShowBackfillModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const [versions] = useState<PipelineVersion[]>([
    {
      id: 'v1.2.3',
      version: 'v1.2.3',
      createdAt: new Date('2024-11-16T10:00:00'),
      createdBy: 'john@example.com',
      description: 'Added data quality checks and improved error handling',
      status: 'active',
      changes: [
        'Added null value validation',
        'Improved logging',
        'Optimized join operation'
      ],
      blocksCount: 8
    },
    {
      id: 'v1.2.2',
      version: 'v1.2.2',
      createdAt: new Date('2024-11-15T14:30:00'),
      createdBy: 'sarah@example.com',
      description: 'Performance optimization for large datasets',
      status: 'deployed',
      changes: [
        'Added chunked processing',
        'Implemented caching',
        'Reduced memory footprint'
      ],
      blocksCount: 7
    },
    {
      id: 'v1.2.1',
      version: 'v1.2.1',
      createdAt: new Date('2024-11-14T09:15:00'),
      createdBy: 'john@example.com',
      description: 'Bug fixes and minor improvements',
      status: 'archived',
      changes: [
        'Fixed date parsing issue',
        'Updated dependencies'
      ],
      blocksCount: 7
    }
  ]);

  const [backfills] = useState<BackfillRun[]>([
    {
      id: 'bf-1',
      versionId: 'v1.2.3',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2024-11-15'),
      status: 'completed',
      progress: 100,
      rowsProcessed: 1500000,
      totalRows: 1500000,
      createdAt: new Date('2024-11-16T08:00:00')
    },
    {
      id: 'bf-2',
      versionId: 'v1.2.2',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-10-31'),
      status: 'running',
      progress: 67,
      rowsProcessed: 850000,
      totalRows: 1275000,
      createdAt: new Date('2024-11-15T12:00:00')
    },
    {
      id: 'bf-3',
      versionId: 'v1.2.1',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-09-30'),
      status: 'failed',
      progress: 45,
      rowsProcessed: 500000,
      totalRows: 1100000,
      createdAt: new Date('2024-11-14T16:00:00')
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300';
      case 'deployed':
      case 'running':
        return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300';
      case 'archived':
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderVersions = () => (
    <div className="space-y-3">
      {versions.map((version) => (
        <div
          key={version.id}
          className={`border rounded-xl p-4 transition-all ${
            version.version === currentVersion
              ? 'border-cyan-400 dark:border-cyan-600 bg-cyan-50/50 dark:bg-cyan-900/10'
              : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{version.version}</h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(version.status)}`}>
                  {version.status}
                </span>
                {version.version === currentVersion && (
                  <span className="text-xs px-2 py-1 rounded-full bg-cyan-500 text-white">
                    Current
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{version.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-slate-500">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(version.createdAt)}</span>
                </span>
                <span>{version.createdBy}</span>
                <span>{version.blocksCount} blocks</span>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              {version.version !== currentVersion && (
                <button
                  onClick={() => onSwitchVersion(version.id)}
                  className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-sm rounded-lg transition-colors"
                >
                  Switch
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedVersion(version.id);
                  setShowBackfillModal(true);
                }}
                className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-sm rounded-lg transition-colors"
              >
                Backfill
              </button>
            </div>
          </div>

          {version.changes.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
              <p className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-2">Changes:</p>
              <ul className="space-y-1">
                {version.changes.map((change, idx) => (
                  <li key={idx} className="text-xs text-gray-600 dark:text-slate-400 flex items-start space-x-2">
                    <span className="text-cyan-500 mt-1">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderBackfills = () => (
    <div className="space-y-3">
      {backfills.map((backfill) => {
        const version = versions.find(v => v.id === backfill.versionId);
        return (
          <div
            key={backfill.id}
            className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <RotateCcw className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Backfill {backfill.id}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(backfill.status)}`}>
                    {backfill.status}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-slate-400 mb-3">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {backfill.startDate.toLocaleDateString()} - {backfill.endDate.toLocaleDateString()}
                    </span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Tag className="w-3 h-3" />
                    <span>{version?.version}</span>
                  </span>
                </div>
              </div>

              {backfill.status === 'running' && (
                <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg">
                  Cancel
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Progress</span>
                <span className="font-semibold text-gray-900 dark:text-white">{backfill.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    backfill.status === 'completed'
                      ? 'bg-green-500'
                      : backfill.status === 'failed'
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${backfill.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-500">
                <span>
                  {backfill.rowsProcessed.toLocaleString()} / {backfill.totalRows.toLocaleString()} rows
                </span>
                <span>Started {formatDate(backfill.createdAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const BackfillModal = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Backfill</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              Reprocess historical data with the selected pipeline version
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
              />
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Backfills may take time and consume compute resources. Make sure to review the date range carefully.
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-3">
            <button
              onClick={() => setShowBackfillModal(false)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (startDate && endDate) {
                  onCreateBackfill(new Date(startDate), new Date(endDate));
                  setShowBackfillModal(false);
                }
              }}
              disabled={!startDate || !endDate}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Backfill
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="border-b border-gray-200 dark:border-slate-700">
        <div className="flex space-x-1 p-2">
          <button
            onClick={() => setActiveTab('versions')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'versions'
                ? 'bg-cyan-500 text-white'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <GitBranch className="w-4 h-4" />
              <span>Versions</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('backfills')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'backfills'
                ? 'bg-cyan-500 text-white'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <RotateCcw className="w-4 h-4" />
              <span>Backfills</span>
            </div>
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'versions' ? renderVersions() : renderBackfills()}
      </div>

      {showBackfillModal && <BackfillModal />}
    </div>
  );
}
