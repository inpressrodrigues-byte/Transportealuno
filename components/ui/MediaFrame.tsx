import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

export function MediaFrame({
  label,
  className,
  icon,
  tone = "navy",
}: {
  label: string;
  className?: string;
  icon?: React.ReactNode;
  tone?: "navy" | "mist" | "sun";
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border",
        tone === "navy" && "bg-gradient-to-br from-navy to-navy-2 border-white/10",
        tone === "mist" && "bg-gradient-to-br from-mist to-white border-line",
        tone === "sun" && "bg-gradient-to-br from-sun/20 to-sun/5 border-sun/30",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-[0.15]",
          "bg-[radial-gradient(circle_at_1px_1px,_currentColor_1px,_transparent_0)] [background-size:16px_16px]"
        )}
        style={{ color: tone === "navy" ? "#facc15" : "#0f172a" }}
      />
      <div
        className={cn(
          "relative z-10 flex h-12 w-12 items-center justify-center rounded-full",
          tone === "navy" ? "bg-white/10 text-sun" : "bg-navy/5 text-navy"
        )}
      >
        {icon ?? <ImageIcon size={20} />}
      </div>
      <span
        className={cn(
          "relative z-10 text-xs font-semibold uppercase tracking-widest text-center px-4",
          tone === "navy" ? "text-white/60" : "text-mute"
        )}
      >
        {label}
      </span>
    </div>
  );
}
