// frontend/src/features/posts/hooks/usePostLoader.tsx
import { useEffect, useState } from 'react';
import { apiFetchPost } from '../utils/postsApi';
import type { PostExtended } from '../../../types/globalTypes';

type Args = {
  mode: 'create' | 'edit';
  postId?: string;
};

export function usePostLoader({ mode, postId }: Args) {
  const [body, setBody] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    if (mode !== 'edit' || !postId) return;

    let isMounted = true;
    setLoading(true);
    apiFetchPost(postId)
      .then((data: PostExtended) => {
        if (!isMounted) return;
        setBody(data.body);
        setCurrentImage(data.image ?? null);
        setInitialDataLoaded(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [mode, postId]);

  return {
    body,
    setBody,
    currentImage,
    setCurrentImage,
    loading,
    initialDataLoaded,
    setInitialDataLoaded,
  };
}
