
// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { calculateCouponDiscount } from "@/lib/coupons";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    const { shippingAddress, paymentMethod, couponCode: rawCoupon } = await request.json();

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { 
        product: true,
        variant: true,
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const subtotal = cartItems.reduce(
      (sum, item) => {
        const price = item.variant ? item.variant.price : item.product.price;
        return sum + price * item.quantity;
      },
      0
    );

    // Apply coupon if provided
    let discount = 0;
    let couponCode: string | undefined;
    if (rawCoupon) {
      const res = await calculateCouponDiscount({ couponCode: rawCoupon, subtotal });
      if (!res.ok) {
        return NextResponse.json({ error: res.reason }, { status: 400 });
      }
      discount = res.discount;
      couponCode = res.couponCode;
    }

    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = 0; // No tax
    
    // No shipping charges - delivery charges will be discussed with owner at time of delivery
    const shippingCost = 0;
    
    const total = taxableAmount + tax + shippingCost;

    const orderNumber = `ORD${Date.now()}`;

    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber,
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentVerified: false,
        subtotal,
        discount,
        couponCode,
        tax,
        shippingCost,
        total,
        paymentMethod,
        shippingAddress,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant ? item.variant.price : item.product.price,
          })),
        },
      },
      include: {
        items: {
          include: { 
            product: true,
            variant: true,
          }
        }
      },
    });

    // NOTE: Cart is NOT cleared here. It will be cleared when admin verifies payment.
    // This prevents data loss if payment fails or user abandons the order.

    // Send order confirmation notifications
    await sendOrderConfirmation(order);

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

async function sendOrderConfirmation(order: any) {
  try {
    // WhatsApp notification
    const fullAddress = `${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? ', ' + order.shippingAddress.addressLine2 : ''}`;
    const whatsappMessage = `🎉 Order Confirmed! 🌿\n\n` +
      `Thank you for choosing Kosimila!\n\n` +
      `📦 Order: ${order.orderNumber}\n` +
      `💰 Total: ₹${order.total}\n` +
      `📍 Delivery: ${fullAddress}, ${order.shippingAddress.city}\n\n` +
      `Track your order: ${process.env.NEXT_PUBLIC_APP_URL}/order-tracking/${order.id}\n\n` +
      `Expect delivery in 3-5 business days.\n\n` +
      `For support: 📞 6202058021\n` +
      `📧 kosimila@gmail.com\n\n` +
      `Happy snacking! 😊`;

    console.log("WhatsApp Order Confirmation:", whatsappMessage);
    
    // Email notification
    const emailSubject = `Order Confirmed - ${order.orderNumber} | Kosimila`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ed8344, #dd6c2f); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for choosing Kosimila</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none;">
          <h2 style="color: #333; margin-bottom: 20px;">Order Details</h2>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${order.total}</p>
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p style="margin: 5px 0;"><strong>Estimated Delivery:</strong> 3-5 Business Days</p>
          </div>
          
          <h3 style="color: #333; margin-bottom: 15px;">Shipping Address</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>${order.shippingAddress.name}</strong></p>
            <p style="margin: 5px 0;">${order.shippingAddress.addressLine1}</p>
            ${order.shippingAddress.addressLine2 ? `<p style="margin: 5px 0;">${order.shippingAddress.addressLine2}</p>` : ''}
            <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}</p>
            <p style="margin: 5px 0;">📞 ${order.shippingAddress.phone}</p>
          </div>
          
          <h3 style="color: #333; margin-bottom: 15px;">Order Items</h3>
          <div style="margin-bottom: 20px;">
            ${order.items.map((item: any) => `
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <div>
                  <p style="margin: 0; font-weight: 500;">${item.product.name}</p>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Qty: ${item.quantity} × ₹${item.price}</p>
                </div>
                <p style="margin: 0; font-weight: 600;">₹${item.quantity * item.price}</p>
              </div>
            `).join('')}
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/order-tracking/${order.id}" 
               style="background: linear-gradient(135deg, #ed8344, #dd6c2f); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
              Track Your Order
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="margin: 5px 0; color: #666;">Need help? Contact us:</p>
          <p style="margin: 5px 0; color: #666;">📞 6202058021 | 📧 kosimila@gmail.com</p>
          <p style="margin: 15px 0 0 0; color: #999; font-size: 12px;">© 2024 Kosimila - Premium Makhana</p>
        </div>
      </div>
    `;

    console.log("Email Order Confirmation:", { subject: emailSubject, body: emailBody });

    // In production, integrate with:
    // 1. WhatsApp Business API for real-time notifications
    // 2. SendGrid/Nodemailer for email delivery
    // 3. SMS gateway for SMS notifications
    
  } catch (error) {
    console.error("Failed to send order confirmation:", error);
  }
}
