"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Clock, 
  Flame, 
  ArrowRight, 
  ChefHat, 
  Utensils, 
  Leaf, 
  CheckCircle2,
  Search,
  BookOpen
} from "lucide-react";
import StoreHeader from "@/app/components/store/StoreHeader";
import StoreFooter from "@/app/components/store/StoreFooter";

interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  time: string;
  serves: string;
  calories: string;
  difficulty: string;
  category: string;
  tags: string[];
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Savory", "Sweet", "Main"];

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch("/api/recipes");
        const data = await res.json();
        setRecipes(data.recipes || []);
      } catch (error) {
        console.error("Failed to fetch recipes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || recipe.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#FCFBFA]">
      <StoreHeader categories={[]} initialSearch="" />

      {/* Hero Section */}
      <section className="bg-white border-b border-neutral-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-50/20 -skew-x-12 translate-x-1/4"></div>
        <div className="container-premium py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-bold mb-6 tracking-wide">
              <ChefHat size={18} />
              Culinary Inspiration
            </div>
            <h1 className="text-5xl md:text-7xl font-poppins font-bold text-neutral-900 mb-8 leading-tight">
              Gourmet <span className="text-gradient">Makhana</span> Creations
            </h1>
            <p className="text-xl text-neutral-600 mb-12 font-medium leading-relaxed max-w-2xl">
              Elevate your daily snacking and dining with our curated collection of healthy, delicious, and easy-to-follow makhana recipes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Find a recipe (e.g. 'Kheer')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-3xl bg-neutral-50 border-2 border-neutral-100 focus:border-primary-500 outline-none transition-all font-medium"
                />
              </div>
              <button className="btn-primary px-8">Search Recipes</button>
            </div>
          </div>
        </div>
      </section>

      {/* Recipe Grid Section */}
      <section className="container-premium py-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeCategory === cat 
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-100" 
                    : "bg-white text-neutral-600 border border-neutral-100 hover:bg-neutral-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-neutral-400">
            <BookOpen size={18} />
            <span>Showing {filteredRecipes.length} premium recipes</span>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-12">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[2/1] bg-white rounded-[3rem] animate-pulse shadow-soft border border-neutral-50"></div>
            ))}
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-12">
            {filteredRecipes.map((recipe) => (
              <Link 
                key={recipe.id}
                href={`/recipes/${recipe.slug}`}
                className="group flex flex-col md:flex-row bg-white rounded-[3rem] overflow-hidden shadow-soft border border-neutral-100 hover:shadow-premium transition-all duration-500 hover:-translate-y-2"
              >
                <div className="md:w-2/5 aspect-square md:aspect-auto relative overflow-hidden">
                  <img 
                    src={recipe.image} 
                    alt={recipe.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-neutral-900 border border-white/20">
                      {recipe.category}
                    </span>
                  </div>
                </div>
                
                <div className="md:w-3/5 p-10 flex flex-col">
                  <div className="flex items-center gap-4 mb-4 text-xs font-bold text-neutral-400">
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-primary-500" />
                      {recipe.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame size={14} className="text-orange-500" />
                      {recipe.calories}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4 group-hover:text-primary-600 transition-colors">
                    {recipe.title}
                  </h3>
                  
                  <p className="text-neutral-500 font-medium text-sm leading-relaxed mb-8 line-clamp-2">
                    {recipe.description}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex gap-2">
                      {recipe.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-900 group-hover:bg-primary-600 group-hover:text-white transition-all">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-neutral-200">
            <Utensils size={48} className="text-neutral-200 mx-auto mb-4" />
            <p className="text-neutral-400 font-bold text-xl">No recipes found matching your criteria.</p>
            <button onClick={() => { setSearchQuery(""); setActiveCategory("All"); }} className="text-primary-600 font-bold mt-2">View all recipes</button>
          </div>
        )}
      </section>

      {/* Featured Ingredient Section */}
      <section className="py-24 bg-neutral-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-600/10 skew-x-12"></div>
        <div className="container-premium relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-poppins font-bold leading-tight">
                The Secret to <span className="text-primary-500">Perfect Texture</span>
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed">
                All our recipes are designed specifically for Kosimila's Premium Grade Makhana. Our slow-roasting process ensures a crunch that holds up perfectly in curries and stays light in snacks.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  "Rich in Magnesium",
                  "Low Glycemic Index",
                  "Protein Packed",
                  "Zero Cholesterol"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-600/20 flex items-center justify-center text-primary-500">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="font-bold text-sm text-neutral-200">{item}</span>
                  </div>
                ))}
              </div>
              <div className="pt-6">
                <Link href="/products" className="btn-primary">Order Ingredients</Link>
              </div>
            </div>
            <div className="relative group">
              <div className="aspect-square rounded-[4rem] overflow-hidden border-8 border-white/5 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070&auto=format&fit=crop" 
                  alt="Premium Makhana" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-4xl shadow-2xl text-neutral-900 border border-neutral-100 hidden md:block animate-bounce-slow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-success-50 rounded-2xl flex items-center justify-center text-success-600">
                    <Leaf size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Natural Grade</p>
                    <p className="text-xl font-bold font-poppins">Premium A++</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <StoreFooter />
    </div>
  );
}
