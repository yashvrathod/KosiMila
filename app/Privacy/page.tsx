"use client";

import Link from "next/link";
import StoreHeader, { type StoreHeaderCategory } from "@/app/components/store/StoreHeader";
import StoreFooter from "@/app/components/store/StoreFooter";
import { useEffect, useState } from "react";

export default function PrivacyPolicyPage() {
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
      

      {/* Header */}
      <section className="bg-gradient-to-r from-[#C8A24D] to-[#B8963D] text-white py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm opacity-90">
            Your trust matters to us, just like the purity in every handmade Ladoo
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 space-y-6 text-gray-700 leading-relaxed">

          <p>
            At <strong>LADOOZI</strong>, we value your trust and are committed to
            protecting your personal information. This Privacy Policy explains
            how we collect, use, store, and protect your information when you
            visit our website or place an order with us.
          </p>

          <p>
            By accessing or using the LADOOZI website, you agree to the practices
            described in this policy.
          </p>

          {/* About */}
          <h2 className="text-xl font-semibold text-[#2F2418]">
            About Us
          </h2>
          <p>
            <strong>LADOOZI</strong> is a home-made, hand-crafted Ladoo business
            based in <strong>Pune, Maharashtra, India</strong>, offering freshly
            prepared traditional Ladoos made with care and quality ingredients.
          </p>

          {/* Information Collection */}
          <h2 className="text-xl font-semibold text-[#2F2418]">
            Information We Collect
          </h2>
          <p>
            We collect basic personal details such as your name, contact number,
            email address, and delivery address strictly for order processing and
            providing better service.
          </p>

          {/* Use of Info */}
          <h2 className="text-xl font-semibold text-[#2F2418]">
            Use of Information
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Order confirmation and delivery</li>
            <li>Customer support and communication</li>
            <li>Service improvement</li>
          </ul>

          <p>
            We <strong>do not sell, share, or misuse</strong> your personal data.
          </p>

          {/* Payments */}
          <h2 className="text-xl font-semibold text-[#2F2418]">
            Payments
          </h2>
          <p>
            All payments are processed through secure third-party payment
            gateways. LADOOZI does <strong>not</strong> store your card, UPI, or
            banking details.
          </p>

          {/* Security */}
          <h2 className="text-xl font-semibold text-[#2F2418]">
            Data Security
          </h2>
          <p>
            We take reasonable measures to protect your personal information.
            However, please note that no method of online data transmission is
            100% secure.
          </p>

          {/* Third Party */}
          <h2 className="text-xl font-semibold text-[#2F2418]">
            Third-Party Services
          </h2>
          <p>
            Your information may be shared only with delivery or payment partners
            as required to complete your order.
          </p>

          {/* Cookies */}
          <h2 className="text-xl font-semibold text-[#2F2418]">
            Cookies & Tracking Technologies
          </h2>
          <p>
            Our website may use cookies to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Enhance browsing experience</li>
            <li>Understand visitor behaviour</li>
            <li>Improve website functionality</li>
          </ul>
          <p>
            You can disable cookies through your browser settings, though some
            features of the website may not function properly.
          </p>

          {/* Children */}
          <h2 className="text-xl font-semibold text-[#2F2418]">
            Children’s Privacy
          </h2>
          <p>
            LADOOZI does not knowingly collect personal information from children
            under the age of 18. If such information is identified, it will be
            deleted promptly.
          </p>

          {/* Updates */}
          <h2 className="text-xl font-semibold text-[#2F2418]">
            Policy Updates
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will
            be posted on this page. Continued use of the website implies
            acceptance of the updated policy.
          </p>

          {/* Contact */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
            <p className="font-medium text-amber-700">
              For any privacy-related questions, please contact:
            </p>
            <p className="mt-1 font-semibold text-[#2F2418]">
              LADOOZI – Pune, Maharashtra
            </p>
          </div>

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
