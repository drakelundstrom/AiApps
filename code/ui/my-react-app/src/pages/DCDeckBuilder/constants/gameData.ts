import type { CardDefinition, CardType, PlayerState } from '../interfaces'

export const CARD_TYPES: CardType[] = ['Hero', 'Villain', 'Super Power', 'Equipment', 'Location', 'Starter']
export const TYPE_EMOJI: Record<CardType, string> = {
  Hero: '🦸', Villain: '🦹', 'Super Power': '⚡',
  Equipment: '🛡️', Location: '🏙️', Starter: '🃏',
}

export const PRESET_CARDS: CardDefinition[] = [
  // Heroes
  { name: 'Superman', type: 'Hero', vp: 7 },
  { name: 'Batman', type: 'Hero', vp: 5 },
  { name: 'Wonder Woman', type: 'Hero', vp: 6 },
  { name: 'Aquaman', type: 'Hero', vp: 4 },
  { name: 'The Flash', type: 'Hero', vp: 4 },
  { name: 'Green Lantern', type: 'Hero', vp: 5 },
  { name: 'Cyborg', type: 'Hero', vp: 3 },
  { name: 'Martian Manhunter', type: 'Hero', vp: 5 },
  { name: 'Hawkgirl', type: 'Hero', vp: 3 },
  { name: 'Zatanna', type: 'Hero', vp: 4 },
  { name: 'Green Arrow', type: 'Hero', vp: 3 },
  { name: 'Batgirl', type: 'Hero', vp: 3 },
  { name: 'Shazam!', type: 'Hero', vp: 6 },
  { name: 'Swamp Thing', type: 'Hero', vp: 5 },
  { name: 'Starfire', type: 'Hero', vp: 3 },
  // Villains
  { name: 'Lex Luthor', type: 'Villain', vp: 6 },
  { name: 'The Joker', type: 'Villain', vp: 5 },
  { name: 'Darkseid', type: 'Villain', vp: 8 },
  { name: 'Deathstroke', type: 'Villain', vp: 4 },
  { name: 'Sinestro', type: 'Villain', vp: 5 },
  { name: 'Brainiac', type: 'Villain', vp: 6 },
  { name: 'Black Manta', type: 'Villain', vp: 4 },
  { name: 'Harley Quinn', type: 'Villain', vp: 3 },
  { name: 'Poison Ivy', type: 'Villain', vp: 3 },
  { name: 'Bane', type: 'Villain', vp: 4 },
  { name: 'Circe', type: 'Villain', vp: 5 },
  { name: 'Scarecrow', type: 'Villain', vp: 3 },
  // Super Powers
  { name: 'Heat Vision', type: 'Super Power', vp: 3 },
  { name: 'Super Strength', type: 'Super Power', vp: 3 },
  { name: 'Super Speed', type: 'Super Power', vp: 2 },
  { name: 'X-Ray Vision', type: 'Super Power', vp: 2 },
  { name: 'Telepathy', type: 'Super Power', vp: 2 },
  { name: 'Power Ring', type: 'Super Power', vp: 3 },
  { name: 'Lasso of Truth', type: 'Super Power', vp: 3 },
  { name: 'Trident Strike', type: 'Super Power', vp: 2 },
  { name: 'Freeze Breath', type: 'Super Power', vp: 2 },
  // Equipment
  { name: 'Batmobile', type: 'Equipment', vp: 3 },
  { name: 'Utility Belt', type: 'Equipment', vp: 2 },
  { name: 'Bat-Signal', type: 'Equipment', vp: 2 },
  { name: 'Power Suit', type: 'Equipment', vp: 3 },
  { name: 'Kryptonite Shard', type: 'Equipment', vp: 2 },
  { name: 'Nth Metal', type: 'Equipment', vp: 3 },
  { name: 'Mother Box', type: 'Equipment', vp: 4 },
  // Locations
  { name: 'Batcave', type: 'Location', vp: 3 },
  { name: 'Fortress of Solitude', type: 'Location', vp: 4 },
  { name: 'Themyscira', type: 'Location', vp: 3 },
  { name: 'Atlantis', type: 'Location', vp: 3 },
  { name: 'Arkham Asylum', type: 'Location', vp: 2 },
  { name: 'Watchtower', type: 'Location', vp: 4 },
  { name: 'Hall of Justice', type: 'Location', vp: 3 },
  // Starters (worth 0 usually)
  { name: 'Punch', type: 'Starter', vp: 0 },
  { name: 'Vulnerability', type: 'Starter', vp: 0 },
  { name: 'Kick', type: 'Starter', vp: 1 },
]

/* ── helpers ────────────────────────────────────────────────────── */

export const PLAYER_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899',
]

export function initialPlayer(id: number, idx: number): PlayerState {
  return {
    id,
    name: `Player ${idx + 1}`,
    colorIdx: idx % PLAYER_COLORS.length,
    cards: [],
    bonusVP: 0,
  }
}

export function playerVP(player: PlayerState): number {
  return player.cards.reduce((sum, card) => sum + card.vp * card.qty, 0) + player.bonusVP
}
