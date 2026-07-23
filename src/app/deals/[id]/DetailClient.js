"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronRight,
  ChevronLeft,
  Flame,
  Snowflake,
  Heart,
  Share2,
  Bookmark,
  Link2,
  Copy,
  Check,
  Package,
  CheckCircle,
  ShoppingBag,
  ExternalLink,
  Percent,
  MousePointer,
  Award,
  Star,
  User,
  Tag,
  Lock,
  TrendingUp,
  Info,
} from "lucide-react";
import {
  fetchDealById,
  voteDeal,
  toggleSaveDeal,
  fetchMoreFromPoster,
  clearMoreFromPoster,
} from "@/store/slices/dealsSlice";
import DealCard from "@/components/deals/DealCard";
import { generateLink } from "@/store/slices/affiliateSlice";
import { formatPrice, timeAgo, CAT_STYLES } from "@/lib/utils";
import styles from "./page.module.css";

const heatColor = (score) => {
  if (score >= 100) return "#dc2626";
  if (score >= 40) return "#ea580c";
  if (score >= 0) return "#111111";
  return "#2563eb";
};

export default function DetailClient({ dealId }) {
  const dispatch = useDispatch();
  const {
    currentDeal: deal,
    loading,
    error,
    moreFromPoster,
  } = useSelector((s) => s.deals);
  const { user } = useSelector((s) => s.auth);
  const { linksByDeal, loading: linkLoading } = useSelector((s) => s.affiliate);

  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [selectedImg, setSelectedImg] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);

  const THUMB_SIZE = 52;
  const THUMB_GAP = 8;
  const VISIBLE_THUMBS = 4;

  useEffect(() => {
    dispatch(clearMoreFromPoster());
    dispatch(fetchDealById(dealId));
  }, [dispatch, dealId]);

  useEffect(() => {
    // The extra `deal._id === dealId` check prevents a race condition where
    // this fires using a stale previously-viewed deal's poster (still sitting
    // in Redux for a moment during client-side navigation) instead of the
    // deal this page is actually showing.
    if (deal?.postedBy?._id && deal._id === dealId) {
      dispatch(
        fetchMoreFromPoster({ postedBy: deal.postedBy._id, exclude: deal._id }),
      );
    }
  }, [dispatch, deal?.postedBy?._id, deal?._id, dealId]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.stateWrap}>
            <div className={styles.stateIcon}>⏳</div>
            <div className={styles.stateTitle}>Loading deal...</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error / Not found state ──
  if (error || !deal) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.stateWrap}>
            <div className={styles.stateIcon}>🔍</div>
            <div className={styles.stateTitle}>Deal not found</div>
            <div className={styles.stateDesc}>
              This deal may have been removed or the link is incorrect.
            </div>
            <Link href="/" className={styles.backHomeBtn}>
              Back to Deals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const catStyle = CAT_STYLES[deal.category] || CAT_STYLES.Other;

  const galleryImages =
    deal.images?.length > 0
      ? deal.images
      : deal.imageUrl
        ? [deal.imageUrl]
        : [];

  const activeImage = galleryImages[selectedImg] || galleryImages[0];

  const maxThumbStart = Math.max(0, galleryImages.length - VISIBLE_THUMBS);
  const canScrollLeft = thumbStart > 0;
  const canScrollRight = thumbStart < maxThumbStart;

  const scrollThumbsLeft = () => setThumbStart((s) => Math.max(0, s - 1));
  const scrollThumbsRight = () =>
    setThumbStart((s) => Math.min(maxThumbStart, s + 1));

  const visibleThumbCount = Math.min(galleryImages.length, VISIBLE_THUMBS);
  const thumbViewportWidth =
    visibleThumbCount * THUMB_SIZE + (visibleThumbCount - 1) * THUMB_GAP;

  const score = deal.score ?? (deal.votes?.up || 0) - (deal.votes?.down || 0);
  const hc = heatColor(score);

  const upCount = deal.votes?.up || 0;
  const downCount = deal.votes?.down || 0;

  const isPoster = !!(user && deal.postedBy?._id === user._id);

  const handleVote = (type) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    dispatch(voteDeal({ id: deal._id, voteType: type }));
  };

  const handleToggleSave = () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    dispatch(toggleSaveDeal(deal._id));
  };

  const link = linksByDeal[deal._id];
  const isGeneratingThisLink = linkLoading && !link;

  const handleGenerate = () => {
    dispatch(generateLink(deal._id));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const dealCtaUrl = deal.affiliate?.trackingCode
    ? `${apiBase}/affiliate/go/${deal.affiliate.trackingCode}`
    : deal.externalLink;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ── Breadcrumb ── */}
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <ChevronRight size={13} strokeWidth={2} />
          <span className={styles.breadcrumbCat}>{deal.category}</span>
          <ChevronRight size={13} strokeWidth={2} />
          <span className={styles.breadcrumbTitle}>{deal.title}</span>
        </div>

        <div className={styles.grid}>
          {/* ══════════ LEFT COLUMN ══════════ */}
          <div>
            {/* Image */}
            <div
              className={styles.imageBox}
              style={{ background: catStyle.gradient }}
            >
              {activeImage && !imgError ? (
                <img
                  src={activeImage}
                  alt={deal.title}
                  className={styles.dealDetailImg}
                  onError={() => setImgError(true)}
                />
              ) : (
                <span>{catStyle.emoji}</span>
              )}
              {activeImage && !imgError && (
                <div className={styles.imageScrim} />
              )}
              <div className={styles.heatBadge} style={{ background: hc }}>
                {score >= 0 ? (
                  <Flame size={12} strokeWidth={3} />
                ) : (
                  <Snowflake size={12} strokeWidth={3} />
                )}
                {score}° heat
              </div>

              <button
                className={`${styles.saveBtn} ${deal.isSaved ? styles.saveBtnActive : ""}`}
                onClick={handleToggleSave}
              >
                <Heart
                  size={16}
                  color={deal.isSaved ? "#db2777" : "#ffffff"}
                  fill={deal.isSaved ? "#db2777" : "none"}
                  strokeWidth={2}
                />
              </button>
            </div>

            {/* Image thumbnail carousel */}
            {galleryImages.length > 1 && (
              <div className={styles.imgGalleryNav}>
                {galleryImages.length > VISIBLE_THUMBS && (
                  <button
                    onClick={scrollThumbsLeft}
                    disabled={!canScrollLeft}
                    className={styles.imgScrollBtn}
                    type="button"
                    aria-label="Scroll thumbnails left"
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                )}

                <div
                  className={styles.imgThumbViewport}
                  style={{ width: thumbViewportWidth }}
                >
                  <div
                    className={styles.imgThumbTrack}
                    style={{
                      transform: `translateX(-${thumbStart * (THUMB_SIZE + THUMB_GAP)}px)`,
                    }}
                  >
                    {galleryImages.map((url, i) => (
                      <button
                        key={url + i}
                        onClick={() => {
                          setSelectedImg(i);
                          setImgError(false);
                        }}
                        className={`${styles.imgThumbBtn} ${i === selectedImg ? styles.imgThumbBtnActive : ""}`}
                        type="button"
                      >
                        <img
                          src={url}
                          alt={`View ${i + 1}`}
                          className={styles.imgThumbBtnImg}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {galleryImages.length > VISIBLE_THUMBS && (
                  <button
                    onClick={scrollThumbsRight}
                    disabled={!canScrollRight}
                    className={styles.imgScrollBtn}
                    type="button"
                    aria-label="Scroll thumbnails right"
                  >
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            )}

            {/* Votes */}
            <div className={styles.voteCard}>
              <div className={styles.voteCardLabel}>
                <TrendingUp size={13} strokeWidth={2.5} color="#111" />
                Community Rating
              </div>
              <div className={styles.voteRow}>
                <button
                  className={`${styles.voteBtn} ${deal.myVote === "up" ? styles.voteBtnHot : ""}`}
                  onClick={() => handleVote("up")}
                >
                  <Flame size={15} strokeWidth={2.5} />
                  Hot · {upCount}
                </button>

                <div className={styles.voteScore}>
                  <span className={styles.voteScoreValue} style={{ color: hc }}>
                    {score}
                  </span>
                  <span className={styles.voteScoreLabel}>score</span>
                </div>

                <button
                  className={`${styles.voteBtn} ${deal.myVote === "down" ? styles.voteBtnCold : ""}`}
                  onClick={() => handleVote("down")}
                >
                  <Snowflake size={15} strokeWidth={2.5} />
                  Cold · {downCount}
                </button>
              </div>
            </div>

            {/* Share row */}
            <div className={styles.shareRow}>
              <button className={styles.shareBtn}>
                <Share2 size={14} strokeWidth={2} />
                Share
              </button>
              <button className={styles.shareBtn} onClick={handleToggleSave}>
                <Bookmark
                  size={14}
                  strokeWidth={2}
                  color={deal.isSaved ? "#db2777" : "currentColor"}
                  fill={deal.isSaved ? "#db2777" : "none"}
                />
                {deal.isSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          {/* ══════════ RIGHT COLUMN ══════════ */}
          <div>
            {/* Tags */}
            <div className={styles.tags}>
              <span className={styles.catTag}>{deal.category}</span>
              {deal.retailer && (
                <span className={styles.storeTag}>
                  <Package size={11} strokeWidth={2.5} />
                  {deal.retailer}
                </span>
              )}
              {deal.status === "approved" && (
                <span className={styles.verifiedTag}>
                  <CheckCircle size={11} strokeWidth={3} />
                  Verified Deal
                </span>
              )}
            </div>
            <h1 className={styles.title}>{deal.title}</h1>
            <p className={styles.description}>
              {deal.description ||
                "No additional description provided for this deal."}{" "}
              Posted {timeAgo(deal.createdAt)} by @
              {deal.postedBy?.username || "a member"}.
            </p>
            {/* Price block */}
            <div className={styles.priceBlock}>
              <div>
                <div className={styles.priceWas}>
                  Was {formatPrice(deal.originalPrice)}
                </div>
                <div className={styles.priceNow}>
                  {formatPrice(deal.discountedPrice)}
                </div>
                <div className={styles.priceSaved}>
                  <CheckCircle size={12} strokeWidth={2.5} />
                  You save{" "}
                  {formatPrice(deal.originalPrice - deal.discountedPrice)}
                </div>
              </div>
              {deal.discountPercent > 0 && (
                <div className={styles.discountCircle}>
                  <div className={styles.discountValue}>
                    <Percent size={16} strokeWidth={3} />
                    {deal.discountPercent}
                  </div>
                  <div className={styles.discountLabel}>off</div>
                </div>
              )}
            </div>

            {/* Get Deal CTA */}

            <a
              href={dealCtaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.dealCta}
            >
              <ShoppingBag size={18} strokeWidth={2.5} />
              Get This Deal
              <ExternalLink size={14} strokeWidth={2.5} />
            </a>
            {/* Poster */}
            <div className={styles.poster}>
              <div className={styles.posterAvatar}>
                <User size={17} color="#78716c" strokeWidth={2.5} />
              </div>
              <div style={{ flex: 1 }}>
                <div className={styles.posterName}>
                  @{deal.postedBy?.username || "member"}
                </div>
                <div className={styles.posterMeta}>
                  Posted {timeAgo(deal.createdAt)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[Tag, Star, Flame].map((Icon, i) => (
                  <div
                    key={i}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={12} color="#555" strokeWidth={2.5} />
                  </div>
                ))}
              </div>
            </div>

            {/* ══════════ AFFILIATE BOX ══════════ */}

            {/* Not logged in — existing sign-in prompt */}
            {!user && (
              <div className={styles.lockedWrap}>
                <div
                  className={`${styles.affiliateBox} ${styles.lockedContent}`}
                >
                  <div className={styles.affiliateTitle}>
                    <Link2 size={16} strokeWidth={2.5} />
                    Share This Deal &amp; Earn
                  </div>
                  <p className={styles.affiliateDesc}>
                    Sign in to vote, save deals, and — if you post your own —
                    earn <strong>1 pt per click</strong> and{" "}
                    <strong>20 pts per purchase</strong> when others shop
                    through it.
                  </p>
                </div>
                <div className={styles.lockedOverlay}>
                  <div className={styles.lockedIcon}>
                    <Lock size={20} color="#111" strokeWidth={2} />
                  </div>
                  <Link href="/login" className={styles.lockedBtn}>
                    <User size={14} strokeWidth={2.5} />
                    Sign in
                  </Link>
                </div>
              </div>
            )}

            {/* Logged in but NOT the poster — show more from this poster instead */}
            {user && !isPoster && moreFromPoster.length > 0 && (
              <div className={styles.moreFromCard}>
                <div className={styles.moreFromTitle}>
                  More from @{deal.postedBy?.username || "this member"}
                </div>
                <div className={styles.moreFromGrid}>
                  {moreFromPoster.map((d, i) => (
                    <DealCard key={d._id} deal={d} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Logged in AND is the poster — full generate/share flow */}
            {user && isPoster && (
              <div className={styles.affiliateBox}>
                <div className={styles.affiliateTitle}>
                  <Link2 size={16} strokeWidth={2.5} />
                  Share This Deal &amp; Earn
                </div>
                <p className={styles.affiliateDesc}>
                  This is <strong>your</strong> tracking link for this deal.
                  Earn <strong>1 pt per click</strong> and{" "}
                  <strong>20 pts per purchase</strong> when someone shops
                  through it.
                </p>

                <div className={styles.affiliateStats}>
                  <div className={styles.statBox}>
                    <MousePointer
                      size={16}
                      color="#111"
                      strokeWidth={2}
                      style={{ margin: "0 auto" }}
                    />
                    <div className={styles.statValue}>1 pt</div>
                    <div className={styles.statLabel}>Per Click</div>
                  </div>
                  <div className={styles.statBox}>
                    <Award
                      size={16}
                      color="#16a34a"
                      strokeWidth={2}
                      style={{ margin: "0 auto" }}
                    />
                    <div
                      className={styles.statValue}
                      style={{ color: "#16a34a" }}
                    >
                      20 pts
                    </div>
                    <div className={styles.statLabel}>Per Purchase</div>
                  </div>
                  <div className={styles.statBox}>
                    <Star
                      size={16}
                      color="#d97706"
                      strokeWidth={2}
                      style={{ margin: "0 auto" }}
                    />
                    <div
                      className={styles.statValue}
                      style={{ color: "#d97706" }}
                    >
                      {user?.points || 0} pts
                    </div>
                    <div className={styles.statLabel}>Your Balance</div>
                  </div>
                </div>

                {!link && !isGeneratingThisLink && (
                  <button
                    className={styles.generateBtn}
                    onClick={handleGenerate}
                  >
                    <Link2 size={16} strokeWidth={2.5} />
                    Show My Tracking Link
                  </button>
                )}

                {isGeneratingThisLink && (
                  <div>
                    <div className={styles.shimmer} />
                    <div className={styles.shimmerLabel}>
                      Creating your unique tracking link...
                    </div>
                  </div>
                )}

                {link && (
                  <div>
                    <div className={styles.linkBox}>
                      <span className={styles.linkText}>{link.shareUrl}</span>
                      <button
                        onClick={handleCopy}
                        className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ""}`}
                      >
                        {copied ? (
                          <>
                            <Check size={13} strokeWidth={3} /> Done
                          </>
                        ) : (
                          <>
                            <Copy size={13} strokeWidth={2.5} /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className={styles.shareLinkRow}>
                      {["Facebook", "X / Twitter", "WhatsApp"].map((label) => (
                        <button key={label} className={styles.shareLinkBtn}>
                          <Share2 size={11} strokeWidth={2} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
