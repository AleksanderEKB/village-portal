// frontend/src/features/posts/components/PostForm.tsx
import React, { useEffect, useState, ChangeEvent, FormEvent, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../axiosInstance';
import { RootState } from '../../../app/store';
import { PostExtended, User } from '../../../types/globalTypes';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/scss_post-form/main.scss';

interface PostFormProps {
  mode: 'create' | 'edit';
}

const PostForm: React.FC<PostFormProps> = ({ mode }) => {
  const { postId } = useParams<{ postId: string }>();
  const user = useSelector<RootState, User | null>((state) => state.auth.user);
  const navigate = useNavigate();

  const [body, setBody] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('Файл не выбран');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Автоматический рост textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  // Загрузка поста при редактировании
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

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setFileName(file ? file.name : 'Файл не выбран');
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('author', String(user.id));
      formData.append('body', body);
      if (image) {
        formData.append('image', image);
      } else if (mode === 'edit' && !currentImage) {
        formData.append('image', ''); // чтобы удалить на сервере
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
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setFileName('Файл не выбран');
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (mode === 'edit') setCurrentImage(null);
  };

  return (
    <>
      <h1 className="ads-form__heading">{mode === 'create' ? 'Новый пост' : 'Редактировать пост'}</h1>
      <div className='create-edit-container'>
        {imagePreview && (
          <div className="main-image-preview">
            <img src={imagePreview} alt="Превью" />
            <button
              type="button"
              onClick={handleRemoveImage}
              aria-label="Удалить"
              title="Удалить"
              className="remove-image-btn"
            >
              <FontAwesomeIcon className="icon-remove" icon={faCircleXmark} />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <textarea
            ref={textareaRef}
            name="body"
            value={body}
            placeholder="Введите текст"
            onChange={handleTextareaChange}
            required
            style={{ resize: 'none', overflow: 'hidden' }}
          />

          <div className="createpost-input-container">
            <p>Загрузить изображение для поста</p>
            <input
              id="file-input"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
            />
            <label htmlFor="file-input" className="createpost-input-label">Выбрать файл</label>
            <span className="file-chosen">{fileName}</span>
          </div>
          {mode === 'edit' && currentImage && !image && !imagePreview && (
            <div className="current-image-preview">
              <img src={currentImage} alt="Текущее изображение" style={{ maxWidth: 200 }} />
              <button type="button" onClick={() => {
                setCurrentImage(null);
                setImagePreview(null);
              }}>
                Удалить изображение
              </button>
            </div>
          )}
          <button type="submit" disabled={loading}>
            {loading ? 'Отправка...' : (mode === 'create' ? 'Создать' : 'Сохранить')}
          </button>
        </form>
      </div>
    </>
  );
};

export default PostForm;
