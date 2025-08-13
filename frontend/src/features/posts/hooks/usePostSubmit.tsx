// frontend/src/features/posts/hooks/usePostSubmit.tsx
import { useState } from 'react';
import { PostFormValidationErrors } from '../utils/validatePostForm';
import { createPost, updatePost } from '../utils/postsApi';
import { buildPostFormData } from '../utils/formData';

type Args = {
  mode: 'create' | 'edit';
  postId?: string;
  getAuthorId: () => string; // чтобы не тянуть Redux внутрь хука
  body: string;
  image: File | null;
  currentImage: string | null;

  onStart?: () => void;
  onValidate: (errors: PostFormValidationErrors) => boolean;
  onSuccess?: () => void;
  onError?: (message?: string) => void; // <-- пробрасываем текст ошибки
};

function pickMessageFromData(data: any): string | undefined {
  if (!data) return undefined;
  if (typeof data === 'string') return data;
  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.error === 'string') return data.error;
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
    return String(data.non_field_errors[0]);
  }
  return undefined;
}

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
    // локальная валидация (передана извне — уже посчитана и положена в стейт)
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
        await createPost(formData);
      } else if (mode === 'edit' && postId) {
        await updatePost(postId, formData);
      }
      onSuccess?.();
    } catch (e: any) {
      console.error(e);

      let message: string | undefined;

      // Axios-стек
      if (e?.response) {
        message = pickMessageFromData(e.response.data);
        if (!message && typeof e.response.status === 'number') {
          if (e.response.status === 429) {
            message = 'Не больше 5 постов в минуту';
          }
        }
      } else if (typeof Response !== 'undefined' && e instanceof Response) {
        // Fetch-стек: e — сам Response
        try {
          const data = await e.clone().json();
          message = pickMessageFromData(data);
        } catch {
          // игнорируем ошибки парсинга
        }
        if (!message && e.status === 429) {
          message = 'Не больше 5 постов в минуту';
        }
      }

      onError?.(message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return { loadingSubmit, handleSubmit };
}
