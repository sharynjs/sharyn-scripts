const { spawnSync } = require('child_process')

const asyncSpawn = require('child-process-promise').spawn

const defaultSpawnOptions = { shell: true, stdio: 'inherit' }

const print = command => console.log(`\x1b[35mRunning\x1b[0m: ${command}`)

const runSync = (command, { silent, ...spawnOptions } = {}) => {
  silent || print(command)
  const result = spawnSync(command, { ...defaultSpawnOptions, ...spawnOptions })
  if (result.status !== 0) {
    process.exit(1)
  }
}

const runAsync = (command, { silent, ...spawnOptions } = {}) => {
  silent || print(command)
  return asyncSpawn(command, { ...defaultSpawnOptions, ...spawnOptions })
}

const series = (...commands) => {
  commands.forEach(commandArg =>
    typeof commandArg === 'string'
      ? runSync(commandArg)
      : runSync(commandArg[0], commandArg[1])
  )
}

const parallel = (...commands) =>
  Promise.all(
    commands.map(commandArg =>
      typeof commandArg === 'string'
        ? runAsync(commandArg)
        : runAsync(commandArg[0], commandArg[1])
    )
  )

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
  webpackDevServer: port =>
    `webpack-dev-server ${port ? `--port ${port}` : ''}`,
  serverlessDeploy: stage => `serverless deploy ${stage ? `-s ${stage}` : ''}`,
  serverlessOffline: ({ stage, port } = {}) =>
    `serverless offline ${stage ? `-s ${stage}` : ''} ${
      port ? `-P ${port}` : ''
    }`,
  httpServer: ({ folder, port } = {}) =>
    `http-server ${folder || ''} ${port ? `-p ${port}` : ''} --cors -g`,
  SHX_COPY_PUBLIC_TO_DIST: 'shx cp -r public dist',
  SHX_RM_DIST_DOTWEBPACK: 'shx rm -rf dist .webpack',
}

module.exports = { runSync, runAsync, scripts, commands }
