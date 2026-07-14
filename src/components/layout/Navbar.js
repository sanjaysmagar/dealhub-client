"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  Tag,
  Search,
  Bell,
  User,
  Plus,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Star,
  ChevronDown,
  Shield,
} from "lucide-react";
import { logout } from "@/store/slices/authSlice";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/deals", label: "Deals" },
  { href: "/rewards", label: "Rewards" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  // const router   = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);

  const userMenuRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      window.location.href = `/deals?search=${encodeURIComponent(searchVal.trim())}`;
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <>
      {/* ════════════ NAVBAR ════════════ */}
      <nav className={styles.nav}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Tag size={15} color="#fff" strokeWidth={2.5} />
            </div>
            <span className={styles.logoText}>
              Deal<span style={{ color: "#111" }}>Hub</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className={styles.navLinks}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${isActive(link.href) ? styles.navLinkActive : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className={styles.searchWrap}>
            <div
              className={`${styles.searchBox} ${searchFocus ? styles.searchBoxFocused : ""}`}
            >
              <Search size={13} color="#a8a29e" strokeWidth={2.5} />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
                placeholder="Search deals..."
                className={styles.searchInput}
              />
            </div>
          </form>

          {/* Desktop Post a Deal */}
          <Link href="/post-type" className={styles.postBtn}>
            <Plus size={13} strokeWidth={2.5} />
            Post a Deal
          </Link>

          {/* Desktop Bell */}
          <button className={styles.iconBtn}>
            <Bell size={15} color="#78716c" strokeWidth={2} />
          </button>

          {/* Right section */}
          <div className={styles.rightSection}>
            {user ? (
              /* Logged in */
              <div className={styles.dropdownWrap} ref={userMenuRef}>
                <button
                  className={styles.userBtn}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className={styles.userAvatar}>
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                  <span className={styles.userName}>{user.username}</span>
                  <ChevronDown
                    size={13}
                    color="#a8a29e"
                    strokeWidth={2}
                    className={`${styles.chevron} ${userMenuOpen ? styles.chevronOpen : ""}`}
                  />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownUsername}>
                        @{user.username}
                      </div>
                      <div className={styles.dropdownPoints}>
                        {user.points || 0} pts earned
                      </div>
                    </div>

                    <div className={styles.dropdownBody}>
                      {[
                        {
                          href: "/dashboard",
                          Icon: LayoutDashboard,
                          label: "My Dashboard",
                        },
                        { href: "/rewards", Icon: Star, label: "Rewards" },
                        ...(user.role === "admin"
                          ? [
                              {
                                href: "/admin",
                                Icon: Shield,
                                label: "Admin Panel",
                              },
                            ]
                          : []),
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setUserMenuOpen(false)}
                          className={styles.dropdownItem}
                        >
                          <item.Icon
                            size={14}
                            strokeWidth={2}
                            color="#78716c"
                          />
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    <div className={styles.dropdownFooter}>
                      <button
                        onClick={handleLogout}
                        className={styles.logoutBtn}
                      >
                        <LogOut size={14} strokeWidth={2} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in */
              <Link href="/login" className={styles.signInBtn}>
                <User size={13} strokeWidth={2.5} />
                Sign in
              </Link>
            )}

            {/* Hamburger — mobile only */}
            <button
              className={styles.hamburger}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X size={18} color="#111111" strokeWidth={2.5} />
              ) : (
                <Menu size={18} color="#78716c" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ════════════ MOBILE MENU ════════════ */}
      <div
        className={`${styles.backdrop} ${mobileOpen ? styles.backdropOpen : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      <div
        className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ""}`}
      >
        {/* Mobile search */}
        <form onSubmit={handleSearch}>
          <div
            className={`${styles.mobileSearchBox} ${searchFocus ? styles.mobileSearchBoxFocused : ""}`}
          >
            <Search size={14} color="#a8a29e" strokeWidth={2.5} />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              placeholder="Search deals..."
              className={styles.searchInput}
            />
          </div>
        </form>

        <div className={styles.mobileDivider} />

        {/* Mobile nav links */}
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.mobileNavLink} ${isActive(link.href) ? styles.mobileNavLinkActive : ""}`}
          >
            {link.label}
          </Link>
        ))}

        <div className={styles.mobileDivider} />

        {/* Mobile Post a Deal */}
        <Link href="/post-type" className={styles.mobilePostBtn}>
          <Plus size={15} strokeWidth={2.5} />
          Post a Deal
        </Link>
      </div>
    </>
  );
}
