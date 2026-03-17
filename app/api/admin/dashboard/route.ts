// src/app/api/admin/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all-time and monthly stats
    const [
      allTimeOrders,
      currentMonthOrders,
      lastMonthOrders,
      totalProducts,
      totalUsers,
      recentOrders,
    ] = await Promise.all([
      // All-time totals
      prisma.order.aggregate({
        _sum: { total: true },
        _count: true,
      }),
      // Current month stats
      prisma.order.aggregate({
        where: {
          createdAt: { gte: thisMonth },
        },
        _sum: { total: true },
        _count: true,
      }),
      // Last month stats
      prisma.order.aggregate({
        where: {
          createdAt: { gte: lastMonth, lt: thisMonth },
        },
        _sum: { total: true },
        _count: true,
      }),
      prisma.product.count(),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    // All-time totals
    const totalRevenue = allTimeOrders._sum.total || 0;
    const totalOrders = allTimeOrders._count || 0;

    const stats = {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      // Remove percentage changes as they don't make sense for all-time totals
      revenueChange: undefined,
      ordersChange: undefined,
    };

    const formattedOrders = recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.user.name,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    }));

    return NextResponse.json({ stats, recentOrders: formattedOrders });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
