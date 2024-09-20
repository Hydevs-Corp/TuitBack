import { Request, Response } from "express";
import tuit from "../../config/db.config.js";

export const whoAmI = async (req: Request, res: Response) => {
  const result = await tuit.collection("users").findOne({
    email: res.locals.session?.user?.email,
  });
  res.send(result);
};
