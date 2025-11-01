const { ObjectId } = require("mongodb");
const { getDb, getNextSequenceValue } = require("../db");

const readData = async (collectionName) => {
  const db = getDb();
  const collection = db.collection(collectionName);
  const data = await collection.find().toArray();
  return data;
};

const readDataById = async (collectionName, id) => {
  const db = getDb();
  const collection = db.collection(collectionName);

  // Try to interpret the ID as a MongoDB ObjectId
  try {
    const item = await collection.findOne({ _id: new ObjectId(id) });
    if (item) return item; // Found by ObjectId
  } catch (e) {
    // Not a valid ObjectId string, proceed to check for numeric ID or slug
  }

  // Try to interpret the ID as a numeric 'id' field
  const parsedId = parseInt(id);
  if (!isNaN(parsedId)) {
    const item = await collection.findOne({ id: parsedId });
    if (item) return item; // Found by numeric ID
  }

  // Try to interpret the ID as a slug
  const item = await collection.findOne({ slug: id });
  if (item) return item; // Found by slug

  return null; // Not found by any method
};

const insertData = async (collectionName, data) => {
  const db = getDb();
  const collection = db.collection(collectionName);

  if (!data.id && (collectionName === "authors" || collectionName === "books" || collectionName === "editions" || collectionName === "publishers")) {
    const nextId = await getNextSequenceValue(collectionName);
    data.id = nextId;
  }

  const result = await collection.insertOne(data);
  return result;
};

const updateData = async (collectionName, id, data) => {
  const db = getDb();
  const collection = db.collection(collectionName);
  let query = {};

  // Try to interpret the ID as a MongoDB ObjectId
  try {
    query = { _id: new ObjectId(id) };
    const result = await collection.updateOne(query, { $set: data });
    if (result.matchedCount > 0) return result; // Updated by ObjectId
  } catch (e) {
    // Not a valid ObjectId string, proceed to check for numeric ID or slug
  }

  // If not updated by ObjectId, or if it wasn't an ObjectId string,
  // try to interpret the ID as a numeric 'id' field
  const parsedId = parseInt(id);
  if (!isNaN(parsedId)) {
    query = { id: parsedId };
    const result = await collection.updateOne(query, { $set: data });
    if (result.matchedCount > 0) return result; // Updated by numeric ID
  }

  // If not updated by numeric ID, try to interpret the ID as a slug
  query = { slug: id };
  const result = await collection.updateOne(query, { $set: data });
  if (result.matchedCount > 0) return result; // Updated by slug

  return { matchedCount: 0 }; // Not found by any method
};

const deleteData = async (collectionName, id) => {
  const db = getDb();
  const collection = db.collection(collectionName);
  let query = {};

  // Try to interpret the ID as a MongoDB ObjectId
  try {
    query = { _id: new ObjectId(id) };
    const result = await collection.deleteOne(query);
    if (result.deletedCount > 0) return result; // Deleted by ObjectId
  } catch (e) {
    // Not a valid ObjectId string, proceed to check for numeric ID or slug
  }

  // If not deleted by ObjectId, or if it wasn't an ObjectId string,
  // try to interpret the ID as a numeric 'id' field
  const parsedId = parseInt(id);
  if (!isNaN(parsedId)) {
    query = { id: parsedId };
    const result = await collection.deleteOne(query);
    if (result.deletedCount > 0) return result; // Deleted by numeric ID
  }

  // If not deleted by numeric ID, try to interpret the ID as a slug
  query = { slug: id };
  const result = await collection.deleteOne(query);
  if (result.deletedCount > 0) return result; // Deleted by slug

  return { deletedCount: 0 }; // Not found by any method
};

module.exports = {
  readData,
  readDataById,
  insertData,
  updateData,
  deleteData,
};
