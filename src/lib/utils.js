// Calculate heat colour based on vote score
export const heatColor = (score) => {
  if (score >= 100) return '#dc2626'; // hot red
  if (score >= 40)  return '#ea580c'; // warm orange
  if (score >= 0)   return '#111111'; // neutral black
  return '#2563eb';                   // cold blue
};

export const heatLabel = (score) => {
  if (score >= 100) return 'Hot';
  if (score >= 40)  return 'Warm';
  if (score >= 0)   return 'Cool';
  return 'Cold';
};

// Format price as GBP
export const formatPrice = (price) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);

// Time ago from date string
export const timeAgo = (dateString) => {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60)    return 'just now';
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// Category emoji and gradient map
export const CAT_STYLES = {
  Beauty:  { bg: 'from-pink-100 to-fuchsia-100', emoji: '💄' },
  Fashion: { bg: 'from-violet-100 to-purple-100', emoji: '👗' },
  Tech:    { bg: 'from-blue-100 to-sky-100',      emoji: '🎧' },
  Home:    { bg: 'from-emerald-100 to-green-100', emoji: '🏡' },
  Food:    { bg: 'from-orange-100 to-amber-100',  emoji: '🍕' },
  Sports:  { bg: 'from-sky-100 to-blue-100',      emoji: '⚽' },
  Gaming:  { bg: 'from-violet-100 to-indigo-100', emoji: '🎮' },
  Other:   { bg: 'from-gray-100 to-slate-100',    emoji: '🎁' },
};