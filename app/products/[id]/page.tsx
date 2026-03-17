"use client";

import { useEffect, useState, useRef } from "react";
import ExpandableText from "@/app/components/ExpandableText";
import ReviewForm from "@/app/components/ReviewForm";
import { Heart, RotateCcw, Shield, ShoppingCart, Star, Truck } from "lucide-react";
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

// Description moved to shared ExpandableText component
function DescriptionStyles_REMOVED() {
  return (
    <style jsx>{`
      .desc-clamp {
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `}</style>
  );
}

function DescriptionBlock_REMOVED({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const pRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    // Check if content overflows when collapsed
    const el = pRef.current;
    if (!el) return;
    // Temporarily ensure clamp is applied for measurement
    const hadClass = el.classList.contains("desc-clamp");
    if (!hadClass && !expanded) el.classList.add("desc-clamp");
    requestAnimationFrame(() => {
      try {
        const overflows = el.scrollHeight > el.clientHeight + 2; // tolerance
        setCanExpand(overflows);
      } finally {
        if (!hadClass && !expanded) el.classList.remove("desc-clamp");
      }
    });
  }, [text, expanded]);

  const content = (text || "").trim();

  return (
    <div className="relative">
      <p
        ref={pRef}
        className={`text-gray-700 leading-relaxed ${!expanded ? "desc-clamp" : ""}`}
      >
        {content}
      </p>

      {/* Inline-style "… See more" placed at the end when collapsed */}
      {canExpand && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="absolute right-0 bottom-0 bg-white pl-1 text-primary-600 hover:text-primary-700 font-medium"
          aria-label="See more"
        >
          … See more
        </button>
      )}

      {/* Show less control when expanded */}
      {canExpand && expanded && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          Show less
        </button>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
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
    } catch {
      setProduct(null);
    } finally {
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
    console.log("[AddToCart] clicked", { productId: product?.id, quantity });
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
        window.location.assign(`/login?redirect=/products/${params.id}`);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("[AddToCart] server error", data);
        setCartStatus((data?.error as string) || "Failed to add to cart. Please try again.");
        return;
      }
      router.push("/cart");
    } catch (e) {
      alert("Something went wrong. Please try again.");
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
        if (!res.ok) return; // ignore auth errors; user might be logged out
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
          window.location.assign(`/login?redirect=/products/${params.id}`);
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
          window.location.assign(`/login?redirect=/products/${params.id}`);
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert((data?.error as string) || "Failed to remove from wishlist");
          return;
        }
        setWishlisted(false);
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
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
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
 <div className="min-h-screen bg-[#FAF7F2]">
  <div className="max-w-7xl mx-auto px-4 py-10">

    {/* ================= PRODUCT SECTION ================= */}
    <div className="grid md:grid-cols-2 gap-12 items-start">

      {/* ===== LEFT: IMAGES ===== */}
      <div className="space-y-4">
        <div className="rounded-2xl overflow-hidden bg-white shadow-lg p-4">
          <img
            src={product.images[selectedImage]}
            alt={product.name}
            className="w-full h-[420px] object-contain rounded-xl"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto">
          {product.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`min-w-[70px] h-[70px] rounded-lg overflow-hidden border-2 transition ${
                selectedImage === i
                  ? "border-[#C8A24D]"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={img} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* ===== RIGHT: PRODUCT INFO ===== */}
      <div className="sticky top-24 space-y-6">

        {/* CATEGORY */}
        <span className="text-sm text-[#C8A24D] font-medium tracking-wide uppercase">
          {product.category.name}
        </span>

        {/* TITLE */}
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2F2418] leading-tight">
          {product.name}
        </h1>

        {/* DESCRIPTION */}
        <div className="text-gray-600 text-[15px] leading-relaxed">
          <ExpandableText text={product.description} clampLines={3} />
        </div>

        {/* RATING */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#C8A24D] text-white px-3 py-1 rounded-full text-sm">
            {product.ratings}
            <Star size={14} fill="white" />
          </div>
          <span className="text-sm text-gray-500">
            {product.reviewCount} reviews
          </span>
        </div>

        {/* PRICE */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-[#2F2418]">
              ₹{product.price.toLocaleString()}
            </span>

            {product.comparePrice && (
              <span className="line-through text-gray-400 text-lg">
                ₹{product.comparePrice.toLocaleString()}
              </span>
            )}
          </div>

          {product.comparePrice && (
            <span className="text-green-600 font-medium text-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* SIZE */}
        <div>
          <p className="font-medium mb-2">Size</p>
          <button className="px-4 py-2 rounded-full bg-[#F3EAD8] text-[#2F2418] border border-[#E6D3A3]">
            Box of 15 Makhana (500g)
          </button>
        </div>

        {/* QUANTITY */}
        <div>
          <p className="font-medium mb-2">Quantity</p>
          <select
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="border rounded-lg px-4 py-2"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((q) => (
              <option key={q}>{q}</option>
            ))}
          </select>
        </div>

        {/* CTA BUTTONS */}
        <div className="flex gap-4 pt-2">

          <button
            onClick={addToCart}
            className="flex-1 bg-[#C8A24D] hover:bg-[#B8963D] text-white py-3 rounded-full font-semibold shadow-md transition"
          >
            Add to Cart
          </button>

          <button
            onClick={toggleWishlist}
            className="w-12 h-12 flex items-center justify-center rounded-full border hover:bg-red-50 transition"
          >
            <Heart
              size={20}
              className={wishlisted ? "text-red-500" : ""}
              fill={wishlisted ? "currentColor" : "none"}
            />
          </button>
        </div>

        {/* TRUST BADGES */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Truck size={18} /> Free delivery (Pune)
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw size={18} /> No returns
          </div>
          <div className="flex items-center gap-2">
            <Shield size={18} /> Freshly made
          </div>
        </div>
      </div>
    </div>

    {/* ================= HIGHLIGHTS ================= */}
    {product.highlights.length > 0 && (
      <div className="mt-14 bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-serif font-bold mb-6">Why You'll Love It</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {product.highlights.map((h, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-[#C8A24D]">●</span>
              <span>{h}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* ================= REVIEWS ================= */}
    <div className="mt-14">
      <h2 className="text-2xl font-serif font-bold mb-6">
        Customer Love ❤️
      </h2>

      <div className="grid gap-5">
        {product.reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between mb-2">
              <span className="font-semibold">{review.userName}</span>
              <span className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < review.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>

            <p className="text-gray-700 text-sm">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>

    {/* REVIEW FORM */}
    <div className="mt-12">
      <ReviewForm productId={product.id} />
    </div>

  </div>
</div>
  );
}
