import Elysia from "elysia";
import { auth } from "../../middleware";
import { employerService } from "./logic";
import { employerModels } from "./model";

export const employerController = new Elysia({ prefix: "/employer" })
  .use(auth)
  // Profile
  .get("/profile", ({ user }) => employerService.getProfile(user.uid))
  .post("/profile", ({ user, body }) => employerService.upsertProfile(user.uid, body), {
    body: employerModels.upsertProfile,
  })
  // Searches
  .get("/searches", async ({ user }) => {
    const profile = await employerService.getProfile(user.uid);
    if (!profile) throw new Error("Employer profile олдсонгүй");
    return employerService.listSearches(profile.id);
  })
  .post("/searches", async ({ user, body }) => {
    const profile = await employerService.getProfile(user.uid);
    if (!profile) throw new Error("Employer profile олдсонгүй");
    return employerService.createSearch(profile.id, body);
  }, {
    body: employerModels.createSearch,
  })
  .patch("/searches/:id", async ({ user, params, body }) => {
    const profile = await employerService.getProfile(user.uid);
    if (!profile) throw new Error("Employer profile олдсонгүй");
    return employerService.updateSearch(params.id, profile.id, body);
  }, {
    body: employerModels.createSearch,
  })
  .delete("/searches/:id", async ({ user, params }) => {
    const profile = await employerService.getProfile(user.uid);
    if (!profile) throw new Error("Employer profile олдсонгүй");
    await employerService.deleteSearch(params.id);
    return { success: true };
  });
