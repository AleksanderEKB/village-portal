// front/src/features/posts/ui/CreatePostForm.tsx
import React from 'react';
import styles from './posts.module.scss';
import { useAppDispatch, useAppSelector } from '../../../app/hook';
import { createPostThunk } from '../model/slice';
import { selectIsAuth } from '../../auth/model/selectors';

const CreatePostForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuth = useAppSelector(selectIsAuth);
  const [content, setContent] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);

  if (!isAuth) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && !file) return;
    await dispatch(createPostThunk({ content, image: file })).unwrap();
    setContent('');
    setFile(null);
  };

  return (
    <form className={styles.createForm} onSubmit={onSubmit}>
      <textarea
        placeholder="Что у вас нового?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <div className={styles.actions}>
        <button type="submit">Опубликовать</button>
      </div>
    </form>
  );
};

export default CreatePostForm;
