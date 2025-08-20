// frontend/src/features/ads/components/MainImageUploader.tsx
import React from 'react';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { InputRef } from './_types';

type Props = {
  mainImageInputRef: InputRef;
  form: {
    main_image: File | null;
    main_image_url: string | null;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  validationError?: string;
};

const MainImageUploader: React.FC<Props> = ({
  mainImageInputRef,
  form,
  onChange,
  onClear,
  validationError,
}) => {
  return (
    <>
      <div className="upload-btn-wrapper">
        <input
          type="file"
          accept="image/*"
          id="main-img-upload"
          style={{ display: 'none' }}
          onChange={(e) => {
            onChange(e);
            if (mainImageInputRef.current) {
              mainImageInputRef.current.value = '';
            }
          }}
          ref={mainImageInputRef as React.RefObject<HTMLInputElement>}
        />
        <label htmlFor="main-img-upload" className="upload-btn">
          {form.main_image || form.main_image_url
            ? 'Изменить изображение'
            : 'Добавить основное изображение'}
        </label>
      </div>

      {(form.main_image || form.main_image_url) && (
        <div className="main-image-preview">
          {form.main_image ? (
            form.main_image.type?.startsWith('image/') ? (
              <img src={URL.createObjectURL(form.main_image)} alt="Превью" />
            ) : (
              <div className="no-image">Не изображение</div>
            )
          ) : (
            <img src={form.main_image_url!} alt="Превью" />
          )}
          <button
            type="button"
            onClick={onClear}
            aria-label="Очистить основное изображение"
            title="Очистить"
            className="remove-image-btn"
          >
            <FontAwesomeIcon className="icon-remove" icon={faCircleXmark} />
          </button>
        </div>
      )}

      {validationError && <div className="error">{validationError}</div>}
    </>
  );
};

export default MainImageUploader;
