import tuit from "../../config/db.config.js";

export const createOnePost = async (post: {
  title?: string;
  body?: string;
  userId?: string;
  comments: string[];
  likes: string[];
}) => {
  if (!post.title || !post.body || !post.userId) return null;
  try {
    const result = await tuit
      .collection("posts")
      .insertOne({ ...post, createdAt: new Date() });
    return result;
  } catch (e) {
    return null;
  }
};
