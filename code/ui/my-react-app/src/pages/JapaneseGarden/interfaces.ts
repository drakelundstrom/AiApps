export type Vector3Tuple = [number, number, number]

export interface SakuraPetalsProps {
  count?: number
}

export interface SakuraPetalParticle {
  x: number
  y: number
  z: number
  speedY: number
  drift: number
  spin: number
  spinSpeed: number
  wobble: number
  wobbleSpeed: number
  scale: number
}

export interface PositionedProps {
  position?: Vector3Tuple
}

export interface PositionedScaledProps extends PositionedProps {
  scale?: number
}

export interface GardenSceneProps {
  showPetals: boolean
}
