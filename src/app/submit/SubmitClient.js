"use client";

import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Link2,
  Globe,
  ArrowRight,
  ArrowLeft,
  Zap,
  Upload,
  AlignLeft,
  Calendar,
  CheckCircle,
  Check,
  X,
  Percent,
  AlertCircle,
  Loader2,
  Plus,
  ImageOff,
  Tag,
  Store,
  ChevronDown,
} from "lucide-react";
import { createDeal } from "@/store/slices/dealsSlice";
import { generateLink } from "@/store/slices/affiliateSlice";
import { CAT_STYLES } from "@/lib/utils";
import styles from "./page.module.css";

const STEPS = [
  { label: "Link", Icon: Link2 },
  { label: "Essentials", Icon: Zap },
  { label: "Image Gallery", Icon: Upload },
  { label: "Description", Icon: AlignLeft },
  { label: "Final Details", Icon: Calendar },
  { label: "Review", Icon: CheckCircle },
];

const CATEGORIES = [
  "Beauty",
  "Fashion",
  "Tech",
  "Home",
  "Food",
  "Sports",
  "Gaming",
  "Other",
];
const RETAILERS = ["ebay", "amazon", "asos", "other"];

export default function SubmitClient() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);
  const [focused, setFocused] = useState("");
  const [linkError, setLinkError] = useState("");

  const [form, setForm] = useState({
    externalLink: "",
    title: "",
    discountedPrice: "",
    originalPrice: "",
    category: "",
    retailer: "",
    images: [],
    availability: "online",
    description: "",
    expiresAt: "",
    wantAffiliate: false,
  });

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [imageUrlInput, setImageUrlInput] = useState("");
  const imageInputRef = useRef(null);

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (form.images.includes(url)) {
      setImageUrlInput("");
      return;
    }
    if (form.images.length >= 8) return; // cap at 8, same as HotUKDeals

    setForm((f) => ({ ...f, images: [...f.images, url] }));
    setImageUrlInput("");
  };

  const removeImage = (index) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const focusImageInput = () => {
    imageInputRef.current?.focus();
  };

  const next = () => step < 5 && setStep((s) => s + 1);
  const back = () => step > 0 && setStep((s) => s - 1);

  const isStepValid = (index) => {
    if (index === 0) {
      return !!form.externalLink.trim();
    }
    if (index === 1) {
      return !!(
        form.title.trim() &&
        form.discountedPrice &&
        form.category &&
        form.retailer
      );
    }
    return true; // Image Gallery, Description, Final Details are all optional
  };

  const handleGetStartedLink = () => {
    if (!form.externalLink.trim()) {
      setLinkError("Please add a link before continuing.");
      return;
    }
    setLinkError("");
    next();
  };

  const discountPct =
    form.discountedPrice && form.originalPrice && +form.originalPrice > 0
      ? Math.max(
          0,
          Math.round(
            ((+form.originalPrice - +form.discountedPrice) /
              +form.originalPrice) *
              100,
          ),
        )
      : 0;

  const handleSubmitDeal = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const dealPayload = {
      title: form.title,
      description: form.description,
      originalPrice: +form.originalPrice,
      discountedPrice: +form.discountedPrice,
      category: form.category,
      retailer: form.retailer || "other",
      imageUrl: form.images[0] || "",
      images: form.images,
      externalLink: form.externalLink || "https://example.com",
      expiresAt: form.expiresAt || null,
    };

    const result = await dispatch(createDeal(dealPayload));

    if (createDeal.fulfilled.match(result)) {
      const newDeal = result.payload;

      if (form.wantAffiliate) {
        const linkResult = await dispatch(generateLink(newDeal._id));
        if (generateLink.fulfilled.match(linkResult)) {
          setCreatedLink(linkResult.payload.shareUrl);
        }
      }
      setSubmitted(true);
    } else {
      setSubmitError(
        result.payload || "Failed to post deal. Please try again.",
      );
    }

    setSubmitting(false);
  };

  // ── SUCCESS SCREEN ──
  if (submitted) {
    return (
      <div className={styles.successWrap}>
        <div className={styles.successIcon}>
          <Check size={34} color="#22c55e" strokeWidth={2.5} />
        </div>
        <h2 className={styles.successTitle}>Deal posted! 🎉</h2>
        <p className={styles.successDesc}>
          Your deal is live and visible to the community.
          {form.wantAffiliate &&
            createdLink &&
            " Your unique affiliate link is ready — start sharing and earning right away."}
        </p>
        {createdLink && (
          <div className={styles.successLinkBox}>{createdLink}</div>
        )}
        <a href="/" className={styles.successBtn}>
          Browse Deals <ArrowRight size={15} strokeWidth={2.5} />
        </a>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ── */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarTitle}>Submit your deal</div>

        {STEPS.map((s, i) => {
          const done = i < step;
          const current = i === step;
          const valid = isStepValid(i);
          const incomplete = done && !valid;
          return (
            <div
              key={i}
              onClick={() => done && setStep(i)}
              className={`${styles.stepItem} ${done ? styles.stepItemClickable : ""} ${current ? styles.stepItemActive : ""}`}
            >
              <div
                className={`${styles.stepDot} ${done && valid ? styles.stepDotDone : ""} ${incomplete ? styles.stepDotIncomplete : ""} ${current ? styles.stepDotActive : ""}`}
              >
                {done && valid ? (
                  <Check size={12} color="#22c55e" strokeWidth={3} />
                ) : incomplete ? (
                  <AlertCircle size={12} color="#dc2626" strokeWidth={2.5} />
                ) : (
                  <s.Icon
                    size={12}
                    color={current ? "#fff" : "#a8a29e"}
                    strokeWidth={2.5}
                  />
                )}
              </div>
              <span
                className={`${styles.stepLabel} ${current ? styles.stepLabelActive : ""} ${done && valid ? styles.stepLabelDone : ""} ${incomplete ? styles.stepLabelIncomplete : ""}`}
              >
                {s.label}
              </span>
            </div>
          );
        })}

        <div className={styles.sidebarDivider} />
        <div className={styles.helpBox}>
          <div className={styles.helpTitle}>Need help?</div>
          <div className={styles.helpDesc}>
            Fill in as much detail as you can.
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <div className={styles.main}>
        <div className={styles.content}>
          {/* STEP 0 — Link */}
          {step === 0 && (
            <div className={styles.linkStep}>
              <div className={styles.linkIcon}>
                <Link2 size={26} color="#111111" strokeWidth={2} />
              </div>
              <h2 className={styles.linkHeading}>
                Share a deal with millions of people
              </h2>
              <p className={styles.linkSub}>
                Paste the link where users can buy the deal or find out more
                information
              </p>
              <div className={styles.linkInputRow}>
                <div
                  className={`${styles.linkInputBox} ${focused === "url" ? styles.linkInputBoxFocused : ""}`}
                >
                  <Globe size={14} color="#a8a29e" strokeWidth={2} />
                  <input
                    value={form.externalLink}
                    onChange={(e) => {
                      upd("externalLink", e.target.value);
                      if (linkError) setLinkError("");
                    }}
                    onFocus={() => setFocused("url")}
                    onBlur={() => setFocused("")}
                    placeholder="https://www.site.com/greatdeal..."
                    className={styles.linkInput}
                  />
                </div>
                <button
                  onClick={handleGetStartedLink}
                  className={styles.getStartedBtn}
                >
                  Get started
                </button>
              </div>

              {linkError && (
                <div
                  className={styles.submitError}
                  style={{ marginTop: 12, justifyContent: "center" }}
                >
                  <AlertCircle size={14} strokeWidth={2.5} />
                  {linkError}
                </div>
              )}

              <button
                className={styles.skipLinkBtn}
                style={{ marginTop: linkError ? 14 : 0 }}
              >
                I don&apos;t have a link
              </button>
            </div>
          )}

          {/* STEP 1 — Essentials */}
          {step === 1 && (
            <div className={styles.step}>
              <h2 className={styles.stepHeading}>
                Let&apos;s start with the essentials
              </h2>
              <p className={styles.stepSub}>
                Fill in the core details of your deal
              </p>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <span>
                    Title <span className={styles.required}>*</span>
                  </span>
                  <span>{form.title.length}/140</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => upd("title", e.target.value.slice(0, 140))}
                  placeholder="A short descriptive title of your deal..."
                  className={styles.textInput}
                />
              </div>

              <div className={styles.sectionTitle}>Price details</div>
              <div className={styles.twoCol}>
                <div>
                  <label className={styles.formLabel}>
                    <span>
                      Discounted Price{" "}
                      <span className={styles.required}>*</span>
                    </span>
                  </label>
                  <div className={styles.priceInputBox}>
                    <span className={styles.currencySign}>£</span>
                    <input
                      value={form.discountedPrice}
                      onChange={(e) => upd("discountedPrice", e.target.value)}
                      type="number"
                      min="0"
                      placeholder="0.00"
                      className={styles.priceInput}
                    />
                  </div>
                </div>
                <div>
                  <label className={styles.formLabel}>
                    <span>Original Price</span>
                    {discountPct > 0 && (
                      <span className={styles.discountBadge}>
                        -{discountPct}%
                      </span>
                    )}
                  </label>
                  <div className={styles.priceInputBox}>
                    <span className={styles.currencySign}>£</span>
                    <input
                      value={form.originalPrice}
                      onChange={(e) => upd("originalPrice", e.target.value)}
                      type="number"
                      min="0"
                      placeholder="0.00"
                      className={styles.priceInput}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.twoCol}>
                <div>
                  <label className={styles.formLabel}>
                    <span>
                      Category <span className={styles.required}>*</span>
                    </span>
                  </label>
                  <div className={styles.selectWrap}>
                    <Tag
                      size={15}
                      className={styles.selectIcon}
                      strokeWidth={2}
                    />
                    <select
                      value={form.category}
                      onChange={(e) => upd("category", e.target.value)}
                      className={styles.selectInput}
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className={styles.selectChevron}
                      strokeWidth={2}
                    />
                  </div>
                </div>
                <div>
                  <label className={styles.formLabel}>
                    <span>
                      Retailer <span className={styles.required}>*</span>
                    </span>
                  </label>
                  <div className={styles.selectWrap}>
                    <Store
                      size={15}
                      className={styles.selectIcon}
                      strokeWidth={2}
                    />
                    <select
                      value={form.retailer}
                      onChange={(e) => upd("retailer", e.target.value)}
                      className={styles.selectInput}
                    >
                      <option value="">Select retailer</option>
                      {RETAILERS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className={styles.selectChevron}
                      strokeWidth={2}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.sectionTitle}>Availability</div>
              <div className={styles.toggleRow}>
                {["online", "in-store"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => upd("availability", opt)}
                    className={`${styles.toggleBtn} ${form.availability === opt ? styles.toggleBtnActive : ""}`}
                  >
                    {opt === "online" ? "Online" : "In-store"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 — Image */}
          {/* STEP 2 — Image */}
          {step === 2 && (
            <div className={styles.step}>
              <h2 className={styles.stepHeading}>
                Make your deal stand out with images
              </h2>
              <p className={styles.stepSub}>
                Add up to 8 images. The first one is used as your deal&apos;s
                cover photo everywhere on the site.
              </p>

              <div className={styles.galleryGrid}>
                {form.images.map((url, i) => (
                  <div key={url + i} className={styles.galleryThumb}>
                    <img
                      src={url}
                      alt={`Image ${i + 1}`}
                      className={styles.galleryThumbImg}
                      onError={(e) => {
                        e.target.style.opacity = 0.15;
                      }}
                    />
                    <button
                      className={styles.galleryRemoveBtn}
                      onClick={() => removeImage(i)}
                      type="button"
                    >
                      <X size={13} strokeWidth={2.5} />
                    </button>
                    {i === 0 && (
                      <div className={styles.galleryCoverLabel}>Cover</div>
                    )}
                  </div>
                ))}

                {form.images.length < 8 && (
                  <button
                    className={styles.galleryAddTile}
                    onClick={focusImageInput}
                    type="button"
                  >
                    <Plus size={22} color="#a8a29e" strokeWidth={2} />
                    <span>Add Image</span>
                  </button>
                )}
              </div>

              <label className={styles.formLabel}>
                <span>Add image via URL</span>
              </label>
              <div className={styles.galleryUrlRow}>
                <input
                  ref={imageInputRef}
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addImageUrl();
                    }
                  }}
                  placeholder="https://example.com/image.jpg"
                  className={styles.textInput}
                  disabled={form.images.length >= 8}
                />
                <button
                  onClick={addImageUrl}
                  className={styles.galleryAddUrlBtn}
                  type="button"
                  disabled={!imageUrlInput.trim() || form.images.length >= 8}
                >
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </div>

              {form.images.length === 0 && (
                <div className={styles.galleryEmptyNote}>
                  <ImageOff size={13} strokeWidth={2} />
                  No images added yet — this deal will show a category icon
                  instead.
                </div>
              )}
              {form.images.length >= 8 && (
                <div className={styles.galleryEmptyNote}>
                  Maximum of 8 images reached.
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — Description */}
          {step === 3 && (
            <div className={styles.step}>
              <h2 className={styles.stepHeading}>
                Tell people more about this deal
              </h2>
              <p className={styles.stepSub}>
                Explain why it&apos;s a great deal — any tips, where to find it,
                promo tricks, etc.
              </p>
              <label className={styles.formLabel}>
                <span>Description</span>
                <span>{form.description.length} / 2000</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  upd("description", e.target.value.slice(0, 2000))
                }
                placeholder="Describe the deal — what makes it special, how long it's been running, any codes or tricks to get a better price..."
                className={styles.textarea}
              />
            </div>
          )}

          {/* STEP 4 — Final Details */}
          {step === 4 && (
            <div className={styles.step}>
              <h2 className={styles.stepHeading}>Almost there!</h2>
              <p className={styles.stepSub}>
                A few final details to help the community find your deal.
              </p>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <span>Deal expiry date (optional)</span>
                </label>
                <div className={styles.dateBox}>
                  <Calendar size={15} color="#a8a29e" strokeWidth={2} />
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => upd("expiresAt", e.target.value)}
                    className={styles.dateInput}
                  />
                </div>
              </div>

              <div className={styles.affiliateCard}>
                <div className={styles.affiliateHeader}>
                  <div className={styles.affiliateTitle}>
                    <Link2 size={15} strokeWidth={2.5} />
                    Enable Affiliate Tracking
                  </div>
                  <button
                    onClick={() => upd("wantAffiliate", !form.wantAffiliate)}
                    className={`${styles.switch} ${form.wantAffiliate ? styles.switchOn : ""}`}
                  >
                    <div
                      className={`${styles.switchKnob} ${form.wantAffiliate ? styles.switchKnobOn : ""}`}
                    />
                  </button>
                </div>
                <div className={styles.affiliateNote}>
                  {form.wantAffiliate
                    ? "✓ Your unique tracking link will be generated after posting. Earn 1 pt per click and 20 pts per purchase."
                    : "Enable to earn reward points every time someone shops through your deal link."}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 — Review */}
          {step === 5 && (
            <div className={styles.step}>
              <h2 className={styles.stepHeading}>Review your deal</h2>
              <p className={styles.stepSub}>
                Check everything looks right before it goes live.
              </p>

              <div className={styles.previewCard}>
                <div
                  className={styles.previewImg}
                  style={{
                    background: form.category
                      ? CAT_STYLES[form.category]?.gradient
                      : "#f5f5f5",
                  }}
                >
                  {form.images[0] ? (
                    <img
                      src={form.images[0]}
                      alt="Deal preview"
                      className={styles.previewImgPhoto}
                    />
                  ) : form.category ? (
                    CAT_STYLES[form.category]?.emoji
                  ) : (
                    "🏷️"
                  )}
                </div>
                <div className={styles.previewBody}>
                  <div className={styles.previewTags}>
                    {form.category && (
                      <span className={styles.previewTag}>{form.category}</span>
                    )}
                    {form.retailer && (
                      <span className={styles.previewTag}>{form.retailer}</span>
                    )}
                    {form.availability === "in-store" && (
                      <span className={styles.previewTag}>In-store</span>
                    )}
                  </div>
                  <div className={styles.previewTitle}>
                    {form.title || (
                      <span className={styles.previewTitlePlaceholder}>
                        No title entered
                      </span>
                    )}
                  </div>
                  <div className={styles.previewPriceRow}>
                    {form.discountedPrice && (
                      <span className={styles.previewPrice}>
                        £{(+form.discountedPrice).toFixed(2)}
                      </span>
                    )}
                    {form.originalPrice && (
                      <span className={styles.previewOldPrice}>
                        £{(+form.originalPrice).toFixed(2)}
                      </span>
                    )}
                    {discountPct > 0 && (
                      <span className={styles.previewDiscount}>
                        -{discountPct}%
                      </span>
                    )}
                  </div>
                  {form.description && (
                    <p className={styles.previewDesc}>{form.description}</p>
                  )}
                </div>
              </div>

              {form.externalLink && (
                <div className={styles.urlSummary}>
                  <Globe size={13} color="#a8a29e" strokeWidth={2} />
                  <span className={styles.urlSummaryText}>
                    {form.externalLink}
                  </span>
                </div>
              )}

              {form.wantAffiliate && (
                <div className={styles.affiliateNotice}>
                  <Link2 size={15} color="#111111" strokeWidth={2.5} />
                  <div className={styles.affiliateNoticeText}>
                    <strong>Affiliate tracking on.</strong> Your unique link is
                    ready immediately after posting. Share it anywhere — earn 1
                    pt per click + 20 pts per purchase.
                  </div>
                </div>
              )}

              {submitError && (
                <div className={styles.submitError}>
                  <AlertCircle size={14} strokeWidth={2.5} />
                  {submitError}
                </div>
              )}

              <button
                onClick={handleSubmitDeal}
                disabled={
                  submitting || !form.title || !form.category || !form.retailer
                }
                className={styles.submitDealBtn}
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={18}
                      strokeWidth={2.5}
                      style={{ animation: "spin 0.8s linear infinite" }}
                    />{" "}
                    Posting...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} strokeWidth={2.5} /> Post this Deal
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ── Bottom nav ── */}
        <div className={styles.bottomNav}>
          <button
            onClick={step === 0 ? () => window.history.back() : back}
            className={styles.backBtn}
          >
            <ArrowLeft size={14} strokeWidth={2.5} /> Back
          </button>

          <div className={styles.stepIndicator}>
            Step {step + 1} of {STEPS.length}
          </div>

          {step < 5 ? (
            <button onClick={next} className={styles.nextBtn}>
              Next <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          ) : (
            <div style={{ width: 80 }} />
          )}
        </div>
      </div>
    </div>
  );
}
