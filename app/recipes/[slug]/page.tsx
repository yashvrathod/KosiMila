"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Clock, 
  Flame, 
  Users, 
  ChefHat, 
  ArrowLeft, 
  Share2, 
  Heart, 
  CheckCircle2,
  ChevronRight,
  Sparkles,
  UtensilsCrossed
} from "lucide-react";
import StoreHeader from "@/app/components/store/StoreHeader";
import StoreFooter from "@/app/components/store/StoreFooter";
import Link from "next/link";

interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  image: string;
  time: string;
  serves: string;
  calories: string;
  difficulty: string;
  category: string;
  tags: string[];
}

export default function RecipeDetailPage() {
  const params = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`/api/recipes/${params.slug}`);
        if (!res.ok) throw new Error("Recipe not found");
        const data = await res.json();
        setRecipe(data.recipe);
      } catch (error) {
        console.error("Failed to fetch recipe", error);
      } finally {
        setLoading(false);
      }
    };
    if (params.slug) fetchRecipe();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-12 rounded-[3rem] shadow-soft border border-neutral-100 max-w-md">
          <div className="w-20 h-20 bg-neutral-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <UtensilsCrossed size={40} className="text-neutral-400" />
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Recipe Not Found</h2>
          <p className="text-neutral-500 mb-8 font-medium">The gourmet creation you're looking for might have been moved or whisked away.</p>
          <Link href="/recipes" className="btn-primary inline-flex w-full justify-center">Back to Recipes</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBFA]">
      <StoreHeader categories={[]} initialSearch="" />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-neutral-100">
        <div className="container-premium py-4">
          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link href="/" className="text-neutral-500 hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={14} className="text-neutral-300" />
            <Link href="/recipes" className="text-neutral-500 hover:text-primary-600 transition-colors">Recipes</Link>
            <ChevronRight size={14} className="text-neutral-300" />
            <span className="text-primary-600 truncate max-w-[200px]">{recipe.title}</span>
          </nav>
        </div>
      </div>

      <article className="container-premium py-12 md:py-20">
        <div className="grid lg:grid-cols-12 gap-16">
          
          {/* Left: Content (8 Columns) */}
          <div className="lg:col-span-8 space-y-12">
            
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="bg-primary-50 text-primary-700 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary-100">
                  {recipe.category}
                </span>
                <span className="text-neutral-300">|</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Sparkles size={14} fill="currentColor" />
                  <span className="text-xs font-bold text-neutral-900 uppercase tracking-tighter">{recipe.difficulty} Level</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-poppins font-bold text-neutral-900 leading-tight">
                {recipe.title}
              </h1>
              
              <p className="text-xl text-neutral-500 leading-relaxed font-medium">
                {recipe.description}
              </p>
            </div>

            {/* Featured Image */}
            <div className="relative aspect-[16/9] rounded-[3rem] overflow-hidden shadow-premium-soft border border-neutral-100">
              <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
              <button 
                onClick={() => setWishlisted(!wishlisted)}
                className="absolute top-8 right-8 w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20 hover:scale-110 active:scale-95 transition-all"
              >
                <Heart size={24} className={wishlisted ? "text-red-500 fill-red-500" : "text-neutral-400"} />
              </button>
            </div>

            {/* Recipe Info Grid (Mobile) */}
            <div className="lg:hidden grid grid-cols-3 gap-4 bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-soft">
              <div className="text-center border-r border-neutral-100">
                <Clock size={20} className="mx-auto mb-2 text-primary-500" />
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Time</p>
                <p className="text-sm font-bold text-neutral-900">{recipe.time}</p>
              </div>
              <div className="text-center border-r border-neutral-100">
                <Users size={20} className="mx-auto mb-2 text-primary-500" />
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Serves</p>
                <p className="text-sm font-bold text-neutral-900">{recipe.serves}</p>
              </div>
              <div className="text-center">
                <Flame size={20} className="mx-auto mb-2 text-primary-500" />
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Calories</p>
                <p className="text-sm font-bold text-neutral-900">{recipe.calories}</p>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-soft border border-neutral-100">
              <div className="prose prose-neutral prose-lg max-w-none">
                <div className="whitespace-pre-wrap font-medium text-neutral-600 leading-relaxed text-lg">
                  {recipe.content}
                </div>
              </div>
            </div>

            {/* Share & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 border-t border-neutral-100">
              <div className="flex gap-4">
                {recipe.tags.map(tag => (
                  <span key={tag} className="bg-neutral-50 text-neutral-500 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="p-4 rounded-2xl border border-neutral-200 hover:bg-neutral-50 transition-colors">
                  <Share2 size={20} className="text-neutral-600" />
                </button>
                <Link href="/products" className="btn-primary px-8">Shop Ingredients</Link>
              </div>
            </div>
          </div>

          {/* Right: Sidebar (4 Columns) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Desktop Info Sidebar */}
            <div className="hidden lg:block bg-white rounded-[2.5rem] p-8 shadow-premium-soft border border-neutral-100 sticky top-32">
              <h3 className="text-xl font-bold text-neutral-900 mb-8 pb-4 border-b border-neutral-50 flex items-center gap-2">
                <ChefHat size={24} className="text-primary-600" /> Recipe Summary
              </h3>
              
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">Total Time</p>
                    <p className="text-lg font-bold text-neutral-900 leading-none">{recipe.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">Serving Size</p>
                    <p className="text-lg font-bold text-neutral-900 leading-none">{recipe.serves}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                    <Flame size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">Nutrition</p>
                    <p className="text-lg font-bold text-neutral-900 leading-none">{recipe.calories}</p>
                  </div>
                </div>

                <div className="pt-8 space-y-4">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest text-center">Quality Ingredients</p>
                  <div className="p-4 bg-neutral-900 rounded-[2rem] text-white overflow-hidden relative group cursor-pointer">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary-500/20 rounded-bl-[40px] transition-transform group-hover:scale-125"></div>
                    <p className="text-xs font-bold text-primary-400 mb-1">Featured Product</p>
                    <p className="text-lg font-bold font-poppins mb-4">Kosimila Premium Roasted Makhana</p>
                    <Link href="/products" className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-white hover:text-primary-400 transition-colors">
                      Shop Now <ArrowLeft size={14} className="rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Preparation Tips */}
            <div className="bg-primary-50 rounded-[2.5rem] p-8 border border-primary-100">
              <h4 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-primary-600" />
                Chef's Tips
              </h4>
              <ul className="space-y-4 text-sm text-primary-800 font-medium">
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                  Always dry roast makhana on low heat for the best crunch.
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                  Add salt only at the end to maintain crispiness.
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                  Store in an airtight container immediately after cooling.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </article>

      <StoreFooter />
    </div>
  );
}
