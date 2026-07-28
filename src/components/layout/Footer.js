import Link from "next/link";
import { Tag, AtSign, Globe, Mail, Shield } from "lucide-react";
import styles from "./Footer.module.css";

const FOOTER_COLS = [
  {
    title: "Discover",
    links: [
      { label: "Hot Deals", href: "/" },
      { label: "Browse All Deals", href: "/deals" },
      { label: "Post a Deal", href: "/post" },
    ],
  },
  {
    title: "Categories",
    links: [
      { label: "Fashion", href: "/deals" },
      { label: "Tech & Gadgets", href: "/deals" },
      { label: "Home & Garden", href: "/deals" },
      { label: "Gaming", href: "/deals" },
    ],
  },
  // {
  //   title: 'Account',
  //   links: [
  //     { label: 'Sign In',        href: '/login'     },
  //     { label: 'Create Account', href: '/register'  },
  //     { label: 'My Dashboard',   href: '/dashboard' },
  //     { label: 'Rewards',        href: '/rewards'   },
  //   ],
  // },
  {
    title: "Earn",
    links: [
      { label: "Rewards Dashboard", href: "/rewards" },
      { label: "Leaderboard", href: "/rewards" },
      { label: "Badges", href: "/rewards" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About DealHub", href: "/about" },
      { label: "Community Guidelines", href: "/" },
      { label: "Contact Us", href: "/" },
    ],
  },
];

const SOCIAL_ICONS = [AtSign, Globe, Mail, Shield];

const LEGAL_LINKS = [
  "Privacy Policy",
  "Cookie Settings",
  "Terms of Use",
  "Accessibility",
  "Sitemap",
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* ── Main grid ── */}
        <div className={styles.grid}>
          {/* Brand column */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <Tag size={16} color="#111" strokeWidth={2.5} />
              </div>
              <span className={styles.logoText}>DealHub</span>
            </Link>

            <p className={styles.tagline}>
              A community-driven deals platform. Share deals, earn rewards, and
              help others save.
            </p>

            <div className={styles.socials}>
              {SOCIAL_ICONS.map((Icon, i) => (
                <button key={i} className={styles.socialBtn}>
                  <Icon size={14} color="#666" strokeWidth={2} />
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title} className={styles.col}>
              <div className={styles.colTitle}>{col.title}</div>
              {col.links.map((link, i) => (
                <Link
                  key={`${link.label}-${i}`}
                  href={link.href}
                  className={styles.colLink}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* ── Newsletter ── */}
        <div className={styles.newsletter}>
          <div className={styles.newsletterText}>
            <div className={styles.newsletterTitle}>
              Get the best deals in your inbox 📬
            </div>
            <div className={styles.newsletterSub}>
              Weekly roundup of the hottest UK deals. No spam, unsubscribe any
              time.
            </div>
          </div>
          <div className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="your@email.co.uk"
              className={styles.newsletterInput}
            />
            <button className={styles.newsletterBtn}>Subscribe →</button>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className={styles.divider} />

        {/* ── Bottom bar ── */}
        <div className={styles.bottom}>
          <span className={styles.copyright}>
            © 2026 DealHub. All rights reserved.
          </span>
          <div className={styles.legalLinks}>
            {LEGAL_LINKS.map((link) => (
              <span key={link} className={styles.legalLink}>
                {link}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
