// Test runner for headless federated wiki
// Usage: deno run --allow-net --allow-read --reload core/test.js slug@site
// Usage: deno run --allow-net https://dobbs.github.io/wiki-21/samples/headless/core/test.js  slug@site

let t0 = Date.now()
console.log('starting test')

import { lineup, types } from './line.js'
import { post, open, register } from './stream.js'
import * as Colors from 'https://deno.land/std/fmt/colors.ts'

let hash = Deno.args[0] || 'first-functional-test-suite@small.fed.wiki'
let origin = hash.split(/@/)[1] || 'small.fed.wiki'

let todo = []

let nextstream = open()
const waitfor = async want => { let event = await nextstream(); if(event.type != want) await waitfor(want)}

register(event => console.log(Object.assign({time:Date.now()-t0}, event)))
post({type:'reload', origin, hash})

await waitfor('reloaded')
todo.push(...pragmas(lineup.slice(-1)[0].page))
panels()
panes(1)

const asSlug = (title) => title.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase()


while(todo.length) {

  let m
  let doing = todo.shift()
  let next = doing.line
  const pragma = regex => { m = next.match(regex); return m }
  post({type:'progress',itemid:doing.item.id})
  console.log(next)
  let failed = false
  next = next.replace(/^► fail /, () => {failed = true; return '► '})


  function confirm(boolean, actual) {
    let report = boolean != failed ?
      Colors.green('succeeds') :
      Colors.red('fails')
    if (!boolean) report += ` with ${actual}`
    console.log(report)
  }


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

  else if (pragma(/^► show last panel/)) {
    panes(1)
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

  else if (pragma(/^► run selected tests$/)) {
    let item = doing.item
    let selected = item.text
      .split("\n")
      .filter(line => /^- \[x\]/.test(line))
      .map(line => {let m = line.match(/\[\[(.+?)\]\]/); return m[1]})
    let moredo = selected.map(title => ({line: `► run [[${title}]]`, item}))
    todo.splice(0,0,...moredo)
  }

  else if (pragma(/^► run \[\[(.+?)\]\]$/)) {
    let title = m[1]
    console.log(Colors.blue(`\n🀫 ${title}\n`))
    let site = origin
    let slug = asSlug(title)
    let pid = lineup.slice(-1)[0].pid
    post({type:'reference', site, slug, pid})
    await waitfor('referenced')
    todo.splice(0,0,...pragmas(lineup.slice(-1)[0].page))
  }

  else if (pragma(/^► click (.+?)$/)) {
    let title = m[1]
    let panel = lineup
      .filter(panel => panel.panes
        .filter(pane => !(/^►/.test(pane.item.text)))
        .map(pane => pane.links)
        .flat().includes(title))
      .slice(-1)[0]
    if (!panel) { console.log(Colors.yellow("absent")); continue }
    let pid = panel.pid
    post({type:'click', title, pid})
    await waitfor('clicked')
    let page = lineup.slice(-1)[0].page
    confirm(!page.err, page.err)
  }

  else {
    console.log(Colors.yellow("unknown"))
  }
}

function pragmas(page) {
  let found = []
  for (let item of page.story) {
    for (let line of (item.text||'').split(/\n/)) {
      if (line.match(/^►/)) {
        found.push({line, item})
      }
    }
  }
  return found
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
