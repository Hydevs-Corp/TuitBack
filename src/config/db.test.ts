import { describe, expect, it } from "vitest";
import tuit, { client } from "./db.config.js";

describe("database", () => {
  it("is database up", async () => {
    const a = await tuit.listCollections().toArray();

    expect(a).toBeTypeOf("object");
  });
});
