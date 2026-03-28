"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Award
} from "lucide-react";
import StoreHeader from "@/app/components/store/StoreHeader";
import StoreFooter from "@/app/components/store/StoreFooter";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  shippingAddress: any;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`);
        if (!response.ok) throw new Error("Order not found");
        const data = await response.json();
        setOrder(data.order);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchOrder();
  }, [params.id]);

  const steps = [
    { label: "Order Placed", status: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"], icon: Clock },
    { label: "Confirmed", status: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"], icon: ShieldCheck },
    { label: "Processing", status: ["PROCESSING", "SHIPPED", "DELIVERED"], icon: Package },
    { label: "Shipped", status: ["SHIPPED", "DELIVERED"], icon: Truck },
    { label: "Delivered", status: ["DELIVERED"], icon: CheckCircle },
  ];

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    if (order.status === "PENDING") return 0;
    if (order.status === "CONFIRMED") return 1;
    if (order.status === "PROCESSING") return 2;
    if (order.status === "SHIPPED") return 3;
    if (order.status === "DELIVERED") return 4;
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBFA] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FCFBFA]">
        <StoreHeader categories={[]} initialSearch="" />
        <div className="container-premium py-32 text-center">
          <div className="w-24 h-24 bg-white rounded-4xl shadow-soft flex items-center justify-center mx-auto mb-8 border border-neutral-100">
            <ShoppingBag size={40} className="text-neutral-300" />
          </div>
          <h1 className="font-poppins text-4xl font-bold text-neutral-900 mb-4">Order Not Found</h1>
          <p className="text-neutral-500 mb-12 max-w-sm mx-auto font-medium">We couldn't locate the details for this specific journey.</p>
          <Link href="/profile" className="btn-primary px-12 py-4 text-sm font-bold uppercase tracking-widest">Back to Profile</Link>
        </div>
        <StoreFooter />
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-[#FCFBFA]">
      <StoreHeader categories={[]} initialSearch="" />

      {/* Hero Tracking Header */}
      <div className="bg-white border-b border-neutral-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-50/30 to-transparent -skew-x-12 translate-x-1/2"></div>
        <div className="container-premium py-16 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <Link href="/profile" className="inline-flex items-center gap-2 text-primary-600 font-bold text-xs uppercase tracking-widest hover:gap-3 transition-all mb-2">
                <ArrowLeft size={14} /> Back to Dashboard
              </Link>
              <div className="flex items-center gap-4">
                <h1 className="font-poppins text-4xl font-bold text-neutral-900">Track Journey</h1>
                <span className="bg-neutral-900 text-white px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl">
                  Order #{order.orderNumber}
                </span>
              </div>
              <p className="text-neutral-500 font-medium flex items-center gap-2">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-200"></span>
                {order.items.length} Premium Items
              </p>
            </div>
            
            <div className="bg-neutral-50/50 backdrop-blur-sm px-8 py-6 rounded-3xl border border-neutral-100 flex items-center gap-8">
              <div className="text-center">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Status</p>
                <p className="text-xl font-bold text-primary-600">{order.status}</p>
              </div>
              <div className="w-px h-10 bg-neutral-200" />
              <div className="text-center">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Total</p>
                <p className="text-xl font-bold text-neutral-900">₹{order.total.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-premium py-16">
        {/* Visual Progress Bar */}
        <div className="bg-white rounded-[3rem] p-12 shadow-premium-soft border border-neutral-100 mb-12">
          <div className="relative">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-100 -translate-y-1/2"></div>
            {/* Progress Line */}
            <div 
              className="absolute top-1/2 left-0 h-1 bg-primary-500 -translate-y-1/2 transition-all duration-1000 ease-out"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>

            <div className="relative flex justify-between">
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;
                const Icon = step.icon;

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className={`
                      w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 border-4 relative z-10
                      ${isCompleted ? "bg-primary-600 border-white text-white shadow-xl scale-110" : "bg-white border-neutral-100 text-neutral-300"}
                      ${isCurrent ? "animate-pulse" : ""}
                    `}>
                      <Icon size={24} />
                      {isCompleted && !isCurrent && (
                        <div className="absolute -top-2 -right-2 bg-success-500 text-white rounded-full p-1 border-2 border-white">
                          <CheckCircle size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="mt-6 text-center">
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isCompleted ? "text-neutral-900" : "text-neutral-400"}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-[9px] font-bold text-primary-600 mt-1 uppercase animate-pulse">Live Update</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Order Items List */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-neutral-100">
              <h3 className="text-xl font-bold text-neutral-900 mb-8 flex items-center gap-2">
                <Zap size={20} className="text-primary-500" /> Premium Selection
              </h3>
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-8 p-4 rounded-3xl border border-neutral-50 hover:border-primary-100 transition-colors">
                    <div className="w-24 h-24 bg-neutral-50 rounded-2xl overflow-hidden flex-shrink-0 border border-neutral-100 p-2">
                      <img src={item.product.images[0]} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-neutral-900">{item.product.name}</h4>
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Qty: {item.quantity} Units</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-neutral-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-neutral-400">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-10 border-t border-neutral-100 grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500 font-medium">Subtotal</span>
                    <span className="text-neutral-900 font-bold">₹{order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500 font-medium">Logistics Fee</span>
                    <span className="text-success-600 font-bold uppercase text-[10px] tracking-widest">{order.shippingCost === 0 ? "Complimentary" : `₹${order.shippingCost}`}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-success-600 font-medium">Privilege Discount</span>
                      <span className="text-success-600 font-bold">-₹{order.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-neutral-50 flex justify-between items-center">
                    <span className="text-lg font-bold text-neutral-900">Final Total</span>
                    <span className="text-3xl font-bold text-gradient">₹{order.total.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="bg-neutral-50 rounded-3xl p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="text-amber-500" size={20} />
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Trust Guarantee</p>
                  </div>
                  <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                    This order is hand-packed and inspected for premium quality standards. Thank you for choosing Kosimila luxury snacks.
                  </p>
                </div>
              </div>
            </div>

            {/* If Gift Note exists */}
            {order.notes && (
              <div className="bg-primary-50 rounded-[2.5rem] p-10 border border-primary-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/50 rounded-bl-[100px] transition-transform group-hover:scale-110"></div>
                <h3 className="text-xl font-bold text-primary-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎁</span> Gift Message Attached
                </h3>
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-primary-100 italic text-primary-800 text-lg font-medium leading-relaxed">
                  "{order.notes}"
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            {/* Delivery Details */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-neutral-100">
              <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <MapPin size={20} className="text-primary-600" /> Ship To
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-neutral-900">{order.shippingAddress?.name}</p>
                  <p className="text-sm text-neutral-500 font-medium leading-relaxed mt-1">
                    {order.shippingAddress?.addressLine1}<br />
                    {order.shippingAddress?.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                    {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                    {order.shippingAddress?.pincode}
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-neutral-50">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                    <Phone size={18} />
                  </div>
                  <p className="text-sm font-bold text-neutral-900">{order.shippingAddress?.phone}</p>
                </div>
              </div>
            </div>

            {/* Support Concierge */}
            <div className="bg-neutral-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-xl font-bold mb-4 relative z-10">Luxury Concierge</h3>
              <p className="text-neutral-400 text-sm mb-8 relative z-10 font-medium leading-relaxed">
                Need immediate assistance with your premium order? Our concierge is available 24/7.
              </p>
              <div className="space-y-4 relative z-10">
                <a href="https://wa.me/916202058021" target="_blank" className="flex items-center justify-center gap-3 w-full py-4 bg-primary-600 hover:bg-primary-700 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-primary-900/50">
                  <MessageCircle size={18} /> WhatsApp Now
                </a>
                <a href="mailto:kosimila@gmail.com" className="flex items-center justify-center gap-3 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm transition-all border border-white/10">
                  <Mail size={18} /> Email Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StoreFooter />
    </div>
  );
}
