/**
 * Cute animated avatar for Drake Lundstrom
 * — SVG-based, no external assets
 */
export default function DrakeAvatar({ size = 140 }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label="Drake Lundstrom avatar"
      style={{ display: 'block' }}
    >
      <defs>
        {/* gradient for background circle */}
        <linearGradient id="av-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        {/* subtle shadow filter */}
        <filter id="av-shadow" x="-4%" y="-4%" width="108%" height="108%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
        </filter>

        {/* glow for the sparkle */}
        <filter id="av-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <style>{`
        /* blink animation */
        @keyframes av-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.05); }
        }
        .av-eye {
          animation: av-blink 3.5s ease-in-out infinite;
          transform-origin: center;
        }
        .av-eye-r { animation-delay: 0.08s; }

        /* gentle float */
        @keyframes av-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .av-body { animation: av-float 4s ease-in-out infinite; }

        /* wave hand */
        @keyframes av-wave {
          0%, 70%, 100% { transform: rotate(0deg); }
          75% { transform: rotate(18deg); }
          80% { transform: rotate(-8deg); }
          85% { transform: rotate(14deg); }
          90% { transform: rotate(-4deg); }
          95% { transform: rotate(8deg); }
        }
        .av-hand { animation: av-wave 5s ease-in-out infinite; transform-origin: 148px 125px; }

        /* sparkle twinkle */
        @keyframes av-twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        .av-sparkle { animation: av-twinkle 2.5s ease-in-out infinite; transform-origin: center; }
        .av-sparkle-2 { animation-delay: 1.2s; }

        /* color pulse on headphones */
        @keyframes av-pulse {
          0%, 100% { fill: #8b5cf6; }
          50% { fill: #a78bfa; }
        }
        .av-headphones { animation: av-pulse 3s ease-in-out infinite; }
      `}</style>

      {/* background circle */}
      <circle cx="100" cy="100" r="96" fill="url(#av-bg)" />

      {/* floating body group */}
      <g className="av-body" filter="url(#av-shadow)">

        {/* neck */}
        <rect x="88" y="140" width="24" height="16" rx="4" fill="#f0c08a" />

        {/* hoodie / torso */}
        <path
          d="M60 152 C60 142, 80 134, 100 134 C120 134, 140 142, 140 152 L140 200 L60 200 Z"
          fill="#3b82f6"
        />
        {/* hoodie neckline */}
        <path
          d="M85 140 Q100 152, 115 140"
          stroke="#2563eb"
          strokeWidth="2"
          fill="none"
        />
        {/* hoodie string */}
        <line x1="95" y1="142" x2="93" y2="156" stroke="#e0e7ff" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="105" y1="142" x2="107" y2="156" stroke="#e0e7ff" strokeWidth="1.2" strokeLinecap="round" />
        {/* MS logo on hoodie (simplified) */}
        <g transform="translate(91, 158)">
          <rect x="0" y="0" width="7" height="7" rx="1" fill="#f25022" />
          <rect x="9" y="0" width="7" height="7" rx="1" fill="#7fba00" />
          <rect x="0" y="9" width="7" height="7" rx="1" fill="#00a4ef" />
          <rect x="9" y="9" width="7" height="7" rx="1" fill="#ffb900" />
        </g>

        {/* head */}
        <ellipse cx="100" cy="100" rx="42" ry="46" fill="#f0c08a" />

        {/* hair — short, friendly style */}
        <path
          d="M58 96 C56 68, 72 48, 100 46 C128 48, 144 68, 142 96
             C142 80, 130 58, 100 56 C70 58, 58 80, 58 96 Z"
          fill="#5c3a1e"
        />
        {/* hair top volume */}
        <ellipse cx="100" cy="56" rx="34" ry="14" fill="#5c3a1e" />

        {/* ears */}
        <ellipse cx="58" cy="104" rx="8" ry="10" fill="#e8b07a" />
        <ellipse cx="142" cy="104" rx="8" ry="10" fill="#e8b07a" />

        {/* headphones band */}
        <path
          d="M56 100 Q56 56, 100 50 Q144 56, 144 100"
          stroke="#7c3aed"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          className="av-headphones"
          style={{ fill: 'none' }}
        />
        {/* headphone cups */}
        <rect x="48" y="94" width="14" height="20" rx="5" className="av-headphones" />
        <rect x="138" y="94" width="14" height="20" rx="5" className="av-headphones" />

        {/* eyebrows */}
        <path d="M78 84 Q84 79, 92 82" stroke="#5c3a1e" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M108 82 Q116 79, 122 84" stroke="#5c3a1e" strokeWidth="2.2" fill="none" strokeLinecap="round" />

        {/* eyes */}
        <g className="av-eye">
          <ellipse cx="85" cy="96" rx="7" ry="7.5" fill="#fff" />
          <circle cx="86" cy="96" r="4.5" fill="#2d1b0e" />
          <circle cx="88" cy="94" r="1.8" fill="#fff" />
        </g>
        <g className="av-eye av-eye-r">
          <ellipse cx="115" cy="96" rx="7" ry="7.5" fill="#fff" />
          <circle cx="116" cy="96" r="4.5" fill="#2d1b0e" />
          <circle cx="118" cy="94" r="1.8" fill="#fff" />
        </g>

        {/* nose */}
        <path d="M98 104 Q100 108, 102 104" stroke="#d4976a" strokeWidth="1.8" fill="none" strokeLinecap="round" />

        {/* smile */}
        <path d="M86 114 Q100 126, 114 114" stroke="#c46a3a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        {/* teeth hint */}
        <path d="M92 116 Q100 122, 108 116" fill="#fff" opacity="0.85" />

        {/* cheek blush */}
        <circle cx="74" cy="112" r="7" fill="#f4a0a0" opacity="0.35" />
        <circle cx="126" cy="112" r="7" fill="#f4a0a0" opacity="0.35" />

        {/* beard stubble dots */}
        <g fill="#8b6b4a" opacity="0.18">
          <circle cx="82" cy="122" r="0.8" />
          <circle cx="88" cy="126" r="0.8" />
          <circle cx="94" cy="128" r="0.8" />
          <circle cx="100" cy="130" r="0.8" />
          <circle cx="106" cy="128" r="0.8" />
          <circle cx="112" cy="126" r="0.8" />
          <circle cx="118" cy="122" r="0.8" />
        </g>

        {/* waving hand */}
        <g className="av-hand">
          <circle cx="152" cy="125" r="10" fill="#f0c08a" />
          {/* fingers */}
          <rect x="148" y="112" width="4" height="10" rx="2" fill="#f0c08a" transform="rotate(-8 150 118)" />
          <rect x="153" y="110" width="4" height="11" rx="2" fill="#f0c08a" transform="rotate(2 155 116)" />
          <rect x="158" y="112" width="3.5" height="10" rx="2" fill="#f0c08a" transform="rotate(10 159.5 118)" />
          {/* thumb */}
          <rect x="143" y="120" width="4" height="8" rx="2" fill="#f0c08a" transform="rotate(-30 145 124)" />
          {/* wrist / arm connector */}
          <rect x="140" y="130" width="14" height="10" rx="4" fill="#3b82f6" />
        </g>
      </g>

      {/* sparkles */}
      <g className="av-sparkle" filter="url(#av-glow)">
        <path d="M38 38 L40 32 L42 38 L48 40 L42 42 L40 48 L38 42 L32 40 Z" fill="#fbbf24" />
      </g>
      <g className="av-sparkle av-sparkle-2" filter="url(#av-glow)">
        <path d="M160 28 L161.5 23 L163 28 L168 29.5 L163 31 L161.5 36 L160 31 L155 29.5 Z" fill="#fbbf24" />
      </g>
    </svg>
  )
}
