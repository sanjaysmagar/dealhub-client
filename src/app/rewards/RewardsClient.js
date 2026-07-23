"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Star,
  Crown,
  MousePointer,
  Zap,
  Award,
  Trophy,
  BarChart2,
  CheckCircle,
  Lock,
  Tag,
  ShoppingBag,
  Flame,
  LogIn,
} from "lucide-react";
import {
  fetchSummary,
  fetchHistory,
  fetchLeaderboard,
} from "@/store/slices/rewardsSlice";
import { timeAgo } from "@/lib/utils";
import styles from "./page.module.css";

const BADGE_META = {
  first_deal: {
    label: "First Deal",
    desc: "Posted your first deal",
    Icon: Tag,
  },
  deal_maker: {
    label: "Deal Maker",
    desc: "Posted 5+ deals",
    Icon: ShoppingBag,
  },
  hot_shot: { label: "Hot Shot", desc: "Deal hit 10+ upvotes", Icon: Flame },
  click_king: {
    label: "Click King",
    desc: "100 total affiliate clicks",
    Icon: MousePointer,
  },
  converter: {
    label: "Converter",
    desc: "10 confirmed conversions",
    Icon: Zap,
  },
  point_collector: {
    label: "Point Collector",
    desc: "Reached 100 total points",
    Icon: Star,
  },
};

