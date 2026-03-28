"use client";

import { useEffect, useState, useMemo } from "react";
import ExpandableText from "@/app/components/ExpandableText";
import ReviewForm from "@/app/components/ReviewForm";
import { 
  Heart, 
  RotateCcw, 
  Shield, 
  ShoppingCart, 
  Star, 
  Truck, 
  ChevronRight, 
  ArrowLeft, 
  Minus, 
  Plus, 
  CheckCircle2, 
  Award,
  Leaf,
  Sparkles,
  Zap,
  Clock,
  Trash2
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import StoreHeader from "@/app/components/store/StoreHeader";
import StoreFooter from "@/app/components/store/StoreFooter";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  brand?: string;
  ratings: number;
  reviewCount: number;
  weight: number;
  highlights: string[];
  specifications?: Record<string, unknown>;
  category: {
    name: string;
    slug: string;
  };
  reviews: Review[];
  variants: ProductVariant[];
}

interface ProductVariant {
  id: string;
  weight: string;
  price: number;
  comparePrice?: number;
  stock: number;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified: boolean;
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartStatus, setCartStatus] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const router = useRouter();

  // Handle Scroll for Sticky Bar
  useEffect(() => {
    const handleScroll = () => {
      const atcButton = document.getElementById('main-atc-button');
      if (atcButton) {
        const rect = atcButton.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Recently Viewed
  useEffect(() => {
    if (!product) return;
    const saved = localStorage.getItem('recentlyViewed');
    let list = saved ? JSON.parse(saved) : [];
    
    // Remove if already exists and add to front
    list = list.filter((p: any) => p.id !== product.id);
    list.unshift({
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
      category: product.category
    });
    
    // Keep only last 10
    const limited = list.slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(limited));
    setRecentlyViewed(limited.filter((p: any) => p.id !== product.id));
  }, [product]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${params.id}`);
      const data = await res.json();
      setProduct(data.product);
      if (data.product.variants && data.product.variants.length > 0) {
        setSelectedVariant(data.product.variants[0]);
      }
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.user?.role === "ADMIN");
        }
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [params.id]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!params.id) return;
      try {
        const res = await fetch("/api/wishlist", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        const items: { wishlistItems?: { productId: string }[] } = data || {};
        const has = !!items.wishlistItems?.some((it: any) => it.productId === params.id);
        if (active) setWishlisted(has);
      } catch {}
    })();
    return () => { active = false; };
  }, [params.id]);

  const addToCart = async () => {
    setCartStatus(null);
    if (!product?.id) return;
    setAddingToCart(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productId: product.id, 
          quantity,
          variantId: selectedVariant?.id 
        }),
      });
      if (res.status === 401) {
        window.location.assign(`/login?redirect=/products/${params.id}`);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCartStatus((data?.error as string) || "Failed to add to cart");
        return;
      }
      router.push("/cart");
    } catch (e) {
      alert("Something went wrong");
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    if (!product?.id) return;
    try {
      if (!wishlisted) {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        if (res.status === 401) {
          window.location.assign(`/login?redirect=/products/${params.id}`);
          return;
        }
        setWishlisted(true);
      } else {
        await fetch(`/api/wishlist?productId=${product.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        setWishlisted(false);
      }
    } catch {
      alert("Error updating wishlist");
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Delete this review?")) return;
    setDeletingReviewId(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) await fetchProduct();
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-neutral-500 font-medium animate-pulse">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="text-center bg-white p-12 rounded-4xl shadow-soft border border-neutral-100">
          <div className="w-20 h-20 bg-neutral-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Trash2 size={40} className="text-neutral-400" />
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Product Not Found</h2>
          <p className="text-neutral-600 mb-8 max-w-sm">The product you're looking for might have been moved or removed.</p>
          <Link href="/products" className="btn-primary inline-flex">Go Back to Shop</Link>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentComparePrice = selectedVariant ? selectedVariant.comparePrice : product.comparePrice;
  const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : false;

  const discount = currentComparePrice
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0;

  const openBulkInquiry = () => {
    const msg = `Hi Kosimila! I'm interested in bulk/wholesale order for ${product.name} (${selectedVariant?.weight || 'Premium Pack'}). Please share your best rates for 10kg+ quantities.`;
    window.open(`https://wa.me/916202058021?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FCFBFA]">
      <StoreHeader categories={[]} initialSearch="" />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-neutral-100">
        <div className="container-premium py-4">
          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link href="/" className="text-neutral-500 hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={14} className="text-neutral-300" />
            <Link href="/products" className="text-neutral-500 hover:text-primary-600 transition-colors">Shop</Link>
            <ChevronRight size={14} className="text-neutral-300" />
            <Link href={`/products?category=${product.category.slug}`} className="text-neutral-500 hover:text-primary-600 transition-colors uppercase tracking-wider text-[11px]">{product.category.name}</Link>
            <ChevronRight size={14} className="text-neutral-300" />
            <span className="text-primary-600 truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-premium py-12">
        <div className="grid lg:grid-cols-12 gap-16">
          
          {/* LEFT: IMAGE GALLERY (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative group">
              <div className="aspect-[4/5] md:aspect-square bg-white rounded-[3rem] overflow-hidden shadow-premium-soft border border-neutral-100 p-8 flex items-center justify-center">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              {/* Image Badges */}
              <div className="absolute top-8 left-8 flex flex-col gap-3">
                {discount > 0 && (
                  <div className="bg-primary-600 text-white px-4 py-2 rounded-2xl font-bold shadow-lg animate-fade-in">
                    {discount}% OFF
                  </div>
                )}
                <div className="bg-white/90 backdrop-blur-md text-neutral-900 px-4 py-2 rounded-2xl font-bold shadow-lg border border-white/20 flex items-center gap-2">
                  <Award size={16} className="text-primary-600" />
                  Premium
                </div>
              </div>

              {/* Wishlist Button */}
              <button 
                onClick={toggleWishlist}
                className="absolute top-8 right-8 w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20 hover:scale-110 active:scale-95 transition-all"
              >
                <Heart 
                  size={24} 
                  className={wishlisted ? "text-red-500 fill-red-500" : "text-neutral-400"} 
                />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative min-w-[100px] h-[100px] rounded-3xl overflow-hidden border-3 transition-all ${
                    selectedImage === i
                      ? "border-primary-500 shadow-md scale-105"
                      : "border-transparent bg-white opacity-60 hover:opacity-100 hover:scale-102"
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: PRODUCT DETAILS (5 Columns) */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-primary-50 text-primary-700 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border border-primary-100">
                  {product.category.name}
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={16} fill="currentColor" />
                  <span className="text-sm font-bold text-neutral-900">{product.ratings}</span>
                  <span className="text-neutral-400 text-xs font-medium">({product.reviewCount} Reviews)</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-poppins font-bold text-neutral-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-end gap-4 py-2">
                <span className="text-5xl font-bold text-gradient">
                  ₹{currentPrice.toLocaleString()}
                </span>
                {currentComparePrice && (
                  <div className="mb-1.5">
                    <span className="line-through text-neutral-400 text-xl font-medium decoration-neutral-300">
                      ₹{currentComparePrice.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
              {/* VARIANTS SELECTION */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-neutral-900 uppercase tracking-wider">Select Pack Size</label>
                    <span className="text-xs font-medium text-neutral-500">Free delivery on 2kg+</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        disabled={v.stock <= 0}
                        onClick={() => setSelectedVariant(v)}
                        className={`group relative p-4 rounded-3xl border-2 transition-all text-center ${
                          selectedVariant?.id === v.id
                            ? "border-primary-500 bg-primary-50/50 shadow-sm"
                            : v.stock <= 0 
                              ? "border-neutral-50 bg-neutral-50 opacity-50 cursor-not-allowed"
                              : "border-neutral-100 bg-white hover:border-primary-200"
                        }`}
                      >
                        <div className={`text-sm font-bold mb-1 ${selectedVariant?.id === v.id ? "text-primary-700" : "text-neutral-900"}`}>
                          {v.weight}
                        </div>
                        <div className={`text-xs font-semibold ${selectedVariant?.id === v.id ? "text-primary-600" : "text-neutral-500"}`}>
                          {v.stock <= 0 ? "Sold Out" : `₹${v.price}`}
                        </div>
                        {selectedVariant?.id === v.id && (
                          <div className="absolute -top-2 -right-2 bg-primary-500 text-white rounded-full p-1 shadow-md">
                            <CheckCircle2 size={12} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* QUANTITY & ADD TO CART */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center justify-between bg-white border-2 border-neutral-100 rounded-3xl p-2 min-w-[140px]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-neutral-50 text-neutral-600 transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="text-lg font-bold text-neutral-900 w-10 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-neutral-50 text-neutral-600 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <button
                  id="main-atc-button"
                  onClick={addToCart}
                  disabled={addingToCart || isOutOfStock}
                  className="flex-1 btn-primary py-5 text-lg shadow-premium flex items-center justify-center gap-3 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none"
                >
                  {addingToCart ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isOutOfStock ? (
                    <span>Currently Out of Stock</span>
                  ) : (
                    <>
                      <ShoppingCart size={22} />
                      <span>Add to Shopping Cart</span>
                    </>
                  )}
                </button>
              </div>

              {/* Bulk Inquiry Button */}
              <button 
                onClick={openBulkInquiry}
                className="w-full py-4 rounded-3xl border-2 border-primary-100 text-primary-700 font-bold flex items-center justify-center gap-2 hover:bg-primary-50 transition-all"
              >
                <Zap size={18} />
                Order in Bulk / Wholesale Inquiry
              </button>

              {cartStatus && (
                <p className="text-center text-error-600 text-sm font-semibold bg-error-50 py-3 rounded-2xl border border-error-100">
                  {cartStatus}
                </p>
              )}
            </div>

            {/* TRUST INDICATORS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-3xl border border-neutral-100 flex items-center gap-4 group hover:border-primary-200 transition-colors">
                <div className="w-12 h-12 bg-success-50 rounded-2xl flex items-center justify-center text-success-600 group-hover:scale-110 transition-transform">
                  <Shield size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 uppercase tracking-tight">Pure & Natural</p>
                  <p className="text-[10px] text-neutral-500 font-medium">No Preservatives</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-neutral-100 flex items-center gap-4 group hover:border-primary-200 transition-colors">
                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                  <Truck size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 uppercase tracking-tight">Express Delivery</p>
                  <p className="text-[10px] text-neutral-500 font-medium">3-5 Business Days</p>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-4 pt-6 border-t border-neutral-100">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Sparkles size={20} className="text-primary-500" />
                Product Details
              </h3>
              <div className="text-neutral-600 leading-relaxed font-medium">
                <ExpandableText text={product.description} clampLines={4} />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTIONS */}
        <div className="mt-24 space-y-24">
          
          {/* RECENTLY VIEWED */}
          {recentlyViewed.length > 0 && (
            <div className="space-y-8">
              <h2 className="text-3xl font-poppins font-bold text-neutral-900">Recently Viewed</h2>
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {recentlyViewed.map((p) => (
                  <Link 
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="min-w-[200px] group"
                  >
                    <div className="aspect-square bg-white rounded-3xl border border-neutral-100 overflow-hidden mb-3 p-4 flex items-center justify-center">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <p className="text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-primary-600">{p.name}</p>
                    <p className="text-xs font-bold text-primary-600">₹{p.price}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* HIGHLIGHTS */}
          {product.highlights.length > 0 && (
            <div className="bg-white rounded-[3rem] p-12 shadow-premium-soft border border-neutral-100">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-poppins font-bold text-neutral-900 mb-8 flex items-center gap-3">
                  <Leaf className="text-success-500" size={32} />
                  Premium Health Benefits
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {product.highlights.map((h, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-all">
                        <CheckCircle2 size={20} />
                      </div>
                      <span className="text-neutral-700 font-semibold leading-relaxed group-hover:text-neutral-900 transition-colors pt-1">
                        {h}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* REVIEWS */}
          <div id="reviews" className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl font-poppins font-bold text-neutral-900 mb-4">
                  Customer Reflections
                </h2>
                <p className="text-neutral-500 font-medium max-w-md">What our community says about their premium makhana experience.</p>
              </div>
              <div className="bg-white px-8 py-4 rounded-3xl border border-neutral-100 shadow-soft flex items-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-neutral-900">{product.ratings}</p>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Rating</p>
                </div>
                <div className="w-px h-10 bg-neutral-100" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-neutral-900">{product.reviewCount}</p>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Reviews</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              {product.reviews.length > 0 ? (
                product.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white p-8 rounded-4xl shadow-soft border border-neutral-100 hover:shadow-premium-soft hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400 font-bold text-xl">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 text-lg">{review.userName}</p>
                          <p className="text-xs font-semibold text-neutral-400">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-neutral-100"}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-neutral-600 leading-relaxed text-lg font-medium italic">"{review.comment}"</p>
                    
                    {isAdmin && (
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="mt-6 text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Remove Review
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-4xl border border-dashed border-neutral-200">
                  <MessageCircle size={48} className="text-neutral-200 mx-auto mb-4" />
                  <p className="text-neutral-400 font-bold">No reflections yet. Be the first to share your experience!</p>
                </div>
              )}
            </div>

            {/* REVIEW FORM */}
            <div className="bg-white p-12 rounded-[3rem] shadow-premium border border-neutral-100">
              <ReviewForm productId={product.id} />
            </div>
          </div>
        </div>
      </div>

      <StoreFooter />

      {/* STICKY QUICK BUY BAR (MOBILE ONLY) */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-neutral-100 p-4 z-50 transition-transform duration-300 shadow-2xl ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">Price</p>
            <p className="text-xl font-bold text-neutral-900 leading-none">₹{currentPrice.toLocaleString()}</p>
          </div>
          <button
            onClick={addToCart}
            disabled={addingToCart || isOutOfStock}
            className="flex-[2] btn-primary py-4 text-sm font-bold flex items-center justify-center gap-2"
          >
            {isOutOfStock ? "Out of Stock" : (
              <>
                <ShoppingCart size={18} />
                <span>Quick Buy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper icons needed but not in first import list
function MessageCircle({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}
