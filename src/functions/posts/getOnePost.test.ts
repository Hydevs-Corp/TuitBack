import { describe, it, expect } from "vitest";
import { createOnePost } from "./createOnePost.js";
import { getOnePost } from "./getOnePost.js"; // Importer la fonction getOnePost
import { ObjectId } from "mongodb";
import tuit from "../../config/db.config.js";

const postData: {
  title?: string;
  body?: string;
  userId?: string;
  comments: string[];
  likes: string[];
} = {
  title: "Test_getOnePost",
  body: "Lorem ipsum",
  userId: "UNIT_TESTING",
  comments: [],
  likes: [],
};

const testGetOnePost = async (data: {
  title?: string;
  body?: string;
  userId?: string;
  comments: string[];
  likes: string[];
}) => {
  let result = await createOnePost(data);

  let post = await tuit
    .collection("posts")
    .findOne({ _id: new ObjectId(result?.insertedId) });

  let del = await tuit
    .collection("posts")
    .deleteOne({ _id: new ObjectId(result?.insertedId) });

  return { result, post, del };
};

describe("get one post", async () => {
  it("get a post", async () => {
    let { result, post, del } = await testGetOnePost(postData);

    expect(result).toMatchObject({
      acknowledged: true,
    });
    expect(post).toMatchObject(postData);
  });
});
