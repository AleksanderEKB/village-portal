// frontend/src/features/posts/components/PostForm.tsx
import React, { useEffect, useState, ChangeEvent, FormEvent, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../axiosInstance';
import { RootState } from '../../../app/store';
import { PostExtended, User } from '../../../types/globalTypes';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import { validatePostForm, isImageFile, PostFormValidationErrors } from '../utils/validatePostForm';
import '../styles/scss_post-form/main.scss';
import formStyles from '../styles/form.module.scss';

interface PostFormProps {
  mode: 'create' | 'edit';
}

const PostForm: React.FC<PostFormProps> = ({ mode }) => {
  const { postId } = useParams<{ postId: string }>();
  const user = useSelector<RootState, User | null>((state) => state.auth.user);
  const navigate = useNavigate();

  const [body, setBody] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<PostFormValidationErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // мемо-проверка, можно ли сабмитить
  const isSubmitDisabled = loading || Object.keys(validationErrors).length > 0;

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    if (mode === 'edit' && postId) {
      axiosInstance.get<PostExtended>(`/api/post/${postId}/`)
        .then(res => {
          setBody(res.data.body);
          setCurrentImage(res.data.image ?? null);
          setImagePreview(res.data.image ?? null);
        });
    }
  }, [mode, postId]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [body]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (file && !isImageFile(file)) {
      toast.error('Файл не является изображением');
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

  // авто-валидация на каждый ввод/изменение картинки/режима
  useEffect(() => {
    const errs = validatePostForm({
      body,
      image,
      isEdit: mode === 'edit',
      hasExistingImage: !!currentImage,
    });
    setValidationErrors(errs);
  }, [body, image, currentImage, mode]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    // Актуализируем валидацию перед сабмитом
    const errors = validatePostForm({
      body,
      image,
      isEdit: mode === 'edit',
      hasExistingImage: !!currentImage
    });
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('author', String(user.id));
      formData.append('body', body);

      if (image) {
        formData.append('image', image);
      } else if (mode === 'edit' && !currentImage) {
        formData.append('image', '');
      }

      if (mode === 'create') {
        await axiosInstance.post('/api/post/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else if (mode === 'edit' && postId) {
        await axiosInstance.put(`/api/post/${postId}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/profile');
    } catch (error) {
      console.error(error);
      toast.error('Ошибка отправки формы');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
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

  const hasAnyImage = Boolean(image || imagePreview || currentImage);
  const fileLabelText = hasAnyImage ? 'Изменить изображение' : 'Выбрать изображение';

  return (
    <>
      <h1 className={formStyles.postFormHeading}>{mode === 'create' ? 'Новый пост' : 'Редактировать пост'}</h1>
      <div className={formStyles.createEditContainer}>
        {imagePreview && (
          <div className={formStyles.mainImagePreview}>
            <img src={imagePreview} alt="Превью" />
            <button
              type="button"
              onClick={handleRemoveImage}
              aria-label="Удалить"
              title="Удалить"
              className={formStyles.removeImageBtn}
            >
              <FontAwesomeIcon className={formStyles.iconRemove} icon={faCircleXmark} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
          <textarea
            ref={textareaRef}
            name="body"
            value={body}
            placeholder="Введите текст"
            onChange={handleTextareaChange}
            required
            style={{ resize: 'none', overflow: 'hidden' }}
            aria-invalid={!!validationErrors.body}
            aria-describedby={validationErrors.body ? 'post-body-error' : undefined}
          />
          {validationErrors.body && (
              <div id="post-body-error" className={formStyles.formFieldError}>{validationErrors.body}</div>
          )}

          <div className={formStyles.postInputContainer}>
            <input
              id="file-input"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
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
              <div id="post-image-error" className="form-field-error">{validationErrors.image}</div>
            )}
          </div>

          {mode === 'edit' && currentImage && !image && !imagePreview && (
            <div className="current-image-preview">
              <img src={currentImage} alt="Текущее изображение" style={{ maxWidth: 200 }} />
              <button
                type="button"
                onClick={() => {
                  setCurrentImage(null);
                  setImagePreview(null);
                }}
              >
                Удалить изображение
              </button>
            </div>
          )}

          <div className={formStyles.centerBtn}>
            <button
              className={formStyles.createSaveBtn}
              type="submit"
              disabled={isSubmitDisabled}
              aria-disabled={isSubmitDisabled}
            >
              {loading ? 'Отправка...' : (mode === 'create' ? 'Создать' : 'Сохранить')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PostForm;
