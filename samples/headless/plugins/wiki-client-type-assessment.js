// Smallest plugin for assessment

export { emit, bind, test }

function escape(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function emit($item, item) {
  $item.choices = item.text.split(/, ?/)
  let code = `<code>${escape(item.text)}</code>`
  let html = `<pre style="background-color: #eee; padding:8px;">${code}</pre>`

  if($item && $item.innerHTML)
    $item.innerHTML = html
  else if ($item && $item.look) {
    $item.look = html
  }
  else
    return html
}

function bind(pane, item) {
  pane.sofi = lastpane(pane.panel.lineup, pane => pane.source == 'sofi')
}

function test(pane, pragma) {
  let chooser = new RegExp(`^choose (${pane.choices.join("|")})$`)
  let m = pragma.match(chooser)
  if (m) {
    if (pane.sofi != null) pane.sofi.setAssessment(pane.panel.page.title, m[1])
    return {success:true}
  } else {
    let success = false
    let details = 'unknown'
    return {success, details}
  }
}

function lastpane(lineup, predicate) {
  for (let i = lineup.length-1; i >= 0; i--) {
    let panel = lineup[i]
    for (let j = panel.panes.length-1; j >=0; j--) {
      let pane = panel.panes[j]
      if (predicate(pane)) return pane
    }
  }
  return null
}
