import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Database, Cloud, FileText, Zap } from 'lucide-react';

const getIcon = (sourceType: string) => {
  if (sourceType?.includes('s3') || sourceType?.includes('gcs') || sourceType?.includes('azure')) {
    return Cloud;
  }
  if (sourceType === 'api') {
    return Zap;
  }
  if (sourceType === 'csv' || sourceType === 'excel') {
    return FileText;
  }
  return Database;
};

export default memo(({ data }: any) => {
  const Icon = getIcon(data.sourceType);

  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 min-w-[180px]">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-cyan-900">SOURCE</div>
          <div className="text-sm font-bold text-gray-900">{data.label}</div>
        </div>
      </div>
      {data.config && Object.keys(data.config).length > 0 && (
        <div className="mt-2 pt-2 border-t border-cyan-200">
          <div className="text-[10px] text-gray-600 space-y-1">
            {Object.entries(data.config).slice(0, 2).map(([key, value]: any) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium">{key}:</span>
                <span className="truncate ml-2 max-w-[100px]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-cyan-500 border-2 border-white"
      />
    </div>
  );
});
