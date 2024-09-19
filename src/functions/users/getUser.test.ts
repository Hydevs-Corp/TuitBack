import { describe, it, expect } from "vitest";
import { ObjectId } from "mongodb";
import tuit from "../../config/db.config.js";
import { configDotenv } from "dotenv";

describe("get user", async () => {
  it("get the magic user", async () => {
    configDotenv();

    const magicUser = await tuit.collection("users").findOne({
      name: process.env.MAGIC_USER_LOGIN,
    });

    expect(magicUser).toMatchObject({
      name: process.env.MAGIC_USER_LOGIN,
    });
  });
});
