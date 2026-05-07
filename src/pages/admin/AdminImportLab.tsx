import { useState } from 'react';
import { Database, FileText, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { SpreadsheetImportResult } from '../../types';

const CREATIVE_BUTTON_NAMES = ['Forge Data Tables', 'Launch Sheet Forge', 'Open Import Vault', 'Run Data Pulse'];

export default function AdminImportLab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dropExisting, setDropExisting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickerKey, setPickerKey] = useState(0);
  const [result, setResult] = useState<SpreadsheetImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Choose a file before running the import');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await api.uploadSpreadsheetImport(selectedFile, { dropExisting });
      setResult(response);
      toast.success(response.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPickerKey((current) => current + 1);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="page-header">Import Lab</h1>
        <p className="text-sm text-surface-400 max-w-3xl">
          Upload a spreadsheet or any other file from the admin area and trigger the H2 migration flow from the browser.
          Spreadsheet workbooks are imported into generated H2 tables; non-spreadsheet files are rejected with a clear error.
        </p>
      </div>

      <div className="card space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-500/15 text-primary-300 flex items-center justify-center shrink-0">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h2 className="section-title mb-1">Upload And Import</h2>
            <p className="text-sm text-surface-400">
              Selected files are sent to the admin import endpoint and run through the spreadsheet migration service you already have on the backend.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-dashed border-surface-600 bg-surface-800/50 p-4 space-y-3">
              <label className="label">Choose File</label>
              <input
                key={pickerKey}
                type="file"
                className="input"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-surface-500">
                Any file can be selected here. The migration runner only imports readable spreadsheet workbooks.
              </p>
            </div>

            <label className="flex items-center gap-3 text-sm text-surface-300">
              <input
                type="checkbox"
                checked={dropExisting}
                onChange={(event) => setDropExisting(event.target.checked)}
                className="rounded border-surface-600 bg-surface-800 text-primary-500"
              />
              Replace existing generated import tables before loading the new workbook
            </label>

            {selectedFile && (
              <div className="rounded-2xl bg-surface-800/70 border border-surface-700 px-4 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
                  <p className="text-xs text-surface-500">{selectedFile.size.toLocaleString()} bytes</p>
                </div>
                <button type="button" className="btn-secondary btn-sm" onClick={clearSelection}>Clear</button>
              </div>
            )}

            {errorMessage && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{errorMessage}</div>}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={handleUpload}
                disabled={isSubmitting || !selectedFile}
              >
                {isSubmitting ? 'Forging Tables...' : 'Forge Data Tables'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setResult(null)} disabled={!result || isSubmitting}>Reset Results</button>
            </div>
          </div>

          <div className="rounded-2xl border border-surface-700 bg-surface-800/60 p-4 space-y-3">
            <h3 className="font-semibold text-white">Creative Button Ideas</h3>
            <div className="flex flex-wrap gap-2">
              {CREATIVE_BUTTON_NAMES.map((name) => (
                <span key={name} className="px-3 py-1 rounded-full bg-surface-700 text-xs text-surface-200">{name}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="card space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="section-title mb-1">Latest Import Result</h2>
              <p className="text-sm text-surface-400">{result.message}</p>
            </div>
            <div className="text-sm text-surface-400">Run ID: <span className="text-white font-medium">{result.importRunId}</span></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-surface-800/70 border border-surface-700 px-4 py-4">
              <div className="flex items-center gap-3 mb-2 text-primary-300"><FileText className="w-4 h-4" /><span className="text-xs uppercase tracking-wide">Workbook</span></div>
              <div className="text-white font-medium break-all">{result.workbookName}</div>
            </div>
            <div className="rounded-2xl bg-surface-800/70 border border-surface-700 px-4 py-4">
              <div className="flex items-center gap-3 mb-2 text-primary-300"><Upload className="w-4 h-4" /><span className="text-xs uppercase tracking-wide">Sheets Imported</span></div>
              <div className="text-2xl font-bold text-white">{result.importedSheets}</div>
            </div>
            <div className="rounded-2xl bg-surface-800/70 border border-surface-700 px-4 py-4">
              <div className="flex items-center gap-3 mb-2 text-primary-300"><Database className="w-4 h-4" /><span className="text-xs uppercase tracking-wide">Rows Loaded</span></div>
              <div className="text-2xl font-bold text-white">{result.importedRows}</div>
            </div>
          </div>

          <div className="space-y-3">
            {result.sheets.map((sheet) => (
              <div key={`${sheet.sheetName}-${sheet.tableName}`} className="rounded-2xl border border-surface-700 bg-surface-800/60 px-4 py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-white">{sheet.sheetName}</p>
                  <p className="text-sm text-surface-400">Imported into {sheet.tableName}</p>
                </div>
                <div className="flex gap-4 text-sm text-surface-300">
                  <span>Header row {sheet.headerRowNumber}</span>
                  <span>{sheet.dataRowCount} rows</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}