import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import { env } from '$env/dynamic/public';
import type { PageLoad } from './$types';

export const ssr = true;

type TopicGroup = {
	tema: string;
	parties: Array<{
		partido: string;
		displayName: string;
		postura: string | null;
	}>;
};

export const load: PageLoad = async () => {
	const convexUrl = env.PUBLIC_CONVEX_URL;
	if (!convexUrl) {
		throw new Error('Missing required public env var: PUBLIC_CONVEX_URL');
	}

	const client = new ConvexHttpClient(convexUrl);

	const [positions, profiles] = await Promise.all([
		client.query(api.partyPositions.list, {}),
		client.query(api.partyProfiles.list, {})
	]);

	const profilesByPartido = new Map(
		profiles.map((profile) => [profile.partido, profile.nombre] as const)
	);

	const groupedByTema = positions.reduce<Map<string, TopicGroup>>((acc, item) => {
		const key = item.tema;
		if (!acc.has(key)) {
			acc.set(key, {
				tema: key,
				parties: []
			});
		}

		const group = acc.get(key)!;
		group.parties.push({
			partido: item.partido,
			displayName: profilesByPartido.get(item.partido) ?? item.partido,
			postura: item.postura ?? null
		});

		return acc;
	}, new Map());

	const topics: TopicGroup[] = Array.from(groupedByTema.values()).map((group) => ({
		...group,
		parties: group.parties.sort((a, b) =>
			a.displayName.localeCompare(b.displayName, 'es', { sensitivity: 'base' })
		)
	}));

	topics.sort((a, b) => a.tema.localeCompare(b.tema, 'es', { sensitivity: 'base' }));

	return {
		topics
	};
};
