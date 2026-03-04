export interface Studio {
  id: string
  name: string
  founded: number
  country: string
  website: string
  logo: string
  description: string
}

export interface Show {
  id: number
  title: string
  studioId: string
  year: number
  seasons: number
  status: 'Airing' | 'Completed' | 'Upcoming' | 'Cancelled'
  image: string
  description: string
  rating: number
  tags: string[]
  favorite: boolean
}

export type SortField = 'title' | 'year' | 'rating' | 'studio'
export type StatusFilter = 'All' | Show['status']
