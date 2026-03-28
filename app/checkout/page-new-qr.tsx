"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Address = {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
};

type CheckoutStep = "address" | "qr-payment" | "success";

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>("address");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
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
    // Fetch cart summary
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
            // ignore
          }
        }
        setDiscount(disc);
        setCartTotal(Math.max(0, st - disc));
      } catch {
        // ignore
      }
    })();
  }, []);

  const isAddressValid = useMemo(() => {
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
    if (!isAddressValid) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: address,
          paymentMethod: "QR_CODE",
          couponCode: appliedCoupon,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to place order");
      }

      setOrderId(data.order.id);
      setOrderNumber(data.order.orderNumber);

      // Generate QR code
      const qrRes = await fetch(`/api/orders/${data.order.id}/generate-qr`, {
        method: "POST",
      });

      const qrData = await qrRes.json();
      if (qrRes.ok) {
        setQrCodeData(qrData.upiString);
      }

      setStep("qr-payment");
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    if (!orderId) return;

    setConfirmingPayment(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to confirm payment");
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("appliedCoupon");
      }

      setStep("success");
      setTimeout(() => {
        router.replace(`/order-success/${orderId}`);
      }, 2000);
    } catch (e: any) {
      setError(e?.message || "Failed to confirm payment");
    } finally {
      setConfirmingPayment(false);
    }
  };

  // Step 1: Address Entry
  if (step === "address") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-400 to-amber-400 p-6">
              <h2 className="text-2xl font-bold text-white">Delivery Details</h2>
              <p className="text-orange-100 text-sm mt-1">Where should we deliver?</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Full Name *</label>
                  <input 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 focus:border-orange-400 transition-all"
                    value={address.name} 
                    onChange={(e) => setAddress({...address, name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Phone Number *</label>
                  <input 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 focus:border-orange-400 transition-all"
                    value={address.phone} 
                    onChange={(e) => setAddress({...address, phone: e.target.value})}
                    placeholder="10-digit phone number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Address Line 1 *</label>
                  <input 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 focus:border-orange-400 transition-all"
                    value={address.addressLine1} 
                    onChange={(e) => setAddress({...address, addressLine1: e.target.value})}
                    placeholder="Street address, building number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Address Line 2 (Optional)</label>
                  <input 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 focus:border-orange-400 transition-all"
                    value={address.addressLine2} 
                    onChange={(e) => setAddress({...address, addressLine2: e.target.value})}
                    placeholder="Apartment, suite, etc."
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">City *</label>
                  <input 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 focus:border-orange-400 transition-all"
                    value={address.city} 
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">State *</label>
                  <input 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 focus:border-orange-400 transition-all"
                    value={address.state} 
                    onChange={(e) => setAddress({...address, state: e.target.value})}
                    placeholder="State"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Pincode *</label>
                  <input 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 focus:border-orange-400 transition-all"
                    value={address.pincode} 
                    onChange={(e) => setAddress({...address, pincode: e.target.value})}
                    placeholder="6-digit pincode"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
                  {error}
                </div>
              )}

              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount {appliedCoupon && `(${appliedCoupon})`}:</span>
                      <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-orange-200 pt-2 mt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-orange-600">₹{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={placeOrder}
                disabled={!isAddressValid || loading}
                className="w-full py-4 bg-gradient-to-r from-orange-400 to-amber-400 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? "Creating Order..." : "Proceed to Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: QR Code Payment
  if (step === "qr-payment") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-8 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden text-center p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-3xl">📱</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Pay!</h2>
            <p className="text-gray-600 mb-6">
              Scan with any UPI app to complete payment
            </p>

            <div className="bg-gray-100 rounded-2xl p-6 mb-6 aspect-square flex items-center justify-center">
              {qrCodeData ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">UPI QR Code</p>
                  <div className="bg-white p-3 rounded inline-block">
                    <p className="text-xs text-gray-500 font-mono break-all max-w-xs">{qrCodeData.substring(0, 30)}...</p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">Generating QR...</div>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Amount: <span className="font-bold text-lg text-orange-600">₹{cartTotal.toFixed(2)}</span>
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
              💡 Use Google Pay, PhonePe, WhatsApp Pay or any UPI app to scan and pay
            </div>

            <button 
              onClick={confirmPayment}
              disabled={confirmingPayment}
              className="w-full py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all mb-3"
            >
              {confirmingPayment ? "Confirming..." : "✓ Payment Done, Confirm"}
            </button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Success
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-xl border border-green-200 overflow-hidden p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-3xl">✓</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your order has been placed successfully.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-800">Order: <span className="font-mono font-bold">{orderNumber}</span></p>
            </div>

            <p className="text-gray-600 text-sm">Redirecting to order tracking...</p>
          </div>
        </div>
      </div>
    );
  }
}
