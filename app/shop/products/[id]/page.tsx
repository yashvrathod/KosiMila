// src/app/(shop)/products/[id]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import ExpandableText from "@/app/components/ExpandableText";
import ReviewForm from "@/app/components/ReviewForm";
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

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
  highlights: string[];
  specifications?: Record<string, unknown>;
  category: {
    name: string;
    slug: string;
  };
  reviews: Review[];
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified: boolean;
}

/* eslint-disable react-hooks/set-state-in-effect */

function DescriptionStyles_REMOVED() {
  return (
    <style jsx>{`
      .desc-clamp { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
    `}</style>
  );
}

function DescriptionBlock_REMOVED({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const pRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const el = pRef.current; if (!el) return;
    const had = el.classList.contains("desc-clamp");
    if (!had && !expanded) el.classList.add("desc-clamp");
    requestAnimationFrame(() => {
      try {
        const over = el.scrollHeight > el.clientHeight + 2;
        setCanExpand(over);
      } finally {
        if (!had && !expanded) el.classList.remove("desc-clamp");
      }
    });
  }, [text, expanded]);

  const content = (text || "").trim();

  return (
    <div className="relative">
      <p ref={pRef} className={`text-gray-700 leading-relaxed ${!expanded ? "desc-clamp" : ""}`}>{content}</p>
      {canExpand && !expanded && (
        <button type="button" onClick={() => setExpanded(true)} className="absolute right-0 bottom-0 bg-white pl-1 text-blue-600 hover:text-blue-700 font-medium" aria-label="See more">… See more</button>
      )}
      {canExpand && expanded && (
        <button type="button" onClick={() => setExpanded(false)} className="mt-2 text-blue-600 hover:text-blue-700 font-medium">Show less</button>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartStatus, setCartStatus] = useState<string | null>(null);
  const router = useRouter();

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${params.id}`);
      const data = await res.json();
      setProduct(data.product);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch product");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // Check if user is admin
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


  const addToCart = async () => {
    console.log("[Shop/AddToCart] clicked", { productId: product?.id, quantity });
    setCartStatus(null);
    if (!product?.id) return;
    setAddingToCart(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      if (res.status === 401) {
        setCartStatus("Please login to add items to your cart.");
        window.location.assign(`/login?redirect=/shop/products/${params.id}`);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("[Shop/AddToCart] server error", data);
        setCartStatus((data?.error as string) || "Failed to add to cart. Please try again.");
        return;
      }
      router.push("/cart");
    } catch (error) {
      console.error("[Shop/AddToCart] network error", error);
      setCartStatus("Something went wrong. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const [wishlisted, setWishlisted] = useState(false);
  const [checkingWishlist, setCheckingWishlist] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!params.id) return;
      try {
        const res = await fetch("/api/wishlist", { credentials: "include" });
        if (!res.ok) return; // ignore if not logged in
        const data = await res.json().catch(() => ({}));
        const items: { wishlistItems?: { productId: string }[] } = data || {};
        const has = !!items.wishlistItems?.some((it) => it.productId === params.id);
        if (active) setWishlisted(has);
      } catch {}
      finally {
        if (active) setCheckingWishlist(false);
      }
    })();
    return () => { active = false; };
  }, [params.id]);

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    setDeletingReviewId(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (res.ok) {
        // Refresh product data to show updated reviews
        await fetchProduct();
      } else {
        alert("Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("An error occurred while deleting the review");
    } finally {
      setDeletingReviewId(null);
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
          window.location.assign(`/login?redirect=/shop/products/${params.id}`);
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert((data?.error as string) || "Failed to add to wishlist");
          return;
        }
        setWishlisted(true);
      } else {
        const res = await fetch(`/api/wishlist?productId=${product.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.status === 401) {
          window.location.assign(`/login?redirect=/shop/products/${params.id}`);
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert((data?.error as string) || "Failed to remove from wishlist");
          return;
        }
        setWishlisted(false);
      }
    } catch (error) {
      console.error("Failed to toggle wishlist", error);
      alert("Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        </div>
      </div>
    );
  }

  const discount = product.comparePrice
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-8 bg-white rounded-lg p-8 mb-8">
          
          {/* Image Gallery */}
          <div>
            <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden">
              {product.images[selectedImage] && (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-[500px] object-contain"
                />
              )}
            </div>
            <div className="grid grid-cols-6 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`border-2 rounded overflow-hidden ${
                    selectedImage === index
                      ? "border-blue-600"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-2">
              <span className="text-gray-500">{product.category.name}</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded">
                <span className="font-semibold">{product.ratings}</span>
                <Star size={16} fill="white" />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-green-600">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.comparePrice && (
                  <>
                    <span className="text-2xl text-gray-400 line-through">
                      ₹{product.comparePrice.toLocaleString()}
                    </span>
                    <span className="text-xl text-green-600 font-semibold">
                      {discount}% off
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="mb-6 border-t border-b py-4">
              <h3 className="font-semibold mb-3">Available offers</h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-start gap-2">
                  <span className="text-green-600 font-semibold">●</span>
                  <span>
                    Bank Offer: 5% Unlimited Cashback on Flipkart Axis Bank
                    Credit Card
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600 font-semibold">●</span>
                  <span>
                    Special Price: Get extra 10% off (price inclusive of
                    discount)
                  </span>
                </p>
              </div>
            </div>

            {/* Product Options */}
            <div className="mb-6 space-y-4">
              {/* Size selector */}
              <div>
                <div className="mb-2 font-semibold">Size</div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-2 rounded-lg border-2 border-orange-500 text-orange-700 font-medium bg-orange-50"
                    aria-pressed="true"
                  >
                    {product?.category?.slug === 'signature-ladoo' 
                      ? 'Box of 15 Makhana (500 g)' 
                      : 'Box of 15 Makhana (200 g)'}
                  </button>
                </div>
              </div>

              {/* Quantity selector */}
              <div>
                <label className="mb-2 block font-semibold" htmlFor="quantity-select">Quantity</label>
                <div className="flex items-center gap-3">
                  <select
                    id="quantity-select"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
              </div>

             {/* Ratings & reviews summary (simple) */}
             <div className="mt-2 text-sm text-gray-600">
               {product.reviewCount} ratings & reviews
             </div>

              {/* Policy and offer information */}
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-2 text-sm text-gray-700">
                <p>Free delivery is available within Pune, while customers outside Pune can enjoy free delivery on orders above 2 kg.</p>
                <p>An extra quantity offer may be available on select orders, adding additional value to your purchase.</p>
                <p>Please note that this product comes with a no return policy and no warranty, ensuring full transparency before checkout.</p>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={addToCart}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-orange-600 text-orange-700 py-3 rounded-lg font-semibold hover:bg-orange-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={addingToCart}
                >
                  <ShoppingCart size={20} />
                  ADD TO CART
                </button>
                <button
                  onClick={toggleWishlist}
                  className={`flex items-center justify-center gap-2 border-2 py-3 px-6 rounded-lg font-semibold transition ${wishlisted ? "border-red-200 text-red-600 bg-red-50" : "border-gray-300 hover:border-red-500 hover:text-red-500"}`}
                  aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={20} className={wishlisted ? "text-red-600" : undefined} fill={wishlisted ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            {/* Policies */}
            <div className="border-t pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="text-gray-600" size={20} />
                  <span>Free delivery for Pune</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RotateCcw className="text-gray-600" size={20} />
                  <span>No Return Policy</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="text-gray-600" size={20} />
                  <span>No Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights */}
        {product.highlights.length > 0 && (
          <div className="bg-white rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Highlights</h2>
            <ul className="space-y-2">
              {product.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">●</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Description */}
        <div className="bg-white rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Product Description</h2>
          <ExpandableText text={product.description} clampLines={4} />
        </div>

        {/* Specifications */}
        {product.specifications && (
          <div className="bg-white rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Specifications</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex border-b py-3">
                  <span className="font-semibold w-1/3">{key}</span>
                  <span className="text-gray-700 w-2/3">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div id="reviews" className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-1 bg-green-600 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-900">Ratings & Reviews</h2>
          </div>

          {product.reviews.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((review, index) => (
                <div 
                  key={review.id} 
                  className="bg-white rounded-lg p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
                >
                  {/* Header Section */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${
                        ['bg-gradient-to-br from-blue-400 to-blue-600',
                         'bg-gradient-to-br from-purple-400 to-purple-600',
                         'bg-gradient-to-br from-pink-400 to-pink-600',
                         'bg-gradient-to-br from-orange-400 to-orange-600',
                         'bg-gradient-to-br from-teal-400 to-teal-600',
                         'bg-gradient-to-br from-indigo-400 to-indigo-600',
                         'bg-gradient-to-br from-red-400 to-red-600',
                         'bg-gradient-to-br from-green-400 to-green-600'][index % 8]
                      }`}>
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* User Info & Rating */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{review.userName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                              {review.rating}.0
                            </span>
                          </div>
                        </div>
                        {review.verified && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-3 py-1.5 rounded-full border border-green-200">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(review.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Review Comment */}
                  <div className="pl-0 md:pl-16">
                    <p className="text-gray-700 leading-relaxed text-base">
                      {review.comment}
                    </p>
                    
                    {/* Admin Delete Button */}
                    {isAdmin && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => deleteReview(review.id)}
                          disabled={deletingReviewId === review.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {deletingReviewId === review.id ? "Deleting..." : "Delete Review (Admin)"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Star size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500">Be the first to share your experience with this product!</p>
            </div>
          )}
        </div>

        {/* Review Form */}
        <ReviewForm productId={product.id} />

      </div>
    </div>
  );
}
