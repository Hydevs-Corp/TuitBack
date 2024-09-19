import tuit from "../../config/db.config.js";
import { ObjectId } from "mongodb";

export const deleteOnePost = async (postId: string) => {
  try {
    const result = await tuit.collection("posts").deleteOne({
      _id: new ObjectId(postId),
    });
    return result;
  } catch (e) {
    return null;
  }
};
