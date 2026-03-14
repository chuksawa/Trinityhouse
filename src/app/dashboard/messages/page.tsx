"use client";

import { MessageCircle } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-sm text-gray-500">
          Staff messaging — talk to other staff and team members here.
        </p>
      </div>

      <div className="card flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <MessageCircle className="h-8 w-8" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Staff messaging</h2>
          <p className="mt-2 max-w-md text-sm text-gray-600">
            Direct and group messages between staff will appear here. This area is ready to be wired up to your backend when you add messaging.
          </p>
        </div>
      </div>
    </div>
  );
}
