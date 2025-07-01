import React from 'react';

interface Props {
  images: Array<{ id: number | string; image: string }>;
  setGalleryIndex: (idx: number) => void;
  setGalleryOpen: (open: boolean) => void;
  adTitle: string;
}

const GalleryThumbnails: React.FC<Props> = ({ images, setGalleryIndex, setGalleryOpen, adTitle }) => {
  if (images.length <= 1) return null;
  return (
    <div className="ads-images-gallery">
      {images.slice(1).map((img, idx) => (
        <img
          key={img.id}
          src={img.image}
          alt={`Фото ${adTitle}`}
          className="ads-gallery-image"
          onClick={() => {
            setGalleryIndex(idx + 1);
            setGalleryOpen(true);
          }}
        />
      ))}
    </div>
  );
};

export default React.memo(GalleryThumbnails);
