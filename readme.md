# story teller

> simple reader / teller module for story applications

```ts
const response = await fetch('your-api-address')
const json = await response.json()

const story = new StoryTeller({
  resource: json.data,
  config: {
    readTime: 238,
    speechTime: 183,
    pages: 10,
  },
  language: 'en',
})

const stats = story.stats()
console.log(stats)
/*
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
*/

story.startReading((result) => {
  console.log(result)
})
/*
{
  story: string[],
  page: number,
  readingTime: 'n minutes and n seconds',
}
*/
```
