// frontend/src/features/ads/components/ImageGalleryModal.tsx

import React, { useEffect, useCallback } from 'react';

type GalleryImage = {
  id: number | string;
  image: string;
};

interface ImageGalleryModalProps {
  images: GalleryImage[];
  initialIndex: number;
  onClose: () => void;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  images,
  initialIndex,
  onClose,
}) => {
  const [current, setCurrent] = React.useState(initialIndex);

  // Закрытие по ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line
  }, [current, images.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  }, [images.length]);

  if (!images.length) return null;

  return (
    <div className="gallery-modal-overlay" onClick={onClose}>
      <div className="gallery-modal-content" onClick={e => e.stopPropagation()}>
        <button className="gallery-close" onClick={onClose} title="Закрыть">×</button>
        <img
          src={images[current].image}
          alt={`Фото ${current + 1}`}
          className="gallery-modal-image"
        />
        {images.length > 1 && (
          <>
            <button className="gallery-nav gallery-nav-left" onClick={prev} title="Назад">‹</button>
            <button className="gallery-nav gallery-nav-right" onClick={next} title="Вперёд">›</button>
          </>
        )}
        <div className="gallery-modal-counter">
          {current + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

export default ImageGalleryModal;
