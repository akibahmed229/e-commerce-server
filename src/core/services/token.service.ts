import jwt from "jsonwebtoken";

export interface TokenPayload {
    id: string;
    role: "user" | "admin";
}

export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "15m" });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): TokenPayload => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as TokenPayload;
};
