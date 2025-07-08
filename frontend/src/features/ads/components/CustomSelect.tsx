import React, { useRef, useEffect, useState } from 'react';
import type { AdsCategory } from '../../../types/globalTypes';

type Option = { value: AdsCategory; label: string };

interface CustomSelectProps {
  options: Option[];
  value: AdsCategory;
  name: string;
  onChange: (payload: { name: string; value: AdsCategory }) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, name, onChange }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelect = (option: Option) => {
    onChange({ name, value: option.value });
    setOpen(false);
  };

  const current = options.find(opt => opt.value === value);

  return (
    <div className="custom-select__wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="custom-select__display"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current ? current.label : "Выберите..."}
        <span className="custom-select__arrow" />
      </button>
      <div className={`custom-select__dropdown${open ? ' open' : ''}`}>
        <ul className="custom-select__list" role="listbox">
          {options.map((option, idx) => (
            <li
              key={option.value}
              className={`custom-select__item${option.value === value ? ' selected' : ''}`}
              style={{ transitionDelay: open ? `${idx * 70}ms` : '0ms' }}
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CustomSelect;
