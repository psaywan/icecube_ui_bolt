import { useState, useEffect } from 'react';
import { Database, Table, Eye, Search, Loader2, FileText, FileSpreadsheet, Cloud, HardDrive, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CatalogEntry {
  id: string;
  data_source_id: string;
  database_name: string;
  table_name: string;
  column_name: string | null;
  data_type: string | null;
  is_nullable: boolean;
  column_order: number | null;
  metadata: any;
  source_type?: string;
  source_name?: string;
}

interface GroupedCatalog {
  sourceType: string;
  sourceName: string;
  dataSourceId: string;
  tables: {
    [tableName: string]: CatalogEntry[];
  };
}

export function DataCatalogTab() {
  const [entries, setEntries] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data } = await supabase
      .from('catalog_metadata')
      .select(`
        *,
        data_sources!inner(
          id,
          name,
          type
        )
      `)
      .order('table_name', { ascending: true });

    if (data) {
      const enrichedData = data.map((entry: any) => ({
        ...entry,
        source_type: entry.data_sources.type,
        source_name: entry.data_sources.name
      }));
      setEntries(enrichedData);
    }
    setLoading(false);
  };

  const groupCatalogBySource = (): GroupedCatalog[] => {
    const grouped = new Map<string, GroupedCatalog>();

    entries.forEach((entry) => {
      const key = `${entry.source_type}-${entry.data_source_id}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          sourceType: entry.source_type || 'unknown',
          sourceName: entry.source_name || 'Unknown Source',
          dataSourceId: entry.data_source_id,
          tables: {}
        });
      }

      const group = grouped.get(key)!;
      if (!group.tables[entry.table_name]) {
        group.tables[entry.table_name] = [];
      }
      group.tables[entry.table_name].push(entry);
    });

    return Array.from(grouped.values());
  };

  const toggleGroup = (key: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleTable = (key: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedTables(newExpanded);
  };

  const getSourceIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('csv')) {
      return <FileText className="w-5 h-5 text-green-600" />;
    } else if (lowerType.includes('excel')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    } else if (lowerType.includes('s3') || lowerType.includes('gcs') || lowerType.includes('azure_blob')) {
      return <Cloud className="w-5 h-5 text-blue-600" />;
    } else if (lowerType.includes('athena') || lowerType.includes('redshift') || lowerType.includes('bigquery')) {
      return <Database className="w-5 h-5 text-purple-600" />;
    } else {
      return <HardDrive className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSourceTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'csv': 'CSV Files',
      'excel': 'Excel Files',
      's3': 'Amazon S3',
      'gcs': 'Google Cloud Storage',
      'azure_blob': 'Azure Blob Storage',
      'athena': 'AWS Athena',
      'redshift': 'Amazon Redshift',
      'bigquery': 'Google BigQuery',
      'snowflake': 'Snowflake',
      'mysql': 'MySQL',
      'postgresql': 'PostgreSQL',
      'mongodb': 'MongoDB',
      'sap_hana': 'SAP HANA',
      'hdfs': 'HDFS'
    };
    return typeMap[type.toLowerCase()] || type.toUpperCase();
  };

  const groupedCatalogs = groupCatalogBySource();
  const filteredGroups = groupedCatalogs.filter(group =>
    group.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Object.keys(group.tables).some(table => table.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Catalog</h1>
        <p className="text-gray-600">Browse your data assets grouped by source type</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search data sources and tables..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Catalog Entries</h3>
          <p className="text-gray-600">Connect your data sources to populate the catalog</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGroups.map((group) => {
            const groupKey = `${group.sourceType}-${group.dataSourceId}`;
            const isGroupExpanded = expandedGroups.has(groupKey);

            return (
              <div key={groupKey} className="bg-white rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={() => toggleGroup(groupKey)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-3">
                    {getSourceIcon(group.sourceType)}
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{group.sourceName}</h3>
                      <p className="text-sm text-gray-500">{getSourceTypeLabel(group.sourceType)} • {Object.keys(group.tables).length} {Object.keys(group.tables).length === 1 ? 'table' : 'tables'}</p>
                    </div>
                  </div>
                  {isGroupExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {isGroupExpanded && (
                  <div className="border-t border-gray-200">
                    {Object.entries(group.tables).map(([tableName, columns]) => {
                      const tableKey = `${groupKey}-${tableName}`;
                      const isTableExpanded = expandedTables.has(tableKey);

                      return (
                        <div key={tableKey} className="border-b border-gray-100 last:border-b-0">
                          <button
                            onClick={() => toggleTable(tableKey)}
                            className="w-full px-8 py-3 flex items-center justify-between hover:bg-gray-50 transition"
                          >
                            <div className="flex items-center space-x-3">
                              <Table className="w-4 h-4 text-cyan-600" />
                              <span className="font-medium text-gray-900">{tableName}</span>
                              <span className="text-sm text-gray-500">({columns.length} columns)</span>
                            </div>
                            {isTableExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </button>

                          {isTableExpanded && (
                            <div className="bg-gray-50 px-8 py-4">
                              <table className="w-full">
                                <thead>
                                  <tr className="text-left">
                                    <th className="pb-2 text-xs font-semibold text-gray-600 uppercase">Column</th>
                                    <th className="pb-2 text-xs font-semibold text-gray-600 uppercase">Type</th>
                                    <th className="pb-2 text-xs font-semibold text-gray-600 uppercase">Nullable</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {columns
                                    .sort((a, b) => (a.column_order || 0) - (b.column_order || 0))
                                    .map((col, idx) => (
                                      <tr key={idx} className="border-t border-gray-200">
                                        <td className="py-2 text-sm text-gray-900 font-medium">{col.column_name || 'N/A'}</td>
                                        <td className="py-2 text-sm text-gray-600">{col.data_type || 'N/A'}</td>
                                        <td className="py-2 text-sm text-gray-600">
                                          {col.is_nullable ? (
                                            <span className="text-green-600">Yes</span>
                                          ) : (
                                            <span className="text-red-600">No</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
