const express = require("express");
const router = express.Router();
const createCrudRoutes = require("../utils/crud");

const config = require("../config");
const collectionName = config.mongo.collections.books;
const resourceName = "Book";
const bookSchema = require("../models/bookSchema");

module.exports = createCrudRoutes(router, collectionName, resourceName, bookSchema, null);
