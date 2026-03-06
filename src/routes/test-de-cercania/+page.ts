import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import { env } from '$env/dynamic/public';
import type { PageLoad } from './$types';
import localQuestions from '$lib/data/questions.json';

export const ssr = true;

const shuffleQuestions = <T>(items: readonly T[]) => {
	const shuffled = [...items];
	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
	}
	return shuffled;
};

export const load: PageLoad = async () => {
	const convexUrl = env.PUBLIC_CONVEX_URL;
	if (!convexUrl) {
		throw new Error('Missing required public env var: PUBLIC_CONVEX_URL');
	}

	const client = new ConvexHttpClient(convexUrl);
	const parties = await client.query(api.parties.list, {});

	return {
		questions: shuffleQuestions(localQuestions),
		parties
	};
};
