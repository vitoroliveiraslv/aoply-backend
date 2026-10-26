import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        success: boolean;
        message: string;
        token: string;
        user: {
            id: string;
            fullName: string;
            email: string;
            role: string;
            organizationId: string;
            organizationName: string;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        token: string;
        user: {
            id: string;
            fullName: string;
            email: string;
            role: string;
            organizationId: string;
            organizationName: string;
        };
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
        email?: undefined;
        code?: undefined;
    } | {
        success: boolean;
        message: string;
        email: string;
        code: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    changePassword(dto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getMe(id: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: string;
        organizationId: string;
        organizationName: string;
        createdAt: Date;
    }>;
}
