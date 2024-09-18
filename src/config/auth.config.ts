import GitHub from "@auth/express/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { client } from "./db.config.js";

export const authConfig = {
  trustHost: true,
  providers: [GitHub],
  adapter: MongoDBAdapter(client, {
    databaseName: "tuit",
  }),
};
