declare function runSync(cmd: string): void
declare function runAsync(cmd: string): Promise<any>
declare function scripts(scriptsObj: Object): void

export { runSync, runAsync, scripts }
