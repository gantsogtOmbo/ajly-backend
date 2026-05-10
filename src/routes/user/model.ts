import { t } from "elysia";

export const userModels = {
  createUser: t.Object({
    phone: t.String(),
  }),

  userResponse: t.Object({
    id: t.Number(),
    phone: t.String(),
    createdAt: t.Any(),
  }),
};
