import express from "express";
import createCrudRoutes from "../utils/crud";
import config from "../config";
import authorSchema from "../models/authorSchema";

const router = express.Router();
const collectionName = config.mongo.collections.authors;
const resourceName = "Author";

export default createCrudRoutes(router, collectionName, resourceName, authorSchema);
