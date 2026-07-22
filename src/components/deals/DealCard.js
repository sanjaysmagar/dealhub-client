"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Flame,
  Snowflake,
  Zap,
  Clock,
  Heart,
  Package,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { voteDeal } from "@/store/slices/dealsSlice";
import { timeAgo, formatPrice, CAT_STYLES } from "@/lib/utils";
import styles from "./DealCard.module.css";

// ── Heat helpers ──────────────────────────
const getHeatColor = (score) => {
  if (score >= 100) return "#dc2626";
  if (score >= 40) return "#ea580c";
  if (score >= 0) return "#111111";
  return "#2563eb";
};

const getHeatLabel = (score) => {
  if (score >= 100) return "Hot";
  if (score >= 40) return "Warm";
  if (score >= 0) return "Cool";
  return "Cold";
};

// ── Image area class by category ──────────
const getImgClass = (category) => {
  const map = {
    Beauty: styles.imgBeauty,
    Fashion: styles.imgFashion,
    Tech: styles.imgTech,
    Home: styles.imgHome,
    Food: styles.imgFood,
    Sports: styles.imgSports,
    Gaming: styles.imgGaming,
    Other: styles.imgOther,
  };
  return map[category] || styles.imgOther;
};

export default function DealCard({ deal, index = 0 }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const [userVote, setUserVote] = useState(null); // 'up' | 'down' | null
  const [isSaved, setIsSaved] = useState(false);
  const [imgError, setImgError] = useState(false);

  // const score = (deal.votes?.up || 0) - (deal.votes?.down || 0);
  // const heatColor = getHeatColor(score + (userVote === 'up' ? 1 : userVote === 'down' ? -1 : 0));
  // Trust the real, already-updated data from Redux — no manual adjustment needed
  const displayScore =
    deal.score ?? (deal.votes?.up || 0) - (deal.votes?.down || 0);
  const heatColor = getHeatColor(displayScore);
  const catStyle = CAT_STYLES[deal.category] || CAT_STYLES.Other;

  const handleVote = async (type) => {
    if (!user) {
      router.push("/login");
      return;
    }

    const newVote = userVote === type ? null : type;
    setUserVote(newVote);
    dispatch(voteDeal({ id: deal._id, voteType: type }));
  };

  const handleOpen = () => {
    router.push(`/deals/${deal._id}`);
  };

  // const upCount   = (deal.votes?.up   || 0) + (userVote === 'up'   ? 1 : userVote === 'down' ? 0 : 0);
  // const downCount = (deal.votes?.down || 0) + (userVote === 'down'  ? 1 : userVote === 'up'   ? 0 : 0);
  // const displayScore = score + (userVote === 'up' ? 1 : userVote === 'down' ? -1 : 0);

  const upCount = deal.votes?.up || 0;
  const downCount = deal.votes?.down || 0;

  return (
    <div className={styles.card} style={{ animationDelay: `${index * 0.06}s` }}>
      {/* ── Image area ── */}
      <div
        className={`${styles.imageArea} ${getImgClass(deal.category)}`}
        onClick={handleOpen}
      >
        {deal.imageUrl && !imgError ? (
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className={styles.dealImg}
            onError={() => setImgError(true)}
          />
        ) : (
          <span>{catStyle?.emoji || "🎁"}</span>
        )}
        {/* Heat score badge */}
        <div className={styles.heatBadge} style={{ background: heatColor }}>
          {displayScore >= 0 ? (
            <Flame size={10} strokeWidth={3} />
          ) : (
            <Snowflake size={10} strokeWidth={3} />
          )}
          {displayScore}°
        </div>

        {/* Discount badge */}
        {deal.discountPercent > 0 && (
          <div className={styles.discountBadge}>-{deal.discountPercent}%</div>
        )}

        {/* Save button */}
        <button
          className={`${styles.saveBtn} ${isSaved ? styles.saveBtnSaved : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsSaved(!isSaved);
          }}
        >
          <Heart
            size={14}
            color={isSaved ? "#db2777" : "#a8a29e"}
            fill={isSaved ? "#db2777" : "none"}
            strokeWidth={2}
          />
        </button>

        {/* Store badge */}
        {deal.retailer && (
          <div className={styles.storeBadge}>
            <Package size={10} strokeWidth={2.5} color="#78716c" />
            {deal.retailer}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className={styles.content}>
        {/* Tags + time */}
        <div className={styles.tagRow}>
          <div className={styles.tags}>
            {deal.category && (
              <span className={styles.catTag}>{deal.category}</span>
            )}
            {deal.status === "approved" && (
              <span className={styles.verifiedTag}>
                <CheckCircle size={9} strokeWidth={3} />
                Verified
              </span>
            )}
          </div>
          <span className={styles.timeAgo}>
            <Clock size={10} strokeWidth={2.5} />
            {timeAgo(deal.createdAt)}
          </span>
        </div>

        {/* Title */}
        <button className={styles.title} onClick={handleOpen}>
          {deal.title}
        </button>

        {/* Description */}
        {deal.description && (
          <p className={styles.description}>{deal.description}</p>
        )}

        {/* Price */}
        <div className={styles.priceBlock}>
          <span className={styles.priceNow}>
            {formatPrice(deal.discountedPrice)}
          </span>
          <div className={styles.priceDetails}>
            <span className={styles.priceWas}>
              {formatPrice(deal.originalPrice)}
            </span>
            <span className={styles.priceSave}>
              Save {formatPrice(deal.originalPrice - deal.discountedPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Votes + CTA ── */}
      <div className={styles.actions}>
        {/* Vote row */}
        <div className={styles.voteRow}>
          <button
            className={`${styles.voteBtn} ${userVote === "up" ? styles.voteBtnHot : ""}`}
            onClick={() => handleVote("up")}
          >
            <Flame size={12} strokeWidth={2.5} />
            {upCount}
          </button>

          <button
            className={`${styles.voteBtn} ${userVote === "down" ? styles.voteBtnCold : ""}`}
            onClick={() => handleVote("down")}
          >
            <Snowflake size={12} strokeWidth={2.5} />
            {downCount}
          </button>

          <span className={styles.heatLabel} style={{ color: heatColor }}>
            <Zap size={10} strokeWidth={2.5} />
            {getHeatLabel(displayScore)}
          </span>
        </div>

        {/* Get Deal CTA */}
        <button className={styles.dealBtn} onClick={handleOpen}>
          Get Deal
          <ExternalLink size={13} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
