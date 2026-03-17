"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  User,
  LogOut,
  Eye,
  RefreshCw,
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

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export default function ProfilePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }

        // Fetch orders
        const ordersRes = await fetch("/api/orders");
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle size={16} />;
      case "PROCESSING":
        return <Package size={16} />;
      case "SHIPPED":
        return <Truck size={16} />;
      case "DELIVERED":
        return <CheckCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "text-blue-600 bg-blue-50";
      case "PROCESSING":
        return "text-amber-600 bg-amber-50";
      case "SHIPPED":
        return "text-purple-600 bg-purple-50";
      case "DELIVERED":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.assign("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-premium py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-neutral-100 rounded-2xl w-64"></div>
            <div className="h-64 bg-neutral-100 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-premium py-20 text-center">
          <h1 className="font-poppins text-2xl font-bold text-neutral-900 mb-4">
            Please Login
          </h1>
          <p className="text-neutral-600 mb-8">
            You need to be logged in to view your profile.
          </p>
          <Link href="/login" className="btn-primary">
            Login
          </Link>
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
            My Account
          </h1>
          <p className="text-neutral-600">
            Welcome back, {user.name}!
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-premium p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User size={24} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-neutral-900">
                    {user.name}
                  </h3>
                  <p className="text-sm text-neutral-600">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                    activeTab === "orders"
                      ? "bg-primary-100 text-primary-700"
                      : "text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <Package size={18} className="inline mr-3" />
                  My Orders
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                    activeTab === "profile"
                      ? "bg-primary-100 text-primary-700"
                      : "text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <User size={18} className="inline mr-3" />
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} className="inline mr-3" />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <h2 className="font-poppins text-2xl font-semibold text-neutral-900 mb-6">
                  Your Orders
                </h2>

                {orders.length === 0 ? (
                  <div className="card-premium p-12 text-center">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package size={32} className="text-neutral-400" />
                    </div>
                    <h3 className="font-poppins text-xl font-semibold text-neutral-900 mb-2">
                      No orders yet
                    </h3>
                    <p className="text-neutral-600 mb-6">
                      You haven't placed any orders yet. Start shopping to see your orders here.
                    </p>
                    <Link href="/products" className="btn-primary">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="card-premium p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <div>
                            <h3 className="font-poppins font-semibold text-neutral-900 mb-1">
                              {order.orderNumber}
                            </h3>
                            <p className="text-sm text-neutral-600">
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {getStatusText(order.status)}
                            </div>
                            
                            <Link
                              href={`/order-tracking/${order.id}`}
                              className="btn-ghost px-4 py-2 text-sm"
                            >
                              <Eye size={16} className="mr-2" />
                              Track Order
                            </Link>
                          </div>
                        </div>

                        <div className="border-t border-neutral-200 pt-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="mb-4 md:mb-0">
                              <p className="text-sm text-neutral-600 mb-2">
                                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {order.items.slice(0, 3).map((item) => (
                                  <span key={item.id} className="text-sm text-neutral-700">
                                    {item.product.name} × {item.quantity}
                                  </span>
                                ))}
                                {order.items.length > 3 && (
                                  <span className="text-sm text-neutral-500">
                                    +{order.items.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-sm text-neutral-600">Total</p>
                              <p className="font-poppins text-xl font-bold text-primary-600">
                                ₹{order.total.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div>
                <h2 className="font-poppins text-2xl font-semibold text-neutral-900 mb-6">
                  Profile Information
                </h2>

                <div className="card-premium p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={user.name}
                        readOnly
                        className="input-premium"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        readOnly
                        className="input-premium"
                      />
                    </div>
                    
                    {user.phone && (
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={user.phone}
                          readOnly
                          className="input-premium"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-8 p-4 bg-neutral-50 rounded-2xl">
                    <h4 className="font-poppins font-semibold text-neutral-900 mb-2">
                      Account Settings
                    </h4>
                    <p className="text-sm text-neutral-600 mb-4">
                      Manage your account preferences and security settings.
                    </p>
                    <div className="space-y-2">
                      <button className="btn-ghost text-sm">
                        <RefreshCw size={16} className="mr-2" />
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
