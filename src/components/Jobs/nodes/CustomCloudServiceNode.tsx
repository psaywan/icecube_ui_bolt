import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Cloud, Zap } from 'lucide-react';

export default memo(({ data }: any) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 min-w-[200px]">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-orange-900">CLOUD SERVICE</div>
          <div className="text-sm font-bold text-gray-900">{data.label}</div>
        </div>
      </div>
      {data.description && (
        <div className="mt-2 pt-2 border-t border-orange-200">
          <p className="text-[10px] text-gray-600">{data.description}</p>
        </div>
      )}
      <div className="mt-2 flex items-center space-x-1">
        <Cloud className="w-3 h-3 text-orange-600" />
        <span className="text-[10px] text-orange-900 font-medium uppercase">{data.provider}</span>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-orange-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-orange-500 border-2 border-white"
      />
    </div>
  );
});
