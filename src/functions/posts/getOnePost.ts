import { ObjectId } from "mongodb";
import tuit from "../../config/db.config.js";

export const getOnePost = async (id: string) => {
  try {
    const post = await tuit.collection("posts").findOne({
      _id: new ObjectId(id),
    });
    if (!post) {
      return null;
    }
    return post;
  } catch (e) {
    return null;
  }
};
