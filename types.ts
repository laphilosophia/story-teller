export type Times = {
  readTime: string
  readTimeNumber: number
  speechTime: string
  speechTimeNumber: number
}

export type Language = {
  seconds: string
  minutes: string
  hours: string
}

export type Lang = {
  tr: Language
  en: Language
  de: Language
  fr: Language
  es: Language
}

export type Config = {
  readTime?: number
  speechTime?: number
  pages?: number
}

export type Constructors = {
  resource: string[]
  config: Config
  language?: string
}

export type BaseTimes = {
  read: number
  speech: number
}

export type StatsReturns = {
  stats: {
    words: number
    characters: string | number
  }
  times: {
    formatted: {
      speech: string
      read: string
    }
    raw: {
      read: number
      speech: number
    }
  }
}
