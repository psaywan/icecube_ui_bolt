import { Sparkles, TrendingUp, Zap, ThumbsUp } from 'lucide-react';

interface BlockRecommendation {
  id: string;
  name: string;
  reason: string;
  confidence: number;
  category: string;
  code: string;
  estimatedImpact: 'high' | 'medium' | 'low';
}

interface AIBlockRecommendationsProps {
  currentBlocks: any[];
  dataProfile?: any;
  onApplyRecommendation: (recommendation: BlockRecommendation) => void;
}

export default function AIBlockRecommendations({
  currentBlocks,
  dataProfile,
  onApplyRecommendation
}: AIBlockRecommendationsProps) {
  const generateRecommendations = (): BlockRecommendation[] => {
    const recommendations: BlockRecommendation[] = [];

    if (dataProfile?.nullPercentage > 5) {
      recommendations.push({
        id: 'handle_missing',
        name: 'Handle Missing Values',
        reason: `Detected ${dataProfile.nullPercentage}% missing values in your data. Adding imputation will improve data quality.`,
        confidence: 95,
        category: 'Data Cleaning',
        estimatedImpact: 'high',
        code: `@transformer
def handle_missing_values(df):
    # Fill numeric columns with median
    numeric_cols = df.select_dtypes(include=['number']).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

    # Fill categorical with mode
    cat_cols = df.select_dtypes(include=['object']).columns
    for col in cat_cols:
        df[col].fillna(df[col].mode()[0], inplace=True)

    return df`
      });
    }

    if (dataProfile?.duplicates > 0) {
      recommendations.push({
        id: 'remove_duplicates',
        name: 'Remove Duplicate Rows',
        reason: `Found ${dataProfile.duplicates} duplicate rows. Removing duplicates will ensure data integrity.`,
        confidence: 92,
        category: 'Data Cleaning',
        estimatedImpact: 'high',
        code: `@transformer
def remove_duplicates(df):
    original_count = len(df)
    df = df.drop_duplicates()
    print(f'Removed {original_count - len(df)} duplicate rows')
    return df`
      });
    }

    const hasDataLoader = currentBlocks.some(b => b.type === 'data_loader');
    const hasTransformer = currentBlocks.some(b => b.type === 'transformer');
    const hasExporter = currentBlocks.some(b => b.type === 'data_exporter');

    if (hasDataLoader && hasTransformer && !hasExporter) {
      recommendations.push({
        id: 'add_exporter',
        name: 'Add Data Exporter',
        reason: 'You have loaded and transformed data, but no export block. Add an exporter to save your results.',
        confidence: 88,
        category: 'Pipeline Structure',
        estimatedImpact: 'high',
        code: `@data_exporter
def export_data(df):
    # Export to PostgreSQL/S3/Snowflake
    df.to_sql('output_table', connection, if_exists='replace')
    return df`
      });
    }

    if (hasDataLoader && !currentBlocks.some(b => b.name?.includes('quality') || b.name?.includes('test'))) {
      recommendations.push({
        id: 'add_quality_tests',
        name: 'Add Data Quality Tests',
        reason: 'Implement data quality checks to catch issues early and ensure data reliability.',
        confidence: 85,
        category: 'Testing',
        estimatedImpact: 'medium',
        code: `@test
def test_data_quality(df):
    assert df.shape[0] > 0, 'DataFrame is empty'
    assert df.isnull().sum().sum() < len(df) * 0.1, 'Too many null values'
    assert df.duplicated().sum() == 0, 'Duplicates found'
    return True`
      });
    }

    if (dataProfile?.columnCount > 20) {
      recommendations.push({
        id: 'feature_selection',
        name: 'Feature Selection',
        reason: `You have ${dataProfile.columnCount} columns. Feature selection can improve performance and reduce noise.`,
        confidence: 78,
        category: 'ML Optimization',
        estimatedImpact: 'medium',
        code: `@transformer
def select_important_features(df):
    from sklearn.feature_selection import SelectKBest, f_classif

    # Select top K features
    X = df.drop('target', axis=1)
    y = df['target']

    selector = SelectKBest(f_classif, k=10)
    X_selected = selector.fit_transform(X, y)

    selected_cols = X.columns[selector.get_support()].tolist()
    return df[selected_cols + ['target']]`
      });
    }

    if (!currentBlocks.some(b => b.name?.includes('log') || b.name?.includes('monitor'))) {
      recommendations.push({
        id: 'add_logging',
        name: 'Add Logging & Monitoring',
        reason: 'Add logging to track pipeline execution and debug issues more effectively.',
        confidence: 72,
        category: 'Observability',
        estimatedImpact: 'low',
        code: `@transformer
def log_data_stats(df):
    import logging

    logger = logging.getLogger(__name__)
    logger.info(f'Processing {len(df)} rows')
    logger.info(f'Columns: {df.columns.tolist()}')
    logger.info(f'Memory usage: {df.memory_usage().sum() / 1024**2:.2f} MB')

    return df`
      });
    }

    if (currentBlocks.length >= 3 && !currentBlocks.some(b => b.name?.includes('cache'))) {
      recommendations.push({
        id: 'add_caching',
        name: 'Enable Block Caching',
        reason: 'Cache intermediate results to speed up development and reduce compute costs.',
        confidence: 80,
        category: 'Performance',
        estimatedImpact: 'medium',
        code: `# Add to block configuration
@data_loader(cache=True)
def load_data():
    # Expensive operation - results will be cached
    return expensive_operation()`
      });
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  };

  const recommendations = generateRecommendations();

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <ThumbsUp className="w-6 h-6 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-200">Pipeline looks great!</h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              No recommendations at this time. Your pipeline follows best practices.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        <div>
          <h3 className="font-semibold text-purple-900 dark:text-purple-200">AI Recommendations</h3>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Suggested improvements for your pipeline
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{rec.name}</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                    {rec.category}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(rec.estimatedImpact)}`}>
                    {rec.estimatedImpact} impact
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400">{rec.reason}</p>
              </div>
              <div className="flex flex-col items-end space-y-2 ml-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{rec.confidence}%</span>
                </div>
                <button
                  onClick={() => onApplyRecommendation(rec)}
                  className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm rounded-lg flex items-center space-x-1 transition-all"
                >
                  <Zap className="w-3 h-3" />
                  <span>Apply</span>
                </button>
              </div>
            </div>

            <details className="mt-2">
              <summary className="text-sm text-cyan-600 dark:text-cyan-400 cursor-pointer hover:underline">
                View code
              </summary>
              <pre className="mt-2 p-3 bg-gray-900 dark:bg-black text-gray-100 rounded-lg text-xs overflow-x-auto">
                {rec.code}
              </pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
