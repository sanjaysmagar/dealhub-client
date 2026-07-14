'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import {
  Shield, Search, CheckCircle, XCircle, Trash2, Package,
  ShieldAlert, LogIn, ShieldCheck, ShieldX
} from 'lucide-react';
import { fetchAdminDeals, moderateDeal, deleteDeal } from '@/store/slices/dealsSlice';
import { CAT_STYLES, formatPrice, timeAgo } from '@/lib/utils';
import styles from './page.module.css';

export default function AdminClient() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { adminDeals, adminCounts, loading } = useSelector((s) => s.deals);

  const [status, setStatus] = useState('all');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    dispatch(fetchAdminDeals({ status, search: searchInput || undefined, limit: 50 }));
  }, [dispatch, user, status, searchInput]);

  // ── Not logged in ──
  if (!user) {
    return (
      <div className={styles.wrap}>
        <div className={styles.lockedWrap}>
          <div className={styles.lockedIconBox}>
            <Shield size={26} color="#dc2626" strokeWidth={2} />
          </div>
          <div className={styles.lockedTitle}>Sign in required</div>
          <div className={styles.lockedDesc}>You need to sign in with an admin account to view this page.</div>
          <Link href="/login" className={styles.lockedBtn}>
            <LogIn size={14} strokeWidth={2.5} style={{ marginRight: 6 }} />
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // ── Not an admin ──
  if (user.role !== 'admin') {
    return (
      <div className={styles.wrap}>
        <div className={styles.lockedWrap}>
          <div className={styles.lockedIconBox}>
            <ShieldAlert size={26} color="#dc2626" strokeWidth={2} />
          </div>
          <div className={styles.lockedTitle}>Access Denied</div>
          <div className={styles.lockedDesc}>
            This area is restricted to administrators only. Your current role is &quot;{user.role}&quot;.
          </div>
          <Link href="/" className={styles.lockedBtn}>Back to Home</Link>
        </div>
      </div>
    );
  }

  const handleModerate = (id, newStatus) => {
    dispatch(moderateDeal({ id, status: newStatus }));
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Permanently delete "${title}"? This cannot be undone.`)) {
      dispatch(deleteDeal(id));
    }
  };

  return (
    <div className={styles.wrap}>

      <div className={styles.header}>
        <div className={styles.title}>
          <Shield size={22} color="#111111" strokeWidth={2} />
          Admin Panel
        </div>
        <div className={styles.subtitle}>Moderate and manage all deals on the platform</div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIconBox} style={{ background: '#f0f0f0' }}>
            <Package size={18} color="#111111" strokeWidth={2} />
          </div>
          <div>
            <div className={styles.statValue}>{adminCounts.total}</div>
            <div className={styles.statLabel}>Total Deals</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconBox} style={{ background: '#f0fdf4' }}>
            <ShieldCheck size={18} color="#16a34a" strokeWidth={2} />
          </div>
          <div>
            <div className={styles.statValue} style={{ color: '#16a34a' }}>{adminCounts.approved}</div>
            <div className={styles.statLabel}>Approved</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconBox} style={{ background: '#fef2f2' }}>
            <ShieldX size={18} color="#dc2626" strokeWidth={2} />
          </div>
          <div>
            <div className={styles.statValue} style={{ color: '#dc2626' }}>{adminCounts.rejected}</div>
            <div className={styles.statLabel}>Rejected</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterRow}>
        <div className={styles.tabs}>
          {['all', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`${styles.tabBtn} ${status === s ? styles.tabBtnActive : ''}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className={styles.searchBox}>
          <Search size={14} color="#a8a29e" strokeWidth={2} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title..."
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* List */}
      {loading && (
        <>{[1, 2, 3, 4].map((i) => <div key={i} className={styles.skeletonRow} />)}</>
      )}

      {!loading && adminDeals.length === 0 && (
        <div className={styles.emptyState}>
          <Package size={36} strokeWidth={1.5} className={styles.emptyIcon} />
          <div className={styles.emptyTitle}>No deals found</div>
        </div>
      )}

      {!loading && adminDeals.map((deal) => {
        const cat = CAT_STYLES[deal.category] || CAT_STYLES.Other;
        return (
          <div key={deal._id} className={styles.dealRow}>
            <div className={styles.dealImg} style={{ background: cat.gradient }}>
              {cat.emoji}
            </div>
            <div className={styles.dealInfo}>
              <div className={styles.dealTitle}>{deal.title}</div>
              <div className={styles.dealMeta}>
                <span className={styles.dealPrice}>{formatPrice(deal.discountedPrice)}</span>
                <span>{deal.category}</span>
                <span className={styles.dealPoster}>@{deal.postedBy?.username || 'unknown'}</span>
                <span>{timeAgo(deal.createdAt)}</span>
                <span className={`${styles.statusPill} ${deal.status === 'approved' ? styles.statusApproved : styles.statusRejected}`}>
                  {deal.status === 'approved'
                    ? <><CheckCircle size={10} strokeWidth={3} /> Approved</>
                    : <><XCircle size={10} strokeWidth={3} /> Rejected</>
                  }
                </span>
              </div>
            </div>
            <div className={styles.dealActions}>
              {deal.status !== 'approved' && (
                <button
                  className={`${styles.actionBtn} ${styles.approveBtn}`}
                  onClick={() => handleModerate(deal._id, 'approved')}
                >
                  <CheckCircle size={13} strokeWidth={2.5} /> Approve
                </button>
              )}
              {deal.status !== 'rejected' && (
                <button
                  className={`${styles.actionBtn} ${styles.rejectBtn}`}
                  onClick={() => handleModerate(deal._id, 'rejected')}
                >
                  <XCircle size={13} strokeWidth={2.5} /> Reject
                </button>
              )}
              <button
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                onClick={() => handleDelete(deal._id, deal.title)}
              >
                <Trash2 size={13} color="#dc2626" strokeWidth={2} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}