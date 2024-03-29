// import {start} from "./test.js"
// start(slug@site)

let t0 = Date.now()

import { lineup, plugins } from './line.js'
import { post, open, register } from './stream.js'
import * as Colors from '../vendor/colors.js'

register(event => console.log(Object.assign({time:Date.now()-t0}, event)))

export const counts = {succeeds:0, fails:0}
export async function start({origin, hash}) {

  let line = `► reload ${hash}`
  let item = {type:'paragraph', text:line, id:'a12b34c56d78e90f'}
  let todo = [{line, item}]

  let nextstream = open()

  const waitfor = async want => { let event = await nextstream(); if(event.type != want) return await waitfor(want); return event}

  while(todo.length) {

    let m
    let doing = todo.shift()
    let next = doing.line
    const pragma = regex => { m = next.match(regex); return m }
    console.log()
    post({type:'progress',run:doing.item.id})
    console.log(next)
    let failed = false
    next = next.replace(/^► fail /, () => {failed = true; return '► '})


    function confirm(boolean, actual) {
      if (boolean != failed) counts.succeeds++
      else counts.fails++
      let report = boolean != failed ?
          Colors.green('succeeds') :
          Colors.red('fails')
      if (!boolean) {report += ` with ${actual}`}
      console.log(report)
    }


    if (pragma(/^► see (\d+) panels?$/)) {
      confirm(lineup.length == m[1], lineup.length)
    }

    else if (pragma(/^► see (\w+) plugin$/)) {
      let plugin = plugins[m[1]]
      if (!plugin || plugin.err) { confirm(false, plugin?.err); continue }
      let pane = lastpane(pane => pane.item.type == m[1])
      confirm(pane!=null, 'absent')
    }

    else if (pragma(/^► see synopsis (.+)$/)) {
      let panel = lineup.slice(-1)[0]
      let synopsis = panel.page.story[0].text
      confirm(synopsis.includes(m[1]), synopsis.substring(0,60))
    }

    else if (pragma(/^► show lineup$/)) {
      panels()
    }

    else if (pragma(/^► show (\d+) panels?/)) {
      panes(m[1])
    }

    else if (pragma(/^► show plugins/)) {
      console.log(plugins)
    }

    else if (pragma(/^► reload (.+)$/)) {
      let hash = m[1]
      post({type:'reload', origin, hash})
      await waitfor('reloaded')
      confirm(lineup.length == 1, lineup.length)
      todo.splice(0,0,...pragmas(lineup.slice(-1)[0].page))
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

    else if (pragma(/^► (.+?) in ([a-z]+)$/)) {
      let pragma = m[1]
      let pane = lastpane(pane => pane.item.type == m[2])
      if (!pane) { confirm(false, 'absent'); continue }
      post({type:'test', pragma, pid:pane.panel.pid, id:pane.item.id})
      let result = await waitfor('tested')
      confirm(result.success, result.details)
    }

    else if (pragma(/^► click (.+?)$/)) {
      let title = m[1]
      let pane = lastpane(pane => (pane.item.text||'').includes(`[[${title}]]`))
      if (!pane) { confirm(false, 'absent'); continue }
      post({type:'click', title, pid:pane.panel.pid})
      await waitfor('clicked')
      let page = lineup.slice(-1)[0].page
      confirm(!page.err, page.err)
    }

    else {
      confirm(false,'unknown')
    }
  }
}

const asSlug = (title) => title.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase()

function lastpane(predicate) {
  for (let i = lineup.length-1; i >= 0; i--) {
    let panel = lineup[i]
    for (let j = panel.panes.length-1; j >=0; j--) {
      let pane = panel.panes[j]
      if (predicate(pane)) return pane
    }
  }
  return null
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
  console.table(lineup.map(panel=>({pid:panel.pid, site:panel.site, slug:panel.slug, where:panel.where})))
}

function panes(n) {
  for (let panel of lineup.slice(-n)) {
    console.log(panel.page.title)
    console.table(panel.panes.map(pane=>({
      id:pane.id,
      type:pane.type,
      look:(pane.look||'').replace(/<.*?>/g,'').slice(0,40)
    })))
  }
}
