// Convert test.js log file into page of items
// Usage: ... > test.log ; deno run --allow-read=test.log --allow-write=test-log.json itemize.js

let title = `Test Log`
let text = `Recorded and uploaded test.log. Click items for details. Shift-hover to align with test suite.`
let story = [{type:'paragraph',text, id:'8048560980495803'}]
let journal = [{type:'create',date:Date.now()},{type:'fork'}]
let page = {title, story, journal}
let exprt = {'test-log': page}

let log = Deno.readTextFileSync('test.log')
let chunks = log.split(/\{.*?run:/)
for (let chunk of chunks) {
  let lines = chunk.split(/\r?\n/)
  let m = lines[0].match(/"([0-9a-f]+)"/)
  if(m) {
    lines.shift()
    let pragma = lines.shift()
    console.log(m[1], pragma)
    let summary = pragma.replace(/► /,'') + status(chunk)
    emit(summary, lines, m[1])
  } else {
    console.log('prefix',lines)
  }
}
let json = JSON.stringify(exprt)
let file = "./test-log.json"
await Deno.writeTextFile(file, json)
console.log(file, json.length, 'bytes')

function status(log) {
  if(/fails/.test(log)) return ' <span style="color:red">✘</span>'
  if(/succeeds/.test(log)) return ' <span style="color:green">✔︎</span>'
  return ''
}

function emit(summary, lines, id) {
  let details = lines.join("\n").replace(/\033\[\d+m/g,'')
  let text = `<details><summary>${summary}</summary><pre>${details}</pre></details>`
  story.push({type:'html', text, id})
}

