import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
  {
    variants: {
      variant: {
        primary: "bg-sun text-navy hover:bg-sun-2 active:scale-[0.98] shadow-[0_8px_24px_-8px_rgba(250,204,21,0.6)]",
        dark: "bg-navy text-white hover:bg-navy-2 active:scale-[0.98]",
        outline: "border border-white/30 text-white hover:bg-white/10 active:scale-[0.98]",
        outlineDark: "border border-navy/20 text-navy hover:bg-navy/5 active:scale-[0.98]",
        ghost: "text-ink hover:bg-mist",
        whatsapp: "bg-[#25D366] text-white hover:brightness-95 active:scale-[0.98]",
      },
      size: {
        sm: "text-sm px-4 py-2",
        md: "text-sm px-6 py-3",
        lg: "text-base px-8 py-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonStyles({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonStyles };
