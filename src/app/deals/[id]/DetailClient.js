"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronRight,
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
} from "lucide-react";
import { fetchDealById, voteDeal } from "@/store/slices/dealsSlice";
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
  const { currentDeal: deal, loading, error } = useSelector((s) => s.deals);
  const { user } = useSelector((s) => s.auth);
  const { linksByDeal, loading: linkLoading } = useSelector((s) => s.affiliate);

  const [userVote, setUserVote] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    dispatch(fetchDealById(dealId));
  }, [dispatch, dealId]);

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
  // const baseScore = (deal.votes?.up || 0) - (deal.votes?.down || 0);
  // const score =
  //   baseScore + (userVote === "up" ? 1 : userVote === "down" ? -1 : 0);
  // const hc = heatColor(score);

  // const upCount = (deal.votes?.up || 0) + (userVote === "up" ? 1 : 0);
  // const downCount = (deal.votes?.down || 0) + (userVote === "down" ? 1 : 0);

  const score = deal.score ?? ((deal.votes?.up || 0) - (deal.votes?.down || 0));
const hc = heatColor(score);

const upCount   = deal.votes?.up   || 0;
const downCount = deal.votes?.down || 0;

  const handleVote = (type) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setUserVote(userVote === type ? null : type);
    dispatch(voteDeal({ id: deal._id, voteType: type }));
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

  // Route through our tracked redirect if this deal has a poster's link,
  // so clicks are logged and points/commission are credited automatically.
  // Falls back to the plain external link for older deals with no tracking set up.
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
              <span>{catStyle.emoji}</span>

              <div className={styles.heatBadge} style={{ background: hc }}>
                {score >= 0 ? (
                  <Flame size={12} strokeWidth={3} />
                ) : (
                  <Snowflake size={12} strokeWidth={3} />
                )}
                {score}° heat
              </div>

              <button
                className={`${styles.saveBtn} ${isSaved ? styles.saveBtnActive : ""}`}
                onClick={() => setIsSaved(!isSaved)}
              >
                <Heart
                  size={16}
                  color={isSaved ? "#db2777" : "#a8a29e"}
                  fill={isSaved ? "#db2777" : "none"}
                  strokeWidth={2}
                />
              </button>
            </div>

            {/* Votes */}
            <div className={styles.voteCard}>
              <div className={styles.voteCardLabel}>
                <TrendingUp size={13} strokeWidth={2.5} color="#111" />
                Community Rating
              </div>
              <div className={styles.voteRow}>
                <button
                  className={`${styles.voteBtn} ${userVote === "up" ? styles.voteBtnHot : ""}`}
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
                  className={`${styles.voteBtn} ${userVote === "down" ? styles.voteBtnCold : ""}`}
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
              <button
                className={styles.shareBtn}
                onClick={() => setIsSaved(!isSaved)}
              >
                <Bookmark size={14} strokeWidth={2} />
                Save
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
            <div className={styles.lockedWrap}>
              <div
                className={`${styles.affiliateBox} ${!user ? styles.lockedContent : ""}`}
              >
                <div className={styles.affiliateTitle}>
                  <Link2 size={16} strokeWidth={2.5} />
                  Your Affiliate Link
                </div>
                <p className={styles.affiliateDesc}>
                  Earn <strong>1 pt per click</strong> and{" "}
                  <strong>20 pts per purchase</strong> when someone shops
                  through your link.
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
                    Generate My Affiliate Link
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

              {/* Login-required overlay */}
              {!user && (
                <div className={styles.lockedOverlay}>
                  <div className={styles.lockedIcon}>
                    <Lock size={20} color="#111" strokeWidth={2} />
                  </div>
                  <Link href="/login" className={styles.lockedBtn}>
                    <User size={14} strokeWidth={2.5} />
                    Sign in to generate
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
