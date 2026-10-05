import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, Check } from 'lucide-react';

export const FileUpload = ({
  label,
  accept = 'image/*,.pdf,.csv,.xlsx',
  maxSizeMb = 10,
  onFileSelect,
  error,
  helperText,
  disabled = false,
  className = '',
}) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Check size limit
    if (file.size > maxSizeMb * 1024 * 1024) {
      setFileError(`File size exceeds maximum allowed ${maxSizeMb} MB`);
      return;
    }

    setFileError('');
    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  const displayError = error || fileError;

  return (
    <div className={`ui-file-upload-container ${displayError ? 'has-error' : ''} ${className}`}>
      {label && <label className="ui-label">{label}</label>}

      <div
        className={`ui-dropzone ${dragActive ? 'is-dragover' : ''} ${disabled ? 'is-disabled' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />

        {selectedFile ? (
          <div className="ui-selected-file">
            <div className="file-info-row">
              <File size={22} className="file-icon" />
              <div className="file-meta">
                <span className="file-name">{selectedFile.name}</span>
                <span className="file-size">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
            <button
              type="button"
              className="file-remove-btn"
              onClick={handleRemove}
              title="Remove file"
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="ui-dropzone-prompt">
            <div className="upload-icon-wrapper">
              <UploadCloud size={28} />
            </div>
            <div className="upload-text-group">
              <span className="upload-title">
                Click to upload <span>or drag and drop</span>
              </span>
              <span className="upload-hint">
                Accepted: {accept} (Max {maxSizeMb} MB)
              </span>
            </div>
          </div>
        )}
      </div>

      {displayError && <span className="ui-error-text" role="alert">{displayError}</span>}
      {!displayError && helperText && <span className="ui-helper-text">{helperText}</span>}
    </div>
  );
};

export default FileUpload;
