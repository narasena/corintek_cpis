/**
 * HMAC-SHA256 signing for R2 object reads.
 *
 * The R2 Worker refuses unauthenticated GETs. This module issues the short-lived
 * `?exp=&sig=` suffix that authorizes a single object key.
 *
 * SERVER-ONLY: `R2_SIGNING_SECRET` must never reach client bundles. Do not
 * import this module from a Client Component.
 *
 * The worker verifies with the same payload and hex encoding
 * (worker/src/handler.ts).
 */

import { logger } from '@/lib/logger';

/** Signed URLs stay valid for 10 minutes. */
export const R2_URL_TTL_SECONDS = 600;

/**
 * Signature payload. Must stay byte-identical to
 * `buildSignaturePayload` in worker/src/handler.ts.
 */
export function buildR2SignaturePayload(key: string, exp: string): string {
  return `${key}\n${exp}`;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const { createHmac } = await import('node:crypto');
  return createHmac('sha256', secret).update(message).digest('hex');
}

/**
 * Extract the R2 object key from a stored URL, or null when the URL does not
 * point at a configured Worker host (external links, data URLs).
 *
 * Both the current Worker and the explicitly configured legacy Worker are
 * accepted, so stored URLs from before a host migration stay readable. Only
 * these exact configured origins match: an arbitrary `workers.dev` host does
 * not.
 */
export function extractR2ObjectKey(
  url: string,
  workerBaseUrl: string | undefined = process.env.R2_WORKER_URL
): string | null {
  const bases = [workerBaseUrl, process.env.R2_LEGACY_WORKER_URL]
    .filter((base): base is string => Boolean(base))
    .map(base => base.replace(/\/+$/, ''));

  const base = bases.find(candidate => url.startsWith(`${candidate}/`));
  if (!base) return null;

  // Parse instead of string-slicing so fragments, query strings, and
  // dot-segments are normalized exactly as the Worker's URL parser will.
  let parsed: URL;
  let baseOrigin: string;
  try {
    parsed = new URL(url);
    // A misconfigured base (e.g. a truncated `https://`) would prefix-match
    // every https URL; reject it here instead of throwing on every call.
    baseOrigin = new URL(base).origin;
  } catch {
    // Malformed URL (e.g. a raw `%` from an unsanitized filename).
    return null;
  }
  if (parsed.origin !== baseOrigin) return null;

  // `new URL` already resolved dot-segments, so pathname is canonical.
  const key = parsed.pathname.replace(/^\/+/, '');
  if (!key) return null;

  // The Worker decodes the raw pathname before verifying; match that form.
  try {
    return decodeURIComponent(key);
  } catch {
    return null;
  }
}

/**
 * Sign a stored R2 URL for a single read.
 *
 * Non-R2 URLs (already-signed, external, data:, blob:) are returned unchanged.
 * When no signing secret is configured the URL is returned unsigned: the Worker
 * rejects it with 401, so the media fails closed rather than the whole page
 * failing to render. Set R2_SIGNING_SECRET in every environment.
 */
export async function signR2Url(
  url: string,
  options: { now?: number; ttlSeconds?: number } = {}
): Promise<string> {
  const key = extractR2ObjectKey(url);
  if (key === null) return url;

  // Without a current Worker there is nowhere to serve the object from: a
  // legacy-host URL can only match, so return it unchanged rather than sign it
  // for a host that will not verify the signature.
  const currentBase = process.env.R2_WORKER_URL;
  if (!currentBase) {
    logger.error(
      'R2Sign',
      'signR2Url',
      'R2_WORKER_URL is not configured; returning unsigned URL',
      { key }
    );
    return url;
  }

  const secret = process.env.R2_SIGNING_SECRET;
  if (!secret) {
    logger.error(
      'R2Sign',
      'signR2Url',
      'R2_SIGNING_SECRET is not configured; returning unsigned URL',
      { key }
    );
    return url;
  }

  const now = options.now ?? Date.now();
  const exp = String(
    Math.floor(now / 1000) + (options.ttlSeconds ?? R2_URL_TTL_SECONDS)
  );
  const sig = await hmacSha256Hex(secret, buildR2SignaturePayload(key, exp));

  // Rebuild via the URL API so a fragment or pre-existing query in the stored
  // URL never swallows exp/sig.
  const signed = new URL(url);

  // A legacy-host URL must be served from the current Worker; sign it there.
  const target = new URL(currentBase);
  if (signed.origin !== target.origin) {
    signed.protocol = target.protocol;
    signed.host = target.host;
  }

  signed.hash = '';
  signed.search = '';
  signed.searchParams.set('exp', exp);
  signed.searchParams.set('sig', sig);
  return signed.toString();
}

/** Sign a nullable URL, passing null/undefined through. */
export async function signR2UrlOrNull(
  url: string | null | undefined
): Promise<string | null> {
  if (!url) return null;
  return signR2Url(url);
}

/**
 * Sign the `avatarUrl` of a user-shaped record.
 *
 * User avatars are returned by several read paths; this keeps the shape in one
 * place instead of repeating the spread at each call site.
 */
export async function signAvatarUrl<T extends { avatarUrl: string | null }>(
  user: T
): Promise<T> {
  return { ...user, avatarUrl: await signR2UrlOrNull(user.avatarUrl) };
}

/** Sign `avatarUrl` on every record in a list. */
export async function signAvatarUrls<T extends { avatarUrl: string | null }>(
  users: T[]
): Promise<T[]> {
  return Promise.all(users.map(signAvatarUrl));
}

/**
 * Canonical stored form of an R2 URL: no `?exp=&sig=` suffix.
 *
 * Signed URLs are valid for 10 minutes. If one is written back to the database
 * (a form that round-trips a displayed URL), the stored media breaks once it
 * expires. Apply this at every persistence boundary that accepts a URL from
 * the client.
 */
export function stripR2Signature(
  url: string | null | undefined,
  workerBaseUrl: string | undefined = process.env.R2_WORKER_URL
): string | null | undefined {
  if (!url) return url;
  if (extractR2ObjectKey(url, workerBaseUrl) === null) return url;

  const parsed = new URL(url);
  parsed.search = '';
  parsed.hash = '';
  return parsed.toString();
}
