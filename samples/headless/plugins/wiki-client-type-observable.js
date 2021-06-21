// Smallest plugin for observable

export { emit, bind, test }

function escape(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function emit($item, item) {
  $item.nodes = item.text.split(/\r?\n/)
  let text = $item.nodes.map(line => escape(line)).join("\n")
  let code = `<code>${text}</code>`
  let html = `<pre style="background-color: #eee; padding:8px;">${code}</pre>`

  if($item && $item.innerHTML)
    $item.innerHTML = html
  else if ($item && $item.look) {
    $item.colors = $item.nodes.reduce((acc, node) => (acc[node] = 'blue', acc), {})
    $item.look = html
    $item.source = 'sofi'
    let colorMap = {good:'green',bad:'red'}
    $item.setAssessment = (node, value) => {
      $item.colors[node] = colorMap[value]||'blue'
    }
  }
  else
    return html
}

function bind(panel, item) {

}

async function test(pane, pragma, line) {
  // console.log(pane)
  let m

  if (m = pragma.match(/^see (red|green|blue)$/)) {
    let success = Object.values(pane.colors).includes(m[1])
    return {success, details:success?'ok':'absent'}
  }

  if (m = pragma.match(/^click (.+)$/)) {
    if (!(pane.nodes.includes(m[1]))) return({success:false, detail:'absent'})
    await line.click(m[1], pane.panel.pid)

    // let success = Object.values(pane.colors).includes(m[1])
    // return {success, details:success?'ok':'absent'}
  }

  else {
    let success = false
    let details = 'unknown'
    return {success, details}
  }
}
