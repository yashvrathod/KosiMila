"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Package, 
  CheckCircle2, 
  Loader, 
  Shield, 
  Truck, 
  Gift, 
  Sparkles, 
  ArrowRight,
  Plus,
  Check,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import StoreHeader from "../components/store/StoreHeader";
import StoreFooter from "../components/store/StoreFooter";

type Address = {
  id?: string;
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
  
  const [user, setUser] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [saveThisAddress, setSaveThisAddress] = useState(false);
  
  // Luxury Features
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState("");

  const [address, setAddress] = useState<Address>({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [serviceable, setServiceable] = useState<boolean | null>(null);
  const [serviceabilityMsg, setServiceabilityMsg] = useState<string | null>(null);
  const [checkingServiceability, setCheckingServiceability] = useState(false);

  useEffect(() => {
    // Fetch user and addresses
    (async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const { user } = await meRes.json();
          setUser(user);
          
          const addrRes = await fetch("/api/addresses");
          if (addrRes.ok) {
            const { addresses } = await addrRes.json();
            setSavedAddresses(addresses);
            if (addresses.length > 0) {
              setSelectedAddressId(addresses[0].id);
              setAddress(addresses[0]);
              checkServiceability(addresses[0].pincode);
            }
          }
        }
      } catch (err) {
        console.error("Auth/Address fetch failed", err);
      }
    })();

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

  const checkServiceability = async (pincode: string) => {
    if (pincode.length < 6) {
      setServiceable(null);
      setServiceabilityMsg(null);
      return;
    }
    
    setCheckingServiceability(true);
    try {
      const res = await fetch(`/api/serviceability?pincode=${pincode}`);
      const data = await res.json();
      if (res.ok) {
        setServiceable(data.serviceable);
        setServiceabilityMsg(data.reason || null);
      }
    } catch (err) {
      console.error("Serviceability check failed", err);
    } finally {
      setCheckingServiceability(false);
    }
  };

  // Debounced pincode check
  useEffect(() => {
    if (selectedAddressId === "new" && address.pincode.length === 6) {
      const timer = setTimeout(() => {
        checkServiceability(address.pincode);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [address.pincode, selectedAddressId]);

  const handleAddressSelect = (addr: Address | "new") => {
    if (addr === "new") {
      setSelectedAddressId("new");
      setAddress({
        name: user?.name || "",
        phone: user?.phone || "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
      });
      setServiceable(null);
    } else {
      setSelectedAddressId(addr.id!);
      setAddress(addr);
      checkServiceability(addr.pincode);
    }
  };

  const valid = useMemo(() => {
    return (
      address.name.trim() !== "" &&
      address.phone.trim() !== "" &&
      address.addressLine1.trim() !== "" &&
      address.city.trim() !== "" &&
      address.state.trim() !== "" &&
      address.pincode.trim() !== "" &&
      serviceable !== false &&
      cartTotal > 0
    );
  }, [address, cartTotal, serviceable]);

  const placeOrder = async () => {
    if (!valid) return;

    setLoading(true);
    setError(null);

    try {
      // If new address and "save" is checked
      if (selectedAddressId === "new" && saveThisAddress && user) {
        await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(address),
        });
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: address,
          paymentMethod: "COD",
          couponCode: appliedCoupon,
          notes: isGift ? giftNote : undefined,
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
    <div className="min-h-screen bg-neutral-50">
      <StoreHeader categories={[]} initialSearch="" />
      
      <div className="container-premium py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            <div className="bg-white rounded-4xl shadow-soft border border-neutral-100 overflow-hidden">
              <div className="bg-primary-600 p-8 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold font-poppins">Delivery Address</h1>
                    <p className="text-primary-100">Where should we send your premium makhana?</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Saved Addresses */}
                {user && savedAddresses.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Saved Addresses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedAddresses.map((addr) => (
                        <div 
                          key={addr.id}
                          onClick={() => handleAddressSelect(addr)}
                          className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                            selectedAddressId === addr.id 
                            ? "border-primary-500 bg-primary-50/50" 
                            : "border-neutral-100 hover:border-primary-200"
                          }`}
                        >
                          {selectedAddressId === addr.id && (
                            <div className="absolute top-4 right-4 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                              <Check className="text-white" size={14} />
                            </div>
                          )}
                          <p className="font-bold text-neutral-900 mb-1">{addr.name}</p>
                          <p className="text-sm text-neutral-600 mb-2">{addr.phone}</p>
                          <p className="text-sm text-neutral-500 line-clamp-2">
                            {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                      ))}
                      <div 
                        onClick={() => handleAddressSelect("new")}
                        className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          selectedAddressId === "new" 
                          ? "border-primary-500 bg-primary-50/50 text-primary-600" 
                          : "border-neutral-200 text-neutral-500 hover:border-primary-300"
                        }`}
                      >
                        <Plus size={20} />
                        <span className="font-medium">Add New Address</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Address Form */}
                <div className={`space-y-6 transition-all duration-300 ${selectedAddressId !== "new" && user ? "opacity-50 pointer-events-none" : ""}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-700 ml-1">Full Name</label>
                      <input 
                        className="input-premium"
                        value={address.name} 
                        onChange={(e)=>setAddress({...address, name: e.target.value})}
                        placeholder="Receiver's name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-700 ml-1">Mobile Number</label>
                      <input 
                        className="input-premium"
                        value={address.phone} 
                        onChange={(e)=>setAddress({...address, phone: e.target.value})} 
                        placeholder="10-digit number"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-semibold text-neutral-700 ml-1">Flat / House / Apartment</label>
                      <input 
                        className="input-premium"
                        value={address.addressLine1} 
                        onChange={(e)=>setAddress({...address, addressLine1: e.target.value})} 
                        placeholder="Address Line 1"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-semibold text-neutral-700 ml-1">Area / Sector / Locality (Optional)</label>
                      <input 
                        className="input-premium"
                        value={address.addressLine2} 
                        onChange={(e)=>setAddress({...address, addressLine2: e.target.value})} 
                        placeholder="Address Line 2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-700 ml-1">City</label>
                      <input 
                        className="input-premium"
                        value={address.city} 
                        onChange={(e)=>setAddress({...address, city: e.target.value})} 
                        placeholder="Your city"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-700 ml-1">State</label>
                      <input 
                        className="input-premium"
                        value={address.state} 
                        onChange={(e)=>setAddress({...address, state: e.target.value})} 
                        placeholder="Your state"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-700 ml-1">Pincode</label>
                      <div className="relative">
                        <input 
                          className={`input-premium pr-10 ${
                            serviceable === false ? "border-red-300 bg-red-50 focus:ring-red-200" : 
                            serviceable === true ? "border-green-300 bg-green-50 focus:ring-green-200" : ""
                          }`}
                          value={address.pincode} 
                          onChange={(e)=>setAddress({...address, pincode: e.target.value})} 
                          placeholder="6-digit pincode"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {checkingServiceability ? (
                            <Loader className="animate-spin text-primary-500" size={18} />
                          ) : serviceable === true ? (
                            <CheckCircle2 className="text-success-500" size={18} />
                          ) : serviceable === false ? (
                            <AlertCircle className="text-error-500" size={18} />
                          ) : null}
                        </div>
                      </div>
                      {serviceable === false && (
                        <p className="text-xs font-medium text-error-600 mt-1 ml-1">
                          {serviceabilityMsg || "Sorry, we are not delivering to this location."}
                        </p>
                      )}
                    </div>
                  </div>

                  {user && selectedAddressId === "new" && (
                    <div className="flex items-center gap-3 mt-6 ml-1">
                      <input 
                        type="checkbox"
                        id="saveAddress"
                        className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        checked={saveThisAddress}
                        onChange={(e) => setSaveThisAddress(e.target.checked)}
                      />
                      <label htmlFor="saveAddress" className="text-sm font-medium text-neutral-700">
                        Save this address for future use
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Premium Gift Options */}
            <div className="bg-white rounded-4xl shadow-soft border border-neutral-100 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                      <Gift size={24} />
                    </div>
                    <div>
                      <h3 className="font-poppins text-lg font-bold text-neutral-900">Premium Gift Options</h3>
                      <p className="text-sm text-neutral-500 font-medium">Add a personal touch to your order</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isGift}
                      onChange={(e) => setIsGift(e.target.checked)}
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {isGift && (
                  <div className="space-y-4 animate-slide-down">
                    <div className="relative">
                      <div className="absolute left-4 top-4 text-primary-400">
                        <MessageSquare size={20} />
                      </div>
                      <textarea 
                        className="input-premium pl-12 min-h-[120px] pt-4"
                        placeholder="Write a heartfelt gift note for your loved ones..."
                        value={giftNote}
                        onChange={(e) => setGiftNote(e.target.value)}
                        maxLength={250}
                      />
                      <div className="absolute bottom-4 right-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        {giftNote.length}/250
                      </div>
                    </div>
                    <div className="bg-primary-50 p-4 rounded-2xl border border-primary-100 flex items-start gap-3">
                      <Sparkles className="text-primary-500 shrink-0" size={16} />
                      <p className="text-xs text-primary-800 font-medium">
                        Your message will be printed on a luxury card and included with the premium packaging.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method (Static for now) */}
            <div className="bg-white rounded-4xl shadow-soft border border-neutral-100 p-8">
              <h3 className="font-poppins text-lg font-bold text-neutral-900 mb-6">Payment Method</h3>
              <div className="p-5 rounded-2xl border-2 border-primary-500 bg-primary-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-soft">
                    <Truck className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">Cash on Delivery</p>
                    <p className="text-sm text-neutral-600">Pay when your order arrives</p>
                  </div>
                </div>
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                  <Check className="text-white" size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-4xl shadow-soft border border-neutral-100 overflow-hidden sticky top-32">
              <div className="p-8 border-b border-neutral-100">
                <h2 className="font-poppins text-xl font-bold text-neutral-900 mb-1">Order Summary</h2>
                <p className="text-sm text-neutral-500">Premium makhana collection</p>
              </div>

              <div className="p-8 space-y-4">
                <div className="flex justify-between items-center text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-900">₹{subtotal.toLocaleString()}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between items-center text-success-600">
                    <span className="flex items-center gap-2">
                      <Gift size={16} />
                      Coupon Discount
                    </span>
                    <span className="font-bold">-₹{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-neutral-600">
                  <span>Shipping</span>
                  <span className="font-bold text-success-600 uppercase">Free</span>
                </div>

                <div className="pt-4 border-t border-neutral-100">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-neutral-900">Total Payable</span>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gradient">₹{cartTotal.toLocaleString()}</p>
                      <p className="text-xs text-neutral-400 mt-1">Inclusive of all taxes</p>
                    </div>
                  </div>
                </div>

                <button
                  disabled={!valid || loading}
                  onClick={placeOrder}
                  className="btn-primary w-full py-5 text-lg shadow-premium mt-4"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader className="animate-spin" size={20} />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Place Order Now</span>
                      <ArrowRight size={20} />
                    </div>
                  )}
                </button>

                {error && (
                  <div className="p-4 bg-error-50 border border-error-100 rounded-2xl flex items-start gap-3 mt-4">
                    <AlertCircle className="text-error-500 shrink-0" size={18} />
                    <p className="text-sm font-medium text-error-700">{error}</p>
                  </div>
                )}

                <div className="space-y-4 pt-6">
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <Shield className="text-success-500" size={18} />
                    <span>Secure Payment Verification</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <Sparkles className="text-primary-500" size={18} />
                    <span>Premium Quality Guaranteed</span>
                  </div>
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
