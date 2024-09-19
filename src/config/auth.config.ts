import GitHub from "@auth/express/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import tuit, { client } from "./db.config.js";
import Credentials from "@auth/express/providers/credentials";
import { ExpressAuthConfig, User } from "@auth/express";
import { validPassword } from "src/password.js";

export const authConfig: ExpressAuthConfig = {
  trustHost: true,
  providers: [
    GitHub,
    Credentials({
      credentials: {
        username: { label: "Nom d'utilisateur" },
        password: { label: "Mot de passe", type: "password" },
      },
      name: "Magic User (pour Cypress)",
      async authorize(credentials) {
        const { username, password } = credentials as Partial<
          Record<"username" | "password", string>
        >;

        if (!username || !password) return null;
        const user = await tuit.collection("users").findOne({
          name: username,
        });

        if (!user) {
          return null;
        }

        if (!validPassword(password, user.password.hash, user.password.salt))
          return null;

        return user as User;
      },
    }),
  ],
  adapter: MongoDBAdapter(client, {
    databaseName: "tuit",
  }),
  session: {
    strategy: "jwt",
  },
  theme: {
    colorScheme: "light", // "auto" | "dark" | "light"
    brandColor: "FFC8DD", // Hex color code
  },
};
