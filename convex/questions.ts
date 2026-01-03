import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import type { Doc } from './_generated/dataModel';

type Affirmation = Doc<'afirmaciones'>;

const VALID_TEST_TYPES = new Set<number>([1, 2]);

const sortAffirmations = (items: Affirmation[]) =>
	[...items].sort((a, b) => {
		if (a.n !== b.n) return a.n - b.n;
		const criterioCompare = a.criterio.localeCompare(b.criterio);
		if (criterioCompare !== 0) return criterioCompare;
		return a.pregunta.localeCompare(b.pregunta);
	});

export const list = query({
	args: {
		testType: v.optional(v.number()),
		eje: v.optional(v.string()),
		criterio: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { testType, eje, criterio } = args;

		if (testType != null && !VALID_TEST_TYPES.has(testType)) {
			throw new Error(`Tipo de test no soportado: ${testType}`);
		}

		const rows: Affirmation[] = await (async () => {
			if (criterio) {
				return ctx.db
					.query('afirmaciones')
					.withIndex('by_criterio', (range) => range.eq('criterio', criterio))
					.collect();
			}
			if (eje) {
				return ctx.db
					.query('afirmaciones')
					.withIndex('by_eje', (range) => range.eq('eje', eje))
					.collect();
			}
			if (testType != null) {
				return ctx.db
					.query('afirmaciones')
					.withIndex('by_n', (range) => range.eq('n', testType))
					.collect();
			}
			return ctx.db.query('afirmaciones').collect();
		})();

		// Aplica filtros residuales cuando no hay un índice específico.
		const filtered = rows.filter((row) => {
			if (testType != null && row.n !== testType) return false;
			if (eje && row.eje !== eje) return false;
			if (criterio && row.criterio !== criterio) return false;
			return true;
		});

		return sortAffirmations(filtered);
	}
});

export const get = query({
	args: { id: v.id('afirmaciones') },
	handler: async (ctx, args) => {
		const doc = await ctx.db.get(args.id);
		if (!doc) {
			throw new Error('La afirmación solicitada no existe');
		}
		return doc;
	}
});

export const create = mutation({
	args: {
		n: v.number(),
		eje: v.string(),
		criterio: v.string(),
		pregunta: v.string()
	},
	handler: async (ctx, args) => {
		if (!VALID_TEST_TYPES.has(args.n)) {
			throw new Error(`Tipo de test no soportado: ${args.n}`);
		}

		return ctx.db.insert('afirmaciones', {
			n: args.n,
			eje: args.eje,
			criterio: args.criterio,
			pregunta: args.pregunta
		});
	}
});

export const update = mutation({
	args: {
		id: v.id('afirmaciones'),
		n: v.optional(v.number()),
		eje: v.optional(v.string()),
		criterio: v.optional(v.string()),
		pregunta: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { id, n, eje, criterio, pregunta } = args;
		const existing = await ctx.db.get(id);
		if (!existing) {
			throw new Error('La afirmación solicitada no existe');
		}

		if (n != null && !VALID_TEST_TYPES.has(n)) {
			throw new Error(`Tipo de test no soportado: ${n}`);
		}

		const updates: Partial<Affirmation> = {};
		if (n != null && n !== existing.n) {
			updates.n = n;
		}
		if (eje != null && eje !== existing.eje) {
			updates.eje = eje;
		}
		if (criterio != null && criterio !== existing.criterio) {
			updates.criterio = criterio;
		}
		if (pregunta != null && pregunta !== existing.pregunta) {
			updates.pregunta = pregunta;
		}

		if (Object.keys(updates).length === 0) {
			return existing;
		}

		await ctx.db.patch(id, updates);
		const next: Affirmation = { ...existing, ...updates };
		return next;
	}
});

export const remove = mutation({
	args: { id: v.id('afirmaciones') },
	handler: async (ctx, args) => {
		const doc = await ctx.db.get(args.id);
		if (!doc) {
			throw new Error('La afirmación solicitada no existe');
		}

		await ctx.db.delete(args.id);
		return doc;
	}
});
