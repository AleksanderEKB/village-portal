// frontend/src/features/shared/components/Paginations.tsx
import React from 'react';
import { getSmartPageNumbers } from '../utils/pagination';

type PaginationProps = {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  prevLabel?: string;
  nextLabel?: string;
  className?: string;
};

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  setPage,
  prevLabel = 'Назад',
  nextLabel = 'Вперед',
  className = '',
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`pag-container ${className}`}>
      <button
        className="pag-button arrow-left"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        <span className="pag-arrow-label">{prevLabel}</span>
      </button>
      {getSmartPageNumbers(page, totalPages).map((i, idx) =>
        i === '...' ? (
          <span className="pag-ellipsis" key={`e${idx}`}>...</span>
        ) : (
          <button
            key={i}
            className={`pag-button${page === i ? ' active' : ''}`}
            onClick={() => setPage(Number(i))}
            disabled={page === i}
          >
            {i}
          </button>
        )
      )}
      <button
        className="pag-button arrow-right"
        disabled={page === totalPages || totalPages === 0}
        onClick={() => setPage(page + 1)}
      >
        <span className="pag-arrow-label">{nextLabel}</span>
      </button>
    </div>
  );
};

export default Pagination;
