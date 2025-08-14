// frontend/src/features/posts/hooks/usePostSubmit.tsx
import { useState } from 'react';
import { PostFormValidationErrors } from '../utils/validatePostForm';
import { apiCreatePost, apiUpdatePost } from '../utils/postsApi'; // <-- имя модуля
import { buildPostFormData } from '../utils/formData';
import { extractHttpError } from '../../shared/utils/httpError';

type Args = {
  mode: 'create' | 'edit';
  postId?: string;
  getAuthorId: () => string;
  body: string;
  image: File | null;
  currentImage: string | null;
  onStart?: () => void;
  onValidate: (errors: PostFormValidationErrors) => boolean;
  onSuccess?: () => void;
  onError?: (message?: string) => void;
};

export function usePostSubmit({
  mode,
  postId,
  getAuthorId,
  body,
  image,
  currentImage,
  onStart,
  onValidate,
  onSuccess,
  onError,
}: Args) {
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const handleSubmit = async () => {
    const canSubmit = onValidate({});
    if (!canSubmit) return;

    setLoadingSubmit(true);
    onStart?.();

    try {
      const formData = buildPostFormData({
        authorId: getAuthorId(),
        body,
        image,
        mode,
        hasCurrentImage: !!currentImage,
      });

      if (mode === 'create') {
        await apiCreatePost(formData);
      } else if (mode === 'edit' && postId) {
        await apiUpdatePost(postId, formData);
      }
      onSuccess?.();
    } catch (e: any) {
      console.error(e);
      const { status, message } = extractHttpError(e);
      if (status === 429) return;
      onError?.(message ?? 'Ошибка отправки формы');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return { loadingSubmit, handleSubmit };
}
