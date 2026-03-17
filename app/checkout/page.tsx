"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Truck, Shield, CheckCircle2, Sparkles, ArrowRight, User, Phone, MapPin, Package, Gift } from "lucide-react";

type Address = {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [address, setAddress] = useState<Address>({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    // Fetch cart summary and compute totals with stored coupon
    (async () => {
      try {
        const res = await fetch("/api/cart");
        const data = await res.json();
        const st = data.total || 0;
        setSubtotal(st);

        const saved = typeof window !== "undefined" ? localStorage.getItem("appliedCoupon") : null;
        setAppliedCoupon(saved);

        let disc = 0;
        if (saved) {
          try {
            const applyRes = await fetch("/api/coupons/apply", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ couponCode: saved }),
            });
            const applyData = await applyRes.json();
            if (applyRes.ok) {
              disc = applyData.discount || 0;
            }
          } catch {
            // ignore coupon errors
          }
        }
        setDiscount(disc);
        setCartTotal(Math.max(0, st - disc));
      } catch {
        // ignore
      }
    })();
  }, []);

  const valid = useMemo(() => {
    return (
      address.name.trim() !== "" &&
      address.phone.trim() !== "" &&
      address.addressLine1.trim() !== "" &&
      address.city.trim() !== "" &&
      address.state.trim() !== "" &&
      address.pincode.trim() !== "" &&
      cartTotal > 0
    );
  }, [address, cartTotal]);

  const placeOrder = async () => {
    if (!valid) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: address,
          paymentMethod: "COD",
          couponCode: appliedCoupon,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to place order");
      }
      const orderId: string = data.order.id;
      router.replace(`/order-success/${orderId}`);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Kosimila Checkout
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Secure Checkout</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <Truck className="w-4 h-4" />
                <span>Free Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center space-x-4 mb-12">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">1</span>
            </div>
            <span className="ml-3 font-medium text-gray-900">Cart</span>
          </div>
          <div className="w-12 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400"></div>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">2</span>
            </div>
            <span className="ml-3 font-medium text-gray-900">Address</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className="flex items-center opacity-50">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">3</span>
            </div>
            <span className="ml-3 font-medium text-gray-500">Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Address Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-orange-400 to-amber-400 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Delivery Details</h2>
                    <p className="text-orange-100 text-sm">Where should we deliver your premium makhana?</p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <User className="w-4 h-4" />
                      <span>Full Name</span>
                    </label>
                    <input 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-gray-900 placeholder-gray-400"
                      value={address.name} 
                      onChange={(e)=>setAddress({...address, name: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Phone className="w-4 h-4" />
                      <span>Mobile Number</span>
                    </label>
                    <input 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-gray-900 placeholder-gray-400"
                      value={address.phone} 
                      onChange={(e)=>setAddress({...address, phone: e.target.value})} 
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <span>Address Line 1</span>
                    </label>
                    <input 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-gray-900 placeholder-gray-400"
                      value={address.addressLine1} 
                      onChange={(e)=>setAddress({...address, addressLine1: e.target.value})} 
                      placeholder="Street address, house number, etc."
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <span>Address Line 2 (Optional)</span>
                    </label>
                    <input 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-gray-900 placeholder-gray-400"
                      value={address.addressLine2} 
                      onChange={(e)=>setAddress({...address, addressLine2: e.target.value})} 
                      placeholder="Apartment, suite, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <span>City</span>
                    </label>
                    <input 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-gray-900 placeholder-gray-400"
                      value={address.city} 
                      onChange={(e)=>setAddress({...address, city: e.target.value})} 
                      placeholder="Your city"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <span>State</span>
                    </label>
                    <input 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-gray-900 placeholder-gray-400"
                      value={address.state} 
                      onChange={(e)=>setAddress({...address, state: e.target.value})} 
                      placeholder="Your state"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <span>Pincode</span>
                    </label>
                    <input 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-gray-900 placeholder-gray-400"
                      value={address.pincode} 
                      onChange={(e)=>setAddress({...address, pincode: e.target.value})} 
                      placeholder="6-digit pincode"
                    />
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-full">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Secure</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-full">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Fast Delivery</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-purple-50 rounded-full">
                    <Gift className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Premium Quality</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden sticky top-24">
              {/* Summary Header */}
              <div className="bg-gradient-to-br from-amber-400 to-orange-400 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Order Summary</h2>
                    <p className="text-amber-100 text-sm">Premium makhana selection</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Summary Content */}
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="text-xl font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 font-medium flex items-center">
                        <Gift className="w-4 h-4 mr-2" />
                        Discount
                      </span>
                      <span className="text-xl font-bold text-green-600">-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Tax</span>
                    <span className="text-xl font-bold text-gray-900">₹0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Shipping</span>
                    <span className="text-xl font-bold text-green-600">FREE</span>
                  </div>
                  <div className="border-t-2 border-gray-100 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                          ₹{cartTotal.toLocaleString()}
                        </span>
                        <Sparkles className="w-6 h-6 text-amber-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="space-y-4">
                  <button
                    disabled={!valid || loading}
                    onClick={placeOrder}
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center justify-center space-x-2">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Place Order</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </span>
                  </button>
                  
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600 flex items-center justify-center">
                      <Shield className="w-4 h-4 mr-2 text-green-600" />
                      100% Secure Checkout
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                      <span>📞 6202058021</span>
                      <span>•</span>
                      <span>📧 kosimila@gmail.com</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
