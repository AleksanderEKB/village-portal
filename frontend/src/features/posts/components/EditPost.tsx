// frontend/src/features/posts/components/EditPost.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../../../axiosInstance';
import type { RootState } from '../../../app/store';
import type { PostExtended, User } from '../../../types/globalTypes';

const EditPost: React.FC = () => {
  const [body, setBody] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('Файл не выбран');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user) as User | null;

  useEffect(() => {
    if (!postId) return;
    axiosInstance.get<PostExtended>(`/api/post/${postId}/`)
      .then(response => {
        setBody(response.data.body);
        setCurrentImage(response.data.image ?? null);
      })
      .catch(error => console.error(error));
  }, [postId]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setFileName(file ? file.name : 'Файл не выбран');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    try {
      const updatedPost = new FormData();
      updatedPost.append('author', String(user.id));
      updatedPost.append('body', body);

      if (image) {
        updatedPost.append('image', image);
      } else if (currentImage === null) {
        updatedPost.append('image', '');
      }

      await axiosInstance.put(`/api/post/${postId}/`, updatedPost, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/profile');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='create-edit-container'>
      <h1>Редактировать пост</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <div className="createpost-input-container">
          <p>Загрузить изображение для поста</p>
          <input
            id="file-input"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          <label htmlFor="file-input" className="createpost-input-label">Выбрать файл</label>
          <span className="file-chosen">{fileName}</span>
        </div>
        <button className='save-btn' type="submit">Сохранить</button>
      </form>
    </div>
  );
};

export default EditPost;
