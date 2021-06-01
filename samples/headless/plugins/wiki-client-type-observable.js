// Smallest plugin for observable

export { emit, bind }

function escape(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function emit($item, item) {
  let nodes = item.text.split(/\r?\n/)
  let text = nodes.map(line => escape(line)).join("\n")
  let code = `<code>${text}</code>`
  let html = `<pre style="background-color: #eee; padding:8px;">${code}</pre>`

  if($item && $item.innerHTML)
    $item.innerHTML = html
  else if ($item && $item.look) {
    $item.look = html
    $item.links.push('Strategy')
    $item.links.push('Culture')
  }
  else
    return html
}

function bind($item, item) {

}
