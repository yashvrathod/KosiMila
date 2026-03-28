"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, ChefHat, Clock, Flame, Users } from "lucide-react";
import ImageUpload from "@/app/components/ImageUpload";

// -------------------- Types --------------------
type RecipeListItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  image: string;
  active: boolean;
  createdAt: string;
};

type RecipeDetail = {
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
  active: boolean;
  featured: boolean;
};

type RecipeFormState = {
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
  tags: string;
  active: boolean;
  featured: boolean;
};

// -------------------- Utils --------------------
function toFormState(r?: RecipeDetail | null): RecipeFormState {
  return {
    title: r?.title ?? "",
    slug: r?.slug ?? "",
    description: r?.description ?? "",
    content: r?.content ?? "",
    image: r?.image ?? "",
    time: r?.time ?? "",
    serves: r?.serves ?? "",
    calories: r?.calories ?? "",
    difficulty: r?.difficulty ?? "Easy",
    category: r?.category ?? "Savory",
    tags: (r?.tags ?? []).join(", "),
    active: r?.active ?? true,
    featured: r?.featured ?? false,
  };
}

// -------------------- Button Component --------------------
function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  icon,
  type = "button",
  className = "",
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  icon?: React.ReactNode;
  type?: "button" | "submit";
  className?: string;
}) {
  const base = "inline-flex items-center gap-2 px-4 py-2 rounded font-medium transition-all";
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 shadow-sm",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "text-gray-600 hover:text-primary-600 hover:bg-primary-50",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {icon && icon} {children}
    </button>
  );
}

