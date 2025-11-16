import { useState } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { notebookTemplates, NotebookBlockTemplate, getAllCategories } from './NotebookBlockTemplates';

interface NotebookTemplateSelectorProps {
  onSelectTemplate: (template: NotebookBlockTemplate) => void;
  onClose: () => void;
}

export default function NotebookTemplateSelector({ onSelectTemplate, onClose }: NotebookTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Templates', icon: '📚' },
    { id: 'loader', name: 'Data Loaders', icon: '📥' },
    { id: 'transformer', name: 'Transformers', icon: '⚙️' },
    { id: 'exporter', name: 'Data Exporters', icon: '📤' },
    { id: 'sensor', name: 'Sensors & Tests', icon: '🔍' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
  ];

  const filteredTemplates = notebookTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      loader: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300',
      transformer: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
      exporter: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300',
      sensor: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300',
      analytics: 'bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6 text-cyan-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Block Templates</h2>
                <p className="text-sm text-gray-600 dark:text-slate-400">Start with pre-built code blocks</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Categories */}
          <div className="w-64 border-r border-gray-200 dark:border-slate-700 overflow-y-auto bg-gray-50 dark:bg-slate-900/50 p-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map(category => {
                const count = category.id === 'all'
                  ? notebookTemplates.length
                  : notebookTemplates.filter(t => t.category === category.id).length;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-cyan-500 text-white'
                        : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedCategory === category.id
                        ? 'bg-white/20'
                        : 'bg-gray-200 dark:bg-slate-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content - Templates */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No templates found</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map(template => {
                  const Icon = template.icon;
                  return (
                    <div
                      key={template.id}
                      onClick={() => {
                        onSelectTemplate(template);
                        onClose();
                      }}
                      className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-lg hover:border-cyan-400 dark:hover:border-cyan-600 transition-all cursor-pointer bg-white dark:bg-slate-900 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(template.category)}`}>
                            {template.category}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
                            {template.language}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                        {template.description}
                      </p>

                      {template.subcategory && (
                        <div className="text-xs text-gray-500 dark:text-slate-500 mb-3">
                          📁 {template.subcategory}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400"
                          >
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
                            +{template.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Preview on hover */}
                      <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                          Click to insert →
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400">
            <div className="flex items-center space-x-4">
              <span>💡 Tip: Templates are customizable after insertion</span>
            </div>
            <span>{filteredTemplates.length} templates available</span>
          </div>
        </div>
      </div>
    </div>
  );
}
