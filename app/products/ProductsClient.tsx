"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Sparkles,
  Package,
  ArrowRight,
  Filter,
  Check
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  images: string[];
  categoryId: string;
  category: {
    name: string;
    slug: string;
  };
  brand?: string | null;
  ratings: number;
  reviewCount: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

import StoreHeader from "@/app/components/store/StoreHeader";
import StoreFooter from "@/app/components/store/StoreFooter";

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const limit = 12;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit,
    pages: 0,
  });

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    search: searchParams.get("search") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "createdAt",
    page: parseInt(searchParams.get("page") || "1"),
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.search) params.set("search", filters.search);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.sort) params.set("sort", filters.sort);
      params.set("page", String(filters.page));
      params.set("limit", String(limit));

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      setProducts(data.products || []);
      setPagination({
        total: data.pagination?.total || 0,
        page: data.pagination?.page || 1,
        limit: data.pagination?.limit || 12,
        pages: data.pagination?.pages || 0,
      });
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const toggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const isInWishlist = wishlist.has(productId);
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (isInWishlist) newSet.delete(productId);
      else newSet.add(productId);
      return newSet;
    });
    try {
      if (isInWishlist) {
        await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE", credentials: "include" });
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      }
    } catch {}
  };

  const updateFilters = (updates: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...updates, page: 1 }));
    // Update URL without refreshing
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
      else params.delete(key);
    });
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    const defaultFilters = {
      category: "",
      search: "",
      minPrice: "",
      maxPrice: "",
      sort: "createdAt",
      page: 1,
    };
    setFilters(defaultFilters);
    router.push("/products");
  };

  const hasActiveFilters = useMemo(() => {
    return filters.category || filters.search || filters.minPrice || filters.maxPrice || filters.sort !== "createdAt";
  }, [filters]);

  return (
    <div className="min-h-screen bg-[#FCFBFA]">
      <StoreHeader categories={categories} initialSearch={filters.search} />

      {/* Luxury Collection Header */}
      <section className="bg-white border-b border-neutral-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-50/20 to-transparent -skew-x-12 translate-x-1/4"></div>
        <div className="container-premium py-20 md:py-28 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-primary-200">
              <Sparkles size={14} />
              Premium Selection
            </div>
            <h1 className="text-5xl md:text-7xl font-poppins font-bold text-neutral-900 mb-8 leading-tight">
              Our <span className="text-gradient">Collections</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-500 font-medium leading-relaxed">
              Explore the pinnacle of healthy snacking. Each pack of Kosimila makhana is a testament to quality, purity, and artisan roasting.
            </p>
          </div>
        </div>
      </section>

      {/* Filter & Category Pills Section */}
      <section className="bg-white border-b border-neutral-100 sticky top-[120px] z-40">
        <div className="container-premium">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6">
            
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button
                onClick={() => updateFilters({ category: "" })}
                className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  !filters.category 
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-100" 
                    : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                All Treasures
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilters({ category: cat.slug })}
                  className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                    filters.category === cat.slug 
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-100" 
                      : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Sort & Filter Toggle */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <select 
                  value={filters.sort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="appearance-none bg-neutral-50 border-2 border-transparent rounded-2xl pl-6 pr-12 py-3 text-xs font-bold text-neutral-700 outline-none focus:bg-white focus:border-primary-500 transition-all cursor-pointer"
                >
                  <option value="createdAt">New Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-neutral-400 pointer-events-none" size={16} />
              </div>
              
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-3 rounded-2xl transition-all border-2 ${isFilterOpen ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-neutral-50 border-transparent text-neutral-600'}`}
              >
                <SlidersHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {isFilterOpen && (
            <div className="py-8 border-t border-neutral-100 animate-slide-down">
              <div className="grid md:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Price Range</h4>
                  <div className="flex items-center gap-4">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={filters.minPrice}
                      onChange={(e) => updateFilters({ minPrice: e.target.value })}
                      className="w-full bg-neutral-50 border-2 border-transparent rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:bg-white focus:border-primary-500 transition-all"
                    />
                    <span className="text-neutral-300">—</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={filters.maxPrice}
                      onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                      className="w-full bg-neutral-50 border-2 border-transparent rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:bg-white focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Quick Filters</h4>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 rounded-xl border border-neutral-100 text-xs font-bold text-neutral-600 hover:border-primary-500 hover:text-primary-600 transition-all">Best Sellers</button>
                    <button className="px-4 py-2 rounded-xl border border-neutral-100 text-xs font-bold text-neutral-600 hover:border-primary-500 hover:text-primary-600 transition-all">Under ₹500</button>
                    <button className="px-4 py-2 rounded-xl border border-neutral-100 text-xs font-bold text-neutral-600 hover:border-primary-500 hover:text-primary-600 transition-all">Eco Packs</button>
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  {hasActiveFilters && (
                    <button 
                      onClick={clearFilters}
                      className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 w-fit px-4 py-2 rounded-xl transition-all"
                    >
                      <X size={14} /> Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Product Results */}
      <section className="container-premium py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-white rounded-[3rem] animate-pulse shadow-soft"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-40 bg-white rounded-[4rem] border border-dashed border-neutral-200">
            <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Package size={48} className="text-neutral-200" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">No Treasures Found</h3>
            <p className="text-neutral-400 font-medium mb-12 max-w-sm mx-auto">We couldn't find any products matching your current filters. Try adjusting your search.</p>
            <button onClick={clearFilters} className="btn-primary px-10">View All Products</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {products.map((product) => {
              const discount = product.comparePrice
                ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                : 0;
              const isInWishlist = wishlist.has(product.id);

              return (
                <div key={product.id} className="group">
                  <Link href={`/products/${product.id}`} className="block relative">
                    <div className="aspect-[4/5] bg-white rounded-[3rem] overflow-hidden shadow-soft border border-neutral-100 p-8 flex items-center justify-center transition-all duration-700 group-hover:shadow-premium group-hover:-translate-y-3">
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-1000" 
                      />
                      
                      {/* Interactive Badges */}
                      <div className="absolute top-8 left-8 flex flex-col gap-3">
                        {discount > 0 && (
                          <div className="bg-primary-600 text-white px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl animate-fade-in">
                            {discount}% OFF
                          </div>
                        )}
                        {product.featured && (
                          <div className="bg-neutral-900 text-white px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-2">
                            <Sparkles size={12} className="text-amber-400" /> Best Seller
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={(e) => toggleWishlist(e, product.id)}
                        className="absolute top-8 right-8 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20 hover:scale-110 active:scale-95 transition-all z-10"
                      >
                        <Heart size={20} className={isInWishlist ? "text-red-500 fill-red-500" : "text-neutral-400"} />
                      </button>

                      {/* Quick Buy Overlay */}
                      <div className="absolute bottom-8 left-8 right-8 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="w-full bg-neutral-900 text-white py-4 rounded-3xl text-[10px] font-bold uppercase tracking-widest text-center shadow-2xl flex items-center justify-center gap-2">
                          View Selection <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="mt-8 px-4 space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-1">
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-poppins font-bold text-neutral-900 text-lg leading-tight group-hover:text-primary-600 transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                          {product.category?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-neutral-900">₹{product.price.toLocaleString()}</p>
                        {product.comparePrice && (
                          <p className="text-xs text-neutral-400 line-through font-medium">₹{product.comparePrice.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < Math.floor(product.ratings) ? "currentColor" : "none"} className={i < Math.floor(product.ratings) ? "" : "text-neutral-200"} />
                      ))}
                      <span className="text-[10px] font-bold text-neutral-400 ml-2">({product.reviewCount})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination - Luxury Style */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-24">
            <button 
              disabled={pagination.page === 1}
              onClick={() => updateFilters({ page: pagination.page - 1 })}
              className="w-14 h-14 rounded-3xl border-2 border-neutral-100 flex items-center justify-center hover:bg-white hover:border-primary-200 transition-all disabled:opacity-30 group"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex gap-3">
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateFilters({ page: i + 1 })}
                  className={`w-14 h-14 rounded-3xl font-bold text-sm transition-all ${
                    pagination.page === i + 1 
                      ? "bg-neutral-900 text-white shadow-2xl scale-110" 
                      : "bg-white border-2 border-neutral-100 text-neutral-600 hover:border-primary-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={pagination.page === pagination.pages}
              onClick={() => updateFilters({ page: pagination.page + 1 })}
              className="w-14 h-14 rounded-3xl border-2 border-neutral-100 flex items-center justify-center hover:bg-white hover:border-primary-200 transition-all disabled:opacity-30 group"
            >
              <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </section>

      {/* Trust Quote / Brand Section */}
      <section className="py-24 bg-white">
        <div className="container-premium text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="w-16 h-1 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto rounded-full"></div>
            <h2 className="text-3xl md:text-5xl font-poppins font-bold text-neutral-900 italic leading-tight">
              "The finest makhana isn't just a snack; it's a commitment to your wellbeing."
            </h2>
            <p className="text-neutral-500 font-bold uppercase tracking-[0.3em] text-xs">Kosimila Philosophy</p>
          </div>
        </div>
      </section>

      <StoreFooter />
    </div>
  );
}
