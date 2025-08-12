import { useEffect, useState } from 'react';
import axiosInstance from '../../../axiosInstance';
import { PostExtended } from '../../../types/globalTypes';

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
    axiosInstance
      .get<PostExtended>(`/api/post/${postId}/`)
      .then((res) => {
        if (!isMounted) return;
        setBody(res.data.body);
        setCurrentImage(res.data.image ?? null);
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
