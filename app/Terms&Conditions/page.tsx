"use client";

import Link from "next/link";
import StoreHeader, { type StoreHeaderCategory } from "@/app/components/store/StoreHeader";
import StoreFooter from "@/app/components/store/StoreFooter";
import { useEffect, useState } from "react";

export default function TermsAndConditionsPage() {
  const [categories, setCategories] = useState<StoreHeaderCategory[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json().catch(() => ({}));
        const cats = (Array.isArray((data as any)?.categories) ? (data as any).categories : []) as Array<{ id: string; name: string; slug: string }>;
        setCategories(cats.map((c) => ({ id: String(c.id ?? c.slug ?? c.name), name: String(c.name), slug: String(c.slug) })));
      } catch {
        setCategories([]);
      }
    })();
  }, []);
  return (
    <div className="bg-[#FFF8F1] min-h-screen">
      <StoreHeader categories={categories} />
      <main>
      {/* Header Nav */}
      

      {/* Hero */}
      <section className="bg-gradient-to-r from-[#C8A24D] to-[#B8963D] text-white py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Terms & Conditions
          </h1>
          <p className="text-sm opacity-90">
            Please read these terms carefully before placing an order with LADOOZI
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 space-y-6 text-gray-700 leading-relaxed">
          <p>
            <strong>LADOOZI</strong> is a home-made, hand-crafted Ladoo business
            based in <strong>Pune, Maharashtra</strong>. By accessing our website
            or placing an order, you agree to the following Terms & Conditions.
          </p>

          <ul className="list-disc pl-6 space-y-3">
            <li>
              All products are freshly prepared. Minor variations in size, colour,
              or taste may occur due to handmade preparation.
            </li>

            <li>
              Orders once confirmed <strong>cannot be cancelled or modified</strong>.
            </li>

            <li>
              Prices are mentioned in <strong>INR</strong> and may change without
              prior notice.
            </li>

            <li>
              Payment must be made in advance using approved payment methods.
            </li>

            <li>
              Delivery timelines are estimated and may vary due to location,
              weather, or courier delays.
            </li>

            <li>
              Due to the perishable nature of food items,{" "}
              <strong>no returns or refunds</strong> are accepted after delivery.
            </li>

            <li>
              Customers must follow storage and consumption instructions provided
              with the product.
            </li>

            <li>
              Products may contain{" "}
              <strong>nuts, dairy, gluten, or other allergens</strong>. Customers
              with allergies or medical conditions should consult a medical
              professional before consumption.
            </li>

            <li>
              Sugar-free or jaggery-based options do not imply medical or
              therapeutic benefits.
            </li>

            <li>
              LADOOZI is not responsible for quality issues due to improper
              storage or delayed consumption.
            </li>

            <li>
              All website content, including text, images, logos, and designs, is
              the intellectual property of <strong>LADOOZI</strong>.
            </li>

            <li>
              LADOOZI shall not be liable for:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Indirect or consequential damages</li>
                <li>Delays beyond our control</li>
                <li>Misuse of products after delivery</li>
              </ul>
            </li>

            <li>
              Total liability, if any, is limited to the value of the product
              purchased.
            </li>

            <li>
              Users must not misuse the website or attempt unauthorized access.
            </li>

            <li>
              LADOOZI reserves the right to modify these Terms & Conditions at any
              time. Continued use implies acceptance of updated terms.
            </li>
          </ul>

          {/* Highlight */}
          <div className="bg-[#FFF4D6] border border-[#E5C77A] rounded-xl p-5 text-center">
            <p className="font-medium text-[#8A6A1F]">
              ✨ By placing an order with LADOOZI, you agree to these Terms &
              Conditions.
            </p>
          </div>

          <p className="text-sm text-gray-500">
            Governed by Indian laws with jurisdiction in{" "}
            <strong>Pune, Maharashtra</strong>.
          </p>

          {/* Back */}
          <div className="pt-4 text-center">
            <Link
              href="/"
              className="inline-block text-[#C8A24D] font-medium hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>

      </main>
      <StoreFooter />
    </div>
  );
}
