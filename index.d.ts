export function httpServer(options?: object): string
export function serverlessDeploy(port?: string): string
export function serverlessOffline(options?: object): string
export function waitDockerPgReady(network: string): string
export function webpackDevServer(port?: string): string

export const DOCKER_COMPOSE_UP: string
export const WEBPACK_PROD: string
export const SHX_COPY_PUBLIC_TO_DIST: string
export const SHX_RM_DIST_DOTWEBPACK: string
