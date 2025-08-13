// frontend/src/features/posts/components/PostForm.tsx
import React, { ChangeEvent, FormEvent, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../../app/store';
import { User } from '../../../types/globalTypes';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import { PostFormValidationErrors } from '../utils/validatePostForm';
import formStyles from '../styles/form.module.scss';
import { usePostLoader } from '../hooks/usePostLoader';
import { useAutoResizeTextarea } from '../hooks/useAutoResizeTextarea';
import { useImagePreview } from '../hooks/useImagePreview';
import { usePostFormValidation } from '../hooks/usePostFormValidation';
import { usePostSubmit } from '../hooks/usePostSubmit';

interface PostFormProps {
  mode: 'create' | 'edit';
}

const PostForm: React.FC<PostFormProps> = ({ mode }) => {
  const { postId } = useParams<{ postId: string }>();
  const user = useSelector<RootState, User | null>((state) => state.auth.user);
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    body,
    setBody,
    currentImage,
    setCurrentImage,
    setInitialDataLoaded,
    loading: loadingFetch,
  } = usePostLoader({ mode, postId });

  const { image, imagePreview, setImagePreview, handleRemoveImage, handleImageChange } =
    useImagePreview({
      mode,
      fileInputRef,
      setCurrentImage,
      onInvalidFile: () => toast.error('Файл не является изображением'),
    });

  useAutoResizeTextarea({ ref: textareaRef, value: body });

  const { validationErrors, setValidationErrors, revalidate } = usePostFormValidation({
    body,
    image,
    mode,
    hasExistingImage: !!currentImage,
  });

  const { loadingSubmit, handleSubmit } = usePostSubmit({
    mode,
    postId,
    getAuthorId: () => (user ? String(user.id) : ''),
    body,
    image,
    currentImage,
    onStart: () => {
      setValidationErrors({});
    },
    onValidate: (errors: PostFormValidationErrors) => {
      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    },
    onSuccess: () => {
      navigate('/profile');
    },
    onError: (message?: string) => {
      toast.error(message ?? 'Ошибка отправки формы');
    },
  });

  React.useEffect(() => {
    setInitialDataLoaded(true);
  }, [setInitialDataLoaded]);

  const isSubmitDisabled = loadingFetch || loadingSubmit || Object.keys(validationErrors).length > 0;
  const hasAnyImage = Boolean(image || imagePreview || currentImage);
  const fileLabelText = hasAnyImage ? 'Изменить изображение' : 'Выбрать изображение';

  const onTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e, setValidationErrors);
  };

  const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    revalidate();
    handleSubmit();
  };

  return (
    <>
      <h1 className={formStyles.postFormHeading}>
        {mode === 'create' ? 'Новый пост' : 'Редактировать пост'}
      </h1>

      <div className={formStyles.createEditContainer}>
        <form onSubmit={onFormSubmit} encType="multipart/form-data" noValidate>
          {(imagePreview || currentImage) && (
            <div className={formStyles.mainImagePreview}>
              <img src={imagePreview || currentImage!} alt="Превью" />
              <button
                type="button"
                onClick={() => handleRemoveImage({ mode, setValidationErrors, fileInputRef })}
                aria-label="Удалить"
                title="Удалить"
                className={formStyles.removeImageBtn}
              >
                <FontAwesomeIcon className={formStyles.iconRemove} icon={faCircleXmark} />
              </button>
            </div>
          )}

          <textarea
            ref={textareaRef}
            name="body"
            value={body}
            placeholder="Введите текст"
            onChange={onTextareaChange}
            required
            style={{ resize: 'none', overflow: 'hidden' }}
            aria-invalid={!!validationErrors.body}
            aria-describedby={validationErrors.body ? 'post-body-error' : undefined}
          />
          {validationErrors.body && (
            <div id="post-body-error" className={formStyles.formFieldError}>
              {validationErrors.body}
            </div>
          )}

          <div className={formStyles.postInputContainer}>
            <input
              id="file-input"
              type="file"
              name="image"
              accept="image/*"
              onChange={onFileChange}
              ref={fileInputRef}
              aria-invalid={!!validationErrors.image}
              aria-describedby={validationErrors.image ? 'post-image-error' : undefined}
            />
            <div className={formStyles.centerBtn}>
              <label htmlFor="file-input" className={formStyles.createEditInputLabel}>
                {fileLabelText}
              </label>
            </div>
            {validationErrors.image && (
              <div id="post-image-error">{validationErrors.image}</div>
            )}
          </div>

          <div className={formStyles.centerBtn}>
            <button
              className={formStyles.createSaveBtn}
              type="submit"
              disabled={isSubmitDisabled}
              aria-disabled={isSubmitDisabled}
            >
              {loadingSubmit ? 'Отправка...' : (mode === 'create' ? 'Создать' : 'Сохранить')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PostForm;
