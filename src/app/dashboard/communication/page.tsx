"use client";

import { useState, useMemo } from "react";
import { Plus, Send, Calendar, Save, Bell, MessageSquare, Mail } from "lucide-react";
import Modal from "@/components/modal";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { messages, prayerRequests, getPersonById } from "@/lib/data";
import type { MessageRecord, PrayerRequest } from "@/lib/data";

type StatusFilter = "all" | "sent" | "scheduled" | "draft";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sent", label: "Sent" },
  { value: "scheduled", label: "Scheduled" },
  { value: "draft", label: "Drafts" },
];

const AUDIENCE_OPTIONS = ["All Members", "Volunteers", "Married Couples", "New Visitors", "Small Group Leaders"];

function getChannelBadgeClass(channel: MessageRecord["channel"]): string {
  switch (channel) {
    case "push":
      return "badge-purple";
    case "sms":
      return "badge-blue";
    case "email":
      return "badge-green";
    default:
      return "badge-gray";
  }
}

function getStatusBadgeClass(status: MessageRecord["status"]): string {
  switch (status) {
    case "sent":
      return "badge-green";
    case "scheduled":
      return "badge-yellow";
    case "draft":
      return "badge-gray";
    default:
      return "badge-gray";
  }
}

export default function CommunicationPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedMessage, setSelectedMessage] = useState<MessageRecord | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeChannel, setComposeChannel] = useState<"push" | "sms" | "email">("email");
  const [composeAudience, setComposeAudience] = useState("All Members");

  const filteredMessages = useMemo(() => {
    if (statusFilter === "all") return messages;
    return messages.filter((m) => m.status === statusFilter);
  }, [statusFilter]);

  const channelStats = useMemo(() => {
    const push = messages.filter((m) => m.channel === "push" && m.status === "sent");
    const sms = messages.filter((m) => m.channel === "sms" && m.status === "sent");
    const email = messages.filter((m) => m.channel === "email" && m.status === "sent");

    return {
      push: { count: push.length, recipients: push.reduce((s, m) => s + m.recipients, 0) },
      sms: { count: sms.length, recipients: sms.reduce((s, m) => s + m.recipients, 0) },
      email: { count: email.length, recipients: email.reduce((s, m) => s + m.recipients, 0) },
    };
  }, []);

  const tabCounts = useMemo(() => {
    return {
      all: messages.length,
      sent: messages.filter((m) => m.status === "sent").length,
      scheduled: messages.filter((m) => m.status === "scheduled").length,
      draft: messages.filter((m) => m.status === "draft").length,
    };
  }, []);

  const handleRowClick = (msg: MessageRecord) => {
    setSelectedMessage(msg);
    setComposeOpen(false);
  };

  const handleNewMessage = () => {
    setSelectedMessage(null);
    setComposeSubject("");
    setComposeBody("");
    setComposeChannel("email");
    setComposeAudience("All Members");
    setComposeOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedMessage(null);
    setComposeOpen(false);
  };

  const isModalOpen = !!selectedMessage || composeOpen;
  const isComposeMode = composeOpen && !selectedMessage;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Communication</h1>
        <button type="button" className="btn-primary whitespace-nowrap" onClick={handleNewMessage}>
          <Plus className="h-4 w-4" />
          New Message
        </button>
      </div>

      {/* Channel Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
              <Bell className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Push Notifications</p>
              <p className="text-xl font-bold text-gray-900">{channelStats.push.count}</p>
              <p className="text-xs text-gray-500">{channelStats.push.recipients} recipients</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">SMS</p>
              <p className="text-xl font-bold text-gray-900">{channelStats.sms.count}</p>
              <p className="text-xs text-gray-500">{channelStats.sms.recipients} recipients</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <Mail className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-xl font-bold text-gray-900">{channelStats.email.count}</p>
              <p className="text-xs text-gray-500">{channelStats.email.recipients} recipients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              statusFilter === tab.value
                ? "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/20"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            {tab.label}
            <span className={cn("ml-2", statusFilter === tab.value ? "text-brand-600" : "text-gray-400")}>
              {tabCounts[tab.value] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Messages Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="table-header">Subject</th>
                <th className="table-header">Channel</th>
                <th className="table-header">Audience</th>
                <th className="table-header">Status</th>
                <th className="table-header">Recipients</th>
                <th className="table-header">Open Rate</th>
                <th className="table-header">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-cell py-12 text-center text-gray-500">
                    No messages match your filters.
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => (
                  <tr
                    key={msg.id}
                    onClick={() => handleRowClick(msg)}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                  >
                    <td className="table-cell">
                      <span className="font-semibold text-gray-900">{msg.subject}</span>
                    </td>
                    <td className="table-cell">
                      <span className={getChannelBadgeClass(msg.channel)}>{msg.channel}</span>
                    </td>
                    <td className="table-cell text-gray-600">{msg.audience}</td>
                    <td className="table-cell">
                      <span className={getStatusBadgeClass(msg.status)}>{msg.status}</span>
                    </td>
                    <td className="table-cell text-gray-600">{msg.recipients}</td>
                    <td className="table-cell text-gray-600">
                      {msg.recipients > 0
                        ? `${Math.round((msg.opened / msg.recipients) * 100)}%`
                        : "—"}
                    </td>
                    <td className="table-cell text-gray-600">{formatDate(msg.sentDate)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prayer Wall */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Prayer Wall</h2>
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {prayerRequests.map((pr) => {
            const person = getPersonById(pr.personId);
            const isAnswered = pr.status === "answered";
            return (
              <div
                key={pr.id}
                className={cn(
                  "card p-4 transition-shadow hover:shadow-md",
                  isAnswered && "opacity-75"
                )}
              >
                <div className="flex gap-4">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
                      person?.avatarColor ?? "bg-gray-400"
                    )}
                  >
                    {person ? getInitials(person.firstName, person.lastName) : "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isAnswered && <span className="badge-green">Answered</span>}
                      <span className="text-xs text-gray-500">{formatDate(pr.date)}</span>
                    </div>
                    <p className={cn("mt-1 text-sm text-gray-700", isAnswered && "line-through")}>
                      {pr.request}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {pr.prayerCount} {pr.prayerCount === 1 ? "prayer" : "prayers"}
                    </p>
                    <button
                      type="button"
                      disabled={isAnswered}
                      className={cn(
                        "mt-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                        isAnswered
                          ? "cursor-not-allowed bg-gray-100 text-gray-400"
                          : "btn-secondary"
                      )}
                    >
                      Pray
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail / Compose Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={isComposeMode ? "Compose Message" : (selectedMessage?.subject ?? "Message")}
        wide
      >
        {isComposeMode ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Enter subject..."
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Message</label>
              <textarea
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Write your message..."
                rows={5}
                className="input resize-y"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Channel</label>
              <div className="flex gap-4">
                {(["push", "sms", "email"] as const).map((ch) => (
                  <label key={ch} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="channel"
                      checked={composeChannel === ch}
                      onChange={() => setComposeChannel(ch)}
                      className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{ch}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Audience</label>
              <select
                value={composeAudience}
                onChange={(e) => setComposeAudience(e.target.value)}
                className="input"
              >
                {AUDIENCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="button" className="btn-primary">
                <Send className="h-4 w-4" />
                Send
              </button>
              <button type="button" className="btn-secondary">
                <Calendar className="h-4 w-4" />
                Schedule
              </button>
              <button type="button" className="btn-ghost">
                <Save className="h-4 w-4" />
                Save Draft
              </button>
            </div>
          </div>
        ) : selectedMessage ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className={getChannelBadgeClass(selectedMessage.channel)}>
                {selectedMessage.channel}
              </span>
              <span className={getStatusBadgeClass(selectedMessage.status)}>
                {selectedMessage.status}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Audience</p>
              <p className="text-gray-900">{selectedMessage.audience}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Message</p>
              <p className="mt-1 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">{selectedMessage.body}</p>
            </div>
            <div className="flex gap-6 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Recipients</p>
                <p className="font-semibold text-gray-900">{selectedMessage.recipients}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Opened</p>
                <p className="font-semibold text-gray-900">{selectedMessage.opened}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Open Rate</p>
                <p className="font-semibold text-gray-900">
                  {selectedMessage.recipients > 0
                    ? `${Math.round((selectedMessage.opened / selectedMessage.recipients) * 100)}%`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Sent</p>
                <p className="font-semibold text-gray-900">{formatDate(selectedMessage.sentDate)}</p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
