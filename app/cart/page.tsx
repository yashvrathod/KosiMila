"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Truck,
  Shield,
  Tag,
  Check,
  X,
  Gift,
  Info,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import StoreHeader from "@/app/components/store/StoreHeader";
import StoreFooter from "@/app/components/store/StoreFooter";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
  };
  variant?: {
    id: string;
    weight: string;
    price: number;
    stock: number;
  };
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [applying, setApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showCouponList, setShowCouponList] = useState(false);
  const [couponsApplicable, setCouponsApplicable] = useState<any[]>([]);
  const [couponsOthers, setCouponsOthers] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setCartItems(data.cartItems || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCart();
    const saved = typeof window !== "undefined" ? localStorage.getItem("appliedCoupon") : null;
    if (saved) {
      setAppliedCoupon(saved);
      setCouponInput(saved);
      setTimeout(() => {
        void applyCoupon(saved);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyCoupon = async (code?: string) => {
    const couponCode = (code ?? couponInput).trim();
    if (!couponCode) return;
    setApplying(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Invalid coupon");
      setAppliedCoupon(data.couponCode);
      setDiscount(data.discount || 0);
      if (typeof window !== "undefined") localStorage.setItem("appliedCoupon", data.couponCode);
    } catch (e: any) {
      setCouponError(e?.message || "Failed to apply coupon");
      setAppliedCoupon(null);
      setDiscount(0);
      if (typeof window !== "undefined") localStorage.removeItem("appliedCoupon");
    } finally {
      setApplying(false);
    }
  };

  const fetchAvailableCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const res = await fetch("/api/coupons");
      if (!res.ok) throw new Error("Failed to fetch coupons");
      const data = await res.json().catch(() => ({}));
      setCouponsApplicable(Array.isArray(data.applicable) ? data.applicable : []);
      setCouponsOthers(Array.isArray(data.others) ? data.others : []);
    } catch {
      setCouponsApplicable([]);
      setCouponsOthers([]);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponError(null);
    if (typeof window !== "undefined") localStorage.removeItem("appliedCoupon");
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;

    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      return updatedItems;
    });

    if (appliedCoupon) {
      void applyCoupon(appliedCoupon);
    }

    try {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity }),
      });
    } catch {
      void fetchCart();
    }
  };

  const removeItem = async (id: string) => {
    setRemovingItems((prev) => new Set(prev).add(id));

    if (appliedCoupon) {
      void applyCoupon(appliedCoupon);
    }

    try {
      await fetch(`/api/cart?id=${id}`, { method: "DELETE" });
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      void fetchCart();
    } finally {
      setRemovingItems((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.variant ? item.variant.price : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const totalWeight = cartItems.reduce((sum, item) => {
    const weightStr = item.variant?.weight || "0.5kg";
    let kg = 0.5;
    if (weightStr.toLowerCase().includes('kg')) kg = parseFloat(weightStr);
    else if (weightStr.toLowerCase().includes('g')) kg = parseFloat(weightStr) / 1000;
    return sum + (kg * item.quantity);
  }, 0);

  const weightNeededForFree = Math.max(0, 2 - totalWeight);
  const weightProgress = Math.min(100, (totalWeight / 2) * 100);

  const finalTotal = Math.max(0, subtotal - discount);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto" />
          <p className="text-neutral-600 font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center">
  <div className="w-full px-4 sm:px-6 lg:px-8">
    <div className="max-w-lg mx-auto text-center">

      {/* Icon */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 
        bg-gradient-to-br from-primary-100 to-primary-200 
        rounded-full flex items-center justify-center 
        mx-auto mb-6 sm:mb-8 shadow-soft">
        
        <ShoppingBag 
          size={32} 
          className="sm:w-10 sm:h-10 lg:w-14 lg:h-14 text-primary-600" 
        />
      </div>

      {/* Heading */}
      <h1 className="font-poppins text-2xl sm:text-3xl lg:text-4xl 
        font-bold text-neutral-900 mb-3 sm:mb-4">
        Your cart is empty
      </h1>

      {/* Description */}
      <p className="text-base sm:text-lg text-neutral-600 
        mb-6 sm:mb-8 leading-relaxed px-2 sm:px-0">
        Looks like you haven't added any premium makhana to your cart yet.
        Time to explore our delicious collection!
      </p>

      {/* Button */}
      <Link 
        href="/products" 
        className="inline-flex items-center justify-center 
        w-full sm:w-auto 
        btn-primary text-base sm:text-lg 
        px-6 sm:px-8 py-3 sm:py-4">
        
        Start Shopping
        <ArrowRight size={18} className="ml-2 sm:w-5 sm:h-5" />
      </Link>

    </div>
  </div>
</div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBFA]">
      <StoreHeader categories={[]} initialSearch="" />

      {/* ================= HEADER ================= */}
      <div className="bg-white border-b border-neutral-100 py-12">
        <div className="container-premium flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-poppins text-4xl font-bold text-neutral-900 mb-2">
              Your <span className="text-gradient">Cart</span>
            </h1>
            <p className="text-neutral-500 font-medium">
              Review your selection of premium makhana ({cartItems.length} items)
            </p>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 text-primary-600 font-bold hover:gap-3 transition-all">
            <ArrowRight size={20} className="rotate-180" />
            Continue Shopping
          </Link>
        </div>
      </div>

      <div className="container-premium py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* ================= LEFT CONTENT ================= */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* SHIPPING PROGRESS */}
            <div className="bg-white rounded-4xl p-8 shadow-soft border border-neutral-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">Shipping Progress</h3>
                    <p className="text-xs text-neutral-500 font-medium">Outside Pune Delivery</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-neutral-900">{totalWeight.toFixed(1)}kg Total</p>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Cart Weight</p>
                </div>
              </div>

              <div className="relative h-3 bg-neutral-100 rounded-full overflow-hidden mb-4">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-1000 ease-out"
                  style={{ width: `${weightProgress}%` }}
                />
              </div>

              {weightNeededForFree > 0 ? (
                <p className="text-sm font-medium text-neutral-600 flex items-center gap-2">
                  <Sparkles size={16} className="text-primary-500" />
                  Add <span className="font-bold text-primary-600">{weightNeededForFree.toFixed(1)}kg</span> more for <span className="font-bold">FREE SHIPPING</span> outside Pune!
                </p>
              ) : (
                <p className="text-sm font-bold text-success-600 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Congratulations! You've unlocked FREE Shipping!
                </p>
              )}
            </div>

            {/* CART ITEMS */}
            <div className="space-y-4">
              {cartItems.map((item) => {
                const isRemoving = removingItems.has(item.id);
                const itemStock = item.variant ? item.variant.stock : item.product.stock;
                const isLowStock = item.quantity >= itemStock;

                return (
                  <div
                    key={item.id}
                    className={`bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-soft transition-all duration-300 ${
                      isRemoving ? "opacity-50 scale-98" : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-8">
                      {/* Image */}
                      <Link
                        href={`/products/${item.product.id}`}
                        className="w-full sm:w-32 h-32 bg-neutral-50 rounded-[1.5rem] overflow-hidden flex-shrink-0 group"
                      >
                        {item.product.images[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <ShoppingBag size={32} />
                          </div>
                        )}
                      </Link>

                      {/* Details */}
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <Link href={`/products/${item.product.id}`}>
                              <h3 className="font-poppins font-bold text-neutral-900 text-lg hover:text-primary-600 transition-colors">
                                {item.product.name}
                              </h3>
                            </Link>
                            {item.variant && (
                              <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mt-1">
                                Pack: {item.variant.weight}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-neutral-900">
                              ₹{((item.variant ? item.variant.price : item.product.price) * item.quantity).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Subtotal</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                          <div className="flex items-center gap-2 bg-neutral-50 rounded-2xl p-1 border border-neutral-100">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-primary-50 transition-colors disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-bold text-neutral-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= itemStock}
                              className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-primary-50 transition-colors disabled:opacity-50"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="flex items-center gap-2 text-red-400 hover:text-red-600 font-bold text-xs uppercase tracking-widest transition-colors"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= RIGHT SUMMARY ================= */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-neutral-100 sticky top-32">
              <h3 className="font-poppins text-2xl font-bold text-neutral-900 mb-8">Summary</h3>

              {/* Coupon */}
              <div className="space-y-4 mb-8">
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon Code"
                    className="flex-1 bg-neutral-50 border-2 border-neutral-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-primary-500 transition-colors"
                  />
                  {appliedCoupon ? (
                    <button onClick={removeCoupon} className="bg-neutral-900 text-white px-4 rounded-2xl hover:bg-neutral-800 transition-colors"><X size={18}/></button>
                  ) : (
                    <button 
                      onClick={() => applyCoupon()} 
                      disabled={applying || !couponInput.trim()}
                      className="bg-neutral-900 text-white px-6 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all disabled:opacity-50"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {couponError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-2">{couponError}</p>}
                {appliedCoupon && <p className="text-[10px] font-bold text-success-600 uppercase tracking-wider ml-2 flex items-center gap-1"><Check size={12}/> Code {appliedCoupon} Applied!</p>}
              </div>

              {/* Totals */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-neutral-500 font-medium">
                  <span>Subtotal</span>
                  <span className="text-neutral-900 font-bold">₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-success-600 font-medium">
                    <span>Discount</span>
                    <span className="font-bold">-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-neutral-500 font-medium">
                  <span>Shipping</span>
                  <span className="text-success-600 font-bold uppercase text-xs tracking-widest">Calculated Next</span>
                </div>
                <div className="pt-4 border-t border-neutral-100 flex justify-between items-center">
                  <span className="text-lg font-bold text-neutral-900">Estimated Total</span>
                  <span className="text-3xl font-bold text-gradient">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary w-full py-5 text-lg shadow-premium flex items-center justify-center gap-3">
                <span>Secure Checkout</span>
                <ArrowRight size={20} />
              </Link>

              {/* Trust */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center text-center gap-2 p-4 bg-neutral-50 rounded-3xl">
                  <Shield size={20} className="text-success-600" />
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-4 bg-neutral-50 rounded-3xl">
                  <Truck size={20} className="text-primary-600" />
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">Fast Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StoreFooter />
    </div>
  );
}
