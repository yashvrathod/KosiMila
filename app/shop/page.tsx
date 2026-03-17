"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingCart, User, Heart, MapPin } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: string[];
  ratings: number;
  reviewCount: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export default function ShopHomepage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?limit=12&featured=true");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      setWishlist(new Set((data.items || []).map((item: any) => item.productId)));
    } catch (error) {
      console.error("Failed to fetch wishlist");
    }
  };

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
      setWishlist(prev => {
        const newSet = new Set(prev);
        if (isInWishlist) {
          newSet.add(productId);
        } else {
          newSet.delete(productId);
        }
        return newSet;
      });
      console.error("Failed to update wishlist:", error);
    }
  };

  const calculateDiscount = (price: number, comparePrice?: number) => {
    if (!comparePrice) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="bg-primary-500 text-white">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
            <Link href="/" className="font-bold text-lg">
              Ladoo
            </Link>
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>Deliver to Narnaund 126152</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <input
              type="text"
              placeholder="Search for products, brands and more"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            />
            <Search className="absolute right-3 top-2.5 text-primary-500" size={20} />
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-6">
            <Link href="/login" className="flex items-center gap-2 hover:text-primary-600">
              <User size={20} />
              <span className="font-medium">Login</span>
            </Link>
            <Link href="/wishlist" className="flex items-center gap-2 hover:text-primary-600">
              <Heart size={20} />
              <span>Wishlist</span>
            </Link>
            <Link href="/cart" className="flex items-center gap-2 hover:text-primary-600 relative">
              <ShoppingCart size={20} />
              <span>Cart</span>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                0
              </span>
            </Link>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="border-t">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-6 py-3 overflow-x-auto">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="whitespace-nowrap hover:text-primary-600 font-medium"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Policy Notice */}
      <section className="bg-yellow-50 border-y border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 py-2 text-sm text-yellow-900 text-center">
          <span className="font-medium">Shipping:</span> Free delivery for Pune · Outside Pune free for orders above 2 kg
          <span className="mx-2">|</span>
          <span className="font-medium">Returns:</span> No Return Policy
          <span className="mx-2">|</span>
          <span className="font-medium">Warranty:</span> No Warranty
        </div>
      </section>

      {/* Banner Section */}
      <section className="bg-white mb-4">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl p-12 text-white text-center">
            <h1 className="text-4xl font-bold mb-4">Big Billion Days Sale</h1>
            <p className="text-xl mb-6">Up to 80% off on Electronics, Fashion & More</p>
            <button className="bg-white text-primary-500 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition">
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="bg-white mb-4">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`} className="text-center group">
                <div className="w-full aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition"
                    />
                  )}
                </div>
                <p className="font-medium group-hover:text-primary-600">{category.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white mb-8">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Best Deals on Products</h2>
            <Link href="/products" className="text-primary-600 font-medium hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="border rounded-xl p-4 hover:shadow-lg transition group bg-white"
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
                  {product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition"
                    />
                  )}
                  <button
                    onClick={(e) => toggleWishlist(e, product.id)}
                    className="wishlist-heart-btn"
                    aria-label="Add to wishlist"
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      padding: '5px',
                      margin: '0',
                      cursor: 'pointer',
                      outline: 'none',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                      borderRadius: '50%',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '30px',
                      height: '30px',
                    }}
                  >
                    <Heart
                      size={16}
                      className={wishlist.has(product.id) ? "fill-red-500 text-red-500" : "text-gray-700"}
                      strokeWidth={1.5}
                    />
                  </button>
                </div>
                <h3 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-primary-600">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600 font-semibold">₹{product.price.toLocaleString()}</span>
                  {product.comparePrice && (
                    <>
                      <span className="text-gray-400 line-through text-sm">₹{product.comparePrice.toLocaleString()}</span>
                      <span className="text-green-600 text-sm font-medium">
                        {calculateDiscount(product.price, product.comparePrice)}% off
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="bg-green-600 text-white px-2 py-0.5 rounded flex items-center gap-1">
                    <span>{product.ratings}</span>
                    <span>★</span>
                  </div>
                  <span className="text-gray-500">({product.reviewCount})</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">ABOUT</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/press" className="hover:text-white">Press</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">HELP</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white">Payments</Link></li>
                <li><Link href="/help" className="hover:text-white">Shipping</Link></li>
                <li><Link href="/help" className="hover:text-white">Returns</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">POLICY</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="hover:text-white">Terms of Use</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">SOCIAL</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">Facebook</Link></li>
                <li><Link href="#" className="hover:text-white">Twitter</Link></li>
                <li><Link href="#" className="hover:text-white">Instagram</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-center">
            <p>© 2024 Ladoo Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
