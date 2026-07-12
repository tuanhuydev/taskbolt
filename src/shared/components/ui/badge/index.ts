import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as Badge } from "./Badge.vue";

export const badgeVariants = cva(
  "inline-flex items-center h-5 px-2 rounded-full text-[10.5px] font-bold uppercase tracking-wide whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "bg-slate-100 text-slate-700",
        brand: "bg-blue-50 text-blue-700",
        purple: "bg-violet-50 text-violet-700",
        info: "bg-sky-50 text-sky-700",
        danger: "bg-red-50 text-red-700",
        success: "bg-green-50 text-green-700",
        warning: "bg-amber-50 text-amber-700",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
