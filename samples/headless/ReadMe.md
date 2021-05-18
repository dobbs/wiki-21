# Headless Federated Wiki

This codebase is a variation of small.fed.wiki's Experimental Assets.
Here we explore functional test driven development of advanced wiki features.

Install deno from https://deno.land/

## Download and Run

Clone this repo and cd to samples/headless.

Run the standard test suite.
```
deno run --allow-net --allow-read --reload ./testctl.js
```

## Run from GitHub master

Run any tests from anywhere. Add desired slug@site as test.js argument.
```
deno run --reload --allow-net https://dobbs.github.io/wiki-21/samples/headless/testctl.js
```

# Pragmas Guide Testing

We add markup lines, typically to paragraphs, to guide the test runner and check the results it encocunters.
Prepend any pragma with "fail" to indicate that failure is expected and will be marked as success.

See [Functional Testing](http://ward.dojo.fed.wiki/view/functional-testing/small.fed.wiki/first-functional-test)

## Available Pragmas

► show lineup

► see COUNT panel(s)

► show COUNT panel(s)

► see TYPE plugin

► drop SLUG@SITE

► run [[TITLE]]

► run selected tests
```
