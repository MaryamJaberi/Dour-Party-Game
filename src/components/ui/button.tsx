import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,opacity,background-color,color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg shadow-[0_10px_28px_-8px_rgba(255,77,122,0.85)] hover:opacity-95",
        paper: "bg-paper text-paper-ink hover:bg-[#ffe9b8]",
        ghost: "bg-transparent text-fg hover:bg-fg/8 border border-border",
        teal: "bg-teal text-teal-fg shadow-[0_10px_24px_-10px_rgba(46,224,178,0.8)] hover:opacity-95",
        danger: "bg-accent/15 text-accent hover:bg-accent/25",
        subtle: "bg-bg-subtle text-fg hover:bg-bg-elevated",
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-[10px]",
        md: "h-11 px-4 text-sm rounded-xl",
        lg: "h-12 px-5 text-base rounded-2xl",
        icon: "size-11 rounded-xl",
        pill: "h-10 px-4 text-sm rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";
