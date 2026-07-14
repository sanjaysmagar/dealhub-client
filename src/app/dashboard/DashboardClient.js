'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import {
  User, Star, Package, Link2, Edit2, Trash2, X, Check,
  LogIn, Plus, MousePointer, Zap, Copy, ShoppingBag,
  AlertTriangle, Loader2
} from 'lucide-react';
import { fetchMyDeals, updateDeal, deleteDeal } from '@/store/slices/dealsSlice';
import { fetchMyLinks } from '@/store/slices/affiliateSlice';
import { updateProfile, clearError } from '@/store/slices/authSlice';
import { CAT_STYLES, formatPrice, timeAgo } from '@/lib/utils';
import styles from './page.module.css';

const CATEGORIES = ['Beauty', 'Fashion', 'Tech', 'Home', 'Food', 'Sports', 'Gaming', 'Other'];

export default function DashboardClient() {
  const dispatch = useDispatch();
const { user, error: profileError } = useSelector((s) => s.auth);
  const { myDeals } = useSelector((s) => s.deals);
  const { myLinks } = useSelector((s) => s.affiliate);

  const [tab, setTab] = useState('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ username: '', preferences: [] });
  const [editDeal, setEditDeal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!user) return;
    setProfileForm({ username: user.username, preferences: user.preferences || [] });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (tab === 'deals') {
      setLoadingDeals(true);
      dispatch(fetchMyDeals()).finally(() => setLoadingDeals(false));
    }
    if (tab === 'links') {
      setLoadingLinks(true);
      dispatch(fetchMyLinks()).finally(() => setLoadingLinks(false));
    }
  }, [dispatch, tab, user]);

  // ── Not logged in ──
  if (!user) {
    return (
      <div className={styles.wrap}>
        <div className={styles.lockedWrap}>
          <div className={styles.lockedIconBox}>
            <User size={26} color="#111111" strokeWidth={2} />
          </div>
          <div className={styles.lockedTitle}>Sign in to see your dashboard</div>
          <div className={styles.lockedDesc}>
            Manage your profile, posted deals, and affiliate links.
          </div>
          <Link href="/login" className={styles.lockedBtn}>
            <LogIn size={14} strokeWidth={2.5} />
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const togglePref = (cat) => {
    setProfileForm((f) => ({
      ...f,
      preferences: f.preferences.includes(cat)
        ? f.preferences.filter((p) => p !== cat)
        : [...f.preferences, cat],
    }));
  };

const saveProfile = async () => {
  const result = await dispatch(updateProfile(profileForm));
  if (updateProfile.fulfilled.match(result)) {
    setEditingProfile(false);
  }
  // if rejected, stay open so the error is visible and the person can fix it
};

const cancelEditProfile = () => {
  setProfileForm({ username: user.username, preferences: user.preferences || [] });
  dispatch(clearError());
  setEditingProfile(false);
};

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link.shareUrl || `${window.location.origin}/api/affiliate/go/${link.trackingCode}`);
    setCopiedId(link._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalClicks = myLinks.reduce((sum, l) => sum + (l.clicks || 0), 0);
  const totalConversions = myLinks.reduce((sum, l) => sum + (l.conversions || 0), 0);

  return (
    <div className={styles.wrap}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerOverlay} />
        <div className={styles.headerLeft}>
          <div className={styles.avatar}>
            <User size={24} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <div className={styles.username}>@{user.username}</div>
            <div className={styles.email}>{user.email}</div>
          </div>
        </div>
        <div className={styles.pointsBlock}>
          <div className={styles.pointsValue}>{user.points || 0}</div>
          <div className={styles.pointsLabel}>Total Points</div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {[
          { key: 'profile', label: 'Profile',              Icon: User    },
          { key: 'deals',   label: `My Deals (${myDeals.length})`, Icon: Package },
          { key: 'links',   label: `My Links (${myLinks.length})`, Icon: Link2   },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`${styles.tabBtn} ${tab === t.key ? styles.tabBtnActive : ''}`}
          >
            <t.Icon size={14} strokeWidth={tab === t.key ? 2.5 : 2} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════ PROFILE TAB ══════════ */}
      {tab === 'profile' && (
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <span className={styles.profileTitle}>Profile Settings</span>
{!editingProfile && (
  <button
    className={styles.editBtn}
    onClick={() => { dispatch(clearError()); setEditingProfile(true); }}
  >
    <Edit2 size={13} strokeWidth={2.5} />
    Edit
  </button>
)}
          </div>

          {/* Username */}
{/* Username */}
<div className={styles.field}>
  <label className={styles.fieldLabel}>Username</label>
  {editingProfile ? (
    <>
      <input
        value={profileForm.username}
        onChange={(e) => {
          setProfileForm({ ...profileForm, username: e.target.value });
          if (profileError) dispatch(clearError());
        }}
        className={`${styles.textInput} ${profileError ? styles.textInputError : ''}`}
      />
      {profileError && (
        <div className={styles.fieldError}>
          <AlertTriangle size={12} strokeWidth={2.5} />
          {profileError}
        </div>
      )}
    </>
  ) : (
    <div className={styles.fieldValue}>@{user.username}</div>
  )}
</div>

          {/* Email — read only */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Email</label>
            <div className={`${styles.fieldValue} ${styles.fieldValueMuted}`}>{user.email}</div>
          </div>

          {/* Preferences */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Category Interests</label>
            {editingProfile ? (
              <div className={styles.prefGrid}>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => togglePref(c)}
                    className={`${styles.prefPill} ${profileForm.preferences.includes(c) ? styles.prefPillActive : ''}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.prefGrid}>
                {(user.preferences?.length ? user.preferences : ['None set']).map((c) => (
                  <span key={c} className={styles.prefPill}>{c}</span>
                ))}
              </div>
            )}
          </div>

          {editingProfile && (
            <div className={styles.saveRow}>
              <button className={styles.saveBtn} onClick={saveProfile}>
                <Check size={14} strokeWidth={2.5} style={{ marginRight: 5 }} />
                Save Changes
              </button>
              <button className={styles.cancelBtn} onClick={cancelEditProfile}>Cancel</button>
            </div>
          )}

          {/* Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.miniStat}>
              <div className={styles.miniStatValue}>{user.badges?.length || 0}</div>
              <div className={styles.miniStatLabel}>Badges</div>
            </div>
            <div className={styles.miniStat}>
              <div className={styles.miniStatValue}>{myDeals.length}</div>
              <div className={styles.miniStatLabel}>Deals Posted</div>
            </div>
            <div className={styles.miniStat}>
              <div className={styles.miniStatValue}>{myLinks.length}</div>
              <div className={styles.miniStatLabel}>Affiliate Links</div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MY DEALS TAB ══════════ */}
      {tab === 'deals' && (
        <div>
          <div className={styles.dealsHeader}>
            <span className={styles.dealsTitle}>Your Posted Deals</span>
            <Link href="/post" className={styles.postNewBtn}>
              <Plus size={13} strokeWidth={2.5} />
              Post New
            </Link>
          </div>

          {loadingDeals && (
            <>{[1, 2, 3].map((i) => <div key={i} className={styles.skeletonRow} />)}</>
          )}

          {!loadingDeals && myDeals.length === 0 && (
            <div className={styles.emptyState}>
              <Package size={36} strokeWidth={1.5} className={styles.emptyIcon} />
              <div className={styles.emptyTitle}>No deals posted yet</div>
              <div className={styles.emptyDesc}>Share your first deal with the community.</div>
              <Link href="/post" className={styles.emptyBtn}>
                <Plus size={14} strokeWidth={2.5} />
                Post a Deal
              </Link>
            </div>
          )}

          {!loadingDeals && myDeals.map((deal) => {
            const cat = CAT_STYLES[deal.category] || CAT_STYLES.Other;
            return (
              <div key={deal._id} className={styles.dealRow}>
                <div className={styles.dealRowImg} style={{ background: cat.gradient }}>
                  {cat.emoji}
                </div>
                <div className={styles.dealRowInfo}>
                  <div className={styles.dealRowTitle}>{deal.title}</div>
                  <div className={styles.dealRowMeta}>
                    <span className={styles.dealRowPrice}>{formatPrice(deal.discountedPrice)}</span>
                    <span>{timeAgo(deal.createdAt)}</span>
                    <span className={`${styles.statusPill} ${deal.status === 'approved' ? styles.statusApproved : styles.statusRejected}`}>
                      {deal.status}
                    </span>
                  </div>
                </div>
                <div className={styles.dealRowActions}>
                  <button className={styles.iconActionBtn} onClick={() => setEditDeal(deal)}>
                    <Edit2 size={14} color="#78716c" strokeWidth={2} />
                  </button>
                  <button
                    className={`${styles.iconActionBtn} ${styles.iconActionBtnDanger}`}
                    onClick={() => setDeleteTarget(deal)}
                  >
                    <Trash2 size={14} color="#dc2626" strokeWidth={2} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════ MY LINKS TAB ══════════ */}
      {tab === 'links' && (
        <div>
          <div className={styles.statsGrid} style={{ marginBottom: 18 }}>
            <div className={styles.miniStat}>
              <div className={styles.miniStatValue}>{myLinks.length}</div>
              <div className={styles.miniStatLabel}>Active Links</div>
            </div>
            <div className={styles.miniStat}>
              <div className={styles.miniStatValue}>{totalClicks}</div>
              <div className={styles.miniStatLabel}>Total Clicks</div>
            </div>
            <div className={styles.miniStat}>
              <div className={styles.miniStatValue}>{totalConversions}</div>
              <div className={styles.miniStatLabel}>Conversions</div>
            </div>
          </div>

          {loadingLinks && (
            <>{[1, 2].map((i) => <div key={i} className={styles.skeletonRow} />)}</>
          )}

          {!loadingLinks && myLinks.length === 0 && (
            <div className={styles.emptyState}>
              <Link2 size={36} strokeWidth={1.5} className={styles.emptyIcon} />
              <div className={styles.emptyTitle}>No affiliate links yet</div>
              <div className={styles.emptyDesc}>Generate a link from any deal page to start earning.</div>
              <Link href="/" className={styles.emptyBtn}>
                <ShoppingBag size={14} strokeWidth={2.5} />
                Browse Deals
              </Link>
            </div>
          )}

          {!loadingLinks && myLinks.map((link) => {
            const deal = link.dealId || {};
            const cat = CAT_STYLES[deal.category] || CAT_STYLES.Other;
            return (
              <div key={link._id} className={styles.linkCard}>
                <div className={styles.linkCardImg}>{cat.emoji}</div>
                <div className={styles.linkCardInfo}>
                  <div className={styles.linkCardTitle}>{deal.title || 'Deal'}</div>
                  <div className={styles.linkCardStats}>
                    <span className={styles.linkStat}>
                      <MousePointer size={11} strokeWidth={2.5} /> {link.clicks || 0} clicks
                    </span>
                    <span className={styles.linkStat}>
                      <Zap size={11} strokeWidth={2.5} /> {link.conversions || 0} conversions
                    </span>
                    <span className={styles.linkStat}>
                      <Star size={11} strokeWidth={2.5} /> {link.pointsEarned || 0} pts
                    </span>
                  </div>
                </div>
                <button className={styles.copyLinkBtn} onClick={() => handleCopyLink(link)}>
                  {copiedId === link._id
                    ? <><Check size={12} strokeWidth={3} /> Copied</>
                    : <><Copy size={12} strokeWidth={2.5} /> Copy</>
                  }
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════ EDIT DEAL MODAL ══════════ */}
      {editDeal && (
        <EditDealModal
          deal={editDeal}
          onClose={() => setEditDeal(null)}
          onSave={async (updates) => {
            await dispatch(updateDeal({ id: editDeal._id, updates }));
            setEditDeal(null);
          }}
        />
      )}

      {/* ══════════ DELETE CONFIRM MODAL ══════════ */}
      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => setDeleteTarget(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 360 }}>
            <div className={styles.confirmBox}>
              <div className={styles.confirmIcon}>
                <AlertTriangle size={24} color="#dc2626" strokeWidth={2} />
              </div>
              <div className={styles.modalTitle} style={{ marginBottom: 8 }}>Delete this deal?</div>
              <div className={styles.confirmText}>
                &quot;{deleteTarget.title}&quot; will be permanently removed. This can&apos;t be undone.
              </div>
              <div className={styles.confirmActions}>
                <button className={styles.cancelBtn} style={{ flex: 1 }} onClick={() => setDeleteTarget(null)}>
                  Cancel
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={async () => {
                    await dispatch(deleteDeal(deleteTarget._id));
                    setDeleteTarget(null);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────
// EDIT DEAL MODAL
// ─────────────────────────────────────
function EditDealModal({ deal, onClose, onSave }) {
  const [form, setForm] = useState({
    title: deal.title || '',
    description: deal.description || '',
    originalPrice: deal.originalPrice || '',
    discountedPrice: deal.discountedPrice || '',
    category: deal.category || '',
    retailer: deal.retailer || 'other',
    imageUrl: deal.imageUrl || '',
    externalLink: deal.externalLink || '',
  });
  const [saving, setSaving] = useState(false);

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      ...form,
      originalPrice: +form.originalPrice,
      discountedPrice: +form.discountedPrice,
    });
    setSaving(false);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Edit Deal</span>
          <button className={styles.modalCloseBtn} onClick={onClose}>
            <X size={16} color="#78716c" strokeWidth={2.5} />
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Title</label>
          <input value={form.title} onChange={(e) => upd('title', e.target.value)} className={styles.textInput} />
        </div>

        <div className={styles.twoCol} style={{ marginBottom: 16 }}>
          <div>
            <label className={styles.fieldLabel}>Discounted Price (£)</label>
            <input
              type="number" value={form.discountedPrice}
              onChange={(e) => upd('discountedPrice', e.target.value)}
              className={styles.textInput}
            />
          </div>
          <div>
            <label className={styles.fieldLabel}>Original Price (£)</label>
            <input
              type="number" value={form.originalPrice}
              onChange={(e) => upd('originalPrice', e.target.value)}
              className={styles.textInput}
            />
          </div>
        </div>

        <div className={styles.twoCol} style={{ marginBottom: 16 }}>
          <div>
            <label className={styles.fieldLabel}>Category</label>
            <select value={form.category} onChange={(e) => upd('category', e.target.value)} className={styles.selectInput}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={styles.fieldLabel}>Retailer</label>
            <select value={form.retailer} onChange={(e) => upd('retailer', e.target.value)} className={styles.selectInput}>
              {['ebay', 'amazon', 'asos', 'other'].map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>External Link</label>
          <input value={form.externalLink} onChange={(e) => upd('externalLink', e.target.value)} className={styles.textInput} />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Description</label>
          <textarea value={form.description} onChange={(e) => upd('description', e.target.value)} className={styles.textarea} />
        </div>

        <div className={styles.saveRow}>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving
              ? <><Loader2 size={14} strokeWidth={2.5} style={{ animation: 'spin 0.8s linear infinite', marginRight: 5 }} /> Saving...</>
              : <><Check size={14} strokeWidth={2.5} style={{ marginRight: 5 }} /> Save Changes</>
            }
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}