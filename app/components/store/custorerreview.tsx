"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const reviews = [
  {
    name: "Mrs. Ruta",
    text: "The taste of KOSIMILA makhana is absolutely authentic and homely. The quality is clearly premium, and the packaging keeps everything fresh and crunchy. Delivery was on time and very well managed."
  },
  {
    name: "Avanti",
    text: "I loved how perfectly roasted and seasoned the makhana was. It tasted fresh, the packaging was neat and hygienic, and my order reached exactly within the promised delivery time."
  },
  {
    name: "Ankita",
    text: "KOSIMILA makhana exceeded my expectations in taste and quality. Each bite felt fresh and light. The packing was elegant and secure, making it perfect even for gifting. Delivery was quick and smooth."
  },
  {
    name: "Mrs. Deshpande",
    text: "The traditional roasted flavor reminded me of homemade snacks. Quality is consistently excellent, packing is clean and sturdy, and delivery was prompt without any follow-ups needed."
  },
  {
    name: "Mr. Tushar",
    text: "From taste to packaging, everything was impressive. The makhana was crunchy and flavorful, well-packed, and delivered right on schedule. Very professional service."
  },
  {
    name: "Mr. Avinash",
    text: "I truly appreciate the freshness and quality of KOSIMILA makhana. The packaging maintained the crunch perfectly, and the delivery was timely and hassle-free."
  },
  {
    name: "Mr. Sameer",
    text: "Excellent taste with premium quality ingredients and perfect roasting. The packing was strong and hygienic, and delivery was completed within the committed time. Highly reliable brand."
  },
  {
    name: "Priyanka",
    text: "The makhana was delicious, light, and perfectly seasoned. Packaging was attractive and secure, and delivery was fast and well-coordinated."
  },
  {
    name: "Pradeep",
    text: "KOSIMILA offers consistent quality and great taste in makhana. The packing ensured zero damage, and delivery was punctual. A brand I trust for healthy snacking and festive orders."
  }
];

export default function CustomerReviewsSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const prev = () =>
    setIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  const next = () =>
    setIndex((prev) => (prev + 1) % reviews.length);

  return (
   <section className="py-20 bg-gray-50">
  <div className="max-w-5xl mx-auto px-6 text-center">

    {/* HEADER */}
    <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
      Loved by Our Customers
    </h2>

    <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
      Over 200+ customers trust our makhana for its quality, taste, and health benefits.
    </p>

    {/* REVIEW CARD */}
    <div className="relative mt-14">

      <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-10 max-w-2xl mx-auto shadow-sm transition">

        {/* STARS */}
        <div className="flex justify-center mb-4">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-gray-900 text-lg">★</span>
          ))}
        </div>

        {/* TEXT */}
        <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
          “{reviews[index].text}”
        </p>

        {/* NAME */}
        <p className="font-medium text-gray-900">
          — {reviews[index].name}
        </p>
      </div>

      {/* NAV BUTTONS */}
      <button
        onClick={prev}
        className="absolute -left-4 md:-left-10 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-2 shadow-sm hover:shadow transition"
      >
        <ChevronLeft size={20} className="text-gray-700" />
      </button>

      <button
        onClick={next}
        className="absolute -right-4 md:-right-10 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-2 shadow-sm hover:shadow transition"
      >
        <ChevronRight size={20} className="text-gray-700" />
      </button>

    </div>

    {/* DOTS */}
    <div className="flex justify-center gap-2 mt-6">
      {reviews.map((_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full transition-all ${
            i === index ? "bg-gray-900 w-5" : "bg-gray-300"
          }`}
        />
      ))}
    </div>

  </div>
</section>
  );
}
