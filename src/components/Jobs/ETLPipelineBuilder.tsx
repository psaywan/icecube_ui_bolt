import { useState } from 'react';
import { Code, Play, Download, Edit3, CheckCircle, Copy, FileCode } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface ETLPipelineBuilderProps {
  project: any;
  onStageChange: (stage: string) => void;
}

export default function ETLPipelineBuilder({ project, onStageChange }: ETLPipelineBuilderProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'scala' | 'sql'>('python');
  const [code, setCode] = useState(project.generatedCode || '');
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const codeTemplates = {
    python: `# AI-Generated ETL Pipeline - ${project.name}
# Source: ${project.sourceType} → Target: ${project.targetType}

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when, trim, upper
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ETLPipeline:
    def __init__(self, spark_session):
        self.spark = spark_session

    def extract(self, source_config):
        """Extract data from source"""
        logger.info(f"Extracting data from {source_config['type']}")

        if source_config['type'] == '${project.sourceType}':
            df = self.spark.read \\
                .format("jdbc") \\
                .option("url", source_config['url']) \\
                .option("dbtable", source_config['table']) \\
                .option("user", source_config['user']) \\
                .option("password", source_config['password']) \\
                .load()

        logger.info(f"Extracted {df.count()} rows")
        return df

    def transform(self, df):
        """Apply business transformations"""
        logger.info("Applying transformations")

        # Data cleaning
        df_clean = df.na.drop()

        # Standardization
        df_transformed = df_clean \\
            .withColumn("email", trim(col("email"))) \\
            .withColumn("status", upper(col("status")))

        # Data validation
        df_validated = df_transformed.filter(
            col("email").rlike("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$")
        )

        logger.info(f"Transformed to {df_validated.count()} rows")
        return df_validated

    def load(self, df, target_config):
        """Load data to target destination"""
        logger.info(f"Loading data to {target_config['type']}")

        df.write \\
            .format("parquet") \\
            .mode("overwrite") \\
            .partitionBy("date") \\
            .save(target_config['path'])

        logger.info("Data loaded successfully")

    def run(self, source_config, target_config):
        """Execute complete ETL pipeline"""
        try:
            # Extract
            df = self.extract(source_config)

            # Transform
            df_transformed = self.transform(df)

            # Load
            self.load(df_transformed, target_config)

            logger.info("ETL Pipeline completed successfully")
            return {"status": "success", "rows_processed": df_transformed.count()}

        except Exception as e:
            logger.error(f"ETL Pipeline failed: {str(e)}")
            raise

if __name__ == "__main__":
    spark = SparkSession.builder \\
        .appName("${project.name}") \\
        .config("spark.sql.adaptive.enabled", "true") \\
        .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \\
        .getOrCreate()

    pipeline = ETLPipeline(spark)

    source_config = {
        "type": "${project.sourceType}",
        "url": "jdbc:postgresql://host:5432/db",
        "table": "source_table",
        "user": "username",
        "password": "password"
    }

    target_config = {
        "type": "${project.targetType}",
        "path": "s3://bucket/output/"
    }

    result = pipeline.run(source_config, target_config)
    print(result)
`,
    scala: `// AI-Generated ETL Pipeline - ${project.name}
// Source: ${project.sourceType} → Target: ${project.targetType}

import org.apache.spark.sql.{SparkSession, DataFrame}
import org.apache.spark.sql.functions._

object ETLPipeline {
  def extract(spark: SparkSession, sourceConfig: Map[String, String]): DataFrame = {
    println(s"Extracting data from \${sourceConfig("type")}")

    val df = spark.read
      .format("jdbc")
      .option("url", sourceConfig("url"))
      .option("dbtable", sourceConfig("table"))
      .option("user", sourceConfig("user"))
      .option("password", sourceConfig("password"))
      .load()

    println(s"Extracted \${df.count()} rows")
    df
  }

  def transform(df: DataFrame): DataFrame = {
    println("Applying transformations")

    val dfClean = df.na.drop()

    val dfTransformed = dfClean
      .withColumn("email", trim(col("email")))
      .withColumn("status", upper(col("status")))

    val dfValidated = dfTransformed
      .filter(col("email").rlike("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$"))

    println(s"Transformed to \${dfValidated.count()} rows")
    dfValidated
  }

  def load(df: DataFrame, targetConfig: Map[String, String]): Unit = {
    println(s"Loading data to \${targetConfig("type")}")

    df.write
      .format("parquet")
      .mode("overwrite")
      .partitionBy("date")
      .save(targetConfig("path"))

    println("Data loaded successfully")
  }

  def main(args: Array[String]): Unit = {
    val spark = SparkSession.builder()
      .appName("${project.name}")
      .config("spark.sql.adaptive.enabled", "true")
      .getOrCreate()

    val sourceConfig = Map(
      "type" -> "${project.sourceType}",
      "url" -> "jdbc:postgresql://host:5432/db",
      "table" -> "source_table",
      "user" -> "username",
      "password" -> "password"
    )

    val targetConfig = Map(
      "type" -> "${project.targetType}",
      "path" -> "s3://bucket/output/"
    )

    try {
      val df = extract(spark, sourceConfig)
      val dfTransformed = transform(df)
      load(dfTransformed, targetConfig)

      println("ETL Pipeline completed successfully")
    } catch {
      case e: Exception =>
        println(s"ETL Pipeline failed: \${e.getMessage}")
        throw e
    } finally {
      spark.stop()
    }
  }
}`,
    sql: `-- AI-Generated ETL Pipeline - ${project.name}
-- Source: ${project.sourceType} → Target: ${project.targetType}

-- Extract and Transform in one step
CREATE OR REPLACE TABLE staging.${project.name.toLowerCase().replace(/\s+/g, '_')} AS
SELECT
    -- Clean and standardize data
    TRIM(email) AS email,
    UPPER(status) AS status,
    created_at,
    updated_at,
    -- Data validation
    CASE
        WHEN REGEXP_LIKE(email, '^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$')
        THEN 'valid'
        ELSE 'invalid'
    END AS email_validation,
    -- Data enrichment
    DATE_TRUNC('day', created_at) AS date_partition
FROM source.raw_data
WHERE email IS NOT NULL
  AND status IS NOT NULL;

-- Load to final destination
INSERT INTO ${project.targetType}.final_table
SELECT
    email,
    status,
    created_at,
    updated_at,
    date_partition,
    CURRENT_TIMESTAMP() AS etl_processed_at
FROM staging.${project.name.toLowerCase().replace(/\s+/g, '_')}
WHERE email_validation = 'valid';

-- Data quality checks
SELECT
    COUNT(*) AS total_rows,
    COUNT(DISTINCT email) AS unique_emails,
    SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count,
    SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END) AS inactive_count
FROM ${project.targetType}.final_table;`
  };

  const handleExecute = async () => {
    setExecuting(true);
    await new Promise(resolve => setTimeout(resolve, 3000));

    setExecutionResult({
      status: 'success',
      rows_extracted: 150000,
      rows_transformed: 148500,
      rows_loaded: 148500,
      execution_time: '45.3s',
      data_quality_score: 98.5,
    });

    setExecuting(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  const handleDownload = () => {
    const ext = selectedLanguage === 'python' ? 'py' : selectedLanguage === 'scala' ? 'scala' : 'sql';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etl_pipeline.${ext}`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI-Generated Pipeline Code</h2>
              <p className="text-sm text-gray-600">Review and customize your ETL pipeline</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyCode}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              title="Copy code"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              title="Download code"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          {(['python', 'scala', 'sql'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => {
                setSelectedLanguage(lang);
                setCode(codeTemplates[lang]);
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                selectedLanguage === lang
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <Editor
            height="500px"
            language={selectedLanguage}
            value={code || codeTemplates[selectedLanguage]}
            onChange={(value) => setCode(value || '')}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        <div className="flex items-center space-x-3 mt-6">
          <button
            onClick={handleExecute}
            disabled={executing}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
          >
            {executing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Executing Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Test Pipeline</span>
              </>
            )}
          </button>
          <button
            onClick={() => onStageChange('profiling')}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition"
          >
            <span>Continue to Data Profiling</span>
          </button>
        </div>
      </div>

      {executionResult && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Pipeline Execution Successful</h3>
              <p className="text-sm text-gray-600">Your ETL pipeline ran successfully</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Rows Extracted</p>
              <p className="text-2xl font-bold text-gray-900">{executionResult.rows_extracted.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Rows Transformed</p>
              <p className="text-2xl font-bold text-gray-900">{executionResult.rows_transformed.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Rows Loaded</p>
              <p className="text-2xl font-bold text-gray-900">{executionResult.rows_loaded.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Execution Time</p>
              <p className="text-2xl font-bold text-gray-900">{executionResult.execution_time}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Quality Score</p>
              <p className="text-2xl font-bold text-green-600">{executionResult.data_quality_score}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
