

function code(open, close) {
  return {
    open: `\x1b[${open.join(";")}m`,
    close: `\x1b[${close}m`,
    regexp: new RegExp(`\\x1b\\[${close}m`, "g"),
  }
}

function run(str, code) {
  return `${code.open}${str.replace(code.regexp, code.open)}${code.close}`
}

export const red    = str => run(str, code([31], 39))
export const green  = str => run(str, code([32], 39))
export const yellow = str => run(str, code([33], 39))
export const blue   = str => run(str, code([34], 39))
