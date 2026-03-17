"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

/* ---------------- TYPES ---------------- */

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
};

type CategoryFormState = {
  name: string;
  description: string;
  image: string;
  parentId: string;
};

/* ---------------- HELPERS ---------------- */

function toFormState(c?: Category | null): CategoryFormState {
  return {
    name: c?.name ?? "",
    description: c?.description ?? "",
    image: c?.image ?? "",
    parentId: c?.parentId ?? "",
  };
}

/* ================= PAGE ================= */

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories ?? []);
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  const closeModal = async () => {
    setShowModal(false);
    setEditing(null);
    await fetchCategories();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    await fetchCategories();
  };

  return (
    <div className="space-y-8 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2F2418]">
            Categories
          </h1>
          <p className="text-sm text-gray-600">
            Manage product categories
          </p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="
            inline-flex items-center gap-2
            px-6 py-3
            bg-[#C8A24D] hover:bg-[#B8963D]
            text-white font-semibold
            rounded-full shadow-md
            transition duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-[#C8A24D]/50
          "
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl shadow-sm border p-4 flex items-center gap-3">
        <Search size={18} className="text-gray-500" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories..."
          className="w-full outline-none text-sm"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FBF8F3]">
            <tr>
              {["Name", "Slug", "Parent"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                >
                  {h}
                </th>
              ))}
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-[#FBF8F3]/60">
                <td className="px-6 py-4">
                  <p className="font-semibold text-[#2F2418]">{c.name}</p>
                  {c.description && (
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {c.description}
                    </p>
                  )}
                </td>

                <td className="px-6 py-4 text-sm text-gray-700">{c.slug}</td>

                <td className="px-6 py-4 text-sm text-gray-700">
                  {c.parentId
                    ? categories.find((x) => x.id === c.parentId)?.name ?? "-"
                    : "-"}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setEditing(c);
                        setShowModal(true);
                      }}
                      className="btn-plain p-2 rounded-lg hover:bg-gray-100 text-black transition"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => void remove(c.id)}
                      className="btn-plain p-2 rounded-lg hover:bg-gray-100 text-black transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No categories found.
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-xl border border-[#E0DCCF]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-[#2F2418]">
                {editing ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={() => void closeModal()}
                className="text-gray-600 hover:text-gray-900 text-xl"
              >
                ✕
              </button>
            </div>

            <CategoryForm
              allCategories={categories}
              initial={toFormState(editing)}
              categoryId={editing?.id ?? null}
              onDone={() => void closeModal()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= FORM ================= */

function CategoryForm({
  allCategories,
  initial,
  categoryId,
  onDone,
}: {
  allCategories: Category[];
  initial: CategoryFormState;
  categoryId: string | null;
  onDone: () => void;
}) {
  const [form, setForm] = useState<CategoryFormState>(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(
        categoryId ? `/api/categories/${categoryId}` : "/api/categories",
        {
          method: categoryId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            description: form.description || undefined,
            image: form.image || undefined,
            parentId: form.parentId || undefined,
          }),
        }
      );

      if (!res.ok) throw new Error();
      onDone();
    } catch {
      alert("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const parentOptions = allCategories.filter((c) => c.id !== categoryId);

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="Name"
        value={form.name}
        required
        onChange={(v) => setForm({ ...form, name: v })}
      />
      <Input
        label="Image URL"
        value={form.image}
        onChange={(v) => setForm({ ...form, image: v })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          className="
            w-full px-4 py-3
            border border-[#D6C6A8]
            rounded-lg
            min-h-[6rem]
            focus:ring-2 focus:ring-[#C8A24D]/40
            focus:outline-none
            transition duration-200
          "
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Parent Category
        </label>
        <select
          className="
            w-full px-4 py-3
            border border-[#D6C6A8]
            rounded-lg
            focus:ring-2 focus:ring-[#C8A24D]/40
            focus:outline-none
            transition duration-200
          "
          value={form.parentId}
          onChange={(e) => setForm({ ...form, parentId: e.target.value })}
        >
          <option value="">No parent</option>
          {parentOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          disabled={saving}
          className="
            px-6 py-3
            bg-[#C8A24D] hover:bg-[#B8963D]
            text-white font-semibold
            rounded-full shadow-md
            transition duration-200 ease-in-out
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {saving
            ? "Saving..."
            : categoryId
            ? "Update Category"
            : "Create Category"}
        </button>

        <button
          type="button"
          onClick={onDone}
          className="
            px-6 py-3
            bg-gray-200 hover:bg-gray-300
            text-gray-700 font-medium
            rounded-full shadow-sm
            transition duration-200 ease-in-out
          "
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ================= INPUT ================= */

function Input({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full px-4 py-3
          border border-[#D6C6A8]
          rounded-lg
          focus:ring-2 focus:ring-[#C8A24D]/40
          focus:outline-none
          transition duration-200
        "
      />
    </div>
  );
}
