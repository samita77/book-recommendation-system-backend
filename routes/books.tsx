import express, { Request, Response, NextFunction } from "express";
import { readData, readDataById, readDataByQuery, insertData, updateData, deleteData } from "../utils/dbOperations";
import { handleNotFound } from "../utils/errorHandler";
import config from "../config";
import bookSchema from "../models/bookSchema";

const router = express.Router();
const collectionName = config.mongo.collections.books;
const resourceName = "Book";

// Middleware for validation
const validateBook = (req: Request, res: Response, next: NextFunction) => {
    const { error } = bookSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ errors: error.details.map((d: any) => d.message) });
    }
    next();
};

// GET all books (Standard JSON List)
router.get("/", async (req: Request, res: Response) => {
    const items = await readData(collectionName);
    res.json(items);
});

// GET Unified Book Details (Book + Editions + Author)
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const book = await readDataById(collectionName, req.params.id);
        if (!book) return handleNotFound(res, resourceName);

        // 1. Fetch all editions linked to this book's numeric ID
        const editions = await readDataByQuery(config.mongo.collections.editions, { bookId: book.id });

        // 2. Fetch full author bio if authorid exists
        let authorBio = null;
        if (book.authorid) {
            authorBio = await readDataById(config.mongo.collections.authors, book.authorid);
        }

        // Combine everything into one "Unified" response
        const unifiedBook = {
            ...book,
            editions: editions || [],
            authorDetails: authorBio || { name: book.author || 'Unknown Author' }
        };

        res.json(unifiedBook);
    } catch (error) {
        console.error('Error fetching unified book details:', error);
        res.status(500).json({ message: 'Error fetching unified book details' });
    }
});

// POST new book
router.post("/", validateBook, async (req: Request, res: Response) => {
    const newItem = { ...req.body };
    const result = await insertData(collectionName, newItem);
    const lookupId = newItem.id || result.insertedId.toString();
    const insertedItem = await readDataById(collectionName, lookupId);
    res.status(201).json(insertedItem);
});

// Update book
router.put("/:id", validateBook, async (req: Request, res: Response) => {
    const result = await updateData(collectionName, req.params.id, req.body);
    if (result.matchedCount === 0) return handleNotFound(res, resourceName);
    const updatedItem = await readDataById(collectionName, req.params.id);
    res.json(updatedItem);
});

// Delete book
router.delete("/:id", async (req: Request, res: Response) => {
    const result = await deleteData(collectionName, req.params.id);
    if (result.deletedCount === 0) return handleNotFound(res, resourceName);
    res.json({ message: `${resourceName} deleted` });
});

export default router;
