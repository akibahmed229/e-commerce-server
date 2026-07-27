import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { CreateUserInput, IUserRepository, UpdateUserInput } from "../domain/user.repository";
import { UserEntity } from "../domain/user.entity";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { NewUser, usersTable } from "./persistence/user.schema";

export class DrizzleUserRepository implements IUserRepository {
    constructor(private readonly db: NodePgDatabase) { }

    async createUser(user: CreateUserInput): Promise<UserEntity> {
        try {
            const hashedPassword = await bcrypt.hash(user.passwordHash, 10);
            const { passwordHash, ...userData } = user;
            const newUserObj: NewUser = { ...userData, passwordHash: hashedPassword };
            const [newUser] = await this.db.insert(usersTable).values(newUserObj).returning();
            return newUser;
        } catch (error) {
            console.error(error);
            throw new Error(`Internal Server Error: ${error}`);
        }
    }

    async getAllUser(): Promise<UserEntity[]> {
        return this.db.select().from(usersTable);
    }

    async updateUser(id: string, user: UpdateUserInput): Promise<boolean> {
        const { passwordHash, ...userData } = user;
        const updatedUserObj: Partial<NewUser> = { ...userData };
        if (passwordHash) {
            updatedUserObj.passwordHash = await bcrypt.hash(passwordHash, 10);
        }
        const [updatedUser] = await this.db.update(usersTable).set(updatedUserObj).where(eq(usersTable.id, id)).returning();
        return !!updatedUser;
    }

    async deleteUser(id: string): Promise<boolean> {
        const [user] = await this.db.delete(usersTable).where(eq(usersTable.id, id)).returning();
        return !!user;
    }

    async findUserByEmail(email: string): Promise<UserEntity | null> {
        const [user] = await this.db.select().from(usersTable).where(eq(usersTable.email, email));
        return user ?? null;
    }
}
