import { WorkerEntrypoint } from 'cloudflare:workers';
import { handleRequest, type THandlerEnv } from './handler';

export default class extends WorkerEntrypoint<Env> {
	async fetch(request: Request) {
		return handleRequest(request, this.env as unknown as THandlerEnv);
	}
}
