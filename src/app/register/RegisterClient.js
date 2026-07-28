"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Tag,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { registerUser, clearError, logout } from "@/store/slices/authSlice";
import styles from "./page.module.css";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function RegisterClient() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [localError, setLocalError] = useState("");

  // Already logged in — nothing to register for, bounce home
  useEffect(() => {
    if (user) {
      window.location.href = "/";
    }
  }, [user]);

  if (user) return null; // avoid a flash of the register form before the redirect fires

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
    if (localError) setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    const { username, email, password } = form;
    const result = await dispatch(registerUser({ username, email, password }));
    if (registerUser.fulfilled.match(result)) {
      dispatch(logout()); // clear the auto-issued token
      window.location.href = "/login?registered=true";
    }
  };

  const displayError = localError || error;

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>
            <Tag size={22} color="#fff" strokeWidth={2.5} />
          </div>
          <div className={styles.title}>Create your account</div>
          <div className={styles.subtitle}>
            Join DealHub and start earning rewards
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Username */}
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <div
              className={`${styles.inputWrap} ${focusedField === "username" ? styles.inputWrapFocused : ""}`}
            >
              <User size={15} color="#a8a29e" strokeWidth={2} />
              <input
                type="text"
                name="username"
                required
                minLength={3}
                value={form.username}
                onChange={handleChange}
                onFocus={() => setFocusedField("username")}
                onBlur={() => setFocusedField(null)}
                placeholder="yourname"
                className={styles.input}
              />
            </div>
          </div>

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
                minLength={6}
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="At least 6 characters"
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

          {/* Confirm password */}
          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
            <div
              className={`${styles.inputWrap} ${focusedField === "confirmPassword" ? styles.inputWrapFocused : ""}`}
            >
              <Lock size={15} color="#a8a29e" strokeWidth={2} />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                onFocus={() => setFocusedField("confirmPassword")}
                onBlur={() => setFocusedField(null)}
                placeholder="Re-enter your password"
                className={styles.input}
              />
            </div>
          </div>

          {/* Error */}
          {displayError && (
            <div className={styles.errorBox}>
              <AlertCircle size={14} strokeWidth={2.5} />
              {displayError}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} strokeWidth={2.5} className={styles.spin} />{" "}
                Creating account...
              </>
            ) : (
              <>
                Create Account <ArrowRight size={15} strokeWidth={2.5} />
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
          Already have an account?{" "}
          <Link href="/login" className={styles.footerLink}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
