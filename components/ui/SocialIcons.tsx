export function InstagramGlyph({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function FacebookGlyph({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M13.8 9.2h1.6V6.8h-1.9c-1.7 0-2.8 1.1-2.8 2.9v1.3H9.2v2.4h1.5V18h2.4v-4.6h1.7l.3-2.4h-2v-1c0-.5.2-.8.7-.8Z"
        fill="currentColor"
      />
    </svg>
  );
}
