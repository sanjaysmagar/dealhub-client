'use client';

import { useDispatch, useSelector } from 'react-redux';
import { setFilter } from '@/store/slices/dealsSlice';
import styles from './CategoryStrip.module.css';

const CATEGORIES = [
  { label: 'All',     icon: '⚡' },
  { label: 'Beauty',  icon: '💄' },
  { label: 'Fashion', icon: '👗' },
  { label: 'Tech',    icon: '🎧' },
  { label: 'Home',    icon: '🏡' },
  { label: 'Food',    icon: '🍕' },
  { label: 'Sports',  icon: '⚽' },
  { label: 'Gaming',  icon: '🎮' },
  { label: 'Other',   icon: '🎁' },
];

export default function CategoryStrip() {
  const dispatch = useDispatch();
  const { filters } = useSelector((s) => s.deals);
  const activeCategory = filters.category;

  const handleClick = (label) => {
    dispatch(setFilter({ category: label }));
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            onClick={() => handleClick(cat.label)}
            className={`${styles.pill} ${
              activeCategory === cat.label ? styles.pillActive : ''
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}