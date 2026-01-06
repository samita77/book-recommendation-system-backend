import { connectToDb, getDb } from './db';
import fs from 'fs';
import path from 'path';

// Embedded Books JSON Mapping (ID -> Title) based on the file content I read
const jsonBooks = [
    { "id": 201, "title": "Lady Dragon" },
    { "id": 202, "title": "The Hunger Games" },
    { "id": 203, "title": "Catching Fire" },
    { "id": 204, "title": "Mockingjay" },
    { "id": 205, "title": "Divergent" },
    { "id": 206, "title": "Insurgent" },
    { "id": 207, "title": "The Lightning Thief" },
    { "id": 208, "title": "The Maze Runner" },
    { "id": 209, "title": "Throne of Glass" }
];

const run = async () => {
    try {
        await connectToDb(async () => {
            const db = getDb();
            const editions = await db.collection('editions').find().toArray();
            const books = await db.collection('books').find().toArray();

            console.log(`Found ${editions.length} editions and ${books.length} books.`);

            for (const edition of editions) {
                // Determine the original JSON ID from the broken BookID
                // Heuristic: Broken ID 30501 -> JSON ID 201. Offset = 30300.
                const brokenId = parseInt(edition.bookId);

                // Skip if it looks like a valid new ID (small number)
                if (brokenId < 1000) {
                    console.log(`Edition ${edition.id} has small ID ${brokenId}, skipping checks.`);

                    // But wait, verify if it points to a real book
                    const realBook = books.find(b => b.id === brokenId);
                    if (!realBook) {
                        console.log(`  - WARNING: But book ${brokenId} does not exist in DB!`);
                    } else {
                        console.log(`  - Valid link to "${realBook.title}"`);
                    }
                    continue;
                }

                const derivedJsonId = brokenId - 30300;
                const jsonBook = jsonBooks.find(b => b.id === derivedJsonId);

                if (jsonBook) {
                    console.log(`Edition ${edition.id} (BookID ${brokenId}) maps to JSON Book "${jsonBook.title}" (ID ${derivedJsonId})`);

                    // Find this book in the CURRENT database (by title)
                    // Use case-insensitive matching roughly
                    const liveBook = books.find(b => b.title.trim().toLowerCase() === jsonBook.title.trim().toLowerCase());

                    if (liveBook) {
                        console.log(`  -> Found live book ID: ${liveBook.id}. Updating...`);
                        await db.collection('editions').updateOne(
                            { _id: edition._id },
                            { $set: { bookId: liveBook.id } }
                        );
                    } else {
                        console.log(`  -> ERROR: Could not find book "${jsonBook.title}" in live database.`);
                    }

                } else {
                    console.log(`Edition ${edition.id} (BookID ${brokenId}) could not be mapped to a JSON ID.`);
                }
            }

            console.log('Done.');
            process.exit(0);
        });
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

run();
