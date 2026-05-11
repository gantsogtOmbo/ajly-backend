import admin from "firebase-admin";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import env from "../env";

if (!admin.apps.length) {
  let serviceAccount: admin.ServiceAccount;

  const localKeyPath = join(process.cwd(), "src/config/serviceAccountKey.json");

  if (existsSync(localKeyPath)) {
    serviceAccount = JSON.parse(readFileSync(localKeyPath, "utf-8"));
  } else {
    serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT ?? "{}");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const firebaseAuth = admin.auth();
