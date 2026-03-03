import type { DeckBuilderGame, TierDefinition } from '../interfaces'

export const TIERS: TierDefinition[] = [
  { id: 'S', label: 'S', color: '#ff7f7f', description: 'God Tier – the absolute best' },
  { id: 'A', label: 'A', color: '#ffbf7f', description: 'Excellent – top picks' },
  { id: 'B', label: 'B', color: '#ffdf7f', description: 'Great – very solid games' },
  { id: 'C', label: 'C', color: '#ffff7f', description: 'Good – enjoyable but flawed' },
  { id: 'D', label: 'D', color: '#bfff7f', description: 'Decent – situational fun' },
  { id: 'F', label: 'F', color: '#7fffff', description: 'Skip – not recommended' },
]

/* ── deck builder games database ───────────────────────────────── */

export const ALL_GAMES: DeckBuilderGame[] = [
  // S Tier
  { id: 1, name: 'Dominion', year: 2008, players: '2-4', defaultTier: 'S', img: '👑', desc: 'The OG that started it all. Endless replayability with 14+ expansions.' },
  { id: 2, name: 'Marvel Champions', year: 2019, players: '1-4', defaultTier: 'S', img: '🕷️', desc: 'Living Card Game meets deck building. Incredible hero customization.' },
  { id: 3, name: 'Aeon\'s End', year: 2016, players: '1-4', defaultTier: 'S', img: '🔮', desc: 'Cooperative breach mage combat. No shuffling mechanic is genius.' },
  // A Tier
  { id: 4, name: 'DC Deck-Building Game', year: 2012, players: '2-5', defaultTier: 'A', img: '🦇', desc: 'Fast, fun, and thematic. The Cerberus engine at its finest.' },
  { id: 5, name: 'Star Realms', year: 2014, players: '2', defaultTier: 'A', img: '🚀', desc: 'Compact, aggressive, and highly portable. Great 1v1 experience.' },
  { id: 6, name: 'Clank!', year: 2016, players: '2-4', defaultTier: 'A', img: '🐉', desc: 'Deck building + dungeon crawling. Push-your-luck dragon encounters.' },
  { id: 7, name: 'Legendary: A Marvel', year: 2012, players: '1-5', defaultTier: 'A', img: '🦸', desc: 'Semi-cooperative Marvel mayhem. Tons of expansions available.' },
  { id: 8, name: 'Dune: Imperium', year: 2020, players: '1-4', defaultTier: 'A', img: '🏜️', desc: 'Worker placement + deck building masterclass. Spice must flow.' },
  // B Tier
  { id: 9, name: 'Ascension', year: 2010, players: '1-4', defaultTier: 'B', img: '⚔️', desc: 'Digital-first design with great app. Fast center row gameplay.' },
  { id: 10, name: 'Thunderstone Quest', year: 2018, players: '2-4', defaultTier: 'B', img: '⚡', desc: 'Dungeon + village dual lanes. Deep RPG-style progression.' },
  { id: 11, name: 'Hogwarts Battle', year: 2016, players: '2-4', defaultTier: 'B', img: '🧙', desc: 'Perfect gateway co-op. Grows with you across 7 campaigns.' },
  { id: 12, name: 'Undaunted: Normandy', year: 2019, players: '2', defaultTier: 'B', img: '🎖️', desc: 'WWII deck building + tactical grid. Tense 2-player head-to-head.' },
  { id: 13, name: 'Mystic Vale', year: 2016, players: '2-4', defaultTier: 'B', img: '🌿', desc: 'Card crafting innovation — slide upgrades into clear sleeves.' },
  // C Tier
  { id: 14, name: 'Hero Realms', year: 2016, players: '2-4', defaultTier: 'C', img: '🗡️', desc: 'Fantasy-themed Star Realms. Boss/Campaign modes add depth.' },
  { id: 15, name: 'Trains', year: 2012, players: '2-4', defaultTier: 'C', img: '🚂', desc: 'Dominion on rails with a shared board. Unique waste mechanic.' },
  { id: 16, name: 'Paperback', year: 2014, players: '2-5', defaultTier: 'C', img: '📖', desc: 'Deck building meets word game. Scrabble fans rejoice.' },
  { id: 17, name: 'The Quest for El Dorado', year: 2017, players: '2-4', defaultTier: 'C', img: '🗺️', desc: 'Racing + deck building by Reiner Knizia. Streamlined excellence.' },
  // D Tier
  { id: 18, name: 'Tanto Cuore', year: 2009, players: '2-4', defaultTier: 'D', img: '🎀', desc: 'Anime maid theme Dominion clone. Niche audience but functional.' },
  { id: 19, name: 'Valley of the Kings', year: 2014, players: '2-4', defaultTier: 'D', img: '🏺', desc: 'Entombing mechanic is clever. Small box, big decisions.' },
  { id: 20, name: 'Vikings Gone Wild', year: 2016, players: '2-4', defaultTier: 'D', img: '🪓', desc: 'Base-building deck builder. Better as a mobile game.' },
  // F Tier
  { id: 21, name: 'Legendary: Encounters Alien', year: 2014, players: '1-5', defaultTier: 'F', img: '👽', desc: 'Great theme, rules are a nightmare. Fiddly and confusing.' },
  { id: 22, name: 'Xenoshyft', year: 2015, players: '1-4', defaultTier: 'F', img: '🐛', desc: 'Brutally hard co-op. More punishing than fun for most groups.' },
]
