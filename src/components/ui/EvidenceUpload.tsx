/**
 * EvidenceUpload.tsx
 *
 * Reusable component that lets users pick a file (image/PDF/doc),
 * converts it to a base64 data-URL for localStorage persistence,
 * and shows a live preview.
 *
 * Props:
 *   value     – current data-URL string (or undefined)
 *   onChange  – called with the new data-URL (or undefined when cleared)
 *   maxSizeMB – soft limit; shows a warning if exceeded (default 2)
 */

import { useRef, useState, useCallback, type ChangeEvent } from 'react';
import { Upload, X, Image, FileText, AlertTriangle } from 'lucide-react';

interface Props {
  readonly value?: string;
  readonly onChange: (dataUrl: string | undefined) => void;
  readonly maxSizeMB?: number;
}

const ACCEPTED_TYPES =
  'image/png,image/jpeg,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function isImage(dataUrl: string): boolean {
  return dataUrl.startsWith('data:image/');
}

function getFileLabel(dataUrl: string): string {
  if (dataUrl.startsWith('data:application/pdf')) return 'PDF Document';
  if (dataUrl.startsWith('data:application/msword')) return 'Word Document';
  if (dataUrl.startsWith('data:application/vnd.openxmlformats')) return 'Word Document';
  return 'Document';
}

export default function EvidenceUpload({ value, onChange, maxSizeMB = 2 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sizeWarning, setSizeWarning] = useState(false);
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      setSizeWarning(false);

      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        setSizeWarning(true);
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        onChange(result);
      };
      reader.readAsDataURL(file);
    },
    [onChange, maxSizeMB],
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleClear = () => {
    onChange(undefined);
    setSizeWarning(false);
  };

  return (
    <div className="evidence-upload">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        id="evidence-file"
        accept={ACCEPTED_TYPES}
        className="evidence-upload__input"
        onChange={handleFileChange}
        aria-label="Upload evidence"
      />

      {value ? (
        /* ── Preview state ──────────────────────────────────────── */
        <div className="evidence-upload__preview">
          {isImage(value) ? (
            <img
              src={value}
              alt="Evidence preview"
              className="evidence-upload__image"
            />
          ) : (
            <div className="evidence-upload__file-icon">
              <FileText size={32} />
              <span>{getFileLabel(value)}</span>
            </div>
          )}

          <button
            type="button"
            className="evidence-upload__clear"
            onClick={handleClear}
            aria-label="Remove evidence"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        /* ── Drop zone / browse state ───────────────────────────── */
        <button
          type="button"
          className={`evidence-upload__dropzone ${dragging ? 'evidence-upload__dropzone--active' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload size={24} className="evidence-upload__icon" />
          <span className="evidence-upload__label">
            Drag & drop or <strong>browse</strong>
          </span>
          <span className="evidence-upload__hint">
            <Image size={12} /> PNG, JPG, WebP, PDF, DOC
          </span>
        </button>
      )}

      {sizeWarning && (
        <div className="evidence-upload__warning">
          <AlertTriangle size={14} />
          File exceeds {maxSizeMB} MB — large files may slow the app.
        </div>
      )}
    </div>
  );
}
