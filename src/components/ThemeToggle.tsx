import * as React from "react";
import { Landmark, Moon, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type AppTheme = "vibrant" | "official" | "night";

const THEMES: Array<{ value: AppTheme; label: string; Icon: React.ElementType }> = [
  { value: "vibrant", label: "Vibrant", Icon: Sparkles },
  { value: "official", label: "Official", Icon: Landmark },
  { value: "night", label: "Night", Icon: Moon },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const value = (theme as AppTheme | undefined) ?? "official";

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => setTheme((v || value) as AppTheme)}
      variant="outline"
      size="sm"
      className={cn("rounded-lg bg-background/40 backdrop-blur", className)}
      aria-label="Theme"
      disabled={!mounted}
    >
      {THEMES.map(({ value: v, label, Icon }) => (
        <ToggleGroupItem
          key={v}
          value={v}
          aria-label={label}
          className="gap-1.5"
        >
          <Icon className="h-4 w-4" />
          <span className="hidden lg:inline">{label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
