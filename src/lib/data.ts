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

export const people: Person[] = [
  {
    id: "p1",
    firstName: "David",
    lastName: "Okonkwo",
    email: "david@trinityhouse.org",
    phone: "(555) 100-0001",
    role: "senior_pastor",
    joinDate: "2012-01-15",
    groups: ["g1", "g5"],
    servingTeams: ["Leadership", "Preaching"],
    milestones: [
      { label: "Baptism", date: "2000-06-12" },
      { label: "Ordained", date: "2010-09-01" },
    ],
    careNotes: [],
    givingTotal: 42000,
    lastAttendance: "2026-03-09",
    status: "active",
    avatarColor: AVATAR_COLORS[0],
  },
  {
    id: "p2",
    firstName: "Grace",
    lastName: "Okonkwo",
    email: "grace@trinityhouse.org",
    phone: "(555) 100-0002",
    role: "staff",
    joinDate: "2012-01-15",
    familyId: "f1",
    groups: ["g1", "g3"],
    servingTeams: ["Women's Ministry", "Worship"],
    milestones: [
      { label: "Baptism", date: "2001-04-22" },
      { label: "Staff Onboard", date: "2015-06-01" },
    ],
    careNotes: [],
    givingTotal: 38000,
    lastAttendance: "2026-03-09",
    status: "active",
    avatarColor: AVATAR_COLORS[1],
  },
  {
    id: "p3",
    firstName: "Samuel",
    lastName: "Adeyemi",
    email: "samuel.a@email.com",
    phone: "(555) 200-0003",
    role: "volunteer",
    joinDate: "2018-03-10",
    groups: ["g2", "g4"],
    servingTeams: ["Ushering", "Youth"],
    milestones: [
      { label: "Baptism", date: "2018-07-15" },
      { label: "Volunteer Start", date: "2019-01-01" },
    ],
    careNotes: [
      {
        note: "Going through career transition, check in monthly.",
        date: "2026-02-10",
        by: "Pastor David",
      },
    ],
    givingTotal: 8500,
    lastAttendance: "2026-03-09",
    status: "active",
    avatarColor: AVATAR_COLORS[2],
  },
  {
    id: "p4",
    firstName: "Amara",
    lastName: "Nwosu",
    email: "amara.n@email.com",
    phone: "(555) 200-0004",
    role: "member",
    joinDate: "2020-09-20",
    groups: ["g1"],
    servingTeams: [],
    milestones: [{ label: "Salvation", date: "2020-09-20" }],
    careNotes: [
      {
        note: "Hasn't attended in 4 weeks. Called, left voicemail.",
        date: "2026-02-25",
        by: "Grace Okonkwo",
      },
    ],
    givingTotal: 2200,
    lastAttendance: "2026-02-02",
    status: "at_risk",
    avatarColor: AVATAR_COLORS[3],
  },
  {
    id: "p5",
    firstName: "Tobias",
    lastName: "Eze",
    email: "tobias.eze@email.com",
    phone: "(555) 200-0005",
    role: "volunteer",
    joinDate: "2019-05-12",
    groups: ["g2"],
    servingTeams: ["Media", "Sound"],
    milestones: [
      { label: "Baptism", date: "2019-08-11" },
      { label: "Completed Growth Track", date: "2020-03-15" },
    ],
    careNotes: [],
    givingTotal: 12000,
    lastAttendance: "2026-03-09",
    status: "active",
    avatarColor: AVATAR_COLORS[4],
  },
  {
    id: "p6",
    firstName: "Chioma",
    lastName: "Okeke",
    email: "chioma.o@email.com",
    phone: "(555) 200-0006",
    role: "staff",
    joinDate: "2016-02-28",
    groups: ["g3", "g5"],
    servingTeams: ["Children's Ministry", "Admin"],
    milestones: [
      { label: "Baptism", date: "2010-12-25" },
      { label: "Staff Onboard", date: "2016-03-01" },
    ],
    careNotes: [],
    givingTotal: 28000,
    lastAttendance: "2026-03-09",
    status: "active",
    avatarColor: AVATAR_COLORS[5],
  },
  {
    id: "p7",
    firstName: "Emeka",
    lastName: "Uche",
    email: "emeka.u@email.com",
    phone: "(555) 200-0007",
    role: "member",
    joinDate: "2024-11-03",
    groups: [],
    servingTeams: [],
    milestones: [{ label: "First Visit", date: "2024-11-03" }],
    careNotes: [
      {
        note: "Newcomer. Completed connect card. Interested in men's group.",
        date: "2024-11-05",
        by: "Samuel Adeyemi",
      },
    ],
    givingTotal: 500,
    lastAttendance: "2026-03-02",
    status: "new",
    avatarColor: AVATAR_COLORS[6],
  },
  {
    id: "p8",
    firstName: "Blessing",
    lastName: "Ifeoma",
    email: "blessing.i@email.com",
    phone: "(555) 200-0008",
    role: "member",
    joinDate: "2021-06-15",
    groups: ["g3"],
    servingTeams: ["Choir"],
    milestones: [
      { label: "Baptism", date: "2021-09-12" },
      { label: "Completed Growth Track", date: "2022-01-20" },
    ],
    careNotes: [],
    givingTotal: 6800,
    lastAttendance: "2026-03-09",
    status: "active",
    avatarColor: AVATAR_COLORS[7],
  },
  {
    id: "p9",
    firstName: "Daniel",
    lastName: "Obi",
    email: "daniel.obi@email.com",
    phone: "(555) 200-0009",
    role: "member",
    joinDate: "2023-01-08",
    groups: ["g4"],
    servingTeams: ["Parking"],
    milestones: [{ label: "Salvation", date: "2023-01-08" }],
    careNotes: [
      {
        note: "Hospital visit — knee surgery recovery. Praying for quick healing.",
        date: "2026-01-20",
        by: "Pastor David",
      },
    ],
    givingTotal: 3200,
    lastAttendance: "2026-01-12",
    status: "inactive",
    avatarColor: AVATAR_COLORS[8],
  },
  {
    id: "p10",
    firstName: "Funke",
    lastName: "Adebayo",
    email: "funke.a@email.com",
    phone: "(555) 200-0010",
    role: "volunteer",
    joinDate: "2017-08-22",
    groups: ["g1", "g5"],
    servingTeams: ["Hospitality", "Events"],
    milestones: [
      { label: "Baptism", date: "2017-12-10" },
      { label: "Small Group Leader", date: "2020-09-01" },
    ],
    careNotes: [],
    givingTotal: 15000,
    lastAttendance: "2026-03-09",
    status: "active",
    avatarColor: AVATAR_COLORS[9],
  },
  {
    id: "p11",
    firstName: "Kalu",
    lastName: "Nnaji",
    email: "kalu.n@email.com",
    phone: "(555) 200-0011",
    role: "member",
    joinDate: "2025-01-19",
    groups: [],
    servingTeams: [],
    milestones: [{ label: "First Visit", date: "2025-01-19" }],
    careNotes: [
      {
        note: "First-time visitor from online. Attended 3 Sundays so far.",
        date: "2025-02-10",
        by: "Chioma Okeke",
      },
    ],
    givingTotal: 0,
    lastAttendance: "2026-02-16",
    status: "new",
    avatarColor: AVATAR_COLORS[0],
  },
  {
    id: "p12",
    firstName: "Rita",
    lastName: "Chukwu",
    email: "rita.c@email.com",
    phone: "(555) 200-0012",
    role: "member",
    joinDate: "2022-04-10",
    groups: ["g3"],
    servingTeams: ["Worship"],
    milestones: [
      { label: "Baptism", date: "2022-07-17" },
    ],
    careNotes: [],
    givingTotal: 4300,
    lastAttendance: "2026-03-09",
    status: "active",
    avatarColor: AVATAR_COLORS[1],
  },
];

