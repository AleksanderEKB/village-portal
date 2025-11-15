// front/src/features/posts/ui/detail/ContentEditor.tsx
import React from 'react';
import styles from '../posts.module.scss';

type Props = {
  draft: string;
  setDraft: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export const ContentEditor: React.FC<Props> = ({
  draft,
  setDraft,
  onSave,
  onCancel
}) => {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className={styles.content}
        style={{
          border: '1px solid #ccd2d9',
          borderRadius: 8,
          padding: 8,
          background: '#fff'
        }}
        placeholder="Текст поста"
      />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            border: 0,
            background: '#eef2f7',
            padding: '10px 14px',
            borderRadius: 8,
            cursor: 'pointer'
          }}
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={onSave}
          style={{
            border: 0,
            background: '#5865f2',
            color: '#fff',
            fontWeight: 700,
            padding: '10px 14px',
            borderRadius: 8,
            cursor: 'pointer'
          }}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};
