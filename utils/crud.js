const {  readData,  readDataById,  insertData,  updateData,  deleteData,} = require("./dbOperations");
const { handleNotFound } = require("./errorHandler");
const Joi = require("joi");

const createCrudRoutes = (router, collectionName, resourceName, schema, authMiddleware) => {
  // Middleware for validation
  const validateSchema = (req, res, next) => {
    if (!schema) return next();

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ errors: error.details.map((d) => d.message) });
    }

    next();
  };

  // Get all items
  router.get("/", async (req, res) => {
    const items = await readData(collectionName);
    res.json(items);
  });

  // Get one item by ID
  router.get("/:id", async (req, res) => {
    const item = await readDataById(collectionName, req.params.id);
    if (!item) return handleNotFound(res, resourceName);
    res.json(item);
  });

  // Add new item
  router.post("/", authMiddleware ? [authMiddleware, validateSchema] : validateSchema, async (req, res) => {
    const newItem = { ...req.body };
    const result = await insertData(collectionName, newItem);
    const insertedItem = await readDataById(collectionName, result.insertedId);
    res.status(201).json(insertedItem);
  });

  // Update item
  router.put("/:id", authMiddleware ? [authMiddleware, validateSchema] : validateSchema, async (req, res) => {
    const result = await updateData(collectionName, req.params.id, req.body);
    if (result.matchedCount === 0) return handleNotFound(res, resourceName);
    const updatedItem = await readDataById(collectionName, req.params.id);
    res.json(updatedItem);
  });

  // Delete item
  router.delete("/:id", authMiddleware ? authMiddleware : (req, res, next) => next(), async (req, res) => {
    const result = await deleteData(collectionName, req.params.id);
    if (result.deletedCount === 0)
      return handleNotFound(res, resourceName);
    res.json({ message: `${resourceName} deleted` });
  });

  return router;
};

module.exports = createCrudRoutes;
