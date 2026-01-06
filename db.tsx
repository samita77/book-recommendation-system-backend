import { MongoClient, Db } from "mongodb";
import config from "./config";

let dbConnection: Db;

export const connectToDb = (cb: (err?: any) => void) => {
  MongoClient.connect(config.mongo.uri)
    .then((client) => {
      dbConnection = client.db(config.mongo.dbName);
      return cb();
    })
    .catch((err) => {
      console.log(err);
      return cb(err);
    });
};

export const getDb = () => dbConnection;

export const getNextSequenceValue = async (sequenceName: string) => {
  const db = dbConnection;
  const counter = await db.collection("counters").findOneAndUpdate(
    { _id: sequenceName as any },
    { $inc: { sequence_value: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return counter?.sequence_value;
};
