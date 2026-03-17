import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = await getUserId(request);

    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: { 
          include: { 
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error("Error fetching order:", err);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = await getUserId(request);
    const { action } = (await request.json().catch(() => ({}))) as {
      action?: "CANCEL";
    };

    if (action !== "CANCEL") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const existing = await prisma.order.findFirst({
      where: { id, userId },
      select: { status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (["SHIPPED", "DELIVERED"].includes(existing.status)) {
      return NextResponse.json(
        { error: "Order cannot be cancelled" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ order });
  } catch (err) {
    console.error("Error updating order:", err);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// Admin endpoint to update order status (for shipping notifications)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { status, trackingNumber } = await request.json();

    // In production, you'd want to verify this is an admin request
    // For now, we'll allow it for demo purposes
    
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { 
        status,
        // You might want to store tracking number in a separate field
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    // Send shipping notification
    if (status === "SHIPPED" && existingOrder.status !== "SHIPPED") {
      await sendShippingNotification(updatedOrder, trackingNumber);
    }

    // Send delivered notification
    if (status === "DELIVERED" && existingOrder.status !== "DELIVERED") {
      await sendDeliveredNotification(updatedOrder);
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}

async function sendShippingNotification(order: any, trackingNumber?: string) {
  try {
    // WhatsApp notification for shipping
    const whatsappMessage = `🚚 Your Kosimila Order is Shipped!\n\n` +
      `Great news! Your premium makhana is on its way.\n\n` +
      `📦 Order: ${order.orderNumber}\n` +
      `📍 Status: Out for Delivery\n` +
      `📱 Tracking: ${trackingNumber || 'Will be updated shortly'}\n\n` +
      `Track your order: ${process.env.NEXT_PUBLIC_APP_URL}/order-tracking/${order.id}\n\n` +
      `Expected delivery: 3-5 business days\n\n` +
      `For support: 📞 6202058021\n` +
      `📧 kosimila@gmail.com\n\n` +
      `Thank you for choosing Kosimila! 🌿`;

    console.log("WhatsApp Shipping Notification:", whatsappMessage);
    
    // Email notification for shipping
    const emailSubject = `Your Kosimila Order ${order.orderNumber} Has Been Shipped! 🚚`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🚚 Your Order is Shipped!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your premium makhana is on its way</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none;">
          <h2 style="color: #333; margin-bottom: 20px;">Shipping Details</h2>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Out for Delivery</p>
            <p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${trackingNumber || 'Will be updated shortly'}</p>
            <p style="margin: 5px 0;"><strong>Expected Delivery:</strong> 3-5 Business Days</p>
          </div>
          
          <h3 style="color: #333; margin-bottom: 15px;">What's in your order?</h3>
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
               style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
              Track Your Order
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="margin: 5px 0; color: #666;">Questions about your order?</p>
          <p style="margin: 5px 0; color: #666;">📞 6202058021 | 📧 kosimila@gmail.com</p>
          <p style="margin: 15px 0 0 0; color: #999; font-size: 12px;">© 2024 Kosimila - Premium Makhana</p>
        </div>
      </div>
    `;

    console.log("Email Shipping Notification:", { subject: emailSubject, body: emailBody });

  } catch (error) {
    console.error("Failed to send shipping notification:", error);
  }
}

async function sendDeliveredNotification(order: any) {
  try {
    // WhatsApp notification for delivery
    const whatsappMessage = `✅ Your Kosimila Order Has Been Delivered!\n\n` +
      `Great news! Your premium makhana has been delivered.\n\n` +
      `📦 Order: ${order.orderNumber}\n` +
      `✅ Status: Delivered\n\n` +
      `We hope you enjoy your healthy snacks! 🌿\n\n` +
      `Share your experience: Leave a review on our website\n\n` +
      `For support: 📞 6202058021\n` +
      `📧 kosimila@gmail.com\n\n` +
      `Thank you for choosing Kosimila! 💚`;

    console.log("WhatsApp Delivery Notification:", whatsappMessage);
    
    // Email notification for delivery
    const emailSubject = `Your Kosimila Order ${order.orderNumber} Has Been Delivered! ✅`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">✅ Order Delivered!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your premium makhana has arrived</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none;">
          <h2 style="color: #333; margin-bottom: 20px;">Delivery Confirmation</h2>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Delivered Successfully</p>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <h3 style="color: #059669; margin-bottom: 10px;">Enjoy Your Healthy Snacks! 🌿</h3>
            <p style="margin: 0; color: #059669;">We hope you love your premium makhana as much as we do!</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" 
               style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; margin-right: 10px;">
              Order Again
            </a>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/products/review" 
               style="background: white; color: #10b981; padding: 12px 30px; text-decoration: none; border: 2px solid #10b981; border-radius: 25px; font-weight: 600; display: inline-block;">
              Leave Review
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="margin: 5px 0; color: #666;">Questions about your order?</p>
          <p style="margin: 5px 0; color: #666;">📞 6202058021 | 📧 kosimila@gmail.com</p>
          <p style="margin: 15px 0 0 0; color: #999; font-size: 12px;">© 2024 Kosimila - Premium Makhana</p>
        </div>
      </div>
    `;

    console.log("Email Delivery Notification:", { subject: emailSubject, body: emailBody });

  } catch (error) {
    console.error("Failed to send delivery notification:", error);
  }
}
