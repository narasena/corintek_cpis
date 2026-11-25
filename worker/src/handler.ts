/**
 * R2 asset Worker request handler.
 *
 * Kept free of `cloudflare:workers` imports so it can be unit-tested in plain
 * Node with a fake bucket. `index.ts` wires it into the Worker entrypoint.
 *
 * Access model:
 * - Reads require an expiring HMAC-SHA256 signature issued by the Next.js
 *   server (`src/lib/r2-sign.ts`).
 * - Writes and deletes require the shared bearer secret.
 * - Exactly one bucket is bound per deployment; there is no fallback.
 */

export type THandlerEnv = {
	BUCKET: R2Bucket;
	AUTH_SECRET?: string;
	SIGNING_SECRET?: string;
};

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function textResponse(message: string, status: number): Response {
	return new Response(message, { status, headers: CORS_HEADERS });
}

function toHex(buffer: ArrayBuffer): string {
	return [...new Uint8Array(buffer)]
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
}

/** Constant-time string comparison. Length is public, content is not. */
function timingSafeEqual(a: string, b: string): boolean {
	const aBytes = new TextEncoder().encode(a);
	const bBytes = new TextEncoder().encode(b);
	let diff = aBytes.length ^ bBytes.length;
	const max = Math.max(aBytes.length, bBytes.length);
	for (let i = 0; i < max; i++) {
		diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
	}
	return diff === 0;
}

async function hmacHex(secret: string, message: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign(
		'HMAC',
		key,
		encoder.encode(message)
	);
	return toHex(signature);
}

/** Must match `buildSignaturePayload` in src/lib/r2-sign.ts. */
function buildSignaturePayload(key: string, exp: string): string {
	return `${key}\n${exp}`;
}

async function verifyReadSignature(
	env: THandlerEnv,
	key: string,
	exp: string | null,
	sig: string | null
): Promise<boolean> {
	if (!env.SIGNING_SECRET) return false;
	if (!exp || !sig) return false;

	const expSeconds = Number(exp);
	if (!Number.isInteger(expSeconds)) return false;
	if (expSeconds * 1000 <= Date.now()) return false;

	const expected = await hmacHex(
		env.SIGNING_SECRET,
		buildSignaturePayload(key, exp)
	);

	return timingSafeEqual(expected, sig.toLowerCase());
}

function hasValidWriteAuth(env: THandlerEnv, request: Request): boolean {
	if (!env.AUTH_SECRET) return false;
	const header = request.headers.get('Authorization');
	if (!header) return false;
	return timingSafeEqual(header, `Bearer ${env.AUTH_SECRET}`);
}

export async function handleRequest(
	request: Request,
	env: THandlerEnv
): Promise<Response> {
	if (request.method === 'OPTIONS') {
		return new Response(null, { headers: CORS_HEADERS });
	}

	try {
		const url = new URL(request.url);
		let key: string;
		try {
			key = decodeURIComponent(url.pathname.slice(1));
		} catch {
			// Malformed percent-encoding must not surface as an exception.
			return textResponse('Bad request', 400);
		}

		// No anonymous bucket listing: the root path is not an object.
		if (key === '') {
			return textResponse('Not found', 404);
		}

		switch (request.method) {
			case 'PUT': {
				if (!hasValidWriteAuth(env, request)) {
					return textResponse('Unauthorized', 401);
				}

				await env.BUCKET.put(key, request.body, {
					httpMetadata: {
						contentType:
							request.headers.get('content-type') ??
							'application/octet-stream',
					},
				});
				return new Response(`Put ${key} successfully!`, {
					headers: CORS_HEADERS,
				});
			}

			case 'GET': {
				const signed = await verifyReadSignature(
					env,
					key,
					url.searchParams.get('exp'),
					url.searchParams.get('sig')
				);
				if (!signed) {
					return textResponse('Unauthorized', 401);
				}

				// Single bound bucket only. Never fall back to another bucket.
				const object = await env.BUCKET.get(key);
				if (!object) {
					return textResponse('Object not found', 404);
				}

				const headers = new Headers(CORS_HEADERS);
				object.writeHttpMetadata(headers);
				headers.set('etag', object.httpEtag);
				// Signed URLs are short-lived and per-object; caching must not
				// outlive the signature.
				headers.set('Cache-Control', 'private, max-age=600');

				return new Response(object.body, { headers });
			}

			case 'DELETE': {
				if (!hasValidWriteAuth(env, request)) {
					return textResponse('Unauthorized', 401);
				}

				await env.BUCKET.delete(key);
				return new Response(`Deleted ${key}!`, { headers: CORS_HEADERS });
			}

			default:
				return new Response('Method not allowed', {
					status: 405,
					headers: { Allow: 'GET, PUT, DELETE', ...CORS_HEADERS },
				});
		}
	} catch (error) {
		// Do not echo internals back to the caller.
		console.error('[R2-WORKER] request failed', {
			method: request.method,
			error,
		});
		return textResponse('Internal error', 500);
	}
}
