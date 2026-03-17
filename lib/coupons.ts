import prisma from "@/lib/prisma";

export type CouponApplicationResult =
  | { ok: true; discount: number; couponCode: string }
  | { ok: false; reason: string };

export async function calculateCouponDiscount(input: {
  couponCode: string;
  subtotal: number;
}): Promise<CouponApplicationResult> {
  const code = input.couponCode.trim().toUpperCase();
  if (!code) return { ok: false, reason: "Invalid coupon code" };

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) return { ok: false, reason: "Coupon not available" };

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return { ok: false, reason: "Coupon not started" };
  if (coupon.endsAt && coupon.endsAt < now) return { ok: false, reason: "Coupon expired" };

  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined) {
    if (coupon.usedCount >= coupon.usageLimit) {
      return { ok: false, reason: "Coupon usage limit reached" };
    }
  }

  if (coupon.minOrder !== null && coupon.minOrder !== undefined) {
    if (input.subtotal < coupon.minOrder) {
      return { ok: false, reason: `Minimum order is ${coupon.minOrder}` };
    }
  }

  let discount = 0;
  if (coupon.type === "PERCENT") {
    discount = (input.subtotal * coupon.value) / 100;
  } else {
    discount = coupon.value;
  }

  if (coupon.maxDiscount !== null && coupon.maxDiscount !== undefined) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  discount = Math.max(0, Math.min(discount, input.subtotal));

  return { ok: true, discount, couponCode: coupon.code };
}
