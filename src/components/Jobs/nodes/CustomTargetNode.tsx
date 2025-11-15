import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Target, Database, Cloud } from 'lucide-react';

const getIcon = (targetType: string) => {
  if (targetType?.includes('s3') || targetType?.includes('gcs') || targetType?.includes('azure')) {
    return Cloud;
  }
  return Database;
};

export default memo(({ data }: any) => {
  const Icon = getIcon(data.targetType);

  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 min-w-[180px]">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-green-900">TARGET</div>
          <div className="text-sm font-bold text-gray-900">{data.label}</div>
        </div>
      </div>
      {data.config && Object.keys(data.config).length > 0 && (
        <div className="mt-2 pt-2 border-t border-green-200">
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
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-green-500 border-2 border-white"
      />
    </div>
  );
});
