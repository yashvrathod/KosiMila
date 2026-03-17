"use client";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<null | { type: "success" | "error"; message: string }>(null);
  const [loading, setLoading] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    // client validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      setStatus({ type: "error", message: "Name, phone and message are required." });
      return;
    }
    if (form.email.trim() && !emailRegex.test(form.email.trim())) {
      setStatus({ type: "error", message: "Please enter a valid email address or leave it blank." });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit");
      setStatus({ type: "success", message: "Thanks! Your message has been sent." });
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Contact Us</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone *</label>
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Message *</label>
          <textarea
            name="message"
            value={form.message}
            onChange={onChange}
            className="mt-1 w-full border rounded px-3 py-2 min-h-32"
            placeholder="How can we help?"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send"}
        </button>
        {status && (
          <p className={"text-sm mt-2 " + (status.type === "success" ? "text-green-600" : "text-red-600")}>{status.message}</p>
        )}
      </form>
    </div>
  );
}
