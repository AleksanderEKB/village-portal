// src/features/posts/model/hooks/useAddButtonFade.ts
import React from 'react';

type UseAddButtonFadeParams = {
  fadeMs: number;
};

type UseAddButtonFadeReturn = {
  addBtnVisible: boolean;
  hideWithFade: (onAfterFade?: () => void) => void;
  showWithFade: (onAfterFade?: () => void) => void;
};

export const useAddButtonFade = ({ fadeMs }: UseAddButtonFadeParams): UseAddButtonFadeReturn => {
  const [addBtnVisible, setAddBtnVisible] = React.useState(true);
  const timerRef = React.useRef<number | null>(null);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hideWithFade = React.useCallback(
    (onAfterFade?: () => void) => {
      if (!addBtnVisible) return;
      setAddBtnVisible(false);
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        onAfterFade?.();
      }, fadeMs);
    },
    [addBtnVisible, clearTimer, fadeMs]
  );

  const showWithFade = React.useCallback(
    (onAfterFade?: () => void) => {
      if (addBtnVisible) return;
      setAddBtnVisible(true);
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        onAfterFade?.();
      }, fadeMs);
    },
    [addBtnVisible, clearTimer, fadeMs]
  );

  React.useEffect(() => () => clearTimer(), [clearTimer]);

  return { addBtnVisible, hideWithFade, showWithFade };
};
