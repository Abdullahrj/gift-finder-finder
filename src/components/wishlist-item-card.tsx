import { useState } from "react";
import {
  ExternalLink,
  Heart,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export type WishlistItem = {
  id: string;
  user_id: string;
  name: string;
  price: number;
  store_url: string | null;
  store_name: string | null;
  notes: string | null;
  image_url: string | null;
  is_favorite: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getHostname(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function hashColor(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `oklch(0.9 0.06 ${hue})`;
}

export function ItemCard({
  item,
  onEdit,
  onDelete,
  onToggleFavorite,
  deleting,
}: {
  item: WishlistItem;
  onEdit: (item: WishlistItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, value: boolean) => void;
  deleting?: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const hostname = getHostname(item.store_url) || item.store_name || "Store";
  const displayUrl = item.store_url || "#";
  const hasImage = item.image_url && !imageError;

  return (
    <div className="group relative flex flex-col bg-card rounded-2xl ring-1 ring-border hover:ring-black/15 transition-all duration-300 animate-in">
      <div className="p-4">
        <div className="w-full aspect-[4/3] bg-muted rounded-xl overflow-hidden grid place-items-center relative">
          {hasImage ? (
            <img
              src={item.image_url!}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: hashColor(item.name) }}
            >
              <span className="text-2xl font-bold text-foreground/40">
                {initials(item.name)}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="px-6 pb-6 pt-2">
        <div className="flex items-start justify-between mb-4">
          <span className="inline-block font-mono text-[11px] font-bold px-2 py-0.5 bg-primary text-primary-foreground rounded">
            {formatPrice(Number(item.price))}
          </span>
          <button
            type="button"
            onClick={() => onToggleFavorite(item.id, !item.is_favorite)}
            className={`transition-colors ${item.is_favorite ? "text-accent" : "text-muted-foreground hover:text-accent"}`}
            aria-label={item.is_favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`size-5 ${item.is_favorite ? "fill-current" : ""}`} />
          </button>
        </div>
        <h3 className="text-lg font-bold tracking-tight mb-1">{item.name}</h3>
        {item.notes && (
          <p className="text-xs text-muted-foreground leading-relaxed mb-6">{item.notes}</p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <a
            href={displayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group/link"
          >
            <div className="size-6 rounded-full bg-muted flex items-center justify-center group-hover/link:bg-accent/10 transition-colors">
              <ExternalLink className="size-3 text-accent" />
            </div>
            <span className="text-[10px] font-mono font-medium text-muted-foreground group-hover/link:text-foreground uppercase">
              Find at {hostname}
            </span>
          </a>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="size-4" />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="text-[10px] font-mono text-muted-foreground hover:text-destructive transition-colors"
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove <strong>{item.name}</strong> from your wishlist.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(item.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
