import { useCallback, useEffect, useState } from 'react';
import { PostFormValidationErrors, validatePostForm } from '../utils/validatePostForm';

type Args = {
  body: string;
  image: File | null;
  mode: 'create' | 'edit';
  hasExistingImage: boolean;
};

export function usePostFormValidation({ body, image, mode, hasExistingImage }: Args) {
  const [validationErrors, setValidationErrors] = useState<PostFormValidationErrors>({});

  const compute = useCallback(() => {
    return validatePostForm({
      body,
      image,
      isEdit: mode === 'edit',
      hasExistingImage,
    });
  }, [body, image, mode, hasExistingImage]);

  useEffect(() => {
    setValidationErrors(compute());
  }, [compute]);

  const revalidate = () => {
    setValidationErrors(compute());
  };

  return { validationErrors, setValidationErrors, revalidate };
}
