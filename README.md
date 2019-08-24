# 🌹 scripts.js with @sharyn/run-cmd

**Declaring your scripts in a JavaScript file** gives you much more features than using plain text in `package.json`. For instance, you can use [`dotenv`](https://github.com/motdotla/dotenv) to load up your `.env` and use variables in a command like:

```js
require('dotenv/config')

const startServer = `http-server -p ${PORT}`
```

You can also create commands with function parameters:

```js
const deployServerless = stage => `serverless deploy -s ${stage}`

deployServerless('production') // or 'staging'
```

It makes chaining and launching scripts in parallel much easier than using [`npm-run-all`](https://www.npmjs.com/package/npm-run-all) (which has been a precious help to me for many years), gives you all the power of JavaScript, and also makes your scripts compatible with both Yarn and NPM (since you are not writing `npm run foo` or `yarn foo` in your scripts).

This package is **not needed at all** to achieve this technique, but it helps reducing the boilerplate of using `spawn`, and improves the readability of the file.

## Usage

### Installation

```sh
npm install --save-dev @sharyn/run-cmd
# or
yarn add --dev @sharyn/run-cmd
```

### package.json

Use `scripts` in `package.json` as simple hooks to your `script.js` file:

```json
"scripts" : {
  "start": "node scripts dev",
  "deploy": "node scripts deploy",
  "check-all": "node scripts check-all"
}
```

### scripts.js

Create a `scripts.js` (or any name you want). In this example we put it in the root of our project.

```js
const { run, runAsync, scripts } = require('@sharyn/run-cmd')

// First declare some raw commands as strings

const clean = 'rimraf lib dist'
const lint = 'eslint src'
const test = 'jest'

const webpackDevServer = 'webpack-dev-server'
const devServer = 'nodemon'

const upload = 'git push prod master'

// Optionally combine them into sequences with functions

const checkAll = () => {
  run(clean)
  run(lint)
  run(test)
}

// And finally declare your scripts in an object

scripts({
  dev: () => {
    runAsync(webpackDevServer)   // These two are started
    runAsync(devServer)          // in parallel
  },
  deploy: () => {
    checkAll()                   // Runs clean, lint, test,
    run(upload)                  // and upload in series
  },
  'check-all': checkAll,         // Runs clean, lint, test, in series
})

// That's all.

```

## API

**`run`** is just a `spawnSync(cmd, { shell: true, stdio: 'inherit' })`, so it is **synchronous**. It interrupts the process if one of the commands fails.

**`runAsync`** uses [`child-process-promise`](https://www.npmjs.com/package/child-process-promise), to make `spawn` a `Promise`. So you can do `await runAsync()` to make it synchronous if you want to use `async`/`await`.

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

It just looks a little nicer.

## Babel / TypeScript

If you want to use anything fancy like Babel or TypeScript, just use [`babel-node`](https://babeljs.io/docs/en/babel-node) or [`ts-node`](https://github.com/TypeStrong/ts-node) in the scripts of your `package.json`.

## Credits

Hey, I am [@verekia](https://github.com/verekia) and this package is part of a library I am developing, [@sharynjs/sharyn](https://github.com/sharynjs/sharyn). The rest of the library is not ready to be used by the community.
