export type Role = "senior_pastor" | "staff" | "volunteer" | "member";
export type MemberStatus = "active" | "inactive" | "at_risk" | "new";

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  joinDate: string;
  familyId?: string;
  groups: string[];
  servingTeams: string[];
  milestones: { label: string; date: string }[];
  careNotes: { note: string; date: string; by: string }[];
  givingTotal: number;
  lastAttendance: string;
  status: MemberStatus;
  avatarColor: string;
}

export interface Group {
  id: string;
  name: string;
  type: "small_group" | "ministry_team" | "volunteer_team";
  leaderId: string;
  memberIds: string[];
  meetingDay: string;
  meetingTime: string;
  location: string;
  description: string;
  avgAttendance: number;
}

export interface ChurchEvent {
  id: string;
  title: string;
  type: "service" | "event" | "conference" | "meeting";
  date: string;
  time: string;
  endTime: string;
  location: string;
  capacity: number;
  registered: number;
  checkedIn: number;
  description: string;
  teams: string[];
}

export interface Gift {
  id: string;
  personId: string;
  amount: number;
  date: string;
  fund: "tithe" | "offering" | "missions" | "building_fund" | "benevolence";
  method: "online" | "text" | "cash" | "check";
  recurring: boolean;
}

export interface MessageRecord {
  id: string;
  subject: string;
  body: string;
  channel: "push" | "sms" | "email";
  audience: string;
  sentDate: string;
  status: "sent" | "draft" | "scheduled";
  recipients: number;
  opened: number;
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  series: string;
  date: string;
  duration: string;
  views: number;
  description: string;
}

export interface PrayerRequest {
  id: string;
  personId: string;
  request: string;
  date: string;
  status: "active" | "answered";
  prayerCount: number;
}

const AVATAR_COLORS = [
  "bg-brand-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-pink-500",
  "bg-sky-500",
];

/** In-dashboard data comes from APIs (people, events, sermons). This is fallback/empty only. */
export const people: Person[] = [];

export const groups: Group[] = [];

export const events: ChurchEvent[] = [];

export const gifts: Gift[] = [];

export const messages: MessageRecord[] = [];

export const sermons: Sermon[] = [];

export const prayerRequests: PrayerRequest[] = [];

export const attendanceHistory: { week: string; attendance: number }[] = [];
export const givingHistory: { month: string; amount: number }[] = [];

export const dashboardStats = {
  totalMembers: 0,
  activeMembers: 0,
  newThisMonth: 0,
  avgAttendance: 0,
  attendanceChange: 0,
  totalGivingMTD: 0,
  givingChange: 0,
  activeGroups: 0,
  groupParticipation: 0,
  volunteersServing: 0,
  volunteerChange: 0,
  newcomersFunnel: { visited: 0, connected: 0, joined: 0, serving: 0 },
  atRiskMembers: 0,
  followUpsNeeded: 0,
};

export function getPersonById(id: string): Person | undefined {
  return people.find((p) => p.id === id);
}

export function getGroupById(id: string): Group | undefined {
  return groups.find((g) => g.id === id);
}
