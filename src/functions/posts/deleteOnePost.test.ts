import tuit from "../../config/db.config.js";
import { ObjectId } from "mongodb";
import { deleteOnePost } from "./deleteOnePost.js";
import { describe, it, expect, test } from "vitest";
import { createOnePost } from "./createOnePost.js";

const postData = {
  title: "Test_deleteOnePost",
  body: "Lorem ipsum",
  userId: "UNIT_TESTING",
  comments: [],
  likes: [],
};

describe("delete a post", () => {
  it("delete", async () => {
    let result = await createOnePost(postData);

    expect(result).toMatchObject({
      acknowledged: true,
    });

    let post = await tuit
      .collection("posts")
      .findOne({ _id: new ObjectId(result?.insertedId) });

    expect(post).toMatchObject(postData);

    if (!post?._id) return;

    const deletePost = await deleteOnePost(post._id.toString());

    expect(deletePost).toMatchObject({
      acknowledged: true,
      deletedCount: 1,
    });
  });
});
