/**
 * Premium B.A.B.C Brand Logo Component
 * Features: Gradient styling, floating animation, responsive sizing
 */

export function BrandLogo({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = {
    sm: "size-8 text-xs",
    md: "size-11 text-lg",
    lg: "size-16 text-2xl",
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${sizes[size]}`}>
      {/* Outer glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/30 via-accent/20 to-transparent blur-lg opacity-75" />

      {/* Main logo background with gradient */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary via-primary/90 to-primary/80 shadow-lg" />

      {/* Inner highlight accent */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 rounded-tl-lg bg-gradient-to-br from-white/20 to-transparent" />

      {/* Text content */}
      <div className={`relative font-brand font-black text-primary-foreground tracking-tight ${className}`}>
        BW
      </div>
    </div>
  );
}

export function BrandLogoWithText({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="animate-float">
        <BrandLogo size="md" />
      </div>

      {!compact && (
        <div className="animate-fade-in">
          <p className="font-brand text-sm font-bold leading-none text-foreground">B.A.B.C</p>
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">From Vision to Legacy</p>
        </div>
      )}
    </div>
  );
}

/**
 * SVG-based alternative logo for advanced styling
 * Can be customized with different colors and styles
 */
export function BrandLogoSVG({ 
  size = 64, 
  primaryColor = "#3b82f6",
  accentColor = "#fbbf24",
}: { 
  size?: number;
  primaryColor?: string;
  accentColor?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-float"
    >
      {/* Background gradient definition */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0.8" />
        </linearGradient>
        <filter id="logoGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main background shape */}
      <rect x="4" y="4" width="56" height="56" rx="8" fill="url(#logoGradient)" filter="url(#logoGlow)" />

      {/* Accent corner highlight */}
      <rect x="4" y="4" width="28" height="28" rx="8" fill="white" opacity="0.15" />

      {/* Text - BW */}
      <text
        x="32"
        y="40"
        textAnchor="middle"
        fontSize="28"
        fontWeight="900"
        fontFamily="'Poppins', sans-serif"
        fill="white"
        letterSpacing="-1"
      >
        BW
      </text>
    </svg>
  );
}
