import tuit from "../../config/db.config.js";
import { ObjectId } from "mongodb";
import { getAllPosts } from "./getAllPosts.js";
import { describe, it, expect, test } from "vitest";

// const postsTest = [
//   {
//     title: "Hello",
//     body: "World",
//     userId: "UNIT_TESTING",
//     comments: [],
//     likes: [],
//   },
//   {
//     title: "HAHAHAHAHHAH",
//     body: "QMZOLKDEHQSNL IUEFTBQIOEZE",
//     userId: "UNIT_TESTING2",
//     comments: [],
//     likes: [],
//   },
//   {
//     title: "HQSZEDQZDQZDQZDello",
//     body: "WorSEFSQFESEFSEFEld",
//     userId: "UNIT_TESTING3",
//     comments: [],
//     likes: [],
//   },
// ];

describe("Bonjour, voici des Posts mon boeuf", () => {
  it("Des posts", async () => {
    const { posts, total } = await getAllPosts(0, 3);
  });
});
