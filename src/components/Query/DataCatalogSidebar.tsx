import { useState, useEffect } from 'react';
import {
  Database,
  Table,
  Columns,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Search,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface DataSource {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface CatalogTable {
  database_name: string;
  table_name: string;
  columns: CatalogColumn[];
}

interface CatalogColumn {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
}

interface DataCatalogSidebarProps {
  onInsertText: (text: string) => void;
}

export function DataCatalogSidebar({ onInsertText }: DataCatalogSidebarProps) {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [catalog, setCatalog] = useState<Record<string, CatalogTable[]>>({});
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDataSources();
    }
  }, [user]);

  const fetchDataSources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('data_sources')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setDataSources(data || []);

      if (data && data.length > 0) {
        data.forEach(source => fetchCatalogForSource(source.id));
      }
    } catch (error) {
      console.error('Error fetching data sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogForSource = async (sourceId: string) => {
    try {
      const { data, error } = await supabase
        .from('catalog_metadata')
        .select('*')
        .eq('data_source_id', sourceId)
        .order('database_name')
        .order('table_name')
        .order('column_order');

      if (error) throw error;

      const tables: Record<string, CatalogTable> = {};

      (data || []).forEach(row => {
        const key = `${row.database_name}.${row.table_name}`;
        if (!tables[key]) {
          tables[key] = {
            database_name: row.database_name,
            table_name: row.table_name,
            columns: []
          };
        }
        if (row.column_name) {
          tables[key].columns.push({
            column_name: row.column_name,
            data_type: row.data_type || 'unknown',
            is_nullable: row.is_nullable
          });
        }
      });

      setCatalog(prev => ({
        ...prev,
        [sourceId]: Object.values(tables)
      }));
    } catch (error) {
      console.error('Error fetching catalog:', error);
    }
  };

  const toggleSource = (sourceId: string) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(sourceId)) {
      newExpanded.delete(sourceId);
    } else {
      newExpanded.add(sourceId);
    }
    setExpandedSources(newExpanded);
  };

  const toggleTable = (tableKey: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableKey)) {
      newExpanded.delete(tableKey);
    } else {
      newExpanded.add(tableKey);
    }
    setExpandedTables(newExpanded);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDataSources();
    setRefreshing(false);
  };

  const insertTableName = (database: string, table: string) => {
    onInsertText(`${database}.${table}`);
  };

  const insertColumnName = (database: string, table: string, column: string) => {
    onInsertText(`${database}.${table}.${column}`);
  };

  const filterTables = (tables: CatalogTable[]) => {
    if (!searchTerm) return tables;
    const term = searchTerm.toLowerCase();
    return tables.filter(table =>
      table.table_name.toLowerCase().includes(term) ||
      table.database_name.toLowerCase().includes(term) ||
      table.columns.some(col => col.column_name.toLowerCase().includes(term))
    );
  };

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-cyan-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Data Catalog
          </h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1 hover:bg-gray-100 rounded transition"
            title="Refresh catalog"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tables, columns..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {dataSources.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Database className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No data sources connected</p>
            <p className="text-xs mt-1">Add data sources first</p>
          </div>
        ) : (
          dataSources.map(source => {
            const isExpanded = expandedSources.has(source.id);
            const tables = catalog[source.id] || [];
            const filteredTables = filterTables(tables);

            return (
              <div key={source.id} className="mb-2">
                <button
                  onClick={() => toggleSource(source.id)}
                  className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded-lg transition text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  )}
                  <Database className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900 truncate flex-1">
                    {source.name}
                  </span>
                  <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                    {source.type}
                  </span>
                </button>

                {isExpanded && (
                  <div className="ml-4 mt-1 border-l-2 border-gray-200 pl-2">
                    {filteredTables.length === 0 ? (
                      <div className="text-xs text-gray-500 py-2 px-2">
                        {tables.length === 0 ? 'No tables found' : 'No matches'}
                      </div>
                    ) : (
                      filteredTables.map(table => {
                        const tableKey = `${source.id}-${table.database_name}-${table.table_name}`;
                        const isTableExpanded = expandedTables.has(tableKey);

                        return (
                          <div key={tableKey} className="mb-1">
                            <button
                              onClick={() => toggleTable(tableKey)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded transition text-left group"
                            >
                              {isTableExpanded ? (
                                <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
                              )}
                              <Table className="w-3 h-3 text-blue-600 flex-shrink-0" />
                              <span className="text-xs text-gray-900 truncate flex-1">
                                {table.database_name !== 'default' && (
                                  <span className="text-gray-500">{table.database_name}.</span>
                                )}
                                {table.table_name}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  insertTableName(table.database_name, table.table_name);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-xs text-cyan-600 hover:text-cyan-700 px-1"
                                title="Insert table name"
                              >
                                +
                              </button>
                            </button>

                            {isTableExpanded && (
                              <div className="ml-4 mt-1">
                                {table.columns.length === 0 ? (
                                  <div className="text-xs text-gray-400 py-1 px-2">
                                    No columns
                                  </div>
                                ) : (
                                  table.columns.map(column => (
                                    <button
                                      key={column.column_name}
                                      onClick={() => insertColumnName(table.database_name, table.table_name, column.column_name)}
                                      className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded transition text-left group"
                                      title={`${column.data_type}${column.is_nullable ? ' (nullable)' : ''}`}
                                    >
                                      <Columns className="w-3 h-3 text-green-600 flex-shrink-0" />
                                      <span className="text-xs text-gray-700 truncate flex-1">
                                        {column.column_name}
                                      </span>
                                      <span className="text-xs text-gray-400 group-hover:text-gray-600">
                                        {column.data_type}
                                      </span>
                                    </button>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>{dataSources.length} data source{dataSources.length !== 1 ? 's' : ''}</span>
          <span>{Object.values(catalog).reduce((sum, tables) => sum + tables.length, 0)} tables</span>
        </div>
      </div>
    </div>
  );
}
