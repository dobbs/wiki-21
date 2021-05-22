// Test runner for headless federated wiki
// Usage: deno run --allow-net --allow-read --reload core/test.js slug@site
// Usage: deno run --allow-net https://dobbs.github.io/wiki-21/samples/headless/core/test.js  slug@site

import {start, counts} from "./core/test.js"

let hash = Deno.args[0] || 'first-functional-test-suite@small.fed.wiki'
let origin = hash.split(/@/)[1] || 'small.fed.wiki'
await start({origin, hash})
Deno.exit(Math.min(counts.fails,255))