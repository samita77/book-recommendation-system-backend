import { readData, readDataById, insertData, updateData, deleteData } from "./dbOperations";
import { handleNotFound } from "./errorHandler";
import Joi from "joi";
import { Router, Request, Response, NextFunction } from "express";

const createCrudRoutes = (router: Router, collectionName: string, resourceName: string, schema: any, authMiddleware?: any) => {
  // Middleware for validation
  const validateSchema = (req: Request, res: Response, next: NextFunction) => {
    if (!schema) return next();

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ errors: error.details.map((d: any) => d.message) });
    }

    next();
  };

  // Get all items
  router.get("/", async (req: Request, res: Response) => {
    const items = await readData(collectionName);
    res.json(items);
  });

  // Get one item by ID
  router.get("/:id", async (req: Request, res: Response) => {
    const item = await readDataById(collectionName, req.params.id);
    if (!item) return handleNotFound(res, resourceName);
    res.json(item);
  });

  // Add new item
  router.post("/", authMiddleware ? [authMiddleware, validateSchema] : validateSchema, async (req: Request, res: Response) => {
    const newItem = { ...req.body };
    const result = await insertData(collectionName, newItem);
    // Use the numeric 'id' if it was generated, otherwise use the mongo internal insertedId
    const lookupId = newItem.id || result.insertedId.toString();
    const insertedItem = await readDataById(collectionName, lookupId);
    res.status(201).json(insertedItem);
  });

  // Update item
  router.put("/:id", authMiddleware ? [authMiddleware, validateSchema] : validateSchema, async (req: Request, res: Response) => {
    const result = await updateData(collectionName, req.params.id, req.body);
    if (result.matchedCount === 0) return handleNotFound(res, resourceName);
    const updatedItem = await readDataById(collectionName, req.params.id);
    res.json(updatedItem);
  });

  // Delete item
  router.delete("/:id", authMiddleware ? authMiddleware : (req: Request, res: Response, next: NextFunction) => next(), async (req: Request, res: Response) => {
    const result = await deleteData(collectionName, req.params.id);
    if (result.deletedCount === 0)
      return handleNotFound(res, resourceName);
    res.json({ message: `${resourceName} deleted` });
  });

  return router;
};

export default createCrudRoutes;
