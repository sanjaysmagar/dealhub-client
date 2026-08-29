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
  Sparkles,
} from "lucide-react";
import {
  fetchDeals,
  setFilter,
  fetchFeaturedDeal,
  fetchStats,
  fetchRecommendedDeals,
} from "@/store/slices/dealsSlice";
import CategoryDropdown from "@/components/layout/CategoryDropdown";
import DealCard from "@/components/deals/DealCard";
import styles from "./page.module.css";
import { CAT_STYLES, formatPrice, formatCount } from "@/lib/utils";

const SORT_OPTIONS = [
  { key: "recommended", label: "For You", Icon: Sparkles },
  { key: "hot", label: "Hot", Icon: Flame },
  { key: "new", label: "New", Icon: Clock },
  // { key: "top", label: "Top", Icon: TrendingUp },
];

const SORT_LABELS = { hot: "Hot Deals", new: "New Deals", top: "Top Deals" };

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
    recommendedDeals = [],
    recommendedLoading,
    recommendedError,
    loading,
    loadingMore,
    error,
    filters,
    pagination,
  } = useSelector((s) => s.deals);

  const isRecommended = filters.sort === "recommended";
  const displayDeals = isRecommended ? recommendedDeals : deals;
  const displayLoading = isRecommended ? recommendedLoading : loading;
  const displayError = isRecommended ? recommendedError : error;
  const sectionTitle = isRecommended
    ? "Recommended"
    : filters.category !== "All"
      ? `${filters.category} Deals`
      : SORT_LABELS[filters.sort] || "Deals";

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
  const [featuredImgIndex, setFeaturedImgIndex] = useState(0);
  const [failedFeaturedImgs, setFailedFeaturedImgs] = useState(new Set());

  // Falls back gracefully: full images array if present, else just the
  // single cover imageUrl, else nothing (emoji shown instead).
  const featuredGalleryImages = (
    featuredDeal?.images?.length > 0
      ? featuredDeal.images
      : featuredDeal?.imageUrl
        ? [featuredDeal.imageUrl]
        : []
  ).filter((url) => !failedFeaturedImgs.has(url));

  // Reset to the first image whenever a different deal becomes featured
  useEffect(() => {
    setFeaturedImgIndex(0);
  }, [featuredDeal?._id]);

  // Auto-advance through the gallery — only runs when there's actually
  // more than one image to cycle through
  useEffect(() => {
    if (featuredGalleryImages.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedImgIndex((i) => (i + 1) % featuredGalleryImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [featuredGalleryImages.length, featuredDeal?._id]);

  useEffect(() => {
    setHomePage(1);
    dispatch(fetchDeals(buildParams(1)));
  }, [dispatch, filters.category, filters.sort, filters.search]);

  // useEffect(() => {
  //   dispatch(fetchRecommendedDeals({ limit: 8 }));
  // }, [dispatch]);

  useEffect(() => {
    if (filters.sort === "recommended") return;
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

  // const handleRetry = () =>
  //   dispatch(fetchDeals({ sort: filters.sort, page: 1, limit: 9 }));

  const handleRetry = () => {
    if (isRecommended) {
      dispatch(fetchRecommendedDeals({ limit: 8 }));
    } else {
      dispatch(fetchDeals({ sort: filters.sort, page: 1, limit: 9 }));
    }
  };

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
            {featuredGalleryImages.length > 0 ? (
              <>
                {featuredGalleryImages.map((url, i) => (
                  <img
                    key={url}
                    src={url}
                    alt={featuredDeal.title}
                    className={styles.heroFeaturedImg}
                    style={{ opacity: i === featuredImgIndex ? 1 : 0 }}
                    onError={() =>
                      setFailedFeaturedImgs((prev) => new Set(prev).add(url))
                    }
                  />
                ))}
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
            <span className={styles.sortTitle}>{sectionTitle}</span>
            {isRecommended
              ? recommendedDeals.length > 0 && (
                  <span className={styles.sortCount}>
                    {recommendedDeals.length} picks
                  </span>
                )
              : pagination?.total > 0 && (
                  <span className={styles.sortCount}>
                    {pagination.total} deals
                  </span>
                )}
          </div>
          <div className={styles.sortBarRight}>
            {!isRecommended && <CategoryDropdown />}
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
          {displayLoading &&
            Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}

          {!displayLoading && displayError && (
            <div className={styles.stateBox}>
              <div className={styles.stateIcon}>⚠️</div>
              <div className={styles.stateTitle}>Something went wrong</div>
              <div className={styles.stateDesc}>{displayError}</div>
              <button className={styles.retryBtn} onClick={handleRetry}>
                Try again
              </button>
            </div>
          )}

          {!displayLoading && !displayError && displayDeals.length === 0 && (
            <div className={styles.stateBox}>
              <div className={styles.stateIcon}>
                {isRecommended ? "✨" : "🔍"}
              </div>
              <div className={styles.stateTitle}>
                {isRecommended ? "No recommendations yet" : "No deals found"}
              </div>
              <div className={styles.stateDesc}>
                {isRecommended
                  ? "Vote, save, or post a few deals to get personalised picks."
                  : filters.category !== "All"
                    ? `No ${filters.category} deals yet. Be the first!`
                    : "No deals yet. Post the first deal!"}
              </div>
            </div>
          )}

          {!displayLoading &&
            !displayError &&
            displayDeals.map((deal, i) => (
              <DealCard key={deal._id} deal={deal} index={i} />
            ))}

          {!isRecommended &&
            loadingMore &&
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={`more-${i}`} />
            ))}

          {!isRecommended && (
            <div
              ref={sentinelRef}
              style={{ gridColumn: "1 / -1", height: 1 }}
            />
          )}

          {!isRecommended &&
            !loading &&
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
                  <Plus size={15} strokeWidth={2.5} /> Post
                </Link>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}
