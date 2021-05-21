// Smallest plugin for reference

export { emit, bind }

function expand(text) {
  return text
}

function emit($item, item) {
  let html = expand(item.text)
  if($item && $item.innerHTML)
    $item.innerHTML = html
  else if ($item && $item.look) {
    $item.look = html
    $item.links.push(item.title) 
    $item.context = item.site   
  }
  else
    return html
}

function bind($item, item) {

}
