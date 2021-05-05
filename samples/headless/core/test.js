// Test runner for headless federated wiki
// Usage: deno run --allow-net --allow-read --reload core/test.js slug@site
// Usage: deno run --allow-net https://dobbs.github.io/wiki-21/samples/headless/core/test.js  slug@site

let t0 = Date.now()
console.log('starting test')

import { lineup, types } from './line.js'
import { post, open, register } from './stream.js'
import * as Colors from 'https://deno.land/std/fmt/colors.ts'

let hash = Deno.args[0] || 'first-functional-test@small.fed.wiki'
let origin = hash.split(/@/)[1] || 'small.fed.wiki'

let todo = []

let nextstream = open()
const waitfor = async want => { let event = await nextstream(); if(event.type != want) await waitfor(want)}

register(event => console.log({time:Date.now()-t0, event}))
post({type:'reload', origin, hash})

await waitfor('reloaded')
queue(lineup.slice(-1)[0].page)

panels()
panes(1)


while(todo.length) {


  let m, next = todo.shift()
  const pragma = regex => { m = next.match(regex); return m }
  console.log(next)

  if (pragma(/^► see (\d+) panels?$/)) {
    confirm(lineup.length == m[1], lineup.length)
  }

  else if (pragma(/^► see (\w+) plugin$/)) {
    let plugin = types[m[1]]
    confirm(plugin && !plugin.err, plugin && plugin.err)
  }

  else if (pragma(/^► show lineup$/)) {
    panels()
  }

  else if (pragma(/^► drop ([a-z-]+)@([a-zA-Z0-9\.]+)$/)) {
    let slug = m[1]
    let site = m[2]
    let pid = lineup.slice(-1)[0].pid
    post({type:'reference', site, slug, pid})
    await waitfor('referenced')
    let page = lineup.slice(-1)[0].page
    if (!page.err) {
      panes(1)
      confirm(true)    
    } else {
      confirm(false, page.err)
    }
  }

  else {
    console.log(Colors.yellow("unknown"))
  }
}

function queue(page) {
  for (let item of page.story) {
    for (let line of (item.text||'').split(/\n/)) {
      if (line.match(/^►/)) {
        todo.push(line)
      }
    }
  }
}

function confirm(boolean, actual) {
  console.log(boolean ?
    Colors.green('succeeds') :
    Colors.red('fails') + ` with ${actual}`)
}


function panels() {
  console.table(lineup.map(panel=>({pid:panel.pid, dt:panel.dt, site:panel.site, slug:panel.slug, where:panel.where})))
}

function panes(n) {
  for (let panel of lineup.slice(-n)) {
    console.log(panel.page.title)
    console.table(panel.panes.map(pane=>({
      id:pane.id,
      dt:pane.dt,
      type:pane.type,
      look:(pane.look||'').replace(/<.*?>/g,'').slice(0,40),
      links:pane.links})))
  }
}