export const groups: Group[] = [
  {
    id: "g1",
    name: "Faith Builders",
    type: "small_group",
    leaderId: "p10",
    memberIds: ["p1", "p2", "p4", "p10"],
    meetingDay: "Wednesday",
    meetingTime: "7:00 PM",
    location: "Okonkwo Home",
    description: "A group focused on deepening faith through Bible study and prayer.",
    avgAttendance: 8,
  },
  {
    id: "g2",
    name: "Young Adults",
    type: "small_group",
    leaderId: "p3",
    memberIds: ["p3", "p5"],
    meetingDay: "Friday",
    meetingTime: "6:30 PM",
    location: "Church Hall B",
    description: "Community and growth for ages 18–30.",
    avgAttendance: 15,
  },
  {
    id: "g3",
    name: "Women of Purpose",
    type: "small_group",
    leaderId: "p2",
    memberIds: ["p2", "p6", "p8", "p12"],
    meetingDay: "Saturday",
    meetingTime: "10:00 AM",
    location: "Church Lounge",
    description: "Empowering women through fellowship, mentoring, and outreach.",
    avgAttendance: 12,
  },
  {
    id: "g4",
    name: "Men of Valor",
    type: "small_group",
    leaderId: "p5",
    memberIds: ["p3", "p5", "p9"],
    meetingDay: "Saturday",
    meetingTime: "8:00 AM",
    location: "Church Hall A",
    description: "Iron sharpens iron — accountability, prayer, and brotherhood.",
    avgAttendance: 10,
  },
  {
    id: "g5",
    name: "Worship Team",
    type: "ministry_team",
    leaderId: "p2",
    memberIds: ["p2", "p6", "p10"],
    meetingDay: "Thursday",
    meetingTime: "6:00 PM",
    location: "Sanctuary",
    description: "Leading the congregation in worship every Sunday and special events.",
    avgAttendance: 8,
  },
  {
    id: "g6",
    name: "Media & Production",
    type: "volunteer_team",
    leaderId: "p5",
    memberIds: ["p5"],
    meetingDay: "Sunday",
    meetingTime: "7:30 AM",
    location: "Media Booth",
    description: "Livestream, sound, lighting, and visual production.",
    avgAttendance: 5,
  },
];

