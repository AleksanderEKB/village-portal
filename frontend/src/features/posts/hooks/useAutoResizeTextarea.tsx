import { useEffect } from 'react';

type Args = {
  ref: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
};

export function useAutoResizeTextarea({ ref, value }: Args) {
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value, ref]);
}
