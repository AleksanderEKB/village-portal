// src/features/posts/model/hooks/useCreatePostForm.ts
import React from 'react';
import { AppDispatch } from '../../../../app/store'; // если нужен тип, либо можно не использовать
import { createPostThunk } from '../slice';
import { validateImageFile } from '../../../shared/utils/validateFile';

type UseCreatePostFormParams = {
  dispatch: any; // можно заменить на AppDispatch, если импорт доступен
  onError: (msg: string) => void;
  onAfterSuccess?: () => void; // колбэк после успешной публикации (например, закрыть форму)
};

type UseCreatePostFormReturn = {
  isOpen: boolean;
  openForm: () => void;
  closeForm: () => void;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  onChangeContent: (e: React.ChangeEvent<HTMLTextAreaElement>, onAfterChange?: () => void) => void;
  onSubmit: (e: React.FormEvent, file: File | null) => Promise<void>;
  resetForm: (onAfterReset?: () => void) => void;
};

export const useCreatePostForm = ({
  dispatch,
  onError,
  onAfterSuccess,
}: UseCreatePostFormParams): UseCreatePostFormReturn => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [content, setContent] = React.useState('');

  const openForm = React.useCallback(() => setIsOpen(true), []);
  const closeForm = React.useCallback(() => setIsOpen(false), []);

  const resetForm = React.useCallback((onAfterReset?: () => void) => {
    setContent('');
    onAfterReset?.();
  }, []);

  const onChangeContent = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>, onAfterChange?: () => void) => {
      setContent(e.target.value);
      requestAnimationFrame(() => onAfterChange?.());
    },
    []
  );

  const onSubmit = React.useCallback(
    async (e: React.FormEvent, file: File | null) => {
      e.preventDefault();
      const trimmed = content.trim();

      if (!trimmed && !file) return;

      if (!validateImageFile(file, onError)) {
        return;
      }

      await dispatch(createPostThunk({ content: trimmed, image: file })).unwrap();
      onAfterSuccess?.();
    },
    [content, dispatch, onAfterSuccess, onError]
  );

  return {
    isOpen,
    openForm,
    closeForm,
    content,
    setContent,
    onChangeContent,
    onSubmit,
    resetForm,
  };
};
