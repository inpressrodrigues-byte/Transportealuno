import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  variant?: "wordmark" | "mark";
};

export function BrandLogo({ className, priority = false, variant = "wordmark" }: BrandLogoProps) {
  if (variant === "mark") {
    return (
      <Image
        src="/icon.png"
        alt="Oziel Turismo"
        width={512}
        height={512}
        priority={priority}
        className={cn("h-10 w-10 rounded-lg object-cover", className)}
      />
    );
  }

  return (
    <Image
      src="/brand/oziel-logo-v3.png"
      alt="Oziel Turismo"
      width={1200}
      height={193}
      priority={priority}
      className={cn("h-auto w-40 object-contain", className)}
    />
  );
}