export const events: ChurchEvent[] = [
  {
    id: "e1",
    title: "Sunday Worship Service",
    type: "service",
    date: "2026-03-15",
    time: "9:00 AM",
    endTime: "11:30 AM",
    location: "Main Sanctuary",
    capacity: 500,
    registered: 0,
    checkedIn: 342,
    description: "Weekly Sunday gathering for worship, Word, and fellowship.",
    teams: ["Worship Team", "Ushering", "Media & Production", "Children's Ministry"],
  },
  {
    id: "e2",
    title: "Easter Celebration Service",
    type: "service",
    date: "2026-04-05",
    time: "8:00 AM",
    endTime: "12:00 PM",
    location: "Main Sanctuary + Overflow",
    capacity: 800,
    registered: 612,
    checkedIn: 0,
    description: "Resurrection Sunday celebration with special worship and drama presentation.",
    teams: ["Worship Team", "Drama", "Ushering", "Hospitality", "Media & Production"],
  },
  {
    id: "e3",
    title: "Marriage Enrichment Retreat",
    type: "conference",
    date: "2026-04-18",
    time: "9:00 AM",
    endTime: "5:00 PM",
    location: "Lakeside Conference Center",
    capacity: 60,
    registered: 42,
    checkedIn: 0,
    description: "A one-day retreat for couples to strengthen their marriage.",
    teams: ["Events", "Hospitality"],
  },
  {
    id: "e4",
    title: "Youth Night",
    type: "event",
    date: "2026-03-21",
    time: "6:00 PM",
    endTime: "9:00 PM",
    location: "Church Hall B",
    capacity: 100,
    registered: 67,
    checkedIn: 0,
    description: "Worship, games, and teaching for teens and young adults.",
    teams: ["Youth", "Media & Production"],
  },
  {
    id: "e5",
    title: "Leadership Meeting",
    type: "meeting",
    date: "2026-03-17",
    time: "7:00 PM",
    endTime: "9:00 PM",
    location: "Conference Room",
    capacity: 20,
    registered: 14,
    checkedIn: 0,
    description: "Monthly leadership team meeting to review church health and plan ahead.",
    teams: ["Leadership"],
  },
  {
    id: "e6",
    title: "Community Outreach Day",
    type: "event",
    date: "2026-03-29",
    time: "10:00 AM",
    endTime: "3:00 PM",
    location: "City Park & Surrounding Neighborhood",
    capacity: 150,
    registered: 88,
    checkedIn: 0,
    description: "Serving our community through food distribution, prayer walks, and free health screenings.",
    teams: ["Outreach", "Hospitality", "Events"],
  },
];

