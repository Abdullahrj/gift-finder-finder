import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const itemSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.coerce.number().nonnegative().multipleOf(0.01),
  storeUrl: z.string().url().optional().or(z.literal("")),
  storeName: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isFavorite: z.boolean().default(false),
});

const itemIdSchema = z.object({
  id: z.string().uuid(),
});

export const getWishlistItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("wishlist_items")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  });

export const createWishlistItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => itemSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: inserted, error } = await context.supabase
      .from("wishlist_items")
      .insert({
        user_id: context.userId,
        name: data.name,
        price: data.price,
        store_url: data.storeUrl || null,
        store_name: data.storeName || null,
        notes: data.notes || null,
        image_url: data.imageUrl || null,
        is_favorite: data.isFavorite,
      })
      .select()
      .single();

    if (error) throw error;
    return inserted;
  });

export const updateWishlistItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => itemIdSchema.extend(itemSchema.shape).parse(data))
  .handler(async ({ context, data }) => {
    const { data: updated, error } = await context.supabase
      .from("wishlist_items")
      .update({
        name: data.name,
        price: data.price,
        store_url: data.storeUrl || null,
        store_name: data.storeName || null,
        notes: data.notes || null,
        image_url: data.imageUrl || null,
        is_favorite: data.isFavorite,
      })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select()
      .single();

    if (error) throw error;
    return updated;
  });

export const deleteWishlistItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => itemIdSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("wishlist_items")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);

    if (error) throw error;
    return { success: true };
  });
