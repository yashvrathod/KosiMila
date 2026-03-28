"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  subtotal: number;
  discount: number;
  shippingCost: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentVerified: boolean;
  paymentVerifiedAt?: string;
  paymentVerifiedBy?: string;
  shippingAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [status, setStatus] = useState("");

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/admin");
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      const data = await res.json();
      setOrder(data.order);
      setStatus(data.order.status);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status.toUpperCase() }),
      });

      if (!res.ok) throw new Error("Failed to update order");

      alert("Order updated successfully!");
      fetchOrder();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!confirm("Verify payment for this order? This will clear the user's cart and update stock.")) {
      return;
    }

    setVerifyingPayment(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to verify payment");
      }

      alert("Payment verified successfully! User's cart has been cleared and stock updated.");
      fetchOrder();
    } catch (error) {
      console.error("Error verifying payment:", error);
      alert("Failed to verify payment: " + (error as Error).message);
    } finally {
      setVerifyingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="container-premium py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-neutral-100 rounded-2xl w-64"></div>
            <div className="h-64 bg-neutral-100 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="container-premium py-12 text-center">
          <div className="bg-white rounded-3xl shadow-premium p-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="font-poppins text-2xl font-bold text-neutral-900 mb-2">
              Order Not Found
            </h1>
            <p className="text-neutral-600 mb-6">
              The order you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={handleBack}
              className="btn-primary"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
    PROCESSING: "bg-purple-100 text-purple-800 border-purple-200",
    SHIPPED: "bg-indigo-100 text-indigo-800 border-indigo-200",
    DELIVERED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
  };

  const paymentStatusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
    REFUNDED: "bg-gray-100 text-gray-700",
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock size={18} />;
      case "CONFIRMED":
        return <CheckCircle size={18} />;
      case "PROCESSING":
        return <Package size={18} />;
      case "SHIPPED":
        return <Truck size={18} />;
      case "DELIVERED":
        return <CheckCircle size={18} />;
      case "CANCELLED":
        return <XCircle size={18} />;
      default:
        return <Clock size={18} />;
    }
  };

  const canVerifyPayment = !order.paymentVerified && ["PENDING", "CONFIRMED"].includes(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="container-premium py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="mb-4 text-neutral-600 hover:text-neutral-900 flex items-center gap-2 transition-colors"
          >
            ← Back to Orders
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-poppins text-3xl font-bold text-neutral-900 mb-2">
                Order #{order.orderNumber}
              </h1>
              <p className="text-neutral-600">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${statusColors[order.status]}`}>
                {getStatusIcon(order.status)}
                {order.status}
              </div>
              {order.paymentVerified && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  <CheckCircle size={16} />
                  Payment Verified
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-3xl shadow-premium p-8 border border-neutral-100">
              <h2 className="font-poppins text-xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
                <Package size={20} />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-neutral-100 last:border-b-0 last:pb-0">
                    <div className="w-20 h-20 bg-neutral-50 rounded-xl overflow-hidden flex-shrink-0">
                      {item.product.images[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <Package size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900">{item.product.name}</h3>
                      <p className="text-neutral-600 text-sm mt-1">
                        Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right font-semibold text-neutral-900">
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-neutral-200 space-y-3">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount.toFixed(2)}</span>
                  </div>
                )}
                {order.shippingCost > 0 && (
                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping</span>
                    <span>₹{order.shippingCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-neutral-200">
                  <span className="font-semibold text-neutral-900">Total</span>
                  <span className="font-poppins text-xl font-bold text-primary-600">
                    ₹{order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-3xl shadow-premium p-8 border border-neutral-100">
              <h2 className="font-poppins text-xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
                <MapPin size={20} className="text-primary-500" />
                Shipping Address
              </h2>
              <div className="text-neutral-700 space-y-2">
                <p className="font-semibold text-neutral-900">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                </p>
                <div className="flex items-center gap-2 mt-3 text-neutral-600">
                  <Phone size={16} />
                  <span>{order.shippingAddress.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-3xl shadow-premium p-6 border border-neutral-100">
              <h2 className="font-poppins text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <User size={18} />
                Customer
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-500">Name</p>
                  <p className="font-medium text-neutral-900">{order.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Email</p>
                  <p className="text-neutral-900">{order.user.email}</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-3xl shadow-premium p-6 border border-neutral-100">
              <h2 className="font-poppins text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <CreditCard size={18} />
                Payment Details
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-500">Payment Method</p>
                  <p className="font-medium text-neutral-900">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Payment Status</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${paymentStatusColors[order.paymentStatus]}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                {order.paymentVerified && order.paymentVerifiedAt && (
                  <div className="pt-3 border-t border-neutral-100">
                    <p className="text-sm text-neutral-500">Verified At</p>
                    <p className="font-medium text-neutral-900">
                      {new Date(order.paymentVerifiedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Update Order Status */}
            <div className="bg-white rounded-3xl shadow-premium p-6 border border-neutral-100">
              <h2 className="font-poppins text-lg font-semibold text-neutral-900 mb-4">
                Update Order Status
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <button
                  onClick={handleUpdateOrder}
                  disabled={updating}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updating && <RefreshCw size={18} className="animate-spin" />}
                  {updating ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>

            {/* Verify Payment Button */}
            {canVerifyPayment && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <h2 className="font-poppins text-lg font-semibold text-green-900">
                    Verify Payment
                  </h2>
                </div>
                <p className="text-sm text-green-700 mb-4">
                  Confirm that you've received payment for this order. This will:
                </p>
                <ul className="text-sm text-green-700 space-y-1 mb-4">
                  <li>• Mark payment as completed</li>
                  <li>• Clear the user's cart</li>
                  <li>• Update product stock</li>
                </ul>
                <button
                  onClick={handleVerifyPayment}
                  disabled={verifyingPayment}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {verifyingPayment && <RefreshCw size={18} className="animate-spin" />}
                  {verifyingPayment ? "Verifying..." : "Verify Payment Received"}
                </button>
              </div>
            )}

            {order.paymentVerified && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h2 className="font-poppins text-base font-semibold text-green-900">
                    Payment Verified
                  </h2>
                </div>
                <p className="text-sm text-green-700">
                  Payment was verified and the user's cart has been cleared.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
