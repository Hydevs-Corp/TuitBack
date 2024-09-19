import tuit from "../../config/db.config.js";

export const getAllPosts = async (skip: number = 0, limit: number = 10) => {
  const posts = await tuit
    .collection("posts")
    .find()
    .limit(limit)
    .skip(skip)
    .sort("createdAt", "desc")
    .toArray();
  const total = await tuit.collection("posts").countDocuments();
  return { posts, total };
};
