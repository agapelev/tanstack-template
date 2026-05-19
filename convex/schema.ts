// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ✅ Оригинальная вложенная структура: одна запись = одна беседа
  conversations: defineTable({
    title: v.string(),
                             messages: v.array(
                               v.object({
                                 id: v.string(),
                                        role: v.union(v.literal("user"), v.literal("assistant")),
                                        content: v.string(),
                               })
                             ),
  }),

  // ✅ Добавлена таблица для логирования ошибок (минимальное дополнение)
  errors: defineTable({
    message: v.string(),
                      stack: v.optional(v.string()),
                      url: v.string(),
                      userAgent: v.optional(v.string()),
                      timestamp: v.number(),
                      resolved: v.boolean(),
                      resolvedAt: v.optional(v.number()),
  })
  .index("by_timestamp", ["timestamp"])
  .index("by_resolved", ["resolved"]),
});
