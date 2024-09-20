import { MongoClient } from "mongodb";

export const client = new MongoClient(
  process.env.MONGODB_URI || "mongodb://localhost:27017"
);

const tuit = client.db("tuit");

export default tuit;
