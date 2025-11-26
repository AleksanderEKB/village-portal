// src/features/posts/model/hooks/useImagePickerState.ts
import React from 'react';

type UseImagePickerStateReturn = {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  pickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  confirmPicker: (picked: File | null) => void;
  removeSelected: () => void;
};

export const useImagePickerState = (initialFile: File | null = null): UseImagePickerStateReturn => {
  const [file, setFile] = React.useState<File | null>(initialFile);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const openPicker = React.useCallback(() => setPickerOpen(true), []);
  const closePicker = React.useCallback(() => setPickerOpen(false), []);
  const confirmPicker = React.useCallback((picked: File | null) => setFile(picked), []);
  const removeSelected = React.useCallback(() => setFile(null), []);

  return {
    file,
    setFile,
    pickerOpen,
    openPicker,
    closePicker,
    confirmPicker,
    removeSelected,
  };
};
