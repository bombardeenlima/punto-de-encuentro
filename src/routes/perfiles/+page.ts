import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import { env } from '$env/dynamic/public';
import type { PageLoad } from './$types';

export const ssr = true;

export const load: PageLoad = async () => {
	const convexUrl = env.PUBLIC_CONVEX_URL;
	if (!convexUrl) {
		throw new Error('Missing required public env var: PUBLIC_CONVEX_URL');
	}

	const client = new ConvexHttpClient(convexUrl);
	const profiles = await client.query(api.partyProfiles.list, {});

	return {
		profiles
	};
};
