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
      import { useEffect, useState } from 'react'

      export default function DrakeAvatar({ size = 220, className = '' }) {
        const [isBreathingFire, setIsBreathingFire] = useState(false)

        useEffect(() => {
          let fireTimer
          let cooldownTimer

          const queueNextFire = () => {
            const nextDelay = 2400 + Math.floor(Math.random() * 2600)
            cooldownTimer = setTimeout(() => {
              setIsBreathingFire(true)
              fireTimer = setTimeout(() => {
                setIsBreathingFire(false)
                queueNextFire()
              }, 900)
            }, nextDelay)
          }

          queueNextFire()

          return () => {
            clearTimeout(fireTimer)
            clearTimeout(cooldownTimer)
          }
        }, [])

        return (
          <svg
            viewBox="0 0 1200 320"
            width="100%"
            height={size}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Cute dragon mascot perched across the top, occasionally breathing a little fire"
            className={className}
            style={{ display: 'block', overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="dragon-main" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#95f3b1" />
                <stop offset="100%" stopColor="#33bf71" />
              </linearGradient>
              <linearGradient id="dragon-belly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ebffd3" />
                <stop offset="100%" stopColor="#c4ef9d" />
              </linearGradient>
              <linearGradient id="dragon-wing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8be7a9" />
                <stop offset="100%" stopColor="#2f9e5d" />
              </linearGradient>
              <linearGradient id="dragon-fire" x1="0" y1="0.5" x2="1" y2="0.5">
                <stop offset="0%" stopColor="#ffeab3" />
                <stop offset="45%" stopColor="#ffb54e" />
                <stop offset="100%" stopColor="#ff5e2f" />
              </linearGradient>
              <radialGradient id="dragon-fire-glow" cx="0.45" cy="0.5" r="0.8">
                <stop offset="0%" stopColor="#fff4cf" stopOpacity="1" />
                <stop offset="100%" stopColor="#ff9a2f" stopOpacity="0" />
              </radialGradient>
            </defs>

            <style>{`
              @keyframes drake-dragon-bob {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
              }

              @keyframes drake-dragon-tail {
                0%, 100% { transform: rotate(0deg); }
                30% { transform: rotate(8deg); }
                60% { transform: rotate(-6deg); }
              }

              @keyframes drake-dragon-blink {
                0%, 91%, 100% { transform: scaleY(1); }
                94% { transform: scaleY(0.08); }
              }

              @keyframes drake-dragon-fire {
                0% { transform: scaleX(0.75) scaleY(0.85); opacity: 0.1; }
                35% { transform: scaleX(1) scaleY(1); opacity: 1; }
                70% { transform: scaleX(1.15) scaleY(0.95); opacity: 0.9; }
                100% { transform: scaleX(0.8) scaleY(0.8); opacity: 0; }
              }

              .dragon-body-root {
                animation: drake-dragon-bob 3.2s ease-in-out infinite;
                transform-origin: 55% 58%;
              }

              .dragon-tail {
                animation: drake-dragon-tail 1.6s ease-in-out infinite;
                transform-origin: 250px 225px;
              }

              .dragon-eye {
                animation: drake-dragon-blink 3.6s ease-in-out infinite;
                transform-origin: center;
              }

              .dragon-fire {
                transform-origin: 1002px 132px;
                opacity: 0;
                transition: opacity 220ms ease;
              }

              .dragon-fire.active {
                opacity: 1;
                animation: drake-dragon-fire 0.9s ease-in-out;
              }
            `}</style>

            <g className="dragon-body-root">
              <path
                className="dragon-tail"
                d="M288 228 C205 228 165 192 162 150 C158 106 206 76 250 98 C283 114 287 142 268 154 C252 164 228 152 237 134 C245 119 268 120 281 136"
                fill="none"
                stroke="url(#dragon-main)"
                strokeWidth="42"
                strokeLinecap="round"
              />

              <ellipse cx="612" cy="194" rx="356" ry="92" fill="url(#dragon-main)" />
              <ellipse cx="630" cy="202" rx="214" ry="58" fill="url(#dragon-belly)" opacity="0.95" />

              <path d="M462 151 C520 108 580 101 626 132 C584 146 530 165 482 186 Z" fill="url(#dragon-wing)" />
              <path d="M650 144 C710 100 771 98 812 130 C767 149 709 168 664 188 Z" fill="url(#dragon-wing)" />

              <ellipse cx="936" cy="142" rx="95" ry="72" fill="url(#dragon-main)" />
              <ellipse cx="960" cy="154" rx="58" ry="44" fill="url(#dragon-belly)" />

              <path d="M896 88 L915 52 L933 95 Z" fill="#7de49d" />
              <path d="M957 78 L974 41 L994 83 Z" fill="#7de49d" />

              <ellipse cx="928" cy="131" rx="21" ry="18" fill="#fff" />
              <ellipse cx="968" cy="126" rx="20" ry="17" fill="#fff" />
              <g className="dragon-eye">
                <ellipse cx="930" cy="132" rx="8" ry="11" fill="#2f5a39" />
                <ellipse cx="969" cy="127" rx="8" ry="10" fill="#2f5a39" />
                <circle cx="933" cy="128" r="2.5" fill="#fff" />
                <circle cx="972" cy="123" r="2.2" fill="#fff" />
              </g>

              <circle cx="905" cy="148" r="7" fill="#a9f1bc" />
              <path d="M900 165 Q930 183 962 170" stroke="#2f7c49" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M936 170 L943 178 L950 169" fill="#ffffff" />

              <ellipse cx="565" cy="248" rx="38" ry="22" fill="#2d9b5b" />
              <ellipse cx="694" cy="250" rx="38" ry="22" fill="#2d9b5b" />
              <ellipse cx="835" cy="237" rx="36" ry="22" fill="#2d9b5b" />

              <path d="M802 114 L824 90 L846 114" fill="none" stroke="#7de49d" strokeWidth="10" strokeLinecap="round" />
              <path d="M760 110 L781 84 L803 111" fill="none" stroke="#7de49d" strokeWidth="10" strokeLinecap="round" />
            </g>

            <g className={`dragon-fire ${isBreathingFire ? 'active' : ''}`} aria-hidden="true">
              <ellipse cx="1038" cy="133" rx="56" ry="28" fill="url(#dragon-fire-glow)" />
              <path
                d="M995 133 C1034 111 1088 98 1132 112 C1170 124 1172 140 1130 150 C1088 161 1037 154 1000 140 C992 138 989 136 995 133 Z"
                fill="url(#dragon-fire)"
              />
              <path
                d="M1012 134 C1044 120 1080 117 1110 126 C1126 131 1124 138 1109 142 C1081 151 1045 149 1014 140"
                fill="#ffecc7"
                opacity="0.7"
              />
            </g>
          </svg>
        )
      }
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
