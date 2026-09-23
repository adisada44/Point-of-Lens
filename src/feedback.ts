export const FEEDBACK_EMAIL = 'adisadashiv44@gmail.com';
export const MAX_FEEDBACK_LENGTH = 1000;
export const LIKES_STORAGE_KEY = 'point-of-lens:likes:v1';

export function feedbackMailto(text: string) {
  // TextEncoder replaces isolated UTF-16 surrogates (including a sliced emoji)
  // so arbitrary pasted input cannot make encodeURIComponent throw.
  const body = new TextDecoder().decode(new TextEncoder().encode(text.trim().slice(0, MAX_FEEDBACK_LENGTH)));
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('Point of Lens feedback')}&body=${encodeURIComponent(body)}`;
}
export function parseLikes(raw: string | null) {
  if (!raw || !/^\d{1,7}$/.test(raw)) return 0;
  return Math.min(9999999, Number(raw));
}
