// frontend/src/features/posts/components/CreatePost.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axiosInstance';
import { RootState } from '../../../app/store';
import { User } from '../../../types/globalTypes';

const CreatePost: React.FC = () => {
  const [body, setBody] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('Файл не выбран');
  const navigate = useNavigate();
  const user = useSelector<RootState, User | null>((state) => state.auth.user);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setImage(file || null);
    setFileName(file ? file.name : 'Файл не выбран');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    try {
      const newPost = new FormData();
      newPost.append('author', user.id.toString());
      newPost.append('body', body);
      if (image) {
        newPost.append('image', image);
      }
      await axiosInstance.post('/api/post/', newPost, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/profile');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='create-edit-container'>
      <h1>Создать пост</h1>
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
        <button type="submit">Создать</button>
      </form>
    </div>
  );
};

export default CreatePost;
