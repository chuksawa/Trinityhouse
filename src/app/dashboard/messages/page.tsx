"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Plus, Send } from "lucide-react";
import Modal from "@/components/modal";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type Recipient = { id: number; email: string; label: string };
type Message = {
  id: string;
  senderId: number;
  recipientId: number;
  body: string;
  createdAt: string;
  senderEmail: string;
  recipientEmail: string;
  isFromMe: boolean;
};

function formatTime(s: string) {
  try {
    const d = new Date(s);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    return sameDay ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return s;
  }
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | "">("");
  const [composeBody, setComposeBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    Promise.all([
      fetch(`${BASE_PATH}/api/messages`, { credentials: "include" }).then((r) => (r.ok ? r.json() : { messages: [] })),
      fetch(`${BASE_PATH}/api/messages/recipients`, { credentials: "include" }).then((r) => (r.ok ? r.json() : { recipients: [] })),
    ])
      .then(([msgData, recData]) => {
        setMessages(Array.isArray(msgData.messages) ? msgData.messages : []);
        setRecipients(Array.isArray(recData.recipients) ? recData.recipients : []);
      })
      .catch(() => {
        setMessages([]);
        setRecipients([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!selectedRecipientId || !composeBody.trim()) {
      setError("Choose a recipient and enter a message.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipientId: Number(selectedRecipientId), body: composeBody.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to send");
        return;
      }
      setComposeOpen(false);
      setSelectedRecipientId("");
      setComposeBody("");
      load();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-[60vh] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="mt-1 text-sm text-gray-500">
            Message other staff and team members.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setError(""); setComposeOpen(true); }}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          New message
        </button>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center py-12">
          <p className="text-gray-500">Loading messages…</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <MessageCircle className="h-8 w-8" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">No messages yet</h2>
            <p className="mt-2 max-w-md text-sm text-gray-600">
              Click <strong>New message</strong> to send a message to another staff member.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            New message
          </button>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {messages.map((m) => (
            <div key={m.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {m.isFromMe ? (
                    <>You → {m.recipientEmail}</>
                  ) : (
                    <>{m.senderEmail} → you</>
                  )}
                </p>
                <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{m.body}</p>
              </div>
              <span className="mt-1 shrink-0 text-xs text-gray-500 sm:mt-0">{formatTime(m.createdAt)}</span>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={composeOpen}
        onClose={() => !sending && setComposeOpen(false)}
        title="New message"
      >
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">To</label>
            <select
              value={selectedRecipientId}
              onChange={(e) => setSelectedRecipientId(e.target.value === "" ? "" : Number(e.target.value))}
              className="input mt-1 w-full"
              required
            >
              <option value="">Select a recipient</option>
              {recipients.map((r) => (
                <option key={r.id} value={r.id}>{r.email}</option>
              ))}
            </select>
            {recipients.length === 0 && !loading && (
              <p className="mt-1 text-xs text-gray-500">No other staff members to message yet.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              className="input mt-1 w-full min-h-[120px]"
              placeholder="Type your message…"
              required
              rows={4}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={sending || recipients.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Send className="h-4 w-4" />
              {sending ? "Sending…" : "Send"}
            </button>
            <button
              type="button"
              onClick={() => setComposeOpen(false)}
              disabled={sending}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
