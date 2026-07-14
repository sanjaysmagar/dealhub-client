'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X, Flame, Clock, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchDeals, setFilter } from '@/store/slices/dealsSlice';
import CategoryStrip from '@/components/layout/CategoryStrip';
import DealCard from '@/components/deals/DealCard';
import styles from './page.module.css';

const SORT_OPTIONS = [
  { key: 'hot', label: 'Hot', Icon: Flame      },
  { key: 'new', label: 'New', Icon: Clock      },
  { key: 'top', label: 'Top', Icon: TrendingUp },
];

function SkeletonCard() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonImg} />
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonLine} style={{ width: '60%' }} />
        <div className={styles.skeletonLine} style={{ width: '100%' }} />
        <div className={styles.skeletonLine} style={{ width: '80%' }} />
        <div className={styles.skeletonLine} style={{ width: '40%', marginTop: '4px' }} />
      </div>
    </div>
  );
}

export default function DealsClient() {
  const dispatch = useDispatch();
  const { deals, loading, error, filters, pagination } = useSelector((s) => s.deals);

  const [searchInput, setSearchInput] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);

  // Pick up ?search= from URL on first load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('search');
    if (q) {
      setSearchInput(q);
      dispatch(setFilter({ search: q }));
    }
  }, [dispatch]);

  useEffect(() => {
    const params = {
      sort:  filters.sort,
      page:  filters.page,
      limit: 12,
      ...(filters.category !== 'All' && { category: filters.category }),
      ...(filters.search && { search: filters.search }),
    };
    dispatch(fetchDeals(params));
  }, [dispatch, filters.category, filters.sort, filters.search, filters.page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilter({ search: searchInput.trim() }));
  };

  const clearSearch = () => {
    setSearchInput('');
    dispatch(setFilter({ search: '' }));
  };

  const handleSort = (key) => dispatch(setFilter({ sort: key }));
  const goToPage = (p) => dispatch(setFilter({ page: p }));

  const totalPages = pagination?.pages || 1;
  const currentPage = filters.page;

  // Build a compact page number list e.g. 1 ... 4 5 6 ... 10
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className={styles.wrap}>
      <CategoryStrip />

      <div className={styles.main}>
        <div className={styles.headerRow}>
          <div>
            <div className={styles.pageTitle}>Browse Deals</div>
          </div>
        </div>
        <div className={styles.pageSub}>
          Search, filter, and discover the best community-verified deals
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit}>
          <div className={`${styles.searchBar} ${searchFocus ? styles.searchBarFocused : ''}`}>
            <Search size={16} color="#a8a29e" strokeWidth={2} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              placeholder="Search deals, brands, categories..."
              className={styles.searchInput}
            />
            {searchInput && (
              <button type="button" className={styles.clearSearchBtn} onClick={clearSearch}>
                <X size={16} strokeWidth={2} />
              </button>
            )}
          </div>
        </form>

        {/* Sort bar */}
        <div className={styles.sortBar}>
          <div className={styles.resultsCount}>
            {pagination?.total > 0 && (
              <>
                <span className={styles.resultsCountStrong}>{pagination.total}</span> deals found
                {filters.search && <> for &quot;{filters.search}&quot;</>}
              </>
            )}
          </div>
          <div className={styles.sortBtns}>
            {SORT_OPTIONS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => handleSort(key)}
                className={`${styles.sortBtn} ${filters.sort === key ? styles.sortBtnActive : ''}`}
              >
                <Icon size={12} strokeWidth={filters.sort === key ? 2.5 : 2} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {loading && Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}

          {!loading && error && (
            <div className={styles.stateBox}>
              <div className={styles.stateIcon}>⚠️</div>
              <div className={styles.stateTitle}>Something went wrong</div>
              <div className={styles.stateDesc}>{error}</div>
            </div>
          )}

          {!loading && !error && deals.length === 0 && (
            <div className={styles.stateBox}>
              <Search size={40} strokeWidth={1.5} className={styles.stateIcon} />
              <div className={styles.stateTitle}>No deals found</div>
              <div className={styles.stateDesc}>
                {filters.search
                  ? `Nothing matched "${filters.search}". Try a different search.`
                  : 'Try a different category or check back later.'}
              </div>
            </div>
          )}

          {!loading && !error && deals.map((deal, i) => (
            <DealCard key={deal._id} deal={deal} index={i} />
          ))}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              <ChevronLeft size={14} strokeWidth={2.5} />
            </button>

            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`e${i}`} className={styles.pageEllipsis}>...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`${styles.pageBtn} ${p === currentPage ? styles.pageBtnActive : ''}`}
                >
                  {p}
                </button>
              )
            )}

            <button
              className={styles.pageBtn}
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}