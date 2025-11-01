const express = require("express");
const router = express.Router();
const createCrudRoutes = require("../utils/crud");

const config = require("../config");
const collectionName = config.mongo.collections.editions;
const resourceName = "Edition";
const editionSchema = require("../models/editionSchema");

module.exports = createCrudRoutes(router, collectionName, resourceName, editionSchema, null);
