import { appStart } from './app'

export default {
  async fetch (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return await appStart(env).fetch(request)
  }
}