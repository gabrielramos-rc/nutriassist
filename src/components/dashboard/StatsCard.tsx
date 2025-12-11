import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl p-6 shadow-sm border border-gray-100",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                "text-sm mt-1",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : "-"}{trend.value}% vs. semana passada
            </p>
          )}
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <Icon className="w-6 h-6 text-green-600" />
        </div>
      </div>
    </div>
  );
}
