"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENT" | "FLAT";
  value: number;
  minOrder: number | null;
  maxDiscount: number | null;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  createdAt: string;
};

type CouponFormState = {
  code: string;
  description: string;
  type: "PERCENT" | "FLAT";
  value: number;
  minOrder: string;
  maxDiscount: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
  usageLimit: string;
};

function toFormState(c?: Coupon | null): CouponFormState {
  return {
    code: c?.code ?? "",
    description: c?.description ?? "",
    type: c?.type ?? "PERCENT",
    value: c?.value ?? 0,
    minOrder: c?.minOrder ? String(c.minOrder) : "",
    maxDiscount: c?.maxDiscount ? String(c.maxDiscount) : "",
    active: c?.active ?? true,
    startsAt: c?.startsAt ? new Date(c.startsAt).toISOString().slice(0, 16) : "",
    endsAt: c?.endsAt ? new Date(c.endsAt).toISOString().slice(0, 16) : "",
    usageLimit: c?.usageLimit ? String(c.usageLimit) : "",
  };
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);

  const fetchCoupons = async () => {
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    setCoupons(data.coupons || []);
  };

  useEffect(() => {
    void fetchCoupons();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toUpperCase();
    if (!q) return coupons;
    return coupons.filter((c) => c.code.includes(q));
  }, [coupons, searchQuery]);

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setShowModal(true);
  };

  const close = async () => {
    setShowModal(false);
    setEditing(null);
    await fetchCoupons();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    await fetchCoupons();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2F2418]">Coupons</h1>
          <p className="text-sm text-gray-600">Create, edit, and delete coupons</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C8A24D] hover:bg-[#B8963D] text-white rounded-full font-medium shadow"
        >
          <Plus size={18} /> Add Coupon
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border p-4 flex items-center gap-3">
        <Search size={18} className="text-gray-500" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search coupon code..."
          className="w-full outline-none text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FBF8F3]">
            <tr>
              {["Code", "Type", "Value", "Active", "Usage", "Actions"].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-[#FBF8F3]/60">
                <td className="px-6 py-4">
                  <p className="font-semibold text-[#2F2418]">{c.code}</p>
                  {c.description && <p className="text-xs text-gray-500 line-clamp-1">{c.description}</p>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.type}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.type === "PERCENT" ? `${c.value}%` : `₹${c.value}`}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${c.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-[#FBF8F3] text-[#C8A24D]"><Edit size={18} /></button>
                    <button onClick={() => void remove(c.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-6 text-center text-gray-500">No coupons found.</div>}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-[#2F2418]">{editing ? "Edit Coupon" : "Add Coupon"}</h2>
              <button onClick={() => void close()} className="text-gray-600 hover:text-gray-900 text-xl">✕</button>
            </div>

            <CouponForm initial={toFormState(editing)} couponId={editing?.id ?? null} onDone={() => void close()} />
          </div>
        </div>
      )}
    </div>
  );
}

function CouponForm({ initial, couponId, onDone }: { initial: CouponFormState; couponId: string | null; onDone: () => void }) {
  const [form, setForm] = useState<CouponFormState>(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        value: Number(form.value),
        minOrder: form.minOrder ? Number(form.minOrder) : undefined,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
      };

      const url = couponId ? `/api/admin/coupons/${couponId}` : "/api/admin/coupons";
      const method = couponId ? "PUT" : "POST";

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed to save coupon");

      onDone();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
          <input required className="w-full px-3 py-2 border rounded" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          <span className="text-sm text-gray-700">Active</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input className="w-full px-3 py-2 border rounded" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select className="w-full px-3 py-2 border rounded" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CouponFormState["type"] })}>
            <option value="PERCENT">PERCENT</option>
            <option value="FLAT">FLAT</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
          <input type="number" step="0.01" className="w-full px-3 py-2 border rounded" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usage limit</label>
          <input type="number" className="w-full px-3 py-2 border rounded" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="optional" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min order</label>
          <input type="number" step="0.01" className="w-full px-3 py-2 border rounded" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} placeholder="optional" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max discount</label>
          <input type="number" step="0.01" className="w-full px-3 py-2 border rounded" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="optional" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Starts at</label>
          <input type="datetime-local" className="w-full px-3 py-2 border rounded" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ends at</label>
          <input type="datetime-local" className="w-full px-3 py-2 border rounded" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button disabled={saving} type="submit" className="px-6 py-2.5 bg-[#C8A24D] text-white rounded-full hover:bg-[#B8963D] disabled:opacity-50">{saving ? "Saving..." : couponId ? "Update" : "Create"}</button>
        <button type="button" onClick={onDone} className="px-6 py-2.5 bg-gray-200 rounded-full hover:bg-gray-300">Cancel</button>
      </div>
    </form>
  );
}
