import { useState, useRef } from 'react';
import { X, Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface AddFileToSourceModalProps {
  dataSource: {
    id: string;
    name: string;
    type: string;
  };
  onClose: () => void;
  onAdd: (file: File, tableName: string) => Promise<void>;
}

export default function AddFileToSourceModal({ dataSource, onClose, onAdd }: AddFileToSourceModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [tableName, setTableName] = useState('');
  const [preview, setPreview] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setParsing(true);

    try {
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        throw new Error('File is empty');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
      setColumns(headers);

      const previewRows = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
        const row: any = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });
        return row;
      });

      setPreview(previewRows);

      if (!tableName) {
        setTableName(selectedFile.name.replace(/\.(csv|xlsx?|txt)$/i, '').toLowerCase().replace(/\s+/g, '_'));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to parse file');
      setFile(null);
      setPreview([]);
      setColumns([]);
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !tableName) {
      setError('Please provide a table name and select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      await onAdd(file, tableName);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add file');
    } finally {
      setUploading(false);
    }
  };

  const acceptedTypes = dataSource.type === 'csv' ? '.csv,.txt' : '.xlsx,.xls';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add File to {dataSource.name}</h2>
            <p className="text-sm text-gray-600 mt-1">Upload additional {dataSource.type.toUpperCase()} file to this data source</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Table Name *
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              required
              placeholder="e.g., sales_q1_2024"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Table name will be used to reference this data in queries</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {dataSource.type.toUpperCase()} File *
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                file
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-cyan-400 hover:bg-cyan-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes}
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) handleFileSelect(selectedFile);
                }}
                className="hidden"
              />

              {parsing ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-600">Parsing file...</p>
                </div>
              ) : file ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {(file.size / 1024).toFixed(2)} KB • {columns.length} columns • {preview.length > 0 ? `${preview.length}+ rows` : ''}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview([]);
                      setColumns([]);
                    }}
                    className="mt-3 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-900 font-medium mb-1">Click to upload {dataSource.type.toUpperCase()} file</p>
                  <p className="text-sm text-gray-500">or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-2">Supports {acceptedTypes} files</p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {preview.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Data Preview (first 5 rows)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white border-b border-gray-200">
                    <tr>
                      {columns.map((col, idx) => (
                        <th key={idx} className="px-4 py-2 text-left font-semibold text-gray-900 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {preview.map((row, idx) => (
                      <tr key={idx}>
                        {columns.map((col, cidx) => (
                          <td key={cidx} className="px-4 py-2 text-gray-700 whitespace-nowrap">
                            {row[col] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || !tableName || parsing || uploading}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {uploading ? 'Adding...' : 'Add File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
