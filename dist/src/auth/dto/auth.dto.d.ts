export declare class LoginDto {
    identifier: string;
    password: string;
}
export declare class RegisterDto {
    fullName: string;
    email: string;
    password: string;
    organizationName?: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    email: string;
    token: string;
    newPassword: string;
}
export declare class ChangePasswordDto {
    userId: string;
    currentPassword: string;
    newPassword: string;
}
