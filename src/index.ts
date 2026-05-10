import { Elysia } from "elysia";
import env from "./env";
import { usersController } from "./routes/user/controller";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(usersController)
  .listen(env.PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
