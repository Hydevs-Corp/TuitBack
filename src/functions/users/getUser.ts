import { ObjectId } from "mongodb";
import tuit from "../../config/db.config.js";

export const getUser = async (userId: string) => {
  try {
    const user = await tuit.collection("users").findOne({
      _id: new ObjectId(userId),
    });
    return user;
  } catch (e) {
    return null;
  }
};
