const { spawnSync } = require('child_process')

const isPlainObject = require('lodash.isplainobject')
const asyncSpawn = require('child-process-promise').spawn

const defaultSpawnOptions = { shell: true, stdio: 'inherit' }

const print = command => console.log(`\x1b[35mRunning\x1b[0m: ${command}`)

const getParams = (args, fnName) => {
  let cmdToUse
  let options = {}

  if (typeof args[0] === 'string') {
    cmdToUse = args[0]
    if (args.length > 0 && isPlainObject(args[1])) {
      options = args[1]
    }
    if (options.cmd || options.command) {
      throw Error(
        `${fnName} cannot take both a command string argument and a command or cmd property in the options argument`
      )
    }
  }

  if (isPlainObject(args[0])) {
    options = args[0]
    if (args[0].cmd && args[0].command) {
      throw Error(`You cannot pass both a cmd and a command option to ${fnName}`)
    }
    cmdToUse = args[0].cmd || args[0].command
    if (!cmdToUse) {
      throw Error(`You must pass a cmd or command property to the options of ${fnName}`)
    }
  }

  const { silent, cmd, command, extraEnv, env, ...spawnOptions } = options

  return { cmdToUse, silent, cmd, command, extraEnv, env, spawnOptions }
}

const runSync = (...args) => {
  const { cmdToUse, silent, cmd, command, extraEnv, env, spawnOptions } = getParams(args, 'runSync')

  silent || print(cmdToUse)

  const result = spawnSync(cmdToUse, {
    ...defaultSpawnOptions,
    ...(env || extraEnv ? { env: { ...(env || process.env), ...extraEnv } } : {}),
    ...spawnOptions,
  })

  if (result.status !== 0) {
    process.exit(1)
  }
}

const runAsync = (...args) => {
  const { cmdToUse, silent, cmd, command, extraEnv, env, spawnOptions } = getParams(
    args,
    'runAsync'
  )

  silent || print(cmdToUse)

  return asyncSpawn(cmdToUse, {
    ...defaultSpawnOptions,
    ...(env || extraEnv ? { env: { ...(env || process.env), ...extraEnv } } : {}),
    ...spawnOptions,
  })
}

const series = (...args) => {
  const commands = Array.isArray(args[0]) ? args[0] : args
  commands.forEach(command => runSync(command))
}

const parallel = (...args) => {
  const commands = Array.isArray(args[0]) ? args[0] : args
  return Promise.all(commands.map(command => runAsync(command)))
}

const scripts = scriptsObj => scriptsObj[process.argv[2]]()

const commands = {
  WEBPACK_PROD: 'webpack -p',
  DOCKER_COMPOSE_UP: 'docker-compose up -d',
  waitLocalPgReady: network => {
    if (!network) {
      throw Error('waitLocalPgReady requires a Docker network argument')
    }
    return `until docker run --rm --link db:pg --net ${network} postgres:latest pg_isready -U postgres -h pg; do sleep 1; done`
  },
  webpackDevServer: port => `webpack-dev-server ${port ? `--port ${port}` : ''}`,
  serverlessDeploy: stage => `serverless deploy ${stage ? `-s ${stage}` : ''}`,
  serverlessOffline: ({ stage, port } = {}) =>
    `serverless offline ${stage ? `-s ${stage}` : ''} ${port ? `-P ${port}` : ''}`,
  httpServer: ({ folder, port } = {}) =>
    `http-server ${folder || ''} ${port ? `-p ${port}` : ''} --cors -g`,
  SHX_COPY_PUBLIC_TO_DIST: 'shx cp -r public dist',
  SHX_RM_DIST_DOTWEBPACK: 'shx rm -rf dist .webpack',
}

module.exports = {
  runSync,
  runAsync,
  scripts,
  commands,
  series,
  parallel,
}
