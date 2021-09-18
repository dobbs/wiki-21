# August Spike

Install the deno file_server

    deno install --allow-net --allow-read https://deno.land/std@0.93.0/http/file_server.ts

    # include .deno/bin in PATH, at least for the moment
    # include this this change in your dotfiles if you like deno's file_server
    PATH=$PATH:~/.deno/bin

Run this demo locally

    cd wiki-21/samples/spike-september
    file_server
