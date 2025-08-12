import { ChangeEvent, RefObject, useEffect, useRef, useState } from 'react';
import { isImageFile } from '../utils/validatePostForm';

type Args = {
  mode: 'create' | 'edit';
  fileInputRef: RefObject<HTMLInputElement | null>;
  setCurrentImage: (v: string | null) => void;
  onInvalidFile?: () => void;
};

export function useImagePreview({ mode, fileInputRef, setCurrentImage, onInvalidFile }: Args) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    setValidationErrors: (fn: (prev: Record<string, string | undefined>) => Record<string, string | undefined>) => void
  ) => {
    const file = e.target.files?.[0] || null;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (file && !isImageFile(file)) {
      onInvalidFile?.();
      setValidationErrors(prev => ({ ...prev, image: 'Файл не является изображением' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      setImage(null);
      setImagePreview(null);
      return;
    }

    setValidationErrors(prev => ({ ...prev, image: undefined }));
    setImage(file);

    if (file) {
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setImagePreview(url);
      setCurrentImage(null);
    } else {
      setImagePreview(null);
    }
  };

  const handleRemoveImage = ({
    mode,
    setValidationErrors,
    fileInputRef,
  }: {
    mode: 'create' | 'edit';
    setValidationErrors: (fn: (prev: Record<string, string | undefined>) => Record<string, string | undefined>) => void;
    fileInputRef: RefObject<HTMLInputElement | null>;
  }) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (mode === 'edit') setCurrentImage(null);
    setValidationErrors(prev => ({ ...prev, image: undefined }));
  };

  return {
    image,
    setImage,
    imagePreview,
    setImagePreview,
    handleImageChange,
    handleRemoveImage,
  };
}
