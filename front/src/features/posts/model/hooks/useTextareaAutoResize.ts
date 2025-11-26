// src/features/posts/model/hooks/useTextareaAutoResize.ts
import React from 'react';

type UseTextareaAutoResizeReturn = {
  textRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  autoResize: () => void;
  focus: () => void;
};

export const useTextareaAutoResize = (): UseTextareaAutoResizeReturn => {
  const textRef = React.useRef<HTMLTextAreaElement | null>(null);

  const autoResize = React.useCallback(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  const focus = React.useCallback(() => {
    textRef.current?.focus();
  }, []);

  return { textRef, autoResize, focus };
};