export default function RewardsClient() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const {
    summary,
    history,
    leaderboard,
    leaderboardPeriod,
    loading,
    leaderboardLoading,
  } = useSelector((s) => s.rewards);

  const [tab, setTab] = useState("badges");

  useEffect(() => {
    if (!user) return;
    dispatch(fetchSummary());
    dispatch(fetchHistory());
    dispatch(fetchLeaderboard("all"));
  }, [dispatch, user]);

  // ── Not logged in ──
  if (!user) {
    return (
      <div className={styles.wrap}>
        <div className={styles.lockedWrap}>
          <div className={styles.lockedIconBox}>
            <Lock size={26} color="#111111" strokeWidth={2} />
          </div>
          <div className={styles.lockedTitle}>Sign in to see your rewards</div>
          <div className={styles.lockedDesc}>
            Track your points, badges, and see where you rank on the
            leaderboard.
          </div>
          <Link href="/login" className={styles.lockedBtn}>
            <LogIn size={14} strokeWidth={2.5} />
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const earnedIds = summary?.earnedBadges?.map((b) => b.id) || [];
  const allBadgeIds = Object.keys(BADGE_META);
  const earnedCount = earnedIds.length;

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
            <div className={styles.username}>
              @{summary?.username || user.username}
            </div>
            <div className={styles.memberMeta}>
              Rank #{summary?.rank || "-"} · {summary?.totalDeals || 0} deals
              posted
            </div>
            <div className={styles.headerBadges}>
              <span className={styles.headerBadgePill}>
                {earnedCount} Badges
              </span>
              <span className={styles.headerBadgePill}>
                {summary?.totalLinks || 0} Links
              </span>
            </div>
          </div>
        </div>
        <div className={styles.pointsBlock}>
          <div className={styles.pointsValue}>
            {summary?.points ?? user.points ?? 0}
          </div>
          <div className={styles.pointsLabel}>Total Points</div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className={styles.statsRow}>
        {[
          {
            Icon: Star,
            value: summary?.points ?? user.points ?? 0,
            label: "Total Points",
            color: "#111111",
          },
          {
            Icon: Crown,
            value: `#${summary?.rank || "-"}`,
            label: "Leaderboard",
            color: "#d97706",
          },
          {
            Icon: MousePointer,
            value: summary?.totalClicks ?? 0,
            label: "Total Clicks",
            color: "#0284c7",
          },
          {
            Icon: Zap,
            value: summary?.totalConversions ?? 0,
            label: "Conversions",
            color: "#16a34a",
          },
        ].map((s) => (
          <div key={s.label} className={styles.statCard}>
            <s.Icon
              size={22}
              color={s.color}
              strokeWidth={2}
              className={styles.statIcon}
            />
            <div className={styles.statValue} style={{ color: s.color }}>
              {s.value}
            </div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {[
          { key: "badges", label: "Badges", Icon: Award },
          { key: "leaderboard", label: "Leaderboard", Icon: Trophy },
          { key: "history", label: "History", Icon: BarChart2 },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`${styles.tabBtn} ${tab === t.key ? styles.tabBtnActive : ""}`}
          >
            <t.Icon size={14} strokeWidth={tab === t.key ? 2.5 : 2} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── BADGES ── */}
      {tab === "badges" && (
        <div>
          <div className={styles.badgesHeader}>
            <span className={styles.badgesTitle}>Your Badges</span>
            <span className={styles.badgesCount}>
              {earnedCount} / {allBadgeIds.length} earned
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(earnedCount / allBadgeIds.length) * 100}%` }}
            />
          </div>

          <div className={styles.badgeGrid}>
            {allBadgeIds.map((id) => {
              const meta = BADGE_META[id];
              const earned = earnedIds.includes(id);
              return (
                <div
                  key={id}
                  className={`${styles.badgeCard} ${earned ? styles.badgeCardEarned : styles.badgeCardLocked}`}
                >
                  <div
                    className={`${styles.badgeIconBox} ${earned ? styles.badgeIconBoxEarned : styles.badgeIconBoxLocked}`}
                  >
                    <meta.Icon
                      size={22}
                      color={earned ? "#111111" : "#9ca3af"}
                      strokeWidth={2}
                    />
                  </div>
                  <div className={styles.badgeLabel}>{meta.label}</div>
                  <div className={styles.badgeDesc}>{meta.desc}</div>
                  {earned ? (
                    <span
                      className={`${styles.badgeStatus} ${styles.badgeStatusEarned}`}
                    >
                      <CheckCircle size={10} strokeWidth={3} /> Earned
                    </span>
                  ) : (
                    <span
                      className={`${styles.badgeStatus} ${styles.badgeStatusLocked}`}
                    >
                      <Lock size={10} strokeWidth={2.5} /> Locked
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LEADERBOARD ── */}
      {tab === "leaderboard" && (
        <div className={styles.leaderboardCard}>
          <div className={styles.leaderboardHeader}>
            <Trophy size={16} strokeWidth={2.5} />
            Top Contributors
          </div>

          <div className={styles.periodFilterRow}>
            {[
              { key: "all", label: "All Time" },
              { key: "month", label: "This Month" },
              { key: "week", label: "This Week" },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => dispatch(fetchLeaderboard(p.key))}
                className={`${styles.periodFilterBtn} ${leaderboardPeriod === p.key ? styles.periodFilterBtnActive : ""}`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {leaderboardLoading && (
            <div style={{ padding: "16px 20px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonRow} />
              ))}
            </div>
          )}

          {!leaderboardLoading && leaderboard.length === 0 && (
            <div style={{ padding: "16px 20px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonRow} />
              ))}
            </div>
          )}

          {!loading && leaderboard.length === 0 && (
            <div className={styles.emptyState}>
              <Trophy
                size={36}
                strokeWidth={1.5}
                className={styles.emptyIcon}
              />
              <div className={styles.emptyTitle}>No rankings yet</div>
              <div className={styles.emptyDesc}>
                Be the first to earn points!
              </div>
            </div>
          )}

          {leaderboard.map((u) => {
            const isMe = u.username === user.username;
            const medal =
              u.rank === 1
                ? "🥇"
                : u.rank === 2
                  ? "🥈"
                  : u.rank === 3
                    ? "🥉"
                    : null;
            return (
              <div
                key={u.rank}
                className={`${styles.leaderRow} ${isMe ? styles.leaderRowMe : ""}`}
              >
                <div className={styles.leaderRank}>
                  {medal ? (
                    <span className={styles.leaderRankMedal}>{medal}</span>
                  ) : (
                    `#${u.rank}`
                  )}
                </div>
                <div
                  className={`${styles.leaderAvatar} ${isMe ? styles.leaderAvatarMe : ""}`}
                >
                  <User
                    size={16}
                    color={isMe ? "#111111" : "#a8a29e"}
                    strokeWidth={2.5}
                  />
                </div>
                <div className={styles.leaderInfo}>
                  <div
                    className={`${styles.leaderName} ${isMe ? styles.leaderNameMe : ""}`}
                  >
                    @{u.username}
                    {isMe && <span className={styles.youTag}>YOU</span>}
                  </div>
                  <div className={styles.leaderMeta}>
                    {u.badgeCount} badge{u.badgeCount !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className={styles.leaderPointsBox}>
                  <div
                    className={`${styles.leaderPoints} ${isMe ? styles.leaderPointsMe : ""}`}
                  >
                    {u.points.toLocaleString()}
                  </div>
                  <div className={styles.leaderPointsLabel}>points</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === "history" && (
        <div>
          {loading && history.length === 0 && (
            <div className={styles.historyList}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={styles.skeletonRow} />
              ))}
            </div>
          )}

          {!loading && history.length === 0 && (
            <div className={styles.emptyState}>
              <BarChart2
                size={36}
                strokeWidth={1.5}
                className={styles.emptyIcon}
              />
              <div className={styles.emptyTitle}>No activity yet</div>
              <div className={styles.emptyDesc}>
                Post a deal or generate an affiliate link to start earning.
              </div>
            </div>
          )}

          <div className={styles.historyList}>
            {history.map((h, i) => {
              const Icon =
                h.type === "conversion"
                  ? Zap
                  : h.type === "click"
                    ? MousePointer
                    : Award;
              return (
                <div key={h._id || i} className={styles.historyItem}>
                  <div className={styles.historyIconBox}>
                    <Icon size={17} color="#111111" strokeWidth={2.5} />
                  </div>
                  <div className={styles.historyDesc}>
                    <div className={styles.historyText}>{h.description}</div>
                    <div className={styles.historyTime}>
                      {timeAgo(h.createdAt)}
                    </div>
                  </div>
                  {h.points > 0 && (
                    <div className={styles.historyPoints}>
                      <Star
                        size={13}
                        strokeWidth={2.5}
                        color="#d97706"
                        fill="#fbbf24"
                      />
                      +{h.points} pt{h.points > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
