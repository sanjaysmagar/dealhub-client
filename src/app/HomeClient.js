"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Flame,
  Clock,
  TrendingUp,
  Plus,
  Zap,
  Construction,
  ArrowRight,
} from "lucide-react";
import {
  fetchDeals,
  setFilter,
  fetchFeaturedDeal,
  fetchStats,
} from "@/store/slices/dealsSlice";
import CategoryDropdown from "@/components/layout/CategoryDropdown";
import DealCard from "@/components/deals/DealCard";
import styles from "./page.module.css";
import { CAT_STYLES, formatPrice, formatCount } from "@/lib/utils";

const SORT_OPTIONS = [
  { key: "hot", label: "Hot", Icon: Flame },
  { key: "new", label: "New", Icon: Clock },
  { key: "top", label: "Top", Icon: TrendingUp },
];

// const HERO_STATS = [
//   { value: "2,847", label: "Deals live" },
//   { value: "15.4K", label: "Members" },
//   { value: "£1.2M", label: "Total saved" },
// ];

function SkeletonCard() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonImg} />
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonLine} style={{ width: "60%" }} />
        <div className={styles.skeletonLine} style={{ width: "100%" }} />
        <div className={styles.skeletonLine} style={{ width: "80%" }} />
        <div
          className={styles.skeletonLine}
          style={{ width: "40%", marginTop: "4px" }}
        />
      </div>
    </div>
  );
}

