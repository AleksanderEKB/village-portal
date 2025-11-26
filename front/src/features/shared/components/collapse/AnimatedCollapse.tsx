import React from 'react';
import cx from 'clsx';
import styles from './animatedCollapse.module.scss';

type AnimatedCollapseProps = {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;

  heightOpenDuration?: number;
  heightCloseDuration?: number;
  heightOpenEasing?: string;
  heightCloseEasing?: string;

  contentInDuration?: number;
  contentOutDuration?: number;
  contentInEasing?: string;
  contentOutEasing?: string;

  translateY?: number;
  opacityFrom?: number;

  unmountOnClose?: boolean;

  onAfterOpen?: () => void;
  onAfterClose?: () => void;
};

type Phase =
  | 'closed'
  | 'expanding'
  | 'content-in'
  | 'expanded'
  | 'hiding'
  | 'collapsing';

const AnimatedCollapse: React.FC<AnimatedCollapseProps> = ({
  isOpen,
  children,
  className,
  innerClassName,

  heightOpenDuration = 780,
  heightCloseDuration = 700,
  heightOpenEasing = 'cubic-bezier(0.22, 0.72, 0.22, 1)',
  heightCloseEasing = 'cubic-bezier(0.2, 0.6, 0.2, 1)',

  contentInDuration = 520,
  contentOutDuration = 420,
  contentInEasing = 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  contentOutEasing = 'cubic-bezier(0.2, 0.6, 0.2, 1)',

  translateY = 10,
  opacityFrom = 0,

  unmountOnClose = false,

  onAfterOpen,
  onAfterClose,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const [mounted, setMounted] = React.useState(isOpen || !unmountOnClose);
  const [phase, setPhase] = React.useState<Phase>(isOpen ? 'expanded' : 'closed');

  const prevIsOpen = React.useRef<boolean>(isOpen);

  // Проставляем CSS-переменные
  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    node.style.setProperty('--ac-height-open-duration', `${heightOpenDuration}ms`);
    node.style.setProperty('--ac-height-close-duration', `${heightCloseDuration}ms`);
    node.style.setProperty('--ac-height-open-easing', heightOpenEasing);
    node.style.setProperty('--ac-height-close-easing', heightCloseEasing);

    node.style.setProperty('--ac-content-in-duration', `${contentInDuration}ms`);
    node.style.setProperty('--ac-content-out-duration', `${contentOutDuration}ms`);
    node.style.setProperty('--ac-content-in-easing', contentInEasing);
    node.style.setProperty('--ac-content-out-easing', contentOutEasing);

    node.style.setProperty('--ac-translate', `${translateY}px`);
    node.style.setProperty('--ac-opacity-from', `${opacityFrom}`);
  }, [
    heightOpenDuration,
    heightCloseDuration,
    heightOpenEasing,
    heightCloseEasing,
    contentInDuration,
    contentOutDuration,
    contentInEasing,
    contentOutEasing,
    translateY,
    opacityFrom,
  ]);

  const clearHeightTransition = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    // Полностью гасим любые переходы высоты
    el.style.transitionProperty = 'none';
    el.style.transitionDuration = '0ms';
    el.style.transitionTimingFunction = 'ease';
    el.style.removeProperty('transition'); // страховка
  }, []);

  // Страховка: в стабильных фазах гарантированно выключаем transition
  React.useEffect(() => {
    if (phase === 'expanded' || phase === 'closed') {
      clearHeightTransition();
      const el = containerRef.current;
      if (el) {
        el.style.height = phase === 'expanded' ? 'auto' : '0px';
        el.style.overflow = phase === 'expanded' ? 'visible' : 'hidden';
        el.style.willChange = 'auto';
      }
    }
  }, [phase, clearHeightTransition]);

  // Анимируем ТОЛЬКО при реальной смене isOpen
  React.useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    if (prevIsOpen.current === isOpen) {
      // isOpen не менялся — ничего не делаем (важно, чтобы ввод текста не трогал анимации)
      return;
    }
    prevIsOpen.current = isOpen;

    let onHeightEnd: ((e: TransitionEvent) => void) | null = null;
    let onContentEnd: ((e: TransitionEvent) => void) | null = null;

    const cleanup = () => {
      if (onHeightEnd) container.removeEventListener('transitionend', onHeightEnd);
      if (onContentEnd) content.removeEventListener('transitionend', onContentEnd);
      onHeightEnd = null;
      onContentEnd = null;
    };

    // Перед запуском любой новой анимации — погасим старые transition
    clearHeightTransition();

    if (isOpen) {
      if (unmountOnClose && !mounted) setMounted(true);
      setPhase('expanding');

      requestAnimationFrame(() => {
        const target = content.scrollHeight;

        container.style.overflow = 'hidden';
        container.style.willChange = 'height';
        container.style.height = '0px';

        // Включаем transition высоты только на время этой фазы
        container.style.transitionProperty = 'height';
        container.style.transitionDuration = `var(--ac-height-open-duration)`;
        container.style.transitionTimingFunction = `var(--ac-height-open-easing)`;

        // force reflow
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        container.offsetHeight;

        container.style.height = `${target}px`;

        onHeightEnd = (e: TransitionEvent) => {
          if (e.propertyName !== 'height') return;
          container.removeEventListener('transitionend', onHeightEnd!);

          container.style.height = 'auto';
          container.style.overflow = 'visible';
          container.style.willChange = 'auto';
          clearHeightTransition();

          setPhase('content-in');

          requestAnimationFrame(() => {
            onContentEnd = (ee: TransitionEvent) => {
              if (ee.propertyName !== 'opacity' && ee.propertyName !== 'transform') return;
              content.removeEventListener('transitionend', onContentEnd!);
              setPhase('expanded');
              onAfterOpen?.();
            };
            content.addEventListener('transitionend', onContentEnd);
          });
        };

        container.addEventListener('transitionend', onHeightEnd);
      });
    } else {
      setPhase('hiding');

      requestAnimationFrame(() => {
        onContentEnd = (e: TransitionEvent) => {
          if (e.propertyName !== 'opacity' && e.propertyName !== 'transform') return;
          content.removeEventListener('transitionend', onContentEnd!);

          setPhase('collapsing');

          const currentHeight =
            container.getBoundingClientRect().height || container.scrollHeight;

          container.style.overflow = 'hidden';
          container.style.willChange = 'height';
          container.style.height = `${currentHeight}px`;

          container.style.transitionProperty = 'height';
          container.style.transitionDuration = `var(--ac-height-close-duration)`;
          container.style.transitionTimingFunction = `var(--ac-height-close-easing)`;

          // force reflow
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          container.offsetHeight;

          container.style.height = '0px';

          onHeightEnd = (ee: TransitionEvent) => {
            if (ee.propertyName !== 'height') return;
            container.removeEventListener('transitionend', onHeightEnd!);

            container.style.overflow = 'hidden';
            container.style.willChange = 'auto';
            clearHeightTransition();

            setPhase('closed');
            if (unmountOnClose) setMounted(false);
            onAfterClose?.();
          };
          container.addEventListener('transitionend', onHeightEnd);
        };

        content.addEventListener('transitionend', onContentEnd);
      });
    }

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, unmountOnClose, mounted, onAfterOpen, onAfterClose, clearHeightTransition]);

  return (
    <div
      ref={containerRef}
      className={cx(styles.collapse, className)}
      data-phase={phase}
    >
      <div
        ref={contentRef}
        className={cx(styles.inner, innerClassName)}
      >
        {mounted ? children : null}
      </div>
    </div>
  );
};

export default AnimatedCollapse;
