import cors from '@elysiajs/cors'
import { drizzle } from 'drizzle-orm/d1'
import Elysia, { type ElysiaConfig } from 'elysia'

export type Config = ElysiaConfig<string, false>

export function setup (env: Env) {
  const config: Config = { name: 'setup' }
  return new Elysia(config)
    .decorate('kv', env.CACHE)
    .decorate('db', drizzle(env.DB))
    .decorate('r2', env.MY_BUCKET)
    .use(cors())
}
