import { generatePassword } from "src/password.js";
import tuit from "./db.config.js";

const configMagicUser = async () => {
  tuit.collection("users").deleteMany({
    name: {
      $ne: process.env.MAGIC_USER_LOGIN,
    },
    isMagic: true,
  });

  if (!process.env.MAGIC_USER_LOGIN || !process.env.MAGIC_USER_PASSWORD)
    return console.log(
      "🔴 Please provide MAGIC_USER_LOGIN and MAGIC_USER_PASSWORD in .env file"
    );

  const magicUser = await tuit.collection("users").findOne({
    name: process.env.MAGIC_USER_LOGIN,
  });

  if (magicUser) return console.log("🔵 Magic user already exists");

  await tuit.collection("users").insertOne({
    name: process.env.MAGIC_USER_LOGIN,
    isMagic: true,
    email: "magic.email@cypress.com",
    image: "/placeholder.png",
    emailVerified: null,
    password: generatePassword(process.env.MAGIC_USER_PASSWORD),
  });
  console.log("🔵 Magic user created");
};

export const defaultConfig = () => {
  configMagicUser();
};
