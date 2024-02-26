import type { Constructors, Times, Config, StatsReturns, BaseTimes } from './types'

export class StoryTeller {
  private times: Times
  private index: number
  private words: number
  private raw: string[]
  private language: string
  private resource: string
  private config: Config // Words per Minute => wpm

  constructor(params: Constructors) {
    const { resource, config, language } = params

    this.raw = resource
    this.resource = resource.join()
    this.config = Object.assign(
      {
        readTime: 238,
        speechTime: 183,
        pages: 10,
      },
      config
    )
    this.index = 0
    this.words = 0
    this.times = {
      readTime: '0',
      readTimeNumber: 0,
      speechTime: '0',
      speechTimeNumber: 0,
    }
    this.language = language || 'tr'

    this.stats = this.stats.bind(this)
    this.startReading = this.startReading.bind(this)
  }

  private languages = {
    tr: {
      seconds: 'saniye',
      minutes: 'dakika',
      hours: 'saat',
    },
    en: {
      and: 'and',
      seconds: 'seconds',
      minutes: 'minutes',
      hours: 'hours',
    },
    de: {
      and: 'und',
      seconds: 'sekunden',
      minutes: 'minuten',
      hours: 'stunden',
    },
    fr: {
      and: 'et',
      seconds: 'secondes',
      minutes: 'minutes',
      hours: 'heures',
    },
    es: {
      and: 'y',
      seconds: 'segundos',
      minutes: 'minutos',
      hours: 'horas',
    },
  }

  private clear(string: string): string {
    return string
      .replaceAll('.', '')
      .replaceAll(',', '')
      .replaceAll(':', '')
      .replaceAll(';', '')
      .replaceAll('"', '')
      .replaceAll("'", '')
  }

  private baseTimes(): BaseTimes {
    const { readTime, speechTime } = this.config

    this.words = this.clear(this.resource).split(' ').length

    const read = Math.round((this.words / (readTime as number)) * 60)
    const speech = Math.round((this.words / (speechTime as number)) * 60)

    return {
      read,
      speech,
    }
  }

  private getLang(key: string): string {
    // @ts-expect-error well, this shit is looking for the correct index type but we're just ignoring it for now.
    return this.languages[this.language][key]
  }

  private calculate(time: number, key: string): Times {
    const lang = (key: string) => this.getLang(key)

    if (time < 60) {
      // @ts-expect-error ignore index type error.
      this.times[key] = `${Math.round(time)} ${lang('seconds')}`
    } else if (time < 3600) {
      let m = `${Math.floor(time / 60)} ${lang('minutes')}`
      let s = `${Math.round(time - Math.floor(time / 60) * 60)} ${lang('seconds')}`

      // @ts-expect-error ignore index type error.
      this.times[key] = `${m} ${lang('and') ? `${lang('and')} ` : ''}${s}`
    } else {
      let h = `${Math.floor(time / 3600)} ${lang('hours')}`
      let m = `${Math.round((time / 3600 - Math.floor(time / 3600)) * 60)} ${lang('minutes')}`

      // @ts-expect-error ignore index type error.
      this.times[key] = `${h} ${lang('and') ? `${lang('and')} ` : ''}${m}`
    }

    // @ts-expect-error ignore index type error.
    return this.times[key]
  }

  private chunks(): string[][] {
    const { pages } = this.config

    const chunks: string[][] = []
    const size = Math.ceil(this.raw.length / (pages as number))

    for (let i = 0; i <= this.raw.length; i += size) {
      chunks.push(this.raw.slice(i, i + (pages as number) - 1))
    }

    return chunks.filter((chunk) => chunk.length)
  }

  private interval() {
    let numIntervals = 0
    let intervals: Record<number, any> = {}

    const now = Date.now

    const set = (func: Function, delay: number) => {
      let id = numIntervals++
      let planned = now() + delay

      // Normalize func as function
      switch (typeof func) {
        case 'function':
          break
        case 'string':
          const sFunc = func
          func = function () {
            eval(sFunc)
          }
          break
        default:
          func = function () {}
      }

      function tick() {
        func()

        if (intervals[id]) {
          planned += delay
          intervals[id] = setTimeout(tick, planned - now())
        }
      }

      intervals[id] = setTimeout(tick, delay)
      return id
    }

    const clear = function (id: number) {
      clearTimeout(intervals[id])
      delete intervals[id]
    }

    return {
      set,
      clear,
    }
  }

  public stats(): StatsReturns {
    const { read, speech } = this.baseTimes()

    this.calculate(read, 'readTime')
    this.calculate(speech, 'speechTime')

    this.times.readTimeNumber = Math.round(read * 1000)
    this.times.speechTimeNumber = Math.round(speech * 1000)

    return {
      stats: {
        words: this.words,
        characters: this.resource.length ? this.resource.length : '',
      },
      times: {
        formatted: {
          speech: this.times.speechTime,
          read: this.times.readTime,
        },
        raw: {
          read: this.times.readTimeNumber,
          speech: this.times.speechTimeNumber,
        },
      },
    }
  }

  public startReading(
    callback: (params: { story: string[]; page: number; readingTime: string }) => void
  ) {
    const { pages: p } = this.config
    const { readTimeNumber: rtn } = this.times

    const array = this.chunks()
    const { set, clear } = this.interval()

    callback({
      story: array[this.index],
      page: this.index + 1,
      readingTime: `${rtn / (p as number) / 1000} ${this.getLang('seconds')}`,
    })

    const interval = set(() => {
      this.index++

      if (this.index === array.length - 1) {
        clear(interval)
      }

      callback({
        story: array[this.index],
        page: this.index + 1,
        readingTime: `${rtn / (p as number) / 1000} ${this.getLang('seconds')}`,
      })
    }, rtn / (p as number))
  }
}
