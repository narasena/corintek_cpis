declare module 'cloudflare:test' {
	interface ProvidedEnv extends Env {}
	export const env: ProvidedEnv;
	export const SELF: Fetcher;
}
