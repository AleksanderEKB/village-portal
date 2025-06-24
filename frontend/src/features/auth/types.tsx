import { UserWithAvatar } from "../../types/globalTypes";

export interface LoginResponse {
    access: string;
    refresh: string;
    user: UserWithAvatar;
}

export interface RegisterFormData {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    avatar: File | null;
}

export interface RegisterErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
    avatar?: string;
    [key: string]: string | undefined;
}
