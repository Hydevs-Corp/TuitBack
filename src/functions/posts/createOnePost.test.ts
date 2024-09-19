import { describe, it, expect } from "vitest";
import { createOnePost } from "./createOnePost.js";
import { ObjectId } from "mongodb";
import tuit from "../../config/db.config.js";

const postData: {
  title?: string;
  body?: string;
  userId?: string;
  comments: string[];
  likes: string[];
} = {
  title: "Test_createOnePost",
  body: "Lorem ipsum",
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

  let del = await tuit
    .collection("posts")
    .deleteOne({ _id: new ObjectId(result?.insertedId) });

  return { result, post, del };
};

describe("create a post", async () => {
  it("create a normal post", async () => {
    let { result, post, del } = await testCreateOnePost(postData);

    expect(result).toMatchObject({
      acknowledged: true,
    });
    expect(post).toMatchObject(postData);
  });

  it("create a post without title", async () => {
    let newData = { ...postData, title: undefined };
    let { result, post, del } = await testCreateOnePost(newData);

    expect(result).toBeNull();
    expect(post).toBeNull();
    expect(del).toMatchObject({ acknowledged: true, deletedCount: 0 });
  });

  it("create a post without body", async () => {
    let newData = { ...postData, body: undefined };
    let { result, post, del } = await testCreateOnePost(newData);

    expect(result).toBeNull();
    expect(post).toBeNull();
    expect(del).toMatchObject({ acknowledged: true, deletedCount: 0 });
  });

  it("create a post without userId", async () => {
    let newData = { ...postData, userId: undefined };
    let { result, post, del } = await testCreateOnePost(newData);

    expect(result).toBeNull();
    expect(post).toBeNull();
    expect(del).toMatchObject({ acknowledged: true, deletedCount: 0 });
  });
});
