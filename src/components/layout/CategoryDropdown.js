'use client';

import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutGrid, Sparkles, Shirt, Laptop, Home,
  UtensilsCrossed, Trophy, Gamepad2, Package, ChevronDown, Check
} from 'lucide-react';
import { setFilter } from '@/store/slices/dealsSlice';
import styles from './CategoryDropdown.module.css';

const CATEGORIES = [
  { value: 'All',     label: 'All Categories', Icon: LayoutGrid },
  { value: 'Beauty',  label: 'Beauty',         Icon: Sparkles },
  { value: 'Fashion', label: 'Fashion',        Icon: Shirt },
  { value: 'Tech',    label: 'Technology',     Icon: Laptop },
  { value: 'Home',    label: 'Home & Garden',  Icon: Home },
  { value: 'Food',    label: 'Food & Drink',   Icon: UtensilsCrossed },
  { value: 'Sports',  label: 'Sports',         Icon: Trophy },
  { value: 'Gaming',  label: 'Gaming',         Icon: Gamepad2 },
  { value: 'Other',   label: 'Other',          Icon: Package },
];

export default function CategoryDropdown() {
  const dispatch = useDispatch();
  const { filters } = useSelector((s) => s.deals);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = CATEGORIES.find((c) => c.value === filters.category) || CATEGORIES[0];
  const CurrentIcon = current.Icon;

  const handleSelect = (value) => {
    dispatch(setFilter({ category: value }));
    setOpen(false);
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button className={styles.trigger} onClick={() => setOpen(!open)}>
        <CurrentIcon size={14} strokeWidth={2.2} />
        <span className={styles.triggerLabel}>{current.label}</span>
        <ChevronDown
          size={13}
          strokeWidth={2.2}
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
        />
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.grid}>
            {CATEGORIES.map((cat) => {
              const active = cat.value === filters.category;
              return (
                <button
                  key={cat.value}
                  onClick={() => handleSelect(cat.value)}
                  className={`${styles.item} ${active ? styles.itemActive : ''}`}
                >
                  <cat.Icon size={15} strokeWidth={2.2} />
                  <span>{cat.label}</span>
                  {active && <Check size={13} strokeWidth={2.5} className={styles.checkIcon} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}