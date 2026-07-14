'use client';

import {
  Construction, Info, Tag, Link2, Star, Shield,
  Users, Mail, ShoppingBag
} from 'lucide-react';
import styles from './page.module.css';

const FEATURES = [
  { Icon: Tag,         name: 'Community Deals',    desc: 'Post and discover deals shared by real members.' },
  { Icon: Link2,        name: 'Affiliate Links',     desc: 'Generate a personal tracking link for any deal.' },
  { Icon: Star,         name: 'Reward Points',       desc: 'Earn points for every click and confirmed sale.' },
  { Icon: Shield,        name: 'Moderated Content',   desc: 'Deals are reviewed to keep the platform trustworthy.' },
];

export default function AboutClient() {
  return (
    <div className={styles.wrap}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroIcon}>
            <Info size={26} color="#fff" strokeWidth={2} />
          </div>
          <h1 className={styles.heroTitle}>About DealHub</h1>
          <p className={styles.heroDesc}>
            A community-driven deals and rewards platform.
          </p>
        </div>
      </section>

      <div className={styles.main}>

        {/* Dev notice */}
        <div className={styles.devBanner}>
          <div className={styles.devIcon}>
            <Construction size={19} color="#92400e" strokeWidth={2} />
          </div>
          <div>
            <div className={styles.devTitle}>This site is under development</div>
            <div className={styles.devDesc}>
              DealHub is currently being built and tested. Some features may be
              incomplete, data may be reset, and functionality is subject to
              change without notice.
            </div>
          </div>
        </div>

        {/* What is DealHub */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>What is DealHub?</div>
          <p className={styles.sectionText}>
            DealHub is a community-powered platform for discovering and sharing
            the best online deals. Members post deals they find, vote on which
            ones are worth sharing, and generate personal affiliate links —
            earning reward points every time someone shops through their link.
          </p>
        </div>

        {/* Features */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Core Features</div>
          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <div key={f.name} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <f.Icon size={17} color="#111111" strokeWidth={2} />
                </div>
                <div>
                  <div className={styles.featureName}>{f.name}</div>
                  <div className={styles.featureDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className={styles.contactCard}>
          <div className={styles.contactTitle}>Questions or feedback?</div>
          <div className={styles.contactDesc}>
            This platform is a work in progress. Feel free to reach out with
            any questions, bug reports, or suggestions.
          </div>
        </div>
      </div>
    </div>
  );
}