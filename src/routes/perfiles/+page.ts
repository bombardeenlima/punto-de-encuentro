import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import type { PageLoad } from './$types';

export const ssr = true;

export const load: PageLoad = async () => {
	const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);
	const profiles = await client.query(api.partyProfiles.list, {});

	return {
		profiles
	};
};
