import { Pill, Leaf, Droplets, FlaskConical, Sparkles, type LucideIcon } from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Pill,
  Leaf,
  Droplets,
  FlaskConical,
  Sparkles,
};

export function getCategoryIcon(name: string | null): LucideIcon {
  return (name && CATEGORY_ICONS[name]) || Pill;
}
