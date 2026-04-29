'use client';
import { motion } from 'framer-motion';
import Button from './Button';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;

  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="ghost"
        size="small"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← Prev
      </Button>

      {start > 1 && (
        <>
          <PageButton page={1} onClick={onPageChange} isActive={currentPage === 1} />
          {start > 2 && <span className="px-2 text-gray-400">...</span>}
        </>
      )}

      {pages.map((page) => (
        <PageButton
          key={page}
          page={page}
          onClick={onPageChange}
          isActive={currentPage === page}
        />
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}
          <PageButton
            page={totalPages}
            onClick={onPageChange}
            isActive={currentPage === totalPages}
          />
        </>
      )}

      <Button
        variant="ghost"
        size="small"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next →
      </Button>
    </div>
  );
}

function PageButton({ page, onClick, isActive }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onClick(page)}
      className={`w-10 h-10 rounded-xl font-medium text-sm transition-all ${
        isActive
          ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      {page}
    </motion.button>
  );
}