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
  let m

  if (m = pragma.match(/^click (flag|twin title)$/)) {
    let site = pane.item.site
    let slug = asSlug(pane.item.title)
    let pid = pane.panel.pid
    if (m[1]=='flag') {
      let htmls = await line.reference(site, slug, pid)
      let details = htmls[0]
    } else {
      // ... click()
    }
    let htmls = await line.reference(site, slug, pid)
    let details = htmls[0]
    // if we could tell where the htmls were fetched from
    // then we could just for m[1]=='flag' ? site | origin
    // instead we look for words expected on the desired page
    let success = details.includes(m[1]=='flag' ? 'deploy' : 'uninteresting')
    return {success, details:htmls[0]}
  }

  if (m = pragma.match(/^click (.+)$/)) {
    let success = false
    return {success, details:m[1]}
  }

  else return {success:false, details:'unknown'}
}
