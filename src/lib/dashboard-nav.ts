import type { LucideIcon } from "lucide-react";
import {
  Home,
  LayoutDashboard,
  Users,
  UsersRound,
  CalendarDays,
  Heart,
  HeartHandshake,
  MessageSquare,
  MessageCircle,
  BookOpen,
  Settings,
} from "lucide-react";

export const dashboardNavItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/people", label: "People & Care", icon: Users },
  { href: "/dashboard/groups", label: "Groups & Teams", icon: UsersRound },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/giving", label: "Giving", icon: Heart },
  { href: "/dashboard/prayer-requests", label: "Prayer", icon: HeartHandshake },
  { href: "/dashboard/communication", label: "Communication", icon: MessageSquare },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/content", label: "Content", icon: BookOpen },
];

export const dashboardBottomItems = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export type NavItem = { href: string; label: string; icon: LucideIcon };
