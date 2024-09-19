import type { Request, Response } from "express";
import tuit from "../../config/db.config.js";
import { ObjectId } from "mongodb";

export const toggleLike = async (postId: string, userEmail: string) => {
  const post = await tuit.collection("posts").findOne({
    _id: new ObjectId(postId),
  });
  if (!post) {
    return;
  }
  if (!userEmail) return null;
  if (post.likes.includes(userEmail)) {
    await tuit.collection("posts").updateOne(
      { _id: new ObjectId(postId) },
      {
        // @ts-ignore
        $pull: {
          likes: userEmail,
        },
      }
    );
    return { liked: false };
  }
  await tuit.collection("posts").updateOne(
    { _id: new ObjectId(postId) },
    {
      $addToSet: { likes: userEmail },
    }
  );

  return { liked: true };
};
