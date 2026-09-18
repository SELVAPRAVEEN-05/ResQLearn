interface KnowledgeGraphIllustrationProps {
  /** Swaps the icon at the graph's central node to suit the page's intent. */
  variant?: "shield" | "cap";
}

/**
 * Signature visual for the auth pages: a small knowledge graph whose nodes
 * are disaster-preparedness concepts (alert, shelter, response, supplies)
 * radiating from a central "explainable AI" hub.
 */
export default function KnowledgeGraphIllustration({
  variant = "shield",
}: KnowledgeGraphIllustrationProps) {
  const nodes = [
    { x: 90, y: 70, label: "Flood risk" },
    { x: 330, y: 60, label: "Evacuation" },
    { x: 380, y: 210, label: "First aid" },
    { x: 300, y: 340, label: "Shelter" },
    { x: 110, y: 350, label: "Supplies" },
    { x: 40, y: 210, label: "Response" },
  ];
  const center = { x: 210, y: 210 };

  return (
    <svg
      aria-label="Illustration of an AI knowledge graph connecting disaster preparedness concepts"
      className="h-full w-full max-w-[420px]"
      role="img"
      viewBox="0 0 420 420"
    >
      <defs>
        <radialGradient cx="50%" cy="50%" id="glow" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={center.x} cy={center.y} fill="url(#glow)" r="190" />

      {nodes.map((node, i) => (
        <line
          key={`spoke-${i}`}
          stroke="#10B981"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          x1={center.x}
          x2={node.x}
          y1={center.y}
          y2={node.y}
        />
      ))}
      <line
        stroke="#10B981"
        strokeOpacity="0.18"
        strokeWidth="1.25"
        x1={nodes[0].x}
        x2={nodes[1].x}
        y1={nodes[0].y}
        y2={nodes[1].y}
      />
      <line
        stroke="#10B981"
        strokeOpacity="0.18"
        strokeWidth="1.25"
        x1={nodes[2].x}
        x2={nodes[3].x}
        y1={nodes[2].y}
        y2={nodes[3].y}
      />
      <line
        stroke="#10B981"
        strokeOpacity="0.18"
        strokeWidth="1.25"
        x1={nodes[4].x}
        x2={nodes[5].x}
        y1={nodes[4].y}
        y2={nodes[5].y}
      />

      {nodes.map((node, i) => (
        <g key={`node-${i}`}>
          <circle
            cx={node.x}
            cy={node.y}
            fill="#FFFFFF"
            r="7"
            stroke="#10B981"
            strokeWidth="2"
          >
            <animate
              attributeName="r"
              begin={`${i * 0.4}s`}
              dur="3s"
              repeatCount="indefinite"
              values="7;8.5;7"
            />
          </circle>
          <text
            className="fill-[#065F46] font-sans"
            fontSize="11"
            fontWeight="500"
            textAnchor="middle"
            x={node.x}
            y={
              node.x === center.x
                ? node.y
                : node.y + (node.y < center.y ? -16 : 24)
            }
          >
            {node.label}
          </text>
        </g>
      ))}

      <circle
        cx={center.x}
        cy={center.y}
        fill="#FFFFFF"
        r="34"
        stroke="#10B981"
        strokeWidth="2.5"
      />
      <circle
        cx={center.x}
        cy={center.y}
        fill="#10B981"
        fillOpacity="0.08"
        r="34"
      />
      {variant === "shield" ? (
        <path
          d="M210 190c-9 0-17-3-23-8v20c0 15 10 26 23 30 13-4 23-15 23-30v-20c-6 5-14 8-23 8Z"
          fill="none"
          stroke="#10B981"
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
      ) : (
        <path
          d="M186 200l24-11 24 11-24 11-24-11Zm6 15v14l18 8 18-8v-14"
          fill="none"
          stroke="#10B981"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.25"
        />
      )}
    </svg>
  );
}