export const gifts: Gift[] = [
  { id: "gf1", personId: "p1", amount: 5000, date: "2026-03-02", fund: "tithe", method: "online", recurring: true },
  { id: "gf2", personId: "p2", amount: 4500, date: "2026-03-02", fund: "tithe", method: "online", recurring: true },
  { id: "gf3", personId: "p3", amount: 800, date: "2026-03-09", fund: "tithe", method: "text", recurring: true },
  { id: "gf4", personId: "p5", amount: 1200, date: "2026-03-09", fund: "tithe", method: "online", recurring: true },
  { id: "gf5", personId: "p6", amount: 3000, date: "2026-03-02", fund: "tithe", method: "online", recurring: true },
  { id: "gf6", personId: "p8", amount: 500, date: "2026-03-09", fund: "offering", method: "cash", recurring: false },
  { id: "gf7", personId: "p10", amount: 1500, date: "2026-03-02", fund: "tithe", method: "online", recurring: true },
  { id: "gf8", personId: "p12", amount: 350, date: "2026-03-09", fund: "tithe", method: "text", recurring: true },
  { id: "gf9", personId: "p1", amount: 2000, date: "2026-03-02", fund: "missions", method: "online", recurring: false },
  { id: "gf10", personId: "p2", amount: 1000, date: "2026-03-02", fund: "building_fund", method: "online", recurring: true },
  { id: "gf11", personId: "p3", amount: 200, date: "2026-02-23", fund: "offering", method: "cash", recurring: false },
  { id: "gf12", personId: "p5", amount: 1200, date: "2026-02-23", fund: "tithe", method: "online", recurring: true },
  { id: "gf13", personId: "p6", amount: 3000, date: "2026-02-23", fund: "tithe", method: "online", recurring: true },
  { id: "gf14", personId: "p7", amount: 100, date: "2026-03-02", fund: "offering", method: "cash", recurring: false },
  { id: "gf15", personId: "p10", amount: 500, date: "2026-02-23", fund: "benevolence", method: "online", recurring: false },
  { id: "gf16", personId: "p1", amount: 5000, date: "2026-02-16", fund: "tithe", method: "online", recurring: true },
  { id: "gf17", personId: "p2", amount: 4500, date: "2026-02-16", fund: "tithe", method: "online", recurring: true },
  { id: "gf18", personId: "p4", amount: 300, date: "2026-01-26", fund: "tithe", method: "text", recurring: false },
  { id: "gf19", personId: "p9", amount: 400, date: "2026-01-05", fund: "tithe", method: "online", recurring: false },
  { id: "gf20", personId: "p11", amount: 0, date: "2026-01-19", fund: "offering", method: "cash", recurring: false },
];

export const messages: MessageRecord[] = [
  {
    id: "m1",
    subject: "Easter Service — Invite Someone!",
    body: "Easter is coming! Invite a friend or family member to experience the hope of the resurrection with us on April 5th.",
    channel: "push",
    audience: "All Members",
    sentDate: "2026-03-10",
    status: "sent",
    recipients: 320,
    opened: 248,
  },
  {
    id: "m2",
    subject: "Marriage Retreat — Last Spots Available",
    body: "Couples, only 18 spots remain for the Marriage Enrichment Retreat on April 18. Register today!",
    channel: "email",
    audience: "Married Couples",
    sentDate: "2026-03-08",
    status: "sent",
    recipients: 94,
    opened: 71,
  },
  {
    id: "m3",
    subject: "Volunteer Schedule — March",
    body: "Your March volunteer schedule is ready. Check the app to view your serving dates and swap if needed.",
    channel: "sms",
    audience: "Volunteers",
    sentDate: "2026-02-28",
    status: "sent",
    recipients: 45,
    opened: 45,
  },
  {
    id: "m4",
    subject: "Weekly Devotional — The Power of Prayer",
    body: "This week's devotional focuses on building a consistent prayer life...",
    channel: "email",
    audience: "All Members",
    sentDate: "2026-03-11",
    status: "scheduled",
    recipients: 320,
    opened: 0,
  },
  {
    id: "m5",
    subject: "Welcome to Trinity House!",
    body: "We're so glad you visited! Here's how to get connected...",
    channel: "email",
    audience: "New Visitors",
    sentDate: "2026-03-09",
    status: "sent",
    recipients: 5,
    opened: 4,
  },
];

