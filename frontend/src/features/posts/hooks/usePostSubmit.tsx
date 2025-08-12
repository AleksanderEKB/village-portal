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
  onError?: () => void;
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
    } catch (e) {
      console.error(e);
      onError?.();
    } finally {
      setLoadingSubmit(false);
    }
  };

  return { loadingSubmit, handleSubmit };
}
