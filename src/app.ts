import { ExpressAuth } from "@auth/express";
import express, { type Request, type Response } from "express";
import { ObjectId } from "mongodb";
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

export const app = express();

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

app.use("/api/auth/*", ExpressAuth(authConfig));

// Routes
app.get("/protected", async (_req: Request, res: Response) => {
  res.render("protected", { session: res.locals.session });
});

app.get(
  "/api/protected",
  authenticatedUser,
  async (_req: Request, res: Response) => {
    res.json(res.locals.session);
  }
);

app.all("*", async (_req: Request, res: Response, next) => {
  if (_req.url.startsWith("/api") || _req.url.endsWith(".png")) return next();
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
    console.log(e);
    res.status(500).send("Internal server error");
  }
});

//& POSTS

app.get("/api/posts", async (_req: Request, res: Response) => {
  let skip = 0;
  let limit = 10;

  try {
    let queryLimit = parseInt(_req.query.limit as string);
    if (!isNaN(queryLimit)) limit = queryLimit;
  } catch (e) {}
  try {
    let querySkip = parseInt(_req.query.skip as string) * limit;
    if (!isNaN(querySkip)) skip = querySkip;
  } catch (e) {}

  const posts = await tuit
    .collection("posts")
    .find()
    .limit(limit)
    .skip(skip)
    .sort("createdAt", "desc")
    .toArray();
  const total = await tuit.collection("posts").countDocuments();
  res.send({ posts, total });
});

app.get("/api/posts/:id", async (req: Request, res: Response) => {
  try {
    const post = await tuit.collection("posts").findOne({
      _id: new ObjectId(req.params.id),
    });
    if (!post) {
      res.status(404).send("Post not found");
      return;
    }
    res.send(post);
  } catch (e) {
    res.status(404).send("Post not found");
  }
});

app.post(
  "/api/posts",
  authenticatedUser,
  async (req: Request, res: Response) => {
    const post = req.body;
    const result = await tuit
      .collection("posts")
      .insertOne({ ...post, createdAt: new Date() });
    res.send(result);
  }
);

app.get(
  "/api/liked",
  authenticatedUser,
  async (req: Request, res: Response) => {
    let skip = 0;
    let limit = 10;
    try {
      let queryLimit = parseInt(req.query.limit as string);
      if (!isNaN(queryLimit)) limit = queryLimit;
    } catch (e) {}
    try {
      let querySkip = parseInt(req.query.skip as string) * limit;
      if (!isNaN(querySkip)) skip = querySkip;
    } catch (e) {}
    try {
      const posts = await tuit
        .collection("posts")
        .find({ likes: { $all: [res.locals.session?.user?.email] } })
        .limit(limit)
        .skip(skip)
        .sort("createdAt", "desc")
        .toArray();

      const total = await tuit
        .collection("posts")
        .countDocuments({ likes: { $all: [res.locals.session?.user?.email] } });
      res.send({ posts, total });
    } catch (e) {
      console.log(e);
      res.status(404).send("Posts not found");
    }
  }
);

app.delete(
  "/api/posts/:id",
  authenticatedUser,
  async (req: Request, res: Response) => {
    try {
      const result = await tuit.collection("posts").deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    } catch (e) {
      res.status(404).send("Post not found");
    }
  }
);

app.get("/auth", authenticatedUser, async (_req: Request, res: Response) => {
  res.send(res.locals.session);
});

app.get(
  "/api/whoami",
  authenticatedUser,
  async (req: Request, res: Response) => {
    const result = await tuit.collection("users").findOne({
      email: res.locals.session?.user?.email,
    });
    res.send(result);
  }
);

app.get("/api/user/:id", async (req: Request, res: Response) => {
  try {
    const result = await tuit.collection("users").findOne({
      _id: new ObjectId(req.params.id),
    });
    res.send(result);
  } catch (e) {
    res.status(404).send("User not found");
  }
});

app.post(
  "/api/posts/:id/",
  authenticatedUser,
  async (req: Request, res: Response) => {
    const post = req.body;
    try {
      const result = await tuit.collection("posts").updateOne(
        { _id: new ObjectId(req.params.id) },
        {
          $push: {
            comments: {
              ...post,
              createdAt: new Date(),
            },
          },
        }
      );
      res.send(result);
    } catch (e) {}
  }
);

app.delete(
  "/api/posts/:id",
  authenticatedUser,
  async (req: Request, res: Response) => {
    try {
      const result = await tuit.collection("posts").deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    } catch (e) {
      res.status(404).send("Post not found");
    }
  }
);

//& LIKES

app.post(
  "/api/posts/:id/togglelike",
  authenticatedUser,
  async (req: Request, res: Response) => {
    const post = await tuit.collection("posts").findOne({
      _id: new ObjectId(req.params.id),
    });
    if (!post) {
      return;
    }
    let email = res.locals.session?.user?.email;
    if (!email) return res.status(404).send("Post not found");
    if (post.likes.includes(res.locals.session?.user?.email)) {
      const result = await tuit.collection("posts").updateOne(
        { _id: new ObjectId(req.params.id) },
        {
          // @ts-ignore
          $pull: {
            likes: email,
          },
        }
      );
      res.send({ liked: false });
      return;
    }
    const result = await tuit.collection("posts").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $addToSet: { likes: res.locals.session?.user?.email },
      }
    );

    res.send({ liked: true });
  }
);
app.post("/api/posts/:id/comment", async (req: Request, res: Response) => {
  const post = await tuit.collection("posts").findOne({
    _id: new ObjectId(req.params.id),
  });
  if (!post) {
    return;
  }
  const result = await tuit.collection("posts").updateOne(
    { _id: new ObjectId(req.params.id) },
    {
      $addToSet: { comments: { ...req.body, createdAt: new Date() } },
    }
  );

  const postUpdated = await tuit.collection("posts").findOne({
    _id: new ObjectId(req.params.id),
  });

  res.send(postUpdated);
});

false &&
  tuit.collection("posts").insertOne({
    title: "Holà, worlda!",
    body: "Thisa isa a testa posta.",
    userId: 1,
    comments: [],
  });

tuit.collection("posts").find().toArray().then(console.log);
// tuit.collection("users").find().toArray().then(console.log);
// tuit.collection("posts").deleteMany({});

app.use(errorNotFoundHandler);
app.use(errorHandler);
