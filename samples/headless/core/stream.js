export {post, open, register}

  // E V E N T   S T R E A M

  let stream = []
  let handlers = []

  console.log('starting stream')

  const post = event => { stream.push(event); notify(event) }
  const notify = event => { handlers.map(cb => cb.call(stream, event)) }
  const register = handler => { handlers.push(handler) }

  function open() {
    let index = 0
    let waiting = null

    // Alert on new event available
    register(event => {
      if(waiting) {
        let ready = waiting
        waiting = null
        ready(event)
      }
    })

    // Promise next event when available
    let next = () => {
      if (index < stream.length) {
        return stream[index++]
      } else {
        return new Promise(resolve => {
          waiting = event => { index++; resolve(event) }
        })
      } 
    }

    return next
  }

