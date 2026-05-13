import { Elysia, t } from "elysia";
import { auth } from "../../middleware";
import { surveyService, userService } from "./logic";
import { personalModels, roleModels, surveyModels, workExpModels } from "./model";

export const usersController = new Elysia({ prefix: "/users" })
  .use(auth)
  .get("/me", ({ user }) => userService.upsertMe(user.uid, user.name, user.phone))
  .get("/", () => userService.getAll())
  .get("/:id", ({ params: { id } }) => userService.getById(id), {
    params: t.Object({ id: t.String() }),
  })
  .patch("/role", ({ user, body }) => userService.setRole(user.uid, body.role), {
    body: roleModels.setRole,
  })
  // Tier
  .get("/tier", ({ user }) => userService.getTierStatus(user.uid))
  .patch("/personal", ({ user, body }) => userService.updatePersonal(user.uid, body), {
    body: personalModels.update,
  })
  .patch("/work-experience", ({ user, body }) => surveyService.updateWorkExperience(user.uid, body.detail), {
    body: workExpModels.update,
  })
  // Survey
  .get("/survey", ({ user }) => surveyService.get(user.uid))
  .patch(
    "/survey",
    ({ user, body }) => {
      const { step, ...data } = body;
      return surveyService.submitStep(user.uid, step, data);
    },
    { body: surveyModels.submitStep },
  );
