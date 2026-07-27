export interface AuthenticateUser {
    id: string;
    role: "user" | "admin";
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthenticateUser
        }
    }
}
