import { openapi } from "@elysia/openapi";
import { Elysia } from "elysia";
import env from "./env";
import { candidatesController } from "./routes/candidates/controller";
import { employerController } from "./routes/employer/controller";
import { usersController } from "./routes/user/controller";

const app = new Elysia()
  .use(openapi({ path: "docs" }))
  .get("/", () => "Hello Ajly")
  .use(usersController)
  .use(employerController)
  .use(candidatesController)
  .listen(env.PORT);

console.log(`🦊 Ajly is running at ${app.server?.hostname}:${app.server?.port}`);
