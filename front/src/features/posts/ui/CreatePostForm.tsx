// front/src/features/posts/ui/CreatePostForm.tsx
import React from 'react';
import styles from './createPostForm.module.scss';
import { useAppDispatch, useAppSelector } from '../../../app/hook';
import { createPostThunk } from '../model/slice';
import { selectIsAuth } from '../../auth/model/selectors';
import { toast } from 'react-toastify';
import { validateImageFile } from '../../shared/utils/validateFile';

const CreatePostForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuth = useAppSelector(selectIsAuth);
  const [content, setContent] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);

  const textRef = React.useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const autoResize = React.useCallback(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  React.useEffect(() => {
    autoResize();
  }, [autoResize, content]);

  if (!isAuth) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && !file) return;
    // Дополнительная проверка безопасности на сабмите
    if (!validateImageFile(file, (msg) => toast.error(msg))) {
      return;
    }
    await dispatch(createPostThunk({ content, image: file })).unwrap();
    setContent('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    requestAnimationFrame(() => autoResize());
  };

  const onChangeContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    requestAnimationFrame(() => autoResize());
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!validateImageFile(f, (msg) => toast.error(msg))) {
      // Сбрасываем инпут и состояние, если не изображение
      e.currentTarget.value = '';
      setFile(null);
      return;
    }
    setFile(f);
  };

  return (
    <form className={styles.createForm} onSubmit={onSubmit}>
      <textarea
        ref={textRef}
        placeholder="Что у вас нового?"
        value={content}
        onChange={onChangeContent}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onSelectFile}
      />
      <div className={styles.actions}>
        <button type="submit">Опубликовать</button>
      </div>
    </form>
  );
};

export default CreatePostForm;
