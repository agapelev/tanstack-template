// convex/errors.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Мутация: записать ошибку в базу данных Convex
 * Используется для глобального перехвата ошибок на клиенте
 */
export const log = mutation({
    args: {
        message: v.string(),
                            stack: v.optional(v.string()),
                            url: v.string(),
                            userAgent: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("errors", {
            ...args,
            timestamp: Date.now(),
                            resolved: false,
        });
    },
});

/**
 * Запрос: получить список последних ошибок
 * @param limit - максимальное количество записей (по умолчанию 50)
 */
export const list = query({
    args: { limit: v.optional(v.number()) },
                          handler: async (ctx, args) => {
                              const limit = args.limit ?? 50;
                              return await ctx.db
                              .query("errors")
                              .order("desc")
                              .take(limit);
                          },
});

/**
 * Мутация: пометить ошибку как исправленную
 * @param id - ID записи в таблице errors
 */
export const resolve = mutation({
    args: { id: v.id("errors") },
                                handler: async (ctx, args) => {
                                    await ctx.db.patch(args.id, {
                                        resolved: true,
                                        resolvedAt: Date.now(),
                                    });
                                },
});
