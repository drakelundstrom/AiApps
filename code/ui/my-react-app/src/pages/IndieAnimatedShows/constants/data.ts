import type { Studio, Show } from '../interfaces'

export const STUDIOS: Studio[] = [
  {
    id: 'cartoon-saloon',
    name: 'Cartoon Saloon',
    founded: 1999,
    country: 'Ireland',
    website: 'https://www.cartoonsaloon.ie',
    logo: '☘️',
    description:
      'Irish animation studio behind Oscar-nominated films like The Secret of Kells, Song of the Sea, and Wolfwalkers. Known for hand-drawn art with Celtic-inspired storytelling.',
  },
  {
    id: 'laika',
    name: 'LAIKA',
    founded: 2005,
    country: 'USA',
    website: 'https://www.laika.com',
    logo: '🎭',
    description:
      'Portland-based stop-motion studio famous for Coraline, Kubo and the Two Strings, and Missing Link. Pushes the boundaries of stop-motion technology.',
  },
  {
    id: 'studio-mir',
    name: 'Studio Mir',
    founded: 2010,
    country: 'South Korea',
    website: 'https://studiomir.co.kr',
    logo: '🌙',
    description:
      'South Korean animation studio known for animating The Legend of Korra, Voltron: Legendary Defender, and DOTA: Dragon\'s Blood. Renowned for fluid action sequences.',
  },
  {
    id: 'gkids',
    name: 'GKIDS',
    founded: 2008,
    country: 'USA',
    website: 'https://gkids.com',
    logo: '🎬',
    description:
      'American distributor and producer specializing in indie animated features. Handles North American releases for Studio Ghibli and many international animated films.',
  },
  {
    id: 'tonko-house',
    name: 'Tonko House',
    founded: 2014,
    country: 'USA',
    website: 'https://www.tonkohouse.com',
    logo: '🏠',
    description:
      'Founded by ex-Pixar artists Dice Tsutsumi and Robert Kondo. Created the Oscar-nominated short The Dam Keeper and its series adaptation.',
  },
  {
    id: 'powerhouse',
    name: 'Powerhouse Animation',
    founded: 2001,
    country: 'USA',
    website: 'https://www.powerhouseanimation.com',
    logo: '⚡',
    description:
      'Austin-based studio behind the acclaimed Castlevania series on Netflix, Blood of Zeus, and Tomb Raider: The Legend of Lara Croft.',
  },
  {
    id: 'titmouse',
    name: 'Titmouse, Inc.',
    founded: 2000,
    country: 'USA',
    website: 'https://titmouse.net',
    logo: '🐦',
    description:
      'Emmy-winning independent studio behind Metalocalypse, Venture Bros., Big Mouth, and Star Trek: Lower Decks. Known for vibrant, creator-driven projects.',
  },
  {
    id: 'science-saru',
    name: 'Science SARU',
    founded: 2013,
    country: 'Japan',
    website: 'https://www.sciencesaru.com',
    logo: '🐒',
    description:
      'Founded by Masaaki Yuasa. Known for Devilman Crybaby, Keep Your Hands Off Eizouken!, and Scott Pilgrim Takes Off. Distinctive fluid animation style.',
  },
  {
    id: 'cartoon-network-studios',
    name: 'Cartoon Network Studios',
    founded: 1994,
    country: 'USA',
    website: 'https://www.cartoonnetworkstudios.com',
    logo: '📺',
    description:
      'Home to indie-spirited creator-driven shows like Adventure Time, Steven Universe, and Over the Garden Wall despite being part of a major network.',
  },
  {
    id: 'fortiche',
    name: 'Fortiche Production',
    founded: 2009,
    country: 'France',
    website: 'https://www.forticheprod.com',
    logo: '🇫🇷',
    description:
      'French animation studio best known for Arcane (League of Legends). Blends 2D and 3D techniques for a unique painterly visual style.',
  },
]

