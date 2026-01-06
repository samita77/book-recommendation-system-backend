import { Response } from "express";

export const handleNotFound = (res: Response, resourceName: string) => {
  res.status(404).json({ error: `${resourceName} not found` });
};
