"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderDoneInteractive() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [animKey, setAnimKey] = useState(0);

  const goStep = (next: 1 | 2) => {
    // trigger a small re-render key to restart fade animation
    setAnimKey((k) => k + 1);
    setStep(next);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="relative">
          <div
            key={`${step}-${animKey}`}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transition-all duration-300 ease-out animate-[fadeIn_300ms_ease-out]"
          >
            {step === 1 ? (
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Have you completed the payment process?</h1>
                <p className="mt-3 text-gray-600">Please confirm so we can guide you to the next steps.</p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => goStep(2)}
                    className="px-6 py-3 rounded-lg bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => alert("Please complete your payment first!")}
                    className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                  >
                    No
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
<h2 className="text-2xl md:text-3xl font-bold text-gray-900">
  Thank you for your visit !!</h2>                
<p className="mt-3 text-gray-600">
  We would love for you to visit our store again and share your feedback to help us improve!
</p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  
                  <button
                    onClick={() => router.push("/")}
                    className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                  >
                    Go to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
