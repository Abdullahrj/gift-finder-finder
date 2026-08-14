ALTER TABLE public.wishlist_items ADD COLUMN image_url text;

COMMENT ON COLUMN public.wishlist_items.image_url IS 'Optional URL to a product image.';