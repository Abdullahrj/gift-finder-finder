import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { WishlistItem } from "./wishlist-item-card";

export type ItemFormData = {
  name: string;
  price: string;
  storeUrl: string;
  storeName: string;
  notes: string;
  imageUrl: string;
  isFavorite: boolean;
};

function emptyForm(): ItemFormData {
  return {
    name: "",
    price: "",
    storeUrl: "",
    storeName: "",
    notes: "",
    imageUrl: "",
    isFavorite: false,
  };
}

function itemToForm(item: WishlistItem): ItemFormData {
  return {
    name: item.name,
    price: item.price.toString(),
    storeUrl: item.store_url ?? "",
    storeName: item.store_name ?? "",
    notes: item.notes ?? "",
    imageUrl: item.image_url ?? "",
    isFavorite: Boolean(item.is_favorite),
  };
}

export function ItemDialog({
  item,
  open,
  onOpenChange,
  onSubmit,
  loading,
}: {
  item?: WishlistItem | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ItemFormData) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<ItemFormData>(emptyForm());
  const isEditing = Boolean(item);

  useEffect(() => {
    if (open) {
      setForm(item ? itemToForm(item) : emptyForm());
    }
  }, [open, item]);

  const update = <K extends keyof ItemFormData>(key: K, value: ItemFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="fixed bottom-8 right-8 size-14 bg-foreground text-background rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
          aria-label="Add item"
        >
          <Plus className="size-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {isEditing ? "Edit item" : "Add to your wishlist"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEditing
              ? "Update the details for this item."
              : "Save something you want to buy later."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-mono uppercase tracking-wider">
              Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. NuPhy Air75 V2"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs font-mono uppercase tracking-wider">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="storeName" className="text-xs font-mono uppercase tracking-wider">
                Store name
              </Label>
              <Input
                id="storeName"
                placeholder="e.g. NuPhy"
                value={form.storeName}
                onChange={(e) => update("storeName", e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="storeUrl" className="text-xs font-mono uppercase tracking-wider">
              Store link
            </Label>
            <Input
              id="storeUrl"
              type="url"
              placeholder="https://..."
              value={form.storeUrl}
              onChange={(e) => update("storeUrl", e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="imageUrl" className="text-xs font-mono uppercase tracking-wider">
              Image URL
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://..."
              value={form.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-mono uppercase tracking-wider">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Color, size, reason to buy..."
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="favorite"
              checked={form.isFavorite}
              onCheckedChange={(checked) => update("isFavorite", checked === true)}
            />
            <Label htmlFor="favorite" className="text-sm font-medium cursor-pointer">
              Mark as favorite
            </Label>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="font-medium">
              {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isEditing ? "Save changes" : "Add item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddCardButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center p-8 aspect-[4/3] md:aspect-square rounded-2xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/[0.01] transition-all animate-in"
    >
      <div className="size-12 rounded-full ring-1 ring-border group-hover:ring-primary/40 group-hover:bg-white flex items-center justify-center mb-4 transition-all">
        <Plus className="size-6 font-light group-hover:text-primary" />
      </div>
      <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
        Acquire new object
      </span>
    </button>
  );
}
