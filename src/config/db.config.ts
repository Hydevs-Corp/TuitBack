import { MongoClient } from "mongodb";

export const client = new MongoClient("mongodb://localhost:27017");

const tuit = client.db("tuit");

export default tuit;