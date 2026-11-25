import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  buildR2SignaturePayload,
  extractR2ObjectKey,
  signR2Url,
  signR2UrlOrNull,
  stripR2Signature,
  R2_URL_TTL_SECONDS,
} from './r2-sign';

const WORKER_URL = 'https://assets.example.com';
const SECRET = 'test-signing-secret';

describe('extractR2ObjectKey', () => {
  beforeEach(() => {
    vi.stubEnv('R2_WORKER_URL', WORKER_URL);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('extracts a nested key from a worker URL', () => {
    expect(
      extractR2ObjectKey(`${WORKER_URL}/projects/p1/work-reports/w1/photo.jpg`)
    ).toBe('projects/p1/work-reports/w1/photo.jpg');
  });

  it('returns null for URLs on another host', () => {
    expect(extractR2ObjectKey('https://other.example.com/a.jpg')).toBeNull();
  });

  it('returns null for data and blob URLs', () => {
    expect(extractR2ObjectKey('data:image/png;base64,abc')).toBeNull();
    expect(extractR2ObjectKey('blob:http://localhost/abc')).toBeNull();
  });

  it('returns null when the worker URL is not configured', () => {
    vi.stubEnv('R2_WORKER_URL', '');
    expect(extractR2ObjectKey(`${WORKER_URL}/a.jpg`)).toBeNull();
  });

  it('tolerates a trailing slash on the configured worker URL', () => {
    vi.stubEnv('R2_WORKER_URL', `${WORKER_URL}/`);
    expect(extractR2ObjectKey(`${WORKER_URL}/a.jpg`)).toBe('a.jpg');
  });

  it('drops an existing query string so re-signing does not compound', () => {
    expect(extractR2ObjectKey(`${WORKER_URL}/a.jpg?exp=1&sig=deadbeef`)).toBe(
      'a.jpg'
    );
  });

  it('decodes percent-encoded keys', () => {
    expect(extractR2ObjectKey(`${WORKER_URL}/a%20b.jpg`)).toBe('a b.jpg');
  });

  it('rejects a lookalike host that merely prefixes the worker URL', () => {
    expect(
      extractR2ObjectKey(`https://assets.example.com.evil.test/a.jpg`)
    ).toBeNull();
  });
});

describe('signR2Url', () => {
  beforeEach(() => {
    vi.stubEnv('R2_WORKER_URL', WORKER_URL);
    vi.stubEnv('R2_SIGNING_SECRET', SECRET);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('appends exp and sig to a worker URL', async () => {
    const signed = await signR2Url(`${WORKER_URL}/a.jpg`, {
      now: 1_700_000_000_000,
    });
    const url = new URL(signed);

    expect(url.origin).toBe(WORKER_URL);
    expect(url.pathname).toBe('/a.jpg');
    expect(url.searchParams.get('exp')).toBe(
      String(1_700_000_000 + R2_URL_TTL_SECONDS)
    );
    expect(url.searchParams.get('sig')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('uses a 10 minute expiry by default', async () => {
    const now = 1_700_000_000_000;
    const signed = await signR2Url(`${WORKER_URL}/a.jpg`, { now });
    const exp = Number(new URL(signed).searchParams.get('exp'));

    expect(exp - Math.floor(now / 1000)).toBe(600);
  });

  it('leaves non-worker URLs untouched', async () => {
    const external = 'https://example.org/report.pdf';
    expect(await signR2Url(external)).toBe(external);

    const dataUrl = 'data:image/png;base64,abc';
    expect(await signR2Url(dataUrl)).toBe(dataUrl);
  });

  it('produces different signatures for different keys', async () => {
    const now = 1_700_000_000_000;
    const a = await signR2Url(`${WORKER_URL}/a.jpg`, { now });
    const b = await signR2Url(`${WORKER_URL}/b.jpg`, { now });

    expect(new URL(a).searchParams.get('sig')).not.toBe(
      new URL(b).searchParams.get('sig')
    );
  });

  it('produces different signatures for different expiries', async () => {
    const a = await signR2Url(`${WORKER_URL}/a.jpg`, {
      now: 1_700_000_000_000,
    });
    const b = await signR2Url(`${WORKER_URL}/a.jpg`, {
      now: 1_700_000_001_000,
    });

    expect(new URL(a).searchParams.get('sig')).not.toBe(
      new URL(b).searchParams.get('sig')
    );
  });

  it('returns the URL unsigned when the signing secret is missing', async () => {
    vi.stubEnv('R2_SIGNING_SECRET', '');
    const stored = `${WORKER_URL}/a.jpg`;

    // Fails closed at the Worker with 401 rather than breaking the page.
    await expect(signR2Url(stored)).resolves.toBe(stored);
  });

  it('matches the payload contract shared with the worker', async () => {
    const { createHmac } = await import('node:crypto');
    const key = 'projects/p1/a.jpg';
    const exp = '1700000600';
    const expected = createHmac('sha256', SECRET)
      .update(buildR2SignaturePayload(key, exp))
      .digest('hex');

    const signed = await signR2Url(`${WORKER_URL}/${key}`, {
      now: (Number(exp) - 600) * 1000,
    });

    expect(new URL(signed).searchParams.get('sig')).toBe(expected);
  });
});

describe('signR2UrlOrNull', () => {
  beforeEach(() => {
    vi.stubEnv('R2_WORKER_URL', WORKER_URL);
    vi.stubEnv('R2_SIGNING_SECRET', SECRET);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('passes null and undefined through', async () => {
    expect(await signR2UrlOrNull(null)).toBeNull();
    expect(await signR2UrlOrNull(undefined)).toBeNull();
  });

  it('signs a worker URL', async () => {
    const signed = await signR2UrlOrNull(`${WORKER_URL}/a.jpg`);
    expect(signed).toContain('sig=');
  });
});

describe('stripR2Signature', () => {
  beforeEach(() => {
    vi.stubEnv('R2_WORKER_URL', WORKER_URL);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('removes the signature from a signed worker URL', () => {
    expect(stripR2Signature(`${WORKER_URL}/a.jpg?exp=1&sig=abc`)).toBe(
      `${WORKER_URL}/a.jpg`
    );
  });

  it('leaves an unsigned worker URL unchanged', () => {
    expect(stripR2Signature(`${WORKER_URL}/a.jpg`)).toBe(`${WORKER_URL}/a.jpg`);
  });

  it('leaves external URLs unchanged', () => {
    const external = 'https://example.org/a.pdf?token=keep-me';
    expect(stripR2Signature(external)).toBe(external);
  });

  it('passes null and undefined through', () => {
    expect(stripR2Signature(null)).toBeNull();
    expect(stripR2Signature(undefined)).toBeUndefined();
  });
});
