"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Message = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<Message | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const res = await fetch(`/api/admin/messages/${id}`, {
          credentials: "include",
          cache: "no-store",
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.error || "Failed to load message");
        }

        setData(json.message);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Message not found</p>;

  return (
    <div className="max-w-2xl space-y-4">
      <Link href="/admin/messages" className="underline text-sm">
        ← Back to messages
      </Link>

      <h1 className="text-xl font-semibold">
        {data.subject || 'Message'}
      </h1>

      <div className="text-sm text-gray-700 space-y-1">
        <p><span className="font-medium">From:</span> {data.name}</p>
        <p><span className="font-medium">Email:</span> {data.email || '—'}</p>
        {data.phone && <p><span className="font-medium">Phone:</span> {data.phone}</p>}
        <p className="text-xs text-gray-500">{new Date(data.createdAt).toLocaleString()}</p>
        {error && <p className="text-red-600">{error}</p>}
      </div>

      <div className="border rounded p-4 whitespace-pre-wrap">
        {data.message}
      </div>
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 text-sm border rounded"
          disabled={saving}
          onClick={async () => {
            if (!data) return;
            setSaving(true);
            setError(null);
            try {
              const res = await fetch(`/api/admin/messages/${id}` ,{
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                cache: "no-store",
                body: JSON.stringify({ read: !data.read }),
              });
              const json = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
              setData(json.message);
            } catch (e: any) {
              setError(e.message || "Failed to update");
            } finally {
              setSaving(false);
            }
          }}
        >
          {data?.read ? "Mark Unread" : "Mark Read"}
        </button>
        <button
          className="px-3 py-1 text-sm border rounded text-red-600"
          disabled={saving}
          onClick={async () => {
            if (!confirm("Delete this message?")) return;
            setSaving(true);
            setError(null);
            try {
              const res = await fetch(`/api/admin/messages/${id}`, {
                method: "DELETE",
                credentials: "include",
                cache: "no-store",
              });
              if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json?.error || `HTTP ${res.status}`);
              }
              router.push("/admin/messages");
            } catch (e: any) {
              setError(e.message || "Failed to delete");
            } finally {
              setSaving(false);
            }
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
