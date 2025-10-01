// front/src/features/shared/components/dropmenu/DropdownMenu.tsx
import React from 'react';
import styles from './dropMenu.module.scss';

interface DropMenuProps {
  open: boolean;
  className?: string;
  style?: React.CSSProperties; // NEW
  children: React.ReactNode;
}

const DropMenu = React.forwardRef<HTMLDivElement, DropMenuProps>(
  ({ open, className = '', style, children }, ref) => (
    <div
      ref={ref}
      className={`${styles.menu} ${open ? styles.menuOpen : ''} ${className}`}
      role="menu"
      style={style} // NEW
    >
      {children}
    </div>
  )
);

DropMenu.displayName = 'DropMenu';

export default DropMenu;
