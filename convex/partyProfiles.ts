import { query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

export type PartyProfile = Doc<"party_profiles">;
export type PartyProfileWithLogo = PartyProfile & { logoUrl: string | null };

const attachLogoUrl = async (
	ctx: QueryCtx,
	profile: PartyProfile,
): Promise<PartyProfileWithLogo> => ({
	...profile,
	logoUrl: profile.logo ? await ctx.storage.getUrl(profile.logo) : null,
});

const sortProfiles = (items: PartyProfile[]) =>
	[...items].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

export const list = query({
	args: {},
	handler: async (ctx) => {
		const rows = await ctx.db.query("party_profiles").collect();
		const sorted = sortProfiles(rows);
		return Promise.all(sorted.map((profile) => attachLogoUrl(ctx, profile)));
	},
});

export const getByPartido = query({
	args: {
		partido: v.string(),
	},
	handler: async (ctx, { partido }) => {
		const result = await ctx
			.db
			.query("party_profiles")
			.withIndex("by_partido", (q) => q.eq("partido", partido))
			.unique();

		if (!result) return null;
		return attachLogoUrl(ctx, result);
	},
});
