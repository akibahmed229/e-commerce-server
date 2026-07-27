export interface UserEntity {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: "user" | "admin"
    createdAt: Date;
    updatedAt: Date;
}
