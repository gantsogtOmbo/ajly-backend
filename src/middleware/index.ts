import { Elysia } from "elysia";
import { firebaseAuth } from "../config/firebase";

export const auth = new Elysia({ name: "auth" }).derive({ as: "scoped" }, async ({ headers }) => {
  const authorization = headers["authorization"];

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new Error("Token олдсонгүй");
  }

  const token = authorization.split("Bearer ")[1];

  try {
    const decoded = await firebaseAuth.verifyIdToken(token);

    return {
      user: {
        uid: decoded.uid,
        email: decoded.email ?? null,
        phone: decoded.phone_number ?? null,
        name: decoded.name ?? null,
        picture: decoded.picture ?? null,
        provider: decoded.firebase.sign_in_provider,
      },
    };
  } catch (e) {
    throw new Error("Token буруу эсвэл хугацаа дууссан");
  }
});
