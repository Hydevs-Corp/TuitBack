import GitHub from "@auth/express/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import tuit, { client } from "./db.config.js";
import Credentials from "@auth/express/providers/credentials";
import { ExpressAuthConfig, User } from "@auth/express";

export const authConfig: ExpressAuthConfig = {
  trustHost: true,
  providers: [
    GitHub,
    Credentials({
      credentials: {
        username: { label: "Magic String" },
      },
      async authorize(credentials) {
        const { username } = credentials;
        const user = await tuit.collection("users").findOne({
          magicString: username,
        });
        console.log("signin in", user);
        if (!user) return null;
        console.log({ ...credentials, ...user });
        return ({ ...credentials, ...user } as User) ?? null;
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
