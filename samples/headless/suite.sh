# Run test suite and publish Test Log
# Usage: sh suite.sh

deno run --allow-net --allow-read=. --reload testctl.js > test.log
echo exit with $? fails
deno run --allow-read=. --allow-write=. --reload itemize.js
jq '.["test-log"]' test-log.json | ssh asia 'cat > .wiki/small.fed.wiki/pages/test-log'