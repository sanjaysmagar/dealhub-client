'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { Tag, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { useEffect } from 'react';
import styles from './page.module.css';

export default function LoginClient() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [justRegistered, setJustRegistered] = useState(false);

    useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === 'true') {
      setJustRegistered(true);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      window.location.href = '/';
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
          <div className={styles.subtitle}>Sign in to continue earning rewards</div>
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
            <div className={`${styles.inputWrap} ${focusedField === 'email' ? styles.inputWrapFocused : ''}`}>
              <Mail size={15} color="#a8a29e" strokeWidth={2} />
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="you@example.com"
                className={styles.input}
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={`${styles.inputWrap} ${focusedField === 'password' ? styles.inputWrapFocused : ''}`}>
              <Lock size={15} color="#a8a29e" strokeWidth={2} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                className={styles.input}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword
                  ? <EyeOff size={15} color="#a8a29e" strokeWidth={2} />
                  : <Eye size={15} color="#a8a29e" strokeWidth={2} />
                }
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
            {loading
              ? <><Loader2 size={16} strokeWidth={2.5} className={styles.spin} /> Signing in...</>
              : <>Sign In <ArrowRight size={15} strokeWidth={2.5} /></>
            }
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>or</span>
          <div className={styles.dividerLine} />
        </div>

        {/* Google — placeholder */}
        <button className={styles.googleBtn} disabled>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        <div className={styles.googleNote}>Coming soon</div>

        <div className={styles.footerText}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className={styles.footerLink}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}