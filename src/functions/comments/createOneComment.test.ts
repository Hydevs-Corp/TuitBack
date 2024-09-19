import { ObjectId } from "mongodb";
import { describe, expect, it } from "vitest";
import tuit from "../../config/db.config.js";
import { createOnePost } from "../posts/createOnePost.js";
import { createOneComment } from "./createOneComment.js";

const postData: {
  title?: string;
  body?: string;
  userId?: string;
  comments: string[];
  likes: string[];
} = {
  title: "Hello qzdqsdqzdsqzd",
  body: "World",
  userId: "UNIT_TESTING",
  comments: [],
  likes: [],
};

const testCreateOnePost = async (data: {
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

  return { result, post };
};

const postComment: {
  body: string;
  author: string;
} = {
  body: "Ceci est un commentaire de test",
  author: "Monsieur test",
};

const testCreateComment = async (
  postId: string,
  comment: {
    body: string;
    author: string;
  }
) => {
  let result = await createOneComment(postId, comment);

  let post = await tuit
    .collection("posts")
    .findOne({ _id: new ObjectId(result?.insertedId) });

  let del = await tuit
    .collection("posts")
    .deleteOne({ _id: new ObjectId(result?._id) });

  return { result, post, del };
};

describe("create a post", async () => {
  it("create a normal post", async () => {
    let postResult = await testCreateOnePost(postData);

    let { result, post, del } = await testCreateComment(
      postResult.result?.insertedId.toString() || "",
      postComment
    );

    expect(result).toMatchObject({
      ...postData,
      comments: [postComment],
    });
    expect(del).toMatchObject({
      acknowledged: true,
      deletedCount: 1,
    });
    // expect(result?.comments).toContain({
    //   ...postComment,
    //   createdAt: expect.anything(),
    // });
  });
});
