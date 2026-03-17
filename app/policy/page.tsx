"use client";

import StoreHeader, { type StoreHeaderCategory } from "@/app/components/store/StoreHeader";
import StoreFooter from "@/app/components/store/StoreFooter";
import { useEffect, useState } from "react";

export default function PolicyPage() {
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
  return (
    <div className="min-h-screen bg-white">
      <StoreHeader categories={categories} />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Store Policy</h1>
        <div className="space-y-4 text-gray-800">
          <p><strong>Shipping:</strong> Free delivery for Pune.</p>
          <p><strong>Shipping (Outside Pune):</strong> Free delivery for orders above 2 kg.</p>
          <p><strong>Returns:</strong> No Return Policy.</p>
          <p><strong>Warranty:</strong> No Warranty.</p>
        </div>
      </div>
      <StoreFooter />
    </div>
  );
}
