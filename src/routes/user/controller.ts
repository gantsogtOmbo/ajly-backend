import { Elysia, t } from "elysia";
import { userService } from "./logic";

export const usersController = new Elysia({ prefix: "/users" })
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