export const INITIAL_SHOWS: Show[] = [
  // Cartoon Saloon
  {
    id: 1,
    title: 'Wolfwalkers',
    studioId: 'cartoon-saloon',
    year: 2020,
    seasons: 1,
    status: 'Completed',
    image: '🐺',
    description:
      'A young apprentice hunter befriends a free-spirited girl who transforms into a wolf at night. Visually stunning Irish folklore.',
    rating: 9.0,
    tags: ['Fantasy', 'Adventure', 'Irish Folklore'],
    favorite: false,
  },
  {
    id: 2,
    title: 'Song of the Sea',
    studioId: 'cartoon-saloon',
    year: 2014,
    seasons: 1,
    status: 'Completed',
    image: '🌊',
    description:
      'A boy and his mute sister journey to free faerie creatures in this hand-drawn masterpiece based on Celtic mythology.',
    rating: 8.8,
    tags: ['Fantasy', 'Family', 'Celtic'],
    favorite: false,
  },
  // LAIKA
  {
    id: 3,
    title: 'Kubo and the Two Strings',
    studioId: 'laika',
    year: 2016,
    seasons: 1,
    status: 'Completed',
    image: '🎸',
    description:
      'A young boy with a magical shamisen embarks on a quest to find his father\'s legendary armor. Stop-motion at its finest.',
    rating: 9.1,
    tags: ['Fantasy', 'Adventure', 'Stop-Motion'],
    favorite: false,
  },
  {
    id: 4,
    title: 'Coraline',
    studioId: 'laika',
    year: 2009,
    seasons: 1,
    status: 'Completed',
    image: '🔘',
    description:
      'A girl discovers a parallel world behind a secret door that seems perfect but hides dark secrets. Neil Gaiman adaptation.',
    rating: 9.2,
    tags: ['Horror', 'Fantasy', 'Stop-Motion'],
    favorite: false,
  },
  // Studio Mir
  {
    id: 5,
    title: 'The Legend of Korra',
    studioId: 'studio-mir',
    year: 2012,
    seasons: 4,
    status: 'Completed',
    image: '💧',
    description:
      'The Avatar after Aang navigates a rapidly modernizing world while mastering the elements and facing new threats.',
    rating: 8.5,
    tags: ['Action', 'Fantasy', 'Martial Arts'],
    favorite: false,
  },
  {
    id: 6,
    title: 'DOTA: Dragon\'s Blood',
    studioId: 'studio-mir',
    year: 2021,
    seasons: 3,
    status: 'Completed',
    image: '🐉',
    description:
      'A Dragon Knight hunts the demon terrorizing his land and encounters ancient powers beyond imagination.',
    rating: 7.5,
    tags: ['Fantasy', 'Action', 'Gaming'],
    favorite: false,
  },
  // Tonko House
  {
    id: 7,
    title: 'The Dam Keeper',
    studioId: 'tonko-house',
    year: 2014,
    seasons: 1,
    status: 'Completed',
    image: '🐷',
    description:
      'A pig maintains a dam that protects his town from darkness while navigating friendship at school. Oscar-nominated short.',
    rating: 8.3,
    tags: ['Short Film', 'Drama', 'Indie'],
    favorite: false,
  },
  // Powerhouse Animation
  {
    id: 8,
    title: 'Castlevania',
    studioId: 'powerhouse',
    year: 2017,
    seasons: 4,
    status: 'Completed',
    image: '🧛',
    description:
      'Trevor Belmont, last survivor of his house, fights to save Eastern Europe from Dracula\'s army. Dark, violent, and brilliant.',
    rating: 9.0,
    tags: ['Action', 'Horror', 'Gaming'],
    favorite: false,
  },
  {
    id: 9,
    title: 'Blood of Zeus',
    studioId: 'powerhouse',
    year: 2020,
    seasons: 2,
    status: 'Completed',
    image: '⚡',
    description:
      'A commoner living on the outskirts of ancient Greece discovers he is the son of Zeus and must save heaven and earth.',
    rating: 7.8,
    tags: ['Action', 'Mythology', 'Fantasy'],
    favorite: false,
  },
  // Titmouse
  {
    id: 10,
    title: 'The Venture Bros.',
    studioId: 'titmouse',
    year: 2003,
    seasons: 7,
    status: 'Completed',
    image: '🧪',
    description:
      'A comedic parody following the Venture family through absurd super-science adventures. Cult classic with deep lore.',
    rating: 8.7,
    tags: ['Comedy', 'Sci-Fi', 'Parody'],
    favorite: false,
  },
  {
    id: 11,
    title: 'Star Trek: Lower Decks',
    studioId: 'titmouse',
    year: 2020,
    seasons: 4,
    status: 'Completed',
    image: '🖖',
    description:
      'Follows the support crew on one of Starfleet\'s least important ships. Lovingly satirizes Trek while telling great stories.',
    rating: 8.2,
    tags: ['Comedy', 'Sci-Fi', 'Trek'],
    favorite: false,
  },
  // Science SARU
  {
    id: 12,
    title: 'Devilman Crybaby',
    studioId: 'science-saru',
    year: 2018,
    seasons: 1,
    status: 'Completed',
    image: '😈',
    description:
      'Akira Fudo merges with a demon to protect humanity in this visceral, psychedelic reimagining of Go Nagai\'s classic.',
    rating: 8.4,
    tags: ['Horror', 'Action', 'Supernatural'],
    favorite: false,
  },
  {
    id: 13,
    title: 'Keep Your Hands Off Eizouken!',
    studioId: 'science-saru',
    year: 2020,
    seasons: 1,
    status: 'Completed',
    image: '🎨',
    description:
      'Three high school girls start an animation club and pour their souls into creating their dream anime. A love letter to animation.',
    rating: 8.9,
    tags: ['Comedy', 'Slice of Life', 'Meta'],
    favorite: false,
  },
  {
    id: 14,
    title: 'Scott Pilgrim Takes Off',
    studioId: 'science-saru',
    year: 2023,
    seasons: 1,
    status: 'Completed',
    image: '🎮',
    description:
      'A fresh anime adaptation of the beloved graphic novels that subverts expectations from the very first episode.',
    rating: 8.1,
    tags: ['Comedy', 'Action', 'Romance'],
    favorite: false,
  },
  // Cartoon Network Studios (indie-spirited)
  {
    id: 15,
    title: 'Over the Garden Wall',
    studioId: 'cartoon-network-studios',
    year: 2014,
    seasons: 1,
    status: 'Completed',
    image: '🍂',
    description:
      'Two brothers wander through a mysterious forest called the Unknown in this atmospheric mini-series masterpiece.',
    rating: 9.3,
    tags: ['Fantasy', 'Horror', 'Musical'],
    favorite: false,
  },
  {
    id: 16,
    title: 'Infinity Train',
    studioId: 'cartoon-network-studios',
    year: 2019,
    seasons: 4,
    status: 'Completed',
    image: '🚂',
    description:
      'Passengers on a seemingly infinite train must confront their personal issues to find their way home. Deep and emotional.',
    rating: 8.8,
    tags: ['Sci-Fi', 'Drama', 'Anthology'],
    favorite: false,
  },
  // Fortiche
  {
    id: 17,
    title: 'Arcane',
    studioId: 'fortiche',
    year: 2021,
    seasons: 2,
    status: 'Completed',
    image: '💜',
    description:
      'Set in the League of Legends universe, two sisters clash on opposite sides of a war between utopian Piltover and oppressed Zaun.',
    rating: 9.4,
    tags: ['Action', 'Drama', 'Gaming'],
    favorite: false,
  },
  // GKIDS distributed
  {
    id: 18,
    title: 'The Boy and the Heron',
    studioId: 'gkids',
    year: 2023,
    seasons: 1,
    status: 'Completed',
    image: '🪽',
    description:
      'Hayao Miyazaki\'s epic fantasy about a boy who ventures into a tower inhabited by a mysterious heron. Distributed by GKIDS.',
    rating: 8.6,
    tags: ['Fantasy', 'Drama', 'Ghibli'],
    favorite: false,
  },
]

export const ALL_TAGS: string[] = Array.from(
  new Set(INITIAL_SHOWS.flatMap((s) => s.tags))
).sort()
