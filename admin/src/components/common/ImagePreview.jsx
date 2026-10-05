import React, { useState } from 'react';
import { ZoomIn, X, Image as ImageIcon } from 'lucide-react';
import Modal from './Modal';

export const ImagePreview = ({
  src,
  alt = 'Image preview',
  onRemove = null,
  aspectRatio = '1 / 1',
  width = '120px',
  className = '',
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!src) {
    return (
      <div
        className={`ui-image-placeholder ${className}`}
        style={{ width, aspectRatio }}
      >
        <ImageIcon size={24} className="placeholder-icon" />
        <span className="placeholder-text">No Image</span>
      </div>
    );
  }

  return (
    <>
      <div className={`ui-image-preview-wrapper ${className}`} style={{ width, aspectRatio }}>
        <img src={src} alt={alt} className="ui-image-thumb" />

        <div className="ui-image-overlay">
          <button
            type="button"
            className="overlay-action-btn"
            onClick={() => setIsZoomed(true)}
            title="Enlarge"
            aria-label="Enlarge image"
          >
            <ZoomIn size={16} />
          </button>
          {onRemove && (
            <button
              type="button"
              className="overlay-action-btn danger"
              onClick={onRemove}
              title="Remove"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {isZoomed && (
        <Modal
          isOpen={isZoomed}
          onClose={() => setIsZoomed(false)}
          title={alt}
          size="lg"
        >
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
            <img
              src={src}
              alt={alt}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius-md)',
              }}
            />
          </div>
        </Modal>
      )}
    </>
  );
};

export default ImagePreview;
