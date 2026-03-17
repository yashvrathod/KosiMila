"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type MessageListItem = {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  read: boolean;
  createdAt: string;
};

export default function AdminMessagesPage() {
  const [items, setItems] = useState<MessageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/messages", { cache: "no-store", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || `HTTP ${res.status}`;
        if (res.status === 401 || res.status === 403) {
          throw new Error(`${msg}. You might need to login with an admin account.`);
        }
        throw new Error(msg);
      }
      setItems(data.items ?? []);
    } catch (e: any) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function toggleRead(id: string, read: boolean) {
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
      credentials: "include",
      cache: "no-store",
    });
    if (res.ok) load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
    });
    if (res.ok) load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Messages</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="divide-y border rounded">
        {items.map((m) => (
          <div key={m.id} className="p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium truncate">
                <span className={!m.read ? "text-blue-700" : ""}>{m.name}</span>
              </p>
              <p className="text-sm text-gray-600 truncate">{m.email}</p>
              <p className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link className="px-2 py-1 text-sm border rounded" href={`/admin/messages/${m.id}`}>View</Link>
              <button className="px-2 py-1 text-sm border rounded" onClick={() => toggleRead(m.id, !m.read)}>
                {m.read ? "Mark Unread" : "Mark Read"}
              </button>
              <button className="px-2 py-1 text-sm border rounded text-red-600" onClick={() => remove(m.id)}>Delete</button>
            </div>
          </div>
        ))}
        {(!loading && items.length === 0) && <p className="p-3 text-sm text-gray-600">No messages yet.</p>}
      </div>
    </div>
  );
}
