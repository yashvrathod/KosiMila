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
  MapPin,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  ShoppingBag,
  Heart,
  Settings as SettingsIcon,
  Trash2,
  Plus,
  Sparkles
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
  createdAt: string;
  items: OrderItem[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "addresses" | "settings">("dashboard");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, ordersRes, addrRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/orders"),
          fetch("/api/addresses")
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }

        if (addrRes.ok) {
          const addrData = await addrRes.json();
          setAddresses(addrData.addresses || []);
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
      case "CONFIRMED": return <CheckCircle size={16} />;
      case "PROCESSING": return <Package size={16} />;
      case "SHIPPED": return <Truck size={16} />;
      case "DELIVERED": return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "text-blue-600 bg-blue-50 border-blue-100";
      case "PROCESSING": return "text-amber-600 bg-amber-50 border-amber-100";
      case "SHIPPED": return "text-purple-600 bg-purple-50 border-purple-100";
      case "DELIVERED": return "text-success-600 bg-success-50 border-success-100";
      default: return "text-neutral-600 bg-neutral-50 border-neutral-100";
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
      <div className="min-h-screen bg-[#FCFBFA] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FCFBFA]">
        <StoreHeader categories={[]} initialSearch="" />
        <div className="container-premium py-32 text-center">
          <div className="w-24 h-24 bg-white rounded-4xl shadow-soft flex items-center justify-center mx-auto mb-8 border border-neutral-100">
            <User size={40} className="text-neutral-300" />
          </div>
          <h1 className="font-poppins text-4xl font-bold text-neutral-900 mb-4">Luxury Experience Awaits</h1>
          <p className="text-neutral-500 mb-12 max-w-sm mx-auto font-medium">Please sign in to access your premium dashboard and order history.</p>
          <Link href="/login" className="btn-primary px-12 py-4">Sign In to Account</Link>
        </div>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBFA]">
      <StoreHeader categories={[]} initialSearch="" />

      {/* Hero Profile Header */}
      <div className="bg-white border-b border-neutral-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-50/30 to-transparent -skew-x-12 translate-x-1/2"></div>
        <div className="container-premium py-16 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center gap-8">
              <div className="w-28 h-28 bg-gradient-to-br from-primary-500 to-primary-700 rounded-4xl flex items-center justify-center text-white font-poppins text-4xl font-bold shadow-premium ring-8 ring-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="font-poppins text-4xl font-bold text-neutral-900">{user.name}</h1>
                  <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary-100 flex items-center gap-1">
                    <ShieldCheck size={12} /> Premium Member
                  </span>
                </div>
                <p className="text-neutral-500 font-medium flex items-center gap-2">
                  <span className="opacity-60">{user.email}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-200"></span>
                  <span className="opacity-60">{user.phone || "No phone added"}</span>
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-neutral-50/50 backdrop-blur-sm px-8 py-4 rounded-3xl border border-neutral-100 flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">{orders.length}</p>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Orders</p>
                </div>
                <div className="w-px h-8 bg-neutral-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">{addresses.length}</p>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Addresses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-premium py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 space-y-6">
            <nav className="bg-white rounded-[2.5rem] p-4 shadow-soft border border-neutral-100 space-y-2">
              {[
                { id: 'dashboard', label: 'Overview', icon: User },
                { id: 'orders', label: 'My Orders', icon: ShoppingBag },
                { id: 'addresses', label: 'Manage Addresses', icon: MapPin },
                { id: 'settings', label: 'Account Settings', icon: SettingsIcon },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                    activeTab === item.id 
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-100 translate-x-2" 
                      : "text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={20} />
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className={activeTab === item.id ? "opacity-100" : "opacity-0"} />
                </button>
              ))}
              <div className="h-px bg-neutral-100 my-4 mx-4"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </nav>

            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-xl font-bold mb-2 relative z-10">Need Assistance?</h3>
              <p className="text-neutral-400 text-sm mb-6 relative z-10">Our luxury concierge is here to help with your premium orders.</p>
              <a href="https://wa.me/916202058021" target="_blank" className="inline-flex items-center gap-2 text-primary-400 font-bold text-sm hover:gap-3 transition-all relative z-10">
                Contact Concierge <ArrowRightIcon size={16} />
              </a>
            </div>
          </aside>

          {/* Main Dashboard Content */}
          <main className="lg:col-span-9">
            
            {/* 1. DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-10">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Recent Order Summary */}
                  <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-neutral-100">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-neutral-900">Recent Activity</h3>
                      <button onClick={() => setActiveTab('orders')} className="text-primary-600 font-bold text-xs uppercase tracking-widest">View All</button>
                    </div>
                    {orders.length > 0 ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-6 p-4 bg-neutral-50 rounded-3xl border border-neutral-100">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-sm border border-neutral-100">
                            <ShoppingBag size={24} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-neutral-900">Last Order: {orders[0].orderNumber}</p>
                            <p className="text-xs text-neutral-500 font-medium">₹{orders[0].total.toLocaleString()} • {new Date(orders[0].createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className={`p-4 rounded-3xl border flex items-center gap-3 ${getStatusColor(orders[0].status)}`}>
                          {getStatusIcon(orders[0].status)}
                          <span className="text-sm font-bold">{orders[0].status}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 opacity-50">
                        <ShoppingBag size={40} className="mx-auto mb-4 text-neutral-300" />
                        <p className="text-sm font-medium">No recent orders found</p>
                      </div>
                    )}
                  </div>

                  {/* Loyalty/Points Placeholder */}
                  <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-neutral-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-neutral-900">Loyalty Status</h3>
                      <Sparkles size={20} className="text-amber-400" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-3xl font-bold text-neutral-900">Tier 1</p>
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Signature Member</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary-600 cursor-pointer">Explore Perks</p>
                        </div>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 w-1/4 rounded-full"></div>
                      </div>
                      <p className="text-[10px] text-neutral-500 font-medium">Order 3 more times to reach <span className="text-neutral-900 font-bold">Gold Tier</span></p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[3rem] p-10 shadow-premium-soft border border-neutral-100">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-8">Recommended For You</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="space-y-3 group cursor-pointer">
                        <div className="aspect-square bg-neutral-50 rounded-3xl overflow-hidden border border-neutral-100 p-4 flex items-center justify-center group-hover:bg-white group-hover:shadow-soft transition-all">
                          <img src={`/images/roasted.png`} alt="Product" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="px-2">
                          <p className="text-xs font-bold text-neutral-900 line-clamp-1">Luxury Makhana Mix</p>
                          <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">Premium Choice</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-neutral-900">Order History</h2>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-neutral-200">
                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShoppingBag size={40} className="text-neutral-300" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">No Orders Found</h3>
                    <p className="text-neutral-500 mb-8 max-w-xs mx-auto">Your journey of premium snacking starts with your first order.</p>
                    <Link href="/products" className="btn-primary">Browse Collection</Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-neutral-100 hover:shadow-premium-soft transition-all duration-500 group">
                        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 pb-8 border-b border-neutral-50">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Order Reference</p>
                            <h3 className="text-xl font-bold text-neutral-900">{order.orderNumber}</h3>
                            <p className="text-sm font-medium text-neutral-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4">
                            <div className={`px-5 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </div>
                            <Link
                              href={`/order-tracking/${order.id}`}
                              className="bg-neutral-900 text-white px-5 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary-600 transition-colors"
                            >
                              <Eye size={14} /> Track Order
                            </Link>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                          <div className="flex-1">
                            <div className="flex -space-x-4 mb-4">
                              {order.items.slice(0, 3).map((item, idx) => (
                                <div key={item.id} className="w-14 h-14 bg-neutral-50 rounded-2xl border-4 border-white overflow-hidden shadow-sm relative" style={{ zIndex: 10 - idx }}>
                                  <img src={item.product.images[0]} alt="" className="w-full h-full object-contain" />
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <div className="w-14 h-14 bg-neutral-100 rounded-2xl border-4 border-white flex items-center justify-center text-xs font-bold text-neutral-500 relative z-0">
                                  +{order.items.length - 3}
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-bold text-neutral-900">
                              {order.items.length} {order.items.length === 1 ? 'Product' : 'Products'}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Amount</p>
                            <p className="text-3xl font-bold text-gradient">₹{order.total.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-neutral-900">Saved Addresses</h2>
                  <button className="bg-primary-600 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary-100 hover:scale-105 transition-all">
                    <Plus size={18} /> Add New Address
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {addresses.length > 0 ? (
                    addresses.map((addr) => (
                      <div key={addr.id} className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all relative group ${addr.isDefault ? 'border-primary-500 shadow-premium-soft' : 'border-neutral-100 shadow-soft hover:border-primary-200'}`}>
                        {addr.isDefault && (
                          <div className="absolute -top-3 left-8 bg-primary-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                            Default Address
                          </div>
                        )}
                        <div className="mb-6 flex justify-between items-start">
                          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                            <MapPin size={24} />
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-neutral-400 hover:text-primary-600 transition-colors"><RefreshCw size={18} /></button>
                            <button className="p-2 text-neutral-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                          </div>
                        </div>
                        <h4 className="font-bold text-neutral-900 text-lg mb-2">{addr.name}</h4>
                        <div className="space-y-1 text-neutral-500 font-medium text-sm leading-relaxed">
                          <p>{addr.addressLine1}</p>
                          {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                          <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="pt-4 text-neutral-900 font-bold">{addr.phone}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-20 bg-white rounded-[3rem] text-center border border-dashed border-neutral-200">
                      <MapPin size={40} className="mx-auto mb-4 text-neutral-300" />
                      <p className="text-neutral-500 font-bold">No saved addresses found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-10">
                <h2 className="text-3xl font-bold text-neutral-900">Account Preferences</h2>
                
                <div className="bg-white rounded-[3rem] p-10 shadow-soft border border-neutral-100">
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Personal Details</h4>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Full Name</label>
                          <input type="text" defaultValue={user.name} className="w-full bg-neutral-50 border-2 border-neutral-50 rounded-2xl px-5 py-3.5 font-bold text-neutral-900 outline-none focus:border-primary-500 focus:bg-white transition-all" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Email Address</label>
                          <input type="email" defaultValue={user.email} disabled className="w-full bg-neutral-50/50 border-2 border-transparent rounded-2xl px-5 py-3.5 font-bold text-neutral-400 cursor-not-allowed" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Phone Number</label>
                          <input type="tel" defaultValue={user.phone} className="w-full bg-neutral-50 border-2 border-neutral-50 rounded-2xl px-5 py-3.5 font-bold text-neutral-900 outline-none focus:border-primary-500 focus:bg-white transition-all" />
                        </div>
                        <button className="btn-primary w-full py-4 mt-4 shadow-lg shadow-primary-100">Save Changes</button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Security & Access</h4>
                      <div className="space-y-4">
                        <div className="p-6 bg-neutral-50 rounded-[2rem] border border-neutral-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-neutral-500">
                              <RefreshCw size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-neutral-900">Update Password</p>
                              <p className="text-[10px] text-neutral-500 font-medium">Secure your account</p>
                            </div>
                          </div>
                          <button className="p-2 hover:text-primary-600 transition-colors"><ChevronRight size={20} /></button>
                        </div>
                        <div className="p-6 bg-neutral-50 rounded-[2rem] border border-neutral-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-neutral-500">
                              <CreditCard size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-neutral-900">Payment Methods</p>
                              <p className="text-[10px] text-neutral-500 font-medium">Manage saved cards & UPI</p>
                            </div>
                          </div>
                          <button className="p-2 hover:text-primary-600 transition-colors"><ChevronRight size={20} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <StoreFooter />
    </div>
  );
}

function ArrowRightIcon({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
