import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	questions: defineTable({
		id: v.string(),
		order: v.number(),
		text: v.string(),
		options: v.array(
			v.object({
				label: v.string(),
				value: v.number(),
			}),
		),
		scale: v.array(v.number()),
		axis: v.string(),
		higher: v.string(),
		weight: v.number(),
		note: v.optional(v.string()),
	})
		.index("by_question_id", ["id"])
		.index("by_order", ["order"])
		.index("by_axis", ["axis"]),
});