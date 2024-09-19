import tuit from "../../config/db.config.js";

export const getLikedPosts = async (
  skip: number = 0,
  limit: number = 10,
  userEmail: string
) => {
  const posts = await tuit
    .collection("posts")
    .find({ likes: { $all: [userEmail] } })
    .limit(limit)
    .skip(skip)
    .sort("createdAt", "desc")
    .toArray();
  const total = await tuit
    .collection("posts")
    .countDocuments({ likes: { $all: [userEmail] } });
  return { posts, total };
};
