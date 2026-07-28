"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Tag,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { loginUser, clearError } from "@/store/slices/authSlice";
import styles from "./page.module.css";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function LoginClient() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "true") {
      setJustRegistered(true);
    }
  }, []);

  // Already logged in — this page has nothing to offer them, bounce home
  useEffect(() => {
    if (user) {
      window.location.href = "/";
    }
  }, [user]);

  if (user) return null; // avoid a flash of the login form before the redirect fires

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      window.location.href = "/";
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>
            <Tag size={22} color="#fff" strokeWidth={2.5} />
          </div>
          <div className={styles.title}>Welcome back</div>
          <div className={styles.subtitle}>
            Sign in to continue earning rewards
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Success banner after registration */}
          {justRegistered && (
            <div className={styles.successBox}>
              <CheckCircle2 size={14} strokeWidth={2.5} />
              Account created! Please sign in.
            </div>
          )}

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div
              className={`${styles.inputWrap} ${focusedField === "email" ? styles.inputWrapFocused : ""}`}
            >
              <Mail size={15} color="#a8a29e" strokeWidth={2} />
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="you@example.com"
                className={styles.input}
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div
              className={`${styles.inputWrap} ${focusedField === "password" ? styles.inputWrapFocused : ""}`}
            >
              <Lock size={15} color="#a8a29e" strokeWidth={2} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                className={styles.input}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={15} color="#a8a29e" strokeWidth={2} />
                ) : (
                  <Eye size={15} color="#a8a29e" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          <div className={styles.forgotRow}>
            <span className={styles.forgotLink}>Forgot password?</span>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.errorBox}>
              <AlertCircle size={14} strokeWidth={2.5} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} strokeWidth={2.5} className={styles.spin} />{" "}
                Signing in...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={15} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>or</span>
          <div className={styles.dividerLine} />
        </div>

        {/* Google — placeholder */}
        <GoogleSignInButton />

        <div className={styles.footerText}>
          Don&apos;t have an account?{" "}
          <Link href="/register" className={styles.footerLink}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
