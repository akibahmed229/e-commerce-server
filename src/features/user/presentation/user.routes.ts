import { Router } from "express";
import { DrizzleUserRepository } from "../infrastructure/drizzle-user.repository";
import { db } from "@core/database/drizzle-client";
import { CreateUserUseCase } from "../application/create-user.usecase";
import { GetAllUserUseCase } from "../application/get-all-user.usecase";
import { UpdateUserUseCase } from "../application/update-user.usecase";
import { DeleteUserUseCase } from "../application/delete-user.usecase";
import { UserController } from "./user.controller";
import { validateRequest } from "@core/middlewares/validate-request";
import { createUserSchema, loginUserSchema, updateUserSchema, userIdParamSchema } from "./user.validation";
import { LoginUserUseCase } from "../application/login-user.usecase";
import { authenticate } from "@core/middlewares/authenticate";
import { apiRateLimiter } from "@core/middlewares/apiRateLimiter";

const router = Router();

const userRepository = new DrizzleUserRepository(db);
const createUserUseCase = new CreateUserUseCase(userRepository);
const getUserUseCase = new GetAllUserUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository);

const userController = new UserController(createUserUseCase, getUserUseCase, updateUserUseCase, deleteUserUseCase, loginUserUseCase);

router.use(apiRateLimiter);

router.post("/",
    validateRequest(createUserSchema, "body"),
    userController.handleCreateUser
);
router.get("/",
    authenticate,
    userController.handleGetAllUsers
);
router.patch(
    "/:id",
    authenticate,
    validateRequest(userIdParamSchema, "params"),
    validateRequest(updateUserSchema, "body"),
    userController.handleUpdateUser
);
router.delete("/:id",
    authenticate,
    validateRequest(userIdParamSchema, "params"),
    userController.handleDeleteUser
);
router.post("/jwt/login",
    validateRequest(loginUserSchema, "body"),
    userController.handleLoginUser
);
router.post("/jwt/refresh",
    userController.handleRefreshToken
);
router.post("/jwt/logout",
    userController.handleLogout
);


export { router as userRoutes };
