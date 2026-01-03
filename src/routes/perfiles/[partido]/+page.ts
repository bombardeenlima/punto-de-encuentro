import { error } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import { env } from '$env/dynamic/public';
import type { PageLoad } from './$types';

export const ssr = true;

export const load: PageLoad = async ({ params }) => {
	const partido = decodeURIComponent(params.partido);
	const convexUrl = env.PUBLIC_CONVEX_URL;
	if (!convexUrl) {
		throw error(500, 'Falta configurar la variable PUBLIC_CONVEX_URL.');
	}

	const client = new ConvexHttpClient(convexUrl);
	const [profile, parties] = await Promise.all([
		client.query(api.partyProfiles.getByPartido, { partido }),
		client.query(api.parties.list, {})
	]);

	if (!profile) {
		throw error(404, 'No encontramos el perfil solicitado.');
	}

	const normaliseKey = (value: string) =>
		value
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '')
			.trim()
			.toLowerCase();

	const profileKeys = new Set<string>();
	profileKeys.add(normaliseKey(profile.nombre));
	profileKeys.add(normaliseKey(profile.partido));
	profileKeys.add(normaliseKey(partido));

	const matchingParty = parties.find((item) => {
		const partyKey = normaliseKey(item.partido);
		return profileKeys.has(partyKey);
	});

	const coordinates = (() => {
		if (!matchingParty) return null;
		const [coordX, coordY] = matchingParty.coordenadas ?? [];
		if (typeof coordX !== 'number' || typeof coordY !== 'number') return null;
		return { x: coordX, y: coordY } as const;
	})();

	return {
		profile,
		coordinates,
		parties
	};
};
