import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Filter, Code, GitMerge, Cog } from 'lucide-react';

const getIcon = (transformType: string) => {
  switch (transformType) {
    case 'filter':
    case 'dedupe':
      return Filter;
    case 'map':
      return Code;
    case 'join':
      return GitMerge;
    default:
      return Cog;
  }
};

export default memo(({ data }: any) => {
  const Icon = getIcon(data.transformType);

  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 min-w-[180px]">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-purple-900">TRANSFORM</div>
          <div className="text-sm font-bold text-gray-900">{data.label}</div>
        </div>
      </div>
      {data.description && (
        <div className="mt-2 pt-2 border-t border-purple-200">
          <p className="text-[10px] text-gray-600">{data.description}</p>
        </div>
      )}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-purple-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-purple-500 border-2 border-white"
      />
    </div>
  );
});
