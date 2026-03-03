import 'react'

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

declare module 'react' {
  interface CSSProperties {
    [key: string]: string | number | undefined
  }
}
