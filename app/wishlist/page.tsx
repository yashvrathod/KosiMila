"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StoreHeader, { type StoreHeaderCategory } from "@/app/components/store/StoreHeader";
import StoreFooter from "@/app/components/store/StoreFooter";

export type WishlistProduct = {
  id: string;
  name: string;
  price: number;
  images: string[];
  category?: { name: string } | null;
};

export type WishlistItem = {
  id: string;
  productId: string;
  createdAt: string;
  product: WishlistProduct;
};

export default function WishlistPage() {
  const [categories, setCategories] = useState<StoreHeaderCategory[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json().catch(() => ({}));
        const cats = (Array.isArray((data as any)?.categories) ? (data as any).categories : []) as Array<{ id: string; name: string; slug: string }>;
        setCategories(cats.map((c) => ({ id: String(c.id ?? c.slug ?? c.name), name: String(c.name), slug: String(c.slug) })));
      } catch {
        setCategories([]);
      }
    })();
  }, []);
  const [items, setItems] = useState<WishlistItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist", { credentials: "include" });
      if (res.status === 401) {
        window.location.assign("/login?redirect=/wishlist");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data?.error as string) || "Failed to load wishlist");
      }
      const data = (await res.json()) as { items: WishlistItem[] };
      setItems(data.items || []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (productId: string) => {
    const previous = items ?? [];
    setItems(previous.filter((it) => it.productId !== productId));
    try {
      const res = await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 401) {
        window.location.assign("/login?redirect=/wishlist");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data?.error as string) || "Failed to remove");
      }
    } catch (e) {
      // rollback on failure
      setItems(previous);
      const msg = e instanceof Error ? e.message : "Failed to remove";
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader categories={categories} />
      <main className="">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Wishlist</h1>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">Loading...</div>
        ) : error ? (
          <div className="bg-white border border-red-200 text-red-700 rounded-lg p-6">
            {error}
            <div className="mt-3">
              <button onClick={load} className="px-3 py-1.5 rounded border border-gray-300 hover:border-gray-400">Retry</button>
            </div>
          </div>
        ) : !items || items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-700">Your wishlist is empty.</p>
            <Link href="/products" className="inline-block mt-4 px-4 py-2 rounded-lg border border-gray-300 hover:border-primary-500 hover:text-primary-500">Browse products</Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <li key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <Link href={`/products/${item.productId}`} className="block">
                  {item.product?.images?.[0] ? (
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gray-100" />)
                  }
                </Link>
                <div className="p-4">
                  <Link href={`/products/${item.productId}`} className="font-semibold line-clamp-1">
                    {item.product?.name || "Product"}
                  </Link>
                  <div className="text-sm text-gray-500 mt-1">
                    {item.product?.category?.name ?? ""}
                  </div>
                  <div className="mt-2 font-bold">₹{(item.product?.price ?? 0).toLocaleString()}</div>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/products/${item.productId}`} className="px-3 py-1.5 rounded border border-gray-300 hover:border-gray-400 text-sm">View</Link>
                    <button onClick={() => remove(item.productId)} className="px-3 py-1.5 rounded border border-red-300 text-red-600 hover:border-red-400 text-sm">Remove</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      </main>
      <StoreFooter />
    </div>
  );
}
