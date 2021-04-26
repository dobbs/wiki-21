// Test runner for headless federated wiki
// Usage: deno run --allow-net --reload core/test.js

import { reload, click, lineup } from './line.js'
import * as Colors from 'https://deno.land/std/fmt/colors.ts'

let origin = 'small.fed.wiki'
let hash = 'first-functional-test'
let todo = []

await reload(origin, hash)
queue(lineup.slice(-1)[0].page)

panels()
panes(1)

while(todo.length) {
  let next = todo.shift()
  console.log(next)
  let m
  if (m = next.match(/^► see (\d+) panels?$/)) {
    confirm(lineup.length == m[1])
  } else if (m = next.match(/^► see (\w+) plugin?$/)) {
    confirm(true)
  } else if (m = next.match(/^► show lineup?$/)) {
    panels()
  } else if (m = next.match(/^► drop ([a-z-]+)@([a-zA-Z0-9\.]+)$/)) {
    confirm(false)
  } else {
    console.log(Colors.yellow("unknown"))
  }
}

function queue(page) {
  for (let item of page.story) {
    for (let line of item.text.split(/\n/)) {
      if (line.match(/^►/)) {
        todo.push(line)
      }
    }
  }
}

function confirm(boolean) {
  console.log(boolean ? Colors.green('succeeds') : Colors.red('fails'))
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