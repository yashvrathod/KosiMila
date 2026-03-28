"use client";

import { useEffect, useState } from "react";

type Settings = {
  id: string;
  siteName: string;
  siteDescription: string | null;
  logo: string | null;
  heroImage: string | null;
  favicon: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  paymentQrCode: string | null;
  taxRate: number;
  currency: string;
};

// -------------------- Button Component --------------------
function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-400";
  
  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-400 disabled:text-gray-200",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

type NonServiceableArea = {
  id: string;
  pincode: string;
  reason: string | null;
};

// -------------------- Admin Settings Page --------------------
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [nonServiceableAreas, setNonServiceableAreas] = useState<NonServiceableArea[]>([]);
  const [newArea, setNewArea] = useState({ pincode: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [addingArea, setAddingArea] = useState(false);

  // Fetch settings
  const fetchSettings = async () => {
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    setSettings(data.settings);
  };

  const fetchNonServiceableAreas = async () => {
    try {
      const res = await fetch("/api/admin/non-serviceable-areas");
      const data = await res.json();
      if (res.ok) {
        setNonServiceableAreas(data.areas || []);
      }
    } catch (err) {
      console.error("Failed to fetch non-serviceable areas", err);
    }
  };

  useEffect(() => {
    void fetchSettings();
    void fetchNonServiceableAreas();
  }, []);

  const addArea = async () => {
    if (!newArea.pincode) return;
    setAddingArea(true);
    try {
      const res = await fetch("/api/admin/non-serviceable-areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArea),
      });
      if (res.ok) {
        setNewArea({ pincode: "", reason: "" });
        await fetchNonServiceableAreas();
      }
    } catch (err) {
      alert("Failed to add area");
    } finally {
      setAddingArea(false);
    }
  };

  const deleteArea = async (id: string) => {
    if (!confirm("Are you sure you want to delete this area?")) return;
    try {
      const res = await fetch(`/api/admin/non-serviceable-areas/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchNonServiceableAreas();
      }
    } catch (err) {
      alert("Failed to delete area");
    }
  };

  // Update field locally
  const updateField = (key: keyof Settings, value: Settings[keyof Settings]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value } as Settings);
  };

  // Save settings
  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName: settings.siteName,
          siteDescription: settings.siteDescription || undefined,
          logo: settings.logo || undefined,
          heroImage: settings.heroImage || undefined,
          favicon: settings.favicon || undefined,
          contactEmail: settings.contactEmail || undefined,
          contactPhone: settings.contactPhone || undefined,
          address: settings.address || undefined,
          paymentQrCode: settings.paymentQrCode || undefined,
          taxRate: Number(settings.taxRate),
          currency: settings.currency,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save settings");
      }

      await fetchSettings();
      alert("Settings saved");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="text-gray-600">Loading settings...</div>;

  return (
    <div className="space-y-12 pb-20">
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
          <p className="text-sm text-gray-600">Manage site identification and contact details</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
          {/* Site info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Site Name</label>
              <input
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
                value={settings.siteName}
                onChange={(e) => updateField("siteName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Currency</label>
              <input
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
                value={settings.currency}
                onChange={(e) => updateField("currency", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Site Description</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all min-h-24"
              value={settings.siteDescription ?? ""}
              onChange={(e) => updateField("siteDescription", e.target.value)}
            />
          </div>

          {/* Logo & Favicon & Hero */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Logo URL</label>
              <input
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
                value={settings.logo ?? ""}
                onChange={(e) => updateField("logo", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Favicon URL</label>
              <input
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
                value={settings.favicon ?? ""}
                onChange={(e) => updateField("favicon", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Hero Image URL</label>
              <input
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
                value={settings.heroImage ?? ""}
                onChange={(e) => updateField("heroImage", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Payment QR Code URL</label>
              <input
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
                value={settings.paymentQrCode ?? ""}
                onChange={(e) => updateField("paymentQrCode", e.target.value)}
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Contact Email</label>
              <input
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
                value={settings.contactEmail ?? ""}
                onChange={(e) => updateField("contactEmail", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Contact Phone</label>
              <input
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
                value={settings.contactPhone ?? ""}
                onChange={(e) => updateField("contactPhone", e.target.value)}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Business Address</label>
            <input
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
              value={settings.address ?? ""}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button
              onClick={() => void save()}
              disabled={saving}
              variant="primary"
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 shadow-sm"
            >
              {saving ? "Saving Changes..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </section>

      {/* Non-serviceable Areas Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Non-Serviceable Areas</h2>
          <p className="text-sm text-gray-600">Restrict orders from specific pincodes</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 bg-gray-50/50 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Add New Restriction</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 max-w-xs">
                <input
                  placeholder="Pincode (e.g. 110001)"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
                  value={newArea.pincode}
                  onChange={(e) => setNewArea({ ...newArea, pincode: e.target.value })}
                />
              </div>
              <div className="flex-[2]">
                <input
                  placeholder="Reason for no delivery (e.g. Out of reach)"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
                  value={newArea.reason}
                  onChange={(e) => setNewArea({ ...newArea, reason: e.target.value })}
                />
              </div>
              <Button
                onClick={() => void addArea()}
                disabled={addingArea || !newArea.pincode}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                {addingArea ? "Adding..." : "Add Restriction"}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-8 py-4">Pincode</th>
                  <th className="px-8 py-4">Reason</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {nonServiceableAreas.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-12 text-center text-gray-500 italic">
                      No restricted areas added yet.
                    </td>
                  </tr>
                ) : (
                  nonServiceableAreas.map((area) => (
                    <tr key={area.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-4 font-mono font-bold text-primary-600">{area.pincode}</td>
                      <td className="px-8 py-4 text-gray-600">{area.reason || "N/A"}</td>
                      <td className="px-8 py-4 text-right">
                        <button
                          onClick={() => void deleteArea(area.id)}
                          className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
