"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import StoreHeader from "./components/store/StoreHeader";
import StoreFooter from "./components/store/StoreFooter";
import { FaHome, FaShieldAlt, FaGift, FaTruck } from "react-icons/fa";
import { Dumbbell, Wheat, Feather, Heart, Flame, Leaf, ShieldCheck, CheckCircle, Mail, MessageCircle, Star, Sparkles } from "lucide-react";
import ContactPage from "./contact/page";
import CustomerReview from "./components/store/custorerreview";

/* ---------------- TYPES ---------------- */
type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  categoryId: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  image: string;
  link?: string | null;
};

/* ---------------- PAGE ---------------- */
export default function HomePage() {
  const catScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollBy = (dx: number) => {
    const el = catScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dx, behavior: 'smooth' });
  };
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [adding, setAdding] = useState<Record<string, boolean>>({});
  const [cartMsg, setCartMsg] = useState<Record<string, string | null>>({});
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Premium benefits data
  const benefitItems = [
    {
      title: "High Protein",
      desc: "Premium quality makhana rich in plant-based protein for healthy daily snacking.",
      Icon: Dumbbell,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Low Calories",
      desc: "Guilt-free snack that supports your wellness journey and clean eating goals.",
      Icon: Flame,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "100% Natural",
      desc: "No preservatives, no additives — just pure, clean ingredients from nature.",
      Icon: Leaf,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Heart Healthy",
      desc: "Low in cholesterol and sodium, perfect for maintaining cardiovascular health.",
      Icon: Heart,
      color: "from-pink-500 to-rose-600"
    },
    {
      title: "Rich in Antioxidants",
      desc: "Supports immunity and overall wellness with powerful natural antioxidants.",
      Icon: ShieldCheck,
      color: "from-purple-500 to-indigo-600"
    },
    {
      title: "Gluten Free",
      desc: "Safe and healthy snack option perfect for gluten-sensitive dietary needs.",
      Icon: CheckCircle,
      color: "from-amber-500 to-yellow-600"
    },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, cRes, bRes, wRes] = await Promise.all([
          fetch("/api/products?limit=100"),
          fetch("/api/categories"),
          fetch("/api/banners"),
          fetch("/api/wishlist"),
        ]);

        const p = await pRes.json();
        const c = await cRes.json();
        const b = await bRes.json();
        const w = await wRes.json().catch(() => ({ items: [] }));

        setProducts(p.products || []);
        setCategories(c.categories || []);
        setBanners(b.banners || []);
        setWishlist(new Set((w.items || []).map((item: any) => item.productId)));
      } catch (error) {
        console.error("Failed to load home data", error);
      }
    };
    load();
  }, []);

  const toggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isInWishlist = wishlist.has(productId);
    
    setWishlist(prev => {
      const newSet = new Set(prev);
      if (isInWishlist) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
    
    try {
      if (isInWishlist) {
        await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
    }
  };

  const hero = useMemo(() => banners[0], [banners]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped: Record<string, { category: Category; products: Product[] }> = {};
    
    categories.forEach((category) => {
      const categoryProducts = products.filter((p) => p.categoryId === category.id);
      if (categoryProducts.length > 0) {
        grouped[category.id] = {
          category,
          products: categoryProducts,
        };
      }
    });
    
    return Object.values(grouped);
  }, [products, categories]);

  return (
    <div className="min-h-screen bg-white">
      <StoreHeader categories={categories} initialSearch="" />
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-neutral-50">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-primary-600/5"></div>
        <div className="container-premium relative py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* LEFT CONTENT */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles size={16} />
                Premium Quality Makhana
              </div>
              
              <h1 className="font-poppins text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight text-balance">
                Healthy Snacking,
                <br />
                <span className="text-gradient">Redefined</span>
              </h1>
              
              <p className="text-lg md:text-xl text-neutral-600 mb-8 leading-relaxed text-pretty max-w-lg">
                Experience the finest roasted makhana, crafted with premium ingredients for your daily wellness journey.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/products"
                  className="btn-primary text-base px-8 py-4 shadow-premium"
                >
                  Shop Premium Collection
                </Link>
                <Link
                  href="#benefits"
                  className="btn-secondary text-base px-8 py-4"
                >
                  Discover Benefits
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 text-sm text-neutral-600">
                <div className="flex items-center gap-1">
                  <Star className="fill-primary-500 text-primary-500" size={16} />
                  <span className="font-medium">4.9</span>
                  <span>(2,847 reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="text-success-500" size={16} />
                  <span>100% Natural</span>
                </div>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="relative animate-slide-up">
              <div className="relative rounded-5xl overflow-hidden shadow-premium">
                <img
                  src="/banner.webp"
                  alt="Premium Makhana"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-premium text-sm font-medium">
                🌿 Premium Quality
              </div>
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-premium text-sm font-medium">
                💚 Heart Healthy
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="py-24 bg-gradient-to-b from-white to-neutral-100">
  <div className="container-premium">
    {/* Header */}
    <div className="text-center mb-20">
      <h2 className="font-poppins text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
        Explore Our Premium Range
      </h2>
      <p className="text-lg text-neutral-600 max-w-xl mx-auto">
        Handpicked makhana varieties crafted for taste, health, and indulgence
      </p>
    </div>

    {/* Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {[
        {
          href: "/products?category=roasted-makhana",
          image: "/images/roasted.png",
          title: "Roasted Makhana",
          desc: "Light & crunchy everyday perfection",
          gradient: "from-amber-400/20 to-orange-500/20",
        },
        {
          href: "/products?category=flavored-makhana",
          image: "/images/flavored.png",
          title: "Flavored Makhana",
          desc: "Bold & exciting taste profiles",
          gradient: "from-pink-400/20 to-rose-500/20",
        },
        {
          href: "/products?category=combo-packs",
          image: "/images/combo.png",
          title: "Combo Packs",
          desc: "Perfect variety for daily snacking",
          gradient: "from-blue-400/20 to-indigo-500/20",
        },
        {
          href: "/products?category=gifting",
          image: "/images/gifting.png",
          title: "Gifting Packs",
          desc: "Premium gift boxes for special moments",
          gradient: "from-purple-400/20 to-pink-500/20",
        },
      ].map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className="group relative rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl border border-neutral-200 shadow-md hover:shadow-2xl transition-all duration-500"
        >
          {/* Background Glow */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition duration-500`}
          />

          {/* Content */}
          <div className="relative z-10 p-6 flex flex-col h-full">
            {/* Image */}
            <div className="h-36 flex items-center justify-center mb-6 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="h-full object-contain transform group-hover:scale-110 transition duration-700"
              />
            </div>

            {/* Text */}
            <h3 className="font-poppins text-xl font-semibold text-neutral-900 mb-2 group-hover:translate-y-[-2px] transition">
              {item.title}
            </h3>

            <p className="text-sm text-neutral-600 mb-4">
              {item.desc}
            </p>

            {/* CTA */}
            <span className="mt-auto text-sm font-medium text-neutral-900 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition">
              Shop Now →
            </span>
          </div>
        </Link>
      ))}
    </div>
  </div>
</section>

      {/* ================= FEATURED PRODUCTS ================= */}
      {productsByCategory.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container-premium">
            <div className="text-center mb-16">
              <h2 className="font-poppins text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Our most loved premium makhana varieties
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsByCategory.flatMap(({ products: categoryProducts }) => 
                categoryProducts.slice(0, 4)
              ).map((product) => (
                <div
                  key={product.id}
                  className="product-card group"
                >
                  <div className="relative aspect-square bg-neutral-50 rounded-t-3xl overflow-hidden">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="product-image w-full h-full object-cover"
                      />
                    )}
                    <button
                      onClick={(e) => toggleWishlist(e, product.id)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-soft hover:shadow-medium transition-all duration-300 group"
                    >
                      <Heart
                        size={18}
                        className={wishlist.has(product.id) 
                          ? "fill-red-500 text-red-500" 
                          : "text-neutral-600 group-hover:text-red-500 transition-colors"
                        }
                        strokeWidth={1.5}
                      />
                    </button>
                  </div>
                  <div className="p-6">
                    <h3 className="font-poppins font-semibold text-neutral-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-2xl font-bold text-primary-600">₹{product.price}</p>
                      <span className="badge-premium">Premium</span>
                    </div>
                    <button
                      className="btn-primary w-full text-sm"
                      onClick={() => {
                        window.location.assign(`/products/${product.id}`);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= BENEFITS ================= */}
      <section id="benefits" className="py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="container-premium">
          <div className="text-center mb-16">
            <h2 className="font-poppins text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Why Choose Kosimila
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Premium quality, clean ingredients, and a snack you can trust daily
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {benefitItems.map(({ title, desc, Icon, color }, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-8 shadow-soft hover:shadow-premium transition-all duration-500 card-hover border border-neutral-100"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-soft`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="font-poppins text-xl font-semibold text-neutral-900 mb-3">
                  {title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CustomerReview />

      {/* ================= CORPORATE GIFTING ================= */}
      <section className="py-20 bg-white">
        <div className="container-premium">
          <div className="bg-gradient-to-br from-primary-50 to-neutral-50 rounded-5xl p-8 md:p-16 border border-primary-100">
            <div className="text-center mb-12">
              <h2 className="font-poppins text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Corporate Gifting
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Premium makhana gift boxes for employees, clients, and partners. 
                Clean, healthy, and delivered with care across multiple locations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* LEFT - CONTACT */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-premium">
                  <h3 className="font-poppins text-xl font-semibold text-neutral-900 mb-6">
                    Get in Touch
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <Mail className="text-primary-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">Email Us</p>
                        <p className="font-medium text-neutral-900">kosimila@gmail.com</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                      <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="text-success-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">WhatsApp</p>
                        <p className="font-medium text-neutral-900">6202058021</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <a
                      href={`https://wa.me/916202058021?text=${encodeURIComponent('Hello! I want to order premium makhana gift boxes.')}`}
                      target="_blank"
                      className="btn-primary flex-1 justify-center"
                    >
                      <MessageCircle size={18} />
                      WhatsApp
                    </a>
                    <a
                      href={`mailto:kosimila@gmail.com`}
                      className="btn-secondary flex-1 justify-center"
                    >
                      <Mail size={18} />
                      Email
                    </a>
                  </div>
                </div>

                <div className="text-sm text-neutral-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-success-500" size={16} />
                    <span>Bulk orders supported</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-success-500" size={16} />
                    <span>Custom branding available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-success-500" size={16} />
                    <span>Pan-India delivery</span>
                  </div>
                </div>
              </div>

              {/* RIGHT - FORM */}
              <div className="bg-white rounded-3xl p-8 shadow-premium">
                <h3 className="font-poppins text-xl font-semibold text-neutral-900 mb-6">
                  Send Inquiry
                </h3>
                <ContactPage />
              </div>
            </div>
          </div>
        </div>
      </section>

      <StoreFooter />
    </div>
  );
}
