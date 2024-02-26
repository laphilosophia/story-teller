import { StoryTeller } from './story-teller'

const response = await fetch('../story.json')
const json = await response.json()

const story = new StoryTeller({
  resource: json.resource,
  config: {
    readTime: 238,
    speechTime: 183,
    pages: 10,
  },
  language: 'en',
})

console.log(story)

console.log(story.stats())

console.log('----------')

story.startReading((result) => {
  console.log(result)
})
