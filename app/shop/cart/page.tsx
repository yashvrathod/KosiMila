"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
  };
}

/* eslint-disable react-hooks/set-state-in-effect */

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setCartItems(data.cartItems || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch cart");
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      fetchCart();
    } catch (error) {
      console.error("Failed to update quantity");
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" });
      fetchCart();
    } catch (error) {
      console.error("Failed to remove item");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Your cart is empty</h2>
          <Link
            href="/"
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Shopping Cart</h1>
        <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Shipping (Pune):</strong> Free delivery for Pune.</li>
            <li><strong>Shipping (Outside Pune):</strong> Free delivery for orders above 2 kg.</li>
            <li><strong>Shipping (Outside Pune):</strong> Shipping charges for orders below 2 kg will be discussed and confirmed at the time of order.</li>
            <li><strong>Returns:</strong> No Return Policy.</li>
            <li><strong>Warranty:</strong> No Warranty.</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                    {item.product.images[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="text-2xl font-bold text-green-600 mb-4">
                      ₹{item.product.price.toLocaleString()}
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="p-2 hover:bg-gray-100 transition rounded-l"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 py-2 font-medium">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="p-2 hover:bg-gray-100 transition rounded-r"
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 transition"
                      >
                        <Trash2 size={18} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="bg-white rounded-xl p-6 shadow sticky top-4">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE*</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">*Shipping calculated at checkout based on location and weight</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="block w-full px-6 py-3 bg-primary-500 text-white text-center font-semibold rounded-lg hover:bg-primary-600 transition"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/products"
                  className="block w-full px-6 py-3 border text-center font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Add More Items
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
