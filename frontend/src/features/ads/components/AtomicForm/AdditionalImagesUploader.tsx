// frontend/src/features/ads/components/AdditionalImagesUploader.tsx
import React from 'react';
import { InputRef } from './_types';

type Props = {
  inputRef: InputRef;
  disabled: boolean;
  remaining: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validationError?: string;
};

const AdditionalImagesUploader: React.FC<Props> = ({
  inputRef,
  disabled,
  remaining,
  onChange,
  validationError,
}) => {
  return (
    <>
      <div className="upload-btn-wrapper">
        <input
          type="file"
          accept="image/*"
          multiple
          id="additional-img-upload"
          style={{ display: 'none' }}
          onChange={(e) => {
            onChange(e);
            if (inputRef.current) {
              inputRef.current.value = '';
            }
          }}
          disabled={disabled}
          ref={inputRef as React.RefObject<HTMLInputElement>}
        />
        <label htmlFor="additional-img-upload" className="upload-btn">
          Дополнительные изображения (осталось {remaining})
        </label>
      </div>
      {validationError && <div className="error">{validationError}</div>}
    </>
  );
};

export default AdditionalImagesUploader;
