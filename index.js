const { spawnSync } = require('child_process')

const asyncSpawn = require('child-process-promise').spawn

const spawnConfig = { shell: true, stdio: 'inherit' }

const runSync = cmd => {
  console.log(`\x1b[35mRunning\x1b[0m: ${cmd}`)
  const result = spawnSync(cmd, spawnConfig)
  if (result.status !== 0) {
    process.exit(1)
  }
}

const runAsync = cmd => {
  console.log(`\x1b[35mRunning\x1b[0m (async): ${cmd}`)
  return asyncSpawn(cmd, spawnConfig)
}

const scripts = scriptsObj => scriptsObj[process.argv[2]]()

module.exports = { runSync, runAsync, scripts }
