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
} from "lucide-react";

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
  createdAt: string;
  items: OrderItem[];
}

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: "completed" | "current" | "pending";
  timestamp?: string;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingSteps, setTrackingSteps] = useState<TrackingStep[]>([]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`);
        if (!response.ok) {
          throw new Error("Order not found");
        }
        const data = await response.json();
        setOrder(data.order);
        generateTrackingSteps(data.order);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const generateTrackingSteps = (orderData: Order) => {
    const steps: TrackingStep[] = [
      {
        id: "1",
        title: "Order Placed",
        description: "Your order has been received and is pending confirmation",
        icon: Clock,
        status: "completed",
        timestamp: orderData.createdAt,
      },
      {
        id: "2",
        title: "Order Confirmed",
        description: "Your order has been confirmed and is being processed",
        icon: CheckCircle,
        status: orderData.status === "PENDING" ? "pending" :
                orderData.status === "CONFIRMED" ? "current" : 
                orderData.status === "PROCESSING" ? "completed" :
                orderData.status === "SHIPPED" ? "completed" :
                orderData.status === "DELIVERED" ? "completed" : "pending",
      },
      {
        id: "3",
        title: "Processing",
        description: "Your premium makhana is being carefully prepared",
        icon: Package,
        status: orderData.status === "PENDING" ? "pending" :
                orderData.status === "CONFIRMED" ? "pending" :
                orderData.status === "PROCESSING" ? "current" :
                orderData.status === "SHIPPED" ? "completed" :
                orderData.status === "DELIVERED" ? "completed" : "pending",
      },
      {
        id: "4",
        title: "Shipped",
        description: "Your order is on its way to you",
        icon: Truck,
        status: orderData.status === "SHIPPED" ? "current" :
                orderData.status === "DELIVERED" ? "completed" : "pending",
      },
      {
        id: "5",
        title: "Delivered",
        description: "Your premium makhana has been delivered",
        icon: CheckCircle,
        status: orderData.status === "DELIVERED" ? "current" : "pending",
      },
    ];

    setTrackingSteps(steps);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-amber-600 bg-amber-50";
      case "CONFIRMED":
        return "text-blue-600 bg-blue-50";
      case "PROCESSING":
        return "text-purple-600 bg-purple-50";
      case "SHIPPED":
        return "text-indigo-600 bg-indigo-50";
      case "DELIVERED":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending Confirmation";
      case "CONFIRMED":
        return "Order Confirmed";
      case "PROCESSING":
        return "Processing";
      case "SHIPPED":
        return "Out for Delivery";
      case "DELIVERED":
        return "Delivered";
      default:
        return "Pending";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-premium py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-neutral-100 rounded-2xl w-64"></div>
            <div className="h-64 bg-neutral-100 rounded-3xl"></div>
            <div className="h-96 bg-neutral-100 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-premium py-20 text-center">
          <h1 className="font-poppins text-2xl font-bold text-neutral-900 mb-4">
            Order Not Found
          </h1>
          <p className="text-neutral-600 mb-8">
            We couldn't find the order you're looking for.
          </p>
          <Link href="/profile" className="btn-primary">
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="container-premium py-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-poppins text-2xl font-bold">Order Tracking</h1>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-primary-100 text-sm mb-1">Order Number</p>
              <p className="font-poppins text-xl font-semibold">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-primary-100 text-sm mb-1">Status</p>
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <div className={`w-2 h-2 rounded-full bg-white`}></div>
                <span className="font-medium">{getStatusText(order.status)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-premium py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Tracking Timeline */}
          <div className="lg:col-span-2">
            <div className="card-premium p-8">
              <h2 className="font-poppins text-xl font-semibold text-neutral-900 mb-8">
                Delivery Timeline
              </h2>
              
              <div className="space-y-8">
                {trackingSteps.map((step, index) => (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        ${step.status === "completed" ? "bg-success-500 text-white" : 
                          step.status === "current" ? "bg-primary-500 text-white" : 
                          "bg-neutral-200 text-neutral-400"}
                      `}>
                        <step.icon size={20} />
                      </div>
                      {index < trackingSteps.length - 1 && (
                        <div className={`
                          w-0.5 h-16 mt-2
                          ${step.status === "completed" ? "bg-success-500" : "bg-neutral-200"}
                        `}></div>
                      )}
                    </div>
                    
                    <div className="flex-1 pb-8">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-poppins font-semibold text-neutral-900">
                          {step.title}
                        </h3>
                        {step.timestamp && (
                          <span className="text-sm text-neutral-500">
                            {new Date(step.timestamp).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-600">{step.description}</p>
                      {step.status === "current" && (
                        <div className="mt-3 flex items-center gap-2 text-primary-600 text-sm font-medium">
                          <RefreshCw size={16} className="animate-spin" />
                          In Progress
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="card-premium p-8">
              <h2 className="font-poppins text-xl font-semibold text-neutral-900 mb-6">
                Order Items
              </h2>
              
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-neutral-100 rounded-2xl overflow-hidden flex-shrink-0">
                      {item.product.images?.[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900 line-clamp-2">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Qty: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-900">
                        ₹{item.quantity * item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-neutral-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-medium">₹{order.subtotal}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Discount</span>
                    <span className="font-medium text-success-600">-₹{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="font-medium">
                    {order.shippingCost === 0 ? "FREE" : `₹${order.shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200">
                  <span className="font-semibold text-neutral-900">Total</span>
                  <span className="font-poppins font-bold text-primary-600 text-lg">
                    ₹{order.total}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="card-premium p-6">
              <h3 className="font-poppins font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-primary-500" />
                Shipping Address
              </h3>
              <div className="text-sm text-neutral-600 space-y-1">
                <p className="font-medium text-neutral-900">
                  {order.shippingAddress?.name}
                </p>
                <p>{order.shippingAddress?.address}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                </p>
                <p>{order.shippingAddress?.phone}</p>
              </div>
            </div>

            {/* Contact Support */}
            <div className="card-premium p-6">
              <h3 className="font-poppins font-semibold text-neutral-900 mb-4">
                Need Help?
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                Have questions about your order? We're here to help!
              </p>
              
              <div className="space-y-3">
                <a
                  href={`https://wa.me/916202058021?text=${encodeURIComponent(
                    `Hi! I need help with my order ${order.orderNumber}`
                  )}`}
                  target="_blank"
                  className="btn-primary w-full justify-center"
                >
                  <MessageCircle size={18} />
                  Chat on WhatsApp
                </a>
                
                <a
                  href={`mailto:kosimila@gmail.com?subject=Order ${order.orderNumber} - Help Needed`}
                  className="btn-secondary w-full justify-center"
                >
                  <Mail size={18} />
                  Email Support
                </a>
                
                <a
                  href={`tel:6202058021`}
                  className="btn-ghost w-full justify-center"
                >
                  <Phone size={18} />
                  Call Us
                </a>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl p-6 border border-primary-200">
              <h3 className="font-poppins font-semibold text-primary-900 mb-3 flex items-center gap-2">
                <Clock size={18} />
                Estimated Delivery
              </h3>
              <p className="text-primary-800 text-sm mb-2">
                Your order is expected to arrive within
              </p>
              <p className="font-poppins text-xl font-bold text-primary-900">
                3-5 Business Days
              </p>
              <p className="text-primary-700 text-xs mt-2">
                Free shipping on all orders above ₹499
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
