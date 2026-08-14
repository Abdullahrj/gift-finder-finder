import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  getWishlistItems,
  createWishlistItem,
  updateWishlistItem,
  deleteWishlistItem,
} from "@/lib/wishlist.functions";
import { ItemCard, type WishlistItem } from "@/components/wishlist-item-card";
import { ItemDialog, AddCardButton, type ItemFormData } from "@/components/wishlist-item-dialog";
import { toast } from "sonner";

const wishlistQueryOptions = () =>
  queryOptions({
    queryKey: ["wishlist"],
    queryFn: () => getWishlistItems(),
  });

export const Route = createFileRoute("/_authenticated/wishlist")({
  head: () => ({
    meta: [
      { title: "My Wishlist — Collect" },
      { name: "description", content: "Your personal wishlist with prices and where to find each item." },
      { property: "og:title", content: "My Wishlist — Collect" },
      { property: "og:description", content: "Your personal wishlist with prices and where to find each item." },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(wishlistQueryOptions());
  },
  component: WishlistPage,
});

function WishlistPage() {
  const { data: items } = useSuspenseQuery(wishlistQueryOptions());
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | undefined>();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchItems = useServerFn(getWishlistItems);
  const createItem = useServerFn(createWishlistItem);
  const updateItem = useServerFn(updateWishlistItem);
  const deleteItem = useServerFn(deleteWishlistItem);

  const filteredItems = items.filter((item) => {
    if (filter === "favorites") return item.is_favorite;
    return true;
  });

  const totalValue = filteredItems.reduce((sum, item) => sum + Number(item.price), 0);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };

  const handleAddClick = () => {
    setEditingItem(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (item: WishlistItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSubmit = async (form: ItemFormData) => {
    const price = parseFloat(form.price);
    if (Number.isNaN(price) || price < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    const payload = {
      ...form,
      price,
      storeUrl: form.storeUrl || undefined,
      storeName: form.storeName || undefined,
      notes: form.notes || undefined,
      imageUrl: form.imageUrl || undefined,
    };

    try {
      if (editingItem) {
        await updateItem({ data: { id: editingItem.id, ...payload } });
        toast.success("Item updated.");
      } else {
        await createItem({ data: payload });
        toast.success("Item added to your wishlist.");
      }
      setDialogOpen(false);
      router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    try {
      await deleteItem({ data: { id } });
      toast.success("Item deleted.");
      router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete item.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleFavorite = async (id: string, value: boolean) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    try {
      await updateItem({
        data: {
          id,
          name: item.name,
          price: Number(item.price),
          storeUrl: item.store_url ?? "",
          storeName: item.store_name ?? "",
          notes: item.notes ?? "",
          imageUrl: item.image_url ?? "",
          isFavorite: value,
        },
      });
      router.invalidate();
    } catch (err) {
      toast.error("Could not update favorite status.");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/wishlist" className="font-extrabold tracking-tighter text-xl">
              COLLECT.
            </Link>
            <div className="hidden md:flex gap-6">
              <button
                onClick={() => setFilter("all")}
                className={`text-sm font-medium pb-0.5 transition-colors ${
                  filter === "all" ? "border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Shelf
              </button>
              <button
                onClick={() => setFilter("favorites")}
                className={`text-sm font-medium pb-0.5 transition-colors ${
                  filter === "favorites"
                    ? "border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Saved
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSignOut}
              className="text-xs font-mono px-3 py-1.5 ring-1 ring-border rounded-full hover:bg-black/[0.02] transition-colors"
            >
              LOG OUT
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header / Stats */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="animate-in">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Personal Curation</h1>
            <p className="text-muted-foreground max-w-md text-pretty">
              A technical inventory of objects for the home, office, and travel.
            </p>
          </div>
          <div className="flex items-center gap-2 animate-in [animation-delay:60ms]">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              Total Value:
            </span>
            <span className="font-mono font-medium px-3 py-1 bg-black/[0.03] rounded text-sm">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                totalValue,
              )}
            </span>
          </div>
        </header>

        {/* Mobile filter tabs */}
        <div className="flex md:hidden gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setFilter("all")}
            className={`pb-3 text-sm font-medium ${
              filter === "all" ? "border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            Shelf
          </button>
          <button
            onClick={() => setFilter("favorites")}
            className={`pb-3 text-sm font-medium ${
              filter === "favorites" ? "border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            Saved
          </button>
        </div>

        {filteredItems.length === 0 ? (
          <div className="animate-in [animation-delay:120ms] max-w-md mx-auto text-center py-20">
            <div className="size-16 bg-muted rounded-2xl ring-1 ring-border mx-auto mb-6 grid place-items-center">
              <span className="text-xl">📁</span>
            </div>
            <h2 className="text-xl font-bold mb-2 tracking-tight">
              {filter === "favorites" ? "No favorites yet" : "Start your collection"}
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              {filter === "favorites"
                ? "Mark items as favorites to see them here."
                : "Your shelf is currently empty. Add your first favorite object to begin."}
            </p>
            <Button onClick={handleAddClick} className="font-medium">
              Add an Item
            </Button>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AddCardButton onClick={handleAddClick} />
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
                deleting={loadingId === item.id}
              />
            ))}
          </section>
        )}
      </div>

      <ItemDialog
        item={editingItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        loading={false}
      />
    </main>
  );
}
