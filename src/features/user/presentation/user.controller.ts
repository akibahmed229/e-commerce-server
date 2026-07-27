import { type Request, type Response } from "express";
import { CreateUserUseCase } from "../application/create-user.usecase";
import { DeleteUserUseCase } from "../application/delete-user.usecase";
import { GetAllUserUseCase } from "../application/get-all-user.usecase";
import { UpdateUserUseCase } from "../application/update-user.usecase";
import { LoginUserUseCase } from "../application/login-user.usecase";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "@core/services/token.service";

export class UserController {
    constructor(
        private readonly createUser: CreateUserUseCase,
        private readonly getUsers: GetAllUserUseCase,
        private readonly updateUser: UpdateUserUseCase,
        private readonly deleteUser: DeleteUserUseCase,
        private readonly loginUser: LoginUserUseCase
    ) { }

    handleCreateUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, email, password } = req.body;
            const result = await this.createUser.execute({ name, email, passwordHash: password });
            if (!result.ok) {
                res.status(400).json({ error: result.error.message });
                return;
            }
            const { passwordHash, ...safeUser } = result.value;
            res.status(201).json(safeUser);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    handleGetAllUsers = async (_req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.getUsers.execute();
            if (!result.ok) {
                res.status(400).json({ error: result.error.message });
                return;
            }
            const safeUsers = result.value.map(({ passwordHash, ...rest }) => rest);
            res.status(200).json(safeUsers);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    handleUpdateUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const result = await this.updateUser.execute({ id: id.toString(), data: req.body });
            if (!result.ok) {
                res.status(400).json({ error: result.error.message });
                return;
            }
            res.status(200).json({ updated: result.value });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    handleDeleteUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const result = await this.deleteUser.execute({ id: id.toString() });
            if (!result.ok) {
                res.status(400).json({ error: result.error.message });
                return;
            }
            res.status(200).json({ deleted: result.value });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    handleLoginUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;
            const result = await this.loginUser.execute({ email, password });
            if (!result.ok) {
                res.status(401).json({ error: result.error.message });
                return;
            }

            const user = result.value;
            const payload = { id: user.id, role: user.role };
            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);

            res.cookie("jwt", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // false locally over http, true in prod https
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            const { passwordHash, ...safeUser } = user;
            res.status(200).json({ accessToken, user: safeUser });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    handleRefreshToken = async (req: Request, res: Response): Promise<void> => {
        const cookies = req.cookies;
        if (!cookies?.jwt) {
            res.status(401).json({ error: "No refresh token provided" });
            return;
        }

        try {
            const payload = verifyRefreshToken(cookies.jwt);
            const accessToken = generateAccessToken({ id: payload.id, role: payload.role });
            res.status(200).json({ accessToken });
        } catch {
            res.status(403).json({ error: "Invalid or expired refresh token" });
        }
    };

    handleLogout = async (req: Request, res: Response): Promise<void> => {
        const cookies = req.cookies;
        if (!cookies?.jwt) {
            res.sendStatus(204);
            return;
        }
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.sendStatus(204);
    };
}
