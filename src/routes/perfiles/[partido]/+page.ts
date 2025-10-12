import { error } from "@sveltejs/kit";
import { ConvexHttpClient } from "convex/browser";
import { api } from "$convex/_generated/api";
import { PUBLIC_CONVEX_URL } from "$env/static/public";
import type { PageLoad } from "./$types";

export const ssr = true;

export const load: PageLoad = async ({ params }) => {
	const partido = decodeURIComponent(params.partido);

	const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);
	const profile = await client.query(api.partyProfiles.getByPartido, { partido });

	if (!profile) {
		throw error(404, "No encontramos el perfil solicitado.");
	}

	return {
		profile,
	};
};
