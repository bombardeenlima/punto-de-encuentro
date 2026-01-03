import { query } from './_generated/server';
import type { Doc } from './_generated/dataModel';

export type Party = Doc<'partidos'>;

export const list = query({
	args: {},
	handler: async (ctx) => {
		const rows = await ctx.db.query('partidos').collect();
		return rows.sort((a, b) => a.partido.localeCompare(b.partido, 'es'));
	}
});
