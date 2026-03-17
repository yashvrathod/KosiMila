"use client";

import { useState, useEffect } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";
import { FaRupeeSign } from "react-icons/fa";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  revenueChange?: number;
  ordersChange?: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenueChange: 0,
    ordersChange: 0,
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();
      setStats(data.stats || stats);
      setRecentOrders(data.recentOrders || []);
    } catch {
      console.error("Failed to fetch dashboard data");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      PROCESSING: "bg-purple-100 text-purple-800",
      SHIPPED: "bg-indigo-100 text-indigo-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#2F2418]">
              Ladoozi Admin Dashboard
            </h2>
            <p className="text-sm text-gray-500">
              Overview of sales & operations
            </p>
          </div>

          
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Revenue */}
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={<FaRupeeSign />}
          color="bg-green-100 text-green-700"
        />

        {/* Orders */}
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={<ShoppingCart />}
          color="bg-blue-100 text-blue-700"
        />

        {/* Products */}
        <StatCard
          title="Products"
          value={stats.totalProducts.toLocaleString()}
          icon={<Package />}
          color="bg-purple-100 text-purple-700"
        />

        {/* Users */}
        <StatCard
          title="Customers"
          value={stats.totalUsers.toLocaleString()}
          icon={<Users />}
          color="bg-orange-100 text-orange-700"
        />
      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-[#2F2418]">
            Recent Orders
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FBF8F3] text-sm">
              <tr>
                {["Order", "Customer", "Total", "Status", "Date", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left font-medium text-gray-600"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#FBF8F3]/60">
                  <td className="px-6 py-4 font-medium">
                    #{order.orderNumber}
                  </td>
                  <td className="px-6 py-4">{order.customer}</td>
                  <td className="px-6 py-4">
                    ₹{order.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-[#C8A24D] hover:underline font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}

              {recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No recent orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- STAT CARD ---------------- */

function StatCard({
  title,
  value,
  change,
  icon,
  color,
}: {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>

        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              change >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {change >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-[#2F2418]">{value}</p>
    </div>
  );
}
