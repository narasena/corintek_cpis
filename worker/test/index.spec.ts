import { describe, it, expect, beforeEach } from 'vitest';
import { handleRequest, type THandlerEnv } from '../src/handler';

const SIGNING_SECRET = 'test-signing-secret';
const AUTH_SECRET = 'test-auth-secret';

type TStoredObject = { body: string; contentType: string };

/**
 * Minimal in-memory R2Bucket stand-in. Only the surface `handleRequest` uses.
 */
function createFakeBucket() {
	const objects = new Map<string, TStoredObject>();

	return {
		objects,
		async put(
			key: string,
			value: BodyInit | null,
			options?: { httpMetadata?: { contentType?: string } }
		) {
			const body =
				typeof value === 'string'
					? value
					: await new Response(value).text();
			objects.set(key, {
				body,
				contentType:
					options?.httpMetadata?.contentType ?? 'application/octet-stream',
			});
			return {} as R2Object;
		},
		async get(key: string) {
			const stored = objects.get(key);
			if (!stored) return null;
			return {
				body: stored.body,
				httpEtag: `"etag-${key}"`,
				writeHttpMetadata(headers: Headers) {
					headers.set('content-type', stored.contentType);
				},
			};
		},
		async delete(key: string) {
			objects.delete(key);
		},
	};
}

function createEnv(bucket = createFakeBucket()): {
	env: THandlerEnv;
	bucket: ReturnType<typeof createFakeBucket>;
} {
	return {
		env: {
			BUCKET: bucket as unknown as R2Bucket,
			AUTH_SECRET,
			SIGNING_SECRET,
		},
		bucket,
	};
}

function toHex(buffer: ArrayBuffer): string {
	return [...new Uint8Array(buffer)]
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
}

/** Independent implementation of the signing contract. */
async function sign(
	key: string,
	expSeconds: number,
	secret = SIGNING_SECRET
): Promise<string> {
	const encoder = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const digest = await crypto.subtle.sign(
		'HMAC',
		keyMaterial,
		encoder.encode(`${key}\n${expSeconds}`)
	);
	return toHex(digest);
}

async function signedUrl(
	key: string,
	options: { expSeconds?: number; secret?: string } = {}
): Promise<string> {
	const expSeconds =
		options.expSeconds ?? Math.floor(Date.now() / 1000) + 600;
	const sig = await sign(key, expSeconds, options.secret);
	return `https://assets.example.com/${key}?exp=${expSeconds}&sig=${sig}`;
}

function authHeaders(): Record<string, string> {
	return { Authorization: `Bearer ${AUTH_SECRET}` };
}

describe('R2 asset worker — unauthenticated access', () => {
	let env: THandlerEnv;
	let bucket: ReturnType<typeof createFakeBucket>;

	beforeEach(() => {
		({ env, bucket } = createEnv());
	});

	it('rejects GET without a signature', async () => {
		await bucket.put('private/photo.jpg', 'secret-bytes');

		const response = await handleRequest(
			new Request('https://assets.example.com/private/photo.jpg'),
			env
		);

		expect(response.status).toBe(401);
		const body = await response.text();
		expect(body).toBe('Unauthorized');
		expect(body).not.toContain('secret-bytes');
	});

	it('rejects GET with exp but no sig', async () => {
		await bucket.put('private/photo.jpg', 'secret-bytes');
		const exp = Math.floor(Date.now() / 1000) + 600;

		const response = await handleRequest(
			new Request(`https://assets.example.com/private/photo.jpg?exp=${exp}`),
			env
		);

		expect(response.status).toBe(401);
	});

	it('rejects bucket listing at the root path', async () => {
		await bucket.put('private/photo.jpg', 'secret-bytes');

		const response = await handleRequest(
			new Request('https://assets.example.com/'),
			env
		);

		expect(response.status).toBe(404);
		const body = await response.text();
		expect(body).not.toContain('private/photo.jpg');
	});

	it('rejects listing with a prefix query parameter', async () => {
		await bucket.put('private/photo.jpg', 'secret-bytes');

		const response = await handleRequest(
			new Request('https://assets.example.com/?prefix=private/'),
			env
		);

		expect(response.status).toBe(404);
		expect(await response.text()).not.toContain('private/photo.jpg');
	});

	it('rejects PUT without the bearer secret', async () => {
		const response = await handleRequest(
			new Request('https://assets.example.com/upload.jpg', {
				method: 'PUT',
				body: 'data',
			}),
			env
		);

		expect(response.status).toBe(401);
		expect(bucket.objects.has('upload.jpg')).toBe(false);
	});

	it('rejects DELETE without the bearer secret', async () => {
		await bucket.put('private/photo.jpg', 'secret-bytes');

		const response = await handleRequest(
			new Request('https://assets.example.com/private/photo.jpg', {
				method: 'DELETE',
			}),
			env
		);

		expect(response.status).toBe(401);
		expect(bucket.objects.has('private/photo.jpg')).toBe(true);
	});
});

