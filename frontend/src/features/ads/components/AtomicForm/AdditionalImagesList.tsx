// frontend/src/features/ads/components/AdditionalImagesList.tsx
import React from 'react';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type ServerImage = { id: number; image: string; order: number };

type Props = {
  serverImages: ServerImage[];
  images: File[];
  onRemoveServerImage: (id: number) => void;
  onRemoveImage: (idx: number) => void;
  show: boolean;
};

const AdditionalImagesList: React.FC<Props> = ({
  serverImages,
  images,
  onRemoveServerImage,
  onRemoveImage,
  show,
}) => {
  if (!show || (serverImages.length === 0 && images.length === 0)) return null;

  return (
    <div className="additional-images-list">
      {serverImages.map((img, idx) => (
        <div className="img-thumb" key={img.id}>
          <img src={img.image} alt={`image_${idx}`} />
          <button
            type="button"
            onClick={() => onRemoveServerImage(img.id)}
            aria-label="Удалить"
            className="remove-image-btn"
          >
            <FontAwesomeIcon className="icon-remove" icon={faCircleXmark} />
          </button>
        </div>
      ))}

      {images.map((file, idx) => (
        <div className="img-thumb" key={file.name + idx}>
          <img src={URL.createObjectURL(file)} alt={file.name} />
          <button
            type="button"
            onClick={() => onRemoveImage(idx)}
            aria-label="Удалить"
            className="remove-image-btn"
          >
            <FontAwesomeIcon className="icon-remove" icon={faCircleXmark} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdditionalImagesList;
