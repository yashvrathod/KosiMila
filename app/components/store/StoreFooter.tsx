"use client";
import Link from "next/link";

export default function StoreFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* BRAND */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Kosimila
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Premium makhana snacks made for healthy everyday living.
              Clean ingredients, bold flavors, and guilt-free snacking.
            </p>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Company
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/about" className="hover:text-gray-900 transition">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gray-900 transition">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-900 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* POLICIES */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Policies
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/privacy" className="hover:text-gray-900 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gray-900 transition">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* CONNECT */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Connect
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link
                  href="https://www.instagram.com/"
                  className="hover:text-gray-900 transition"
                >
                  Instagram
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900 transition">
                  Facebook
                </Link>
              </li>
              <li>
                <Link
                  href="https://wa.me/916202058021"
                  className="hover:text-gray-900 transition"
                >
                  WhatsApp
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="border-t border-gray-200 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">

          <p className="text-gray-500 text-center md:text-left">
            © {year} <span className="font-medium text-gray-900">Kosimila</span>.
            All rights reserved.
          </p>

          <p className="text-gray-400 text-xs">
            Healthy snacking • Clean ingredients • Made in India
          </p>

        </div>
      </div>
    </footer>
  );
}