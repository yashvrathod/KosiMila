# QR Code Payment Flow - Setup Guide

## Overview
✅ Payment system has been completely refactored to eliminate Razorpay and implement a simple, UPI-based QR code payment system.

---

## What Changed

### ✅ NEW ENDPOINTS CREATED

#### 1. **POST `/api/orders/{id}/generate-qr`**
- **Purpose:** Generate UPI QR code for payment
- **Auth:** User (or admin)
- **Request:** Empty body
- **Response:**
  ```json
  {
    "orderId": "string",
    "orderNumber": "string",
    "amount": number,
    "upiString": "upi://pay?pa=...",
    "simpleUPI": "upi://pay?pa=...",
    "qrCodeData": { "text": "...", "size": 300 },
    "message": "Scan with any UPI app..."
  }
  ```
- **File:** `app/api/orders/[id]/generate-qr/route.ts`

#### 2. **POST `/api/orders/{id}/confirm-payment`** (NEW UNIFIED ENDPOINT)
- **Purpose:** Confirm payment for an order
- **Auth:** User (who placed order) OR Admin
- **Key Features:**
  - ✅ Validates stock before deducting
  - ✅ Deducts stock atomically in transaction
  - ✅ Clears cart AFTER stock is deducted
  - ✅ Prevents duplicate processing
  - ✅ Works for both manual verification and user confirmation
- **File:** `app/api/orders/[id]/confirm-payment/route.ts`

---

## Current Cart Logic - ✅ CORRECT

```
1. User adds items → /api/cart (POST) ✓
2. User views cart → /api/cart (GET) ✓
3. User updates quantity → /api/cart (PUT) ✓
4. User removes item → /api/cart (DELETE) ✓
```

**Status:** No changes needed - working correctly!

---

## Payment Flow - NOW CORRECTED

### OLD FLOW (BROKEN):
```
Razorpay Flow:
1. POST /api/payments/razorpay/create-order
   - Creates order
   - Clears cart IMMEDIATELY ❌
   - Increments coupon usage
   - Creates Razorpay order
2. User opens Razorpay modal
3. If payment fails → Cart already gone ❌
4. If payment success → POST /api/payments/razorpay/verify
   - NO STOCK DEDUCTION ❌
5. Webhook fires but also doesn't deduct stock ❌

Manual COD Flow:
1. POST /api/orders
   - Creates order
   - Doesn't clear cart
2. Admin manually verifies
   - Clears cart
   - Deducts stock ✓
```

### NEW FLOW (CORRECT):
```
QR Code Flow (UNIFIED):
1. POST /api/orders
   - Creates order with status=PENDING
   - Does NOT clear cart
   - Does NOT deduct stock
   
2. POST /api/orders/{id}/generate-qr
   - Generates UPI string
   - Returns QR code data
   
3. User scans QR with any UPI app
   - Each app (Google Pay, PhonePe, Paytm, etc.) can scan
   - Payment is sent to configured UPI account
   
4. POST /api/orders/{id}/confirm-payment (after payment received)
   - VALIDATES stock ✓
   - ATOMICALLY deducts stock ✓
   - CLEARS cart ✓
   - Updates order status to CONFIRMED ✓
```

---

## Environment Variables Required

Add these to your `.env.local` file:

```env
# UPI Payment Configuration
UPI_ID=merchant@upi              # Your UPI ID (e.g., business@okhdfcbank)
MERCHANT_NAME=Kosimila           # Your business name

# Database (existing)
DATABASE_URL=postgresql://...

# JWT Secret (existing)
NEXTAUTH_SECRET=your-secret-key

# Optional - for future WhatsApp/Email integrations
WHATSAPP_API_KEY=...
SMTP_FROM=noreply@kosimila.com
```

---

## What to Update in Frontend

### Checkout Page Changes Needed

**Old approach (hardcoded to COD):**
```typescript
// ❌ OLD
paymentMethod: "COD"
```

**New approach (QR code):**
```typescript
// ✅ NEW
paymentMethod: "QR_CODE"

// Then after order created:
const qrRes = await fetch(`/api/orders/${orderId}/generate-qr`, {
  method: "POST"
});
const { upiString } = await qrRes.json();

// Display QR code using library
// Client: npm install qrcode
import QRCode from "qrcode";
QRCode.toDataURL(upiString, (err, url) => {
  // Display url as <img src={url} />
});
```

