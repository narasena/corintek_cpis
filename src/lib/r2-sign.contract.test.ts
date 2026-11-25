import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { signR2Url, stripR2Signature, extractR2ObjectKey } from './r2-sign';

const WORKER_URL = 'https://assets.example.com';
const SECRET = 'test-signing-secret';

/**
 * End-to-end contract check between the Next.js signer and the worker
 * verifier: a URL produced here must satisfy the verification the worker
 * performs (see worker/src/handler.ts and worker/test/index.spec.ts).
 */
async function verifyLikeWorker(url: string, secret: string): Promise<boolean> {
  const parsed = new URL(url);
  const key = decodeURIComponent(parsed.pathname.slice(1));
  const exp = parsed.searchParams.get('exp');
  const sig = parsed.searchParams.get('sig');
  if (!exp || !sig) return false;
  if (Number(exp) * 1000 <= Date.now()) return false;

  const { createHmac } = await import('node:crypto');
  const expected = createHmac('sha256', secret)
    .update(`${key}\n${exp}`)
    .digest('hex');

  return expected === sig.toLowerCase();
}

describe('authorized rendering contract', () => {
  beforeEach(() => {
    vi.stubEnv('R2_WORKER_URL', WORKER_URL);
    vi.stubEnv('R2_SIGNING_SECRET', SECRET);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('a signature produced by the app is accepted by the worker verifier', async () => {
    const stored = `${WORKER_URL}/projects/p1/work-reports/w1/signatures/technician-1.webp`;

    const signed = await signR2Url(stored);

    expect(await verifyLikeWorker(signed, SECRET)).toBe(true);
  });

  it('the signed URL points at the same object as the stored URL', async () => {
    const stored = `${WORKER_URL}/projects/p1/work-reports/w1/photos/before.jpg`;

    const signed = await signR2Url(stored);

    expect(extractR2ObjectKey(signed)).toBe(extractR2ObjectKey(stored));
    expect(new URL(signed).pathname).toBe(new URL(stored).pathname);
  });

  it('signs keys that need percent-encoding exactly as the worker decodes them', async () => {
    const stored = `${WORKER_URL}/projects/p1/100%25done%20report.jpg`;

    const signed = await signR2Url(stored);

    // The worker decodes the raw pathname; the signature must cover that form.
    expect(await verifyLikeWorker(signed, SECRET)).toBe(true);
  });

  it('a signature is rejected by the worker verifier after expiry', async () => {
    const stored = `${WORKER_URL}/projects/p1/avatars/a.jpg`;

    const signed = await signR2Url(stored, {
      now: Date.now() - 11 * 60 * 1000,
    });

    expect(await verifyLikeWorker(signed, SECRET)).toBe(false);
  });

  it('a signature is rejected by the worker verifier under another secret', async () => {
    const signed = await signR2Url(`${WORKER_URL}/a.jpg`);

    expect(await verifyLikeWorker(signed, 'a-different-secret')).toBe(false);
  });

  it('round-trips signed URLs back to their canonical stored form', async () => {
    const stored = `${WORKER_URL}/attendance/u1/2026-01-15/clock-in_1_photo.jpg`;

    const signed = await signR2Url(stored);

    expect(stripR2Signature(signed)).toBe(stored);
  });

  it('leaves a summary-report PDF URL untouched', async () => {
    const pdf = 'https://cdn.example.org/reports/january.pdf';
    expect(await signR2Url(pdf)).toBe(pdf);
  });
});
