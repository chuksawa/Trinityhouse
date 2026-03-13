"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Users, MapPin, Calendar, User } from "lucide-react";
import Modal from "@/components/modal";
import { cn, getInitials } from "@/lib/utils";
import { groups, getPersonById } from "@/lib/data";
import type { Group } from "@/lib/data";

type GroupType = Group["type"] | "all";

const GROUP_TYPE_TABS: { value: GroupType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "small_group", label: "Small Groups" },
  { value: "ministry_team", label: "Ministry Teams" },
  { value: "volunteer_team", label: "Volunteer Teams" },
];

function formatGroupType(type: Group["type"]): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getTypeBadgeClass(type: Group["type"]): string {
  switch (type) {
    case "small_group":
      return "badge-purple";
    case "ministry_team":
      return "badge-blue";
    case "volunteer_team":
      return "badge-green";
    default:
      return "badge-gray";
  }
}

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<GroupType>("all");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const matchesSearch =
        !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "all" || g.type === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: groups.length };
    groups.forEach((g) => {
      counts[g.type] = (counts[g.type] ?? 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Groups & Teams</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {searchOpen ? (
            <div className="relative flex-1 sm:w-64">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                autoFocus
                type="search"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => setSearchOpen(false)}
                className="input pl-9"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              title="Search groups"
              className="flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white p-2.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
          <button type="button" className="btn-primary whitespace-nowrap">
            <Plus className="h-4 w-4" />
            Create Group
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {GROUP_TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.value
                ? "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/20"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "ml-2",
                activeTab === tab.value ? "text-brand-600" : "text-gray-400"
              )}
            >
              {tabCounts[tab.value] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map((group) => {
          const leader = getPersonById(group.leaderId);
          return (
            <div
              key={group.id}
              className="card flex flex-col overflow-hidden transition-shadow hover:shadow-md"
            >
              <div className="flex-1 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                  <span className={getTypeBadgeClass(group.type)}>
                    {formatGroupType(group.type)}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4 shrink-0" />
                    <span>
                      {leader
                        ? `${leader.firstName} ${leader.lastName}`
                        : "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>
                      {group.meetingDay} at {group.meetingTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{group.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>
                      {group.memberIds.length} members · avg {group.avgAttendance}
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 px-5 py-3">
                <button
                  type="button"
                  onClick={() => setSelectedGroup(group)}
                  className="btn-secondary w-full text-sm"
                >
                  View
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="card py-12 text-center text-gray-500">
          No groups match your filters.
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        open={!!selectedGroup}
        onClose={() => setSelectedGroup(null)}
        title={selectedGroup?.name ?? "Group"}
        wide
      >
        {selectedGroup && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={getTypeBadgeClass(selectedGroup.type)}>
                {formatGroupType(selectedGroup.type)}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Description
              </h3>
              <p className="text-gray-700">{selectedGroup.description}</p>
            </div>

            {/* Leader */}
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Leader
              </h3>
              {(() => {
                const leader = getPersonById(selectedGroup.leaderId);
                return leader ? (
                  <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
                        leader.avatarColor
                      )}
                    >
                      {getInitials(leader.firstName, leader.lastName)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {leader.firstName} {leader.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{leader.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Leader not found</p>
                );
              })()}
            </div>

            {/* Meeting Details */}
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Meeting Details
              </h3>
              <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">When:</span>{" "}
                  {selectedGroup.meetingDay} at {selectedGroup.meetingTime}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Where:</span> {selectedGroup.location}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Avg Attendance:</span>{" "}
                  {selectedGroup.avgAttendance} people
                </p>
              </div>
            </div>

            {/* Members */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Members ({selectedGroup.memberIds.length})
              </h3>
              <div className="space-y-2">
                {selectedGroup.memberIds.map((memberId) => {
                  const member = getPersonById(memberId);
                  return member ? (
                    <div
                      key={memberId}
                      className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-2.5 transition-colors hover:bg-gray-50"
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
                          member.avatarColor
                        )}
                      >
                        {getInitials(member.firstName, member.lastName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="truncate text-sm text-gray-600">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
