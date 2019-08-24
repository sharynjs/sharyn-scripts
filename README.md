# 🌹 @sharyn/run-cmd

## Usage

### Installation

```sh
npm install --save-dev @sharyn/run-cmd
or
yarn add --dev @sharyn/run-cmd
```

### package.json

```json
"scripts" : {
  "start": "node scripts dev",
  "deploy": "node scripts deploy",
  "check-all": "node scripts check-all"
}
```

Create a `scripts.js` (or any name you want). In this example we put in the root of our project, next to `package.json`.

### scripts.js

```js
const { run, runAsync, scripts } = require('@sharyn/run-cmd')

// First declare some raw commands as simple strings

const clean = 'rimraf lib dist'
const lint = 'eslint src'
const test = 'jest'

const webpackDevServer = 'webpack-dev-server'
const devServer = 'nodemon'

const upload = 'git push prod master'

// Optionally combine them into sequences as simple functions

const checkAll = () => {
  run(clean)
  run(lint)
  run(test)
}

// And finally declaire your scripts in a simple object

scripts({
  dev: () => {
    runAsync(webpackDevServer)   // These two are started
    runAsync(devServer)          // in parallel
  },
  deploy: () => {
    checkAll()                   // Runs clean, lint, test,
    run(upload)                  // and upload in series
  }
  'check-all': checkAll,         // Runs clean, lint, test, in series
})

```

## Why?

Declaring your scripts in a JavaScript file gives you much more features than using plain text in `package.json`. For instance, you can use `dotenv` to load up your `.env` and run a command like:

```js
require('dotenv/config')

const startServer = `http-server -p ${PORT}`
```

It also makes chaining, and launching scripts much easier than using [`npm-run-all`](https://www.npmjs.com/package/npm-run-all) (which has been a precious help for many years).

And you just have all of JavaScript available for whatever it is that you want to do in your scripts instead of plain text.

## API

**`run`** is just a `spawnSync(cmd, { shell: true, stdio: 'inherit' })`, so it is **synchronous**.

**`runSync`** uses [`child-process-promise`](https://www.npmjs.com/package/child-process-promise), to make `spawn` a `Promise`. So you can do `await runAsync()` to make it synchronous if you want to use `async`/`await`.

**`scripts`** just calls the key of the object you passed to it with `process.argv[2]`. You can replace it entirely by:

```js
const scripts = {
  foo: () => {
    run(bar)
    run(baz)
  },
}

scripts[process.argv[2]]()
```

That's it.

## Babel / TypeScript

If you want to use anything fancy like Babel or TypeScript, just use [`babel-node`](https://babeljs.io/docs/en/babel-node) or [`ts-node`](https://github.com/TypeStrong/ts-node) in the scripts of your `package.json`.
