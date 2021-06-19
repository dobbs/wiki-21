// Smallest plugin for reference

export { emit, bind, test }
const asSlug = (title) => title.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase()

function escape(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function emit($item, item) {
  let html = escape(item.text)
  if($item && $item.innerHTML)
    $item.innerHTML = html
  else if ($item && $item.look) {
    $item.look = html
  }
  else
    return html
}

function bind($item, item) {

}

async function test(pane, pragma, line) {
  let item = pane.item
  let pid = pane.panel.pid
  let m

  if (m = pragma.match(/^click flag$/)) {
    let slug = asSlug(item.title)
    await line.reference(item.site, asSlug(item.title), pid)
  }

  else if (m = pragma.match(/^click title$/)) {
    await line.click(item.title, pid, item.id)
  }

  // need some way to pass extra context for this to work
  else if (m = pragma.match(/^click (.+)$/)) {
    await line.click(m[1], pid, item.id)
  }

  else return {success:false, details:'unknown'}

  return {success:true}
}
