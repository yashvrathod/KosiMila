"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import { FaHome, FaShieldAlt, FaGift, FaTruck } from "react-icons/fa";
import StoreHeader from "@/app/components/store/StoreHeader";
import StoreFooter from "@/app/components/store/StoreFooter";

type Product = {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: string[];
  ratings: number;
  reviewCount: number;
  category?: { name: string; slug: string };
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    params.set("limit", "48");
    return `/api/products?${params.toString()}`;
  }, [category, search]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, cRes, wRes] = await Promise.all([
          fetch(apiUrl),
          fetch("/api/categories"),
          fetch("/api/wishlist"),
        ]);
        const p = await pRes.json().catch(() => ({}));
        const c = await cRes.json().catch(() => ({}));
        const w = await wRes.json().catch(() => ({ items: [] }));

        setProducts(p.products || []);
        setCategories(c.categories || []);
        setWishlist(
          new Set((w.items || []).map((item: any) => item.productId))
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [apiUrl]);

  const toggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const isInWishlist = wishlist.has(productId);

    setWishlist((prev) => {
      const newSet = new Set(prev);
      isInWishlist ? newSet.delete(productId) : newSet.add(productId);
      return newSet;
    });

    try {
      if (isInWishlist) {
        await fetch(`/api/wishlist?productId=${productId}`, {
          method: "DELETE",
        });
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      }
    } catch {
      // rollback
      setWishlist((prev) => {
        const newSet = new Set(prev);
        isInWishlist ? newSet.add(productId) : newSet.delete(productId);
        return newSet;
      });
    }
  };

  const calculateDiscount = (price: number, comparePrice?: number) => {
    if (!comparePrice) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  return (

  <div className="min-h-screen bg-gray-100">
    <StoreHeader
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      }))}
      initialSearch={search}
    />

    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* 🔥 HERO (only homepage view) */}
      {!category && !search && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 md:p-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                Handmade With Love ❤️
              </h2>
              <p className="text-gray-600 text-sm md:text-base">
                Pure ingredients. Traditional taste. Premium quality.
              </p>
            </div>
            <img
              src="/hero-ladoo.png"
              className="h-24 md:h-28 hidden md:block"
            />
          </div>
        </div>
      )}

      {/* 🔥 CATEGORY PILLS */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${c.slug}`}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition ${
              category === c.slug
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* 🔥 HEADING */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg md:text-xl font-semibold text-gray-800">
          {search
            ? `Search: ${search}`
            : category
            ? `Category: ${category}`
            : "All Products"}
        </h1>

        {(category || search) && (
          <Link
            href="/products"
            className="text-blue-600 text-sm hover:underline"
          >
            Clear filters
          </Link>
        )}
      </div>

      {/* 🔥 CONTENT */}
      {loading ? (
        <div className="py-20 text-center text-gray-600">
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center text-gray-600">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group bg-white border rounded-xl p-4 hover:shadow-xl hover:-translate-y-1 transition flex flex-col"
            >
              {/* IMAGE */}
              <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full object-contain group-hover:scale-105 transition duration-300"
                  />
                )}

                {/* WISHLIST */}
                <button
                  onClick={(e) => toggleWishlist(e, product.id)}
                  className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow hover:scale-110 transition"
                >
                  <Heart
                    size={16}
                    className={
                      wishlist.has(product.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-500"
                    }
                  />
                </button>
              </div>

              {/* TITLE */}
              <h3 className="text-sm text-gray-700 line-clamp-2 mb-1 group-hover:text-black transition">
                {product.name}
              </h3>

              {/* CATEGORY (NEW subtle addition) */}
              {product.category && (
                <p className="text-xs text-gray-400 mb-1">
                  {product.category.name}
                </p>
              )}

              {/* RATING */}
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                  {product.ratings} ★
                </span>
                <span className="text-xs text-gray-500">
                  ({product.reviewCount})
                </span>
              </div>

              {/* PRICE */}
              <div className="flex items-center gap-2 flex-wrap mt-auto">
                <span className="text-base font-semibold text-black">
                  ₹{product.price}
                </span>

                {product.comparePrice && (
                  <>
                    <span className="text-xs text-gray-500 line-through">
                      ₹{product.comparePrice}
                    </span>
                    <span className="text-green-600 text-xs font-medium">
                      {calculateDiscount(
                        product.price,
                        product.comparePrice
                      )}
                      % off
                    </span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>

    <StoreFooter />
  </div>
);
}