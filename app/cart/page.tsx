"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

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
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [applying, setApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showCouponList, setShowCouponList] = useState(false);
  const [couponsApplicable, setCouponsApplicable] = useState<any[]>([]);
  const [couponsOthers, setCouponsOthers] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setCartItems(data.cartItems || []);
      setTotal(data.total || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    void fetchCart();
    // restore applied coupon from localStorage
    const saved = typeof window !== "undefined" ? localStorage.getItem("appliedCoupon") : null;
    if (saved) {
      setAppliedCoupon(saved);
      setCouponInput(saved);
      // attempt to re-apply against current cart after a delay to ensure cart is loaded
      setTimeout(() => {
        void applyCoupon(saved);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyCoupon = async (code?: string) => {
    try { new URL("/api/coupons/apply", window.location.href); } catch { /* env without window */ }

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

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    
    // Optimistic update - update UI immediately
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      );
      
      // Calculate new total based on updated items
      const newTotal = updatedItems.reduce((sum, item) => 
        sum + (item.product.price * item.quantity), 0
      );
      setTotal(newTotal);
      
      return updatedItems;
    });
    
    // Re-validate coupon if applied
    if (appliedCoupon) {
      void applyCoupon(appliedCoupon);
    }
    
    try {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
    } catch {
      // If error, revert by fetching from server
      void fetchCart();
    }
  };

  const removeItem = async (productId: string) => {
    // Optimistic update - remove from UI immediately
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.product.id !== productId);
      
      // Calculate new total
      const newTotal = updatedItems.reduce((sum, item) => 
        sum + (item.product.price * item.quantity), 0
      );
      setTotal(newTotal);
      
      return updatedItems;
    });
    
    // Re-validate coupon if applied
    if (appliedCoupon) {
      void applyCoupon(appliedCoupon);
    }
    
    try {
      await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" });
    } catch {
      // If error, revert by fetching from server
      void fetchCart();
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-premium py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-neutral-400" />
            </div>
            <h1 className="font-poppins text-3xl font-bold text-neutral-900 mb-4">
              Your cart is empty
            </h1>
            <p className="text-neutral-600 mb-8">
              Looks like you haven't added any premium makhana to your cart yet.
            </p>
            <Link href="/products" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-premium py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-poppins text-3xl font-bold text-neutral-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-neutral-600">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {/* Shipping Notice */}
        <div className="card-premium p-6 mb-8 bg-gradient-to-r from-primary-50 to-neutral-50 border-primary-200">
          <h3 className="font-poppins font-semibold text-primary-900 mb-3">
            🚚 Shipping Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-primary-800">
            <div>
              <p className="font-medium mb-2">Pune Delivery</p>
              <p>✅ Free delivery for all Pune orders</p>
            </div>
            <div>
              <p className="font-medium mb-2">Outside Pune</p>
              <p>✅ Free delivery for orders above 2kg</p>
              <p>📞 Shipping charges for orders below 2kg will be discussed at time of order</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-primary-200 text-xs text-primary-700">
            <p>• No Return Policy • No Warranty • Premium Quality Assured</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="card-premium p-6">
                <div className="flex gap-6">
                  
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-neutral-100 rounded-2xl overflow-hidden flex-shrink-0">
                    {item.product.images[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-poppins font-semibold text-neutral-900 mb-2 line-clamp-2">
                      {item.product.name}
                    </h3>
                    <p className="text-2xl font-bold text-primary-600 mb-4">
                      ₹{item.product.price.toLocaleString()}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.product.stock}
                          className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 text-sm"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-premium p-6 sticky top-6">
              <h3 className="font-poppins text-xl font-semibold text-neutral-900 mb-6">
                Order Summary
              </h3>

              {/* Coupon Section */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="input-premium text-sm"
                  />
                  {appliedCoupon ? (
                   <button onClick={removeCoupon} className="btn-ghost px-4 py-3 text-sm">Remove</button>
                 ) : (
                   <>
                     <button 
                       onClick={() => applyCoupon()} 
                       disabled={applying} 
                       className="btn-primary px-4 py-3 text-sm"
                     >
                       {applying ? "..." : "Apply"}
                     </button>
                     <button
                       onClick={() => { setShowCouponList((s) => !s); if (!showCouponList) void fetchAvailableCoupons(); }}
                       className="btn-ghost px-3 py-3 text-sm"
                     >
                       View
                     </button>
                   </>
                 )}
                </div>
                {couponError && <div className="text-red-600 text-sm mt-2">{couponError}</div>}
                {appliedCoupon && !couponError && (
                 <div className="text-success-600 text-sm mt-2">✅ Applied: {appliedCoupon}</div>
               )}

               {showCouponList && (
                 <div className="mt-3 border border-neutral-200 rounded-2xl p-4 bg-neutral-50">
                   <div className="text-sm font-medium mb-3">Available Coupons</div>
                   {loadingCoupons ? (
                     <div className="text-sm text-neutral-600">Loading offers…</div>
                   ) : (
                     <div className="space-y-2 max-h-40 overflow-y-auto">
                       {couponsApplicable.map((c) => (
                         <div key={c.code} className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl p-3">
                           <div>
                             <div className="font-semibold text-sm">{c.code}</div>
                             <div className="text-xs text-neutral-600">{c.description}</div>
                           </div>
                           <button
                             className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                             onClick={() => { setCouponInput(c.code); void applyCoupon(c.code); setShowCouponList(false); }}
                           >
                             Apply
                           </button>
                         </div>
                       ))}
                       {couponsOthers.length > 0 && (
                         <>
                           <div className="text-xs text-neutral-500 mt-3">Other coupons</div>
                           {couponsOthers.map((c) => (
                             <div key={c.code} className="flex items-center justify-between opacity-60 bg-white border border-neutral-200 rounded-xl p-3">
                               <div>
                                 <div className="font-semibold text-sm">{c.code}</div>
                                 <div className="text-xs text-neutral-600">{c.description}</div>
                                 {c.reason && <div className="text-[11px] text-neutral-500">{c.reason}</div>}
                               </div>
                               <button
                                 className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                 onClick={() => { setCouponInput(c.code); void applyCoupon(c.code); setShowCouponList(false); }}
                               >
                                 Try
                               </button>
                             </div>
                           ))}
                         </>
                       )}
                       {couponsApplicable.length === 0 && couponsOthers.length === 0 && (
                         <div className="text-sm text-neutral-600">No coupons available right now.</div>
                       )}
                     </div>
                   )}
                 </div>
               )}
             </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-medium">₹{Math.max(0, total).toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success-600 text-sm">
                    <span>Coupon discount</span>
                    <span className="font-medium">-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Tax</span>
                  <span className="font-medium">₹0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="font-medium text-success-600">FREE*</span>
                </div>
                <div className="border-t border-neutral-200 pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">
                      ₹{Math.max(0, total - discount).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">*Shipping calculated at checkout based on location and weight</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="btn-primary w-full justify-center text-base py-4"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/products"
                  className="btn-secondary w-full justify-center text-base py-4"
                >
                  Add More Items
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
