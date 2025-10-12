import { query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

export type PartyPosition = Doc<"party_positions">;

const sortByTema = (items: PartyPosition[]) =>
	[...items].sort((a, b) => a.tema.localeCompare(b.tema, "es"));

export const list = query({
	args: {},
	handler: async (ctx) => {
		const rows = await ctx.db.query("party_positions").collect();
		return sortByTema(rows);
	},
});
