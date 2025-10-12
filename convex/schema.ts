import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  afirmaciones: defineTable({
    n: v.number(),
    eje: v.string(),
    criterio: v.string(),
    pregunta: v.string(),
  })
    .index("by_n", ["n"])
    .index("by_eje", ["eje"])
    .index("by_criterio", ["criterio"]),

  partidos: defineTable({
    partido: v.string(),
    coordenadas: v.array(v.number()), // [x, y]
  })
    .index("by_partido", ["partido"]),
});


// criterios
// eje - x = 0, y = 1.
// n = 1, 2. donde 1 es test corto y 2 es test largo.
// donde el test largo incluye las pereguntas del test corto.