---

## Payment Verification Flow

### For MERCHANT ADMIN:
- Admin can verify payment manually without QR
- POST `/api/orders/{id}/confirm-payment`
- Used for COD orders or when customer shows payment proof

### For CUSTOMERS:
- Customer clicks "Payment Done, Confirm" after scanning QR
- Frontend calls POST `/api/orders/{id}/confirm-payment`
- System updates order and clears cart

---

## Stock Deduction - NOW CORRECT

**Location:** `POST /api/orders/{id}/confirm-payment`

**Logic:**
```typescript
// 1. Fetch outstanding orders product by product
for (const item of order.items) {
  const product = await tx.product.findUnique({...});
  
  // 2. VALIDATE stock exists
  if (product.stock < item.quantity) {
    throw new Error(`Insufficient stock for ${product.name}`);
  }
  
  // 3. ATOMICALLY decrement
  await tx.product.update({
    data: { stock: { decrement: item.quantity } }
  });
}

// 4. ONLY then clear cart
await tx.cartItem.deleteMany({...});
```

**Key Features:**
- ✅ Uses transaction - all or nothing
- ✅ Validates before deducting
- ✅ Prevents negative stock
- ✅ Cart only cleared on success

---

## Removing Razorpay

These files can be **DELETED or DISABLED**:

```
❌ /app/api/payments/razorpay/create-order/route.ts
❌ /app/api/payments/razorpay/verify/route.ts
❌ /app/api/payments/razorpay/webhook/route.ts
❌ /lib/razorpay.ts
❌ /app/api/admin/orders/[id]/verify-payment/route.ts (old endpoint)
```

These npm packages can be **removed** from package.json:
```json
{
  "dependencies": {
    "razorpay": "^2.9.6"  // ❌ DELETE THIS
  }
}
```

---

## Verification Checklist

- [ ] `.env.local` has `UPI_ID` and `MERCHANT_NAME`
- [ ] `/api/orders/{id}/generate-qr` endpoint working
- [ ] `/api/orders/{id}/confirm-payment` endpoint working
- [ ] Stock validation is working
- [ ] Cart cleared after payment confirmed
- [ ] Order status moves to CONFIRMED after payment
- [ ] Old Razorpay endpoints removed/disabled
- [ ] Checkout page updated to use new flow

---

## API ENDPOINT REFERENCE

### Order Creation
```bash
POST /api/orders
{
  "shippingAddress": {...},
  "paymentMethod": "QR_CODE",
  "couponCode": "SUMMER20" (optional)
}
```

### Generate QR
```bash
POST /api/orders/{orderId}/generate-qr
```

### Confirm Payment
```bash
POST /api/orders/{orderId}/confirm-payment
```

---

## Known Limitations & Future Improvements

1. **No webhook from UPI providers** - Currently manual confirmation only
   - Future: Integrate with UPI aggregators (Instamojo, Razorpay UPI lite, etc.)
   
2. **No automatic payment detection** - Admin must verify OR user confirms
   - Future: Webhook integration for automatic confirmation

3. **QR expires on page refresh** - UPI string is regenerated
   - This is fine - UPI strings don't expire, just regenerate

4. **No payment timeout tracking** - Admin needs to check manually
   - Future: Add order timeout and auto-cancel if not paid

---

## Testing

### Manual Test Flow:
1. Add items to cart
2. Go to checkout
3. Enter address
4. Click "Proceed to Payment"
5. See QR code
6. In real scenario: User scans QR and pays via UPI app
7. For testing: Click "Payment Done, Confirm"
8. Order should be created as CONFIRMED with stock deducted

### Admin Verification Test:
1. Do steps 1-5 above
2. As admin, go to Orders page
3. Find PENDING order
4. Click "Verify Payment"
5. Order should move to CONFIRMED

---

## Support

For questions about the new payment flow:
- Check `/api/orders/[id]/confirm-payment/route.ts` for stock logic
- Check `/api/orders/[id]/generate-qr/route.ts` for QR generation
- Check `/app/checkout/page.tsx` for frontend implementation

