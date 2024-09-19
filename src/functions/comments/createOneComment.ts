import { ObjectId } from "mongodb";
import tuit from "../../config/db.config.js";

export const createOneComment = async (
  postId: string,
  comment: {
    body: string;
    author: string;
  }
) => {
  try {
    const post = await tuit.collection("posts").findOne({
      _id: new ObjectId(postId),
    });
    if (!post) {
      return;
    }
    const result = await tuit.collection("posts").updateOne(
      { _id: new ObjectId(postId) },
      {
        $addToSet: { comments: { ...comment, createdAt: new Date() } },
      }
    );

    const postUpdated = await tuit.collection("posts").findOne({
      _id: new ObjectId(postId),
    });

    return postUpdated;
  } catch (e) {
    return null;
  }
};
