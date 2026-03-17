"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

function buildUpiUrl({
  vpa,
  name,
  amount,
  orderNumber,
  note,
}: {
  vpa: string;
  name?: string | null;
  amount: number;
  orderNumber: string;
  note?: string;
}) {
  const params = new URLSearchParams();
  params.set("pa", vpa);
  if (name) params.set("pn", name);
  params.set("am", amount.toFixed(2));
  params.set("cu", "INR");
  params.set("tr", orderNumber);
  if (note) params.set("tn", note);
  return `upi://pay?${params.toString()}`;
}

export default function OrderSuccessPage() {
  const params = useParams();
  const id = Array.isArray((params as any).id) ? (params as any).id[0] : (params as any).id as string;
  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load order");
        setOrder(data.order);
      } catch (e: any) {
        setError(e?.message || "Something went wrong");
      }
    })();
  }, [id]);

  // UPI details
  const upi = useMemo<{ url: string; vpa: string; qrImage: string }>(() => {
    if (!order) return { url: "", vpa: "", qrImage: "/images/qrimage.png" };

    const vpa = "bhaktipataskar10@okaxis"; // TODO: move to settings/env
    const name = "Bhakti Pataskar"; // optional display name
    const qrImage = "/images/qrimage.png"; // ensure file exists under public/images

    const url = buildUpiUrl({
      vpa,
      name,
      amount: order.total,
      orderNumber: order.orderNumber,
      note: `Payment for ${order.orderNumber}`,
    });

    return { url, vpa, qrImage };
  }, [order]);

  const whatsappLink = useMemo<string>(() => {
    if (!order) return "";
    const customer = order.shippingAddress;

    const lines = [
      "Payment Confirmation",
      `Order ID: ${order.orderNumber}`,
      `Name: ${customer?.name || "-"}`,
      `Mobile: ${customer?.phone || "-"}`,
      `Address: ${[
        customer?.addressLine1,
        customer?.addressLine2,
        customer?.city,
        customer?.state,
        customer?.pincode,
      ]
        .filter(Boolean)
        .join(", ")}`,
      "Items:",
      ...order.items.map(
        (it: any, idx: number) =>
          `${idx + 1}. ${it.product?.name} x ${it.quantity}`
      ),
      `Total: ₹${order.total}`,
      "Payment Mode: GPay (UPI)",
    ];
 const text = encodeURIComponent(lines.join("\n"));
     return `https://wa.me/916202058021?text=${text}`;
  }, [order]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-6 shadow">
          <h1 className="text-2xl font-bold text-green-700">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-700 mt-2">
            Your order has been recorded. Please complete payment using GPay.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600">Order ID</p>
              <p className="text-xl font-semibold">{order.orderNumber}</p>

              <p className="text-gray-600 mt-4">Total Payable</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{order.total}
              </p>

              <div className="mt-6">
                {upi.url ? (
                  <a href={upi.url} target="_blank" rel="noreferrer">
                    <img
                      src={upi.qrImage}
                      alt="GPay UPI QR"
                      className="w-60 h-60 border rounded object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const el = document.getElementById('qr-fallback');
                        if (el) el.style.display = 'block';
                      }}
                    />
                  </a>
                ) : (
                  <img
                    src={upi.qrImage}
                    alt="GPay UPI QR"
                    className="w-60 h-60 border rounded object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const el = document.getElementById('qr-fallback');
                      if (el) el.style.display = 'block';
                    }}
                  />
                )}
                <div id="qr-fallback" style={{display:'none'}} className="mt-2 text-sm text-red-600">QR image failed to load. Ensure the file exists at {upi.qrImage}.</div>
                <p className="text-sm text-gray-600 mt-2">Scan with GPay / PhonePe / Paytm</p>
                <p className="text-sm text-gray-600">
                  UPI ID: {upi.vpa ? (
                    upi.url ? (
                      <a className="text-blue-600 underline" href={upi.url} target="_blank" rel="noreferrer"><b>{upi.vpa}</b></a>
                    ) : (
                      <b>{upi.vpa}</b>
                    )
                  ) : (
                    <span className="text-gray-500">Not available</span>
                  )}
                </p>
              </div>
            </div>

            <div className="border-l pl-6">
              <h2 className="font-semibold mb-2">
                Confirm Payment via WhatsApp
              </h2>
              <p className="text-sm text-gray-600">
                After completing payment in GPay, tap the button below to send us your payment confirmation on WhatsApp. This helps us verify and process your order quickly.
              </p>

              <div className="mt-4">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-5 py-3 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Confirm Payment on WhatsApp
                </a>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold">Items</h3>
                <ul className="list-disc pl-5 text-sm mt-2">
                  {order.items.map((it: any) => (
                    <li key={it.id}>
                      {it.product?.name} x {it.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
               <p className="text-red-500"> If you done with payment and message confirmation</p> <br />

                <a
                  href="/order-done"
                   className="inline-block px-5 py-3 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Click here
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 text-yellow-800 rounded">
            Note: Payments via QR are verified manually after WhatsApp
            confirmation.
          </div>
        </div>
      </div>
    </div>
  );
}
