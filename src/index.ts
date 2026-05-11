import { openapi } from "@elysia/openapi";
import { Elysia } from "elysia";
import env from "./env";
import { usersController } from "./routes/user/controller";

const app = new Elysia()
  .use(openapi({ path: "docs" }))
  .get("/", () => "Hello Ajly")
  .use(usersController)
  .listen(env.PORT);

console.log(`🦊 Ajly is running at ${app.server?.hostname}:${app.server?.port}`);
