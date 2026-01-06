import { ObjectId } from "mongodb";
import { getDb, getNextSequenceValue } from "../db";

export const readData = async (collectionName: string) => {
  const db = getDb();
  const collection = db.collection(collectionName);
  const data = await collection.find().toArray();
  return data;
};

export const readDataByQuery = async (collectionName: string, query: any) => {
  const db = getDb();
  const collection = db.collection(collectionName);
  const data = await collection.find(query).toArray();
  return data;
};

export const readDataById = async (collectionName: string, id: string | number) => {
  const db = getDb();
  const collection = db.collection(collectionName);
  const idStr = id.toString();

  // Try to interpret the ID as a MongoDB ObjectId
  try {
    const item = await collection.findOne({ _id: new ObjectId(idStr) });
    if (item) return item;
  } catch (e) { }

  // Try to interpret the ID as a numeric 'id' field (try both number and string)
  const parsedId = parseInt(idStr);
  if (!isNaN(parsedId)) {
    let item = await collection.findOne({ id: parsedId });
    if (item) return item;

    item = await collection.findOne({ id: idStr });
    if (item) return item;
  }

  // Try to interpret the ID as a slug
  const item = await collection.findOne({ slug: idStr });
  if (item) return item;

  return null;
};

export const insertData = async (collectionName: string, data: any) => {
  const db = getDb();
  const collection = db.collection(collectionName);

  if (!data.id && (collectionName === "authors" || collectionName === "books" || collectionName === "editions" || collectionName === "publishers")) {
    const nextId = await getNextSequenceValue(collectionName);
    data.id = nextId;
  }

  const result = await collection.insertOne(data);
  return result;
};

export const updateData = async (collectionName: string, id: string | number, data: any) => {
  const db = getDb();
  const collection = db.collection(collectionName);
  const idStr = id.toString();

  // Try ObjectId
  try {
    const result = await collection.updateOne({ _id: new ObjectId(idStr) }, { $set: data });
    if (result.matchedCount > 0) return result;
  } catch (e) { }

  // Try numeric ID (both types)
  const parsedId = parseInt(idStr);
  if (!isNaN(parsedId)) {
    let result = await collection.updateOne({ id: parsedId }, { $set: data });
    if (result.matchedCount > 0) return result;

    result = await collection.updateOne({ id: idStr }, { $set: data });
    if (result.matchedCount > 0) return result;
  }

  // Try slug
  const result = await collection.updateOne({ slug: idStr }, { $set: data });
  return result;
};

export const deleteData = async (collectionName: string, id: string) => {
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
