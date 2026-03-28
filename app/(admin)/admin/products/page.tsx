"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import ImageUpload from "@/app/components/ImageUpload";

// -------------------- Types --------------------
type Category = { id: string; name: string };

type ProductListItem = {
  id: string;
  name: string;
  price: number;
  category?: { name: string };
  images: string[];
  active: boolean;
  createdAt: string;
};

type ProductVariant = {
  id?: string;
  weight: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
};

type ProductDetail = {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  categoryId: string;
  brand: string | null;
  highlights: string[];
  active: boolean;
  variants: ProductVariant[];
};

type ProductFormState = {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  categoryId: string;
  brand?: string;
  highlights: string;
  images: string[];
  active: boolean;
  variants: ProductVariant[];
};

// -------------------- Utils --------------------
function toFormState(p?: ProductDetail | null): ProductFormState {
  return {
    name: p?.name ?? "",
    description: p?.description ?? "",
    price: p?.price ?? 0,
    comparePrice: p?.comparePrice ?? undefined,
    categoryId: p?.categoryId ?? "",
    brand: p?.brand ?? "",
    highlights: (p?.highlights ?? []).join("\n"),
    images: p?.images ?? [],
    active: p?.active ?? true,
    variants: p?.variants ?? [],
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
  const base = "inline-flex items-center gap-2 px-4 py-2 rounded font-medium";
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60",
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

// -------------------- Admin Products Page --------------------
export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // -------------------- Fetching --------------------
  const fetchProducts = async () => {
    const res = await fetch("/api/products?limit=200");
    const data = await res.json();
    setProducts(data.products || []);
  };

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories || []);
  };

  useEffect(() => {
    void fetchProducts();
    void fetchCategories();
  }, []);

  // -------------------- Filtering --------------------
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, searchQuery]);

  // -------------------- Modal Actions --------------------
  const openCreate = () => {
    setEditingId(null);
    setEditingProduct(null);
    setShowModal(true);
  };

  const openEdit = async (id: string) => {
    setEditingId(id);
    setEditingProduct(null);
    setShowModal(true);
    setLoadingEdit(true);
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      setEditingProduct(data.product);
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    await fetchProducts();
  };

  const closeModal = async () => {
    setShowModal(false);
    setEditingId(null);
    setEditingProduct(null);
    await fetchProducts();
  };

  // -------------------- Render --------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-gray-600">Create, edit, and delete products</p>
        </div>
        <Button onClick={openCreate} icon={<Plus size={18} />}>
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-3">
          <Search size={18} className="text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full outline-none"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {["Product", "Category", "Price", "Status", "Actions"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {p.images?.[0] && (
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{p.category?.name ?? "-"}</td>
                <td className="px-6 py-4 text-sm text-gray-700">₹{p.price.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${p.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {p.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 flex justify-end gap-2">
                  <Button icon={<Eye size={18} />} onClick={() => window.open(`/shop/products/${p.id}`, "_blank")} variant="ghost" className="btn-plain p-2 rounded-lg text-gray-600 hover:bg-gray-100" />
                  <Button icon={<Edit size={18} />} onClick={() => void openEdit(p.id)} variant="ghost" className="btn-plain p-2 rounded-lg text-gray-600 hover:bg-gray-100" />
                  <Button icon={<Trash2 size={18} />} onClick={() => void handleDelete(p.id)} variant="danger" className="btn-plain p-2 rounded-lg text-red-600 hover:bg-red-50" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="p-6 text-center text-gray-600">No products found.</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => void closeModal()}>
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingId ? "Edit Product" : "Add Product"}</h2>
              <Button onClick={() => void closeModal()} variant="secondary">Close</Button>
            </div>

            {editingId && loadingEdit ? (
              <div className="py-10 text-center text-gray-600">Loading product...</div>
            ) : (
              <ProductForm
                categories={categories}
                initial={toFormState(editingProduct)}
                productId={editingId}
                onDone={() => void closeModal()}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------- Product Form --------------------
function ProductForm({ categories, initial, productId, onDone }: { categories: Category[]; initial: ProductFormState; productId: string | null; onDone: () => void; }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductFormState>(initial);

  useEffect(() => { setForm(initial); }, [initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        categoryId: form.categoryId,
        brand: form.brand || undefined,
        highlights: form.highlights.split("\n").map((s) => s.trim()).filter(Boolean),
        images: form.images.filter((url) => url.trim()),
        active: form.active,
        variants: form.variants,
      };
      const url = productId ? `/api/products/${productId}` : "/api/products";
      const method = productId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save product");
      }
      onDone();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save product");
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input className="w-full px-3 py-2 border rounded" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select className="w-full px-3 py-2 border rounded" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
            <option value="" disabled>Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea className="w-full px-3 py-2 border rounded min-h-28" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input type="number" step="0.01" className="w-full px-3 py-2 border rounded" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Compare price</label>
          <input type="number" step="0.01" className="w-full px-3 py-2 border rounded" value={form.comparePrice ?? ""} onChange={(e) => setForm({ ...form, comparePrice: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <input className="w-full px-3 py-2 border rounded" value={form.brand ?? ""} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          <span className="text-sm text-gray-700">Active</span>
        </div>
      </div>

      <div>
        <ImageUpload
          value={form.images}
          onChange={(newUrls) => {
            setForm({ ...form, images: newUrls });
          }}
          label="Product Images"
        />
      </div>
      
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-bold text-gray-700">Product Variants (Sizes/Weights)</label>
          <Button 
            type="button"
            variant="secondary" 
            onClick={() => setForm({ ...form, variants: [...form.variants, { weight: "", price: 0, stock: 0 }] })}
          >
            Add Variant
          </Button>
        </div>
        
        <div className="space-y-3">
          {form.variants.map((v, i) => (
            <div key={i} className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg border">
              <div className="flex-1">
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Weight/Size</label>
                <input 
                  placeholder="e.g. 1kg" 
                  className="w-full px-2 py-1 text-sm border rounded" 
                  value={v.weight} 
                  onChange={(e) => {
                    const newVariants = [...form.variants];
                    newVariants[i].weight = e.target.value;
                    setForm({ ...form, variants: newVariants });
                  }} 
                />
              </div>
              <div className="w-24">
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Price</label>
                <input 
                  type="number" 
                  className="w-full px-2 py-1 text-sm border rounded" 
                  value={v.price} 
                  onChange={(e) => {
                    const newVariants = [...form.variants];
                    newVariants[i].price = Number(e.target.value);
                    setForm({ ...form, variants: newVariants });
                  }} 
                />
              </div>
              <div className="w-24">
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Compare</label>
                <input 
                  type="number" 
                  className="w-full px-2 py-1 text-sm border rounded" 
                  value={v.comparePrice ?? ""} 
                  onChange={(e) => {
                    const newVariants = [...form.variants];
                    newVariants[i].comparePrice = e.target.value ? Number(e.target.value) : undefined;
                    setForm({ ...form, variants: newVariants });
                  }} 
                />
              </div>
              <Button 
                type="button"
                variant="danger" 
                className="p-1 px-2"
                onClick={() => {
                  const newVariants = form.variants.filter((_, idx) => idx !== i);
                  setForm({ ...form, variants: newVariants });
                }}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
          {form.variants.length === 0 && (
            <p className="text-xs text-gray-500 italic">No variants added. Base price will be used.</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Highlights (one per line)</label>
        <textarea className="w-full px-3 py-2 border rounded min-h-28" value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving} variant="primary">{saving ? "Saving..." : productId ? "Update" : "Create"}</Button>
        <Button type="button" onClick={onDone} variant="secondary">Cancel</Button>
      </div>
    </form>
  );
}
