"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Flame,
  Snowflake,
  Heart,
  Package,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { voteDeal, toggleSaveDeal } from "@/store/slices/dealsSlice";
import { formatPrice, CAT_STYLES } from "@/lib/utils";
import styles from "./DealCard.module.css";

const getHeatColor = (score) => {
  if (score >= 100) return "#dc2626";
  if (score >= 40) return "#ea580c";
  if (score >= 0) return "#111111";
  return "#2563eb";
};

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

  const [imgError, setImgError] = useState(false);

  const displayScore =
    deal.score ?? (deal.votes?.up || 0) - (deal.votes?.down || 0);
  const heatColor = getHeatColor(displayScore);
  const catStyle = CAT_STYLES[deal.category] || CAT_STYLES.Other;

  const handleOpen = () => router.push(`/deals/${deal._id}`);

  const handleVote = (e, type) => {
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    dispatch(voteDeal({ id: deal._id, voteType: type }));
  };

  const handleToggleSave = (e) => {
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    dispatch(toggleSaveDeal(deal._id));
  };

  const upCount = deal.votes?.up || 0;
  const downCount = deal.votes?.down || 0;

  return (
    <div className={styles.card} onClick={handleOpen}>
      <div className={`${styles.imageArea} ${getImgClass(deal.category)}`}>
        {deal.imageUrl && !imgError ? (
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className={styles.dealImg}
            onError={() => setImgError(true)}
          />
        ) : (
          <span className={styles.fallbackEmoji}>
            {catStyle?.emoji || "🎁"}
          </span>
        )}

        {/* Dark scrim for text legibility */}
        <div className={styles.scrim} />

        {/* Top row — heat + discount + save */}
        <div className={styles.topRow}>
          <div className={styles.heatBadge} style={{ background: heatColor }}>
            {displayScore >= 0 ? (
              <Flame size={10} strokeWidth={3} />
            ) : (
              <Snowflake size={10} strokeWidth={3} />
            )}
            {displayScore}°
          </div>
          <div className={styles.topRowRight}>
            {deal.discountPercent > 0 && (
              <div className={styles.discountBadge}>
                -{deal.discountPercent}%
              </div>
            )}
            <button
              className={`${styles.saveBtn} ${deal.isSaved ? styles.saveBtnSaved : ""}`}
              onClick={handleToggleSave}
            >
              <Heart
                size={14}
                color={deal.isSaved ? "#db2777" : "#ffffff"}
                fill={deal.isSaved ? "#db2777" : "none"}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>

        {/* Bottom overlay content */}
        <div className={styles.bottomOverlay}>
          <div className={styles.tagRow}>
            {deal.retailer && (
              <span className={styles.glassTag}>
                <Package size={9} strokeWidth={2.5} /> {deal.retailer}
              </span>
            )}
            {deal.category && (
              <span className={styles.glassTag}>{deal.category}</span>
            )}
            {deal.status === "approved" && (
              <span className={styles.glassTagVerified}>
                <CheckCircle size={9} strokeWidth={3} /> Verified
              </span>
            )}
          </div>

          <div className={styles.overlayTitle}>{deal.title}</div>

          <div className={styles.overlayPriceRow}>
            <span className={styles.overlayPriceNow}>
              {formatPrice(deal.discountedPrice)}
            </span>
            <span className={styles.overlayPriceWas}>
              {formatPrice(deal.originalPrice)}
            </span>
            <span className={styles.overlayPriceSave}>
              Save {formatPrice(deal.originalPrice - deal.discountedPrice)}
            </span>
          </div>

          <div className={styles.overlayVoteRow}>
            <button
              className={`${styles.glassVoteBtn} ${deal.myVote === "up" ? styles.glassVoteBtnHot : ""}`}
              onClick={(e) => handleVote(e, "up")}
            >
              <Flame size={12} strokeWidth={2.5} /> {upCount}
            </button>
            <button
              className={`${styles.glassVoteBtn} ${deal.myVote === "down" ? styles.glassVoteBtnCold : ""}`}
              onClick={(e) => handleVote(e, "down")}
            >
              <Snowflake size={12} strokeWidth={2.5} /> {downCount}
            </button>
          </div>

          <button className={styles.overlayDealBtn} onClick={handleOpen}>
            Get Deal <ExternalLink size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
