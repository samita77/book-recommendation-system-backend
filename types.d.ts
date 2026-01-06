import 'express-session';

declare module 'express-session' {
    interface SessionData {
        isAdmin: boolean;
        message: string | null;
    }
}

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
