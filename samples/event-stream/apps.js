import { open } from './stream.js'
export { consumer }

  // A P P L I C A T I O N S

  const rand = mean => Math.floor(mean * (Math.random()+Math.random()))
  const show = (td, event) => td.innerHTML += `${event}<br>`
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  async function consumer(td, ms) {
    let next = open()
    while(true) {
      let event = await next()
      show(td, event)
      await sleep(rand(ms))
    }
  }
