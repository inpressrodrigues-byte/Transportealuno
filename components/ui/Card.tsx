import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  dark = false,
}: {
  className?: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1",
        dark
          ? "bg-white/[0.04] border border-white/10 hover:border-sun/40 hover:bg-white/[0.06]"
          : "bg-white border border-line shadow-sm hover:shadow-xl hover:shadow-navy/5 dark:bg-white/[0.04] dark:border-white/10",
        className
      )}
    >
      {children}
    </div>
  );
}
