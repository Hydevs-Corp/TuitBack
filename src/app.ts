import { ExpressAuth } from "@auth/express";
import express, { type Request, type Response } from "express";
import { readFileSync } from "node:fs";
import path from "node:path";
import * as pug from "pug";
import { authConfig } from "./config/auth.config.js";
import tuit from "./config/db.config.js";
import {
  authenticatedUser,
  currentSession,
} from "./middleware/auth.middleware.js";
import {
  errorHandler,
  errorNotFoundHandler,
} from "./middleware/error.middleware.js";

import { defaultConfig } from "./config/defaultConfiguration.js";
import { createOneComment } from "./functions/comments/createOneComment.js";
import { toggleLike } from "./functions/likes/toggleLike.js";
import { createOnePost } from "./functions/posts/createOnePost.js";
import { deleteOnePost } from "./functions/posts/deleteOnePost.js";
import { getAllPosts } from "./functions/posts/getAllPosts.js";
import { getLikedPosts } from "./functions/posts/getLikedPosts.js";
import { getOnePost } from "./functions/posts/getOnePost.js";
import { getUser } from "./functions/users/getUser.js";
import { whoAmI } from "./functions/users/whoAmI.js";

export const app = express();
defaultConfig();

// & BASE CONFIG
app.set("port", process.env.PORT || 80);
// @ts-expect-error (https://stackoverflow.com/questions/45342307/error-cannot-find-module-pug)
app.engine("pug", pug.__express);
app.set("views", path.join(import.meta.dirname, "..", "views"));
app.set("view engine", "pug");
app.set("trust proxy", true);
app.use(express.static(path.join(import.meta.dirname, "..", "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(currentSession);

// & ROUTES
app.all("*", async (req: Request, res: Response, next) => {
  if (
    req.url.startsWith("/api") ||
    req.url.endsWith(".png") ||
    req.url.endsWith(".jpg")
  )
    return next();
  try {
    const data = readFileSync(
      path.join(import.meta.dirname, "..", "public", "index.html"),
      {
        encoding: "utf-8",
      }
    );
    res.send(data);
    res.end();
  } catch (e) {
    res.status(500).send("Internal server error");
  }
});

// & POSTS

// ? GET ONE POST
app.get("/api/posts", async (req, res) => {
  let limit = 10;
  let skip = 0;
  try {
    let queryLimit = parseInt(req.query.limit as string);
    if (!isNaN(queryLimit)) limit = queryLimit;
  } catch (e) {}
  try {
    let querySkip = parseInt(req.query.skip as string) * limit;
    if (!isNaN(querySkip)) skip = querySkip;
  } catch (e) {}
  res.send(await getAllPosts(skip, limit));
});

// ? GET ONE POST
app.get("/api/posts/:id", async (req, res) => {
  const post = await getOnePost(req.params.id);
  if (!post) return res.status(404).send("Post not found");

  res.send(post);
});

// * CREATE POST
app.post("/api/posts", authenticatedUser, async (req, res) => {
  const createdPost = await createOnePost(req.body);
  if (!createdPost) return res.status(500).send("Error creating post");
  res.send(createdPost);
});

// ! DELETE POST
app.delete("/api/posts/:id", authenticatedUser, async (req, res) => {
  const result = await deleteOnePost(req.params.id);
  if (!result) return res.status(404).send("Post not found");
  res.send(result);
});

// & USERS

// ? WHO AM I
app.get("/api/whoami", authenticatedUser, whoAmI);

// ? GET USER
app.get("/api/user/:id", async (req, res) => {
  const user = await getUser(req.params.id);
  if (!user) return res.status(404).send("User not found");
  res.send(user);
});

// & LIKES

// ? GET LIKED POSTS
app.get("/api/liked", authenticatedUser, async (req, res) => {
  let limit = 10;
  let skip = 0;
  try {
    let queryLimit = parseInt(req.query.limit as string);
    if (!isNaN(queryLimit)) limit = queryLimit;
  } catch (e) {}
  try {
    let querySkip = parseInt(req.query.skip as string) * limit;
    if (!isNaN(querySkip)) skip = querySkip;
  } catch (e) {}
  res.send(await getLikedPosts(skip, limit, res.locals.session?.user?.email));
});

// * TOGGLE LIKE
app.post("/api/posts/:id/togglelike", authenticatedUser, async (req, res) => {
  const result = await toggleLike(req.params.id, res.locals.session.user.email);
  if (!result) return res.status(404).send("Post not found");
  res.send(result);
});

// & COMMENTS

// * CREATE COMMENT
app.post("/api/posts/:id/comment", async (req, res) => {
  const postUpdated = await createOneComment(req.params.id, req.body);
  if (!postUpdated) return res.status(404).send("Post not found");
  res.send(postUpdated);
});

// & AUTH

// ? GET AUTH INFO
app.get("/auth", authenticatedUser, (_req: Request, res: Response) => {
  res.send(res.locals.session);
});

// ? AUTHJS MIDDLEWARE
app.use("/api/auth/*", ExpressAuth(authConfig));

app.get("/protected", async (_req: Request, res: Response) => {
  res.render("protected", { session: res.locals.session });
});

// ? PROTECTED ROUTE
app.get(
  "/api/protected",
  authenticatedUser,
  async (_req: Request, res: Response) => {
    res.json(res.locals.session);
  }
);

// tuit.collection("users").find().toArray().then(console.log);
// tuit.collection("posts").deleteMany();

app.use(errorNotFoundHandler);
app.use(errorHandler);
