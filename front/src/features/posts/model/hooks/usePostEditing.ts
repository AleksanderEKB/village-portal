// front/src/features/posts/model/hooks/usePostEditing.ts
import React from 'react';

type UsePostEditingParams = {
  initialContent: string;
  onSave: (content: string) => Promise<void> | void;
};

type UsePostEditingResult = {
  editing: boolean;
  draft: string;
  setDraft: React.Dispatch<React.SetStateAction<string>>;
  startEdit: () => void;
  cancelEdit: () => void;
  saveEdit: () => Promise<void>;
};

export function usePostEditing({
  initialContent,
  onSave,
}: UsePostEditingParams): UsePostEditingResult {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(initialContent ?? '');

  // Синхронизация драфта при изменении initialContent, когда не редактируем.
  React.useEffect(() => {
    if (!editing) setDraft(initialContent ?? '');
  }, [initialContent, editing]);

  const startEdit = React.useCallback(() => {
    setEditing(true);
  }, []);

  const cancelEdit = React.useCallback(() => {
    setEditing(false);
    setDraft(initialContent ?? '');
  }, [initialContent]);

  const saveEdit = React.useCallback(async () => {
    await onSave(draft);
    setEditing(false);
  }, [draft, onSave]);

  return { editing, draft, setDraft, startEdit, cancelEdit, saveEdit };
}