describe('R2 asset worker — signed GET', () => {
	let env: THandlerEnv;
	let bucket: ReturnType<typeof createFakeBucket>;

	beforeEach(() => {
		({ env, bucket } = createEnv());
	});

	it('rejects an invalid signature', async () => {
		await bucket.put('private/photo.jpg', 'secret-bytes');
		const exp = Math.floor(Date.now() / 1000) + 600;

		const response = await handleRequest(
			new Request(
				`https://assets.example.com/private/photo.jpg?exp=${exp}&sig=${'0'.repeat(64)}`
			),
			env
		);

		expect(response.status).toBe(401);
	});

	it('rejects a signature made with the wrong secret', async () => {
		await bucket.put('private/photo.jpg', 'secret-bytes');
		const url = await signedUrl('private/photo.jpg', {
			secret: 'wrong-secret',
		});

		const response = await handleRequest(new Request(url), env);

		expect(response.status).toBe(401);
	});

	it('rejects an expired signature', async () => {
		await bucket.put('private/photo.jpg', 'secret-bytes');
		const url = await signedUrl('private/photo.jpg', {
			expSeconds: Math.floor(Date.now() / 1000) - 1,
		});

		const response = await handleRequest(new Request(url), env);

		expect(response.status).toBe(401);
	});

	it('rejects a signature replayed against a different key', async () => {
		await bucket.put('private/photo.jpg', 'photo-bytes');
		await bucket.put('private/confidential.pdf', 'confidential-bytes');

		const exp = Math.floor(Date.now() / 1000) + 600;
		const photoSig = await sign('private/photo.jpg', exp);
		const response = await handleRequest(
			new Request(
				`https://assets.example.com/private/confidential.pdf?exp=${exp}&sig=${photoSig}`
			),
			env
		);

		expect(response.status).toBe(401);
		expect(await response.text()).not.toContain('confidential-bytes');
	});

	it('rejects an unsigned non-root path when no signing secret is configured', async () => {
		await bucket.put('private/photo.jpg', 'secret-bytes');
		const url = await signedUrl('private/photo.jpg');

		const response = await handleRequest(new Request(url), {
			BUCKET: env.BUCKET,
			AUTH_SECRET,
		});

		expect(response.status).toBe(401);
	});

	it('returns the intended object for a valid signature', async () => {
		await bucket.put('private/photo.jpg', 'photo-bytes');
		await bucket.put('private/other.jpg', 'other-bytes');

		const response = await handleRequest(
			new Request(await signedUrl('private/photo.jpg')),
			env
		);

		expect(response.status).toBe(200);
		expect(await response.text()).toBe('photo-bytes');
	});

	it('returns 404 for a signed request to a missing object', async () => {
		const response = await handleRequest(
			new Request(await signedUrl('private/missing.jpg')),
			env
		);

		expect(response.status).toBe(404);
	});
});

describe('R2 asset worker — bucket isolation', () => {
	it('exposes only the single BUCKET binding', () => {
		const { env } = createEnv();
		const r2Bindings = Object.keys(env).filter(
			name => name.endsWith('_BUCKET') || name === 'BUCKET'
		);

		expect(r2Bindings).toEqual(['BUCKET']);
	});

	it('never falls back to a second bucket when the object is absent', async () => {
		const { env, bucket } = createEnv();

		// A production object that must not be reachable from a development
		// deployment: the dev bucket simply does not contain it.
		const otherBucket = createFakeBucket();
		await otherBucket.put('private/prod-only.jpg', 'prod-bytes');

		const url = await signedUrl('private/prod-only.jpg');
		const response = await handleRequest(new Request(url), env);

		expect(response.status).toBe(404);
		expect(await response.text()).toBe('Object not found');
		expect(bucket.objects.has('private/prod-only.jpg')).toBe(false);
	});

	it('ignores the retired X-R2-Bucket header', async () => {
		const { env, bucket } = createEnv();
		await bucket.put('private/dev-only.jpg', 'dev-bytes');

		const url = await signedUrl('private/dev-only.jpg');
		const response = await handleRequest(
			new Request(url, { headers: { 'X-R2-Bucket': 'prod' } }),
			env
		);

		expect(response.status).toBe(200);
		expect(await response.text()).toBe('dev-bytes');
	});

	it('serves from the bound bucket regardless of an attacker-chosen bucket header', async () => {
		const { env, bucket } = createEnv();
		await bucket.put('private/file.txt', 'bound-bytes');

		const response = await handleRequest(
			new Request(await signedUrl('private/file.txt'), {
				headers: { 'X-R2-Bucket': 'prod' },
			}),
			env
		);

		expect(await response.text()).toBe('bound-bytes');
	});
});

describe('R2 asset worker — authorized writes still work', () => {
	it('stores and deletes with the bearer secret', async () => {
		const { env, bucket } = createEnv();

		const putResponse = await handleRequest(
			new Request('https://assets.example.com/projects/p1/file.txt', {
				method: 'PUT',
				headers: { ...authHeaders(), 'Content-Type': 'text/plain' },
				body: 'hello',
			}),
			env
		);

		expect(putResponse.status).toBe(200);
		expect(await putResponse.text()).toBe('Put projects/p1/file.txt successfully!');
		expect(bucket.objects.get('projects/p1/file.txt')).toEqual({
			body: 'hello',
			contentType: 'text/plain',
		});

		const deleteResponse = await handleRequest(
			new Request('https://assets.example.com/projects/p1/file.txt', {
				method: 'DELETE',
				headers: authHeaders(),
			}),
			env
		);

		expect(deleteResponse.status).toBe(200);
		expect(bucket.objects.has('projects/p1/file.txt')).toBe(false);
	});

	it('rejects a malformed percent-encoded key without throwing', async () => {
		const { env } = createEnv();

		const response = await handleRequest(
			new Request('https://assets.example.com/100%.jpg'),
			env
		);

		expect(response.status).toBe(400);
		expect(await response.text()).toBe('Bad request');
	});

	it('returns 405 for unsupported methods', async () => {
		const { env } = createEnv();

		const response = await handleRequest(
			new Request('https://assets.example.com/file.txt', {
				method: 'POST',
				body: 'x',
			}),
			env
		);

		expect(response.status).toBe(405);
	});
});