export default function HomeClient() {
  const dispatch = useDispatch();
  const {
    deals,
    featuredDeal,
    stats,
    loading,
    loadingMore,
    error,
    filters,
    pagination,
  } = useSelector((s) => s.deals);

  const [homePage, setHomePage] = useState(1);
  const sentinelRef = useRef(null);

  const buildParams = (page, append = false) => ({
    sort: filters.sort,
    page,
    limit: 9,
    ...(append && { append: true }),
    ...(filters.category !== "All" && { category: filters.category }),
    ...(filters.search && { search: filters.search }),
  });
  const [featImgError, setFeatImgError] = useState(false);

  useEffect(() => {
    setHomePage(1);
    dispatch(fetchDeals(buildParams(1)));
  }, [dispatch, filters.category, filters.sort, filters.search]);

  useEffect(() => {
    const hasMore = pagination?.page < pagination?.pages;
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = homePage + 1;
          setHomePage(nextPage);
          dispatch(fetchDeals(buildParams(nextPage, true)));
        }
      },
      { rootMargin: "200px" }, // start loading slightly before it's actually visible
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [dispatch, homePage, pagination, loading, loadingMore, filters]);

  useEffect(() => {
    dispatch(fetchFeaturedDeal());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  const handleSort = (key) => dispatch(setFilter({ sort: key }));

  const handleRetry = () =>
    dispatch(fetchDeals({ sort: filters.sort, page: 1, limit: 9 }));

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay1} />
        <div className={styles.heroOverlay2} />

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Construction size={11} strokeWidth={3} />
            BETA Version
          </div>
          <h1 className={styles.heroTitle}>
            Find deals. Share links.
            <br />
            <span className={styles.heroTitleAccent}>Earn real rewards.</span>
          </h1>
          <p className={styles.heroDesc}>
            Post deals, generate your personal affiliate link, and earn points
            every time someone shops through it.
          </p>
          {/* <div className={styles.heroStats}>
            {HERO_STATS.map((s) => (
              <div key={s.label} className={styles.heroStat}>
                <span className={styles.heroStatVal}>{s.value}</span>
                <span className={styles.heroStatLabel}>{s.label}</span>
              </div>
            ))}
          </div> */}
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatVal}>
                {formatCount(stats.totalDeals)}
              </span>
              <span className={styles.heroStatLabel}>Deals live</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatVal}>
                {formatCount(stats.totalMembers)}
              </span>
              <span className={styles.heroStatLabel}>Members</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatVal}>
                {formatPrice(stats.totalSaved)}
              </span>
              <span className={styles.heroStatLabel}>Total saved</span>
            </div>
          </div>
        </div>

        {featuredDeal && (
          <Link
            href={`/deals/${featuredDeal._id}`}
            className={styles.heroFeatured}
          >
            {featuredDeal.imageUrl && !featImgError ? (
              <>
                <img
                  src={featuredDeal.imageUrl}
                  alt={featuredDeal.title}
                  className={styles.heroFeaturedImg}
                  onError={() => setFeatImgError(true)}
                />
                <div className={styles.heroFeaturedScrim} />
              </>
            ) : (
              <div className={styles.heroFeaturedEmojiWrap}>
                <span className={styles.heroFeaturedEmoji}>
                  {CAT_STYLES[featuredDeal.category]?.emoji || "🎁"}
                </span>
              </div>
            )}

            <div className={styles.heroFeaturedLabel}>
              <Flame
                size={11}
                strokeWidth={2.5}
                color="#fb923c"
                fill="#fb923c"
              />
              Featured Deal
            </div>

            <div className={styles.heroFeaturedBottom}>
              <div className={styles.heroFeaturedTitle}>
                {featuredDeal.title}
              </div>
              <div className={styles.heroFeaturedPriceRow}>
                <span className={styles.heroFeaturedPrice}>
                  {formatPrice(featuredDeal.discountedPrice)}
                </span>
                <span className={styles.heroFeaturedOldPrice}>
                  {formatPrice(featuredDeal.originalPrice)}
                </span>
                {featuredDeal.discountPercent > 0 && (
                  <span className={styles.heroFeaturedDiscount}>
                    -{featuredDeal.discountPercent}%
                  </span>
                )}
              </div>
            </div>
          </Link>
        )}
      </section>

      {/* Main content */}
      <main className={styles.main}>
        {/* Sort bar */}

        <div className={styles.sortBar}>
          <div className={styles.sortBarLeft}>
            <span className={styles.sortTitle}>
              {filters.category === "All"
                ? "Hot Deals"
                : `${filters.category} Deals`}
            </span>
            {pagination?.total > 0 && (
              <span className={styles.sortCount}>{pagination.total} deals</span>
            )}
          </div>
          <div className={styles.sortBarRight}>
            <CategoryDropdown />
            <div className={styles.sortBtns}>
              {SORT_OPTIONS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => handleSort(key)}
                  className={`${styles.sortBtn} ${filters.sort === key ? styles.sortBtnActive : ""}`}
                >
                  <Icon
                    size={12}
                    strokeWidth={filters.sort === key ? 2.5 : 2}
                  />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {loading &&
            Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}

          {!loading && error && (
            <div className={styles.stateBox}>
              <div className={styles.stateIcon}>⚠️</div>
              <div className={styles.stateTitle}>Something went wrong</div>
              <div className={styles.stateDesc}>{error}</div>
              <button className={styles.retryBtn} onClick={handleRetry}>
                Try again
              </button>
            </div>
          )}

          {!loading && !error && deals.length === 0 && (
            <div className={styles.stateBox}>
              <div className={styles.stateIcon}>🔍</div>
              <div className={styles.stateTitle}>No deals found</div>
              <div className={styles.stateDesc}>
                {filters.category !== "All"
                  ? `No ${filters.category} deals yet. Be the first!`
                  : "No deals yet. Post the first deal!"}
              </div>
            </div>
          )}

          {!loading &&
            !error &&
            deals.map((deal, i) => (
              <DealCard key={deal._id} deal={deal} index={i} />
            ))}

          {loadingMore &&
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={`more-${i}`} />
            ))}

          <div ref={sentinelRef} style={{ gridColumn: "1 / -1", height: 1 }} />

          {!loading &&
            !error &&
            deals.length > 0 &&
            (!pagination?.pages || pagination.page >= pagination.pages) && (
              <div className={styles.ctaBanner}>
                <div>
                  <div className={styles.ctaTitle}>Found a great deal? 🎉</div>
                  <div className={styles.ctaDesc}>
                    Post it and earn points on every sale.
                  </div>
                </div>
                <Link href="/post" className={styles.ctaBtn}>
                  <Plus size={15} strokeWidth={2.5} />
                  Post
                </Link>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}
