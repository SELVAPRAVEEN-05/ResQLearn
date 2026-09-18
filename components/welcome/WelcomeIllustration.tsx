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
      aria-label="Illustration of an AI reviewing a disaster preparedness plan connected by a knowledge graph"
      className="h-full w-full max-w-[280px]"
      role="img"
      viewBox="0 0 320 320"
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
        <rect
          fill="#FFFFFF"
          fillOpacity="0.06"
          height="320"
          width="320"
          x="0"
          y="0"
        />
      </g>

      {/* Plan document */}
      <g transform="translate(96 66)">
        <rect fill="#FFFFFF" height="170" rx="10" width="128" x="0" y="0" />
        <rect
          fill="none"
          height="170"
          rx="10"
          stroke="#FFFFFF"
          strokeOpacity="0.5"
          width="128"
          x="0"
          y="0"
        />

        {/* Header bar */}
        <rect fill="#10B981" height="7" rx="3.5" width="60" x="16" y="20" />
        <rect fill="#D1FAE5" height="5" rx="2.5" width="40" x="16" y="34" />

        {/* Knowledge-graph mini network on the page */}
        <line
          stroke="#A7F3D0"
          strokeWidth="2"
          x1="30"
          x2="60"
          y1="70"
          y2="58"
        />
        <line
          stroke="#A7F3D0"
          strokeWidth="2"
          x1="60"
          x2="92"
          y1="58"
          y2="72"
        />
        <line
          stroke="#A7F3D0"
          strokeWidth="2"
          x1="60"
          x2="60"
          y1="58"
          y2="90"
        />
        <line
          stroke="#A7F3D0"
          strokeWidth="2"
          x1="60"
          x2="30"
          y1="90"
          y2="100"
        />
        <line
          stroke="#A7F3D0"
          strokeWidth="2"
          x1="60"
          x2="92"
          y1="90"
          y2="100"
        />
        <circle
          cx="30"
          cy="70"
          fill="#FFFFFF"
          r="6"
          stroke="#10B981"
          strokeWidth="2"
        />
        <circle cx="60" cy="58" fill="#10B981" r="7" />
        <circle
          cx="92"
          cy="72"
          fill="#FFFFFF"
          r="6"
          stroke="#10B981"
          strokeWidth="2"
        />
        <circle
          cx="60"
          cy="90"
          fill="#FFFFFF"
          r="6"
          stroke="#10B981"
          strokeWidth="2"
        />
        <circle
          cx="30"
          cy="100"
          fill="#FFFFFF"
          r="6"
          stroke="#10B981"
          strokeWidth="2"
        />
        <circle
          cx="92"
          cy="100"
          fill="#FFFFFF"
          r="6"
          stroke="#10B981"
          strokeWidth="2"
        />

        {/* Text lines */}
        <rect fill="#E5E7EB" height="5" rx="2.5" width="96" x="16" y="122" />
        <rect fill="#E5E7EB" height="5" rx="2.5" width="80" x="16" y="134" />
        <rect fill="#E5E7EB" height="5" rx="2.5" width="88" x="16" y="146" />
      </g>

      {/* Magnifying glass surfacing an insight */}
      <g transform="translate(178 40)">
        <circle
          cx="0"
          cy="0"
          fill="#FFFFFF"
          r="20"
          stroke="#0D9268"
          strokeWidth="4"
        />
        <line
          stroke="#0D9268"
          strokeLinecap="round"
          strokeWidth="5"
          x1="14"
          x2="28"
          y1="14"
          y2="28"
        />
        <path
          d="M-8 0l5 5 9-11"
          fill="none"
          stroke="#10B981"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
      </g>

      {/* Alert / readiness glyph */}
      <g transform="translate(74 226)">
        <circle cx="0" cy="0" fill="#FFFFFF" r="22" />
        <path d="M0 -10l2.5 14h-5L0 -10Z" fill="#F59E0B" />
        <circle cx="0" cy="8" fill="#F59E0B" r="1.8" />
      </g>

      {/* Small orbiting node accents */}
      <circle cx="238" cy="150" fill="#FFFFFF" fillOpacity="0.8" r="5" />
      <circle cx="70" cy="60" fill="#FFFFFF" fillOpacity="0.6" r="4" />
      <circle cx="230" cy="240" fill="#FFFFFF" fillOpacity="0.6" r="4" />
    </svg>
  );
}
