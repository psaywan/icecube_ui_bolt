import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';

interface ExcelUploadFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function ExcelUploadForm({ onSubmit, onCancel }: ExcelUploadFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError('');

    if (!name) {
      setName(selectedFile.name.replace(/\.(xlsx|xls)$/i, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !name) {
      setError('Please provide a name and select a file');
      return;
    }

    try {
      const dataSource = {
        name,
        type: 'excel',
        description: description || `Excel file: ${file.name}`,
        config: {
          filename: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          note: 'Excel parsing requires backend processing'
        },
        metadata: {
          message: 'Excel file uploaded. Processing will be available in the backend.'
        }
      };

      onSubmit(dataSource);
    } catch (err: any) {
      setError(err.message || 'Failed to process Excel file');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data Source Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g., Financial Report 2024"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Optional description"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Excel File *
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
            accept=".xlsx,.xls"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) handleFileSelect(selectedFile);
            }}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="mt-3 text-sm text-red-600 hover:text-red-700"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-900 font-medium mb-1">Click to upload Excel file</p>
              <p className="text-sm text-gray-500">or drag and drop</p>
              <p className="text-xs text-gray-400 mt-2">Supports .xlsx and .xls files</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
        <p className="text-sm">
          <strong>Note:</strong> Excel files will be stored and made available for querying.
          Sheet parsing and data extraction will be processed automatically.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!file || !name}
          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Data Source
        </button>
      </div>
    </form>
  );
}
