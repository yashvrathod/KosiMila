"use client";

import { useEffect, useState } from "react";

type Settings = {
  id: string;
  siteName: string;
  siteDescription: string | null;
  logo: string | null;
  favicon: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
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

// -------------------- Admin Settings Page --------------------
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch settings
  const fetchSettings = async () => {
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    setSettings(data.settings);
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

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
          favicon: settings.favicon || undefined,
          contactEmail: settings.contactEmail || undefined,
          contactPhone: settings.contactPhone || undefined,
          address: settings.address || undefined,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-600">Manage site settings</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        {/* Site info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Site name</label>
          <input
            className="w-full px-3 py-2 border rounded"
            value={settings.siteName}
            onChange={(e) => updateField("siteName", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 border rounded min-h-24"
            value={settings.siteDescription ?? ""}
            onChange={(e) => updateField("siteDescription", e.target.value)}
          />
        </div>

        {/* Logo & Favicon */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <input
              className="w-full px-3 py-2 border rounded"
              value={settings.logo ?? ""}
              onChange={(e) => updateField("logo", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
            <input
              className="w-full px-3 py-2 border rounded"
              value={settings.favicon ?? ""}
              onChange={(e) => updateField("favicon", e.target.value)}
            />
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact email</label>
            <input
              className="w-full px-3 py-2 border rounded"
              value={settings.contactEmail ?? ""}
              onChange={(e) => updateField("contactEmail", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact phone</label>
            <input
              className="w-full px-3 py-2 border rounded"
              value={settings.contactPhone ?? ""}
              onChange={(e) => updateField("contactPhone", e.target.value)}
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            className="w-full px-3 py-2 border rounded"
            value={settings.address ?? ""}
            onChange={(e) => updateField("address", e.target.value)}
          />
        </div>

        {/* Tax & Currency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax rate</label>
            <input
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border rounded"
              value={settings.taxRate}
              onChange={(e) => updateField("taxRate", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <input
              className="w-full px-3 py-2 border rounded"
              value={settings.currency}
              onChange={(e) => updateField("currency", e.target.value)}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
  <Button
    onClick={() => void save()}
    disabled={saving}
    variant="primary"
    className="bg-green-600 hover:bg-green-700 text-white"
  >
    {saving ? "Saving..." : "Save settings"}
  </Button>
</div>

      </div>
    </div>
  );
}
