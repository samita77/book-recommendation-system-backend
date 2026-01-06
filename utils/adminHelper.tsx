import { Request, Response } from "express";

/**
 * Renders an error page with a given message.
 * @param res Express response object.
 * @param message Error message to display.
 */
export const renderError = (res: Response, message: string) => {
    res.status(400).render("admin/error", { message });
};

/**
 * Parses comma-separated values from request body fields into arrays.
 * @param req Express request object.
 * @param fields Array of field names to parse.
 */
export const parseCommaSeparatedFields = (req: Request, fields: string[]) => {
    fields.forEach((field) => {
        if (req.body[field] && typeof req.body[field] === "string") {
            req.body[field] = req.body[field]
                .split(",")
                .map((item: string) => item.trim())
                .filter((item: string) => item);
        }
    });
};
