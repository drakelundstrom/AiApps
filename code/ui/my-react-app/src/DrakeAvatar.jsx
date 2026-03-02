import { useEffect, useState } from 'react'

export default function DrakeAvatar({ size = 140 }) {
  const [dragonMode, setDragonMode] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setDragonMode((prev) => !prev)
    }, 3200)

    return () => clearInterval(timer)
  }, [])

  return (
    <svg
      viewBox="0 0 220 220"
      width={size}
      height={size}
      role="img"
      aria-label="Animated avatar of Drake that alternates between a person and a cute little dragon"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="av-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8ad7ff" />
          <stop offset="100%" stopColor="#4f9dff" />
        </linearGradient>
        <linearGradient id="av-hair" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d68945" />
          <stop offset="100%" stopColor="#9a5528" />
        </linearGradient>
        <linearGradient id="av-shirt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#77dbff" />
          <stop offset="100%" stopColor="#43b9e8" />
        </linearGradient>
        <linearGradient id="av-dragon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8df19f" />
          <stop offset="100%" stopColor="#49c57b" />
        </linearGradient>
      </defs>

      <style>{`
        @keyframes av-bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }

        @keyframes av-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.08); }
        }

        @keyframes av-wiggle {
          0%, 100% { transform: rotate(0deg); }
          35% { transform: rotate(6deg); }
          65% { transform: rotate(-6deg); }
        }

        .av-root {
          animation: av-bob 3.4s ease-in-out infinite;
          transform-origin: 50% 55%;
        }

        .av-eye {
          animation: av-blink 3.2s ease-in-out infinite;
          transform-origin: center;
        }

        .av-tail {
          animation: av-wiggle 1.1s ease-in-out infinite;
          transform-origin: 132px 162px;
        }

        .av-person,
        .av-dragon {
          transition: opacity 420ms ease, transform 420ms ease;
          transform-box: fill-box;
          transform-origin: center;
        }

        .av-person.hidden,
        .av-dragon.hidden {
          opacity: 0;
          transform: scale(0.92);
        }

        .av-person.visible,
        .av-dragon.visible {
          opacity: 1;
          transform: scale(1);
        }
      `}</style>

      <rect x="4" y="4" width="212" height="212" rx="56" fill="url(#av-sky)" />

      <g opacity="0.9">
        <ellipse cx="50" cy="58" rx="18" ry="8" fill="#ffffff" />
        <ellipse cx="168" cy="62" rx="22" ry="9" fill="#ffffff" />
      </g>

      <rect x="0" y="145" width="220" height="75" fill="#6fc04d" />
      <circle cx="40" cy="160" r="14" fill="#4a9f38" />
      <circle cx="182" cy="162" r="16" fill="#4a9f38" />

      <g className="av-root">
        <g className={`av-person ${dragonMode ? 'hidden' : 'visible'}`}>
          <ellipse cx="110" cy="165" rx="58" ry="32" fill="url(#av-shirt)" />
          <rect x="88" y="143" width="44" height="24" rx="12" fill="#f2c59a" />

          <ellipse cx="110" cy="102" rx="49" ry="52" fill="#f2c59a" />
          <path
            d="M61 96 C63 58, 83 40, 110 40 C139 41, 158 60, 160 95
               C150 74, 136 66, 110 64 C84 66, 70 74, 61 96 Z"
            fill="url(#av-hair)"
          />

          <ellipse cx="69" cy="108" rx="9" ry="13" fill="#edb98b" />
          <ellipse cx="151" cy="108" rx="9" ry="13" fill="#edb98b" />

          <g className="av-eye">
            <path d="M86 108 Q95 100, 104 108" stroke="#2b1f16" strokeWidth="5" fill="none" strokeLinecap="round" />
          </g>
          <g className="av-eye">
            <path d="M116 108 Q125 100, 134 108" stroke="#2b1f16" strokeWidth="5" fill="none" strokeLinecap="round" />
          </g>

          <circle cx="82" cy="122" r="8" fill="#ff9f97" opacity="0.7" />
          <circle cx="138" cy="122" r="8" fill="#ff9f97" opacity="0.7" />

          <path d="M85 133 Q110 153, 135 133" fill="#6b2f1d" />
          <path d="M91 135 Q110 149, 129 135" fill="#ffffff" />

          <rect x="99" y="156" width="22" height="22" rx="5" fill="#eb3349" />
          <text x="110" y="171" textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="700">AI</text>
        </g>

        <g className={`av-dragon ${dragonMode ? 'visible' : 'hidden'}`}>
          <ellipse cx="110" cy="168" rx="48" ry="26" fill="url(#av-dragon)" />
          <ellipse cx="110" cy="110" rx="43" ry="44" fill="url(#av-dragon)" />

          <path d="M78 85 L92 70 L96 92 Z" fill="#6ee198" />
          <path d="M142 85 L128 70 L124 92 Z" fill="#6ee198" />

          <ellipse cx="95" cy="108" rx="14" ry="16" fill="#ffffff" />
          <ellipse cx="125" cy="108" rx="14" ry="16" fill="#ffffff" />
          <g className="av-eye">
            <ellipse cx="96" cy="110" rx="7" ry="9" fill="#23543b" />
            <ellipse cx="124" cy="110" rx="7" ry="9" fill="#23543b" />
            <circle cx="98" cy="107" r="2" fill="#ffffff" />
            <circle cx="126" cy="107" r="2" fill="#ffffff" />
          </g>

          <circle cx="84" cy="122" r="7" fill="#9ef2b6" />
          <circle cx="136" cy="122" r="7" fill="#9ef2b6" />

          <path d="M93 132 Q110 145, 127 132" stroke="#1f5f3f" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M100 137 L104 143 L108 137" fill="#ffffff" />
          <path d="M112 137 L116 143 L120 137" fill="#ffffff" />

          <path className="av-tail" d="M144 160 C168 150, 183 166, 170 184 C162 195, 146 188, 152 176" fill="none" stroke="#49c57b" strokeWidth="14" strokeLinecap="round" />

          <path d="M88 164 C95 154, 103 154, 110 164" stroke="#6ee198" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M110 164 C117 154, 125 154, 132 164" stroke="#6ee198" strokeWidth="6" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  )
}
