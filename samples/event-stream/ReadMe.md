# Event Stream Prototype
We imagine the headless feel of wiki shared between either a batch test runner or a graphical DOM interface.

See [Shared State Space](http://small.fed.wiki/shared-state-space.html)

## Run the Prototype

From pages. [run](https://dobbs.github.io/wiki-21/samples/event-stream/prototype.html)
```
https://dobbs.github.io/wiki-21/samples/event-stream/prototype.html
```
From clone.
```
cd wiki-21/samples/event-stream
deno run --allow-net --allow-read https://deno.land/std/http/file_server.ts
```
```
http://localhost:4507/prototype.html
```

## Run the Generator

A similar example using generators: [run](https://dobbs.github.io/wiki-21/samples/event-stream/generators.html)
```
https://dobbs.github.io/wiki-21/samples/event-stream/generators.html
```