// -------------------- Admin Recipes Page --------------------
export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<RecipeDetail | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // -------------------- Fetching --------------------
  const fetchRecipes = async () => {
    const res = await fetch("/api/recipes?admin=true");
    const data = await res.json();
    setRecipes(data.recipes || []);
  };

  useEffect(() => {
    void fetchRecipes();
  }, []);

  // -------------------- Filtering --------------------
  const filteredRecipes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter((r) => 
      r.title.toLowerCase().includes(q) || 
      r.category.toLowerCase().includes(q)
    );
  }, [recipes, searchQuery]);

  // -------------------- Modal Actions --------------------
  const openCreate = () => {
    setEditingId(null);
    setEditingRecipe(null);
    setShowModal(true);
  };

  const openEdit = async (id: string) => {
    setEditingId(id);
    setEditingRecipe(null);
    setShowModal(true);
    setLoadingEdit(true);
    try {
      const res = await fetch(`/api/recipes/${id}`);
      const data = await res.json();
      setEditingRecipe(data.recipe);
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this recipe?")) return;
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    await fetchRecipes();
  };

  const closeModal = async () => {
    setShowModal(false);
    setEditingId(null);
    setEditingRecipe(null);
    await fetchRecipes();
  };

  // -------------------- Render --------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recipes</h1>
          <p className="text-sm text-gray-600">Manage culinary inspiration for your customers</p>
        </div>
        <Button onClick={openCreate} icon={<Plus size={18} />}>
          Add Recipe
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-3">
          <Search size={18} className="text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes by title or category..."
            className="w-full outline-none"
          />
        </div>
      </div>

      {/* Recipes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {["Recipe", "Category", "Status", "Actions"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRecipes.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {r.image && (
                        <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{r.title}</div>
                      <div className="text-xs text-gray-500">slug: {r.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <span className="bg-gray-100 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {r.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${r.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {r.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 flex justify-end gap-2">
                  <Button icon={<Eye size={18} />} onClick={() => window.open(`/recipes/${r.slug}`, "_blank")} variant="ghost" className="p-2" />
                  <Button icon={<Edit size={18} />} onClick={() => void openEdit(r.id)} variant="ghost" className="p-2" />
                  <Button icon={<Trash2 size={18} />} onClick={() => void handleDelete(r.id)} variant="danger" className="p-2" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRecipes.length === 0 && (
          <div className="p-6 text-center text-gray-600">No recipes found.</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => void closeModal()}>
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b">
              <h2 className="text-2xl font-bold">{editingId ? "Edit Recipe" : "Create New Recipe"}</h2>
              <button onClick={() => void closeModal()} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            {editingId && loadingEdit ? (
              <div className="py-20 text-center text-gray-600 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                <span>Loading recipe details...</span>
              </div>
            ) : (
              <RecipeForm
                initial={toFormState(editingRecipe)}
                recipeId={editingId}
                onDone={() => void closeModal()}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------- Recipe Form --------------------
function RecipeForm({ initial, recipeId, onDone }: { initial: RecipeFormState; recipeId: string | null; onDone: () => void; }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<RecipeFormState>(initial);

  useEffect(() => { setForm(initial); }, [initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const url = recipeId ? `/api/recipes/${recipeId}` : "/api/recipes";
      const method = recipeId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save recipe");
      }
      onDone();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save recipe");
    } finally { setSaving(false); }
  };

  const autoGenerateSlug = (title: string) => {
    if (!recipeId) {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      setForm(prev => ({ ...prev, title, slug }));
    } else {
      setForm(prev => ({ ...prev, title }));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recipe Title</label>
          <input 
            className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-500 outline-none transition-all font-medium" 
            value={form.title} 
            onChange={(e) => autoGenerateSlug(e.target.value)} 
            placeholder="e.g. Royal Makhana Kheer"
            required 
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Slug (URL)</label>
          <input 
            className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-500 outline-none transition-all font-medium" 
            value={form.slug} 
            onChange={(e) => setForm({ ...form, slug: e.target.value })} 
            placeholder="e.g. royal-makhana-kheer"
            required 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
          <select 
            className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-500 outline-none transition-all font-medium appearance-none bg-white" 
            value={form.category} 
            onChange={(e) => setForm({ ...form, category: e.target.value })} 
            required
          >
            <option value="Savory">Savory</option>
            <option value="Sweet">Sweet</option>
            <option value="Main">Main Course</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Difficulty Level</label>
          <select 
            className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-500 outline-none transition-all font-medium appearance-none bg-white" 
            value={form.difficulty} 
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })} 
            required
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Clock size={14} /> Time
          </label>
          <input className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-500 outline-none font-medium" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="15 mins" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Users size={14} /> Serves
          </label>
          <input className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-500 outline-none font-medium" value={form.serves} onChange={(e) => setForm({ ...form, serves: e.target.value })} placeholder="2 People" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Flame size={14} /> Calories
          </label>
          <input className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-500 outline-none font-medium" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} placeholder="120 kcal" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Short Description</label>
        <textarea 
          className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-500 outline-none transition-all font-medium min-h-[80px]" 
          value={form.description} 
          onChange={(e) => setForm({ ...form, description: e.target.value })} 
          placeholder="A brief overview of the dish..."
          required 
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recipe Content (Ingredients & Steps)</label>
        <textarea 
          className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-500 outline-none transition-all font-medium min-h-[300px] font-mono text-sm" 
          value={form.content} 
          onChange={(e) => setForm({ ...form, content: e.target.value })} 
          placeholder="List ingredients and step-by-step instructions..."
          required 
        />
        <p className="text-[10px] text-gray-400">Tip: You can use simple text or even markdown if supported by your renderer.</p>
      </div>

      <div className="space-y-1">
        <ImageUpload
          value={form.image ? [form.image] : []}
          onChange={(urls) => setForm({ ...form, image: urls[0] || "" })}
          label="Recipe Cover Image"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tags (comma separated)</label>
          <input className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-500 outline-none font-medium" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="healthy, quick, kids favorite" />
        </div>
        <div className="flex items-center gap-8 pt-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="w-5 h-5 accent-primary-600 rounded-lg cursor-pointer" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            <span className="text-sm font-bold text-gray-700 group-hover:text-primary-600 transition-colors">Visible on Site</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="w-5 h-5 accent-primary-600 rounded-lg cursor-pointer" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            <span className="text-sm font-bold text-gray-700 group-hover:text-primary-600 transition-colors">Feature on Home</span>
          </label>
        </div>
      </div>

      <div className="flex gap-4 pt-6 border-t">
        <button 
          type="submit" 
          disabled={saving} 
          className="flex-1 bg-neutral-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-primary-600 disabled:bg-gray-400 transition-all shadow-lg"
        >
          {saving ? "Saving Changes..." : recipeId ? "Update Recipe" : "Publish Recipe"}
        </button>
        <button 
          type="button" 
          onClick={onDone} 
          className="px-8 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
