import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import type { PageLoad } from './$types';

export const ssr = true;

export const load: PageLoad = async () => {
	const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);
	const [questions, parties, partyProfiles] = await Promise.all([
		client.query(api.questions.list, {}),
		client.query(api.parties.list, {}),
		client.query(api.partyProfiles.list, {})
	]);

	return {
		questions,
		parties,
		partyProfiles
	};
};
