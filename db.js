const { MongoClient } = require("mongodb");
const config = require("./config");

let dbConnection;

module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect(config.mongo.uri)
      .then((client) => {
        dbConnection = client.db(config.mongo.dbName);
        return cb();
      })
      .catch((err) => {
        console.log(err);
        return cb(err);
      });
  },
  getDb: () => dbConnection,
  getNextSequenceValue: async (sequenceName) => {
    const db = dbConnection;
    const counter = await db.collection("counters").findOneAndUpdate(
      { _id: sequenceName },
      { $inc: { sequence_value: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    return counter.sequence_value;
  },
};
