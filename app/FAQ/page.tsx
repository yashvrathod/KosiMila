// app/faq/page.tsx or pages/faq.tsx

"use client";

import { useEffect, useState, type ElementType } from "react";
import StoreHeader, { type StoreHeaderCategory } from "../components/store/StoreHeader";
import StoreFooter from "../components/store/StoreFooter";
import { LuPlus, LuMinus, LuSparkles, LuHeart, LuShield, LuPackage, LuSearch } from "react-icons/lu";

type FAQItem = { q: string; a: string };
type FAQSection = { section: string; icon: ElementType; gradient: string; items: FAQItem[] };

const faqs: FAQSection[] = [
  {
    section: "Frequently Asked Questions",
    icon: LuSparkles,
    gradient: "from-amber-400 to-orange-400",
    items: [
      { q: "Are your ladoos completely homemade?", a: "Yes! All our ladoos are freshly handmade in small batches using traditional home-style methods." },
      { q: "Do you use preservatives or artificial flavors?", a: "No. Our ladoos contain zero preservatives, zero artificial flavors, and no refined sugar (where applicable)." },
      { q: "What ingredients do you use?", a: "We use premium dry fruits, pure desi ghee, jaggery, millets, nuts, and natural ingredients — nothing extra." },
      { q: "How long do the ladoos stay fresh?", a: "Dry Fruit / Besan / Rava: 12–15 days. Dink / Poushtik / Nachani: 7–10 days. Store in an airtight container." },
      { q: "Do you deliver?", a: "Yes, we offer local delivery and courier shipping depending on your location." },
      { q: "Can I place bulk or corporate orders?", a: "Absolutely! We take bulk, festive, wedding, and corporate orders with custom packaging options." },
      { q: "Are your ladoos suitable for kids and elders?", a: "Yes. Our ladoos are safe and nutritious for kids, pregnant women, elders, and fitness lovers." },
      { q: "Can I customize sweetness or ingredients?", a: "Yes! You can request less sweet, sugar-free, or ingredient adjustments depending on the ladoo type." },
      { q: "How do I store the ladoos?", a: "Store in a cool, dry place in an airtight container. No refrigeration needed unless instructed." },
      { q: "How do I place an order?", a: "Order via WhatsApp, Instagram, or our website contact form." },
      { q: "Do you offer gift packing?", a: "Yes! Premium gift boxes for festivals, birthdays, corporate gifting, and special occasions." },
      { q: "Are your products available year-round?", a: "Most ladoos are available year-round. Seasonal varieties may vary." }
    ]
  },
  {
    section: "Health, Diet & Ingredients",
    icon: LuHeart,
    gradient: "from-rose-400 to-pink-400",
    items: [
      { q: "Are your ladoos healthy?", a: "Yes. Made with natural ingredients, jaggery, nuts, seeds, millets, and desi ghee." },
      { q: "Do you use refined sugar?", a: "Most ladoos use jaggery. Sugar-free options are also available." },
      { q: "Are your ladoos suitable for diabetics?", a: "Sugar-free / low-glycemic options are available. Consume in moderation." },
      { q: "Are your ladoos good for pregnant women?", a: "Yes. Dink, Dry Fruit, and Poushtik ladoos are traditionally recommended." },
      { q: "Are your ladoos safe for kids?", a: "Absolutely. For toddlers, smaller portions are recommended." },
      { q: "Do your ladoos help with strength & immunity?", a: "Yes. Ingredients like nuts, jaggery, millets, and dink support energy and immunity." },
      { q: "Are your products vegan?", a: "Yes. We have special Laddos for Vegan." },
      { q: "Are your ladoos Poushtik?", a: "Some varieties like Dry Fruit and Nachani are Poushtik." },
      { q: "Are your ingredients organic?", a: "We use premium-quality ingredients and organic options wherever possible." },
      { q: "Do your ladoos contain allergens?", a: "Some contain nuts, ghee, or gluten. Please check before ordering." },
      { q: "Do you fry the ladoos?", a: "No. Our ladoos are slow-roasted and hand-rolled." },
      { q: "Can I get ladoos without ghee?", a: "Yes, We have Vegan Ladoos Option." },
      { q: "Are ladoos suitable for fitness enthusiasts?", a: "Yes! Dry Fruit, Nachani, and Poushtik ladoos are popular for energy." },
      { q: "Are any ladoos suitable for weight loss?", a: "Millet-based ladoos offer clean energy. Portion control is key." },
      { q: "Do ladoos help postpartum recovery?", a: "Yes. Dink, Aliv Ladoo is traditionally recommended for postpartum strength." }
    ]
  }
];

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>("0-0");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<StoreHeaderCategory[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json().catch(() => ({}));
        const cats = (Array.isArray((data as any)?.categories) ? (data as any).categories : []) as Array<{ id: string; name: string; slug: string }>
        setCategories(cats.map((c) => ({ id: String(c.id), name: String(c.name), slug: String(c.slug) })));
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  const filteredFaqs = faqs.map(section => ({
    ...section,
    items: section.items.filter(faq => 
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  return (
    <div className="min-h-screen bg-white">
      <StoreHeader categories={categories} />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 px-6 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(248,196,28,0.12),transparent_60%)]" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
           <LuSparkles size={16} />
            FAQ
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Questions? We've Got You Covered
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Find answers to common questions about our handmade ladoos
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"><LuSearch size={20} /></span>
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-full border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-gray-800 bg-white shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-y border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-3">
                <LuShield size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">100%</div>
              <div className="text-sm text-gray-600">Natural</div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-full mb-3">
                <LuHeart size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">Zero</div>
              <div className="text-sm text-gray-600">Preservatives</div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-600 rounded-full mb-3">
                <LuPackage size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">Fresh</div>
              <div className="text-sm text-gray-600">Daily</div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {filteredFaqs.map((section, sIdx) => {
          const IconComponent = section.icon;
          return (
            <div key={sIdx} className="mb-20 md:mb-24">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-0.5 w-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full mr-2" />
                <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${section.gradient} rounded-lg flex items-center justify-center`}>
                  <IconComponent size={20} color="#ffffff" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{section.section}</h2>
              </div>

              <div className="space-y-4 md:space-y-5">
                {section.items.map((faq, idx) => {
                  const key = `${sIdx}-${idx}`;
                  const isOpen = open === key;
                  
                  return (
                    <div 
                      key={key} 
                      className={`rounded-2xl border ${isOpen ? 'border-amber-300' : 'border-gray-200'} bg-white shadow-md hover:shadow-lg transition`}
                    >
                      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(90deg,rgba(248,196,28,0.10),rgba(244,114,182,0.08),rgba(251,146,60,0.10))] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className={`absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-amber-400 to-orange-400 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                      <button
                        onClick={() => setOpen(isOpen ? null : key)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${key}`}
                        className="btn-plain w-full flex justify-between items-start gap-5 px-6 sm:px-7 md:px-8 py-6 sm:py-7 md:py-8 text-left bg-transparent hover:bg-transparent transition-colors rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                      >
                        <div className="flex items-start gap-3 pr-2">
                          <span className="mt-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-gray-900 text-base md:text-lg leading-snug">
                            {faq.q}
                          </span>
                        </div>
                       <span className="inline-flex items-center justify-center rounded-full text-amber-600 p-1">
                          {isOpen ? <LuMinus size={20} /> : <LuPlus size={20} />}
                        </span>
                      </button>
                      
                      <div id={`faq-panel-${key}`} aria-hidden={!isOpen} className={`px-6 sm:px-7 md:px-8 bg-transparent border-t border-gray-100 overflow-hidden transition-[max-height] duration-300 ${isOpen ? 'max-h-[34rem] py-5 sm:py-6 md:py-7' : 'max-h-0 py-0'}`}>
                        <p className="text-gray-700 text-base leading-7">
                          {faq.a}
                        </p>
                      </div>
                      {/* end animated panel */}
                      {/* remove the conditional wrapper below if present */}
                      {false && (
                        <div id={`faq-panel-${key}`} className="px-5 sm:px-6 md:px-7 py-4 sm:py-5 md:py-6 bg-transparent border-t border-gray-100">
                          <p className="text-gray-700 text-base leading-7">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try different keywords</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-amber-700 to-amber-500 px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-amber-50 text-lg mb-8">
            We're here to help! Get in touch with our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors">
              Contact Us
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors">
              Shop Now
            </button>
          </div>
        </div>
      </div>

      <StoreFooter />
    </div>
  );
}