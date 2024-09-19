import tuit from "../../config/db.config.js";
import { ObjectId } from "mongodb";
import { toggleLike } from "./toggleLike.js";
import { describe, it, expect, test } from "vitest";

const postData: {
  title?: string;
  body?: string;
  userId?: string;
  comments: string[];
  likes: string[];
} = {
  title: "Test_toggleLike",
  body: "Lorem ipsum",
  userId: "UNIT_TESTING",
  comments: [],
  likes: [],
};

const _testToggleLike = async () => {
  let result = await tuit.collection("posts").insertOne(postData);
  let id = result.insertedId.toString();
  let liked = await toggleLike(id, "UNIT_TESTING@test.test");
  let disliked = await toggleLike(id, "UNIT_TESTING@test.test");
  let del = await tuit
    .collection("posts")
    .deleteOne({ _id: new ObjectId(result?.insertedId) });

  return { result, liked, disliked, del };
};

describe("Test toggleLike", () => {
  it("", async () => {
    let { result, liked, disliked, del } = await _testToggleLike();

    expect(result).toMatchObject({ acknowledged: true });
    expect(del).toMatchObject({ acknowledged: true });
    expect(liked?.liked).toBe(true);
    expect(disliked?.liked).toBe(false);
  });
});
