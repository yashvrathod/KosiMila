"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Search, Trash2, MapPin, AlertCircle, Loader2 } from "lucide-react";

type NonServiceableArea = {
  id: string;
  pincode: string;
  reason: string | null;
  createdAt: string;
};

export default function AdminNonServiceableAreasPage() {
  const [areas, setAreas] = useState<NonServiceableArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  const [newArea, setNewArea] = useState({ pincode: "", reason: "" });
  const [saving, setSaving] = useState(false);

  const fetchAreas = async () => {
    try {
      const res = await fetch("/api/admin/non-serviceable-areas");
      const data = await res.json();
      if (res.ok) {
        setAreas(data.areas || []);
      }
    } catch (err) {
      console.error("Failed to fetch areas", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAreas();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return areas;
    return areas.filter((a) =>
      a.pincode.toLowerCase().includes(q) || 
      (a.reason?.toLowerCase().includes(q))
    );
  }, [areas, searchQuery]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArea.pincode) return;
    
    setSaving(true);
    try {
      const res = await fetch("/api/admin/non-serviceable-areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArea),
      });
      if (res.ok) {
        setNewArea({ pincode: "", reason: "" });
        setShowModal(false);
        await fetchAreas();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add area");
      }
    } catch (err) {
      alert("Failed to add area");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this restriction? Users from this pincode will be able to order again.")) return;
    try {
      const res = await fetch(`/api/admin/non-serviceable-areas/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchAreas();
      }
    } catch (err) {
      alert("Failed to remove area");
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MapPin className="text-primary-600" size={32} />
            Non-Serviceable Areas
          </h1>
          <p className="text-gray-500 mt-1">
            Restrict orders from specific pincodes and provide a reason.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="
            inline-flex items-center gap-2
            px-6 py-3
            bg-gray-900 hover:bg-gray-800
            text-white font-semibold
            rounded-xl shadow-lg
            transition duration-200
          "
        >
          <Plus size={20} /> Add Pincode
        </button>
      </div>

      {/* SEARCH & STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border p-4 flex items-center gap-3">
          <Search size={20} className="text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by pincode or reason..."
            className="w-full outline-none text-base"
          />
        </div>
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-600">Total Restricted</p>
            <p className="text-2xl font-bold text-primary-900">{areas.length}</p>
          </div>
          <AlertCircle className="text-primary-400" size={24} />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-8 py-5">Pincode</th>
              <th className="px-8 py-5">Reason / Message to User</th>
              <th className="px-8 py-5">Date Added</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <Loader2 className="animate-spin" size={32} />
                    <p>Loading areas...</p>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <MapPin size={48} strokeWidth={1} />
                    <p className="text-lg font-medium">No restricted areas found</p>
                    <p className="text-sm">Add a pincode to start restricting deliveries.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((area) => (
                <tr key={area.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <span className="font-mono font-bold text-lg text-primary-600">
                      {area.pincode}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-gray-700 font-medium">
                      {area.reason || "We are not delivering to this location yet."}
                    </p>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500">
                    {new Date(area.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => void remove(area.id)}
                      className="
                        p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 
                        rounded-lg transition-all duration-200
                      "
                      title="Remove Restriction"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Add Restriction</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Pincode</label>
                <input
                  required
                  placeholder="e.g. 110001"
                  className="w-full px-5 py-3 border-2 border-gray-100 rounded-2xl focus:border-primary-500 focus:ring-0 transition-all outline-none text-lg font-mono"
                  value={newArea.pincode}
                  onChange={(e) => setNewArea({ ...newArea, pincode: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Reason (Visible to User)</label>
                <textarea
                  placeholder="e.g. Currently unavailable due to high demand in other areas."
                  className="w-full px-5 py-3 border-2 border-gray-100 rounded-2xl focus:border-primary-500 focus:ring-0 transition-all outline-none min-h-[100px]"
                  value={newArea.reason}
                  onChange={(e) => setNewArea({ ...newArea, reason: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  className="flex-1 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Adding...</span>
                    </>
                  ) : (
                    "Add Pincode"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
