/**
 * Hero illustration for the welcome screen: a disaster-preparedness plan
 * being read and annotated by AI — a document with a knowledge-graph node
 * pattern, a magnifying glass surfacing an insight, and a small alert glyph
 * standing in for "emergency readiness". Sits inside a soft organic blob,
 * echoing the reference layout without reusing its resume/briefcase motif.
 */
export default function WelcomeIllustration() {
  return (
    <svg
      viewBox="0 0 320 320"
      className="h-full w-full max-w-[280px]"
      role="img"
      aria-label="Illustration of an AI reviewing a disaster preparedness plan connected by a knowledge graph"
    >
      <defs>
        <clipPath id="blob-clip">
          <path d="M160 24c58 0 96 20 118 62 20 40 10 88-18 122-27 33-64 54-108 56-46 2-92-16-116-54C13 172 8 122 34 82 60 42 104 24 160 24Z" />
        </clipPath>
      </defs>

      {/* Organic blob backdrop */}
      <path
        d="M160 24c58 0 96 20 118 62 20 40 10 88-18 122-27 33-64 54-108 56-46 2-92-16-116-54C13 172 8 122 34 82 60 42 104 24 160 24Z"
        fill="#FFFFFF"
        fillOpacity="0.14"
      />

      <g clipPath="url(#blob-clip)">
        <rect x="0" y="0" width="320" height="320" fill="#FFFFFF" fillOpacity="0.06" />
      </g>

      {/* Plan document */}
      <g transform="translate(96 66)">
        <rect x="0" y="0" width="128" height="170" rx="10" fill="#FFFFFF" />
        <rect x="0" y="0" width="128" height="170" rx="10" fill="none" stroke="#FFFFFF" strokeOpacity="0.5" />

        {/* Header bar */}
        <rect x="16" y="20" width="60" height="7" rx="3.5" fill="#10B981" />
        <rect x="16" y="34" width="40" height="5" rx="2.5" fill="#D1FAE5" />

        {/* Knowledge-graph mini network on the page */}
        <line x1="30" y1="70" x2="60" y2="58" stroke="#A7F3D0" strokeWidth="2" />
        <line x1="60" y1="58" x2="92" y2="72" stroke="#A7F3D0" strokeWidth="2" />
        <line x1="60" y1="58" x2="60" y2="90" stroke="#A7F3D0" strokeWidth="2" />
        <line x1="60" y1="90" x2="30" y2="100" stroke="#A7F3D0" strokeWidth="2" />
        <line x1="60" y1="90" x2="92" y2="100" stroke="#A7F3D0" strokeWidth="2" />
        <circle cx="30" cy="70" r="6" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
        <circle cx="60" cy="58" r="7" fill="#10B981" />
        <circle cx="92" cy="72" r="6" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
        <circle cx="60" cy="90" r="6" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
        <circle cx="30" cy="100" r="6" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
        <circle cx="92" cy="100" r="6" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />

        {/* Text lines */}
        <rect x="16" y="122" width="96" height="5" rx="2.5" fill="#E5E7EB" />
        <rect x="16" y="134" width="80" height="5" rx="2.5" fill="#E5E7EB" />
        <rect x="16" y="146" width="88" height="5" rx="2.5" fill="#E5E7EB" />
      </g>

      {/* Magnifying glass surfacing an insight */}
      <g transform="translate(178 40)">
        <circle cx="0" cy="0" r="20" fill="#FFFFFF" stroke="#0D9268" strokeWidth="4" />
        <line x1="14" y1="14" x2="28" y2="28" stroke="#0D9268" strokeWidth="5" strokeLinecap="round" />
        <path d="M-8 0l5 5 9-11" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Alert / readiness glyph */}
      <g transform="translate(74 226)">
        <circle cx="0" cy="0" r="22" fill="#FFFFFF" />
        <path d="M0 -10l2.5 14h-5L0 -10Z" fill="#F59E0B" />
        <circle cx="0" cy="8" r="1.8" fill="#F59E0B" />
      </g>

      {/* Small orbiting node accents */}
      <circle cx="238" cy="150" r="5" fill="#FFFFFF" fillOpacity="0.8" />
      <circle cx="70" cy="60" r="4" fill="#FFFFFF" fillOpacity="0.6" />
      <circle cx="230" cy="240" r="4" fill="#FFFFFF" fillOpacity="0.6" />
    </svg>
  );
}