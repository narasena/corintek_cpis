import { describe, it, expect, beforeEach } from 'vitest';
import { env, SELF } from 'cloudflare:test';

describe('R2 Asset Worker', () => {
    beforeEach(async () => {
		const listed = await env.MY_BUCKET.list();
		const keys = listed.objects.map((obj: R2Object) => obj.key);
		if (keys.length > 0) {
			await env.MY_BUCKET.delete(keys);
		}
    });

	it('should upload a file on PUT request', async () => {
		const key = 'put-test.txt';
		const value = 'Hello R2!';

		const response = await SELF.fetch(`https://example.com/${key}`, {
			method: 'PUT',
			body: value,
		});

		expect(await response.text()).toBe(`Put ${key} successfully!`);

		const object = await env.MY_BUCKET.get(key);
		expect(object).not.toBeNull();
		expect(await object?.text()).toBe(value);
	});

	it('should retrieve a file on GET request', async () => {
		const key = 'get-test.txt';
		const value = 'Hello R2 for GET!';

		await env.MY_BUCKET.put(key, value);

		const response = await SELF.fetch(`https://example.com/${key}`);
		expect(await response.text()).toBe(value);
		expect(response.status).toBe(200);
	});

	it('should return 404 for a non-existent file on GET request', async () => {
		const response = await SELF.fetch('https://example.com/this-key-does-not-exist.txt');
		expect(response.status).toBe(404);
		expect(await response.text()).toBe('Object not found');
	});

	it('should delete a file on DELETE request', async () => {
		const key = 'delete-test.txt';
		const value = 'Hello R2 for DELETE!';

		await env.MY_BUCKET.put(key, value);

		const response = await SELF.fetch(`https://example.com/${key}`, {
			method: 'DELETE',
		});

		expect(await response.text()).toBe(`Deleted ${key}!`);
		expect(response.status).toBe(200);
	});

    it('should return 405 for a non-allowed method', async () => {
		const response = await SELF.fetch('https://example.com/post-test.txt', {
            method: 'POST',
            body: 'test'
        });
		expect(response.status).toBe(405);
        expect(await response.text()).toBe('Method not allowed');
	});
});