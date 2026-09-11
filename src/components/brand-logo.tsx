/**
 * Premium B.A.B.C Brand Logo Component
 * Features: Elegant gradient, professional styling, floating animation
 */

export function BrandLogo({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeMap = {
    sm: { container: "size-10", text: "text-sm", padding: "p-1.5" },
    md: { container: "size-12", text: "text-base", padding: "p-2" },
    lg: { container: "size-16", text: "text-2xl", padding: "p-3" },
  };

  const sizeConfig = sizeMap[size];

  return (
    <div className={`relative inline-flex items-center justify-center ${sizeConfig.container}`}>
      {/* Premium glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/40 via-blue-500/20 to-transparent blur-xl opacity-80" />

      {/* Main background with premium gradient */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-2xl" />

      {/* Accent gold stripe on right */}
      <div className="absolute right-0 top-1/4 h-1/2 w-1 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full opacity-70" />

      {/* Inner highlight for depth */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/15 to-transparent" />

      {/* Text content */}
      <div className={`relative font-black text-white tracking-tighter ${sizeConfig.text} ${className}`}>
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
        <div className="animate-fade-in space-y-1">
          <div className="flex items-baseline gap-1">
            <p className="font-black text-base text-foreground">B.A.B.C</p>
          </div>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">From Vision to Legacy</p>
        </div>
      )}
    </div>
  );
}

/**
 * SVG-based premium logo for print and high-res display
 * Can be customized with different colors and styles
 */
export function BrandLogoSVG({ 
  size = 128, 
  withText = true,
}: { 
  size?: number;
  withText?: boolean;
}) {
  const viewHeight = withText ? 160 : 128;
  
  return (
    <svg
      width={size}
      height={size * (viewHeight / 128)}
      viewBox={`0 0 128 ${viewHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-float"
    >
      <defs>
        {/* Premium blue gradient */}
        <linearGradient id="premiumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Gold accent gradient */}
        <linearGradient id="goldAccent" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Glow effect */}
        <filter id="premiumGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main logo circle background */}
      <rect x="16" y="8" width="96" height="96" rx="16" fill="url(#premiumGradient)" filter="url(#premiumGlow)" />

      {/* Top-left highlight for depth */}
      <rect x="16" y="8" width="48" height="48" rx="16" fill="white" opacity="0.18" />

      {/* Gold accent stripe on right */}
      <rect x="104" y="32" width="6" height="56" rx="3" fill="url(#goldAccent)" opacity="0.85" />

      {/* Premium text: BW */}
      <text x="64" y="68" textAnchor="middle" fontSize="56" fontWeight="900" fontFamily="'Poppins', sans-serif" fill="white" letterSpacing="-2">
        BW
      </text>

      {withText && (
        <>
          {/* Subtitle: B.A.B.C */}
          <text x="64" y="128" textAnchor="middle" fontSize="16" fontWeight="700" fontFamily="'Poppins', sans-serif" fill="#1F2937" letterSpacing="1.5">
            B.A.B.C
          </text>

          {/* Tagline */}
          <text x="64" y="148" textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="'Inter', sans-serif" fill="#6B7280" letterSpacing="1">
            FROM VISION TO LEGACY
          </text>
        </>
      )}
    </svg>
  );
}
