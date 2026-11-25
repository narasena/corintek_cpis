import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Guards the deployment boundary: each Worker config may bind exactly one
 * bucket, and the two environments must never share that bucket.
 */

const root = resolve(__dirname, '..');

type TWranglerConfig = {
	name: string;
	r2_buckets?: Array<{
		binding: string;
		bucket_name: string;
		preview_bucket_name?: string;
	}>;
};

/** Strip block/line comments and trailing commas so JSONC parses. */
function loadJsonc(file: string): TWranglerConfig {
	const raw = readFileSync(resolve(root, file), 'utf8')
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/^\s*\/\/.*$/gm, '')
		.replace(/,(\s*[}\]])/g, '$1');
	return JSON.parse(raw) as TWranglerConfig;
}

const production = () => loadJsonc('wrangler.production.jsonc');
const development = () => loadJsonc('wrangler.development.jsonc');

describe('worker deployment isolation', () => {
	it('does not keep a config that binds both buckets to one worker', () => {
		expect(existsSync(resolve(root, 'wrangler.jsonc'))).toBe(false);
	});

	it('publishes independent worker names for each environment', () => {
		expect(production().name).not.toBe(development().name);
	});

	it('binds exactly one bucket in production', () => {
		expect(production().r2_buckets).toHaveLength(1);
	});

	it('binds exactly one bucket in development', () => {
		expect(development().r2_buckets).toHaveLength(1);
	});

	it('binds the production bucket only in the production worker', () => {
		expect(production().r2_buckets![0].bucket_name).toBe(
			'corintek-cpis-prod-assets'
		);
	});

	it('binds the development bucket only in the development worker', () => {
		expect(development().r2_buckets![0].bucket_name).toBe(
			'corintek-cpis-dev-assets'
		);
	});

	it('never binds production storage in the development worker', () => {
		const devBuckets = development().r2_buckets!.flatMap(b =>
			[b.bucket_name, b.preview_bucket_name].filter(Boolean)
		);
		expect(devBuckets).not.toContain('corintek-cpis-prod-assets');
	});

	it('never binds development storage in the production worker', () => {
		const prodBuckets = production().r2_buckets!.flatMap(b =>
			[b.bucket_name, b.preview_bucket_name].filter(Boolean)
		);
		expect(prodBuckets).not.toContain('corintek-cpis-dev-assets');
		expect(prodBuckets).not.toContain('corintek-cpis-preview-assets');
	});

	it('uses the same binding name in both deployments', () => {
		expect(production().r2_buckets![0].binding).toBe('BUCKET');
		expect(development().r2_buckets![0].binding).toBe('BUCKET');
	});

	it('does not leave the retired DEV_BUCKET or PROD_BUCKET bindings', () => {
		for (const config of [production(), development()]) {
			const bindings = config.r2_buckets!.map(b => b.binding);
			expect(bindings).not.toContain('DEV_BUCKET');
			expect(bindings).not.toContain('PROD_BUCKET');
		}
	});

	it('does not use a shared preview bucket with production storage', () => {
		const preview = development().r2_buckets![0].preview_bucket_name;
		expect(preview).toBe('corintek-cpis-preview-assets');
	});
});
