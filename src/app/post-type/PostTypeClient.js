"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { Tag, Percent, MessageCircle, Link2, ArrowRight } from "lucide-react";
import styles from "./page.module.css";

const TYPES = [
  {
    id: "deal",
    Icon: Tag,
    title: "Deal",
    desc: "Post specific products on sale — trainers, gadgets, groceries. With or without a coupon.",
    href: "/post-type/deal",
    enabled: true,
  },
  {
    id: "voucher",
    Icon: Percent,
    title: "Voucher",
    desc: "Share coupons and voucher codes that give discounts on product lines, stores, or events.",
    enabled: false,
  },
  {
    id: "discuss",
    Icon: MessageCircle,
    title: "Discussion",
    desc: "Start a discussion to get tips or advice from our community of deal experts.",
    enabled: false,
  },
  {
    id: "referral",
    Icon: Link2,
    title: "Referral Offer",
    desc: "Post your unique affiliate or referral link — both you and the community benefit.",
    enabled: false,
  },
];

export default function PostTypeClient() {
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
    }
  }, [user]);

  if (!user) return null; // brief blank moment while redirecting

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.title}>What do you want to post?</h1>
        <p className={styles.subtitle}>
          Choose the type that best describes your submission
        </p>
      </div>

      {TYPES.map((t) => {
        const CardInner = (
          <>
            <div className={styles.typeIcon}>
              <t.Icon size={24} color="#111111" strokeWidth={2} />
            </div>
            <div className={styles.typeText}>
              <div className={styles.typeTitle}>
                {t.title}
                {!t.enabled && (
                  <span className={styles.comingSoonTag}>Coming Soon</span>
                )}
              </div>
              <div className={styles.typeDesc}>{t.desc}</div>
            </div>
            {t.enabled && (
              <div className={styles.arrowBadge}>
                <ArrowRight size={16} color="#fff" strokeWidth={2.5} />
              </div>
            )}
          </>
        );

        return t.enabled ? (
          <Link key={t.id} href={t.href} className={styles.typeCard}>
            {CardInner}
          </Link>
        ) : (
          <div
            key={t.id}
            className={`${styles.typeCard} ${styles.typeCardDisabled}`}
          >
            {CardInner}
          </div>
        );
      })}
    </div>
  );
}
