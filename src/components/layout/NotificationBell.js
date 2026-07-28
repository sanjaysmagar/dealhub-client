"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  CheckCircle,
  XCircle,
  Star,
  Award,
  Flame,
  Snowflake,
  Check,
} from "lucide-react";
import {
  fetchMyNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/store/slices/notificationSlice";
import { timeAgo } from "@/lib/utils";
import styles from "./NotificationBell.module.css";

const TYPE_META = {
  deal_approved: { Icon: CheckCircle, color: "#16a34a" },
  deal_rejected: { Icon: XCircle, color: "#dc2626" },
  points_earned: { Icon: Star, color: "#d97706" },
  badge_earned: { Icon: Award, color: "#7c3aed" },
  vote_received: { Icon: Flame, color: "#ea580c" },
};

export default function NotificationBell() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items, unreadCount, loading } = useSelector((s) => s.notifications);

  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    dispatch(fetchUnreadCount());
    const interval = setInterval(() => dispatch(fetchUnreadCount()), 60000); // light poll every 60s
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggle = () => {
    if (!open) dispatch(fetchMyNotifications());
    setOpen(!open);
  };

  const handleClickNotification = (n) => {
    if (!n.read) dispatch(markNotificationRead(n._id));
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button className={styles.bellBtn} onClick={handleToggle}>
        <Bell size={15} color="#78716c" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button
                className={styles.markAllBtn}
                onClick={() => dispatch(markAllNotificationsRead())}
              >
                <Check size={11} strokeWidth={2.5} /> Mark all read
              </button>
            )}
          </div>

          <div className={styles.panelBody}>
            {loading && (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.skeletonRow} />
                ))}
              </>
            )}

            {!loading && items.length === 0 && (
              <div className={styles.emptyState}>
                <Bell size={28} strokeWidth={1.5} color="#d4d4d4" />
                <div>No notifications yet</div>
              </div>
            )}

            {!loading &&
              items.map((n) => {
                const meta = TYPE_META[n.type] || {
                  Icon: Bell,
                  color: "#78716c",
                };
                return (
                  <button
                    key={n._id}
                    className={`${styles.notifRow} ${!n.read ? styles.notifRowUnread : ""}`}
                    onClick={() => handleClickNotification(n)}
                  >
                    <div
                      className={styles.notifIconBox}
                      style={{ background: `${meta.color}15` }}
                    >
                      <meta.Icon size={15} color={meta.color} strokeWidth={2} />
                    </div>
                    <div className={styles.notifTextBox}>
                      <div className={styles.notifMessage}>{n.message}</div>
                      <div className={styles.notifTime}>
                        {timeAgo(n.createdAt)}
                      </div>
                    </div>
                    {!n.read && <div className={styles.unreadDot} />}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
