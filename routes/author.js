const express = require("express");
const router = express.Router();
const createCrudRoutes = require("../utils/crud");

const config = require("../config");
const collectionName = config.mongo.collections.authors;
const resourceName = "Author";
const authorSchema = require("../models/authorSchema");

module.exports = createCrudRoutes(router, collectionName, resourceName, authorSchema, null);
