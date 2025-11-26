// front/src/features/posts/model/hooks/useDropdownMenu.ts
import React from 'react';

type UseDropdownMenuResult = {
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  wrapperRef: React.MutableRefObject<HTMLDivElement | null>;
};

export function useDropdownMenu(): UseDropdownMenuResult {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!menuOpen) return;

    const onDocDown = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setMenuOpen(false);
    };

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onEsc);

    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [menuOpen]);

  return { menuOpen, setMenuOpen, wrapperRef };
}
