import { open, post } from './stream.js'
export { lineup, plugins }

let origin = 'localhost'

const newpid = () => Math.floor(Math.random()*1000000)
const newpanel = (props) => ({pid:newpid(), lineup, ...props})
const purl = (site, slug) => site ? `http://${site}/${slug}.json` : `http://${origin}/${slug}.json`

let lineup = []
let plugins = {}

line()

async function line() {
  let next = open()
  while (true) {
    let event = await next()
    switch (event.type) {
      case 'reload':
        origin = event.origin || origin
        await reload(event.hash)
        post({type:'reloaded'})
        break
      case 'reference':
        await reference(event.site, event.slug, event.pid)
        post({type:'referenced'})
        break
      case 'click':
        await click(event.title, event.pid)
        post({type:'clicked'})
        break
      case 'test':
        let result = await test(event.pragma, event.pid, event.id)
        post({type:'tested', ...result})
        break
    }
  }
}

function reload(hash) {
  let fields = hash.replace(/(^[/#]+)|([/]+$)/g,'').split('/')
  let flight = []
  for (let field of fields) {
    let [slug,site] = field.split('@')
    site ||= origin
    let panel = newpanel({site, slug, where:site})
    lineup.push(panel)
    let loading = fetch(purl(site,slug))
      .then(res => res.json())
      .then(json => {
        panel.page = json
        return refresh(panel)
      }
    )
    flight.push(loading)
  }
  return Promise.all(flight)
}

function refresh(panel) {
  post({type:'progress',panel:panel.pid})
  let flight = []
  panel.panes = []
  for (let item of panel.page.story) {
    let id = item.id
    if (item.type == 'code' && item.text.startsWith('► be ')) {
      item.type = item.text.match(/► be ([a-z]+)\b/)[1]
      item.text = item.text.split(/\n/).splice(1).join("\n")
    }
    let type = item.type
    let pane = {id, type, item, look:'blank', panel}
    panel.panes.push(pane)
    flight.push(render(pane,panel))
  }
  return Promise.all(flight)
}

let loading = {}
async function load(type) {
  let plugin = plugins[type]
  if (plugin) return plugin
  let queue = loading[type]
  if (queue) return new Promise(resolve => queue.push(resolve))
  queue = loading[type] = []
  post({type:'load', plugin:type})
  let url = `../plugins/wiki-client-type-${type}.js`
  plugins[type] = plugin = await import(url).catch(err=>({err:err.message, emit:(pane,item) => pane.look = `<p>HELP ${item.text}</p>`}))
  post({type:'loaded', plugin:type, queued:queue?.length, err:plugin.err})
  if (queue?.length) queue.map(resolve => resolve(plugin))
  delete loading[type]
  return plugin
}

async function render(pane,panel) {
  let item = pane.item
  switch (item.type) {
  case 'paragraph':
    let resolved = item.text
      .replace(/\[\[(.+?)\]\]/g, internal)
      .replace(/\[(.+?) (.+?)\]/g, external)
    return pane.look = `<p>${resolved}</p>`
  default:
    let handler = await load(item.type)
    handler.emit(pane, item)
    if(handler.bind) handler.bind(pane, item)
  }

  function internal(link, title) {
    return `<a href="#" data-pid=${panel.pid}>${title}</a>`
  }

  function external(link, url, words) {
    return `<a href="${url}" target=_blank>${words} ${linkmark()}</a>`
  }
}

async function click(title, pid, context=[]) {
  let panel = await resolve(title, pid, context)
  let hit = lineup.findIndex(panel => panel.pid == pid)
  lineup.splice(hit+1,lineup.length, panel)
  return refresh(panel)
}

async function resolve(title, pid, context=[]) {
  const asSlug = (title) => title.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase()
  const recent = (list, action) => {if (action.site && !list.includes(action.site)) list.push(action.site); return list}
  let panel = lineup.find(panel => panel.pid == pid)
  let path = (panel.page.journal||[]).reverse().reduce(recent,[origin, ...context, panel.where])
  post({type:'progress', context: path })
  let slug = asSlug(title)
  let pages = await Promise.all(path.map(where => probe(where, slug)))
  let hit = pages.findIndex(page => !page.err)
  post({type:'progress', hit })
  if (hit >= 0) {
    let site = path[hit]
    return newpanel({where:site, site, slug, page:pages[hit]})
  } else {
    let text = "We can't find this page in the expected locations."
    let page = {title,story:[{type:'paragraph', text}], journal:[], err:'not found where expected'}
    return newpanel({where:'ghost', slug, page})
  }
}

async function reference(site, slug, pid) {
  let page = await probe(site, slug)
  post({type:'progress',event:'reference', title:page.title, err:page.err})
  let panel = newpanel({where:site, site, slug, page})
  let hit = lineup.findIndex(panel => panel.pid == pid)
  lineup.splice(hit+1,lineup.length, panel)
  return refresh(panel)
}

function probe(where, slug) {
  let site = where == null ? origin : where
  return fetch(`http://${site}/${slug}.json`)
    .then(res => res.ok ? res.json() : ({title:'Error',story:[],journal:[],err:res.statusText||'unknown-1'}))
    .catch(err => ({title:'Error',story:[],journal:[],err:err.message||'unknown-2'}))
}

async function test(pragma, pid, id) {
  let panel = lineup.find(panel => panel.pid == pid)
  let pane = panel.panes.find(pane => pane.item.id == id)
  let plugin = await load(pane.type)
  return plugin.test(pane, pragma, {reference, click})
}

function linkmark() {
  return `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAC0WlDQ1BJQ0MgUHJvZmlsZQAAKJGNlM9LFGEYx7+zjRgoQWBme4ihQ0ioTBZlROWuv9i0bVl/lBLE7Oy7u5Ozs9PM7JoiEV46ZtE9Kg8e+gM8eOiUl8LALALpblFEgpeS7Xlnxt0R7ccLM/N5nx/f53nf4X2BGlkxTT0kAXnDsZJ9Uen66JhU+xEhHEEdwqhTVNuMJBIDoMFjsWtsvofAvyute/v/OurStpoHhP1A6Eea2Sqw7xfZC1lqBBC5XsOEYzrE9zhbnv0x55TH8659KNlFvEh8QDUtHv+auEPNKWmgRiRuyQZiUgHO60XV7+cgPfXMGB6k73Hq6S6ze3wWZtJKdz9xG/HnNOvu4ZrE8xmtN0bcTM9axuod9lg4oTmxIY9DI4YeH/C5yUjFr/qaoulEk9v6dmmwZ9t+S7mcIA4TJ8cL/TymkXI7p3JD1zwW9KlcV9znd1Yxyeseo5g5U3f/F/UWeoVR6GDQYNDbgIQk+hBFK0xYKCBDHo0iNLIyN8YitjG+Z6SORIAl8q9TzrqbcxtFyuZZI4jGMdNSUZDkD/JXeVV+Ks/JX2bDxeaqZ8a6qanLD76TLq+8ret7/Z48fZXqRsirI0vWfGVNdqDTQHcZYzZcVeI12P34ZmCVLFCpFSlXadytVHJ9Nr0jgWp/2j2KXZpebKrWWhUXbqzUL03v2KvCrlWxyqp2zqtxwXwmHhVPijGxQzwHSbwkdooXxW6anRcHKhnDpKJhwlWyoVCWgUnymjv+mRcL76y5o6GPGczSVImf/4RVyGg6CxzRf7j/c/B7xaOxIvDCBg6frto2ku4dIjQuV23OFeDCN7oP3lZtzXQeDj0BFs6oRavkSwvCG4pmdxw+6SqYk5aWzTlSuyyflSJ0JTEpZqhtLZKi65LrsiWL2cwqsXQb7Mypdk+lnnal5lO5vEHnr/YRsPWwXP75rFzeek49rAEv9d/AvP1FThgxSQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAKtJREFUGJVtkLERwjAMRZ+5UHmmNNpCrpMloMi5gCXcO1MkLWwBS6SCO1EQgkP4d2q+nr50cmZGqbZt18YsV4IxRqv2FcfD8XeYXWl0Xefutzsxxk1iFUJYrfLeU9f1BtwB5JzJOeO9R1UREcZxXCVX5R0l1Pc9AKfz6ZsIoKpcrpcFmqaJlJJ7Pp6klByqah8Nw2BN05iZ2ezzqWU1gIggIv/e+AZDCH+bpV442lpGxygDswAAAABJRU5ErkJggg==" alt="" />`
}