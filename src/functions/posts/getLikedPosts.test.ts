import { describe, it, expect } from "vitest";
import { getLikedPosts } from "./getLikedPosts.js";
import { ObjectId } from "mongodb";
import tuit from "../../config/db.config.js";

const _likePostData: {
  title?: string;
  body?: string;
  userId?: string;
  comments: string[];
  likes: string[];
} = {
  title: "Test_getLikedPosts",
  body: "Lorem Ipsum",
  userId: "UNIT_TESTING",
  comments: [],
  likes: ["UNIT_TESTING@test.test"],
};

const _testCreateLikedPost = async (data: {
  title?: string;
  body?: string;
  userId?: string;
  comments: string[];
  likes: string[];
}) => {
  let result = await tuit.collection("posts").insertOne(data);
  let { posts, total } = await getLikedPosts(0, 0, "UNIT_TESTING@test.test");
  let del = await tuit
    .collection("posts")
    .deleteOne({ _id: new ObjectId(result?.insertedId) });
  return { result, posts, total, del };
};

describe("get liked posts", () => {
  it("get liked posts", async () => {
    let { result, posts, total, del } = await _testCreateLikedPost(
      _likePostData
    );
    expect(result).toMatchObject({ acknowledged: true });
    expect(del).toMatchObject({ acknowledged: true });
    expect(total).toBeGreaterThan(0);
    expect(posts).toContainEqual({ ..._likePostData, _id: result.insertedId });
  });
});
