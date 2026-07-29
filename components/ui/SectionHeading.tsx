import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  dark = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <span
        className={cn(
          "inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] tabular",
          dark ? "text-sun" : "text-sun-2"
        )}
      >
        <span className="h-px w-6 bg-current" />
        {eyebrow}
      </span>
      <h2
        className={cn(
          "mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-balance",
          dark ? "text-white" : "text-navy dark:text-white"
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn("mt-4 text-base leading-relaxed", dark ? "text-white/70" : "text-mute dark:text-white/60")}>
          {description}
        </p>
      )}
    </div>
  );
}
