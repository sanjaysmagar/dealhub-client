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
import {
  loginUser,
  verifyOtp,
  resendOtp,
  clearError,
  clearPendingVerification,
} from "@/store/slices/authSlice";
import styles from "./page.module.css";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function LoginClient() {
  const dispatch = useDispatch();
  const { user, loading, resendLoading, error, pendingVerification } =
    useSelector((s) => s.auth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [justRegistered, setJustRegistered] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "true") {
      setJustRegistered(true);
    }
  }, []);

  // Already logged in — bounce home. Also fires the moment OTP
  // verification succeeds below, since that's when `user` first gets set.
  useEffect(() => {
    if (user) {
      window.location.href = "/";
    }
  }, [user]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (user) return null; // avoid a flash of the form before the redirect fires

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
    // If unverified, loginUser.rejected sets pendingVerification and
    // this component swaps to the code-entry view below.
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setLocalError("Enter the 6-digit code");
      return;
    }
    await dispatch(verifyOtp({ userId: pendingVerification.userId, code: otpCode }));
  };

  const handleResend = async () => {
    const result = await dispatch(resendOtp(pendingVerification.userId));
    if (resendOtp.fulfilled.match(result)) {
      setCooldown(60);
    }
  };

  const handleBackToLogin = () => {
    dispatch(clearPendingVerification());
    setOtpCode("");
    setLocalError("");
  };

  const displayError = localError || error;

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        {pendingVerification ? (
          <>
            <div className={styles.logoRow}>
              <div className={styles.logoIcon}>
                <Tag size={22} color="#fff" strokeWidth={2.5} />
              </div>
              <div className={styles.title}>Verify your email</div>
              <div className={styles.subtitle}>
                Enter the code sent to {pendingVerification.email}, or
                request a new one below.
              </div>
            </div>

            <form className={styles.form} onSubmit={handleVerify}>
              <div className={styles.field}>
                <label className={styles.label}>Verification code</label>
                <div
                  className={`${styles.inputWrap} ${focusedField === "otp" ? styles.inputWrapFocused : ""}`}
                >
                  <Lock size={15} color="#a8a29e" strokeWidth={2} />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, ""));
                      if (error) dispatch(clearError());
                      if (localError) setLocalError("");
                    }}
                    onFocus={() => setFocusedField("otp")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="123456"
                    className={styles.input}
                  />
                </div>
              </div>

              {displayError && (
                <div className={styles.errorBox}>
                  <AlertCircle size={14} strokeWidth={2.5} />
                  {displayError}
                </div>
              )}

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} strokeWidth={2.5} className={styles.spin} />{" "}
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify <ArrowRight size={15} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>

            <div className={styles.footerText}>
              {cooldown > 0 ? (
                <>Resend available in {cooldown}s</>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className={styles.footerLink}
                  style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", padding: 0 }}
                >
                  {resendLoading ? "Sending..." : "Resend code"}
                </button>
              )}
              {" · "}
              <button
                type="button"
                onClick={handleBackToLogin}
                className={styles.footerLink}
                style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", padding: 0 }}
              >
                Back to login
              </button>
            </div>
          </>
        ) : (
          <>
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
              {justRegistered && (
                <div className={styles.successBox}>
                  <CheckCircle2 size={14} strokeWidth={2.5} />
                  Account created! Please sign in.
                </div>
              )}

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

              {error && (
                <div className={styles.errorBox}>
                  <AlertCircle size={14} strokeWidth={2.5} />
                  {error}
                </div>
              )}

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

            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>or</span>
              <div className={styles.dividerLine} />
            </div>

            <GoogleSignInButton />

            <div className={styles.footerText}>
              Don&apos;t have an account?{" "}
              <Link href="/register" className={styles.footerLink}>
                Sign up
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}