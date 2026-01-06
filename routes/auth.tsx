import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config";
import { insertData, readData } from "../utils/dbOperations";

const router = express.Router();
const collectionName = config.mongo.collections.users || "users"; // Assuming a 'users' collection

// Register API
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const users: any[] = await readData(collectionName);
    if (users.find((user: any) => user.username === username)) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate new user ID
    const maxIdUser = users.reduce((max: number, user: any) => (user.id > max ? user.id : max), -1);
    const newId = maxIdUser + 1;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to DB
    const newUser = { id: newId, username, password: hashedPassword };
    const result = await insertData(collectionName, newUser);
    res.status(201).json({ message: "User registered successfully", userId: result.insertedId, id: newId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login API
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const users: any[] = await readData(collectionName);
    const user = users.find((u: any) => u.username === username);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const payload = { userId: user.id, username: user.username };
    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
