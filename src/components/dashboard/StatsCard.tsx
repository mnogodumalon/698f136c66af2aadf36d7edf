import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "hero";
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, variant = "default" }: StatsCardProps) {
  const isHero = variant === "hero";

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200",
      isHero
        ? "gradient-hero text-white border-0 shadow-lg col-span-full md:col-span-1"
        : "shadow-card card-hover"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className={cn(
              "text-sm font-medium",
              isHero ? "text-white/70" : "text-muted-foreground"
            )}>
              {title}
            </p>
            <p className={cn(
              "font-bold tracking-tight",
              isHero ? "text-4xl" : "text-3xl"
            )}>
              {value}
            </p>
            {subtitle && (
              <p className={cn(
                "text-sm",
                isHero ? "text-white/60" : "text-muted-foreground"
              )}>
                {subtitle}
              </p>
            )}
            {trend && (
              <p className={cn(
                "text-sm flex items-center gap-1",
                trend.value >= 0
                  ? isHero ? "text-emerald-300" : "text-accent"
                  : "text-destructive"
              )}>
                <span>{trend.value >= 0 ? "+" : ""}{trend.value}%</span>
                <span className={isHero ? "text-white/60" : "text-muted-foreground"}>
                  {trend.label}
                </span>
              </p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-xl",
            isHero
              ? "bg-white/10"
              : "bg-primary/10"
          )}>
            <Icon className={cn(
              "size-6",
              isHero ? "text-white" : "text-primary"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
