import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	afirmaciones: defineTable({
		n: v.number(),
		eje: v.string(),
		criterio: v.string(),
		pregunta: v.string()
	})
		.index('by_n', ['n'])
		.index('by_eje', ['eje'])
		.index('by_criterio', ['criterio']),

	partidos: defineTable({
		partido: v.string(),
		coordenadas: v.array(v.number())
	}).index('by_partido', ['partido']),

	party_profiles: defineTable({
		partido: v.string(),
		nombre: v.string(),
		logo: v.optional(v.id('_storage')),
		fundacion: v.string(),
		fundador: v.string(),
		ideologia: v.string(),
		ambitos: v.string(),
		presidente: v.string(),
		secretario: v.optional(v.string()),
		organizaciones: v.optional(v.string()),
		representacion: v.optional(v.string()),
		historial: v.optional(v.string()),
		alianzas: v.optional(v.string()),
		elecciones: v.optional(v.string()),
		estado: v.optional(v.string()),
		multas: v.optional(v.string()),
		sanciones: v.optional(v.string()),
		procesos_legales: v.optional(v.string()),
		corrupcion: v.optional(v.string()),
		denuncias: v.optional(v.string()),
		web: v.optional(v.string()),
		correo: v.optional(v.string()),
		facebook: v.optional(v.string()),
		twitter: v.optional(v.string()),
		mas_info: v.optional(v.string())
	}).index('by_partido', ['partido']),
	party_positions: defineTable({
		partido: v.string(),
		tema: v.string(),
		postura: v.union(v.string(), v.null())
	})
});
