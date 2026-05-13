import { Elysia, t } from "elysia";
import { auth } from "../../middleware";
import { candidatesService } from "./logic";

export const candidatesController = new Elysia({ prefix: "/candidates" })
  .use(auth)
  .get("/count", ({ user, query }) => candidatesService.count(query.searchId, user.uid), {
    query: t.Object({ searchId: t.String() }),
  })
  .get(
    "/",
    ({ user, query }) =>
      candidatesService.list(query.searchId, user.uid, query.page ?? 1, query.limit ?? 20),
    {
      query: t.Object({
        searchId: t.String(),
        page: t.Optional(t.Number({ minimum: 1 })),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
      }),
    },
  );
