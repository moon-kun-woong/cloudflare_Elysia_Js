import { Elysia } from "elysia";
import { setup } from "./setup";
import { drizzle } from 'drizzle-orm/d1'
import { cats } from './entities'
import { sql } from 'drizzle-orm'

export function appStart(env: Env) {
	const app = new Elysia({ aot: false })
		.use(setup(env))
		.onError(errorHandler)

		.get("/users/:username", async (username) => {
			const cachedResp = await env.CACHE.get(`repos:${username}`, "json");

			if (cachedResp) {
				return JSON.stringify(cachedResp);
			}

			const resp = await fetch(`https://api.github.com/users/${username}/repos`, {
				headers: {
					"User-Agent": "CF Workers",
				}
			})

			const data = await resp.json();
			await env.CACHE.put(JSON.stringify(username), JSON.stringify(data));
			return JSON.stringify(data as object);

		})

		.get("/cats/:id", async (context) => {
			console.log(context.params.id);
			const db = drizzle(env.DB);
			const result = await db.select().from(cats).where(sql`id=${context.params.id}`);

			return JSON.stringify({result: result, id: context.params.id});
		})

		.get("/cats", async () => {
			const db = drizzle(env.DB);
			const result = await db.select().from(cats).all();

			const key = 'cats';
			const resultJson = JSON.stringify(result);

			await env.MY_BUCKET.put(key, resultJson);
			const s = await env.MY_BUCKET.get(key);
			console.log(s);

			return JSON.parse(resultJson)
		})

		.post("/cats", async (context) => {
			const contextBody = context.body;
			console.log(contextBody);

			const { name, age, breed }:any = contextBody;
			const db = drizzle(env.DB);
			const result = await db.insert(cats).values([{ name, age, breed }]);
			const resultJson = JSON.stringify(result)

			return JSON.parse(resultJson);
		})

		.put("/cats/:id", async (context) => {
			const id = context.params.id
			const contextBody = context.body
			const { name, age, breed }:any = contextBody;

			const db = drizzle(env.DB);
			const result = await db.update(cats).set({ name, age, breed }).where(sql`id=${id}`);

			return JSON.stringify(result);
		})

		.delete("/cats/:id", async (context) => {
			const id = context.params.id
			const db = drizzle(env.DB);
			const result = await db.delete(cats).where(sql`id=${id}`);

			return result;
		})

	return app;
}

const errorHandler = ({ code, error }: { code: string, error: Error }): Response => {
	if (code === 'NOT_FOUND') {
		return new Response (`${code}, ${error}`)
	}
	console.error(code, error)
	return new Response (`${code} , ${error.message}`)
}