export const sermons: Sermon[] = [
  {
    id: "s1",
    title: "Unshakeable Faith",
    speaker: "Pastor David Okonkwo",
    series: "Standing Firm",
    date: "2026-03-09",
    duration: "42 min",
    views: 287,
    description: "In times of uncertainty, how do we anchor ourselves in God's promises?",
  },
  {
    id: "s2",
    title: "The God Who Sees",
    speaker: "Pastor David Okonkwo",
    series: "Standing Firm",
    date: "2026-03-02",
    duration: "38 min",
    views: 412,
    description: "Hagar's story reminds us that no one is invisible to God.",
  },
  {
    id: "s3",
    title: "When the Storm Comes",
    speaker: "Pastor David Okonkwo",
    series: "Standing Firm",
    date: "2026-02-23",
    duration: "45 min",
    views: 356,
    description: "Jesus didn't promise us calm seas—He promised to be in the boat with us.",
  },
  {
    id: "s4",
    title: "Identity in Christ",
    speaker: "Grace Okonkwo",
    series: "Who You Are",
    date: "2026-02-16",
    duration: "35 min",
    views: 298,
    description: "You are not what the world says you are. You are who God says you are.",
  },
  {
    id: "s5",
    title: "The Generous Heart",
    speaker: "Pastor David Okonkwo",
    series: "Open Hands",
    date: "2026-02-09",
    duration: "40 min",
    views: 265,
    description: "Generosity isn't about the size of the gift—it's about the posture of the heart.",
  },
  {
    id: "s6",
    title: "Walking in Purpose",
    speaker: "Pastor David Okonkwo",
    series: "Open Hands",
    date: "2026-02-02",
    duration: "43 min",
    views: 231,
    description: "God has a plan for your life that is bigger than your comfort zone.",
  },
];

export const prayerRequests: PrayerRequest[] = [
  { id: "pr1", personId: "p4", request: "Praying for direction in my career and peace in decision-making.", date: "2026-03-08", status: "active", prayerCount: 18 },
  { id: "pr2", personId: "p9", request: "Quick recovery from knee surgery. Hoping to be back in church soon.", date: "2026-01-22", status: "active", prayerCount: 32 },
  { id: "pr3", personId: "p8", request: "My mother's health — she starts treatment next week.", date: "2026-03-05", status: "active", prayerCount: 24 },
  { id: "pr4", personId: "p7", request: "Settling into the city and finding a community. Grateful for Trinity House!", date: "2026-02-15", status: "answered", prayerCount: 15 },
  { id: "pr5", personId: "p3", request: "Wisdom and strength as I lead the Young Adults group this season.", date: "2026-03-01", status: "active", prayerCount: 11 },
];

export const attendanceHistory = [
  { week: "Jan 5", attendance: 298 },
  { week: "Jan 12", attendance: 312 },
  { week: "Jan 19", attendance: 305 },
  { week: "Jan 26", attendance: 289 },
  { week: "Feb 2", attendance: 321 },
  { week: "Feb 9", attendance: 335 },
  { week: "Feb 16", attendance: 318 },
  { week: "Feb 23", attendance: 342 },
  { week: "Mar 2", attendance: 356 },
  { week: "Mar 9", attendance: 342 },
];

export const givingHistory = [
  { month: "Oct", amount: 48200 },
  { month: "Nov", amount: 52100 },
  { month: "Dec", amount: 68500 },
  { month: "Jan", amount: 45800 },
  { month: "Feb", amount: 51200 },
  { month: "Mar", amount: 24850 },
];

export const dashboardStats = {
  totalMembers: 324,
  activeMembers: 278,
  newThisMonth: 8,
  avgAttendance: 342,
  attendanceChange: 5,
  totalGivingMTD: 24850,
  givingChange: 12,
  activeGroups: 6,
  groupParticipation: 68,
  volunteersServing: 45,
  volunteerChange: 3,
  newcomersFunnel: { visited: 14, connected: 8, joined: 5, serving: 2 },
  atRiskMembers: 12,
  followUpsNeeded: 7,
};

export function getPersonById(id: string): Person | undefined {
  return people.find((p) => p.id === id);
}

export function getGroupById(id: string): Group | undefined {
  return groups.find((g) => g.id === id);
}
