import { Elysia, t } from "elysia";
import { auth } from "../../middleware";
import { userService } from "./logic";

export const usersController = new Elysia({ prefix: "/users" })
  .use(auth)
  .get("/me", ({ user }) => user)
  .get("/", () => userService.getAll())
  .get("/:id", ({ params: { id } }) => userService.getById(Number(id)), {
    params: t.Object({
      id: t.String(),
    }),
  })
  .post("/", ({ body }) => userService.create(body), {
    body: t.Object({
      phone: t.String(),
    }),
  });
