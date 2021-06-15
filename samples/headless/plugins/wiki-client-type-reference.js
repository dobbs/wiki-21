// Smallest plugin for reference

import { resolve } from '../core/plugin.js'
export { emit, bind }

function expand(text) {
  return resolve(text, )
}

function emit($item, item) {
  let html = resolve(item?.text, $item.links||[])
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
