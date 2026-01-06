const config = {
  port: 3005,
  dataFiles: {
    authors: "data/author.json",
    books: "data/books.json",
    editions: "data/editions.json",
    publishers: "data/publisher.json",
  },
  mongo: {
    uri: "mongodb+srv://sameeta:hellokitty@cluster0.xpqqn9g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    dbName: "book_recommendation",
    collections: {
      authors: "authors",
      books: "books",
      editions: "editions",
      users: "users",
      publishers: "publishers",
    },
  },
  jwt: {
    secret: "supersecretjwtkey", // Replace with a strong, random secret in production
    expiresIn: "1h",
  },
};

export default config;
