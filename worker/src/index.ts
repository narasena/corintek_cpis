import { WorkerEntrypoint } from 'cloudflare:workers';

export default class extends WorkerEntrypoint<Env> {
	async fetch(request: Request) {
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		};

		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		try {
			const url = new URL(request.url);
			const key = url.pathname.slice(1);

			// Auth check for write operations
			if (request.method === 'PUT' || request.method === 'DELETE') {
				const authHeader = request.headers.get('Authorization');
				if (!authHeader || authHeader !== `Bearer ${this.env.AUTH_SECRET}`) {
					return new Response('Unauthorized', { status: 401, headers: corsHeaders });
				}
			}

			// Select bucket: dev (default) or prod, via X-R2-Bucket header.
			// Both buckets are bound so the single worker can serve all envs.
			// GET has no header (browser <img>), so reads fall back to the
			// other bucket to find the object wherever it lives.
			const isProd = request.headers.get('X-R2-Bucket') === 'prod';
			const bucket = isProd ? this.env.PROD_BUCKET! : this.env.DEV_BUCKET!;
			const otherBucket = isProd ? this.env.DEV_BUCKET! : this.env.PROD_BUCKET!;

			// List files with optional prefix
			if (request.method === 'GET' && key === '') {
				const url = new URL(request.url);
				const prefix = url.searchParams.get('prefix') || '';
				const objects = await bucket.list({ prefix });
				return new Response(JSON.stringify(objects), {
					headers: { 'Content-Type': 'application/json', ...corsHeaders },
				});
			}

			switch (request.method) {
				case 'PUT': {
					// Simple upload without image processing for now
					await bucket.put(key, request.body, {
						httpMetadata: { contentType: request.headers.get('content-type') || 'application/octet-stream' },
					});
					return new Response(`Put ${key} successfully!`, { headers: corsHeaders });
				}

				case 'GET': {
					const object = (await bucket.get(key)) ?? (await otherBucket.get(key));
					if (!object) {
						return new Response('Object not found', { status: 404, headers: corsHeaders });
					}

					const headers = new Headers(corsHeaders);
					object.writeHttpMetadata(headers);
					headers.set('etag', object.httpEtag);

					return new Response(object.body, { headers });
				}

				case 'DELETE': {
					await bucket.delete(key);
					return new Response(`Deleted ${key}!`, { headers: corsHeaders });
				}

				default: {
					return new Response('Method not allowed', {
						status: 405,
						headers: { Allow: 'GET, PUT, DELETE', ...corsHeaders },
					});
				}
			}
		} catch (error) {
			return new Response(`Error: ${error}`, { status: 500, headers: corsHeaders });
		}
	}
}
