import Link from 'next/link';
import { Tag, AtSign, Globe, Mail, Shield } from 'lucide-react';
import styles from './Footer.module.css';

const FOOTER_COLS = [
  {
    title: 'Discover',
    links: [
      { label: 'Hot Deals',     href: '/?sort=hot'           },
      { label: 'New Deals',     href: '/?sort=new'           },
      { label: 'Expiring Soon', href: '/?sort=expiring'      },
      { label: 'Voucher Codes', href: '/deals?cat=voucher'   },
      { label: 'Freebies',      href: '/deals?cat=freebie'   },
    ],
  },
  {
    title: 'Categories',
    links: [
      { label: 'Beauty & Health', href: '/?category=Beauty'  },
      { label: 'Fashion',         href: '/?category=Fashion' },
      { label: 'Tech & Gadgets',  href: '/?category=Tech'    },
      { label: 'Home & Garden',   href: '/?category=Home'    },
      { label: 'Gaming',          href: '/?category=Gaming'  },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In',           href: '/login'     },
      { label: 'Create Account',    href: '/register'  },
      { label: 'My Dashboard',      href: '/dashboard' },
      { label: 'Saved Deals',       href: '/dashboard' },
      { label: 'Rewards Dashboard', href: '/rewards'   },
    ],
  },
  {
    title: 'Earn',
    links: [
      { label: 'Affiliate Program', href: '/rewards' },
      { label: 'How Points Work',   href: '/rewards' },
      { label: 'Refer a Friend',    href: '/rewards' },
      { label: 'Leaderboard',       href: '/rewards' },
      { label: 'Badges',            href: '/rewards' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About DealHub',        href: '/' },
      { label: 'Community Guidelines', href: '/' },
      { label: 'Advertise',            href: '/' },
      { label: 'Contact Us',           href: '/' },
      { label: 'Press',                href: '/' },
    ],
  },
];

const SOCIAL_ICONS = [AtSign, Globe, Mail, Shield];

const LEGAL_LINKS = [
  'Privacy Policy',
  'Cookie Settings',
  'Terms of Use',
  'Accessibility',
  'Sitemap',
];

const STATS = [
  { value: '2.8K+', label: 'Deals'   },
  { value: '15K',   label: 'Members' },
  { value: '£1.2M', label: 'Saved'   },
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
              The UK&apos;s #1 community deals platform. Share deals,
              earn rewards, save more every day.
            </p>

            <div className={styles.stats}>
              {STATS.map((s) => (
                <div key={s.label} className={styles.statItem}>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>

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
              {col.links.map((link) => (
                <Link
                  key={link.label}
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
              Weekly roundup of the hottest UK deals. No spam, unsubscribe any time.
            </div>
          </div>
          <div className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="your@email.co.uk"
              className={styles.newsletterInput}
            />
            <button className={styles.newsletterBtn}>
              Subscribe →
            </button>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className={styles.divider} />

        {/* ── Bottom bar ── */}
        <div className={styles.bottom}>
          <span className={styles.copyright}>
            © 2025 DealHub Ltd. All rights reserved. Registered in England &amp; Wales.
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