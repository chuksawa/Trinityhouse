import { cn } from "@/lib/utils";
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  subtitle?: string;
}

export default function StatCard({
  label,
  value,
  change,
  icon: Icon,
  iconColor = "text-brand-600 bg-brand-50",
  subtitle,
}: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="mt-1 flex items-center gap-1">
              {change >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  change >= 0 ? "text-emerald-600" : "text-red-600"
                )}
              >
                {change >= 0 ? "+" : ""}
                {change}%
              </span>
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
          )}
          {subtitle && (
            <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className={cn("rounded-lg p-2.5", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
