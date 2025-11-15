import { useState } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Database, FileText, ArrowRight } from 'lucide-react';

interface DataProfileViewProps {
  project: any;
  onStageChange: (stage: string) => void;
}

export default function DataProfileView({ project, onStageChange }: DataProfileViewProps) {
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  const dataProfile = {
    overview: {
      totalRows: 150000,
      totalColumns: 12,
      duplicateRows: 45,
      nullCells: 3750,
      dataSize: '245 MB',
      completeness: 97.5,
    },
    columns: [
      {
        name: 'customer_id',
        type: 'INTEGER',
        nullCount: 0,
        uniqueCount: 150000,
        nullPercentage: 0,
        distinctPercentage: 100,
        min: 1,
        max: 150000,
        mean: 75000,
      },
      {
        name: 'email',
        type: 'VARCHAR',
        nullCount: 250,
        uniqueCount: 149750,
        nullPercentage: 0.17,
        distinctPercentage: 99.83,
        topValues: ['user@example.com', 'admin@test.com'],
      },
      {
        name: 'age',
        type: 'INTEGER',
        nullCount: 500,
        uniqueCount: 85,
        nullPercentage: 0.33,
        distinctPercentage: 0.06,
        min: 18,
        max: 95,
        mean: 42.5,
        median: 41,
        stdDev: 15.2,
      },
      {
        name: 'signup_date',
        type: 'TIMESTAMP',
        nullCount: 0,
        uniqueCount: 1250,
        nullPercentage: 0,
        min: '2020-01-01',
        max: '2024-11-15',
      },
      {
        name: 'country',
        type: 'VARCHAR',
        nullCount: 2000,
        uniqueCount: 45,
        nullPercentage: 1.33,
        topValues: ['USA', 'UK', 'Canada', 'Australia', 'Germany'],
      },
      {
        name: 'total_orders',
        type: 'INTEGER',
        nullCount: 1000,
        uniqueCount: 250,
        nullPercentage: 0.67,
        min: 0,
        max: 1234,
        mean: 12.5,
        median: 8,
      },
    ],
    qualityIssues: [
      {
        severity: 'high',
        type: 'Missing Values',
        column: 'country',
        count: 2000,
        percentage: 1.33,
        recommendation: 'Consider imputing with mode or flagging for review',
      },
      {
        severity: 'medium',
        type: 'Missing Values',
        column: 'total_orders',
        count: 1000,
        percentage: 0.67,
        recommendation: 'Fill with 0 for new customers',
      },
      {
        severity: 'low',
        type: 'Duplicate Rows',
        column: 'All Columns',
        count: 45,
        percentage: 0.03,
        recommendation: 'Remove duplicate entries',
      },
      {
        severity: 'medium',
        type: 'Outliers',
        column: 'age',
        count: 125,
        percentage: 0.08,
        recommendation: 'Review ages > 90 for data quality',
      },
    ],
    analytics: {
      dataQualityScore: 95.8,
      completenessScore: 97.5,
      consistencyScore: 98.2,
      uniquenessScore: 99.97,
      validityScore: 94.5,
    },
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl shadow-md p-6 border border-cyan-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Data Profiling Complete</h2>
            <p className="text-sm text-gray-600">Comprehensive analysis of your data quality</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Total Rows</p>
            <p className="text-2xl font-bold text-gray-900">{dataProfile.overview.totalRows.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Columns</p>
            <p className="text-2xl font-bold text-gray-900">{dataProfile.overview.totalColumns}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Duplicates</p>
            <p className="text-2xl font-bold text-yellow-600">{dataProfile.overview.duplicateRows}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Null Cells</p>
            <p className="text-2xl font-bold text-red-600">{dataProfile.overview.nullCells.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Data Size</p>
            <p className="text-2xl font-bold text-gray-900">{dataProfile.overview.dataSize}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Completeness</p>
            <p className="text-2xl font-bold text-green-600">{dataProfile.overview.completeness}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {Object.entries(dataProfile.analytics).map(([key, value]) => {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          const numValue = value as number;
          const color = numValue >= 95 ? 'green' : numValue >= 85 ? 'yellow' : 'red';

          return (
            <div key={key} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">{label}</p>
                {numValue >= 95 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className={`w-5 h-5 text-${color}-600`} />
                )}
              </div>
              <p className={`text-3xl font-bold text-${color}-600`}>{numValue}%</p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-${color}-500 h-2 rounded-full transition-all`}
                  style={{ width: `${numValue}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Database className="w-5 h-5 text-cyan-600" />
          <span>Column Analysis</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Column Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Null %</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Unique</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Distinct %</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Stats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dataProfile.columns.map((column, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => setSelectedColumn(column.name)}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{column.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                      {column.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${column.nullPercentage > 1 ? 'text-red-600' : 'text-gray-600'}`}>
                      {column.nullPercentage.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {column.uniqueCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {column.distinctPercentage.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3">
                    {column.mean !== undefined && (
                      <span className="text-xs text-gray-600">
                        μ={column.mean} | σ={column.stdDev || 'N/A'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span>Data Quality Issues</span>
        </h3>

        <div className="space-y-3">
          {dataProfile.qualityIssues.map((issue, idx) => (
            <div
              key={idx}
              className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-sm uppercase">{issue.severity} Priority</span>
                    <span className="text-sm">•</span>
                    <span className="font-medium">{issue.type}</span>
                  </div>
                  <p className="text-sm">
                    Column: <span className="font-mono font-semibold">{issue.column}</span> - {issue.count.toLocaleString()} issues ({issue.percentage}%)
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2 mt-2 pt-2 border-t border-current/20">
                <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{issue.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="font-bold text-gray-900">Overall Data Quality: Excellent</h3>
            <p className="text-sm text-gray-600">Your data is ready for processing with minor cleanup needed</p>
          </div>
        </div>
        <button
          onClick={() => onStageChange('deployment')}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition shadow-lg shadow-cyan-500/30"
        >
          <span>Proceed to Deployment</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
