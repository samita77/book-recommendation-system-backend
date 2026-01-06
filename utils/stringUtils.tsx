/**
 * Generates a URL-friendly slug from a string.
 * @param name The string to convert into a slug.
 * @returns A slug string.
 */
export function generateSlug(name: string): string {
    if (!name) return "";
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}
