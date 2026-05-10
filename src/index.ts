import { Elysia } from "elysia";
import { usersController } from "./routes/user/controller";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(usersController)
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
