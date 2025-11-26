const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const FALLBACK_GAME_IMAGE = "/og/mgh-game-fallback.svg";
export const FALLBACK_OG_IMAGE = "/og/mgh-game-fallback.svg";

const OPTIMIZED_HOSTS = new Set([
  // First-party
  "mobilegamehunt.com",
  "www.mobilegamehunt.com",
  "vercel.app",
  // App store + known sources (match next.config.ts)
  "play-lh.googleusercontent.com",
  "lh3.googleusercontent.com",
  "lh4.googleusercontent.com",
  "lh5.googleusercontent.com",
  "lh6.googleusercontent.com",
  "is1-ssl.mzstatic.com",
  "is2-ssl.mzstatic.com",
  "is3-ssl.mzstatic.com",
  "is4-ssl.mzstatic.com",
  "is5-ssl.mzstatic.com",
  "media.wired.com",
  "i.giphy.com",
  "media.giphy.com",
  "media1.giphy.com",
  "media2.giphy.com",
  "media3.giphy.com",
  "media4.giphy.com",
]);

const ensureLeadingSlash = (path: string) =>
  path.startsWith("/") ? path : `/${path}`;

export function getSiteBaseUrl() {
  return DEFAULT_BASE_URL;
}

const isBrowser = typeof window !== "undefined";

export function toAbsoluteUrl(pathOrUrl?: string | null, fallback: string = FALLBACK_OG_IMAGE) {
  const candidate = pathOrUrl?.trim();
  if (!candidate) {
    return isBrowser ? ensureLeadingSlash(fallback) : `${DEFAULT_BASE_URL}${ensureLeadingSlash(fallback)}`;
  }

  if (/^https?:\/\//i.test(candidate)) {
    return candidate;
  }

  if (candidate.startsWith("//")) {
    return `https:${candidate}`;
  }

  if (candidate.startsWith("/")) {
    return isBrowser ? candidate : `${DEFAULT_BASE_URL}${candidate}`;
  }

  const withLeadingSlash = ensureLeadingSlash(candidate);
  return isBrowser ? withLeadingSlash : `${DEFAULT_BASE_URL}${withLeadingSlash}`;
}

export function getGameImageUrl(
  pathOrUrl?: string | null,
  fallback: string = FALLBACK_GAME_IMAGE,
) {
  return toAbsoluteUrl(pathOrUrl, fallback);
}

export function canOptimizeImage(url: string) {
  try {
    const { hostname } = new URL(url);
    return OPTIMIZED_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

